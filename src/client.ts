// The only script every page loads. Everything interactive beyond this is an
// island whose code loads when its trigger fires.
import './index.css';
import { islands } from './islands/registry';
import { getTheme, setTheme } from './theme';

document
  .querySelector('[data-theme-toggle]')
  ?.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));

// Effect 4: a highlight follows the pointer. Mouse and trackpad only.
if (matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
  for (const el of document.querySelectorAll<HTMLElement>('[data-light]')) {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', `${e.clientX - r.left}px`);
      el.style.setProperty('--py', `${e.clientY - r.top}px`);
    });
  }
}

const started = new WeakSet<Element>();

/** `activated` is true when the visitor's own click loaded the island. */
async function load(el: HTMLElement, activated: boolean) {
  if (started.has(el)) return;
  started.add(el);
  try {
    const island = await islands[el.dataset.island!]();
    island.mount(el, (el.dataset.props ? JSON.parse(el.dataset.props) : {}) as never, activated);
  } catch (error) {
    started.delete(el); // a later trigger may retry
    console.error(error);
  }
}

const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn) : setTimeout(fn, 200));

const visible = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      visible.unobserve(entry.target);
      load(entry.target as HTMLElement, false);
    }
  },
  { rootMargin: '200px' },
);

for (const el of document.querySelectorAll<HTMLElement>('[data-island]')) {
  const trigger = el.dataset.trigger;
  if (trigger === 'now') load(el, false);
  else if (trigger === 'idle') idle(() => load(el, false));
  else if (trigger === 'visible') visible.observe(el);
  else el.addEventListener('click', () => load(el, true)); // load() ignores repeats; a failed load can be retried
}

// The chat stays open across page loads.
try {
  if (JSON.parse(sessionStorage.getItem('chat:v1') ?? '{}').open) {
    const chat = document.querySelector<HTMLElement>('[data-island="chat"]');
    if (chat) idle(() => load(chat, false));
  }
} catch {
  // no session storage: the chat starts closed
}

addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    location.assign('/admin/feedback');
  }
});

// A deploy removed a code file this page still points at: get the new page.
addEventListener('vite:preloadError', () => location.reload());
