import { hiMessages } from './hi';
import { itMessages } from './it';
import { plMessages } from './pl';
import { ptMessages } from './pt';
import { trMessages } from './tr';
import { ukMessages } from './uk';
import type { FirstReleaseAddedLocale } from '../matrix';
import type { MessageKey } from '../base-messages';

export const addedMessagesByLocale = {
  pt: ptMessages,
  it: itMessages,
  pl: plMessages,
  tr: trMessages,
  uk: ukMessages,
  hi: hiMessages
} as const satisfies Readonly<Record<FirstReleaseAddedLocale, Readonly<Record<MessageKey, string>>>>;
