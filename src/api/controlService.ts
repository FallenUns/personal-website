import type { KnowledgeEntry } from '../content/types';
import { setTheme } from '../theme';
import type { Command } from './controlTypes';

const VERB = /\b(show|open|go to|take me to|see)\b/;

const SECTIONS: [RegExp, string, string][] = [
  [/\bprojects?\b/, '/projects', 'Projects'],
  [/\bexperiences?\b/, '/experience', 'Experience'],
  [/\babout\b/, '/#about', 'About'],
  [/\bcontact\b/, '/#contact', 'Contact'],
];

/** "Blipt - Context-Aware Swift iOS Productivity App" -> "Blipt" */
const shortTitle = (title: string) => title.split(/\s[-–—:]\s|\sat\s/)[0].trim();

/** Names a visitor might type for an entry: its short title and its slug as words. */
const names = (entry: KnowledgeEntry) => {
  const slug = entry.address.split('/').pop()!.replace(/-\d+$/, '').replace(/-/g, ' ');
  return [shortTitle(entry.title).toLowerCase(), slug];
};

/** Checks a message for a command before it goes to the server. */
export function parseCommand(text: string, knowledge: KnowledgeEntry[]): Command | null {
  const lower = text.toLowerCase().trim();

  // ponytail: theme words only count in short messages, so "the hackathon night" is not a command
  if (lower.split(/\s+/).length <= 6) {
    if (/\bauto theme\b/.test(lower)) return { type: 'setTheme', choice: 'auto' };
    if (/\b(dark mode|night)\b/.test(lower)) return { type: 'setTheme', choice: 'dark' };
    if (/\b(light mode|day)\b/.test(lower)) return { type: 'setTheme', choice: 'light' };
  }

  if (!VERB.test(lower)) return null;
  const entry = knowledge.find(
    (k) => k.address.split('/').length === 3 && names(k).some((n) => n.length > 2 && lower.includes(n)),
  );
  if (entry) return { type: 'navigate', address: entry.address, title: shortTitle(entry.title) };
  for (const [pattern, address, title] of SECTIONS) {
    if (pattern.test(lower)) return { type: 'navigate', address, title };
  }
  return null;
}

export const replyFor = (command: Command) =>
  command.type === 'navigate' ? `Opening ${command.title}.` : `Switched to ${command.choice} theme.`;

export function execute(command: Command) {
  if (command.type === 'setTheme') setTheme(command.choice);
  else location.assign(command.address);
}
