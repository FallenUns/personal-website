/**
 * Detects whether the current device + browser can afford the full
 * `<LiquidGlass>` shader (SVG `feDisplacementMap` chain + canvas-shader
 * displacement texture), or whether it should fall back to
 * `<LiquidGlassLite>` (backdrop-filter only).
 *
 * The decision is made ONCE per session at first access and cached for
 * the lifetime of the page so all LiquidGlass instances render the same
 * quality (no mixed heavy + lite on the same screen, no flicker on
 * re-render). It's deterministic given a (user-agent, hardware) pair.
 *
 * Heuristics that force `lite`:
 *   1. **Explicit override** via `?glass=lite` query param or
 *      `localStorage.glassQuality === 'lite'` — for testing or for users
 *      who notice fan-noise and want to opt out manually.
 *   2. **`prefers-reduced-motion: reduce`** — respects the OS hint that
 *      the user wants less compositing churn.
 *   3. **Safari / iOS browser engines**, including Chrome on iPad/iPhone
 *      (all iOS browsers use WebKit) and the "iPadOS pretending to be Mac"
 *      case detected via `maxTouchPoints > 1` on a UA that claims Mac.
 *      Safari's `feDisplacementMap` is CPU-bound and thermal headroom runs
 *      out fast.
 *   4. **`navigator.hardwareConcurrency < 4`** — fewer than 4 logical
 *      cores ≈ a low-end mobile or an older laptop. SVG filter chains
 *      compound across instances and chew main-thread budget.
 *   5. **`navigator.deviceMemory < 4`** (where exposed) — 4 GB cutoff
 *      below which Chrome on Android tends to GC-thrash with multiple
 *      backdrop-filter contexts.
 *   6. **WebGL unsupported** — the shader displacement map can't be
 *      generated, so heavy mode would only render the SVG filter chain
 *      anyway (less polished than the dedicated Lite design).
 *
 * Everything else gets `heavy`. Defaults to `heavy` if `window` isn't
 * available (SSR safety) — the client effect will correct it on hydration.
 */

export type GlassQuality = 'heavy' | 'lite';

const STORAGE_KEY = 'glassQuality';

let cached: GlassQuality | null = null;

const readOverride = (): GlassQuality | null => {
  if (typeof window === 'undefined') return null;
  try {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get('glass');
    if (q === 'heavy' || q === 'lite') {
      try {
        // Persist the override so a refresh keeps the choice without the
        // query string. Cleared by setting `?glass=auto`.
        window.localStorage.setItem(STORAGE_KEY, q);
      } catch {
        /* private mode — ignore */
      }
      return q;
    }
    if (q === 'auto') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return null;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'heavy' || stored === 'lite') return stored;
  } catch {
    /* localStorage blocked — ignore */
  }
  return null;
};

const supportsWebGL = (): boolean => {
  if (typeof document === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

const isIosLikeSafari = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  // Classic iPhone / iPad UAs.
  if (/iPhone|iPod/.test(ua)) return true;
  if (/iPad/.test(ua)) return true;
  // iPadOS 13+ identifies as Mac. Disambiguate by touch capability.
  if (/Macintosh/.test(ua) && (navigator.maxTouchPoints ?? 0) > 1) return true;
  return false;
};

const isDesktopSafari = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|Edg\//i.test(ua);
};

const detect = (): GlassQuality => {
  if (typeof window === 'undefined') return 'heavy';

  // 1. Explicit override wins.
  const override = readOverride();
  if (override) return override;

  // 2. Reduced motion preference.
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 'lite';
  } catch {
    /* matchMedia missing — skip */
  }

  // 3. Safari / iOS WebKit browsers.
  if (isIosLikeSafari() || isDesktopSafari()) return 'lite';

  // 4. Low core count.
  if ((navigator.hardwareConcurrency ?? 8) < 4) return 'lite';

  // 5. Low device memory (where reported).
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof mem === 'number' && mem < 4) return 'lite';

  // 6. No WebGL → heavy mode loses the shader-generated displacement
  //    map and only has the SVG filter chain, which is uglier than the
  //    dedicated Lite design. Prefer Lite in that case.
  if (!supportsWebGL()) return 'lite';

  return 'heavy';
};

/**
 * Resolve the LiquidGlass quality for this session. Synchronous, cached
 * after first call. Safe to call from render — does not allocate or
 * touch the DOM after the first call.
 */
export const getGlassQuality = (): GlassQuality => {
  if (cached !== null) return cached;
  cached = detect();
  return cached;
};

/**
 * For debugging — exposes the resolved value on `window` in dev mode so
 * you can inspect it from the console and tweak `?glass=...` to flip it.
 */
export const exposeGlassQualityForDebug = () => {
  if (typeof window === 'undefined') return;
  (window as unknown as { __glassQuality?: GlassQuality }).__glassQuality =
    getGlassQuality();
};
