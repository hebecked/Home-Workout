import { baseMessages, type MessageKey } from './base-messages';
import { addedMessagesByLocale } from './messages-added';
import { assertCompleteMatrix, interpolate, type CompleteLocalizedText } from './matrix';
import type { SupportedLocale } from './locales';

const addedLocales = Object.keys(addedMessagesByLocale) as Array<keyof typeof addedMessagesByLocale>;

export const messages = Object.fromEntries((Object.keys(baseMessages) as MessageKey[]).map((key) => [key, {
  ...baseMessages[key],
  ...Object.fromEntries(addedLocales.map((locale) => [locale, addedMessagesByLocale[locale][key]]))
}])) as Readonly<Record<MessageKey, CompleteLocalizedText>>;

assertCompleteMatrix('messages', messages);

export function translate(
  locale: SupportedLocale,
  key: MessageKey,
  parameters: Readonly<Record<string, string | number>> = {}
): string {
  return interpolate(messages[key][locale], parameters);
}

export type Translator = (key: MessageKey, parameters?: Readonly<Record<string, string | number>>) => string;

export function translator(locale: SupportedLocale): Translator {
  return (key, parameters) => translate(locale, key, parameters);
}
