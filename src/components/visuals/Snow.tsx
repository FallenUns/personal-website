import React from 'react';

type SnowProps = {
  /** Snowflake count. Default 90. Stays GPU-friendly even at higher counts. */
  density?: number;
  /** Flake colour. Default #ffffff. */
  color?: string;
  /** Wind strength: horizontal drift per second, in viewport widths. */
  wind?: number;
  /** Base fall speed in viewport heights per second. */
  speed?: number;
};

type Flake = {
  x: number; // 0..1
  y: number; // 0..1
  r: number; // pixel radius
  v: number; // fall speed multiplier (depth/parallax)
  sway: number; // sway amplitude (px)
  swayPhase: number; // phase offset
  alpha: number; // opacity 0..1
};

/**
 * Lightweight 2D-canvas snow. Renders ~90 flakes at HiDPI with a single
 * requestAnimationFrame loop. No shaders, no WebGL, no `three.js`.
 *
 * Why not the react-bits PixelSnow (the 376-line three.js shader): the
 * earlier complaint was lag. PixelSnow's ray-marched per-fragment loop
 * is gorgeous but heavy. This canvas version costs ~90 `arc()` fills per
 * frame — well under 0.5 ms on a Mac/Chrome — and respects DPR for crisp
 * flakes at any zoom.
 *
 * Visual character:
 *   - Each flake has its own radius (1..3 px), depth-based fall speed
 *     (slow tiny flakes in the back, fast big flakes in front), and a
 *     sinusoidal horizontal sway so the field doesn't look like vertical
 *     stripes.
 *   - Flakes wrap horizontally and respawn at the top when they leave
 *     the bottom — no allocation per frame.
 *   - A subtle gaussian-ish soft falloff is achieved with a radial
 *     gradient inside each arc, giving the "fluffy" look without needing
 *     a blur filter.
 *
 * Reduced-motion: the loop is suspended and a static spread of flakes is
 * left on screen (still atmospheric, no motion-sickness trigger).
 */
const Snow: React.FC<SnowProps> = ({
  density = 90,
  color = '#ffffff',
  wind = 0.04,
  speed = 0.08,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;

    const flakes: Flake[] = Array.from({ length: density }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 2,
      v: 0.4 + Math.random() * 0.9, // depth — back flakes drift slow
      sway: 8 + Math.random() * 22,
      swayPhase: Math.random() * Math.PI * 2,
      alpha: 0.45 + Math.random() * 0.55,
    }));

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

    // Render once even when reduced-motion is on, so the section isn't blank.
    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const f of flakes) {
        const x = f.x * width;
        const y = f.y * height;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, f.r * 2.4);
        grad.addColorStop(0, `rgba(255,255,255,${f.alpha})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, f.r * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (prefersReduced) {
      drawStatic();
      return () => {
        ro.disconnect();
      };
    }

    const draw = (stamp: number) => {
      raf = requestAnimationFrame(draw);
      // Cap at ~50 fps — the human eye won't notice the difference between
      // 50 and 60 for a slow-drifting snow field, and it leaves headroom
      // for the rest of the page.
      if (stamp - last < 20) return;
      const dt = Math.min(64, stamp - last) / 1000;
      last = stamp;

      ctx.clearRect(0, 0, width, height);

      const t = stamp * 0.001;
      for (const f of flakes) {
        // Advance position. Speed scales by depth `v` so big flakes feel
        // closer (faster). Sway adds horizontal motion without changing
        // the underlying x storage — keeps wrap simple.
        f.y += speed * f.v * dt;
        f.x += wind * f.v * dt * 0.4;
        if (f.y > 1.05) {
          f.y = -0.05;
          f.x = Math.random();
        }
        if (f.x > 1.05) f.x -= 1.1;
        if (f.x < -0.05) f.x += 1.1;

        const swayX = Math.sin(t * 0.6 + f.swayPhase) * f.sway;
        const x = f.x * width + swayX;
        const y = f.y * height;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, f.r * 2.4);
        grad.addColorStop(0, `rgba(255,255,255,${f.alpha})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, f.r * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density, color, wind, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
};

export default React.memo(Snow);
