import { useEffect, useRef } from 'react';

/**
 * Attaches a subtle magnetic-attraction effect to a target element: as the
 * cursor approaches within `radius`, the element drifts toward it. Pure
 * transform writes via rAF — no React state, no re-renders.
 */
export function useMagnetic<T extends HTMLElement>(
  options: { strength?: number; radius?: number } = {},
) {
  const { strength = 0.35, radius = 180 } = options;
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        tx = 0;
        ty = 0;
        return;
      }
      const falloff = 1 - dist / radius;
      tx = dx * strength * falloff;
      ty = dy * strength * falloff;
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
    };

    const tick = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      node.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(rafId);
      node.style.transform = '';
    };
  }, [strength, radius]);

  return ref;
}
