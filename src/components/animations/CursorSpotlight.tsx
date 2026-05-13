import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Pure-visual cursor spotlight. A soft violet radial glow follows the pointer
 * inside whichever parent it is mounted into. No text, no DOM cost beyond a
 * single motion.div — the position is driven by motion values (springs) so
 * the React tree never re-renders as the cursor moves.
 *
 * Mount it as a sibling of section content with `position: absolute; inset: 0`
 * on the parent. The element is `pointer-events: none` so it never intercepts
 * clicks. Respects `prefers-reduced-motion`.
 */

interface CursorSpotlightProps {
  size?: number;          // diameter in px
  color?: string;         // CSS colour for the inner stop
  blur?: number;          // px Gaussian blur for diffuser softness
  intensity?: number;     // 0..1 — inner alpha multiplier
  /**
   * When true, the spotlight tracks the cursor across the entire viewport
   * (position: fixed, listens on window). When false (default), it stays
   * clipped to its parent element via position: absolute.
   */
  fixed?: boolean;
}

const CursorSpotlight: React.FC<CursorSpotlightProps> = ({
  size = 520,
  color = 'rgba(167, 139, 250, 1)',
  blur = 28,
  intensity = 0.32,
  fixed = false,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, { stiffness: 80, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 80, damping: 22, mass: 0.6 });
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(true);

  // Honour reduced motion by disabling the glow entirely.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setEnabled(!mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    // `fixed` mode listens on the window so the glow follows the cursor
    // across every section. Non-fixed mode (default) listens on the parent
    // so the glow is clipped to whichever container it's mounted in.
    if (fixed) {
      const onMove = (e: PointerEvent) => {
        x.set(e.clientX);
        y.set(e.clientY);
        if (!visible) setVisible(true);
      };
      const onLeave = () => setVisible(false);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerleave', onLeave);
      return () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerleave', onLeave);
      };
    }
    const host = hostRef.current?.parentElement;
    if (!host) return;
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      x.set(e.clientX - r.left);
      y.set(e.clientY - r.top);
      if (!visible) setVisible(true);
    };
    const onLeave = () => setVisible(false);
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    return () => {
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled, visible, x, y, fixed]);

  if (!enabled) return null;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{
        position: fixed ? 'fixed' : 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: fixed ? 1 : 0,
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          height: size,
          borderRadius: '9999px',
          x: sx,
          y: sy,
          translateX: '-50%',
          translateY: '-50%',
          background: `radial-gradient(closest-side, ${color} 0%, transparent 70%)`,
          opacity: visible ? intensity : 0,
          mixBlendMode: 'screen',
          filter: `blur(${blur}px)`,
          willChange: 'transform, opacity',
          transition: 'opacity 320ms ease-out',
        }}
      />
    </div>
  );
};

export default React.memo(CursorSpotlight);
