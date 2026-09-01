import {
  TRANSLATION_BATCH_SIZE,
  TRANSLATION_PROVIDER,
  validateTranslationRequest,
  type TranslationItem,
  type TranslationRequest
} from '../../src/core/translation';

interface AiBinding {
  run(model: string, input: { text: string; source_lang: string; target_lang: string }): Promise<unknown>;
}

interface FunctionContext {
  request: Request;
  env: { AI?: AiBinding };
}

type RateBucket = { startedAt: number; count: number };

const MODEL = '@cf/meta/m2m100-1.2b';
const RATE_WINDOW_MS = 10 * 60 * 1_000;
const RATE_LIMIT = 12;
const MAX_RATE_BUCKETS = 1_024;
const rateBuckets = new Map<string, RateBucket>();

const json = (body: unknown, status = 200, headers: Record<string, string> = {}): Response => Response.json(body, {
  status,
  headers: { 'cache-control': 'no-store', ...headers }
});

const primaryLanguage = (code: string): string => code.split('-')[0]!.toLowerCase();

const allowRequest = (request: Request): boolean => {
  const client = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const now = Date.now();
  if (rateBuckets.size >= MAX_RATE_BUCKETS) {
    for (const [key, bucket] of rateBuckets) if (now - bucket.startedAt >= RATE_WINDOW_MS) rateBuckets.delete(key);
    if (rateBuckets.size >= MAX_RATE_BUCKETS) rateBuckets.delete(rateBuckets.keys().next().value as string);
  }
  const current = rateBuckets.get(client);
  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(client, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= RATE_LIMIT) return false;
  current.count += 1;
  return true;
};

const translateItem = async (ai: AiBinding, item: TranslationItem, sourceLanguage: string, targetLanguage: string): Promise<TranslationItem> => {
  const result = await ai.run(MODEL, {
    text: item.text,
    source_lang: primaryLanguage(sourceLanguage),
    target_lang: primaryLanguage(targetLanguage)
  });
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('Invalid model response.');
  const translatedText = (result as Record<string, unknown>).translated_text;
  if (typeof translatedText !== 'string' || !translatedText.trim() || translatedText.length > 2_000 || /[<>]/.test(translatedText)) throw new Error('Unsafe model response.');
  return { id: item.id, text: translatedText.trim() };
};

export async function onRequest(context: FunctionContext): Promise<Response> {
  const { request } = context;
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, { allow: 'POST' });
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (origin !== url.origin || (fetchSite !== null && fetchSite !== 'same-origin')) return json({ error: 'Same-origin request required.' }, 403);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({ error: 'JSON request required.' }, 415);
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > 50_000) return json({ error: 'Translation request is too large.' }, 413);
  if (!allowRequest(request)) return json({ error: 'Translation limit reached. Please try again later.' }, 429, { 'retry-after': '600' });
  if (!context.env.AI) return json({ error: 'Automatic translation is not configured.' }, 503);

  let requestBody: TranslationRequest;
  try {
    requestBody = validateTranslationRequest(await request.json(), TRANSLATION_BATCH_SIZE);
  } catch {
    return json({ error: 'The translation request is invalid.' }, 400);
  }
  try {
    const translated: TranslationItem[] = [];
    for (let offset = 0; offset < requestBody.items.length; offset += 4) {
      translated.push(...await Promise.all(requestBody.items.slice(offset, offset + 4).map((item) =>
        translateItem(context.env.AI!, item, requestBody.sourceLanguage, requestBody.targetLanguage)
      )));
    }
    return json({ provider: TRANSLATION_PROVIDER, translations: translated });
  } catch {
    return json({ error: 'The translation service could not complete this request.' }, 502);
  }
}
