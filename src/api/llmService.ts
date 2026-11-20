import knowledge from 'virtual:knowledge';
import { getRelevantContext } from './knowledgeBase';
import type { ChatResult, LLMMessage } from './types';

const MODEL = import.meta.env.VITE_LLM_MODEL || 'deepseek-ai/deepseek-v4-flash-0731';

// The system prompt lives on the server. The browser sends user/assistant
// messages plus a `context` field, which the server wraps in a block its
// prompt distrusts and caps at 6,000 characters.
export async function sendMessage(messages: LLMMessage[]): Promise<ChatResult> {
  const question = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  let response: Response;
  try {
    response = await fetch('/api/llm/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.slice(-5),
        model: MODEL,
        context: getRelevantContext(question, knowledge).slice(0, 6000),
      }),
    });
  } catch {
    return { kind: 'offline' };
  }

  // Read the body before branching: the budget stop and the rate limiter both answer 429.
  const body = await response.json().catch(() => null);
  if (!body) return { kind: 'offline' }; // a proxy error page, not our server
  if (response.status === 429 && body.code === 'budget_exhausted') return { kind: 'budget' };
  if (response.status === 429) return { kind: 'busy', message: 'Too many requests. Wait a moment and ask again.' };
  if (response.status === 413) return { kind: 'busy', message: 'That message is too long. Try a shorter question.' };
  if (!response.ok || !body.success) return { kind: 'busy', message: 'The assistant had a problem. Try again.' };

  const data = body.data;
  const message = data?.choices?.[0]?.message?.content ?? data?.content?.[0]?.text ?? data?.message;
  if (typeof message !== 'string' || !message) return { kind: 'busy', message: 'The assistant sent an empty reply. Try again.' };
  return { kind: 'reply', message };
}
