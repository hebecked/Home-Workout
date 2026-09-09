import { commonMessages } from './messages/common';
import { editorMessages } from './messages/editor';
import { helpLegalMessages } from './messages/help-legal';
import { homeMessages } from './messages/home';

export const baseMessages = {
  ...commonMessages,
  ...homeMessages,
  ...editorMessages,
  ...helpLegalMessages
} as const;

export type MessageKey = keyof typeof baseMessages;
