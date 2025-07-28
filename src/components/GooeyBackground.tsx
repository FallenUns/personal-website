// src/components/GooeyBackground.tsx
import React, { useEffect, useRef, useMemo } from 'react';
import './background.css';
import { throttle } from '../utils/throttle';

interface GooeyBackgroundProps {
  hour: number;
}

// -------- Palette cache (quarter-hour buckets) ----------
const paletteCache = new Map<string, Record<string, string>>();

const phaseFromHour = (hour: number) => {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
};

// --------- Background palette (for the gradient + base vars) ----------
const getPalette = (hour: number): Record<string, string> => {
  const cacheKey = (Math.floor(hour * 4) / 4).toString(); // cache by quarter hour
  if (paletteCache.has(cacheKey)) return paletteCache.get(cacheKey)!;

  const phase = phaseFromHour(hour);
  let palette: Record<string, string>;

  if (phase === 'dawn') {
    palette = {
      '--color-bg1': 'rgb(187, 120, 76)',
      '--color-bg2': 'rgb(139, 75, 48)',
      '--color1': '255, 182, 193',
      '--color2': '255, 218, 185',
      '--color3': '173, 216, 230',
      '--color4': '221, 160, 221',
      '--color5': '255, 228, 196',
      '--color-interactive': '255, 105, 180',
      '--circle-size': '80%',
      '--blending': 'screen', // softer + brighter overlap
    };
  } else if (phase === 'day') {
    palette = {
      '--color-bg1': 'rgb(80, 115, 175)',
      '--color-bg2': 'rgb(65, 105, 165)',
      '--color1': '169, 215, 255',
      '--color2': '255, 186, 150',
      '--color3': '188, 220, 255',
      '--color4': '240, 240, 240',
      '--color5': '255, 224, 183',
      '--color-interactive': '255, 182, 193',
      '--circle-size': '80%',
      '--blending': 'screen',
    };
  } else if (phase === 'dusk') {
    palette = {
      '--color-bg1': 'rgb(218, 99, 56)',
      '--color-bg2': 'rgb(62, 29, 93)',
      '--color1': '255, 140, 0',
      '--color2': '220, 20, 60',
      '--color3': '138, 43, 226',
      '--color4': '255, 69, 0',
      '--color5': '199, 21, 133',
      '--color-interactive': '255, 165, 0',
      '--circle-size': '80%',
      '--blending': 'hard-light',
    };
  } else {
    // night
    palette = {
      '--color-bg1': 'rgba(108, 0, 162, 0.49)',
      '--color-bg2': 'rgb(0, 17, 82)',
      '--color1': '18, 113, 255',
      '--color2': '221, 74, 255',
      '--color3': '100, 220, 255',
      '--color4': '200, 50, 50',
      '--color5': '180, 180, 50',
      '--color-interactive': '140, 100, 255',
      '--circle-size': '80%',
      '--blending': 'hard-light',
    };
  }

  paletteCache.set(cacheKey, palette);
  return palette;
};

// --------- Extra bubble colors for each time phase ----------
const getBubbleColors = (hour: number) => {
  const phase = phaseFromHour(hour);

  if (phase === 'dawn') {
    // warm pink/peach/lilac sky tones
    return [
      '255,137,164', // rose
      '255,175,189', // light coral
      '255,208,169', // peach
      '209,178,255', // lilac
      '255,214,238', // blush
      '255,149,128', // persimmon
      '255,192,203', // pink
      '243,168,222', // orchid
      '255,222,173', // navajo
    ];
  }
  if (phase === 'day') {
    // bright, airy, cooler highlights with some warm accents
    return [
      '169,215,255', // sky
      '120,205,255', // cerulean
      '100,220,255', // cyan
      '180,235,255', // pale blue
      '255,206,160', // apricot
      '255,224,183', // soft orange
      '230,245,255', // very pale blue
      '190,230,255', // powder blue
      '255,186,150', // warm accent
    ];
  }
  if (phase === 'dusk') {
    // saturated sunset gradients
    return [
      '255,126,95',  // orange/salmon
      '255,94,98',   // vivid red-orange
      '255,165,0',   // orange
      '221,74,255',  // magenta
      '138,43,226',  // blue-violet
      '255,69,0',    // red-orange
      '199,21,133',  // fuchsia
      '255,140,0',   // dark orange
      '255,20,147',  // deep pink
    ];
  }
  // night (keep quieter)
  return [
    '18,113,255',
    '221,74,255',
    '100,220,255',
    '140,100,255',
    '50,180,220',
  ];
};

// ---------- small deterministic pseudo-random for stable layout ----------
const hashString = (s: string) =>
  s.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);

const seeded = (seed: string) => {
  let h = hashString(seed) || 1;
  return () => {
    // xorshift-ish
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    // return [0,1)
    return ((h >>> 0) % 10000) / 10000;
  };
};

type CSSVars = React.CSSProperties & Record<string, string | number>;

const GooeyBackground: React.FC<GooeyBackgroundProps> = ({ hour }) => {
  const interBubbleRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentPosRef = useRef({ curX: 0, curY: 0, tgX: 0, tgY: 0 });

  // mouse-follow interactive bubble (kept)
  useEffect(() => {
    const pos = currentPosRef.current;

    const move = () => {
      if (interBubbleRef.current) {
        pos.curX += (pos.tgX - pos.curX) / 20;
        pos.curY += (pos.tgY - pos.curY) / 20;
        interBubbleRef.current.style.transform = `translate3d(${Math.round(
          pos.curX
        )}px, ${Math.round(pos.curY)}px, 0)`;
      }
      animationFrameRef.current = requestAnimationFrame(move);
    };

    const handleMouseMove = throttle((event: MouseEvent) => {
      pos.tgX = event.clientX;
      pos.tgY = event.clientY;
    }, 16);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameRef.current = requestAnimationFrame(move);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // base palette for background + existing classes
  const palette = useMemo(() => getPalette(hour), [hour]);

  // extra colorful bubbles (more count for dawn/day/dusk)
  const bubbles = useMemo(() => {
    const phase = phaseFromHour(hour);
    const colors = getBubbleColors(hour);
    const count =
      phase === 'night' ? 8 : phase === 'day' ? 18 : 16; // more in day/dusk/dawn

    const rnd = seeded(`bubbles:${phase}:q${Math.floor(hour * 4) / 4}`);

    return Array.from({ length: count }).map((_, i) => {
      const color = colors[i % colors.length];

      // sizes lean larger in day/dusk to look richer
      const sizeVmax =
        phase === 'night'
          ? 26 + Math.floor(rnd() * 10) // 26–36
          : 32 + Math.floor(rnd() * 16); // 32–48

      const x = 10 + rnd() * 80; // 10%–90%
      const y = 10 + rnd() * 80; // 10%–90%

      const dur = 12 + Math.floor(rnd() * 10); // 12–22s
      const delay = -Math.floor(rnd() * dur); // negative for staggered start

      // slight elliptical drift amplitude
      const driftX = 1.5 + rnd() * 3; // 1.5–4.5vmax
      const driftY = 1 + rnd() * 2.5; // 1–3.5vmax

      const s: CSSVars = {
        '--rgb': color,
        '--size': `${sizeVmax}vmax`,
        '--x': `${x}%`,
        '--y': `${y}%`,
        '--dur': `${dur}s`,
        '--delay': `${delay}s`,
        '--dx': `${driftX}vmax`,
        '--dy': `${driftY}vmax`,
      };

      return s;
    });
  }, [hour]);

  return (
    <div className="gradient-bg" style={palette as React.CSSProperties}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0 }}
        aria-hidden="true"
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -9"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="gradients-container">
        {/* keep your existing five blobs if you have CSS for .g1..g5 */}
        <div className="g1"></div>
        <div className="g2"></div>
        <div className="g3"></div>
        <div className="g4"></div>
        <div className="g5"></div>

        {/* NEW: many colorful bubbles */}
        {bubbles.map((style, i) => (
          <div key={i} className="bubble" style={style} />
        ))}

        <div ref={interBubbleRef} className="interactive"></div>
      </div>
    </div>
  );
};

export default React.memo(GooeyBackground);
