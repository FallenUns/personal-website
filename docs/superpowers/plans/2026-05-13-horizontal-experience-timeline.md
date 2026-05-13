# Horizontal Experience Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the Experience section into a sticky-section scrolljack where cards pan horizontally as the user scrolls vertically, with a giant `RotatingText` year billboard that swaps to the year of whichever card is centred. Mobile + reduced-motion fall back to the existing vertical layout.

**Architecture:** Single file rewrite (`ExperienceSection.tsx`). Section height becomes `(N+1) × 100vh` so there's enough vertical scroll travel. Inside, a `position: sticky; top: 0; height: 100vh` container locks the viewport during the section. `useScroll({ target, offset: ['start start','end end'] })` returns `scrollYProgress`; `useTransform` maps that to `x` on a `flex` rail of cards. `useMotionValueEvent` on the same progress finds the nearest card centre and calls `rotatingRef.jumpTo(yearIdx)` so the billboard updates. A `useIsHorizontalEnabled` hook gates the new layout behind `matches('(min-width: 768px)')` AND `prefers-reduced-motion: no-preference`.

**Tech Stack:** React 18 + TypeScript + Vite + framer-motion (`useScroll`, `useTransform`, `useMotionValueEvent`) + Tailwind + existing `RotatingText` ref API. No new dependencies. Verification is `npx tsc --noEmit -p tsconfig.json` + Claude in Chrome MCP smoke checks.

**Spec:** [`docs/superpowers/specs/2026-05-13-horizontal-experience-timeline-design.md`](../specs/2026-05-13-horizontal-experience-timeline-design.md)

---

## File map

| File | Disposition | Purpose |
|------|-------------|---------|
| `src/components/ExperienceSection.tsx` | Heavy modify (all tasks land here) | Add `useIsHorizontalEnabled` hook, `sortedExps` + `yearLabels` module constants, `YearBillboard` sub-component, the horizontal rail JSX, the desktop/mobile branch in render. Existing sub-components (`Tag`, `AnimatedCounter`, `ExperienceItem`) stay intact and feed the new horizontal rail. |
| `src/components/animations/RotatingText.tsx` | No change | Already exports `RotatingTextRef` with `jumpTo(index)`. |
| `src/data/experiences.ts` | No change | |
| `src/components/ExperienceDetail.tsx` | No change | Triggered by the same `onViewDetails` callback. |

Existing module-scope state in `ExperienceSection.tsx` that we keep: `Tag`, `AnimatedCounter`, `TimelineProgress`, `ExperienceItem` (the vertical card body, reused as the horizontal card body).

---

## Task 1: Module-scope foundation — sorted years + responsive hook

**Files:**
- Modify: `src/components/ExperienceSection.tsx`

- [ ] **Step 1: Add the imports framer-motion will need**

Find the existing framer-motion import line (around line 3):

```ts
import { motion, useInView } from 'framer-motion';
```

Replace with:

```ts
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion';
```

Also add right under the framer-motion import:

```ts
import RotatingText, { type RotatingTextRef } from './animations/RotatingText';
```

(`RotatingText` is the default export at `src/components/animations/RotatingText.tsx`; `RotatingTextRef` is its named export.)

- [ ] **Step 2: Add module-scope sorted experiences + year labels**

Find the existing block:

```ts
import {
  experiences,
  formatPeriod,
  diffMonths
} from '../data/experiences';
```

Immediately AFTER the closing `}` and the type-only import that follows it, add:

```ts
// Module-scope: sort experiences chronologically (earliest first) and dedupe
// the year labels for the YearBillboard. Stable across renders.
const sortedExps = [...experiences].sort((a, b) => {
  const da = a.start.year * 12 + a.start.month;
  const db = b.start.year * 12 + b.start.month;
  return da - db;
});
const yearLabels: string[] = Array.from(
  new Set(sortedExps.map((e) => String(e.start.year)))
);
```

- [ ] **Step 3: Add the responsive + reduced-motion hook**

Just above the existing `Tag` sub-component declaration (around line 19), insert:

```ts
/**
 * Gate for the horizontal scrolljack layout.
 *
 * Returns true when both:
 *   - viewport ≥ 768px (scrolljacks are bad UX on touch)
 *   - `prefers-reduced-motion: no-preference` (the slide is contemplative
 *     but the locked-scroll feel is disorienting for users with vestibular
 *     sensitivity, so we honour the OS hint)
 *
 * Listens to both media queries live so resizing or toggling Reduce Motion
 * in System Settings flips the layout without a refresh.
 */
const useIsHorizontalEnabled = (): boolean => {
  const [enabled, setEnabled] = React.useState(() => {
    if (typeof window === 'undefined') return true;
    const wide = window.matchMedia('(min-width: 768px)').matches;
    const noReduce = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    return wide && noReduce;
  });
  React.useEffect(() => {
    const mqWide = window.matchMedia('(min-width: 768px)');
    const mqReduce = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const sync = () => setEnabled(mqWide.matches && mqReduce.matches);
    sync();
    mqWide.addEventListener?.('change', sync);
    mqReduce.addEventListener?.('change', sync);
    return () => {
      mqWide.removeEventListener?.('change', sync);
      mqReduce.removeEventListener?.('change', sync);
    };
  }, []);
  return enabled;
};
```

- [ ] **Step 4: Typecheck**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```
Expected: zero output.

- [ ] **Step 5: Commit**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && git add src/components/ExperienceSection.tsx && git commit -m "feat(experience): foundation — sortedExps, yearLabels, useIsHorizontalEnabled"
```

---

## Task 2: YearBillboard sub-component

**Files:**
- Modify: `src/components/ExperienceSection.tsx`

- [ ] **Step 1: Add the YearBillboard component**

Just above the existing `ExperienceSection` declaration (search for `const ExperienceSection: React.FC = () =>`), insert this new sub-component:

```tsx
interface YearBillboardProps {
  /** All year labels in chronological order, deduped. */
  yearLabels: string[];
  /** Scroll progress through the parent section (0..1). */
  scrollYProgress: import('framer-motion').MotionValue<number>;
  /** For each card index, the scroll-progress value at which it sits centred. */
  cardCenters: number[];
}

/**
 * Giant year display that snaps to whichever card is centred. Uses
 * RotatingText's imperative ref (jumpTo) so the existing character-stagger
 * animation fires on each year change — no auto-rotate, no interval.
 */
const YearBillboard: React.FC<YearBillboardProps> = ({
  yearLabels,
  scrollYProgress,
  cardCenters,
}) => {
  const rotatingRef = React.useRef<RotatingTextRef>(null);
  const lastIdxRef = React.useRef(0);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (cardCenters.length === 0) return;
    // Pick the card whose centre is nearest to current progress.
    let nearest = 0;
    let bestDist = Infinity;
    for (let i = 0; i < cardCenters.length; i++) {
      const d = Math.abs(cardCenters[i] - v);
      if (d < bestDist) {
        bestDist = d;
        nearest = i;
      }
    }
    const year = String(sortedExps[nearest].start.year);
    const yearIdx = yearLabels.indexOf(year);
    if (yearIdx !== -1 && yearIdx !== lastIdxRef.current) {
      lastIdxRef.current = yearIdx;
      rotatingRef.current?.jumpTo(yearIdx);
    }
  });

  return (
    <div
      className="pointer-events-none absolute top-0 left-0 right-0 z-10 px-[6vw] pt-10 flex items-baseline gap-6"
      aria-hidden="true"
    >
      <span className="text-white/55 text-xs uppercase tracking-[0.32em] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
        Where I've worked
      </span>
      <RotatingText
        ref={rotatingRef}
        texts={yearLabels}
        auto={false}
        loop={false}
        rotationInterval={999999}
        staggerDuration={0.04}
        staggerFrom="last"
        splitBy="characters"
        mainClassName="font-black tracking-tight text-white leading-none"
        elementLevelClassName="text-[14vw] sm:text-[12vw] md:text-[10vw] lg:text-[9vw]"
        splitLevelClassName="overflow-hidden"
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        initial={{ y: '110%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '-110%', opacity: 0 }}
        style={{ textShadow: '0 4px 28px rgba(0,0,0,0.7)' }}
      />
    </div>
  );
};
```

- [ ] **Step 2: Typecheck**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```
Expected: zero output. If you see a type error on the `import('framer-motion').MotionValue<number>` syntax, change it to: add `MotionValue` to the existing framer-motion import (`import { motion, useInView, useScroll, useTransform, useMotionValueEvent, type MotionValue } from 'framer-motion';`) and reference it directly as `MotionValue<number>` in the prop type.

- [ ] **Step 3: Commit**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && git add src/components/ExperienceSection.tsx && git commit -m "feat(experience): YearBillboard subcomponent using RotatingText jumpTo"
```

---

## Task 3: Horizontal rail + scroll-driven pan

**Files:**
- Modify: `src/components/ExperienceSection.tsx`

This task builds a NEW `HorizontalExperienceTimeline` sub-component that lives inside `ExperienceSection.tsx`. It owns the sticky scrolljack + cards rail. The existing `ExperienceItem` is reused as the card content (no changes to its internals).

- [ ] **Step 1: Add HorizontalExperienceTimeline sub-component**

Just above the existing `const ExperienceSection: React.FC = () => {` declaration (and above or below YearBillboard from Task 2 — order doesn't matter), insert:

```tsx
interface HorizontalExperienceTimelineProps {
  /** Click handler that opens the ExperienceDetail modal. */
  onViewDetails: (id: string) => void;
}

const CARD_WIDTH = 720;
const CARD_HEIGHT = 480;
const CARD_GAP = 32;

/**
 * Sticky scrolljack version of the experience timeline.
 *
 * Outer <section> is (N+1) viewport-heights tall so there's vertical scroll
 * travel. Inside, a sticky container locks the viewport for the duration
 * of the section. A flex rail of LiquidGlass cards translates left via
 * useTransform on the section's scrollYProgress. A YearBillboard sits in
 * the top-left and tracks which card is centred.
 */
const HorizontalExperienceTimeline: React.FC<HorizontalExperienceTimelineProps> = ({
  onViewDetails,
}) => {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Viewport width tracked in state so xMax updates on resize. We also
  // recompute on mount to pick up the actual rendered width (in case
  // initial render runs at a wrong size during the loading-state).
  const [viewportW, setViewportW] = React.useState(() =>
    typeof window === 'undefined' ? 1280 : window.innerWidth
  );
  React.useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const N = sortedExps.length;
  const SLOT = CARD_WIDTH + CARD_GAP;
  const trackWidth = N * SLOT - CARD_GAP;
  // We want the LAST card to land centred at progress=1. Card i sits at
  // left = i * SLOT inside the rail. We want left + CARD_WIDTH/2 === viewportW/2
  // when progress is 1 (last card centred). Solve for rail x:
  //   x_target_for_card_i_centred = viewportW/2 - (i * SLOT + CARD_WIDTH/2)
  // At progress=0, place the first card centred: x_start = viewportW/2 - CARD_WIDTH/2.
  // At progress=1, last card centred: x_end = viewportW/2 - ((N-1) * SLOT + CARD_WIDTH/2).
  const xStart = viewportW / 2 - CARD_WIDTH / 2;
  const xEnd = viewportW / 2 - ((N - 1) * SLOT + CARD_WIDTH / 2);
  const trackX = useTransform(scrollYProgress, [0, 1], [xStart, xEnd]);

  // Card centres in scroll-progress space: card i is centred at progress
  // i / (N-1) when N ≥ 2; for N=1 it's centred at 0. These values feed
  // YearBillboard's nearest-card lookup.
  const cardCenters = React.useMemo(() => {
    if (N <= 1) return [0];
    return Array.from({ length: N }, (_, i) => i / (N - 1));
  }, [N]);

  // Section height: (N + 1) viewports for comfortable scroll travel.
  const sectionHeight = `${(N + 1) * 100}vh`;

  return (
    <div
      ref={sectionRef}
      className="relative w-full"
      style={{ height: sectionHeight }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <YearBillboard
          yearLabels={yearLabels}
          scrollYProgress={scrollYProgress}
          cardCenters={cardCenters}
        />

        {/* Centre band — cards sit in a flex row. We apply `x` via motion so
            framer-motion takes the perf-friendly path (transform, no reflow). */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 flex items-center"
          style={{
            x: trackX,
            gap: CARD_GAP,
            width: trackWidth,
            willChange: 'transform',
          }}
        >
          {sortedExps.map((exp, i) => (
            <div
              key={exp.id}
              style={{ width: CARD_WIDTH, height: CARD_HEIGHT, flexShrink: 0 }}
            >
              <ExperienceItem
                exp={exp}
                index={i}
                cardWidth={CARD_WIDTH}
                isMobile={false}
                onViewDetails={() => onViewDetails(exp.id)}
              />
            </div>
          ))}
        </motion.div>

        {/* Thin scroll-progress bar at the bottom of the sticky frame */}
        <div className="absolute bottom-10 left-[6vw] right-[6vw] h-px bg-white/10">
          <motion.div
            className="h-full bg-white/55 origin-left"
            style={{ scaleX: scrollYProgress }}
          />
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Typecheck**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: zero output. Likely errors and their fixes:
- `ExperienceItem` typed prop `isMobile: boolean` — already true/false in existing code. If a prop signature differs, mirror it exactly from the existing `ExperienceItem: React.FC<{...}>` declaration around line 73 of the same file.
- If `cardWidth: number` is required by `ExperienceItem`, we pass `CARD_WIDTH` (720) — already matches the existing signature.

- [ ] **Step 3: Commit**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && git add src/components/ExperienceSection.tsx && git commit -m "feat(experience): HorizontalExperienceTimeline — sticky rail + scroll-driven pan"
```

---

## Task 4: Wire the desktop/mobile branch in the main `ExperienceSection`

**Files:**
- Modify: `src/components/ExperienceSection.tsx`

This task plugs the new horizontal layout into the existing `ExperienceSection` while keeping the existing vertical layout as the fallback for `< 768px` or reduced-motion users.

- [ ] **Step 1: Add the gate + branch inside ExperienceSection**

Find the existing `const ExperienceSection: React.FC = () => {` declaration (around line 331). Locate the place where the component currently returns its JSX (it likely returns a single `<section id="experience" …>` block with the vertical alternating cards).

Inside the component body, immediately after `useComponentLoader(...)` (or near the top of the function), add:

```ts
  const isHorizontal = useIsHorizontalEnabled();
```

Then locate the existing `return ( ... )` statement. You should see a `<section ref={...} id="experience" ...>` wrapper. We're going to wrap the OUTER section's CHILDREN with a branch.

The current top of the return looks like (paraphrased — match what exists exactly):

```tsx
  return (
    <section ref={sectionRef} id="experience" className="...">
      <StickySectionBackground variant="experience" />
      {/* heading, cards, etc. */}
      ...
    </section>
  );
```

You're going to keep the same `<section>` wrapper PLUS `<StickySectionBackground>` PLUS the heading/intro, but the cards block becomes branch-aware. Concretely: find the `{experiences.map(...)}` or the equivalent JSX block that renders the vertical cards. Wrap that block + a heading band (the existing "Where I've worked" / "Experiences" title area, if any) in:

```tsx
{isHorizontal ? (
  <HorizontalExperienceTimeline
    onViewDetails={handleViewDetails}
  />
) : (
  <>
    {/* — paste the existing vertical cards block exactly as-is here — */}
  </>
)}
```

`handleViewDetails` is already declared in the existing component (it sets state and opens `ExperienceDetail`). Pass it directly.

If the existing component uses a different prop shape on the vertical timeline's click handler, conform to it — the goal is "horizontal renders new, mobile/reduced-motion renders existing".

- [ ] **Step 2: Ensure the section's StickySectionBackground is rendered ONLY in the vertical branch**

`HorizontalExperienceTimeline` provides its own sticky-section visual frame; rendering `StickySectionBackground` alongside it would double the DotGrid overlay during the scrolljack.

If `<StickySectionBackground variant="experience" />` is rendered unconditionally near the top of `<section id="experience">`, move it INSIDE the `<>` block of the vertical branch:

```tsx
{isHorizontal ? (
  <HorizontalExperienceTimeline onViewDetails={handleViewDetails} />
) : (
  <>
    <StickySectionBackground variant="experience" />
    {/* — existing vertical cards block — */}
  </>
)}
```

- [ ] **Step 3: Hide the existing heading band on horizontal mode (the YearBillboard replaces it)**

If the existing layout has a heading like `<h2>Experiences</h2>` plus the "Where I've worked" sub-eyebrow above the cards, conditionally hide them on horizontal: wrap them in `{!isHorizontal && (...)}` OR move them inside the vertical branch's `<>` block too. The horizontal layout's YearBillboard IS the visual heading.

- [ ] **Step 4: Verify the `<section>` wrapper still has `id="experience"`**

The CameraWheel + scroll spy rely on `document.getElementById('experience')`. The new horizontal layout sits INSIDE that section. Confirm:

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && grep -n 'id="experience"' src/components/ExperienceSection.tsx
```
Expected: exactly one match, on the outer `<section>` (or `<motion.section>`).

- [ ] **Step 5: Typecheck**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```
Expected: zero output.

- [ ] **Step 6: Commit**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && git add src/components/ExperienceSection.tsx && git commit -m "feat(experience): branch render — horizontal scrolljack on desktop, vertical on mobile + reduced motion"
```

---

## Task 5: Live smoke verification via Claude in Chrome MCP

No code changes — verify behaviour against the dev server.

- [ ] **Step 1: Dev server up**

If not already running:

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npm run dev
```
Note URL (typically `http://localhost:5173`).

- [ ] **Step 2: Horizontal layout active at desktop width**

In the browser (or `mcp__Claude_in_Chrome__javascript_tool`), run:

```js
(() => {
  const exp = document.getElementById('experience');
  if (!exp) return 'no-section';
  return {
    rect: { w: exp.clientWidth, h: exp.clientHeight },
    // Section should be ~ (N+1)*viewportH tall in horizontal mode. With 3 cards
    // and viewport 800px, expect ~3200px. In vertical mode it's a single viewport.
    isHorizontal: exp.clientHeight > window.innerHeight * 2,
    innerStickyExists: !!exp.querySelector('.sticky'),
    yearBillboardExists: !!exp.querySelector('[aria-hidden="true"] [class*="font-black"]'),
  };
})()
```

Expected at desktop width: `isHorizontal: true`, `innerStickyExists: true`, `yearBillboardExists: true`.

- [ ] **Step 3: Scroll-driven year billboard updates**

```js
(async () => {
  const exp = document.getElementById('experience');
  if (!exp) return 'no-section';
  const samples = [];
  // Scroll to 3 positions within the experience section.
  const top = exp.offsetTop;
  const h = exp.clientHeight;
  for (const frac of [0.15, 0.5, 0.85]) {
    window.scrollTo(0, top + h * frac);
    await new Promise(r => setTimeout(r, 700));
    const billboard = document.querySelector('#experience [class*="font-black"]');
    samples.push({
      frac,
      year: billboard?.textContent,
    });
  }
  return samples;
})()
```

Expected: the year shifts between samples (e.g. `'2022'` at frac=0.15, `'2024'` at 0.5, `'2025'` at 0.85 — order matches the chronological sort).

- [ ] **Step 4: Card click opens ExperienceDetail modal**

```js
(async () => {
  const exp = document.getElementById('experience');
  const card = exp?.querySelector('[class*="cursor-pointer"]');
  if (!card) return 'no-card';
  (card as HTMLElement).click();
  await new Promise(r => setTimeout(r, 500));
  // ExperienceDetail mounts a fixed overlay. Look for it.
  const modal = document.querySelector('[role="dialog"], [class*="ExperienceDetail"], .experience-detail-overlay');
  return { modalOpened: !!modal };
})()
```

Expected: `modalOpened: true`. If `false`, the selector for the modal didn't match — try `document.querySelectorAll('[class*="fixed"]')` to find it manually and adjust.

- [ ] **Step 5: Mobile fallback**

Resize the browser window to 600px width (or use Chrome DevTools device toolbar):

```js
(() => {
  const exp = document.getElementById('experience');
  return {
    width: window.innerWidth,
    isHorizontalLayoutSection: exp ? exp.clientHeight > window.innerHeight * 2 : null,
  };
})()
```

Expected at < 768px: `isHorizontalLayoutSection: false` (section returns to single-viewport height because the vertical branch renders).

- [ ] **Step 6: Reduced motion fallback**

Enable macOS *Reduce Motion* (System Settings → Accessibility → Display). Reload. Same query as Step 5 — expect vertical layout regardless of width.

Disable Reduce Motion after testing.

- [ ] **Step 7: TypeScript final**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```
Expected: zero output.

- [ ] **Step 8: No commit needed for verification.** If any check fails, file the issue and dispatch a fix subagent.

---

## End-to-end verification

After Task 5 passes:

1. Hard-reload `http://localhost:5173`. After loader, scroll to Experience section.
2. Section locks for ~3 viewport heights of scroll. Cards pan left as you scroll down.
3. Year billboard displays `2022` initially. As you scroll, transitions through `2024` then `2025` with the RotatingText character-stagger spring.
4. Scroll progress bar at the bottom of the sticky frame fills left-to-right (`scaleX: scrollYProgress`).
5. Click any card → `ExperienceDetail` modal opens. Close → scroll position preserved.
6. Resize to mobile width OR enable Reduce Motion → vertical alternating-card layout returns.

If all six hold, the spec is satisfied.

---

## Out of scope (revisit later)

- Restyling the cards themselves (badges, skill chips, photos) — `ExperienceItem` internals are untouched.
- Adding a dimmed 2023 placeholder card.
- Keyboard shortcuts (Arrow keys to jump card-to-card).
- Touch swipe gestures on tablet (768–1023px) — current spec uses scrolljack for ≥768px.
- Performance audit on the always-mounted sticky overlays (DotGrid still mounted via `StickySectionBackground` in the vertical branch only).
