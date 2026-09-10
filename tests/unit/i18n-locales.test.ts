import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  LOCALE_DEFINITIONS,
  SUPPORTED_LOCALES,
  UI_LOCALE_STORAGE_KEY,
  localeDirection,
  normalizeLocale,
  persistLocale,
  readStoredLocale
} from '../../src/i18n/locales';
import { EXERCISE_IDS } from '../../src/i18n/exercises';
import { exerciseTranslations } from '../../src/i18n/exercise-catalog';
import { newExerciseInstructions } from '../../src/i18n/exercise-instructions-new';
import { ROUTINE_IDS, routineNames } from '../../src/i18n/routines';

const memoryStorage = (initial: Record<string, string> = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); }
  };
};

describe('supported UI locales', () => {
  it('contains exactly the 16 first-release locales', () => {
    expect(SUPPORTED_LOCALES).toEqual([
      'de', 'en', 'nl', 'es', 'fr', 'ru', 'zh-Hans', 'ko', 'ja', 'ar',
      'pt', 'it', 'pl', 'tr', 'uk', 'hi'
    ]);
    expect(LOCALE_DEFINITIONS.map(({ code }) => code)).toEqual(SUPPORTED_LOCALES);
    expect(new Set(LOCALE_DEFINITIONS.map(({ nativeName }) => nativeName)).size).toBe(SUPPORTED_LOCALES.length);
  });

  it('marks only Arabic as right-to-left', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(localeDirection(locale), locale).toBe(locale === 'ar' ? 'rtl' : 'ltr');
    }
  });

  it('normalizes browser locale variants and falls back to English', () => {
    expect(normalizeLocale('zh-CN')).toBe('zh-Hans');
    expect(normalizeLocale('zh_Hans_SG')).toBe('zh-Hans');
    expect(normalizeLocale('pt-BR')).toBe('pt');
    expect(normalizeLocale('uk-UA')).toBe('uk');
    expect(normalizeLocale('xx-ZZ')).toBe(DEFAULT_LOCALE);
    expect(normalizeLocale(null)).toBe(DEFAULT_LOCALE);
  });

  it('persists an explicit UI locale without any training-language state', () => {
    const storage = memoryStorage();
    persistLocale(storage, 'hi');
    expect(storage.getItem(UI_LOCALE_STORAGE_KEY)).toBe('hi');
    expect(readStoredLocale(storage, ['de-DE'])).toBe('hi');
    expect(storage.getItem('home-workout:plans')).toBeNull();
    expect(storage.getItem('home-workout:active-session')).toBeNull();
  });

  it('ignores an invalid stored value and checks browser preferences in order', () => {
    const storage = memoryStorage({ [UI_LOCALE_STORAGE_KEY]: 'not-a-locale' });
    expect(readStoredLocale(storage, ['xx-ZZ', 'fr-CA', 'de-DE'])).toBe('fr');
    expect(readStoredLocale(memoryStorage(), ['xx-ZZ'])).toBe(DEFAULT_LOCALE);
  });
});

describe('localized bundled content', () => {
  it('has a direct non-empty exercise name and instruction for every locale', () => {
    expect(Object.keys(exerciseTranslations).sort()).toEqual([...EXERCISE_IDS].sort());
    for (const id of EXERCISE_IDS) {
      expect(Object.keys(exerciseTranslations[id]).sort(), id).toEqual([...SUPPORTED_LOCALES].sort());
      for (const locale of SUPPORTED_LOCALES) {
        const translation = exerciseTranslations[id][locale];
        expect(translation.name.trim(), `${id}.${locale}.name`).not.toBe('');
        expect(translation.instructions.trim(), `${id}.${locale}.instructions`).not.toBe('');
        expect(translation.instructions.length, `${id}.${locale}.instructions`).toBeGreaterThan(30);
      }
    }
  });

  it('uses exercise-specific instructions in all 16 locales for every new dynamic warm-up', () => {
    const expectedIds = [
      'hip-circles', 'ankle-rocks', 'torso-rotations',
      'bodyweight-good-morning', 'dynamic-lunge-reach', 'inchworm'
    ] as const;
    expect(Object.keys(newExerciseInstructions).sort()).toEqual([...expectedIds].sort());
    for (const id of expectedIds) {
      const instructions = newExerciseInstructions[id]!;
      expect(Object.keys(instructions).sort(), id).toEqual([...SUPPORTED_LOCALES].sort());
      for (const locale of SUPPORTED_LOCALES) {
        expect(exerciseTranslations[id][locale].instructions).toBe(instructions[locale]);
      }
    }
  });
  it('has a direct non-empty name for every bundled routine and locale', () => {
    expect(Object.keys(routineNames).sort()).toEqual([...ROUTINE_IDS].sort());
    for (const id of ROUTINE_IDS) {
      expect(Object.keys(routineNames[id]).sort(), id).toEqual([...SUPPORTED_LOCALES].sort());
      for (const locale of SUPPORTED_LOCALES) expect(routineNames[id][locale].trim()).not.toBe('');
    }
  });
});
