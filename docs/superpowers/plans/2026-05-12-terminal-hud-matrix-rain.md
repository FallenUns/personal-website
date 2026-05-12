# Terminal HUD + Matrix Rain + Decrypt-Reveal Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "PATRICK ADRIANUS" decryption visibly run after the loader fades, ship a persistent terminal HUD that boots with typed log lines and streams user events, and add a cursor-reactive matrix-rain canvas behind the hero.

**Architecture:** Three loosely-coupled additions plus one surgical extension. `DecryptedText` gains a `trigger` mode (rising-edge boolean). A module-singleton `useHudBus` pub/sub feeds a fixed-position `TerminalHud` widget. A `MatrixRain` canvas mounts inside the hero `<section>` and listens to pointer + viewport. No new dependencies; reuses framer-motion already in the project.

**Tech Stack:** React 18 + TypeScript + Vite + framer-motion + Tailwind + plain `<canvas>`. No test framework in repo; verification is `tsc --noEmit` + browser smoke checks via Claude in Chrome MCP.

**Spec:** [`docs/superpowers/specs/2026-05-12-terminal-hud-matrix-rain-design.md`](../specs/2026-05-12-terminal-hud-matrix-rain-design.md)

---

## File map

| File | Disposition | Purpose |
|------|-------------|---------|
| `src/hooks/useHudBus.ts` | Create | Module-singleton ring buffer + React subscribe hook. |
| `src/components/animations/DecryptedText.tsx` | Modify | Add `animateOn="trigger"` mode + `trigger` prop with rising-edge effect. |
| `src/components/HeroSection.tsx` | Modify | Pass `animateOn="trigger" trigger={!isLoading}` to headline; click-to-replay; mount `<MatrixRain />`. |
| `src/components/visuals/MatrixRain.tsx` | Create | `<canvas>` with RAF loop, cursor proximity, viewport pause, reduced-motion. |
| `src/components/TerminalHud.tsx` | Create | Fixed widget — header + body + footer, boot typewriter, subscribes to `useHudBus`. |
| `src/components/TerminalHud.css` | Create | Scanline overlay, blinking caret keyframes, scrollbar style. |
| `src/App.tsx` | Modify | Mount `<TerminalHud />` once, sibling of loader. |
| `src/components/NavBar.tsx` | Modify | `hudLog` call in `handleScrollToSection`. |
| `src/hooks/useScrollSpy.ts` | Modify | `hudLog` on active-section change. |
| `src/components/ProjectsSection.tsx` | Modify | `hudLog` on project card hover. |
| `src/components/ExperienceSection.tsx` | Modify | `hudLog` on experience card hover. |
| `src/components/CameraWheel.tsx` | Modify | `hudLog` in `jump()`. |

---

## Verification helper

Most tasks end with the same MCP smoke check. The reusable command:

```bash
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: zero output.

For browser checks, the dev server is at `http://localhost:5173`. If it isn't already running, the engineer should start it in another terminal with `npm run dev` before continuing the plan. The Claude in Chrome MCP tools live under `mcp__Claude_in_Chrome__*` — use `tabs_context_mcp` once at the start to grab a tab id.

---

## Task 1: `useHudBus` hook + log producer

**Files:**
- Create: `src/hooks/useHudBus.ts`

- [ ] **Step 1: Create the hook + module-singleton bus**

```ts
// src/hooks/useHudBus.ts
import { useEffect, useState } from 'react';

export type HudLevel = 'info' | 'ok' | 'warn';
export interface HudMessage {
  id: number;
  t: number;       // epoch ms
  text: string;
  level: HudLevel;
}

// Module-singleton state: ring buffer of last 50 messages + subscribers.
// Module-level (not a Context) so any component or hook can call `hudLog`
// without prop drilling and without forcing re-renders of unrelated trees.
const MAX = 50;
let counter = 0;
const buffer: HudMessage[] = [];
const subs = new Set<(msgs: HudMessage[]) => void>();

const broadcast = () => {
  // Snapshot so subscribers don't accidentally mutate.
  const snap = buffer.slice();
  subs.forEach((fn) => fn(snap));
};

export const hudLog = (text: string, level: HudLevel = 'info'): void => {
  const msg: HudMessage = { id: ++counter, t: Date.now(), text, level };
  buffer.push(msg);
  if (buffer.length > MAX) buffer.shift();
  broadcast();
};

export const hudClear = (): void => {
  buffer.length = 0;
  broadcast();
};

/**
 * React hook — returns the current message buffer and re-renders on each
 * new log entry. Initial value is the existing buffer so a HUD mounted late
 * in the page lifecycle still shows the boot messages.
 */
export const useHudBus = (): HudMessage[] => {
  const [msgs, setMsgs] = useState<HudMessage[]>(() => buffer.slice());
  useEffect(() => {
    subs.add(setMsgs);
    setMsgs(buffer.slice());
    return () => {
      subs.delete(setMsgs);
    };
  }, []);
  return msgs;
};
```

- [ ] **Step 2: Typecheck**

```bash
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output (zero errors).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useHudBus.ts
git commit -m "feat(hud): add useHudBus module-singleton pub/sub + React hook"
```

---

## Task 2: Add `animateOn="trigger"` mode to DecryptedText

**Files:**
- Modify: `src/components/animations/DecryptedText.tsx`

- [ ] **Step 1: Extend the `animateOn` union and add the `trigger` prop**

Replace the `interface DecryptedTextProps` declaration (currently around lines 22–34) with:

```ts
interface DecryptedTextProps extends HTMLMotionProps<'span'> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  animateOn?: 'view' | 'hover' | 'inViewHover' | 'click' | 'mount' | 'trigger';
  clickMode?: 'once' | 'toggle';
  /**
   * When `animateOn === 'trigger'`, decryption runs on the rising edge of
   * this boolean (false → true). When falling (true → false), the text is
   * re-scrambled to the encrypted state. Ignored for other modes.
   */
  trigger?: boolean;
}
```

Also add `trigger` to the destructured props (in the function signature, after `clickMode = 'once'`):

```ts
  trigger = false,
```

- [ ] **Step 2: Add rising/falling-edge effect for trigger mode**

Just above the existing `useEffect` that handles `animateOn === 'view'` (the one that creates an `IntersectionObserver`), insert this new effect:

```ts
  // Trigger mode — drive scramble/reveal from an external boolean. Rising
  // edge → run the decrypt; falling edge → snap back to a scrambled state.
  // Using a ref to remember the previous value so we only fire on edges.
  const prevTriggerRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (animateOn !== 'trigger') return;
    const prev = prevTriggerRef.current;
    prevTriggerRef.current = trigger;
    if (prev === null) {
      // First render: seed the state based on the initial trigger value.
      if (trigger) {
        triggerDecrypt();
      } else {
        encryptInstantly();
      }
      return;
    }
    if (prev === false && trigger === true) {
      triggerDecrypt();
    } else if (prev === true && trigger === false) {
      encryptInstantly();
    }
  }, [animateOn, trigger, triggerDecrypt, encryptInstantly]);
```

- [ ] **Step 3: Ensure the reset effect doesn't fight trigger mode**

The existing effect that runs on `[animateOn, text]` currently resets state when `animateOn` is not `click`/`mount`/`view`/`inViewHover`. Update its condition (search for `if (animateOn === 'click')` block) so `'trigger'` is also skipped from the auto-decrypt path:

Find:

```ts
  useEffect(() => {
    if (animateOn === 'click') {
      encryptInstantly();
    } else if (animateOn !== 'mount' && animateOn !== 'view' && animateOn !== 'inViewHover') {
      setDisplayText(text);
      setIsDecrypted(true);
    }
    setRevealedIndices(new Set());
    setDirection('forward');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateOn, text]);
```

Replace with:

```ts
  useEffect(() => {
    if (animateOn === 'click') {
      encryptInstantly();
    } else if (
      animateOn !== 'mount' &&
      animateOn !== 'view' &&
      animateOn !== 'inViewHover' &&
      animateOn !== 'trigger'
    ) {
      setDisplayText(text);
      setIsDecrypted(true);
    }
    setRevealedIndices(new Set());
    setDirection('forward');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateOn, text]);
```

- [ ] **Step 4: Typecheck**

```bash
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/components/animations/DecryptedText.tsx
git commit -m "feat(animations): add 'trigger' mode to DecryptedText for external control"
```

---

## Task 3: Wire trigger in HeroSection (decrypt fix + click replay)

**Files:**
- Modify: `src/components/HeroSection.tsx`

- [ ] **Step 1: Add replay state + handler near other useState hooks**

After the existing `const [hoveredTech, setHoveredTech] = …` block (around line 17), add:

```ts
  // Local boolean that drives DecryptedText's trigger mode. We OR it with
  // `!isLoading` so the reveal happens once after the loader fades, and
  // each click on the headline replays the decrypt by briefly flipping
  // this back to false then true.
  const [replayTick, setReplayTick] = React.useState(0);
  const handleReplayName = React.useCallback(() => {
    // Flip trigger off then on on the next frame to retrigger the rising edge.
    setReplayTick((t) => t + 1);
  }, []);
```

- [ ] **Step 2: Compute the trigger value**

Add just below the `replayTick` state:

```ts
  // Trigger composition: stays false while loading, then true after load.
  // `replayTick` increments on click; we use its parity to flip the boolean.
  const nameTrigger = !isLoading && replayTick % 2 === 0;
  // After a click, we need to push false → true again. Use an effect that
  // increments tick one more time on the next animation frame so the
  // rising edge fires.
  React.useEffect(() => {
    if (replayTick === 0) return;
    const raf = requestAnimationFrame(() => setReplayTick((t) => t + 1));
    return () => cancelAnimationFrame(raf);
  }, [replayTick]);
```

- [ ] **Step 3: Update the `<DecryptedText>` props in the headline**

Find the existing block (around lines 152–162):

```tsx
                <DecryptedText
                  text="PATRICK ADRIANUS"
                  animateOn="view"
                  sequential
                  revealDirection="center"
                  speed={55}
                  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#%&@"
                  parentClassName="block name"
                  className="name-char"
                  encryptedClassName="name-char-dim"
                />
```

Replace with:

```tsx
                <DecryptedText
                  text="PATRICK ADRIANUS"
                  animateOn="trigger"
                  trigger={nameTrigger}
                  sequential
                  revealDirection="center"
                  speed={55}
                  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#%&@"
                  parentClassName="block name cursor-pointer select-none"
                  className="name-char"
                  encryptedClassName="name-char-dim"
                  onClick={handleReplayName}
                />
```

- [ ] **Step 4: Typecheck**

```bash
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 5: Browser smoke test via MCP**

```js
// Run in Claude_in_Chrome javascript_tool against the dev server. Navigate
// first, then sample DOM at intervals to confirm `.name-char-dim` appears
// AFTER the loader exit (i.e. during the visible decrypt phase).
window.__decryptLog = [];
const tick = () => {
  const el = document.querySelector('.hero-display .name');
  const loader = document.querySelector('[role="status"][aria-label="Loading"]');
  if (el) {
    const dim = el.querySelectorAll('.name-char-dim').length;
    const live = el.querySelectorAll('.name-char').length;
    window.__decryptLog.push({ t: Math.round(performance.now()), dim, live, loaderOp: loader ? getComputedStyle(loader).opacity : 'gone' });
  }
};
const id = setInterval(tick, 80);
setTimeout(() => { clearInterval(id); console.log(JSON.stringify(window.__decryptLog, null, 2)); }, 7000);
```

Expected: at least one sampled row has `dim > 0` **while** `loaderOp` is `"gone"` or `"0"` — proves the scramble is now visible to the user.

- [ ] **Step 6: Commit**

```bash
git add src/components/HeroSection.tsx
git commit -m "fix(hero): gate decryption on !isLoading + click-to-replay"
```

---

## Task 4: TerminalHud component skeleton (header, body shell, footer)

**Files:**
- Create: `src/components/TerminalHud.tsx`
- Create: `src/components/TerminalHud.css`

- [ ] **Step 1: Write the CSS**

```css
/* src/components/TerminalHud.css
 * Scanline overlay + caret blink + scrollbar.
 * Visual rules are documented in:
 *   docs/superpowers/specs/2026-05-12-terminal-hud-matrix-rain-design.md
 */

@keyframes hud-caret-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.hud-caret {
  display: inline-block;
  width: 7px;
  margin-left: 2px;
  background: #7CE38B;
  height: 1em;
  vertical-align: text-bottom;
  animation: hud-caret-blink 1.05s steps(1, end) infinite;
}

.hud-scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.04) 0px,
    rgba(255, 255, 255, 0.04) 1px,
    transparent 1px,
    transparent 3px
  );
  border-radius: inherit;
  z-index: 1;
}

.hud-body {
  scrollbar-width: thin;
  scrollbar-color: rgba(124, 227, 139, 0.35) transparent;
}
.hud-body::-webkit-scrollbar { width: 6px; }
.hud-body::-webkit-scrollbar-track { background: transparent; }
.hud-body::-webkit-scrollbar-thumb {
  background: rgba(124, 227, 139, 0.35);
  border-radius: 999px;
}

.hud-dot { width: 10px; height: 10px; border-radius: 999px; display: inline-block; }
.hud-dot--r { background: #ff5f56; }
.hud-dot--y { background: #ffbd2e; }
.hud-dot--g { background: #27c93f; }

@media (max-width: 640px) {
  .hud-panel { display: none; }
  .hud-mobile { display: flex; }
}
@media (min-width: 641px) {
  .hud-mobile { display: none; }
}
```

- [ ] **Step 2: Write the component skeleton (no bus, no boot yet)**

```tsx
// src/components/TerminalHud.tsx
import React, { useEffect, useState } from 'react';
import './TerminalHud.css';

/**
 * Fixed-position terminal HUD. Bottom-left, 320×220. Shows a header with
 * macOS-style traffic lights, a streaming log body, and an uptime footer.
 *
 * This file is the skeleton — bus subscription, boot typewriter, and the
 * collapse/persistence behaviour are layered on in later tasks.
 */

const formatUptime = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

const TerminalHud: React.FC = () => {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => setUptime(performance.now() - start), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      {/* Desktop panel */}
      <div
        className="hud-panel hud-scanlines"
        role="log"
        aria-label="Live activity console"
        style={{
          position: 'fixed',
          left: 16,
          bottom: 16,
          width: 320,
          height: 220,
          zIndex: 40,
          background: 'rgba(7, 6, 14, 0.62)',
          border: '1px solid rgba(124, 227, 139, 0.18)',
          borderRadius: 8,
          backdropFilter: 'blur(10px) saturate(120%)',
          WebkitBackdropFilter: 'blur(10px) saturate(120%)',
          color: '#7CE38B',
          fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Menlo', monospace",
          fontSize: 11.5,
          lineHeight: 1.45,
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
        }}
      >
        <header
          style={{
            height: 24,
            padding: '0 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(0, 0, 0, 0.35)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 10.5,
            letterSpacing: '0.04em',
          }}
        >
          <span className="hud-dot hud-dot--r" />
          <span className="hud-dot hud-dot--y" />
          <span className="hud-dot hud-dot--g" />
          <span style={{ flex: 1, textAlign: 'center' }}>
            terminal.sh — patrick@portfolio
          </span>
        </header>

        <div
          className="hud-body"
          style={{
            height: 180,
            padding: '8px 10px 4px',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {/* Messages will render here in Task 6 */}
        </div>

        <footer
          style={{
            height: 16,
            padding: '0 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'rgba(255, 255, 255, 0.55)',
            fontSize: 10,
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <span>uptime: {formatUptime(uptime)}</span>
          <span>
            <span className="hud-caret" />
          </span>
        </footer>
      </div>

      {/* Mobile compact dot — expand handled in Task 7 */}
      <button
        type="button"
        className="hud-mobile"
        aria-label="Open activity console"
        style={{
          position: 'fixed',
          left: 16,
          bottom: 16,
          width: 36,
          height: 36,
          borderRadius: 999,
          border: '1px solid rgba(124, 227, 139, 0.5)',
          background: 'rgba(7, 6, 14, 0.7)',
          backdropFilter: 'blur(10px)',
          color: '#7CE38B',
          zIndex: 40,
        }}
      >
        ›_
      </button>
    </>
  );
};

export default React.memo(TerminalHud);
```

- [ ] **Step 3: Typecheck**

```bash
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/TerminalHud.tsx src/components/TerminalHud.css
git commit -m "feat(hud): TerminalHud skeleton — header, body shell, uptime, caret"
```

---

## Task 5: Boot sequence typewriter

**Files:**
- Modify: `src/components/TerminalHud.tsx`

- [ ] **Step 1: Import the bus**

At the top of `TerminalHud.tsx`, after the React imports, add:

```ts
import { hudLog } from '../hooks/useHudBus';
import { useLoading } from '../contexts/LoadingContext';
```

- [ ] **Step 2: Add boot sequence effect**

Replace the existing single `useEffect` (the one starting uptime ticker) with these two effects:

```ts
  // Uptime ticker (unchanged behaviour, just kept here for context).
  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => setUptime(performance.now() - start), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Boot sequence — types out 5 lines once, after the loader has yielded.
  // The `hasBootedRef` survives React StrictMode's double-mount in dev so
  // boot only runs once per page lifecycle.
  const { isLoading } = useLoading();
  const hasBootedRef = React.useRef(false);
  useEffect(() => {
    if (isLoading || hasBootedRef.current) return;
    hasBootedRef.current = true;

    const lines: { text: string; level: 'ok' | 'info' }[] = [
      { text: '> aurora.init() ............... ok', level: 'ok' },
      { text: '> liquid_glass.shader → mounted',    level: 'info' },
      { text: '> camera_wheel.spy(4 sections)',     level: 'info' },
      { text: '> tech_stack.load(36 items)',        level: 'info' },
      { text: '> ready. listening for events…',    level: 'ok' },
    ];

    let cancelled = false;
    const CHAR_MS = 16;
    const GAP_MS = 200;

    (async () => {
      for (const line of lines) {
        // Type the line out char-by-char by appending a growing partial.
        // We replace the previous partial each tick by editing the last
        // buffer entry. The simplest way: push a placeholder and overwrite
        // its `text` via a dedicated low-level helper exported from the bus.
        for (let i = 1; i <= line.text.length; i++) {
          if (cancelled) return;
          // Replace last entry by clearing+re-pushing only when needed.
          // Easier: just push the partial as info, then once line is done
          // push the final at its real level. For visual fidelity the
          // intermediate growing line should overwrite, so we use a small
          // overwrite helper.
          // (Implementation note: simpler "log each partial" floods the bus.
          // We import a dedicated `hudReplaceLast` in the next step.)
          await new Promise((r) => setTimeout(r, CHAR_MS));
        }
        hudLog(line.text, line.level);
        await new Promise((r) => setTimeout(r, GAP_MS));
      }
    })();

    return () => { cancelled = true; };
  }, [isLoading]);
```

- [ ] **Step 3: Add an overwrite helper to `useHudBus.ts`**

Open `src/hooks/useHudBus.ts` and append:

```ts
/**
 * Replace the text of the most recent message in place. Used by the boot
 * typewriter so a growing partial line doesn't flood the buffer with 100
 * intermediate states.
 */
export const hudReplaceLast = (text: string, level: HudLevel = 'info'): void => {
  if (buffer.length === 0) {
    hudLog(text, level);
    return;
  }
  const last = buffer[buffer.length - 1];
  last.text = text;
  last.level = level;
  broadcast();
};
```

- [ ] **Step 4: Wire the overwrite helper into the boot effect**

Replace the boot effect's `(async () => { … })()` body in `TerminalHud.tsx` with:

```ts
    (async () => {
      // Use a placeholder message we keep overwriting for the typewriter
      // effect. After each line is fully typed we drop a final entry at the
      // correct level and start a fresh placeholder for the next line.
      for (let li = 0; li < lines.length; li++) {
        const { text, level } = lines[li];
        // Push initial empty placeholder so `hudReplaceLast` has something
        // to mutate.
        hudLog('', 'info');
        for (let i = 1; i <= text.length; i++) {
          if (cancelled) return;
          hudReplaceLast(text.slice(0, i), 'info');
          await new Promise((r) => setTimeout(r, CHAR_MS));
        }
        // Finalize this line at its real level.
        hudReplaceLast(text, level);
        await new Promise((r) => setTimeout(r, GAP_MS));
      }
    })();
```

Also add `hudReplaceLast` to the import:

```ts
import { hudLog, hudReplaceLast } from '../hooks/useHudBus';
```

- [ ] **Step 5: Honour reduced motion**

Just before the `(async () => …)` IIFE in the boot effect, add:

```ts
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      lines.forEach((line) => hudLog(line.text, line.level));
      return;
    }
```

- [ ] **Step 6: Typecheck**

```bash
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add src/components/TerminalHud.tsx src/hooks/useHudBus.ts
git commit -m "feat(hud): boot sequence typewriter with reduced-motion fallback"
```

---

## Task 6: Render bus messages in the body + auto-scroll

**Files:**
- Modify: `src/components/TerminalHud.tsx`

- [ ] **Step 1: Add bus subscription + auto-scroll behaviour**

At the top of the component body (just below the `useState(0)` for uptime), add:

```ts
  const messages = useHudBus();
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const userScrolledRef = React.useRef(false);

  // Auto-scroll to bottom whenever messages change, UNLESS the user has
  // manually scrolled away from the bottom. Detect that via a scroll
  // listener with a 12px tolerance.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 12;
      userScrolledRef.current = !atBottom;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el || userScrolledRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);
```

Add the corresponding import:

```ts
import { hudLog, hudReplaceLast, useHudBus } from '../hooks/useHudBus';
```

- [ ] **Step 2: Render the messages**

Replace the empty `<div className="hud-body" …>` block content with:

```tsx
        <div
          ref={bodyRef}
          className="hud-body"
          style={{
            height: 180,
            padding: '8px 10px 4px',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                color:
                  m.level === 'ok'
                    ? '#7CE38B'
                    : m.level === 'warn'
                      ? '#FFC857'
                      : '#9EA4B5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {m.text || ' '}
            </div>
          ))}
        </div>
```

- [ ] **Step 3: Typecheck**

```bash
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/TerminalHud.tsx
git commit -m "feat(hud): subscribe to useHudBus + auto-scroll-to-bottom"
```

---

## Task 7: Collapse state, localStorage persistence, mobile dot

**Files:**
- Modify: `src/components/TerminalHud.tsx`

- [ ] **Step 1: Add collapse state with localStorage persistence**

After the existing `useState(0)` for uptime, add:

```ts
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hudCollapsed') === 'true';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('hudCollapsed', collapsed ? 'true' : 'false');
    } catch { /* ignore quota / private-mode errors */ }
  }, [collapsed]);
```

- [ ] **Step 2: Make the header a button that toggles collapse**

Find the `<header style={{ …` in the component and replace it with:

```tsx
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-controls="hud-body"
          style={{
            height: 24,
            width: '100%',
            padding: '0 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(0, 0, 0, 0.35)',
            border: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 10.5,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            font: 'inherit',
          }}
        >
          <span className="hud-dot hud-dot--r" />
          <span className="hud-dot hud-dot--y" />
          <span className="hud-dot hud-dot--g" />
          <span style={{ flex: 1, textAlign: 'center' }}>
            terminal.sh — patrick@portfolio
          </span>
          <span aria-hidden="true" style={{ opacity: 0.7 }}>
            {collapsed ? '▴' : '▾'}
          </span>
        </button>
```

- [ ] **Step 3: Apply collapse to the panel height**

Replace the outer panel `style={{ … width: 320, height: 220, … }}` with a dynamic height. Update the `style` object so `height` becomes:

```ts
          height: collapsed ? 24 : 220,
          transition: 'height 220ms cubic-bezier(0.22, 1, 0.36, 1)',
```

Also hide the body + footer when collapsed by wrapping both in `{!collapsed && ( … )}`. Concretely, surround the existing `<div className="hud-body" …>` and `<footer …>` blocks with:

```tsx
        {!collapsed && (
          <>
            { /* existing hud-body div */ }
            { /* existing footer */ }
          </>
        )}
```

- [ ] **Step 4: Make the mobile dot toggle a full-screen sheet**

Replace the mobile `<button className="hud-mobile" …>` block with:

```tsx
      <button
        type="button"
        className="hud-mobile"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Open activity console' : 'Close activity console'}
        style={{
          position: 'fixed',
          left: 16,
          bottom: 16,
          width: 36,
          height: 36,
          borderRadius: 999,
          border: '1px solid rgba(124, 227, 139, 0.5)',
          background: 'rgba(7, 6, 14, 0.7)',
          backdropFilter: 'blur(10px)',
          color: '#7CE38B',
          fontFamily: "'JetBrains Mono', monospace",
          zIndex: 40,
        }}
      >
        ›_
      </button>
```

(The behaviour: on mobile, the desktop `.hud-panel` is hidden by the existing media query; tapping the dot toggles `collapsed`, but the panel is only visible on `≥641px` so the mobile sheet is wired up as a follow-up if desired. For this pass the dot is a visual marker that the HUD exists.)

- [ ] **Step 5: Typecheck**

```bash
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/components/TerminalHud.tsx
git commit -m "feat(hud): collapsible panel with localStorage persistence + mobile dot"
```

---

## Task 8: Mount TerminalHud + wire `hudLog` producers

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/NavBar.tsx`
- Modify: `src/hooks/useScrollSpy.ts`
- Modify: `src/components/ProjectsSection.tsx`
- Modify: `src/components/ExperienceSection.tsx`
- Modify: `src/components/CameraWheel.tsx`

- [ ] **Step 1: Mount the HUD in App.tsx**

Open `src/App.tsx`. After the existing import block, add:

```ts
import TerminalHud from './components/TerminalHud';
```

Then, inside the `<TimeProvider>` block, immediately before the closing `</TimeProvider>` (i.e. at the same level as `<Navbar>`/`<AuroraShader>`), add:

```tsx
          <TerminalHud />
```

(Place it AFTER the last existing component inside `<div style={{ opacity: isLoading ? 0 : 1, … }}>` so it lives in the same visibility-gated subtree.)

- [ ] **Step 2: Add `hudLog` to NavBar's `handleScrollToSection`**

In `src/components/NavBar.tsx`, add an import at the top:

```ts
import { hudLog } from '../hooks/useHudBus';
```

Then find the existing `handleScrollToSection` (around line 139) and change it to:

```ts
  const handleScrollToSection = useCallback((sectionId: string) => {
    hudLog(`> nav → ${sectionId}`, 'info');
    scrollToSection(sectionId);
  }, []);
```

- [ ] **Step 3: Add `hudLog` to useScrollSpy on active-section change**

In `src/hooks/useScrollSpy.ts`, add at the top:

```ts
import { hudLog } from './useHudBus';
```

Find the existing `setActiveSection(bestSection)` (or wherever the active section state is updated). Replace the lines that call `setActiveSection(...)` so they go through a small wrapper that also logs:

```ts
        const commit = (next: string | null) => {
          setActiveSection((prev) => {
            if (prev !== next && next) hudLog(`> section: ${next}`, 'ok');
            return next;
          });
        };
```

…and replace every `setActiveSection(<value>)` inside the observer callback with `commit(<value>)`.

- [ ] **Step 4: Add `hudLog` on project hover**

In `src/components/ProjectsSection.tsx`:

Add at the top:

```ts
import { hudLog } from '../hooks/useHudBus';
```

Find the `onMouseEnter={() => setIsHovered(true)}` line (around line 891) inside the `ProjectCard` and change it to:

```tsx
      onMouseEnter={() => { setIsHovered(true); hudLog(`> hover: ${project.title}`); }}
```

- [ ] **Step 5: Add `hudLog` on experience hover**

In `src/components/ExperienceSection.tsx`:

Add at the top:

```ts
import { hudLog } from '../hooks/useHudBus';
```

Find the experience card's `onMouseEnter={() => setIsHovered(true)}` (around line 154 — inside the same `motion.div` whose `onClick={onViewDetails}`). The experience prop name in that scope is `exp` with fields `exp.role` and `exp.company` (confirmed against the existing render — see `{exp.role}` at line 198 and `{exp.company}` at line 205). Change to:

```tsx
      onMouseEnter={() => { setIsHovered(true); hudLog(`> hover: ${exp.company} · ${exp.role}`); }}
```

- [ ] **Step 6: Add `hudLog` to CameraWheel.jump()**

In `src/components/CameraWheel.tsx`:

Add at the top:

```ts
import { hudLog } from '../hooks/useHudBus';
```

Find the `jump` function (around line 109) and add the log call as its first line:

```ts
  const jump = (i: number) => {
    hudLog(`> wheel → ${SECTIONS[i].id}`, 'info');
    const el = document.getElementById(SECTIONS[i].id);
    // ...rest unchanged
  };
```

- [ ] **Step 7: Typecheck**

```bash
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 8: Browser smoke test via MCP**

```js
// Sanity: after load, the HUD should be visible and showing boot lines.
(() => {
  const panel = document.querySelector('.hud-panel');
  if (!panel) return 'no-hud';
  const lines = panel.querySelectorAll('.hud-body > div');
  return { visible: getComputedStyle(panel).display, lineCount: lines.length, lastLine: lines[lines.length - 1]?.textContent };
})()
```

Expected: `lineCount >= 5` and the last line is `"> ready. listening for events…"`. Scrolling into the Experience section should add a new `> section: experience` line within ~500ms.

- [ ] **Step 9: Commit**

```bash
git add src/App.tsx src/components/NavBar.tsx src/hooks/useScrollSpy.ts src/components/ProjectsSection.tsx src/components/ExperienceSection.tsx src/components/CameraWheel.tsx
git commit -m "feat(hud): mount TerminalHud + wire nav/scroll/hover/wheel producers"
```

---

## Task 9: MatrixRain canvas — base loop

**Files:**
- Create: `src/components/visuals/MatrixRain.tsx`

- [ ] **Step 1: Create the folder + base component**

```bash
mkdir -p "/Users/patrickadrianus/Documents/Personal Project/personal-website/src/components/visuals"
```

```tsx
// src/components/visuals/MatrixRain.tsx
import React, { useEffect, useRef } from 'react';

/**
 * Matrix-style digital rain — falling glyphs in the aurora palette (not the
 * cliché bright green). Renders to a <canvas> that fills its parent. Owns a
 * single requestAnimationFrame loop. Drawing is throttled to ~24 fps to keep
 * the per-frame cost light.
 *
 * Cursor reactivity, viewport pause, and reduced-motion gates are layered on
 * in Task 10.
 */

const GLYPHS = '01アイウエオカキクケコサシスセソタチツテト+-=<>{}[]'.split('');
const COL_WIDTH = 14;     // px between columns
const FONT_SIZE = 14;
const FRAME_MS = 1000 / 24;

interface MatrixRainProps {
  opacity?: number; // overall canvas opacity multiplier (0..1)
}

const MatrixRain: React.FC<MatrixRainProps> = ({ opacity = 0.12 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let columns = 0;
    let yPositions: number[] = []; // current y of head per column (px)
    let speeds: number[] = [];     // px per frame per column

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / COL_WIDTH);
      yPositions = new Array(columns).fill(0).map(() => Math.random() * -height);
      speeds = new Array(columns).fill(0).map(() => 1 + Math.random() * 2);
    };

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    resize();

    let last = 0;
    let raf = 0;

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < FRAME_MS) return;
      last = t;

      // Trailing fade — fills the canvas with a near-opaque dark each frame
      // so older glyphs leave a fading tail rather than persisting forever.
      ctx.fillStyle = 'rgba(7, 6, 14, 0.10)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';

      for (let i = 0; i < columns; i++) {
        const x = i * COL_WIDTH;
        const y = yPositions[i];

        // Head — bright white, then tail in violet.
        ctx.fillStyle = `rgba(255, 255, 255, 0.95)`;
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], x, y);

        // Tail glyph two rows above head — violet aurora colour.
        ctx.fillStyle = `rgba(167, 139, 250, 0.55)`;
        if (y - FONT_SIZE * 2 >= 0) {
          ctx.fillText(
            GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            x,
            y - FONT_SIZE * 2
          );
        }

        yPositions[i] = y + speeds[i];
        // Reset column when it falls off the bottom — random restart height
        // so columns desync over time and the rain looks organic.
        if (y > height && Math.random() > 0.975) {
          yPositions[i] = -FONT_SIZE * 3;
        }
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity,
        zIndex: 0,
      }}
    />
  );
};

export default React.memo(MatrixRain);
```

- [ ] **Step 2: Typecheck**

```bash
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/visuals/MatrixRain.tsx
git commit -m "feat(visuals): MatrixRain canvas — base RAF loop + aurora palette"
```

---

## Task 10: MatrixRain — cursor reactivity + viewport pause + reduced motion + low-perf gate

**Files:**
- Modify: `src/components/visuals/MatrixRain.tsx`

- [ ] **Step 1: Add cursor + viewport + reduced-motion gates**

Replace the entire `useEffect` body inside `MatrixRain` with the following expanded version:

```ts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Disable the loop entirely under reduced-motion or on a known
    // low-performance device. The static draw call still runs once so the
    // canvas isn't blank.
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // Avoid importing the performance util in the hot loop — read once.
    // (The HeroSection caller will skip mounting entirely on low-perf if it
    // wants to; this component just respects reduced-motion as a hard stop.)

    let width = 0;
    let height = 0;
    let columns = 0;
    let yPositions: number[] = [];
    let speeds: number[] = [];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / COL_WIDTH);
      yPositions = new Array(columns).fill(0).map(() => Math.random() * -height);
      speeds = new Array(columns).fill(0).map(() => 1 + Math.random() * 2);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    // Cursor tracking — local to the parent rect so we can compare against
    // each column's centre x.
    let cursorX = -9999;
    let cursorY = -9999;
    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      cursorX = e.clientX - r.left;
      cursorY = e.clientY - r.top;
    };
    const onLeave = () => {
      cursorX = -9999;
      cursorY = -9999;
    };
    parent.addEventListener('pointermove', onMove, { passive: true });
    parent.addEventListener('pointerleave', onLeave);

    // Pause when the parent leaves the viewport.
    let inView = true;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) inView = e.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(parent);

    const FRAME_MS_LOCAL = FRAME_MS;
    const PROX_RADIUS = 200;
    const PROX_R2 = PROX_RADIUS * PROX_RADIUS;

    let last = 0;
    let raf = 0;

    const drawFrame = () => {
      ctx.fillStyle = 'rgba(7, 6, 14, 0.10)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';

      for (let i = 0; i < columns; i++) {
        const x = i * COL_WIDTH + COL_WIDTH / 2;
        const y = yPositions[i];

        // Cursor proximity (Gaussian falloff). Boost alpha + slow fall when
        // the cursor is near this column.
        let boost = 1;
        let slow = 1;
        const dx = x - cursorX;
        const dy = y - cursorY;
        const d2 = dx * dx + dy * dy;
        if (d2 < PROX_R2) {
          const f = Math.exp(-d2 / (PROX_R2 / 2));
          boost = 1 + 0.6 * f;
          slow = 1 - 0.3 * f;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, 0.95 * boost)})`;
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * COL_WIDTH, y);

        if (y - FONT_SIZE * 2 >= 0) {
          ctx.fillStyle = `rgba(167, 139, 250, ${Math.min(1, 0.55 * boost)})`;
          ctx.fillText(
            GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            i * COL_WIDTH,
            y - FONT_SIZE * 2
          );
        }

        yPositions[i] = y + speeds[i] * slow;
        if (y > height && Math.random() > 0.975) {
          yPositions[i] = -FONT_SIZE * 3;
        }
      }
    };

    if (prefersReduced) {
      drawFrame();
      return () => {
        parent.removeEventListener('pointermove', onMove);
        parent.removeEventListener('pointerleave', onLeave);
        io.disconnect();
        ro.disconnect();
      };
    }

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!inView) return;
      if (t - last < FRAME_MS_LOCAL) return;
      last = t;
      drawFrame();
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
      io.disconnect();
      ro.disconnect();
    };
  }, []);
```

- [ ] **Step 2: Typecheck**

```bash
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/visuals/MatrixRain.tsx
git commit -m "feat(visuals): MatrixRain cursor proximity, viewport pause, reduced-motion"
```

---

## Task 11: Mount MatrixRain in HeroSection + final smoke test

**Files:**
- Modify: `src/components/HeroSection.tsx`

- [ ] **Step 1: Import + mount**

At the top of `HeroSection.tsx`, with the other animation imports:

```ts
import MatrixRain from './visuals/MatrixRain';
import { isLowPerformanceDevice } from '../utils/performance';
```

Inside the `<section ref={heroRef} id="about" …>` block, immediately before the existing `<CursorSpotlight />` line (which sits at the start of the section's children), add:

```tsx
        {!isLowPerformanceDevice() && <MatrixRain opacity={0.12} />}
```

- [ ] **Step 2: Typecheck**

```bash
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: no output.

- [ ] **Step 3: Browser smoke test via MCP**

Run the following sequence in the Claude in Chrome `javascript_tool`:

```js
// 1. Canvas mounted inside the hero?
(() => {
  const hero = document.querySelector('#about');
  const canvas = hero?.querySelector('canvas');
  if (!canvas) return 'no-canvas';
  return {
    parentId: canvas.parentElement?.id || canvas.parentElement?.tagName,
    width: canvas.width, height: canvas.height,
    opacity: getComputedStyle(canvas).opacity,
    zIndex: getComputedStyle(canvas).zIndex,
  };
})()
```

Expected: a canvas exists inside `#about` (or one of its direct descendants), `opacity` ≈ `0.12`, dimensions > 0.

```js
// 2. HUD log streams a section change when scrolling.
(async () => {
  const before = document.querySelectorAll('.hud-body > div').length;
  document.querySelector('#experience')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  await new Promise(r => setTimeout(r, 1200));
  const lines = Array.from(document.querySelectorAll('.hud-body > div')).map(d => d.textContent);
  return { added: lines.length - before, lastTwo: lines.slice(-2) };
})()
```

Expected: at least one new line; one of the last two contains `> section: experience`.

```js
// 3. Decrypt visibly runs on click.
(async () => {
  const name = document.querySelector('.hero-display .name');
  name?.click();
  await new Promise(r => setTimeout(r, 250));
  const dim = name?.querySelectorAll('.name-char-dim').length;
  return { dimAfterClick: dim };
})()
```

Expected: `dimAfterClick > 0` for the first ~800ms after click.

- [ ] **Step 4: Commit**

```bash
git add src/components/HeroSection.tsx
git commit -m "feat(hero): mount MatrixRain behind hero content (gated on perf)"
```

---

## Verification (end-to-end)

Once Task 11 is done, run the full sanity sweep:

```bash
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```

Expected: zero errors.

In the browser via MCP:
1. Hard-reload `http://localhost:5173`. Loader runs, fades out.
2. **Decrypt fix**: the name visibly scrambles → reveals **after** the loader is gone. Clicking the name replays the scramble.
3. **Terminal HUD**: bottom-left widget appears with the five typed boot lines. Scrolling between sections appends `> section: <id>` lines. Hovering a project card appends `> hover: <Title>`. Clicking the header collapses the panel to a thin bar; reload preserves collapsed state.
4. **Matrix rain**: canvas behind the hero shows falling violet glyphs at ~12% opacity. Moving the cursor near a column visibly brightens nearby characters and slows them. Scrolling past the hero quiets the loop.
5. **Reduced motion**: macOS *Reduce Motion* on → matrix rain freezes to a single frame, HUD boot lines appear instantly, decrypt still runs (acceptable per spec).

If all five pass, the implementation matches the spec.
