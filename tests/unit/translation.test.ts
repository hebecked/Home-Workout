import { describe, expect, it, vi } from 'vitest';
import {
  applyPlanTranslation,
  createPlanTranslationRequest,
  translatePlanDraft,
  validateTranslationRequest,
  validateTranslationResponse
} from '../../src/core/translation';
import { exportPlanJson, importPlanJson } from '../../src/core/plan-io';
import { savePlan } from '../../src/core/persistence';
import { clonePlan } from '../fixtures/plans';

describe('plan translation workflow', () => {
  it('builds a consented request from one configured source language', () => {
    const request = createPlanTranslationRequest(clonePlan(), 'fr', 'hi');

    expect(request).toMatchObject({ sourceLanguage: 'fr', targetLanguage: 'hi', consent: true });
    expect(request.items.map(({ id }) => id)).toStrictEqual([
      'plan.name',
      'exercise.0.name', 'exercise.0.instructions',
      'exercise.1.name', 'exercise.1.instructions'
    ]);
    expect(request.items[0]?.text).toBe('Circuit maison');
  });

  it('applies only the target copy and records mandatory review metadata', () => {
    const plan = clonePlan();
    const sourceSnapshot = structuredClone(plan.name.fr);
    const request = createPlanTranslationRequest(plan, 'fr', 'hi');
    const response = {
      provider: 'cloudflare-m2m100-1.2b',
      translations: request.items.map(({ id, text }) => ({ id, text: `translated: ${text}` }))
    };

    const translated = applyPlanTranslation(plan, request, response, '2026-09-01T12:00:00.000Z');

    expect(translated.name.fr).toBe(sourceSnapshot);
    expect(translated.name.hi).toBe('translated: Circuit maison');
    expect(translated.exercises[0]?.translations.hi?.instructions).toBe('translated: Descendez avec le dos droit.');
    expect(translated.translationMetadata?.hi).toStrictEqual({
      sourceLanguage: 'fr',
      origin: 'machine',
      reviewStatus: 'needs-review',
      provider: 'cloudflare-m2m100-1.2b',
      translatedAt: '2026-09-01T12:00:00.000Z'
    });
    expect(plan.translationMetadata).toBeUndefined();
    expect(() => exportPlanJson(translated)).toThrow(/must be reviewed/i);
    expect(() => importPlanJson(JSON.stringify(translated))).toThrow(/invalid.*translationMetadata\.hi\.reviewStatus/i);
    const setItem = vi.fn();
    const storage = { getItem: () => '[]', setItem } as unknown as Storage;
    expect(() => savePlan(storage, translated)).toThrow(/must be reviewed/i);
    expect(setItem).not.toHaveBeenCalled();
  });

  it('calls the same-origin endpoint and rejects service errors without changing the draft', async () => {
    const plan = clonePlan();
    const fetcher = vi.fn<typeof fetch>((_input, init) => {
      const request = JSON.parse(String(init?.body)) as { items: Array<{ id: string; text: string }> };
      return Promise.resolve(Response.json({
        provider: 'cloudflare-m2m100-1.2b',
        translations: request.items.map(({ id, text }) => ({ id, text: `HI ${text}` }))
      }));
    });

    const translated = await translatePlanDraft(plan, 'fr', 'hi', fetcher);

    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith('/api/translate', expect.objectContaining({ method: 'POST' }));
    expect(translated.name.hi).toBe('HI Circuit maison');
    expect(plan.name.hi).toBe('घर का व्यायाम');

    const unavailable = vi.fn<typeof fetch>(() => Promise.resolve(Response.json({ error: 'Daily translation limit reached.' }, { status: 429 })));
    await expect(translatePlanDraft(plan, 'fr', 'hi', unavailable)).rejects.toThrow('Daily translation limit reached.');
    expect(plan.name.hi).toBe('घर का व्यायाम');
  });

  it.each([
    [{ sourceLanguage: 'fr', targetLanguage: 'hi', consent: false, items: [{ id: 'plan.name', text: 'Plan' }] }, 'consent'],
    [{ sourceLanguage: 'fr', targetLanguage: 'fr', consent: true, items: [{ id: 'plan.name', text: 'Plan' }] }, 'target'],
    [{ sourceLanguage: 'fr', targetLanguage: 'hi', consent: true, items: [{ id: 'unsafe', text: 'Plan' }] }, 'item'],
    [{ sourceLanguage: 'fr', targetLanguage: 'hi', consent: true, items: [{ id: 'plan.name', text: '<b>Plan</b>' }] }, 'text']
  ])('rejects unsafe or non-consented requests', (input, message) => {
    expect(() => validateTranslationRequest(input)).toThrow(new RegExp(message, 'i'));
  });

  it('rejects missing, duplicate and marked-up model output', () => {
    const expected = [{ id: 'plan.name', text: 'Plan' }];
    expect(() => validateTranslationResponse({ provider: 'cloudflare', translations: [] }, expected)).toThrow(/incomplete/i);
    expect(() => validateTranslationResponse({ provider: 'cloudflare', translations: [{ id: 'plan.name', text: '<b>Plan</b>' }] }, expected)).toThrow(/unsafe/i);
  });
});
