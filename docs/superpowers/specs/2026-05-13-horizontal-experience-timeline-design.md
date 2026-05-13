# Horizontal scroll-driven Experience timeline

**Date:** 2026-05-13
**Status:** Approved (pending spec review)

## Context

The current Experience section is a vertical alternating-card timeline with a green rail down the centre. The user wants a horizontal timeline that "showcases" the years (2022 / 2024 / 2025) with animated year transitions — recommending **option A** from the brainstorm: a sticky-section with cards that pan horizontally driven by vertical scroll progress, and a `RotatingText` year billboard that swaps to the year of whichever card is centred.

Reference patterns considered:
- **Apple product pages** (AirPods Pro, iPhone) — sticky section + scrolljacked horizontal slide.
- **Linear** intro / Stripe Sessions — single sticky viewport, content panned by scrollYProgress.
- **Awwwards portfolios** — large year/section markers that stay put while content slides past.

The user picked option A because it's the most cinematic: the YEAR stays huge and bold while the experience cards fly through. RotatingText animates each year change with the same character spring used elsewhere on the site.

## Goals

- Single-viewport-tall Experience section that "locks" while the user scrolls — content moves horizontally instead of the page scrolling further.
- Year billboard in the centre/upper area, animated via RotatingText, swaps when the centred card crosses into a new year.
- Cards retain all current content (role, company, period, location, skills, highlights, photos), just laid out horizontally.
- Click on a card → existing ExperienceDetail modal (no change to detail experience).
- Smooth crossfade when years change, not a hard snap.
- Works on desktop. On mobile (< 768px) falls back to the existing vertical layout (sticky-section + horizontal pan is bad UX on touch).

## Non-goals

- Replacing the `ExperienceDetail` modal (still triggered the same way).
- Changing the data shape (`experiences.ts` stays as-is).
- Adding new years that don't have data (skip empty years — 2023 has no experience and is not shown).
- Touching `SectionBackground` / `StickySectionBackground` (the DotGrid overlay still runs in the Experience section).

---

## Architecture

One file rewrite + one CSS additions block + one mobile fallback gate.

| Unit | Files | Purpose |
|------|-------|---------|
| **HorizontalExperienceTimeline** (new logic, same file) | `src/components/ExperienceSection.tsx` (heavy rewrite of the desktop layout) | The sticky-section scrolljack. Uses `useScroll({ target, offset: ['start start', 'end end'] })` to read scroll progress through the section, then `useTransform` maps progress to `x: translatePx` on the inner cards rail. Year billboard subscribes to `useMotionValueEvent` on the same x and pulls the current year from a precomputed `cardCenters` array. |
| **YearBillboard** (new sub-component inside `ExperienceSection.tsx`) | Same file | Wraps `RotatingText` with `texts={['2022', '2024', '2025']}` controlled imperatively (not auto). Calls `ref.jumpTo(idx)` whenever the active year index changes. |
| **Mobile fallback** | Same file | A `useMediaQuery` (or `window.matchMedia('(max-width: 767px)')` + state) gates the new horizontal layout. On narrow viewports, render the existing vertical layout. |
| **CSS additions** | `src/components/ExperienceSection.css` (or section-scoped inline) | Hide native scrollbars during the section; ensure the section has explicit `height` for scrolljack to compute against; tune card widths for the horizontal track. |

### Why scroll-driven instead of scroll-snap

Scroll-snap is the lazy version — fixed CSS snap points jolt between cards. Scroll-driven (`useScroll` + `useTransform`) gives us a smooth continuous pan, lets the year billboard interpolate between cards, and unifies with the rest of the site's `framer-motion` model.

### Section height math

For N cards, the section needs `height: (N + 1) * 100vh` so the user has enough vertical scroll travel to pan through all cards horizontally. With 3 cards: `400vh`. As user scrolls from `0%` to `100%` of the section, `cardsRail.x` interpolates from `0` to `-(N - 1) * cardSlotWidth`.

The inner sticky container is `position: sticky; top: 0; height: 100vh; overflow: hidden`. The cards rail inside sticky is `display: flex; gap: 32px; width: max-content; will-change: transform`.

### Year resolution

`cardCenters` is an array of `{ year: number, progressAt: number }` — the scrollYProgress value at which each card sits dead-centre of the viewport. Computed at mount from the sorted experiences. As scrollYProgress moves, we find the nearest `progressAt` and use its `year` for the billboard. RotatingText's imperative `jumpTo` keeps the animation crisp.

## Components & data flow

### 1. Sorted years list

At module scope, near the top of `ExperienceSection.tsx`:

```ts
import { experiences } from '../data/experiences';
// Sort ascending by start date; dedupe years; produce ['2022', '2024', '2025'].
const sortedExps = [...experiences].sort((a, b) => {
  const da = a.start.year * 12 + a.start.month;
  const db = b.start.year * 12 + b.start.month;
  return da - db;
});
const yearLabels = Array.from(new Set(sortedExps.map((e) => String(e.start.year))));
```

### 2. Hook to detect mobile

```ts
const useIsHorizontalEnabled = () => {
  const [enabled, setEnabled] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 768px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setEnabled(mq.matches);
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);
  return enabled;
};
```

### 3. Horizontal track layout

Within `ExperienceSection`:

```tsx
const sectionRef = useRef<HTMLElement>(null);
const isHorizontal = useIsHorizontalEnabled();
const { scrollYProgress } = useScroll({
  target: sectionRef,
  offset: ['start start', 'end end'],
});

// Slot width — card + gap, computed from CSS or fixed at 720px.
const SLOT = 720;
const GAP = 32;
const trackWidth = sortedExps.length * (SLOT + GAP);
const xMax = -(trackWidth - window.innerWidth + GAP);
const trackX = useTransform(scrollYProgress, [0, 1], [0, xMax]);

return (
  <section
    ref={sectionRef}
    id="experience"
    className="relative w-full"
    style={{
      // (N+1) viewport-heights so the rail has scroll travel.
      height: `${(sortedExps.length + 1) * 100}vh`,
    }}
  >
    {isHorizontal ? (
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col">
        {/* Year billboard top-centre */}
        <YearBillboard
          yearLabels={yearLabels}
          scrollYProgress={scrollYProgress}
          cardCenters={cardCenters}
        />
        {/* Horizontal cards rail */}
        <motion.div
          className="flex gap-8 items-center px-[10vw] flex-1"
          style={{ x: trackX, width: 'max-content', willChange: 'transform' }}
        >
          {sortedExps.map((exp, i) => (
            <ExperienceCard key={exp.id} exp={exp} index={i} onClick={() => setViewedExp(exp)} />
          ))}
        </motion.div>
        {/* Progress indicator: thin horizontal bar at the bottom */}
        <ProgressBar progress={scrollYProgress} />
      </div>
    ) : (
      <VerticalExperienceTimeline /* current layout, extracted */ />
    )}
  </section>
);
```

### 4. YearBillboard component

```tsx
const YearBillboard: React.FC<{
  yearLabels: string[];
  scrollYProgress: MotionValue<number>;
  cardCenters: number[]; // scroll-progress at which each card is centred
}> = ({ yearLabels, scrollYProgress, cardCenters }) => {
  const rotatingRef = useRef<RotatingTextRef>(null);
  const lastIdxRef = useRef(0);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    // Find the card centre closest to current progress.
    let nearest = 0;
    let dist = Infinity;
    cardCenters.forEach((c, i) => {
      const d = Math.abs(c - v);
      if (d < dist) { dist = d; nearest = i; }
    });
    // Map card idx → year label idx.
    const yearIdx = yearLabels.indexOf(String(sortedExps[nearest].start.year));
    if (yearIdx !== -1 && yearIdx !== lastIdxRef.current) {
      lastIdxRef.current = yearIdx;
      rotatingRef.current?.jumpTo(yearIdx);
    }
  });

  return (
    <div className="flex items-baseline gap-4 pt-12 pl-12">
      <span className="text-white/55 text-xs uppercase tracking-[0.3em]">Where I've worked</span>
      <RotatingText
        ref={rotatingRef}
        texts={yearLabels}
        auto={false}
        loop={false}
        rotationInterval={999999}
        staggerDuration={0.04}
        staggerFrom="last"
        splitBy="characters"
        mainClassName="text-[18vw] leading-none font-black tracking-tight text-white"
        splitLevelClassName="overflow-hidden"
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        initial={{ y: '110%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '-110%', opacity: 0 }}
      />
    </div>
  );
};
```

`cardCenters` is computed inside `ExperienceSection`:

```ts
const cardCenters = useMemo(() => {
  // For each card index i, the scroll progress at which it's centred.
  // The track moves from 0 to xMax across progress 0→1; card i is centred
  // when track.x = -(i * (SLOT + GAP)) + viewportCenter offset.
  if (sortedExps.length === 0) return [];
  const total = sortedExps.length;
  // Distribute centres evenly across [0, 1]. Simple: centres = (i + 0.5) / total.
  return sortedExps.map((_, i) => (i + 0.5) / total);
}, []);
```

(Even distribution is fine because the rail is linear w.r.t. progress.)

### 5. ProgressBar component

Small UI sugar — a thin horizontal bar at the bottom of the sticky container shows scroll progress through the section. `style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}` on a 1px-tall `motion.div`.

### 6. ExperienceCard restyle

The existing card content (role / company / period / skills / etc.) stays inside LiquidGlass. Width: 720px desktop. Height: ~80% of viewport. Tap target: entire card → `onViewDetails` opens the existing `ExperienceDetail` modal.

We keep the existing card visual treatment (LiquidGlass + hover lift). Only the parent layout changes from "alternating column" to "flex row".

## Files added / modified

| File | Disposition |
|------|-------------|
| `src/components/ExperienceSection.tsx` | Major rewrite. New `useScroll` / `useTransform` for the horizontal pan. New `YearBillboard` sub-component. Extracts existing layout into a `VerticalExperienceTimeline` (or inline mobile branch) for the mobile fallback. |
| `src/components/animations/RotatingText.tsx` | No changes — already supports `ref` + `jumpTo`. |
| `src/data/experiences.ts` | No changes. |
| `src/components/ExperienceDetail.tsx` | No changes (still triggered by `onClick` on cards). |
| `src/components/visuals/SectionBackground.tsx` | No changes (DotGrid overlay still renders in this section). |

No new dependencies.

## Error handling & edge cases

- **One experience only**: `xMax` becomes 0, the rail doesn't move; the year billboard shows the single year. Section height collapses to `200vh` (one card + buffer). Acceptable.
- **Window resize**: `xMax` and `trackWidth` recompute on a `useEffect` that listens to `resize`. `useTransform` re-derives automatically since `scrollYProgress` is unchanged.
- **`prefers-reduced-motion`**: the scrolljack is contemplative, not disorienting, but to be safe we gate it behind `prefers-reduced-motion: no-preference`. If reduced motion is requested, fall back to the vertical layout regardless of viewport width.
- **Mobile**: `< 768px` always uses the vertical layout. Tested via `matchMedia` with live listener.
- **Lenis smooth scroll**: framer-motion's `useScroll` listens to native scroll events, which Lenis dispatches. Compatible — no shim needed.
- **`ExperienceDetail` modal opening during scrolljack**: clicking a card sets `viewedExp` and the existing modal opens. The sticky section continues to be styled but the modal sits above it (z-index 100). Closing the modal returns the user to the same scroll position.

## Testing & verification

Browser-rendered visual via Claude in Chrome MCP after implementation:

1. **Desktop layout swap**: load page, scroll into Experience section. Capture `scrollYProgress` sampled values + the rail's `x` style. Expect monotonic decreasing x.
2. **Year billboard updates**: scroll slowly through the section, sample the billboard's rendered text at multiple points. Expect it to change from "2022" → "2024" → "2025" as cards cross the centre.
3. **RotatingText animation**: confirm the year billboard's character spring fires on each year change (visual inspection of in-between frames showing characters mid-stagger).
4. **Click → modal**: click a card while scrolljack is active. Expect `ExperienceDetail` to open. Close → expect scroll position preserved.
5. **Mobile fallback**: resize browser to 600px width. Expect the existing vertical layout to render. Resize back to 1200px → horizontal layout returns.
6. **Reduced motion**: enable macOS *Reduce Motion* → vertical layout renders regardless of width.
7. **`npx tsc --noEmit -p tsconfig.json`** clean.

## Out of scope

- Restyling individual ExperienceCard internals (badges, skill chips, etc.) — only the parent layout changes.
- Adding a 2023 placeholder card (skip-empty-years approach chosen during brainstorm).
- Keyboard shortcuts (arrow keys to jump between cards) — separate spec if desired.
- Touch swipe gestures on tablet (768–1023px) — current spec uses scrolljack for ≥768px; revisit if user reports swipe friction on iPad.
