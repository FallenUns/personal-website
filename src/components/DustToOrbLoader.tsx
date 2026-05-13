import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';

/**
 * Minimalist "PA" monogram loader.
 *
 * Visual idea: a huge stroked "PA" monogram sits centred. As loading
 * progresses, a coloured fill rises from the bottom of the letters like liquid
 * filling a beaker. Underneath, a giant tabular-figure percent readout ticks
 * up, a 1px progress line fills, and a status label crossfades through phases.
 *
 * Replaces the previous dust→orb Three.js loader (heavier, slower to render,
 * and visually similar to many other portfolios). This one is GPU-cheap
 * (pure SVG + CSS + framer-motion), boots instantly, and reads as a
 * luxury-brand intro rather than a generic spinner.
 *
 * Identity stays on the loader; the playful text animations (decrypt /
 * rotating role) now live inside the hero content after load, so they reward
 * the user for arriving rather than entertaining them while they wait.
 */

const STATUS_STAGES: { upTo: number; label: string }[] = [
  { upTo: 25, label: 'Preparing aurora' },
  { upTo: 55, label: 'Loading liquid glass' },
  { upTo: 80, label: 'Compiling shaders' },
  { upTo: 98, label: 'Polishing surfaces' },
  { upTo: 100, label: 'Ready' },
];

const statusFor = (p: number) => {
  for (const s of STATUS_STAGES) if (p <= s.upTo) return s.label;
  return STATUS_STAGES[STATUS_STAGES.length - 1].label;
};

const DustToOrbLoader: React.FC = () => {
  const { progress, preventAutoHide, allowAutoHide } = useLoading();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'exit'>('loading');
  const hasReached100 = useRef(false);
  const readyTimer = useRef<number | null>(null);
  const exitTimer = useRef<number | null>(null);

  // Smoothly ease displayProgress toward the real progress value so the
  // counter and bar never snap. Cubic ease-out on a 220ms interpolation.
  useEffect(() => {
    const target = Math.max(0, Math.min(100, progress || 0));
    const start = displayProgress;
    const startTime = performance.now();
    const duration = 220;
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (performance.now() - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayProgress(start + (target - start) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  // Phase handoff at 100%: hold "Ready" for a beat, then fade the whole loader.
  useEffect(() => {
    if ((progress || 0) >= 100 && !hasReached100.current) {
      hasReached100.current = true;
      preventAutoHide();
      readyTimer.current = window.setTimeout(() => setPhase('ready'), 250);
      exitTimer.current = window.setTimeout(() => {
        setPhase('exit');
        allowAutoHide();
      }, 1400);
    }
    return () => {
      if (readyTimer.current) window.clearTimeout(readyTimer.current);
      if (exitTimer.current) window.clearTimeout(exitTimer.current);
    };
  }, [progress, preventAutoHide, allowAutoHide]);

  // Pretty integer for the readout (always 3 digits so layout doesn't shift).
  const pct = Math.floor(displayProgress);
  const pctStr = useMemo(() => String(pct).padStart(3, '0'), [pct]);
  const status = statusFor(displayProgress);

  // SVG "fill height" — letters fill from bottom up as progress climbs.
  // We render two overlapping <text> elements: a faint stroke outline that
  // is always visible, and a filled version clipped from the bottom.
  const fillTop = 100 - Math.min(100, Math.max(0, displayProgress));

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'exit' ? 0 : 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background:
          'radial-gradient(120% 80% at 50% 50%, #0c0a18 0%, #07060d 60%, #030206 100%)',
        pointerEvents: phase === 'exit' ? 'none' : 'auto',
      }}
      aria-label="Loading"
      role="status"
    >
      {/* Faint moving grid for atmosphere */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(60% 60% at 50% 50%, black 0%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(60% 60% at 50% 50%, black 0%, transparent 75%)',
          animation: 'loader-grid-drift 22s linear infinite',
        }}
      />

      {/* Top-left brand stamp */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 text-white/55 text-[10px] sm:text-xs uppercase tracking-[0.45em] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] flex items-center gap-3">
        <span aria-hidden="true" className="inline-block w-6 h-px bg-white/35" />
        <span>Patrick Adrianus — Portfolio</span>
      </div>

      {/* Top-right phase status */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 text-white/55 text-[10px] sm:text-xs uppercase tracking-[0.4em] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] flex items-center gap-2">
        <motion.span
          aria-hidden="true"
          className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ boxShadow: '0 0 10px rgba(110,230,180,0.7)' }}
        />
        <span>System {phase === 'loading' ? 'booting' : 'online'}</span>
      </div>

      {/* PA monogram. Two <text>s in one SVG so they sit pixel-perfect on top
          of each other. The filled copy is clipped from the top so it appears
          to fill from the bottom up as progress climbs. */}
      <div className="relative flex items-center justify-center select-none">
        <svg
          width="100%"
          viewBox="0 0 320 280"
          aria-hidden="true"
          style={{
            width: 'clamp(220px, 32vw, 420px)',
            height: 'auto',
            display: 'block',
          }}
        >
          <defs>
            <linearGradient id="pa-fill" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%"   stopColor="#a78bfa" />
              <stop offset="55%"  stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <clipPath id="pa-clip">
              <rect x="0" y={`${fillTop}%`} width="100%" height={`${100 - fillTop}%`} />
            </clipPath>
          </defs>

          {/* Stroke outline — always visible at low opacity */}
          <text
            x="50%"
            y="62%"
            textAnchor="middle"
            fontFamily="'Space Grotesk', 'Inter', system-ui, sans-serif"
            fontWeight="700"
            fontSize="220"
            letterSpacing="-8"
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.5"
          >
            PA
          </text>

          {/* Filled copy — clipped to a rising bar */}
          <g clipPath="url(#pa-clip)">
            <text
              x="50%"
              y="62%"
              textAnchor="middle"
              fontFamily="'Space Grotesk', 'Inter', system-ui, sans-serif"
              fontWeight="700"
              fontSize="220"
              letterSpacing="-8"
              fill="url(#pa-fill)"
              style={{
                filter: 'drop-shadow(0 6px 26px rgba(167,139,250,0.45))',
              }}
            >
              PA
            </text>
          </g>

          {/* Animated liquid surface line — sits at the fill boundary */}
          <motion.line
            x1="20%"
            x2="80%"
            y1={`${fillTop}%`}
            y2={`${fillTop}%`}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1"
            initial={false}
            animate={{ opacity: pct >= 100 ? 0 : 0.7 }}
            transition={{ duration: 0.4 }}
          />
        </svg>
      </div>

      {/* Giant percent readout */}
      <div className="mt-6 sm:mt-8 flex items-baseline gap-2 text-white">
        <span
          className="font-bold tabular-nums leading-none [text-shadow:0_2px_18px_rgba(140,120,255,0.45)]"
          style={{
            fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
            fontSize: 'clamp(56px, 10vw, 112px)',
            letterSpacing: '-0.04em',
          }}
        >
          {pctStr}
        </span>
        <span
          className="text-white/55 font-medium tabular-nums"
          style={{
            fontSize: 'clamp(20px, 3vw, 32px)',
            letterSpacing: '0.04em',
          }}
        >
          %
        </span>
      </div>

      {/* Thin progress line */}
      <div
        className="mt-5 sm:mt-6 h-px bg-white/15 overflow-hidden rounded-full"
        style={{ width: 'min(280px, 60vw)' }}
        aria-hidden="true"
      >
        <motion.div
          className="h-full"
          style={{
            background:
              'linear-gradient(90deg, rgba(167,139,250,0) 0%, #a78bfa 30%, #ffffff 100%)',
            transformOrigin: 'left center',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: displayProgress / 100 }}
          transition={{ type: 'spring', stiffness: 110, damping: 22, mass: 0.4 }}
        />
      </div>

      {/* Status — crossfades between phases */}
      <div className="mt-5 h-5 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={status}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: phase === 'ready' ? 1 : 0.75, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-white/70 text-[11px] sm:text-xs uppercase tracking-[0.45em] [text-shadow:0_1px_3px_rgba(0,0,0,0.85)]"
          >
            {status}
            {phase === 'ready' ? ' ↓' : '...'}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Bottom-right counter (raw) for techy feel */}
      <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 text-white/40 text-[10px] sm:text-xs tabular-nums tracking-[0.35em] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
        {pctStr} / 100
      </div>

      <style>{`
        @keyframes loader-grid-drift {
          0%   { background-position: 0 0, 0 0; }
          100% { background-position: 64px 64px, 64px 64px; }
        }
      `}</style>
    </motion.div>
  );
};

export default DustToOrbLoader;
