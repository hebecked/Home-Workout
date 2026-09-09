import { hiMessages } from './hi';
import { itMessages } from './it';
import { plMessages } from './pl';
import { ptMessages } from './pt';
import { trMessages } from './tr';
import { ukMessages } from './uk';
import type { FirstReleaseAddedLocale } from '../matrix';
import type { MessageKey } from '../base-messages';
import { addedPhaseMessages } from '../messages/phases';

export const addedMessagesByLocale = {
  pt: { ...ptMessages, ...addedPhaseMessages.pt },
  it: { ...itMessages, ...addedPhaseMessages.it },
  pl: { ...plMessages, ...addedPhaseMessages.pl },
  tr: { ...trMessages, ...addedPhaseMessages.tr },
  uk: { ...ukMessages, ...addedPhaseMessages.uk },
  hi: { ...hiMessages, ...addedPhaseMessages.hi }
} as const satisfies Readonly<Record<FirstReleaseAddedLocale, Readonly<Record<MessageKey, string>>>>;
