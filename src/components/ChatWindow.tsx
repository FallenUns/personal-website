import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export type ChatMessage = { role: 'user' | 'assistant'; text: string };
/** `budget` and `offline` have fixed wording with links; any other text is shown as it is. */
export type Notice = null | 'budget' | 'offline' | (string & {});

type Props = {
  messages: ChatMessage[];
  isAITyping: boolean;
  notice: Notice;
  onSendMessage: (input: string) => void | Promise<void>;
  onClose: () => void;
};

const siteLinks = (
  <>
    {' '}
    You can still browse the <a href="/projects">projects</a> and the <a href="/experience">experience timeline</a>.
  </>
);

/** Display only. The chat island owns the messages and the request. */
export default function ChatWindow({ messages, isAITyping, notice, onSendMessage, onClose }: Props) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, isAITyping, notice]);

  return (
    <section
      id="chat-panel"
      className="chat"
      aria-label="Assistant"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <header className="chat-head">
        <h2>Assistant</h2>
        <button type="button" className="chat-close" onClick={onClose} aria-label="Close assistant">
          ×
        </button>
      </header>

      <div className="chat-log" ref={logRef} role="log" aria-live="polite">
        {messages.length === 0 && (
          <p className="chat-hint">
            Ask about Patrick's projects or experience. You can also say “show me Reffy” or “dark mode”.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg chat-${m.role}`}>
            {m.role === 'assistant' ? <ReactMarkdown>{m.text}</ReactMarkdown> : m.text}
          </div>
        ))}
        {isAITyping && <p className="chat-hint">Thinking…</p>}
        {notice && (
          <p className="chat-notice" role="status">
            {notice === 'budget' && <>The assistant has reached its limit for today.{siteLinks}</>}
            {notice === 'offline' && <>The assistant cannot be reached right now.{siteLinks}</>}
            {notice !== 'budget' && notice !== 'offline' && notice}
          </p>
        )}
      </div>

      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (isAITyping || !input.trim()) return;
          onSendMessage(input);
          setInput('');
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isAITyping ? 'Waiting for the reply…' : 'Ask anything'}
          aria-label="Message"
          maxLength={2000}
          disabled={isAITyping}
        />
        <button type="submit" className="btn btn-solid" disabled={isAITyping || !input.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}
