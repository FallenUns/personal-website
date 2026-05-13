// src/components/visuals/SectionBackground.tsx
import React from 'react';
// Beams removed — read as harsh diagonal "intersections" by the user. Base is
// now a static CSS radial gradient (no shader). Per-section overlays still
// run their own canvases for character.
import DotGrid from './DotGrid/DotGrid';
import LightRays from './LightRays/LightRays';
import Particles from './Particles/Particles';
import { useTime } from '../../contexts/TimeContext';

type StickySectionBackgroundProps = {
  variant: 'experience' | 'projects' | 'contact';
};

// Experience overlay tunings: smaller dots (6px, was 16 default) on a tighter
// grid (gap 22) read as a finer "texture" rather than a chunky polka-dot.
// Mask wrapping (applied per-variant below) fades the grid in the top/bottom
// 18% of the viewport so it doesn't slam into the section edges.
const effectByVariant = {
  experience: <DotGrid dotSize={6} gap={22} proximity={120} />,
  projects: <LightRays />,
  contact: <Particles />,
};

const maskByVariant: Record<'experience' | 'projects' | 'contact', string | undefined> = {
  experience:
    'linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent 100%)',
  projects: undefined,
  contact: undefined,
};

const phaseFromHour = (hour: number) => {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
};

const auraByPhase = {
  dawn: {
    opacity: 0.58,
    brightness: 0.96,
    saturate: 1.28,
    speed: 0.54,
    color1: '#8b5cf6',
    color2: '#fb7185',
  },
  day: {
    opacity: 0.5,
    brightness: 0.88,
    saturate: 1.18,
    speed: 0.58,
    color1: '#38bdf8',
    color2: '#34d399',
  },
  dusk: {
    opacity: 0.6,
    brightness: 0.98,
    saturate: 1.34,
    speed: 0.62,
    color1: '#c084fc',
    color2: '#fb7185',
  },
  night: {
    opacity: 0.54,
    brightness: 0.92,
    saturate: 1.38,
    speed: 0.56,
    color1: '#6366f1',
    color2: '#22d3ee',
  },
};

/**
 * Static base — pure CSS radial gradient tinted with the time-of-day primary
 * colour. No shader, no diagonals, no per-frame paint. The most "seamless"
 * possible base because there's nothing animating that could read as a
 * section seam. Per-section overlays (DotGrid / LightRays / Particles)
 * provide the kinetic character.
 */
const BaseAurora: React.FC = () => {
  const { hour } = useTime();
  const aura = auraByPhase[phaseFromHour(hour)];

  // Two-blob mesh gradient (Stripe-style). Two large overlapping radials hold
  // colour across the whole viewport — the bg never collapses to flat dark.
  // Both blobs sit at ~50% alpha so they're clearly visible but never fight
  // text contrast. Base layer beneath is deep slate (not pure black) so the
  // edges of the blobs feather into something with hue rather than into void.
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(1100px circle at 18% 24%, ${aura.color1}80 0%, ${aura.color1}00 55%),
          radial-gradient(1200px circle at 82% 78%, ${aura.color2}66 0%, ${aura.color2}00 55%),
          #0a0816
        `,
        opacity: aura.opacity + 0.4,
        filter: `saturate(${aura.saturate})`,
        transition: 'background 1.2s ease-out',
      }}
    />
  );
};

/**
 * Per-section sticky overlay. ONLY renders the variant's effect — the base
 * (Beams aurora) lives ONCE at the root via the default `<SectionBackground />`
 * export. Previously each StickySectionBackground also rendered its own
 * `<BaseAurora />`, which meant 4 base shaders running simultaneously and a
 * stack of identical aurora layers — the "duplicates + intersection" the
 * user saw at section boundaries.
 */
export const StickySectionBackground: React.FC<StickySectionBackgroundProps> = ({ variant }) => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
    <div className="sticky top-0 h-screen w-full overflow-hidden">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.35,
          maskImage: maskByVariant[variant],
          WebkitMaskImage: maskByVariant[variant],
        }}
      >
        {effectByVariant[variant]}
      </div>
    </div>
  </div>
);

const SectionBackground: React.FC = () => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
    <BaseAurora />
  </div>
);

export default SectionBackground;
