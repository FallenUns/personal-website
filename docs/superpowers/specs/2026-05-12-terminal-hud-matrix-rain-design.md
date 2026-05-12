# Terminal HUD, Matrix Rain Visualization, and Decrypt-Reveal Fix

**Date:** 2026-05-12
**Status:** Approved (pending spec review)

## Context

Three problems prompted this work:

1. **The "PATRICK ADRIANUS" decryption animation is invisible to the user.** Debugging via Claude in Chrome MCP confirmed the `DecryptedText` `IntersectionObserver` fires while the hero is still covered by the loader. With 16 chars × 55 ms speed, the reveal completes in ~880 ms — entirely during the loader's fade-out. By the time the user sees the hero, the name is already fully revealed. The decryption is paying its rendering cost but yielding zero perceived effect.
2. **The site lacks a strong identity beat after load.** The user wants the portfolio to read as built by a coder — a small, alive console/terminal element that signals craft without taking space away from the hero.
3. **The site needs a stronger visual wow moment.** The hero relies entirely on the aurora background + liquid-glass for atmosphere. There is no kinetic layer that feels generative or reactive to the cursor.

The fix is a coordinated set of three changes: gate the decrypt reveal on `!isLoading`, ship a fixed-position terminal HUD widget, and add a Matrix-style digital-rain canvas clipped behind the hero. All three share the "alive, built by a coder, generative" aesthetic.

## Goals

- The name visibly decrypts every time the hero is first shown after the loader yields.
- A persistent terminal HUD reflects live user activity (scrolls, hovers, time) and reinforces the developer identity.
- A subtle generative rain layer adds movement behind the hero, reacts to the cursor, and respects performance + reduced-motion.

## Non-goals

- Replacing the loader (already finalised in the previous iteration — PA monogram fill).
- Refactoring the existing LiquidGlass component.
- Adding analytics or any non-display logging.
- Rewriting `DecryptedText`/`RotatingText` — only adding one new trigger mode.

---

## Architecture overview

Three independent units, each with a clear contract:

| Unit                          | Purpose                                                                 | Inputs                                  | Side effects                                  |
|-------------------------------|-------------------------------------------------------------------------|-----------------------------------------|-----------------------------------------------|
| `DecryptedText` (extend)      | Add `animateOn="trigger"` mode controlled by a `trigger` boolean prop. | `trigger: boolean`, existing props.     | Starts/resets the scramble on rising/falling edge of `trigger`. |
| `TerminalHud` (new)           | Fixed-position 320×220 widget. Boots with typed log lines, then streams events. | `events` from a small in-process bus (see below).      | Renders text; no global side effects. Collapsible. |
| `MatrixRain` (new)            | `<canvas>` mounted inside the hero `<section>`. Draws falling glyphs in the aurora palette, brightens locally around the cursor. | None; reads pointer + scroll.            | Owns one `requestAnimationFrame` loop while in view.        |
| `useHudBus` hook (new, small) | Light event bus so other components can `bus.log("> section: experience")` without prop drilling.  | Subscribers register a callback.        | In-memory ring buffer of last 50 messages.    |

Each unit can be tested in isolation. The bus is the only shared dependency between `TerminalHud` and the rest of the app.

## Components & data flow

### 1. `DecryptedText` extension

```ts
type AnimateMode = 'view' | 'hover' | 'inViewHover' | 'click' | 'mount' | 'trigger';

interface DecryptedTextProps {
  // existing...
  animateOn?: AnimateMode;
  trigger?: boolean;   // only meaningful when animateOn === 'trigger'
}
```

Behaviour:
- `animateOn="trigger"`: animation runs whenever `trigger` transitions from `false → true`. While `trigger` is `false`, render the encrypted state (`encryptedClassName`, scrambled glyphs).
- Existing modes are untouched — additive change.

In `HeroSection.tsx`:
```tsx
const { isLoading } = useLoading();
<DecryptedText
  animateOn="trigger"
  trigger={!isLoading}
  // ... existing props
/>
```

The name now stays scrambled while the loader is up and decrypts the moment the loader fades. Clicking the headline re-arms `trigger` via a local boolean so the user can replay the effect on demand.

### 2. `useHudBus` hook + module-singleton store

A tiny pub/sub:

```ts
// src/hooks/useHudBus.ts
type HudMessage = { id: number; t: number; text: string; level?: 'info'|'ok'|'warn' };

let counter = 0;
const buffer: HudMessage[] = [];
const subs = new Set<(msgs: HudMessage[]) => void>();

export const hudLog = (text: string, level: HudMessage['level'] = 'info') => {
  const msg = { id: ++counter, t: Date.now(), text, level };
  buffer.push(msg);
  if (buffer.length > 50) buffer.shift();
  subs.forEach(fn => fn(buffer.slice()));
};

export const useHudBus = (): HudMessage[] => {
  const [msgs, setMsgs] = useState<HudMessage[]>(buffer.slice());
  useEffect(() => {
    const cb = (m: HudMessage[]) => setMsgs(m);
    subs.add(cb);
    return () => { subs.delete(cb); };
  }, []);
  return msgs;
};
```

Producers call `hudLog("> section: experience", "ok")` from wherever (scroll spy, navbar click, project hover). No reducer, no context, no rerender storms.

### 3. `TerminalHud` component

Visual spec:
- Fixed `bottom: 16px; left: 16px`. 320×220 panel. `z-index: 40` (above page content, below loader/modals).
- Translucent dark background: `rgba(7, 6, 14, 0.62)` with `backdrop-filter: blur(10px) saturate(120%)`, a 1px border `rgba(124, 227, 139, 0.18)`, 8px corner radius.
- **Header bar** (24px tall): three macOS-style traffic-light dots on the left (decorative, non-functional), `terminal.sh — patrick@portfolio` centred, a collapse chevron right. Click anywhere on the header to roll the body up to just the header.
- **Body** (180px scroll viewport): JetBrains Mono 11.5px, color `#7CE38B` (ok), `#FFC857` (warn), `#9EA4B5` (info). Lines stream upward; oldest at top, latest at bottom. Auto-scroll-to-bottom unless user has manually scrolled.
- **Footer** (16px tall): live `uptime: 00:03:42` ticker + a blinking caret `▍`.
- **Boot sequence** (runs once, after `isLoading` flips to false): types out, character by character, the following 5 lines at ~16 ms/char with a 200 ms gap between lines.
  ```
  > aurora.init() ............... ok
  > liquid_glass.shader → mounted
  > camera_wheel.spy(4 sections)
  > tech_stack.load(36 items)
  > ready. listening for events…
  ```
- A subtle scanline overlay (`repeating-linear-gradient` 2px alternating, 5% opacity) for CRT feel.

Producers wired up:
- Navigation: in `NavBar.handleScrollToSection`, call `hudLog("> nav → ${id}", "info")`.
- ScrollSpy section changes: `hudLog("> section: ${id}", "ok")` from inside `useScrollSpy`'s active section change effect.
- Project hover: in `ProjectsSection` (and `ExperienceSection`) card `onMouseEnter`, `hudLog("> hover: ${title}")`.
- CameraWheel jump: `hudLog("> wheel → ${id}", "info")`.

The HUD remains mounted regardless of route/section. Collapsed state persisted in `localStorage` under `hudCollapsed`.

### 4. `MatrixRain` canvas

Visual spec:
- Mounted inside `<section id="about">`, `position: absolute; inset: 0; z-index: 0; pointer-events: none`. Sits behind the hero text (which is `z-index: 1`+).
- `<canvas>` fills the parent. Resize via `ResizeObserver`.
- Glyph set: `01アイウエオカキクケコサシスセソタチツテト+-=<>{}[]`. Each column is one `x` track; rows fall at independent random speeds (1–3 px/frame).
- Palette: head of each column white (`rgba(255,255,255,0.95)`), tail fades to violet (`rgba(167, 139, 250, 0.55) → 0`). Matches the aurora palette so it reads as native, not bolted on.
- **Cursor reactivity**: track pointer; within a 200px radius, multiply the column's alpha by 1.6 and slow its fall by 30%. Soft falloff using a Gaussian.
- Each frame: full-canvas fill `rgba(7, 6, 14, 0.10)` (creates the trailing-fade effect) + draw new glyphs per column.
- Throttled to 24 fps to keep CPU light.
- **Reduced-motion**: when `prefers-reduced-motion: reduce`, render a single static frame and stop the loop.
- **Off-screen**: when the hero `<section>` leaves the viewport (`IntersectionObserver`), pause the `requestAnimationFrame` loop. Resume on re-entry.

## Files added / modified

| File                                                            | Change           |
|-----------------------------------------------------------------|------------------|
| `src/components/animations/DecryptedText.tsx`                   | Add `animateOn="trigger"` + `trigger` prop. Edge-detect transitions inside a `useEffect`. |
| `src/components/HeroSection.tsx`                                | Pass `animateOn="trigger" trigger={!isLoading}` to the headline; mount `<MatrixRain />` before `<CursorSpotlight />`; add `onClick` re-trigger handler. |
| `src/hooks/useHudBus.ts` (new)                                  | Module-singleton bus + React hook. |
| `src/components/TerminalHud.tsx` (new)                          | The widget. Subscribes to `useHudBus`, runs the boot sequence on first mount after `!isLoading`. |
| `src/components/TerminalHud.css` (new)                          | Scanline overlay, mono font, blinking caret keyframes. |
| `src/components/visuals/MatrixRain.tsx` (new)                   | Canvas + RAF loop + cursor proximity logic. |
| `src/App.tsx`                                                   | Mount `<TerminalHud />` once at root, sibling to `<DustToOrbLoader />`. |
| `src/components/NavBar.tsx`                                     | Add `hudLog` calls in `handleScrollToSection`. |
| `src/hooks/useScrollSpy.ts`                                     | Add `hudLog` call when active section changes. |
| `src/components/ProjectsSection.tsx`, `ExperienceSection.tsx`   | Add `hudLog` on card `onMouseEnter` (one call site each). |
| `src/components/CameraWheel.tsx`                                | Add `hudLog` in `jump()`. |

No new dependencies.

## Error handling & edge cases

- **Decrypt trigger fires before mount**: `useEffect` for trigger compares against a previous-value ref; only acts on a rising edge. Initial `trigger=false` does nothing.
- **HUD boot runs twice**: a module-level `hasBooted` flag in `TerminalHud` ensures the boot sequence only types out once per page load (resists React StrictMode double-mount in dev).
- **HUD overflows on mobile (≤640px)**: collapse to a tiny `36×36px` glowing dot button in the corner; expand to a full-width sheet on tap. Pure CSS media query.
- **MatrixRain on low-perf devices**: existing `isLowPerformanceDevice()` util gates the component — render a static gradient if low-perf.
- **Canvas memory leak**: `ResizeObserver`, `IntersectionObserver`, and the RAF loop are all cleared in the cleanup of one `useEffect`.

## Testing & verification

This is browser-rendered visual work. No unit tests needed for the components. Verification is done end-to-end via Claude in Chrome MCP:

1. **Decrypt fix**: navigate to `/`, wait for loader to fade (~3.5 s), then within the next 1 s sample `.hero-display .name span` classes every 100 ms. Expect to see `.name-char-dim` on at least one sample before all chars converge to `.name-char`. Click the headline → expect the dim-class sequence to reappear.
2. **HUD boot**: confirm the 5 boot lines appear sequentially after `isLoading` flips. Verify `localStorage.hudCollapsed = "true"` persists across reloads when collapsed.
3. **HUD events**: scroll into Experiences → expect a `> section: experience` log entry within 500 ms. Hover a project card → expect `> hover: <title>`. Click "Projects" in navbar → expect `> nav → projects`.
4. **MatrixRain reactivity**: move the cursor across the hero → adjacent columns visibly brighten. Scroll past the hero → confirm RAF loop pauses (via a temporary `console.count` in dev).
5. **Reduced motion**: enable macOS *Reduce Motion* → confirm matrix loop stops (static frame) and HUD boot completes instantly without typewriter.
6. **No regressions**: `npx tsc --noEmit -p tsconfig.json` returns clean. Loader still appears and exits normally.

## Out of scope (revisit later)

- Audio-reactive variant of MatrixRain.
- HUD command palette (typing real commands into a prompt).
- Persisting HUD log history across navigation.
