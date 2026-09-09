import { SUPPORTED_LOCALES, type SupportedLocale } from './locales';

export const FIRST_RELEASE_BASE_LOCALES = ['de', 'en', 'nl', 'es', 'fr', 'ru', 'zh-Hans', 'ko', 'ja', 'ar'] as const;
export type FirstReleaseBaseLocale = typeof FIRST_RELEASE_BASE_LOCALES[number];
export const FIRST_RELEASE_ADDED_LOCALES = ['pt', 'it', 'pl', 'tr', 'uk', 'hi'] as const;
export type FirstReleaseAddedLocale = typeof FIRST_RELEASE_ADDED_LOCALES[number];
export type LocalizedText = Readonly<Record<FirstReleaseBaseLocale, string>>;
export type AddedLocalizedText = Readonly<Record<FirstReleaseAddedLocale, string>>;
export type CompleteLocalizedText = Readonly<Record<SupportedLocale, string>>;

export function localized(values: LocalizedText): LocalizedText {
  return values;
}

export function row(
  de: string,
  en: string,
  nl: string,
  es: string,
  fr: string,
  ru: string,
  zhHans: string,
  ko: string,
  ja: string,
  ar: string
): LocalizedText {
  return { de, en, nl, es, fr, ru, 'zh-Hans': zhHans, ko, ja, ar };
}

export function addedRow(pt: string, it: string, pl: string, tr: string, uk: string, hi: string): AddedLocalizedText {
  return { pt, it, pl, tr, uk, hi };
}

export function assertCompleteMatrix(
  matrixName: string,
  matrix: Readonly<Record<string, CompleteLocalizedText>>
): void {
  for (const [key, translations] of Object.entries(matrix)) {
    const actual = Object.keys(translations).sort();
    const expected = [...SUPPORTED_LOCALES].sort();
    if (actual.length !== expected.length || actual.some((locale, index) => locale !== expected[index])) {
      throw new Error(`${matrixName}.${key} must define exactly: ${expected.join(', ')}`);
    }
    for (const locale of SUPPORTED_LOCALES) {
      if (typeof translations[locale] !== 'string' || !translations[locale].trim()) {
        throw new Error(`${matrixName}.${key}.${locale} must be a non-empty direct translation`);
      }
    }
  }
}

export function interpolate(message: string, parameters: Readonly<Record<string, string | number>> = {}): string {
  return message.replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (placeholder, name: string) => (
    Object.prototype.hasOwnProperty.call(parameters, name) ? String(parameters[name]) : placeholder
  ));
}

export function placeholders(message: string): string[] {
  return [...message.matchAll(/\{([A-Za-z][A-Za-z0-9]*)\}/g)].map((match) => match[1]!).sort();
}
