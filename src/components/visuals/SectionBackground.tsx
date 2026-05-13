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
