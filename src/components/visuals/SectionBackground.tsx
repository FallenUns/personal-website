// src/components/visuals/SectionBackground.tsx
import React from 'react';
// Beams removed — read as harsh diagonal "intersections" by the user. Base is
// now a static CSS radial gradient (no shader). Per-section overlays still
// run their own canvases for character.
import Dither from './Dither';
import { GridScan } from './GridScan';
import Snow from './Snow';
import { useTime } from '../../contexts/TimeContext';
import useInViewport from '../../hooks/useInViewport';

type StickySectionBackgroundProps = {
  variant: 'experience' | 'projects' | 'contact';
};

const effectByVariant = {
  // Real react-bits GridScan — WebGL shader with grid raycast + scanning
  // beam. Webcam + gyro + scanOnClick disabled so the section never
  // requests camera/sensor permissions and clicks pass through to cards.
  //
  // `enablePost={false}` is the 120fps-target trade: the post-processing
  // pipeline (bloom + chromatic aberration + film grain) was costing
  // ~10 ms/frame all by itself, pinning the experience section at 60fps.
  // The main fragment shader keeps the grid, the perspective raycast,
  // and the scan beam glow (uScanGlow is computed in the shader, not in
  // post) — so we lose the "blooming halo + CRT chromatic fringe" but
  // keep the iconic GridScan identity. Bumping `scanGlow` slightly
  // compensates for the lost bloom.
  experience: (
    <GridScan
      enableWebcam={false}
      enableGyro={false}
      scanOnClick={false}
      lineThickness={1}
      linesColor="#2F293A"
      scanColor="#FF9FFC"
      gridScale={0.1}
      lineJitter={0.1}
      enablePost={false}
      scanGlow={0.85}
      scanSoftness={2.4}
    />
  ),
  projects: (
    <Dither
      pixelSize={6}
      opacity={0.98}
      primaryColor="#a78bfa"
      secondaryColor="#22d3ee"
      tertiaryColor="#050816"
    />
  ),
  contact: <Snow />,
};

const maskByVariant: Record<'experience' | 'projects' | 'contact', string> = {
  experience:
    'linear-gradient(180deg, transparent 0%, black 6%, black 96%, transparent 100%)',
  projects:
    'linear-gradient(180deg, transparent 0%, black 8%, black 92%, transparent 100%)',
  contact:
    'linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)',
};

const opacityByVariant: Record<'experience' | 'projects' | 'contact', number> = {
  experience: 0.62,
  projects: 0.58,
  contact: 0.75,
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
 * section seam. Per-section overlays (GridScan / Dither / Snow)
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
export const StickySectionBackground: React.FC<StickySectionBackgroundProps> = ({ variant }) => {
  // Viewport-gate the per-section effect. When the section is well off-screen
  // (more than `rootMargin` away from the viewport) we unmount the effect
  // entirely, killing its requestAnimationFrame loop and freeing the
  // associated canvas + WebGL context. With four heavy section canvases
  // (MatrixRain, GridScan, Dither, Snow) all running simultaneously, doing
  // this drops the per-frame budget by ~3× when the user is reading any
  // single section.
  //
  // `rootMargin: '600px'` mounts the effect a generous bit before the
  // section is actually visible so the user never sees a blank background
  // pop in at the seam — the canvas has time to initialise (especially
  // the WebGL2 GridScan) before any part of its section reaches the
  // viewport.
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inView = useInViewport(wrapRef, { rootMargin: '600px' });
  return (
    <div ref={wrapRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {inView ? (
          // Two-layer wrapper so the fade-in (0 → 1) and the per-variant
          // opacity (0.62 / 0.58 / 0.75) don't fight each other. The outer
          // owns the animation, the inner owns the constant visibility.
          <div className="section-bg-fade-in absolute inset-0">
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: opacityByVariant[variant],
                maskImage: maskByVariant[variant],
                WebkitMaskImage: maskByVariant[variant],
              }}
            >
              {effectByVariant[variant]}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const SectionBackground: React.FC = () => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
    <BaseAurora />
  </div>
);

export default SectionBackground;
