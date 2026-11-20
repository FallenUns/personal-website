import { useEffect, useState } from 'react';
import knowledge from 'virtual:knowledge';
import { execute, parseCommand, replyFor } from '../api/controlService';
import { sendMessage } from '../api/llmService';
import ChatWindow, { type ChatMessage, type Notice } from '../components/ChatWindow';
import { mountIsland } from './mount';
import './chat.css';

const KEY = 'chat:v1';
type Saved = { open: boolean; messages: ChatMessage[] };

const read = (): Saved => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? '');
    if (Array.isArray(saved.messages)) return { open: !!saved.open, messages: saved.messages };
  } catch {
    // nothing saved, or storage blocked
  }
  return { open: false, messages: [] };
};

const save = (state: Saved) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage blocked: the chat lasts for this page only
  }
};

/** Owns the conversation: messages, the request, and what survives a page load. */
function Chat({ activated }: { activated: boolean }) {
  const [saved] = useState(read);
  const [open, setOpen] = useState(activated || saved.open);
  const [messages, setMessages] = useState<ChatMessage[]>(saved.messages);
  const [isAITyping, setTyping] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => save({ open, messages }), [open, messages]);

  const onSendMessage = async (input: string) => {
    const text = input.trim();
    if (!text || isAITyping) return;
    const asked: ChatMessage[] = [...messages, { role: 'user', text }];
    setNotice(null);

    const command = parseCommand(text, knowledge);
    if (command) {
      const answered: ChatMessage[] = [...asked, { role: 'assistant', text: replyFor(command) }];
      setMessages(answered);
      save({ open: true, messages: answered }); // before the page changes
      execute(command);
      return;
    }

    setMessages(asked);
    setTyping(true);
    const result = await sendMessage(asked.map((m) => ({ role: m.role, content: m.text })));
    setTyping(false);
    if (result.kind === 'reply') setMessages([...asked, { role: 'assistant', text: result.message }]);
    else setNotice(result.kind === 'busy' ? result.message : result.kind);
  };

  return (
    <>
      <button
        className="dock-btn dock-btn-solid"
        type="button"
        aria-expanded={open}
        aria-controls="chat-panel"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Close assistant' : 'Ask the assistant'}
      </button>
      {open && (
        <ChatWindow
          messages={messages}
          isAITyping={isAITyping}
          notice={notice}
          onSendMessage={onSendMessage}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export function mount(el: HTMLElement, _props: never, activated: boolean) {
  mountIsland(el, <Chat activated={activated} />);
}
