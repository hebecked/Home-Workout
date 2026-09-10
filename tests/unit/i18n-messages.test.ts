import { describe, expect, it } from 'vitest';
import { baseMessages, type MessageKey } from '../../src/i18n/base-messages';
import { messages, translate } from '../../src/i18n/catalog';
import { applyDocumentLocale } from '../../src/i18n/document';
import { addedMessagesByLocale } from '../../src/i18n/messages-added';
import { placeholders } from '../../src/i18n/matrix';
import { SUPPORTED_LOCALES } from '../../src/i18n/locales';

const messageKeys = Object.keys(baseMessages).sort() as MessageKey[];
const meaningSensitiveKeys: MessageKey[] = [
  'home.safety',
  'ai.safety',
  'legal.responsibilityCopy',
  'legal.healthCopy',
  'legal.liability',
  'translation.privacy'
];

// These short terms, product names, abbreviations, and loan words are genuinely
// written identically in English and the named locale. All other equality is
// treated as a likely fallback leak and fails this test.
const unchangedCopyAllowlist: Readonly<Record<keyof typeof addedMessagesByLocale, readonly MessageKey[]>> = {
  pt: ['app.name', 'status.total', 'category.cardio', 'category.core', 'home.minutes', 'audio.volume'],
  it: ['app.name', 'category.cardio', 'category.core', 'category.stretch', 'home.minutes', 'help.importTitle', 'help.offlineTitle', 'audio.volume'],
  pl: ['app.name', 'button.start', 'category.cardio', 'category.core', 'home.minutes'],
  tr: ['app.name', 'category.cardio', 'category.core', 'editor.minimum', 'help.pauseTitle'],
  uk: ['app.name', 'category.cardio', 'category.core'],
  hi: ['category.cardio', 'category.core']
};

describe('UI message catalogues', () => {
  it('materializes exactly the same complete key set for all 16 locales', () => {
    expect(messageKeys.length).toBeGreaterThan(200);
    expect(Object.keys(messages).sort()).toEqual(messageKeys);
    for (const locale of SUPPORTED_LOCALES) {
      const localeKeys = Object.entries(messages)
        .filter(([, translations]) => Object.prototype.hasOwnProperty.call(translations, locale))
        .map(([key]) => key)
        .sort();
      expect(localeKeys, locale).toEqual(messageKeys);
    }
  });

  it('requires every newly added locale to define every raw key directly', () => {
    for (const [locale, catalogue] of Object.entries(addedMessagesByLocale)) {
      expect(Object.keys(catalogue).sort(), locale).toEqual(messageKeys);
      for (const key of messageKeys) {
        expect(catalogue[key].trim(), `${locale}.${key}`).not.toBe('');
        expect(catalogue[key], `${locale}.${key}`).not.toContain(`⟦${locale}⟧`);
      }
    }
  });

  it('does not silently reuse English outside the documented invariant terms', () => {
    for (const [locale, catalogue] of Object.entries(addedMessagesByLocale) as Array<[
      keyof typeof addedMessagesByLocale,
      Readonly<Record<MessageKey, string>>
    ]>) {
      const equalToEnglish = messageKeys.filter((key) => catalogue[key] === baseMessages[key].en);
      expect(equalToEnglish.sort(), locale).toEqual([...unchangedCopyAllowlist[locale]].sort());
    }
  });

  it('rejects empty translations and translated or missing placeholders', () => {
    for (const key of messageKeys) {
      const sourcePlaceholders = placeholders(baseMessages[key].en);
      for (const locale of SUPPORTED_LOCALES) {
        expect(messages[key][locale].trim(), `${locale}.${key}`).not.toBe('');
        expect(placeholders(messages[key][locale]), `${locale}.${key}`).toEqual(sourcePlaceholders);
      }
    }
  });

  it('keeps the complete meaning-sensitive set present in every locale', () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const key of meaningSensitiveKeys) {
        expect(messages[key][locale].trim().length, `${locale}.${key}`).toBeGreaterThan(8);
      }
    }
  });

  it('interpolates named values without touching unknown placeholders', () => {
    expect(translate('de', 'status.round', { current: 2, total: 4 })).toBe('Runde 2 / 4');
    expect(translate('hi', 'editor.moveUp', { name: 'स्क्वाट' })).toContain('स्क्वाट');
  });

  it('applies language and right-to-left direction together', () => {
    const element = { lang: '', dir: '' } as HTMLElement;
    applyDocumentLocale(element, 'ar');
    expect(element.lang).toBe('ar');
    expect(element.dir).toBe('rtl');
    applyDocumentLocale(element, 'zh-Hans');
    expect(element.lang).toBe('zh-Hans');
    expect(element.dir).toBe('ltr');
  });
});
