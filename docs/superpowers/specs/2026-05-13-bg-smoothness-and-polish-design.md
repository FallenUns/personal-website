# Bg smoothness + saturation + name overlap polish

**Date:** 2026-05-13
**Status:** Approved (pending spec review)

## Context

After the section-aware background system shipped (SoftAurora base + DotGrid/LightRays/Particles overlay via IntersectionObserver + `AnimatePresence mode="wait"`), the user flagged five concrete complaints from the live site:

1. **Hero name overlapping.** "PATRICK ADRIANUS" wraps across two lines on most desktop widths and the descenders of "PATRICK" touch the ascenders of "ADRIANUS" — root cause is `.hero-display { line-height: 0.95 }` combined with `font-weight: 900` and the drop-shadow filter on `.name`, which puts the glyph ink outside the line box.
2. **Background reads grayish / washed out.** `<SoftAurora />` is rendered with default props inside a wrapper at `opacity: 0.55`. With the default cosine palette and the half-opacity wrapper, the visible chroma drops to a desaturated lavender that the user perceives as "no colour".
3. **Visible section seam between hero, the skills marquee, and Experience.** The fixed `SectionBackground` is continuous, but the user perceives a hard line at every section boundary. Two contributing factors: (a) the overlays pop in/out discretely instead of crossfading, so the visible bg character changes at the moment the IntersectionObserver flips `active`; (b) any opaque container in the section flow can hide the fixed bg behind it, breaking continuity.
4. **DotGrid "suddenly appears" when entering Experience.** The current `AnimatePresence mode="wait"` waits for the previous overlay to fully exit (opacity 0) before mounting the new one. The result is a binary on/off, not a crossfade.
5. **Bg transitions not smooth in general.** Same root cause as 4 — discrete IntersectionObserver triggers plus the `mode="wait"` exit-then-enter pattern produces a step function rather than a continuous slide.

The fix is a coordinated change-set targeting all five — one CSS tweak, one set of SoftAurora props + saturation filter, one scroll-driven overlay refactor that replaces the IntersectionObserver + AnimatePresence model with continuously-mapped opacities.

Reference patterns considered:
- **Linear (linear.app)** — single ambient bg with palette nudges per section, no swapping.
- **Stripe (stripe.com)** — overlapping scroll ranges drive opacity, multiple overlays can be partially visible during the handoff.
- **Vercel** — long crossfade durations (~800–1200ms of scroll travel), bgs never "snap".

We adopt the Stripe-style model (overlapping scroll ranges) because it lets us keep variety (each section has its own overlay) without sacrificing continuity.

## Goals

- Hero name renders on two lines without ink touching.
- Background colour reads vivid — recognisable violet/blue rather than gray.
- No visible "snap" between section bgs. Overlays fade in/out over ~50vh of scroll travel above and below their section.
- Multiple overlays can be partially visible simultaneously during a transition (e.g. tail of DotGrid + head of LightRays).
- No opaque section boxes hiding the fixed bg.
- Bg appears unified across hero → marquee → experience → projects → contact.

## Non-goals

- Removing the matrix rain (it stays clipped to the hero).
- Replacing SoftAurora with a different shader.
- Touching the loader, the HUD, or the decrypt animation.
- Refactoring section layout/HTML beyond removing any opaque background on the marquee/sections that block the fixed bg.

---

## Architecture

Three independent changes, all in existing files (no new files).

| Unit | Files | Purpose |
|------|-------|---------|
| Name typography fix | `src/index.css` | One CSS value: `.hero-display { line-height: 0.95 → 1.02 }`. Optional: extra `padding-bottom: 0.04em` on `.name` so drop-shadow doesn't get clipped by neighbouring elements. |
| Bg colour tune | `src/components/visuals/SectionBackground.tsx` | Pass tuned props to `<SoftAurora />`; raise base wrapper opacity 0.55 → 0.7; add `filter: saturate(1.35)` on the bg root div. |
| Scroll-driven crossfade refactor | `src/components/visuals/SectionBackground.tsx` (heavy rewrite of the overlay layer) + verification that hero section / SkillsMarquee / section containers have no opaque background colour. | Replace the IntersectionObserver + AnimatePresence + `active` state model with `useScroll({ target: document.documentElement })` and per-overlay `useTransform(scrollY, [in, plateau-start, plateau-end, out], [0, peak, peak, 0])`. All three overlays mount always, each rendered inside a `motion.div` whose `style.opacity` is its scroll-mapped value. |

The base SoftAurora layer still mounts unconditionally at the configured opacity — no logic change to the base.

### Why scroll-progress instead of IntersectionObserver

IntersectionObserver gives discrete state transitions: `active` is either `'experience'` or it isn't. Even with `AnimatePresence` smoothing, the trigger event is a step. Scroll-driven opacity is continuous — at any scroll position we know exactly how much of each section is in view, and we map that to a smooth opacity curve. Two overlays can have non-zero opacity at the same instant (the crossfade), which is exactly what `mode="wait"` prevents.

### Why the scroll range extends 50vh past each section

If an overlay's opacity went from 0 → peak exactly at the section boundary, the user would see the overlay snap on at the moment the section enters the viewport. By starting the fade-in 50vh _before_ the section enters and finishing the fade-out 50vh _after_ it leaves, the overlay has presence in the boundary regions where it crossfades with the neighbouring section's overlay.

### Why we keep the matrix rain separate

Matrix rain is hero-only (clipped to `#about` by virtue of being mounted inside that section). It is unaffected by this refactor. The SectionBackground sits behind it.

## Components & data flow

### 1. CSS tweak (`src/index.css`)

Find the existing `.hero-display` block (currently `line-height: 0.95`). Change to `line-height: 1.02`. Add `padding-bottom: 0.04em;` to `.hero-display .name` so the drop-shadow has clearance from the next block element. No other changes.

### 2. SoftAurora props + saturation (`SectionBackground.tsx`)

The current base block:

```tsx
<div style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
  <SoftAurora />
</div>
```

Becomes:

```tsx
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
```

The hex pair (`#6b46c1` rich violet, `#3b82f6` rich blue) gives a recognisable purple↔blue band. `brightness=1.2` lifts the mid-tones. `colorSpeed=0.6` slows the natural cosine cycle so the palette stays in the violet/blue family rather than drifting through full chroma rotations.

### 3. Scroll-driven overlay layer (`SectionBackground.tsx`)

The current `OVERLAYS` map + IntersectionObserver + AnimatePresence is replaced with three always-mounted `motion.div` layers, each with its own `useTransform` driving opacity from `window` scroll position.

```tsx
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import SoftAurora from './SoftAurora/SoftAurora';
import DotGrid from './DotGrid/DotGrid';
import LightRays from './LightRays/LightRays';
import Particles from './Particles/Particles';

type SectionId = 'experience' | 'projects' | 'contact';

interface Range {
  fadeInStart: number; // px
  plateauStart: number;
  plateauEnd: number;
  fadeOutEnd: number;
}

const PEAK_OPACITY = 0.35;

/** Reads the live geometry of each overlay's section, returns scroll-px stops. */
const useSectionRange = (id: SectionId, viewport: number): Range | null => {
  const [range, setRange] = useState<Range | null>(null);
  useEffect(() => {
    const compute = () => {
      const el = document.getElementById(id);
      if (!el) { setRange(null); return; }
      const top = el.offsetTop;
      const height = el.offsetHeight;
      // 50vh feather on each side so the overlay crossfades with neighbours.
      const feather = viewport * 0.5;
      setRange({
        fadeInStart: top - feather,
        plateauStart: top,
        plateauEnd: top + height,
        fadeOutEnd: top + height + feather,
      });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(document.body);
    window.addEventListener('resize', compute);
    return () => { ro.disconnect(); window.removeEventListener('resize', compute); };
  }, [id, viewport]);
  return range;
};

const Overlay: React.FC<{ id: SectionId; viewport: number; scrollY: MotionValue<number>; children: React.ReactNode }> =
  ({ id, viewport, scrollY, children }) => {
    const range = useSectionRange(id, viewport);
    // Default flat range when section not yet measured — opacity stays 0.
    const safe = range ?? { fadeInStart: 0, plateauStart: 0, plateauEnd: 0, fadeOutEnd: 0 };
    const opacity = useTransform(
      scrollY,
      [safe.fadeInStart, safe.plateauStart, safe.plateauEnd, safe.fadeOutEnd],
      [0, PEAK_OPACITY, PEAK_OPACITY, 0]
    );
    return (
      <motion.div
        style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}
      >
        {children}
      </motion.div>
    );
  };

const SectionBackground: React.FC = () => {
  const { scrollY } = useScroll();
  const [viewport, setViewport] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  useEffect(() => {
    const onResize = () => setViewport(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
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

Imports drop `AnimatePresence`; add `useScroll`, `useTransform`, `type MotionValue`.

### 4. Section transparency audit

Two checks in the codebase (no edits unless an opaque bg is found):

```
grep -rnE "background-color|bg-(black|slate|gray|neutral|zinc|stone)\b" src/components/HeroSection.tsx src/components/SkillsMarquee.tsx src/components/ExperienceSection.tsx src/components/ProjectsSection.tsx src/components/Contact.tsx
```

Anything that ends up painting a solid background over the fixed bg gets removed (only if the change keeps text contrast adequate — when in doubt, leave a `bg-black/20` or similar low-alpha shade instead of fully removing).

## Files added / modified

| File | Disposition |
|------|-------------|
| `src/index.css` | Modify: `.hero-display` line-height + `.name` padding-bottom. |
| `src/components/visuals/SectionBackground.tsx` | Rewrite the overlay layer: scroll-driven opacity, always-mounted overlays. SoftAurora wrapper gets new opacity + filter + props. |
| `src/components/SkillsMarquee.tsx` / `HeroSection.tsx` / `ExperienceSection.tsx` / `ProjectsSection.tsx` / `Contact.tsx` | Modify ONLY if an opaque background utility is found that blocks the fixed bg. The audit step decides per-file. |

No new files, no new dependencies.

## Error handling & edge cases

- **Section element not in DOM** (mounted late): `useSectionRange` returns `null`, opacity stays at 0 forever for that overlay until the section appears. The `ResizeObserver` on `document.body` re-runs the measure, picking up the late-mounted section.
- **Viewport resize**: `useSectionRange` recomputes on `resize` + `ResizeObserver` (body height changes when fonts load or content reflows). Smooth bg keeps working at any viewport.
- **Very short sections** (sectionHeight < viewport): the scroll range becomes `[top - 0.5vh, top, top + height, top + height + 0.5vh]` — still works, just a shorter plateau.
- **`prefers-reduced-motion`**: SoftAurora and the four react-bits overlays expose varying motion props. For this pass we accept their default motion (none of them have aggressive animation that would warrant gating). Future cleanup can wrap each overlay in a reduced-motion gate.

## Testing & verification

Visual via Claude in Chrome MCP. After implementation:

1. **Name no longer overlaps**: load page, capture `getBoundingClientRect()` of the two visible char spans on each line. The bottom of the last char on line 1 should be at least 4px above the top of the first char on line 2.
2. **Saturation reads richer**: take a `preview_screenshot`, eyeball the hero. The bg should show recognisable violet→blue gradient bands, not gray.
3. **Scroll-driven crossfade**: scroll from About → Experience slowly. The DotGrid `<canvas>`/DOM overlay's `style.opacity` (sampled via JS) should pass through 0 → 0.35 progressively, not snap.
4. **Two overlays partially visible simultaneously**: at the boundary between Experience and Projects, both DotGrid and LightRays should have opacity > 0 at the same instant (e.g. 0.18 and 0.12 mid-crossfade).
5. **No visible seam at section boundaries**: capture screenshots at the join between HeroSection and SkillsMarquee. The fixed bg should be continuous; no horizontal band of different colour.
6. **`npx tsc --noEmit -p tsconfig.json`** clean.

## Out of scope

- Reduced-motion gates per overlay.
- Performance pass on running 4 always-mounted shaders simultaneously — observed CPU/GPU cost during smoke test will inform if a follow-up is needed.
- Replacing SoftAurora with a different bg shader.
- The pre-existing loader-stall bug (4/8 components never complete) — separate spec.
