import React, { useEffect, useRef } from 'react';

type GridScanProps = {
  cellSize?: number;
  opacity?: number;
  primaryColor?: string;
  secondaryColor?: string;
};

const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const GridScan: React.FC<GridScanProps> = ({
  cellSize = 52,
  opacity = 0.82,
  primaryColor = '#8b5cf6',
  secondaryColor = '#38bdf8',
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

    const stroke = (color: string, lineWidth: number, blur = 0) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = blur;
      ctx.shadowColor = color;
    };

    const draw = (stamp: number) => {
      raf = requestAnimationFrame(draw);
      if (stamp - last < 1000 / 30) return;
      last = stamp;
      if (!prefersReduced) time += 0.018;

      ctx.clearRect(0, 0, width, height);

      const rows = Math.ceil(height / cellSize) + 2;
      const cols = Math.ceil(width / cellSize) + 2;
      const horizontalScanY =
        ((time * 120) % (height + cellSize * 4)) - cellSize * 2;
      const verticalScanX =
        ((time * 82) % (width + cellSize * 4)) - cellSize * 2;

      ctx.save();
      ctx.globalAlpha = opacity * 0.24;
      stroke(`rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.52)`, 1);

      for (let col = -1; col < cols; col++) {
        const x = col * cellSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let row = -1; row < rows; row++) {
        const y = row * cellSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.globalAlpha = opacity * 0.86;
      stroke(`rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.98)`, 2, 18);
      ctx.beginPath();
      ctx.moveTo(0, horizontalScanY);
      ctx.lineTo(width, horizontalScanY);
      ctx.stroke();

      ctx.globalAlpha = opacity * 0.66;
      stroke(`rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.9)`, 2, 16);
      ctx.beginPath();
      ctx.moveTo(verticalScanX, 0);
      ctx.lineTo(verticalScanX, height);
      ctx.stroke();

      const glow = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        240
      );
      glow.addColorStop(0, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${opacity * 0.34})`);
      glow.addColorStop(0.52, `rgba(${primary.r}, ${primary.g}, ${primary.b}, ${opacity * 0.18})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.shadowBlur = 0;
      ctx.globalAlpha = opacity * 0.92;
      for (let col = -1; col < cols; col++) {
        for (let row = -1; row < rows; row++) {
          const x = col * cellSize;
          const y = row * cellSize;
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const pointerLift = Math.max(0, 1 - Math.hypot(dx, dy) / 250);
          const scanLift =
            Math.max(0, 1 - Math.abs(y - horizontalScanY) / 90) +
            Math.max(0, 1 - Math.abs(x - verticalScanX) / 90);
          const lift = Math.min(1, pointerLift * 0.8 + scanLift * 0.5);
          if (lift <= 0.04) continue;

          ctx.fillStyle = `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${0.08 + lift * 0.22})`;
          ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
    };
  }, [cellSize, opacity, primaryColor, secondaryColor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
};

export default React.memo(GridScan);
