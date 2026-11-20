import { expect, it } from 'vitest';
import type { KnowledgeEntry } from '../content/types';
import { parseCommand, replyFor } from './controlService';

const entry = (title: string, address: string): KnowledgeEntry => ({ title, address, summary: '', text: '' });
const knowledge = [
  entry('About Patrick Adrianus', '/#about'),
  entry('Reffy', '/projects/reffy'),
  entry('Blipt - Context-Aware Swift iOS Productivity App', '/projects/blipt'),
  entry('Summer Intern at Urban Waste', '/experience/urban-waste-1'),
];

it('opens an entry by title, whatever the case', () => {
  const command = parseCommand('show me Reffy', knowledge);
  expect(command).toEqual({ type: 'navigate', address: '/projects/reffy', title: 'Reffy' });
  expect(replyFor(command!)).toBe('Opening Reffy.');
  expect(parseCommand('open BLIPT please', knowledge)).toMatchObject({ address: '/projects/blipt', title: 'Blipt' });
  expect(parseCommand('take me to urban waste', knowledge)).toMatchObject({ address: '/experience/urban-waste-1' });
});

it('opens a section', () => {
  expect(parseCommand('open projects', knowledge)).toMatchObject({ address: '/projects' });
  expect(parseCommand('go to contact', knowledge)).toMatchObject({ address: '/#contact' });
});

it('switches the theme', () => {
  expect(parseCommand('dark mode', knowledge)).toEqual({ type: 'setTheme', choice: 'dark' });
  expect(parseCommand('light mode please', knowledge)).toEqual({ type: 'setTheme', choice: 'light' });
  expect(parseCommand('auto theme', knowledge)).toEqual({ type: 'setTheme', choice: 'auto' });
});

it('leaves ordinary questions alone', () => {
  expect(parseCommand('What did Patrick build for the hackathon?', knowledge)).toBeNull();
  expect(parseCommand('Tell me about the night he presented Cliniwatch to the judges', knowledge)).toBeNull();
});
