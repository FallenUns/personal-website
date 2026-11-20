// Day/night theme. The saved choice lives in localStorage under "theme";
// no key means automatic (dark 17:00-05:00). src/theme-inline.js applies it before first paint.
export type Theme = 'dark' | 'light';
export type ThemeChoice = Theme | 'auto';

const KEY = 'theme';
const listeners = new Set<(theme: Theme) => void>();

const byClock = (): Theme => {
  const h = new Date().getHours();
  return h >= 17 || h < 5 ? 'dark' : 'light';
};

export const getTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export function setTheme(choice: ThemeChoice): Theme {
  try {
    if (choice === 'auto') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    // storage blocked: the choice lasts for this page only
  }
  const theme = choice === 'auto' ? byClock() : choice;
  document.documentElement.dataset.theme = theme;
  listeners.forEach((fn) => fn(theme));
  return theme;
}

export function onThemeChange(fn: (theme: Theme) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
