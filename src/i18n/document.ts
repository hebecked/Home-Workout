import { localeDirection, type SupportedLocale } from './locales';

export function applyDocumentLocale(documentElement: Pick<HTMLElement, 'lang' | 'dir'>, locale: SupportedLocale): void {
  documentElement.lang = locale;
  documentElement.dir = localeDirection(locale);
}
