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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let columns = 0;
    let yPositions: number[] = []; // current y of head per column (px)
    let speeds: number[] = [];     // px per frame per column

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
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
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    resize();

    let last = 0;
    let raf = 0;

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < FRAME_MS) return;
      last = t;

      // Trailing fade — fills the canvas with a near-opaque dark each frame
      // so older glyphs leave a fading tail rather than persisting forever.
      ctx.fillStyle = 'rgba(7, 6, 14, 0.10)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';

      for (let i = 0; i < columns; i++) {
        const x = i * COL_WIDTH;
        const y = yPositions[i];

        // Head — bright white, then tail in violet.
        ctx.fillStyle = `rgba(255, 255, 255, 0.95)`;
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], x, y);

        // Tail glyph two rows above head — violet aurora colour.
        ctx.fillStyle = `rgba(167, 139, 250, 0.55)`;
        if (y - FONT_SIZE * 2 >= 0) {
          ctx.fillText(
            GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            x,
            y - FONT_SIZE * 2
          );
        }

        yPositions[i] = y + speeds[i];
        // Reset column when it falls off the bottom — random restart height
        // so columns desync over time and the rain looks organic.
        if (y > height && Math.random() > 0.975) {
          yPositions[i] = -FONT_SIZE * 3;
        }
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
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
