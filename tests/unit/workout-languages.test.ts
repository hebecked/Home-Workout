import { describe, expect, it } from 'vitest';
import {
  SECOND_WORKOUT_LANGUAGE_STORAGE_KEY,
  matchLanguageCode,
  persistSecondWorkoutLanguage,
  readSecondWorkoutLanguage,
  resolveWorkoutLanguages
} from '../../src/i18n/workout-languages';

const memoryStorage = (initial: Record<string, string> = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); }
  };
};

describe('workout-language preferences', () => {
  it('stores the preference independently from plans and defaults invalid values to plan languages', () => {
    const storage = memoryStorage();
    expect(readSecondWorkoutLanguage(storage)).toBe('auto');
    persistSecondWorkoutLanguage(storage, 'fr');
    expect(readSecondWorkoutLanguage(storage)).toBe('fr');
    expect(storage.getItem(SECOND_WORKOUT_LANGUAGE_STORAGE_KEY)).toBe('fr');
    expect(storage.getItem('home-workout:plans')).toBeNull();
    expect(readSecondWorkoutLanguage(memoryStorage({ [SECOND_WORKOUT_LANGUAGE_STORAGE_KEY]: 'xx' }))).toBe('auto');
  });

  it('matches BCP 47 codes exactly before using their base language', () => {
    expect(matchLanguageCode('pt-BR', ['de', 'pt-PT', 'pt-BR'])).toBe('pt-BR');
    expect(matchLanguageCode('en-GB', ['de', 'en-US'])).toBe('en-US');
    expect(matchLanguageCode('ja', ['de', 'en'])).toBeUndefined();
  });

  it('uses the interface language first and one plan language as the automatic second language', () => {
    expect(resolveWorkoutLanguages({
      interfaceLanguage: 'hi',
      displayLanguages: ['de', 'en'],
      availableLanguages: ['de', 'en', 'hi'],
      secondLanguage: 'auto'
    })).toEqual(['hi', 'de']);
  });

  it('supports an explicit second language, off, and deterministic fallbacks', () => {
    const base = {
      interfaceLanguage: 'fr-CA',
      displayLanguages: ['de-DE', 'en-US'],
      availableLanguages: ['de-DE', 'en-US', 'fr-FR']
    } as const;
    expect(resolveWorkoutLanguages({ ...base, secondLanguage: 'en' })).toEqual(['fr-FR', 'en-US']);
    expect(resolveWorkoutLanguages({ ...base, secondLanguage: 'off' })).toEqual(['fr-FR']);
    expect(resolveWorkoutLanguages({ ...base, interfaceLanguage: 'ja', secondLanguage: 'off' })).toEqual(['de-DE']);
    expect(resolveWorkoutLanguages({ ...base, secondLanguage: 'ja' })).toEqual(['fr-FR']);
    expect(resolveWorkoutLanguages({ ...base, availableLanguages: [], secondLanguage: 'auto' })).toEqual([]);
  });
});
