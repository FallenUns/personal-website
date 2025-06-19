// src/components/GooeyBackground.tsx
import React, { useEffect, useRef, useMemo } from 'react';
import './background.css';
import { throttle } from '../utils/throttle';

interface GooeyBackgroundProps {
  hour: number;
}

// Optimized palette cache to avoid recalculations
const paletteCache = new Map<string, Record<string, string>>();

// Define your time-based color palettes with caching
const getPalette = (hour: number): Record<string, string> => {
  const cacheKey = Math.floor(hour * 4) / 4; // Cache by quarter hour
  
  if (paletteCache.has(cacheKey.toString())) {
    return paletteCache.get(cacheKey.toString())!;
  }

  let palette: Record<string, string>;
  
  if (hour >= 5 && hour < 8) { // Dawn
    palette = {
      '--color-bg1': 'rgb(255, 197, 148)',
      '--color-bg2': 'rgb(255, 128, 87)',
      '--color1': '255, 182, 193',
      '--color2': '255, 218, 185',
      '--color3': '173, 216, 230',
      '--color4': '221, 160, 221',
      '--color5': '255, 228, 196',
      '--color-interactive': '255, 105, 180', // Hot Pink
      '--circle-size': '80%',
      '--blending': 'soft-light',
    };
  } else if (hour >= 8 && hour < 17) { // Day
    palette = {
      '--color-bg1': 'rgb(0, 150, 255)',
      '--color-bg2': 'rgb(135, 206, 250)',
      '--color1': '135, 206, 235',
      '--color2': '152, 251, 152',
      '--color3': '255, 255, 224',
      '--color4': '176, 196, 222',
      '--color5': '240, 248, 255',
      '--color-interactive': '30, 144, 255', // Dodger Blue
      '--circle-size': '80%',
      '--blending': 'overlay',
    };
  } else if (hour >= 17 && hour < 20) { // Dusk
    palette = {
      '--color-bg1': 'rgb(218, 99, 56)',
      '--color-bg2': 'rgb(62, 29, 93)',
      '--color1': '255, 140, 0',
      '--color2': '220, 20, 60',
      '--color3': '138, 43, 226',
      '--color4': '255, 69, 0',
      '--color5': '199, 21, 133',
      '--color-interactive': '255, 165, 0', // Orange
      '--circle-size': '80%',
      '--blending': 'hard-light',
    };
  } else { // Night
    palette = {
      '--color-bg1': 'rgb(108, 0, 162)',
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
  
  paletteCache.set(cacheKey.toString(), palette);
  return palette;
};


const GooeyBackground: React.FC<GooeyBackgroundProps> = ({ hour }) => {
  const interBubbleRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentPosRef = useRef({ curX: 0, curY: 0, tgX: 0, tgY: 0 });
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Function to update background height
  const updateBackgroundHeight = () => {
    if (backgroundRef.current) {
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      backgroundRef.current.style.height = `${documentHeight}px`;
    }
  };

  useEffect(() => {
    // Initial height update
    updateBackgroundHeight();
    
    // Update height on window resize and DOM changes
    const resizeObserver = new ResizeObserver(updateBackgroundHeight);
    resizeObserver.observe(document.body);
    
    window.addEventListener('resize', updateBackgroundHeight);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateBackgroundHeight);
    };
  }, []);

  useEffect(() => {
    const pos = currentPosRef.current;

    const move = () => {
      if (interBubbleRef.current) {
        pos.curX += (pos.tgX - pos.curX) / 20;
        pos.curY += (pos.tgY - pos.curY) / 20;
        interBubbleRef.current.style.transform = `translate3d(${Math.round(pos.curX)}px, ${Math.round(pos.curY)}px, 0)`;
      }
      animationFrameRef.current = requestAnimationFrame(move);
    };

    // Throttle more aggressively for better performance
    const handleMouseMove = throttle((event: MouseEvent) => {
      pos.tgX = event.clientX;
      pos.tgY = event.clientY;
    }, 16); // ~60fps

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameRef.current = requestAnimationFrame(move);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const palette = useMemo(() => getPalette(hour), [hour]);
  return (
    <div ref={backgroundRef} className="gradient-bg" style={palette as React.CSSProperties}>
      <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div className="gradients-container">
        <div className="g1"></div>
        <div className="g2"></div>
        <div className="g3"></div>
        <div className="g4"></div>
        <div className="g5"></div>
        <div ref={interBubbleRef} className="interactive"></div>
      </div>
    </div>
  );
};

export default React.memo(GooeyBackground);