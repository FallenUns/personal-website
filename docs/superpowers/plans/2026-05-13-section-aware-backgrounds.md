# Section-aware backgrounds + react-bits registry + polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Slow the hero decrypt + strip two decorative text effects, wire the project to the react-bits shadcn registry, and replace the always-on `AuroraShader` with a calm `SoftAurora` base + per-section overlay (`DotGrid` / `LightRays` / `Particles`) crossfaded by IntersectionObserver.

**Architecture:** Polish fixes are surgical edits to `HeroSection.tsx`. Registry wiring adds a `@/*` path alias (Vite + tsconfig), a `components.json` at root, and the `shadcn` devDependency. Four react-bits components are pulled via `npx shadcn@latest add` (with a manual fallback if the CLI prompts interactively). A new `SectionBackground` component mounts those four as one always-on base + a single `AnimatePresence` overlay layer driven by which section has the highest intersection ratio.

**Tech Stack:** React 18 + TypeScript + Vite 6 + framer-motion + Tailwind v4 + ogl (pulled by react-bits) + gsap (pulled by react-bits). No test framework — verification is `npx tsc --noEmit -p tsconfig.json` plus Claude in Chrome MCP smoke checks.

**Spec:** [`docs/superpowers/specs/2026-05-13-section-aware-backgrounds-design.md`](../specs/2026-05-13-section-aware-backgrounds-design.md)

---

## File map

| File | Disposition | Purpose |
|------|-------------|---------|
| `src/components/HeroSection.tsx` | Modify | Decrypt speed 55→110; drop `.shiny-text` from eyebrow; drop `elementLevelClassName="gradient-text"` from RotatingText; add `text-white` + text-shadow back to RotatingText's `mainClassName`. |
| `tsconfig.app.json` | Modify | Add `baseUrl: "."` + `paths: { "@/*": ["./src/*"] }`. |
| `vite.config.ts` | Modify | Add `resolve.alias: { "@": path.resolve(__dirname, "./src") }`. |
| `components.json` | Create | shadcn config with `@react-bits` registry mapping + aliases pointing at `@/components`, `@/hooks`, `@/utils`. |
| `package.json` | Modify | Add `shadcn` devDependency. `ogl` and `gsap` are pulled in as runtime deps by the registry installs. |
| `src/components/visuals/SoftAurora/SoftAurora.tsx` | Create via shadcn CLI | Soft cosine-palette aurora shader. Base layer. |
| `src/components/visuals/DotGrid/DotGrid.tsx` | Create via shadcn CLI | Animated dot grid. Experience overlay. |
| `src/components/visuals/LightRays/LightRays.tsx` | Create via shadcn CLI | Volumetric light rays. Projects overlay. |
| `src/components/visuals/Particles/Particles.tsx` | Create via shadcn CLI | Configurable particle system. Contact overlay. |
| `src/components/visuals/SectionBackground.tsx` | Create | Mux. Mounts SoftAurora always at opacity 0.55. IntersectionObserver picks active section. AnimatePresence crossfades the corresponding overlay at opacity 0.35. About has no overlay. |
| `src/App.tsx` | Modify | Replace `<AuroraShader />` + `<TechBackground hour={…} />` mounts with `<SectionBackground />`. Remove their imports. Leave the source files on disk (cleanup is out of scope). |

---

## Task 1: Three polish fixes in HeroSection

**Files:**
- Modify: `src/components/HeroSection.tsx`

- [ ] **Step 1: Slow the decrypt + drop the two decorative effects**

Open `src/components/HeroSection.tsx`. Make THREE edits.

(a) Find the DecryptedText for the hero name (search for `text="PATRICK ADRIANUS"`). Change `speed={55}` to `speed={110}`. The block should look like:

```tsx
                <DecryptedText
                  text="PATRICK ADRIANUS"
                  animateOn="trigger"
                  trigger={nameTrigger}
                  sequential
                  revealDirection="center"
                  speed={110}
                  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#%&@"
                  parentClassName="block name cursor-pointer select-none"
                  className="name-char"
                  encryptedClassName="name-char-dim"
                  onClick={handleReplayName}
                />
```

(b) Find the eyebrow span (search for `Hello, my name is` or `hero-eyebrow shiny-text`). Drop the `shiny-text` class from its `className`. The span should become:

```tsx
                <span className="hero-eyebrow [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                  Hello, my name is
                </span>
```

(c) Find the `<RotatingText>` for the role rotation (search for `texts={[` immediately followed by `'Data Scientist'` or similar). Remove the `elementLevelClassName="gradient-text"` prop entirely. Then update `mainClassName` to re-add white colour + text-shadow that the gradient class was supplying. The block should become:

```tsx
                <RotatingText
                  texts={[
                    'Data Scientist',
                    'Full-Stack Developer',
                    'AI Engineer',
                  ]}
                  rotationInterval={2400}
                  staggerDuration={0.022}
                  staggerFrom="last"
                  splitBy="characters"
                  auto
                  loop
                  mainClassName="text-base sm:text-lg font-medium font-body-grotesk text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] inline-flex"
                  splitLevelClassName="overflow-hidden"
                  transition={{ type: 'spring', damping: 28, stiffness: 360 }}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '-110%', opacity: 0 }}
                />
```

Do not edit anything else in this file.

- [ ] **Step 2: Typecheck**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```
Expected: no output.

- [ ] **Step 3: Commit**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && git add src/components/HeroSection.tsx && git commit -m "polish(hero): slower decrypt + drop shiny eyebrow + drop gradient role"
```

---

## Task 2: Add `@/*` path alias to TypeScript + Vite

**Files:**
- Modify: `tsconfig.app.json`
- Modify: `vite.config.ts`

The shadcn CLI writes imports like `from '@/components/...'`. The project currently has no `@` alias, so we add one before installing any registry components.

- [ ] **Step 1: Add path alias to TypeScript**

Open `tsconfig.app.json`. Inside `compilerOptions`, ABOVE the `/* Bundler mode */` comment, add:

```json
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
```

The full `compilerOptions` block should now look like:

```json
"compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    ...
```

Leave the rest of the file untouched.

- [ ] **Step 2: Add resolve alias to Vite**

Open `vite.config.ts`. Add a `path` import at the very top (after the existing imports):

```ts
import path from 'node:path';
```

Then inside `defineConfig({ ... })`, ADD a `resolve` block at the top level (alongside `plugins`, `server`, `build`):

```ts
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
```

Place it before `server: { ... }` for readability. Do not modify `plugins` / `server` / `build`.

- [ ] **Step 3: Verify the alias resolves in a test import**

Add a one-line probe to `tsconfig.app.json` — actually skip; the next step will confirm via typecheck against existing imports (which still use relative paths, so nothing should break).

- [ ] **Step 4: Typecheck**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```
Expected: no output. If you see errors mentioning `Cannot find module '@/...'`, the `paths` block is misformatted.

- [ ] **Step 5: Commit**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && git add tsconfig.app.json vite.config.ts && git commit -m "build: add @/* path alias to tsconfig + vite for shadcn registry"
```

---

## Task 3: components.json + shadcn devDependency

**Files:**
- Create: `components.json`
- Modify: `package.json` (via npm)

- [ ] **Step 1: Create `components.json` at repo root**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": false,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/utils",
    "ui": "@/components/visuals",
    "lib": "@/utils",
    "hooks": "@/hooks"
  },
  "registries": {
    "@react-bits": "https://reactbits.dev/r/{name}.json"
  }
}
```

(Tailwind v4 doesn't use a `tailwind.config.js` — the empty string is intentional; shadcn skips the config rewrite step.)

- [ ] **Step 2: Add shadcn as a devDependency**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npm install -D shadcn@latest
```

Expected: installs `shadcn` into `node_modules/.bin/shadcn` and updates `package.json` + `package-lock.json`. No other dep changes.

- [ ] **Step 3: Verify the CLI sees the registry**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx shadcn@latest registry list-items '@react-bits' 2>&1 | head -30
```

Expected: a list of available items from the react-bits registry (e.g. "AnimatedContent", "Aurora", etc.). If the CLI version doesn't support `registry list-items`, run `npx shadcn@latest --help` and pick the equivalent listing command — but do not block on this; the important verification is Task 4's actual install.

- [ ] **Step 4: Commit**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && git add components.json package.json package-lock.json && git commit -m "build: wire shadcn CLI + @react-bits registry (https://reactbits.dev/r/)"
```

---

## Task 4: Install the four react-bits backgrounds

**Files:**
- Create via CLI: `src/components/visuals/SoftAurora/SoftAurora.tsx`
- Create via CLI: `src/components/visuals/DotGrid/DotGrid.tsx`
- Create via CLI: `src/components/visuals/LightRays/LightRays.tsx`
- Create via CLI: `src/components/visuals/Particles/Particles.tsx`
- Modify (via CLI): `package.json` — pulls in `ogl@^1.0.11` and `gsap@^3.13.0`.

The components are registered as `<Name>-TS-TW` (TypeScript + Tailwind variant). They place files under the `ui` alias which we set to `@/components/visuals`.

- [ ] **Step 1: Install SoftAurora**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx shadcn@latest add '@react-bits/SoftAurora-TS-TW' --yes
```

Expected: creates `src/components/visuals/SoftAurora/SoftAurora.tsx`, adds `ogl` to `package.json` dependencies. If the CLI prompts for overwrite confirmation, the `--yes` flag handles it.

If the CLI prompts interactively for other questions (e.g. style, base color), it means `components.json` wasn't picked up. Verify `components.json` is at repo root and re-run.

- [ ] **Step 2: Install DotGrid**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx shadcn@latest add '@react-bits/DotGrid-TS-TW' --yes
```

Expected: creates `src/components/visuals/DotGrid/DotGrid.tsx`, adds `gsap` to `package.json` dependencies.

- [ ] **Step 3: Install LightRays**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx shadcn@latest add '@react-bits/LightRays-TS-TW' --yes
```

Expected: creates `src/components/visuals/LightRays/LightRays.tsx`. `ogl` already installed.

- [ ] **Step 4: Install Particles**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx shadcn@latest add '@react-bits/Particles-TS-TW' --yes
```

Expected: creates `src/components/visuals/Particles/Particles.tsx`. `ogl` already installed.

- [ ] **Step 5: Manual fallback if any install fails**

If the CLI fails for any of the four components (network, alias resolution, schema mismatch), fall back to manually fetching the registry JSON and writing the file:

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website"
mkdir -p src/components/visuals/<Name>
curl -s "https://reactbits.dev/r/<Name>-TS-TW.json" | node -e "
  const d = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  for (const f of d.files) {
    const fs = require('fs'), path = require('path');
    const out = path.join('src/components/visuals', f.path);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, f.content);
    console.log('wrote', out);
  }
"
```

Then `npm install ogl@^1.0.11 gsap@^3.13.0` to ensure the runtime deps land. Substitute `<Name>` with the component that failed.

- [ ] **Step 6: Typecheck**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```
Expected: no output. The react-bits files use `import { Renderer, Program, Mesh, Triangle } from 'ogl'` — if ogl wasn't pulled by the CLI, the typecheck will fail with `Cannot find module 'ogl'`; in that case run `npm install ogl@^1.0.11` and re-typecheck.

- [ ] **Step 7: Commit**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && git add src/components/visuals package.json package-lock.json && git commit -m "feat(visuals): install SoftAurora + DotGrid + LightRays + Particles from @react-bits"
```

---

## Task 5: Build `SectionBackground` mux

**Files:**
- Create: `src/components/visuals/SectionBackground.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/visuals/SectionBackground.tsx
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SoftAurora from './SoftAurora/SoftAurora';
import DotGrid from './DotGrid/DotGrid';
import LightRays from './LightRays/LightRays';
import Particles from './Particles/Particles';

/**
 * Section-aware background.
 *
 * Layered visual system that replaces the previous full-screen aurora shader:
 *   1. SoftAurora — always rendered, low intensity. Provides material for
 *      LiquidGlass refraction across the whole site.
 *   2. One section-specific overlay — crossfaded in/out by IntersectionObserver
 *      as the user scrolls. About uses the base only; Experience adds DotGrid,
 *      Projects adds LightRays, Contact adds Particles.
 *
 * Total active layers <= 2 (base + at most one overlay) so paint cost stays
 * bounded. `AnimatePresence mode="wait"` guarantees only one overlay is
 * mounted at a time during transitions.
 */

type SectionId = 'about' | 'experience' | 'projects' | 'contact';

const OVERLAYS: Partial<Record<SectionId, React.ComponentType>> = {
  experience: DotGrid,
  projects: LightRays,
  contact: Particles,
  // `about` intentionally absent — hero uses base only.
};

const SectionBackground: React.FC = () => {
  const [active, setActive] = useState<SectionId>('about');

  useEffect(() => {
    const ids: SectionId[] = ['about', 'experience', 'projects', 'contact'];
    const els = ids
      .map((id) => ({ id, el: document.getElementById(id) }))
      .filter((x): x is { id: SectionId; el: HTMLElement } => !!x.el);
    if (els.length === 0) return;

    // Track intersection ratio per section. Whichever section has the
    // highest ratio at any moment is the "active" one. This handles fast
    // scrolling cleanly — the section taking up most of the viewport wins.
    const visibility = new Map<SectionId, number>(ids.map((id) => [id, 0]));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).id as SectionId;
          visibility.set(id, e.intersectionRatio);
        }
        let best: SectionId = 'about';
        let bestRatio = -1;
        visibility.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        });
        setActive(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    els.forEach(({ el }) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const Overlay = OVERLAYS[active];

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      {/* Always-on base. Wrapped in a div so we can dim it without modifying
          the component's own colours. 0.55 keeps enough material for liquid
          glass refraction. */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
        <SoftAurora />
      </div>

      <AnimatePresence mode="wait">
        {Overlay && (
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <Overlay />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SectionBackground;
```

- [ ] **Step 2: Typecheck**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```
Expected: no output. If the imports fail (`Cannot find module './SoftAurora/SoftAurora'`), the registry installs in Task 4 didn't create the expected paths — verify each file at `src/components/visuals/<Name>/<Name>.tsx`.

- [ ] **Step 3: Commit**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && git add src/components/visuals/SectionBackground.tsx && git commit -m "feat(visuals): SectionBackground mux — soft base + per-section overlay"
```

---

## Task 6: Swap App.tsx to use `SectionBackground`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace the imports**

Open `src/App.tsx`. Find these two imports (they will be on adjacent lines, near other component imports):

```ts
import AuroraShader from './components/AuroraShader';
import TechBackground from './components/TechBackground';
```

Replace BOTH with a single new import:

```ts
import SectionBackground from './components/visuals/SectionBackground';
```

- [ ] **Step 2: Replace the JSX mount points**

In the JSX, find the block where both old backgrounds were mounted. It looks like:

```tsx
          <AuroraShader />
          <TechBackground hour={currentTime} />
```

(They sit inside the `<TimeProvider>` → visibility-gated div, alongside `<Navbar>`, etc.)

Replace BOTH lines with a single line:

```tsx
          <SectionBackground />
```

Keep everything else in the surrounding JSX exactly as-is. The terminal HUD, navbar, sections, loader, etc. stay untouched.

- [ ] **Step 3: Typecheck**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```
Expected: no output. If the typechecker complains about unused imports (`AuroraShader` / `TechBackground` from somewhere else), search the file — the only references should be the two lines you just removed.

- [ ] **Step 4: Commit**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && git add src/App.tsx && git commit -m "feat(app): mount SectionBackground in place of AuroraShader + TechBackground"
```

---

## Task 7: Browser smoke verification

No code changes — this task confirms the live system works as designed.

- [ ] **Step 1: Confirm the dev server is up**

If not already running, start it in a second terminal:

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npm run dev
```

Note the URL (typically `http://localhost:5173`).

- [ ] **Step 2: Decrypt visibility check via Claude in Chrome MCP**

In the browser (or via the MCP `javascript_tool`):

```js
window.__decryptLog = [];
const tick = () => {
  const el = document.querySelector('.hero-display .name');
  const loader = document.querySelector('[role="status"][aria-label="Loading"]');
  if (el) {
    const dim = el.querySelectorAll('.name-char-dim').length;
    const lit = el.querySelectorAll('.name-char').length;
    window.__decryptLog.push({
      t: Math.round(performance.now()),
      dim, lit,
      loaderOp: loader ? getComputedStyle(loader).opacity : 'gone',
    });
  }
};
const id = setInterval(tick, 80);
setTimeout(() => { clearInterval(id); console.log(JSON.stringify(window.__decryptLog, null, 2)); }, 10000);
```

Expected after 10 s: at least one sample with `dim > 0` and `loaderOp === 'gone'` (or below 0.5). The slower `speed={110}` makes the visible-decrypt window roughly 1.8 s — easy to capture.

- [ ] **Step 3: Eyebrow + role plain-text check**

```js
(() => {
  const eyebrow = document.querySelector('.hero-eyebrow');
  const role = document.querySelector('.hero-display .name + * + div span, [class*="font-body-grotesk"] span');
  const eyebrowAnim = eyebrow ? getComputedStyle(eyebrow).animationName : 'no-eyebrow';
  return {
    eyebrowAnim,
    eyebrowFill: eyebrow ? getComputedStyle(eyebrow).webkitTextFillColor : 'no-eyebrow',
    roleSample: role?.textContent,
    roleAnim: role ? getComputedStyle(role).animationName : 'no-role',
  };
})()
```

Expected: `eyebrowAnim === 'none'` (no shiny sweep) and `roleAnim === 'none'` (no gradient shift). `eyebrowFill` should be solid white (`rgb(255, 255, 255)`), not `rgba(0, 0, 0, 0)`.

- [ ] **Step 4: SectionBackground layering check**

```js
(() => {
  const bg = document.querySelector('[aria-hidden="true"][style*="z-index: 0"]');
  if (!bg) return 'no-bg';
  const layers = Array.from(bg.children).map(c => ({
    op: getComputedStyle(c).opacity,
    tag: c.tagName,
    hasCanvas: !!c.querySelector('canvas'),
  }));
  return { layerCount: layers.length, layers };
})()
```

Expected at the top of the page (About): one base layer at opacity ~0.55 with a canvas (SoftAurora). No overlay layer rendered.

- [ ] **Step 5: Section transition check**

```js
(async () => {
  const states = [];
  for (const id of ['about', 'experience', 'projects', 'contact']) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'center' });
    await new Promise(r => setTimeout(r, 1200));
    const bg = document.querySelector('[aria-hidden="true"][style*="z-index: 0"]');
    const overlayCanvas = bg ? bg.querySelectorAll('canvas').length : 0;
    states.push({ section: id, overlayCanvases: overlayCanvas });
  }
  return states;
})()
```

Expected: About → 1 canvas (just base); Experience → 2 canvases (base + DotGrid); Projects → 2 (base + LightRays); Contact → 2 (base + Particles).

- [ ] **Step 6: TypeScript final sanity**

```
cd "/Users/patrickadrianus/Documents/Personal Project/personal-website" && npx tsc --noEmit -p tsconfig.json
```
Expected: zero output.

- [ ] **Step 7: No commit needed for verification**

If all four smoke checks pass, the implementation matches the spec. If any check fails, file the issue and dispatch a fix subagent.

---

## End-to-end verification

After Task 7 passes:

1. Hard-reload `http://localhost:5173`. Loader fades, hero appears.
2. **Decrypt is now visibly slow** — every character flip is perceptible across ~1.8 s.
3. **Eyebrow is plain white** — no shine sweep.
4. **Rotating role is plain white** — character stagger + spring entrance only, no rainbow gradient.
5. **Background:** at About, only the soft cosine-palette aurora. Scroll into Experience and a dot grid fades in over the aurora. Scroll into Projects → light rays. Scroll into Contact → particles. Liquid glass cards still refract whatever is behind them.

If those all hold, the spec is satisfied.
