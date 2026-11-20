export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** What one chat request ends as. `busy` covers rate limits and server errors. */
export type ChatResult =
  | { kind: 'reply'; message: string }
  | { kind: 'budget' }
  | { kind: 'offline' }
  | { kind: 'busy'; message: string };
