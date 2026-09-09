export const SUPPORTED_LOCALES = [
  'de',
  'en',
  'nl',
  'es',
  'fr',
  'ru',
  'zh-Hans',
  'ko',
  'ja',
  'ar',
  'pt',
  'it',
  'pl',
  'tr',
  'uk',
  'hi'
] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export type TextDirection = 'ltr' | 'rtl';

export interface LocaleDefinition {
  code: SupportedLocale;
  direction: TextDirection;
  /** The language name as written by its speakers. */
  nativeName: string;
}

export const DEFAULT_LOCALE: SupportedLocale = 'en';
export const UI_LOCALE_STORAGE_KEY = 'home-workout:ui-locale';

export const LOCALE_DEFINITIONS: readonly LocaleDefinition[] = [
  { code: 'de', direction: 'ltr', nativeName: 'Deutsch' },
  { code: 'en', direction: 'ltr', nativeName: 'English' },
  { code: 'nl', direction: 'ltr', nativeName: 'Nederlands' },
  { code: 'es', direction: 'ltr', nativeName: 'Español' },
  { code: 'fr', direction: 'ltr', nativeName: 'Français' },
  { code: 'ru', direction: 'ltr', nativeName: 'Русский' },
  { code: 'zh-Hans', direction: 'ltr', nativeName: '简体中文' },
  { code: 'ko', direction: 'ltr', nativeName: '한국어' },
  { code: 'ja', direction: 'ltr', nativeName: '日本語' },
  { code: 'ar', direction: 'rtl', nativeName: 'العربية' },
  { code: 'pt', direction: 'ltr', nativeName: 'Português' },
  { code: 'it', direction: 'ltr', nativeName: 'Italiano' },
  { code: 'pl', direction: 'ltr', nativeName: 'Polski' },
  { code: 'tr', direction: 'ltr', nativeName: 'Türkçe' },
  { code: 'uk', direction: 'ltr', nativeName: 'Українська' },
  { code: 'hi', direction: 'ltr', nativeName: 'हिन्दी' }
] as const satisfies readonly LocaleDefinition[];

const supportedLocaleSet = new Set<string>(SUPPORTED_LOCALES);

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && supportedLocaleSet.has(value);
}

export function localeDirection(locale: SupportedLocale): TextDirection {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function normalizeLocale(value: string | null | undefined): SupportedLocale {
  if (isSupportedLocale(value)) return value;
  if (!value) return DEFAULT_LOCALE;

  const normalized = value.replace('_', '-').toLowerCase();
  if (normalized === 'zh' || normalized === 'zh-cn' || normalized === 'zh-sg' || normalized.startsWith('zh-hans')) return 'zh-Hans';
  const base = normalized.split('-')[0];
  return isSupportedLocale(base) ? base : DEFAULT_LOCALE;
}

export function readStoredLocale(storage: Pick<Storage, 'getItem'>, browserLanguages: readonly string[] = []): SupportedLocale {
  const stored = storage.getItem(UI_LOCALE_STORAGE_KEY);
  if (isSupportedLocale(stored)) return stored;
  for (const language of browserLanguages) {
    const normalized = normalizeLocale(language);
    if (normalized !== DEFAULT_LOCALE || language.toLowerCase().startsWith('en')) return normalized;
  }
  return DEFAULT_LOCALE;
}

export function persistLocale(storage: Pick<Storage, 'setItem'>, locale: SupportedLocale): void {
  storage.setItem(UI_LOCALE_STORAGE_KEY, locale);
}
