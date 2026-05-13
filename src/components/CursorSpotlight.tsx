import React, { useEffect, useRef } from 'react';

/**
 * Soft radial spotlight that follows the cursor. Uses `mix-blend-mode: soft-light`
 * over the page so glass and aurora pick up a believable warm glow without
 * recoloring the underlying composition. Pure DOM/CSS — no React re-renders
 * on mouse move; the position is written straight to a CSS variable.
 */
const CursorSpotlight: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Honour reduced-motion users — kill the effect outright.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.style.opacity = '0';
      return;
    }
    let rafId = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      node.style.setProperty('--cx', `${currentX}px`);
      node.style.setProperty('--cy', `${currentY}px`);
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 30,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        background:
          'radial-gradient(480px circle at var(--cx, 50%) var(--cy, 50%), rgba(255, 230, 200, 0.32) 0%, rgba(200, 180, 255, 0.18) 28%, rgba(140, 200, 255, 0.08) 50%, transparent 70%)',
        transition: 'opacity 0.6s ease-out',
        filter: 'blur(1px)',
      }}
    />
  );
};

export default React.memo(CursorSpotlight);
