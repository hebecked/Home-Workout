import { validateWorkoutPlan, type WorkoutPlan } from './plan-schema';

export const TRANSLATION_PROVIDER = 'cloudflare-m2m100-1.2b';
export const MAX_TRANSLATION_ITEMS = 61;
export const TRANSLATION_BATCH_SIZE = 20;

export interface TranslationItem {
  id: string;
  text: string;
}

export interface TranslationRequest {
  sourceLanguage: string;
  targetLanguage: string;
  consent: true;
  items: TranslationItem[];
}

export interface TranslationResponse {
  provider: string;
  translations: TranslationItem[];
}

const languagePattern = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const itemIdPattern = /^(?:plan\.name|exercise\.\d+\.(?:name|instructions))$/;
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const hasOnlyKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => Object.keys(value).every((key) => keys.includes(key));

export function validateTranslationRequest(input: unknown, maximumItems = MAX_TRANSLATION_ITEMS): TranslationRequest {
  if (!isRecord(input) || !hasOnlyKeys(input, ['sourceLanguage', 'targetLanguage', 'consent', 'items'])) throw new Error('Invalid translation request.');
  const { sourceLanguage, targetLanguage, consent, items } = input;
  if (typeof sourceLanguage !== 'string' || !languagePattern.test(sourceLanguage)) throw new Error('Invalid source language.');
  if (typeof targetLanguage !== 'string' || !languagePattern.test(targetLanguage) || targetLanguage === sourceLanguage) throw new Error('Invalid target language.');
  if (consent !== true) throw new Error('Translation consent is required.');
  if (!Array.isArray(items) || items.length < 1 || items.length > maximumItems) throw new Error('Invalid translation item count.');
  let characters = 0;
  const ids = new Set<string>();
  for (const item of items) {
    if (!isRecord(item) || !hasOnlyKeys(item, ['id', 'text']) || typeof item.id !== 'string' || !itemIdPattern.test(item.id) || ids.has(item.id)) throw new Error('Invalid translation item.');
    if (typeof item.text !== 'string' || item.text.trim().length < 1 || item.text.length > 2_000 || /[<>]/.test(item.text)) throw new Error('Invalid translation text.');
    ids.add(item.id);
    characters += item.text.length;
  }
  if (characters > 40_000) throw new Error('Translation request is too large.');
  return input as unknown as TranslationRequest;
}

export function createPlanTranslationRequest(plan: WorkoutPlan, sourceLanguage: string, targetLanguage: string): TranslationRequest {
  const configured = new Set(plan.languages.map(({ code }) => code));
  if (!configured.has(sourceLanguage) || !configured.has(targetLanguage) || sourceLanguage === targetLanguage) throw new Error('Choose two different configured languages.');
  const planName = plan.name[sourceLanguage];
  if (!planName?.trim()) throw new Error(`The ${sourceLanguage} plan name is required before translation.`);
  const items: TranslationItem[] = [{ id: 'plan.name', text: planName }];
  plan.exercises.forEach((exercise, index) => {
    const copy = exercise.translations[sourceLanguage];
    if (!copy?.name.trim() || !copy.instructions.trim()) throw new Error(`Exercise ${index + 1} needs complete ${sourceLanguage} text before translation.`);
    items.push(
      { id: `exercise.${index}.name`, text: copy.name },
      { id: `exercise.${index}.instructions`, text: copy.instructions }
    );
  });
  return validateTranslationRequest({ sourceLanguage, targetLanguage, consent: true, items });
}

export function validateTranslationResponse(input: unknown, expectedItems: TranslationItem[]): TranslationResponse {
  if (!isRecord(input) || !hasOnlyKeys(input, ['provider', 'translations']) || typeof input.provider !== 'string' || !input.provider.trim() || /[<>]/.test(input.provider)) throw new Error('The translation service returned an invalid response.');
  if (!Array.isArray(input.translations) || input.translations.length !== expectedItems.length) throw new Error('The translation service returned an incomplete response.');
  const translated = new Map<string, string>();
  for (const item of input.translations) {
    if (!isRecord(item) || !hasOnlyKeys(item, ['id', 'text']) || typeof item.id !== 'string' || typeof item.text !== 'string' || !item.text.trim() || item.text.length > 2_000 || /[<>]/.test(item.text) || translated.has(item.id)) throw new Error('The translation service returned unsafe text.');
    translated.set(item.id, item.text.trim());
  }
  if (expectedItems.some(({ id }) => !translated.has(id))) throw new Error('The translation service returned mismatched text.');
  return input as unknown as TranslationResponse;
}

export function applyPlanTranslation(
  plan: WorkoutPlan,
  request: TranslationRequest,
  response: TranslationResponse,
  translatedAt = new Date().toISOString()
): WorkoutPlan {
  const validatedRequest = validateTranslationRequest(request);
  const validatedResponse = validateTranslationResponse(response, validatedRequest.items);
  const translations = new Map(validatedResponse.translations.map((item) => [item.id, item.text]));
  const next = structuredClone(plan);
  next.name[validatedRequest.targetLanguage] = translations.get('plan.name')!;
  next.exercises.forEach((exercise, index) => {
    exercise.translations[validatedRequest.targetLanguage] = {
      name: translations.get(`exercise.${index}.name`)!,
      instructions: translations.get(`exercise.${index}.instructions`)!
    };
  });
  next.translationMetadata = {
    ...next.translationMetadata,
    [validatedRequest.targetLanguage]: {
      sourceLanguage: validatedRequest.sourceLanguage,
      origin: 'machine',
      reviewStatus: 'needs-review',
      provider: validatedResponse.provider,
      translatedAt
    }
  };
  return validateWorkoutPlan(next);
}

export async function translatePlanDraft(
  plan: WorkoutPlan,
  sourceLanguage: string,
  targetLanguage: string,
  fetcher: typeof fetch = fetch
): Promise<WorkoutPlan> {
  const request = createPlanTranslationRequest(plan, sourceLanguage, targetLanguage);
  const translatedItems: TranslationItem[] = [];
  let provider = '';
  for (let offset = 0; offset < request.items.length; offset += TRANSLATION_BATCH_SIZE) {
    const batch: TranslationRequest = { ...request, items: request.items.slice(offset, offset + TRANSLATION_BATCH_SIZE) };
    const response = await fetcher('/api/translate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(batch)
    });
    if (!response.ok) {
      let message = 'Automatic translation is currently unavailable.';
      try {
        const body = await response.json() as { error?: string };
        if (typeof body.error === 'string' && body.error.trim()) message = body.error;
      } catch {
        // Keep the stable user-facing fallback.
      }
      throw new Error(message);
    }
    const body = validateTranslationResponse(await response.json(), batch.items);
    if (provider && provider !== body.provider) throw new Error('The translation provider changed during the request.');
    provider = body.provider;
    translatedItems.push(...body.translations);
  }
  return applyPlanTranslation(plan, request, { provider, translations: translatedItems });
}
