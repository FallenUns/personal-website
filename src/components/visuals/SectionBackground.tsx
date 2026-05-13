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

const OVERLAYS: Partial<Record<SectionId, React.ComponentType<any>>> = {
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
