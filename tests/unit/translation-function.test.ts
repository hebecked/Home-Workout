import { describe, expect, it, vi } from 'vitest';
import { onRequest } from '../../functions/api/translate';

const requestBody = {
  sourceLanguage: 'en',
  targetLanguage: 'fr',
  consent: true as const,
  items: [{ id: 'plan.name', text: 'Home strength' }]
};

const makeRequest = (body: unknown = requestBody, headers: Record<string, string> = {}): Request => new Request('https://workout.example/api/translate', {
  method: 'POST',
  headers: {
    origin: 'https://workout.example',
    'sec-fetch-site': 'same-origin',
    'content-type': 'application/json',
    'cf-connecting-ip': crypto.randomUUID(),
    ...headers
  },
  body: JSON.stringify(body)
});

describe('Cloudflare translation function', () => {
  it('translates validated same-origin text through the configured binding', async () => {
    const run = vi.fn((_model: string, input: { text: string }) => Promise.resolve({ translated_text: `FR ${input.text}` }));
    const response = await onRequest({ request: makeRequest(), env: { AI: { run } } });

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toStrictEqual({
      provider: 'cloudflare-m2m100-1.2b',
      translations: [{ id: 'plan.name', text: 'FR Home strength' }]
    });
    expect(run).toHaveBeenCalledWith('@cf/meta/m2m100-1.2b', {
      text: 'Home strength', source_lang: 'en', target_lang: 'fr'
    });
  });

  it('rejects cross-origin, non-JSON and non-consented calls before inference', async () => {
    const run = vi.fn();
    const crossOrigin = await onRequest({ request: makeRequest(requestBody, { origin: 'https://attacker.example' }), env: { AI: { run } } });
    const wrongType = await onRequest({ request: makeRequest(requestBody, { 'content-type': 'text/plain' }), env: { AI: { run } } });
    const noConsent = await onRequest({ request: makeRequest({ ...requestBody, consent: false }), env: { AI: { run } } });

    expect(crossOrigin.status).toBe(403);
    expect(wrongType.status).toBe(415);
    expect(noConsent.status).toBe(400);
    expect(run).not.toHaveBeenCalled();
  });

  it('returns a stable unavailable response when the AI binding is missing', async () => {
    const response = await onRequest({ request: makeRequest(), env: {} });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toStrictEqual({ error: 'Automatic translation is not configured.' });
  });

  it('rejects unsafe model output instead of forwarding markup', async () => {
    const response = await onRequest({
      request: makeRequest(),
      env: { AI: { run: vi.fn(() => Promise.resolve({ translated_text: '<script>alert(1)</script>' })) } }
    });

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toStrictEqual({ error: 'The translation service could not complete this request.' });
  });
});
