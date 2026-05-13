# Section-aware backgrounds, react-bits registry, decrypt/typography polish

**Date:** 2026-05-13
**Status:** Approved (pending spec review)

## Context

After the previous round of work (terminal HUD, matrix rain, decrypt fix) the user reported three concrete issues and one larger preference:

1. **Decrypt reveal too fast.** At `speed={55}` and 16 characters the reveal completes in well under a second — fast enough to look like a flash rather than a deliberate kinetic. They want every character flip to register.
2. **Eyebrow shimmer is too much.** The `.shiny-text` metallic sweep on "Hello, my name is" reads as decorative noise on a page that already has aurora + matrix rain + liquid glass + cursor spotlight.
3. **Rotating subtitle gradient is wrong.** The animated purple→pink→sky gradient on each character of the rotating role distracts from the spring-stagger motion. They want the motion alone to carry the effect.
4. **Background fatigue.** The current full-screen `AuroraShader` (heavy fBM shader + chromatic-aberration aurora) is too aggressive and identical across every section. The user wants something **simpler but section-aware** — each section should feel slightly different without losing the liquid-glass language.

Additionally, the user wants the project wired to the **react-bits shadcn registry** (`https://reactbits.dev/r/{name}.json`) so future component additions can be installed via the shadcn CLI instead of hand-ported.

This spec implements the three small fixes, sets up the registry, and reworks the background system into a **hybrid base + per-section overlay** model (option C from brainstorming).

## Goals

- Decrypt reveal is visibly slow enough that the user perceives the scramble→reveal.
- Eyebrow and rotating role render as plain white with text-shadow — motion and weight do the work, not gradient effects.
- A single calm base background replaces the current shader-heavy aurora.
- Each section (About, Experience, Projects, Contact) gets its own kinetic overlay that crossfades in as the section enters the viewport, out as it leaves.
- `npx shadcn@latest add @react-bits/<Name>-TS-TW` resolves and installs into `src/components/visuals/` (or wherever the alias resolves).
- Total active background layers ≤ 2 at any moment (base + one overlay).

## Non-goals

- Removing the LiquidGlass component or changing its refraction.
- Removing the matrix rain (it stays as the hero-specific accent on top of the base, see Architecture).
- Replacing the loader.
- Touching the terminal HUD.
- Building a new background component from scratch — we use react-bits via the registry.

---

## Architecture

Three independent change-sets in one plan:

| Unit | Files touched | Lives in |
|------|---------------|----------|
| **Decrypt + typography polish** | `HeroSection.tsx`, `index.css` (drop `.shiny-text` and `.gradient-text` usages, keep the CSS rules in case other surfaces want them later) | Visual cosmetics |
| **Shadcn registry setup** | `components.json` (new), `package.json` (devDependency), one `npx shadcn init` run | Tooling |
| **Section-aware background system** | `App.tsx`, new `src/components/visuals/SectionBackground.tsx`, react-bits components installed under `src/components/visuals/<Name>/` | Visual layer |

The new background system has a clean contract:

```
<SectionBackground />     // mounted once at app root, fixed full-viewport
├── <BaseAurora />        // soft aurora always rendered at ~50% intensity
└── <OverlayMux>          // switches the active overlay based on visible section
    ├── DotGrid           // visible while Experience is on screen
    ├── LightRays         // visible while Projects is on screen
    └── Particles         // visible while Contact is on screen
```

The OverlayMux uses an `IntersectionObserver` on the four section elements (`#about`, `#experience`, `#projects`, `#contact`) and renders the matching overlay with `opacity` transitioned via framer-motion. About uses the base only (no overlay) so the hero stays the calmest section.

The existing matrix rain stays as a hero-section child — it's clipped to `#about`, so it never fights the OverlayMux which never has an overlay active in About anyway.

## Components & data flow

### 1. Three small fixes

**`HeroSection.tsx`** (3 surgical edits):
- `<DecryptedText … speed={55} …>` → `speed={110}`.
- The `<span className="hero-eyebrow shiny-text …">` → `<span className="hero-eyebrow …">` (drop `shiny-text` from the class string).
- The `<RotatingText … elementLevelClassName="gradient-text" …>` → remove the `elementLevelClassName` prop entirely. The `mainClassName` adds back `text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]` (which it currently lacks because gradient-text was painting the colour).

**`index.css`**: leave the `.shiny-text` and `.gradient-text` rules in place — they're reusable CSS utilities. We just stop using them on these two surfaces.

### 2. Shadcn registry setup

Create `components.json` at repo root:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": false,
    "prefix": ""
  },
  "aliases": {
    "components": "src/components",
    "utils": "src/utils",
    "ui": "src/components/visuals",
    "lib": "src/utils",
    "hooks": "src/hooks"
  },
  "registries": {
    "@react-bits": "https://reactbits.dev/r/{name}.json"
  }
}
```

Add `shadcn` as a devDependency (`npm install -D shadcn@latest`). No `shadcn init` is needed because we hand-write `components.json` with the correct aliases for this Vite project — `init` is for first-time bootstrap and would prompt interactively.

Verify by running `npx shadcn@latest add @react-bits/Particles-TS-TW --dry-run` (read-only) before any real install.

### 3. Section-aware background system

**Install three react-bits components** into `src/components/visuals/`:

```
npx shadcn@latest add @react-bits/SoftAurora-TS-TW
npx shadcn@latest add @react-bits/DotGrid-TS-TW
npx shadcn@latest add @react-bits/LightRays-TS-TW
npx shadcn@latest add @react-bits/Particles-TS-TW
```

If any of those component names differ slightly in the registry (e.g. `SoftAurora` may be packaged under a different file path), substitute the exact name found in the registry JSON. The full registry was confirmed available at `https://reactbits.dev/r/registry.json` and includes all four entries above.

**Create `src/components/visuals/SectionBackground.tsx`**:

```tsx
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SoftAurora from './SoftAurora';
import DotGrid from './DotGrid';
import LightRays from './LightRays';
import Particles from './Particles';

type SectionId = 'about' | 'experience' | 'projects' | 'contact';

const OVERLAYS: Partial<Record<SectionId, React.FC>> = {
  experience: DotGrid,
  projects: LightRays,
  contact: Particles,
  // about intentionally absent — base only
};

const SectionBackground: React.FC = () => {
  const [active, setActive] = useState<SectionId>('about');

  useEffect(() => {
    const ids: SectionId[] = ['about', 'experience', 'projects', 'contact'];
    const els = ids
      .map((id) => ({ id, el: document.getElementById(id) }))
      .filter((x): x is { id: SectionId; el: HTMLElement } => !!x.el);
    if (els.length === 0) return;

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
          if (ratio > bestRatio) { bestRatio = ratio; best = id; }
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

**App.tsx swap**: replace the existing `<AuroraShader />` and `<TechBackground … />` mount points with `<SectionBackground />`. Delete the imports for those two; do not delete the component files themselves (keep them in source for now in case we want to fall back during testing — they can be removed in a cleanup pass once the new system ships).

**Opacity defaults** (codified inline in `SectionBackground`):
- Base SoftAurora wrapper: `opacity: 0.55` — calmer than the current aurora's ~0.9.
- Active overlay: `opacity: 0.35` — visible but secondary.

These two stops give a total active luminance around the same as today's aurora alone, so liquid-glass refraction still has enough material to bend.

## Files added / modified

| File | Disposition |
|------|-------------|
| `src/components/HeroSection.tsx` | Modify — three line edits (speed prop, class strings) |
| `components.json` | Create — shadcn config + registry mapping |
| `package.json` | Modify — add `shadcn` devDep |
| `src/components/visuals/SoftAurora/SoftAurora.tsx` (and any deps) | Create via shadcn CLI |
| `src/components/visuals/DotGrid/DotGrid.tsx` | Create via shadcn CLI |
| `src/components/visuals/LightRays/LightRays.tsx` | Create via shadcn CLI |
| `src/components/visuals/Particles/Particles.tsx` | Create via shadcn CLI |
| `src/components/visuals/SectionBackground.tsx` | Create — mux above |
| `src/App.tsx` | Modify — replace `<AuroraShader />` + `<TechBackground />` mount with `<SectionBackground />` |

`src/components/AuroraShader.tsx` and `src/components/TechBackground.tsx` are NOT deleted in this spec — they're orphaned, easy to delete in a follow-up once we're sure we like the new bg.

## Error handling & edge cases

- **Registry install fails** (network, name mismatch): the spec includes a `--dry-run` verification step before any real install. If a component name has shifted, the user will see the failure name and can substitute. The plan also enumerates the exact registry component names to install.
- **Reduced motion**: react-bits backgrounds vary in motion intensity. The plan will check each installed component's motion behaviour and gate the overlays under `prefers-reduced-motion: reduce` by rendering the active overlay at `opacity: 0.15` and disabling its internal animations where the component exposes a `disabled`/`paused` prop. Where no such prop exists, we just lower the opacity floor.
- **Performance**: only one overlay is mounted at a time (`AnimatePresence mode="wait"`). The base SoftAurora is the only always-on layer. The matrix rain stays clipped to `#about`. Net: ≤2 visual layers active at once (down from today's 1 full-screen heavy aurora + section noise).
- **IntersectionObserver thrash**: thresholds are `[0, 0.25, 0.5, 0.75, 1]` (5 stops) so transitions feel smooth but the callback fires at most 5×(number of sections crossing the threshold) times per scroll — well below 60 fps budget.
- **Section without overlay (About)**: `OVERLAYS['about']` is undefined → `<AnimatePresence>` renders nothing, just the base. Correct by design.

## Testing & verification

Browser-rendered visual work via Claude in Chrome MCP. Verification at the end of implementation:

1. **Decrypt fix visible** — load page, after loader, name visibly scrambles for ~1.8 s before locking in.
2. **Eyebrow plain** — `getComputedStyle` on the eyebrow shows no `animation-name: shiny-sweep`; text fills solid white.
3. **Rotating role plain** — `getComputedStyle` on a character of the active role shows no `animation-name: gradient-shift`; `color: rgb(255,255,255)`.
4. **Registry install works** — `npx shadcn@latest add @react-bits/Particles-TS-TW` exits 0 and a file appears under `src/components/visuals/Particles/`.
5. **Base + overlay system** — scroll from About → Experience → Projects → Contact. At each section: capture which `<motion.div>` overlay is mounted under the section-background container. Should be `undefined`/`DotGrid`/`LightRays`/`Particles` respectively.
6. **Crossfade smoothness** — no flash of two overlays during the transition (`AnimatePresence mode="wait"` enforces this).
7. **Liquid-glass refraction still reads** — visual check: a project card placed over the LightRays overlay should still show the chromatic-aberration rim. If the overlay is too dark, raise the base SoftAurora opacity to 0.65.
8. **`npx tsc --noEmit -p tsconfig.json`** is clean.

## Out of scope (revisit later)

- Migrating other existing components (LiquidGlass, NavBar, etc.) to shadcn-registry-managed equivalents.
- Removing `AuroraShader.tsx` and `TechBackground.tsx` source files.
- Section-aware audio cues, scroll-triggered colour theming beyond the bg.
- Replacing the loader's bg.
