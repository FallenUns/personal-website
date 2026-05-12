// src/components/visuals/MatrixRain.tsx
import React, { useEffect, useRef } from 'react';

/**
 * Matrix-style digital rain — falling glyphs in the aurora palette (not the
 * cliché bright green). Renders to a <canvas> that fills its parent. Owns a
 * single requestAnimationFrame loop. Drawing is throttled to ~24 fps to keep
 * the per-frame cost light.
 *
 * Cursor reactivity, viewport pause, and reduced-motion gates are layered on
 * in Task 10.
 */

const GLYPHS = '01アイウエオカキクケコサシスセソタチツテト+-=<>{}[]'.split('');
const COL_WIDTH = 14;     // px between columns
const FONT_SIZE = 14;
const FRAME_MS = 1000 / 24;

interface MatrixRainProps {
  opacity?: number; // overall canvas opacity multiplier (0..1)
}

const MatrixRain: React.FC<MatrixRainProps> = ({ opacity = 0.12 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Disable the loop entirely under reduced-motion. The static draw call
    // still runs once so the canvas isn't blank.
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let columns = 0;
    let yPositions: number[] = [];
    let speeds: number[] = [];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / COL_WIDTH);
      yPositions = new Array(columns).fill(0).map(() => Math.random() * -height);
      speeds = new Array(columns).fill(0).map(() => 1 + Math.random() * 2);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    // Cursor tracking — local to the parent rect so we can compare against
    // each column's centre x.
    let cursorX = -9999;
    let cursorY = -9999;
    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      cursorX = e.clientX - r.left;
      cursorY = e.clientY - r.top;
    };
    const onLeave = () => {
      cursorX = -9999;
      cursorY = -9999;
    };
    parent.addEventListener('pointermove', onMove, { passive: true });
    parent.addEventListener('pointerleave', onLeave);

    // Pause when the parent leaves the viewport.
    let inView = true;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) inView = e.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(parent);

    const FRAME_MS_LOCAL = FRAME_MS;
    const PROX_RADIUS = 200;
    const PROX_R2 = PROX_RADIUS * PROX_RADIUS;

    let last = 0;
    let raf = 0;

    const drawFrame = () => {
      ctx.fillStyle = 'rgba(7, 6, 14, 0.10)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';

      for (let i = 0; i < columns; i++) {
        const x = i * COL_WIDTH + COL_WIDTH / 2;
        const y = yPositions[i];

        // Cursor proximity (Gaussian falloff). Boost alpha + slow fall when
        // the cursor is near this column.
        let boost = 1;
        let slow = 1;
        const dx = x - cursorX;
        const dy = y - cursorY;
        const d2 = dx * dx + dy * dy;
        if (d2 < PROX_R2) {
          const f = Math.exp(-d2 / (PROX_R2 / 2));
          boost = 1 + 0.6 * f;
          slow = 1 - 0.3 * f;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, 0.95 * boost)})`;
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * COL_WIDTH, y);

        if (y - FONT_SIZE * 2 >= 0) {
          ctx.fillStyle = `rgba(167, 139, 250, ${Math.min(1, 0.55 * boost)})`;
          ctx.fillText(
            GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            i * COL_WIDTH,
            y - FONT_SIZE * 2
          );
        }

        yPositions[i] = y + speeds[i] * slow;
        if (y > height && Math.random() > 0.975) {
          yPositions[i] = -FONT_SIZE * 3;
        }
      }
    };

    if (prefersReduced) {
      drawFrame();
      return () => {
        parent.removeEventListener('pointermove', onMove);
        parent.removeEventListener('pointerleave', onLeave);
        io.disconnect();
        ro.disconnect();
      };
    }

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!inView) return;
      if (t - last < FRAME_MS_LOCAL) return;
      last = t;
      drawFrame();
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity,
        zIndex: 0,
      }}
    />
  );
};

export default React.memo(MatrixRain);
