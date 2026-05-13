import React, { useEffect, useRef } from 'react';

type DitherProps = {
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  pixelSize?: number;
  opacity?: number;
};

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const mixRgb = (
  a: ReturnType<typeof hexToRgb>,
  b: ReturnType<typeof hexToRgb>,
  t: number
) => ({
  r: Math.round(a.r + (b.r - a.r) * t),
  g: Math.round(a.g + (b.g - a.g) * t),
  b: Math.round(a.b + (b.b - a.b) * t),
});

const Dither: React.FC<DitherProps> = ({
  primaryColor = '#8b5cf6',
  secondaryColor = '#38bdf8',
  tertiaryColor = '#08111f',
  pixelSize = 7,
  opacity = 0.62,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const primary = hexToRgb(primaryColor);
    const secondary = hexToRgb(secondaryColor);
    const tertiary = hexToRgb(tertiaryColor);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let time = 0;
    let pointer = { x: -9999, y: -9999 };

    const resize = () => {
      width = Math.max(1, parent.clientWidth);
      height = Math.max(1, parent.clientHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    const onMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const onLeave = () => {
      pointer = { x: -9999, y: -9999 };
    };

    parent.addEventListener('pointermove', onMove, { passive: true });
    parent.addEventListener('pointerleave', onLeave);

    const draw = (stamp: number) => {
      raf = requestAnimationFrame(draw);
      if (stamp - last < 1000 / 30) return;
      last = stamp;
      if (!prefersReduced) time += 0.018;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / pixelSize);
      const rows = Math.ceil(height / pixelSize);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * pixelSize;
          const y = row * pixelSize;
          const cx = x + pixelSize * 0.5;
          const cy = y + pixelSize * 0.5;

          const nx = cx / Math.max(width, 1);
          const ny = cy / Math.max(height, 1);
          const wave =
            0.5 +
            0.5 *
              Math.sin(
                nx * 10.5 +
                  Math.cos(ny * 7.2 - time * 1.6) * 1.8 +
                  time * 1.4
              );
          const secondaryWave =
            0.5 + 0.5 * Math.cos(ny * 12.4 - nx * 5.2 + time * 1.1);
          const pointerDist = Math.hypot(cx - pointer.x, cy - pointer.y);
          const pointerLift = pointerDist < 220 ? 1 - pointerDist / 220 : 0;
          const intensity = Math.min(
            1,
            wave * 0.58 + secondaryWave * 0.24 + pointerLift * 0.46
          );

          const threshold = BAYER_4[row % 4][col % 4] / 16;
          if (intensity < threshold * 0.84) continue;

          const chroma = Math.min(1, secondaryWave * 0.55 + pointerLift * 0.55);
          const bright = mixRgb(primary, secondary, chroma);
          const darkMix = Math.min(1, 0.24 + intensity * 0.76);
          const color = mixRgb(tertiary, bright, darkMix);
          const alpha = opacity * (0.28 + intensity * 0.72);
          const block = pointerLift > 0.2 ? pixelSize : Math.max(2, pixelSize - 1);

          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
          ctx.fillRect(x, y, block, block);
        }
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
    };
  }, [opacity, pixelSize, primaryColor, secondaryColor, tertiaryColor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
};

export default React.memo(Dither);
