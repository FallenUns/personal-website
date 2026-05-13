import React from 'react';

// =============================================================================
// Global scroll-quiet bus
// =============================================================================
//
// One passive `scroll` listener serves every `useInViewport` consumer. Each
// consumer registers a handler; the bus invokes all handlers once scrolling
// has been quiet for `QUIET_MS`. Components use this to defer mount /
// unmount decisions until the user actually stops scrolling — so a fast
// navbar jump from Hero to Contact (a 1.2 s Lenis smooth-scroll that races
// the page through Experience + Projects) doesn't trigger 4 heavy WebGL /
// canvas / SVG-filter initialisations along the way.
//
// Why a shared bus instead of per-hook listeners: 30+ LiquidGlass instances
// + 4 section canvases each running their own `scroll` listener + their own
// setTimeout would mean dozens of timer ops per scroll event during a
// 60 Hz scroll. The shared bus is one listener total, one timer total.

type ScrollQuietHandler = () => void;

const QUIET_MS = 150;

const handlers = new Set<ScrollQuietHandler>();
let quietTimer: ReturnType<typeof setTimeout> | null = null;
let scrollListenerAttached = false;

const fireQuiet = () => {
  quietTimer = null;
  handlers.forEach((h) => h());
};

const onScroll = () => {
  if (quietTimer) clearTimeout(quietTimer);
  quietTimer = setTimeout(fireQuiet, QUIET_MS);
};

const ensureScrollListener = () => {
  if (scrollListenerAttached || typeof window === 'undefined') return;
  window.addEventListener('scroll', onScroll, { passive: true });
  scrollListenerAttached = true;
};

const subscribeScrollQuiet = (handler: ScrollQuietHandler) => {
  ensureScrollListener();
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
};

// =============================================================================
// Hook
// =============================================================================

type UseInViewportOptions = {
  /** Extra margin around the viewport for early mount / late unmount. Default 400 px. */
  rootMargin?: string;
  /** IntersectionObserver threshold. Default 0 (any pixel visible). */
  threshold?: number | number[];
  /**
   * If true, visibility flips apply the instant the IntersectionObserver
   * fires — no scroll-quiet debounce. Useful for components where the
   * pop-in cost is greater than the mount cost (eg pure CSS effects).
   * Default false so heavy WebGL / SVG-filter components only mount when
   * the user has stopped scrolling and intends to look at them.
   */
  immediate?: boolean;
};

/**
 * IntersectionObserver hook with scroll-quiet debouncing.
 *
 * Semantics:
 *  1. On mount, the IntersectionObserver fires once almost immediately. The
 *     first fire is applied to state INSTANTLY (no debounce) so the page's
 *     initial paint reflects the user's actual scroll position — eg Hero's
 *     MatrixRain mounts on first load without a 150 ms delay.
 *  2. Subsequent observer fires (caused by scrolling) update a `pending`
 *     ref but DO NOT touch React state. State is only flushed when the
 *     scroll-quiet bus tells us scrolling has been idle for QUIET_MS.
 *  3. During a long Lenis smooth-scroll (eg navbar Hero → Contact), the
 *     bus's debounce timer is continually reset by scroll events. No
 *     handlers fire. No mount/unmount. The scroll animates cleanly.
 *  4. When scroll settles, every consumer's pending state is flushed in a
 *     single tick. The destination section mounts what it needs; the
 *     pass-through sections never mount anything they didn't already have.
 */
export const useInViewport = <T extends Element>(
  ref: React.RefObject<T | null>,
  options?: UseInViewportOptions,
): boolean => {
  const rootMargin = options?.rootMargin ?? '400px';
  const threshold = options?.threshold ?? 0;
  const immediate = options?.immediate ?? false;

  const [inView, setInView] = React.useState(false);
  const pendingRef = React.useRef(false);
  const firstFireRef = React.useRef(true);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    firstFireRef.current = true;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        pendingRef.current = entry.isIntersecting;
        if (immediate || firstFireRef.current) {
          firstFireRef.current = false;
          setInView(entry.isIntersecting);
        }
      },
      { rootMargin, threshold },
    );
    obs.observe(el);

    let unsubscribe: (() => void) | undefined;
    if (!immediate) {
      unsubscribe = subscribeScrollQuiet(() => {
        setInView((prev) =>
          prev === pendingRef.current ? prev : pendingRef.current,
        );
      });
    }

    return () => {
      obs.disconnect();
      unsubscribe?.();
    };
  }, [ref, rootMargin, threshold, immediate]);

  return inView;
};

export default useInViewport;
