# Bg smoothness + saturation + name polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix hero name overlap, saturate the background, and replace the discrete IntersectionObserver + AnimatePresence overlay system with a scroll-driven crossfade so section bgs blend continuously instead of popping.

**Architecture:** Three independent edits. (1) CSS: one line-height value in `.hero-display` + a hairline padding-bottom on `.name` so the drop-shadow has clearance. (2) `SectionBackground.tsx`: pass tuned props to `SoftAurora`, raise the base wrapper opacity, add a `filter: saturate(1.35)` so the violet/blue palette actually reads. (3) `SectionBackground.tsx`: rewrite the overlay layer — drop IntersectionObserver + AnimatePresence + `active` state; mount all three overlays unconditionally; each renders inside a `motion.div` whose `opacity` is `useTransform(scrollY, [in, plateau-start, plateau-end, out], [0, 0.35, 0.35, 0])` with a 50vh feather on both sides of the section so neighbouring overlays crossfade through the boundary.

**Tech Stack:** React 18 + TypeScript + Vite + framer-motion (`useScroll` + `useTransform`) + Tailwind. No new dependencies. No test framework — verification is `npx tsc --noEmit -p tsconfig.json` plus Claude in Chrome MCP smoke checks.

**Spec:** [`docs/superpowers/specs/2026-05-13-bg-smoothness-and-polish-design.md`](../specs/2026-05-13-bg-smoothness-and-polish-design.md)

---

## File map

| File | Disposition | Purpose |
|------|-------------|---------|
| `src/index.css` | Modify | `.hero-display` line-height 0.95 → 1.02; add `.hero-display .name { padding-bottom: 0.04em }`. |
| `src/components/visuals/SectionBackground.tsx` | Rewrite | New scroll-driven overlay model + tuned SoftAurora props + saturation filter on base wrapper. |

Section component files (`HeroSection.tsx`, `SkillsMarquee.tsx`, `ExperienceSection.tsx`, `ProjectsSection.tsx`, `Contact.tsx`) were audited pre-plan via `grep` for full-section opaque backgrounds. None found — only decorative inner elements use `bg-white/*` etc. No section-component edits required.

---

## Task 1: Hero name line-height fix

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Bump the hero-display line-height**

Open `src/index.css`. Find the `.hero-display` rule (it sits around line 243; identified by the comment block `/* Hero h1: oversized fluid type. … */`).

Change:

```css
.hero-display {
  font-family: 'Archivo', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(2.75rem, 7.4vw, 6.25rem);
  line-height: 0.95;
  letter-spacing: -0.045em;
  text-wrap: balance;
}
```

to:

```css
.hero-display {
  font-family: 'Archivo', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(2.75rem, 7.4vw, 6.25rem);
  line-height: 1.02;
  letter-spacing: -0.045em;
  text-wrap: balance;
}
```

The only material change is `line-height: 0.95 → 1.02`.

- [ ] **Step 2: Add hairline padding-bottom to `.hero-display .name`**

Still in `src/index.css`. Find the existing `.hero-display .name` rule. Add ONE new line at the end of its block (before the closing `}`):

```css
  padding-bottom: 0.04em;
```

The block now ends with this property included. This gives the drop-shadow filter clearance from neighbouring text so the bottom of "ADRIANUS" can't get clipped by the subtitle row beneath.

Do NOT modify any other property of `.hero-display .name`.

- [ ] **Step 3: Typecheck**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: zero output. CSS changes don't affect typecheck; this is a sanity check that nothing else regressed.

- [ ] **Step 4: Commit**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && git add src/index.css && git commit -m "fix(hero): bump display line-height to 1.02 so name letters stop touching"
```

Stage only `src/index.css`.

---

## Task 2: SectionBackground rewrite — saturated SoftAurora + scroll-driven crossfade

**Files:**
- Modify: `src/components/visuals/SectionBackground.tsx`

This single rewrite handles all four remaining fixes from the spec: saturated bg, scroll-driven crossfade, no overlay pop-in, no section-boundary seam.

- [ ] **Step 1: Replace the entire file contents**

Replace the ENTIRE contents of `src/components/visuals/SectionBackground.tsx` with the code block below. This is a full rewrite — no edit-in-place — because the imports, the overlay model, and the SoftAurora wrapper all change.

```tsx
// src/components/visuals/SectionBackground.tsx
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import SoftAurora from './SoftAurora/SoftAurora';
import DotGrid from './DotGrid/DotGrid';
import LightRays from './LightRays/LightRays';
import Particles from './Particles/Particles';

/**
 * Section-aware background — scroll-driven crossfade.
 *
 * Replaces the previous IntersectionObserver + AnimatePresence(mode="wait")
 * design, which produced discrete state changes the user perceived as
 * "pop-in" between sections. Now:
 *
 *   1. SoftAurora is rendered always at opacity 0.7 with a saturate(1.35)
 *      filter on the wrapper. Tuned props give a recognisable violet/blue
 *      palette instead of the washed gray it landed at by default.
 *   2. All three overlays (DotGrid, LightRays, Particles) mount once and
 *      stay mounted. Each is wrapped in a motion.div whose `opacity` is a
 *      useTransform reading window scrollY against the overlay's section
 *      geometry — fading in 50vh before the section enters the viewport and
 *      out 50vh after it leaves, with a plateau of `PEAK_OPACITY` while the
 *      section is on screen.
 *
 * Two overlays can have non-zero opacity at the same instant, giving a
 * smooth Stripe-style crossfade across boundaries.
 */

type SectionId = 'experience' | 'projects' | 'contact';

interface Range {
  fadeInStart: number;
  plateauStart: number;
  plateauEnd: number;
  fadeOutEnd: number;
}

const PEAK_OPACITY = 0.35;
const FEATHER_FRACTION = 0.5; // 50% of viewport height on each side

const useSectionRange = (id: SectionId, viewport: number): Range | null => {
  const [range, setRange] = useState<Range | null>(null);

  useEffect(() => {
    const compute = () => {
      const el = document.getElementById(id);
      if (!el) {
        setRange(null);
        return;
      }
      const top = el.offsetTop;
      const height = el.offsetHeight;
      const feather = viewport * FEATHER_FRACTION;
      setRange({
        fadeInStart: top - feather,
        plateauStart: top,
        plateauEnd: top + height,
        fadeOutEnd: top + height + feather,
      });
    };
    compute();
    // Recompute when the page reflows (fonts loaded, content mounted, etc.).
    const ro = new ResizeObserver(compute);
    ro.observe(document.body);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [id, viewport]);

  return range;
};

interface OverlayProps {
  id: SectionId;
  viewport: number;
  scrollY: MotionValue<number>;
  children: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ id, viewport, scrollY, children }) => {
  const range = useSectionRange(id, viewport);
  // When the section hasn't been measured yet (mount race), keep opacity at 0
  // by feeding a degenerate zero-width range that never matches the scroll
  // position. The ResizeObserver in useSectionRange will recompute soon.
  const safe = range ?? {
    fadeInStart: 0,
    plateauStart: 0,
    plateauEnd: 0,
    fadeOutEnd: 0,
  };
  const opacity = useTransform(
    scrollY,
    [safe.fadeInStart, safe.plateauStart, safe.plateauEnd, safe.fadeOutEnd],
    [0, PEAK_OPACITY, PEAK_OPACITY, 0]
  );
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        pointerEvents: 'none',
      }}
    >
      {children}
    </motion.div>
  );
};

const SectionBackground: React.FC = () => {
  const { scrollY } = useScroll();
  const [viewport, setViewport] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  useEffect(() => {
    const onResize = () => setViewport(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Base layer — always visible. Saturated wrapper + tuned palette so
          the bg reads as violet/blue rather than gray. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.7,
          filter: 'saturate(1.35)',
        }}
      >
        <SoftAurora
          brightness={1.2}
          colorSpeed={0.6}
          color1="#6b46c1"
          color2="#3b82f6"
        />
      </div>

      <Overlay id="experience" viewport={viewport} scrollY={scrollY}>
        <DotGrid />
      </Overlay>
      <Overlay id="projects" viewport={viewport} scrollY={scrollY}>
        <LightRays />
      </Overlay>
      <Overlay id="contact" viewport={viewport} scrollY={scrollY}>
        <Particles />
      </Overlay>
    </div>
  );
};

export default SectionBackground;
```

NOTE: If TypeScript complains that `SoftAurora`'s prop types don't accept `color1` / `color2` / `colorSpeed` / `brightness` (unlikely — the registry shows those props exist), the fix is to cast: change `<SoftAurora brightness={1.2} … />` to `{React.createElement(SoftAurora as React.ComponentType<Record<string, unknown>>, { brightness: 1.2, colorSpeed: 0.6, color1: '#6b46c1', color2: '#3b82f6' })}` — but only use this fallback if direct prop passing fails the typecheck.

- [ ] **Step 2: Typecheck**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: zero output. If you see errors about `SoftAurora` props not matching, apply the cast fallback described in Step 1's note.

- [ ] **Step 3: Quick lint sanity (no unused imports left over from old version)**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && grep -nE "AnimatePresence" src/components/visuals/SectionBackground.tsx
```

Expected: no matches. The old AnimatePresence import must be gone — the new file doesn't use it.

- [ ] **Step 4: Commit**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && git add src/components/visuals/SectionBackground.tsx && git commit -m "feat(visuals): scroll-driven bg crossfade + saturated SoftAurora palette"
```

Stage only `src/components/visuals/SectionBackground.tsx`.

---

## Task 3: Live smoke verification via Claude in Chrome MCP

No code changes — this task verifies the bg system behaves as designed against the running dev server.

- [ ] **Step 1: Confirm dev server is up**

If not already running:

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npm run dev
```

Expected URL: `http://localhost:5173`.

- [ ] **Step 2: Hero name no longer overlaps**

In the browser (or via the MCP `javascript_tool`), run:

```js
(() => {
  const wrap = document.querySelector('.hero-display .name');
  if (!wrap) return 'no-name';
  const spans = wrap.querySelectorAll('span > span');
  if (spans.length < 2) return { found: spans.length };
  // Sample the first char and the last char's bounding boxes.
  const firstRect = spans[0].getBoundingClientRect();
  const lastRect = spans[spans.length - 1].getBoundingClientRect();
  // If the text wraps, lastRect.top should sit below firstRect.bottom with a positive gap.
  return {
    firstBottom: firstRect.bottom,
    lastTop: lastRect.top,
    wraps: lastRect.top > firstRect.bottom,
    gapPx: lastRect.top - firstRect.bottom,
  };
})()
```

Expected: if `wraps === true`, `gapPx >= 4`. (If the name fits on a single line at the test viewport width, the check returns `wraps: false` and there's nothing to verify — that's fine.)

- [ ] **Step 3: Bg colour reads vivid**

```js
(() => {
  const bg = document.querySelector('[aria-hidden="true"][style*="z-index: 0"][style*="position: fixed"]');
  if (!bg) return 'no-bg';
  const base = bg.firstElementChild;
  if (!base) return 'no-base';
  const cs = getComputedStyle(base);
  return {
    opacity: cs.opacity,
    filter: cs.filter,
    canvasInside: !!base.querySelector('canvas'),
  };
})()
```

Expected: `opacity` ≈ `"0.7"`, `filter` contains `saturate(1.35)`, `canvasInside: true`.

- [ ] **Step 4: Overlay opacities crossfade continuously**

```js
(async () => {
  const samples = [];
  // Sample at four scroll positions: hero, between hero & experience, mid-experience, between experience & projects.
  const positions = [0, window.innerHeight * 0.6, window.innerHeight * 1.1, window.innerHeight * 1.6];
  for (const y of positions) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 350));
    const bg = document.querySelector('[aria-hidden="true"][style*="z-index: 0"][style*="position: fixed"]');
    if (!bg) { samples.push({ y, err: 'no-bg' }); continue; }
    // Three overlay motion.divs are the 2nd, 3rd, 4th children of bg (after base).
    const children = Array.from(bg.children).slice(1);
    samples.push({
      y,
      overlays: children.map((c, i) => ({
        idx: i,
        opacity: parseFloat(getComputedStyle(c).opacity),
      })),
    });
  }
  return samples;
})()
```

Expected: at the boundary positions, multiple overlays should have `0 < opacity < PEAK_OPACITY` simultaneously (at least one position should show two overlays both non-zero). At the deep-in-hero position (`y: 0`), all three overlays should be near `0`.

NOTE: if the page has Lenis smooth-scroll intercepting `window.scrollTo`, the imperative scroll may not register against `useScroll()`. If the samples look static, fall back to a manual scroll via the trackpad while watching the dev server — the verification is qualitative ("multiple overlays partially visible during crossfade"), not numerically precise.

- [ ] **Step 5: TypeScript final sanity**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: zero output.

- [ ] **Step 6: No commit for verification**

If all four smoke checks pass, the feature is complete. If any fails, file the issue and dispatch a fix subagent.

---

## End-to-end verification

After Task 3 passes:

1. Hard-reload `http://localhost:5173`. Loader finishes (or be aware it may stall — that's a pre-existing unrelated bug; the bg behaviour here is verified independently by forcing visibility via JS if needed).
2. **Hero name is on two lines with breathing room** between PATRICK and ADRIANUS.
3. **Background reads as recognisable violet/blue**, not washed gray. Saturation is visibly stronger than before the change.
4. **Scrolling slowly between sections shows continuous crossfade** — no overlay snaps on; old overlay fades down while new overlay fades up; both can be partially visible mid-transition.
5. **No visible horizontal seam** at section boundaries — the fixed bg is continuous across the entire scroll height.
6. **Liquid-glass cards still refract** the bg with the same chromatic-aberration rim they had before.

If all six hold, the spec is satisfied.

---

## Out of scope

- Reduced-motion gates per overlay (acknowledged in spec).
- Performance pass on four always-mounted shaders (will be informed by smoke-test CPU/GPU observation; follow-up if needed).
- Loader stall investigation.
- Component-level audit of liquid-glass props for any saturation interaction with the new bg.
