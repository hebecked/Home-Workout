import { commonMessages } from './messages/common';
import { editorMessages } from './messages/editor';
import { helpLegalMessages } from './messages/help-legal';
import { homeMessages } from './messages/home';
import { phaseMessages } from './messages/phases';

export const coreMessages = {
  ...commonMessages,
  ...homeMessages,
  ...editorMessages,
  ...helpLegalMessages
} as const;

export type CoreMessageKey = keyof typeof coreMessages;

export const baseMessages = {
  ...coreMessages,
  ...phaseMessages
} as const;

export type MessageKey = keyof typeof baseMessages;
