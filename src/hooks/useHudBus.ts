// src/hooks/useHudBus.ts
import { useEffect, useState } from 'react';

export type HudLevel = 'info' | 'ok' | 'warn';
export interface HudMessage {
  id: number;
  t: number;       // epoch ms
  text: string;
  level: HudLevel;
}

// Module-singleton state: ring buffer of last 50 messages + subscribers.
// Module-level (not a Context) so any component or hook can call `hudLog`
// without prop drilling and without forcing re-renders of unrelated trees.
const MAX = 50;
let counter = 0;
const buffer: HudMessage[] = [];
const subs = new Set<(msgs: HudMessage[]) => void>();

const broadcast = () => {
  // Snapshot so subscribers don't accidentally mutate.
  const snap = buffer.slice();
  subs.forEach((fn) => fn(snap));
};

export const hudLog = (text: string, level: HudLevel = 'info'): void => {
  const msg: HudMessage = { id: ++counter, t: Date.now(), text, level };
  buffer.push(msg);
  if (buffer.length > MAX) buffer.shift();
  broadcast();
};

export const hudClear = (): void => {
  buffer.length = 0;
  broadcast();
};

/**
 * React hook — returns the current message buffer and re-renders on each
 * new log entry. Initial value is the existing buffer so a HUD mounted late
 * in the page lifecycle still shows the boot messages.
 */
export const useHudBus = (): HudMessage[] => {
  const [msgs, setMsgs] = useState<HudMessage[]>(() => buffer.slice());
  useEffect(() => {
    subs.add(setMsgs);
    setMsgs(buffer.slice());
    return () => {
      subs.delete(setMsgs);
    };
  }, []);
  return msgs;
};
