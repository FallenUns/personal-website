import type { ThemeChoice } from '../theme';

/** Things the chat can do on the site without asking the server. */
export type Command =
  | { type: 'navigate'; address: string; title: string }
  | { type: 'setTheme'; choice: ThemeChoice };
