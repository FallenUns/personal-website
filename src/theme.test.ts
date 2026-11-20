import crypto from 'node:crypto';
import fs from 'node:fs';
import { beforeEach, expect, it, vi } from 'vitest';

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  vi.stubGlobal('document', { documentElement: { dataset: {} } });
});

it('saves a choice, and "auto" removes the key', async () => {
  const { getTheme, onThemeChange, setTheme } = await import('./theme');
  const seen: string[] = [];
  onThemeChange((t) => seen.push(t));
  expect(setTheme('dark')).toBe('dark');
  expect(store.get('theme')).toBe('dark');
  expect(getTheme()).toBe('dark');
  setTheme('auto');
  expect(store.has('theme')).toBe(false);
  expect(seen[0]).toBe('dark');
  expect(seen).toHaveLength(2);
});

// The content security policy allows inline scripts by hash only. If the
// script changes and nginx.conf does not, production shows the wrong theme.
it('nginx.conf allows the inline theme script by hash', () => {
  const script = fs.readFileSync('src/theme-inline.js', 'utf8');
  const hash = crypto.createHash('sha256').update(script).digest('base64');
  expect(fs.readFileSync('nginx.conf', 'utf8')).toContain(`'sha256-${hash}'`);
});
