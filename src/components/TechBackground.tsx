// src/components/TechBackground.tsx
import React, { useEffect, useRef, useMemo } from 'react';
import { useComponentLoader } from '../contexts/LoadingContext';
import './tech-background.css';
import { throttle } from '../utils/throttle';

interface TechBackgroundProps {
  hour: number;
}

// Phase-based color palettes for tech theme
const phaseFromHour = (hour: number) => {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
};

const getPalette = (hour: number): Record<string, string> => {
  const phase = phaseFromHour(hour);
  
  if (phase === 'dawn') {
    return {
      '--color-bg1': 'rgb(25, 35, 55)',
      '--color-bg2': 'rgb(45, 25, 65)',
      '--primary': '139, 69, 19',     // Warm brown
      '--secondary': '255, 140, 0',   // Orange
      '--accent': '255, 165, 0',      // Gold
      '--grid': '255, 140, 0',        // Orange grid
      '--particle': '255, 215, 0',    // Golden particles
    };
  } else if (phase === 'day') {
    return {
      '--color-bg1': 'rgb(15, 25, 45)',
      '--color-bg2': 'rgb(25, 35, 55)',
      '--primary': '0, 123, 255',     // Blue
      '--secondary': '40, 167, 69',   // Green
      '--accent': '255, 193, 7',      // Yellow
      '--grid': '0, 123, 255',        // Blue grid
      '--particle': '64, 224, 208',   // Turquoise particles
    };
  } else if (phase === 'dusk') {
    return {
      '--color-bg1': 'rgb(20, 20, 40)',
      '--color-bg2': 'rgb(40, 20, 60)',
      '--primary': '220, 20, 60',     // Crimson
      '--secondary': '255, 69, 0',    // Red-orange
      '--accent': '255, 20, 147',     // Deep pink
      '--grid': '220, 20, 60',        // Crimson grid
      '--particle': '255, 69, 0',     // Red-orange particles
    };
  } else {
    return {
      '--color-bg1': 'rgb(8, 15, 30)',
      '--color-bg2': 'rgb(15, 8, 35)',
      '--primary': '0, 255, 255',     // Cyan
      '--secondary': '138, 43, 226',  // Blue violet
      '--accent': '50, 205, 50',      // Lime green
      '--grid': '0, 255, 255',        // Cyan grid
      '--particle': '144, 238, 144',  // Light green particles
    };
  }
};

// Generate deterministic positions using simple hash
const hashString = (s: string) =>
  s.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);

const seeded = (seed: string) => {
  let h = hashString(seed) || 1;
  return () => {
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
};

const TechBackground: React.FC<TechBackgroundProps> = ({ hour }) => {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentPosRef = useRef({ curX: 0, curY: 0, tgX: 0, tgY: 0 });

  // Register this component for loading tracking
  useComponentLoader('TechBackground');

  // Interactive element that follows mouse
  useEffect(() => {
    const pos = currentPosRef.current;

    const move = () => {
      if (interactiveRef.current) {
        pos.curX += (pos.tgX - pos.curX) / 8;
        pos.curY += (pos.tgY - pos.curY) / 8;
        interactiveRef.current.style.transform = `translate3d(${Math.round(
          pos.curX
        )}px, ${Math.round(pos.curY)}px, 0)`;
      }
      animationFrameRef.current = requestAnimationFrame(move);
    };

    const handleMouseMove = throttle((event: MouseEvent) => {
      pos.tgX = event.clientX;
      pos.tgY = event.clientY;
    }, 8);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameRef.current = requestAnimationFrame(move);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const palette = useMemo(() => getPalette(hour), [hour]);

  // Generate data science and software development objects
  const techElements = useMemo(() => {
    const phase = phaseFromHour(hour);
    const rnd = seeded(`tech:${phase}:${Math.floor(hour * 4) / 4}`);
    
    const elements = [];

    // Function symbols: fewer + larger. They now sit on top of the aurora
    // so each one needs presence, not clutter.
    for (let i = 0; i < 2; i++) {
      elements.push({
        type: 'function',
        x: 8 + rnd() * 84,
        y: 8 + rnd() * 84,
        size: 42 + rnd() * 22,
        duration: 36 + rnd() * 18,
        delay: -rnd() * 50,
        variant: ['lambda', 'fx'][i % 2],
      });
    }

    // Code brackets: cut from 8 → 4, slower drift
    for (let i = 0; i < 4; i++) {
      elements.push({
        type: 'bracket',
        x: rnd() * 100,
        y: rnd() * 100,
        size: 28 + rnd() * 18,
        duration: 28 + rnd() * 22,
        delay: -rnd() * 45,
        direction: rnd() > 0.5 ? 'left' : 'right',
        driftX: 30 + rnd() * 40,
        driftY: 20 + rnd() * 30,
      });
    }

    // Neural nodes: cut from 6 → 3
    for (let i = 0; i < 3; i++) {
      const orientations = ['right', 'down', 'diagonal-right', 'diagonal-left'];
      elements.push({
        type: 'neural-node',
        x: 15 + rnd() * 70,
        y: 15 + rnd() * 70,
        size: 22 + rnd() * 14,
        duration: 30 + rnd() * 20,
        delay: -rnd() * 40,
        pulse: 2.4 + rnd() * 3,
        orientation: orientations[i % orientations.length],
        nodeId: i,
      });
    }

    return elements;
  }, [hour]);

  return (
    <div className="tech-bg" style={palette as React.CSSProperties}>
      {/* (aurora orbs replaced by WebGL AuroraShader — see App.tsx) */}

      {/* Grid pattern overlay (subtle texture on top of the WebGL aurora) */}
      <div className="grid-pattern"></div>

      {/* Tech elements container */}
      <div className="tech-container">
        {techElements.map((element, i) => {
          const style = {
            '--x': `${element.x}%`,
            '--y': `${element.y}%`,
            '--size': `${element.size}px`,
            '--duration': `${element.duration}s`,
            '--delay': `${element.delay}s`,
            '--pulse': `${element.pulse || 1}s`,
            '--drift-x': `${element.driftX || 20}px`,
            '--drift-y': `${element.driftY || 15}px`,
            '--node-id': `${element.nodeId || 0}`,
          } as React.CSSProperties;

          if (element.type === 'function') {
            return (
              <div 
                key={`func-${i}`} 
                className={`function-symbol ${element.variant}`} 
                style={style}
              />
            );
          } else if (element.type === 'bracket') {
            return (
              <div 
                key={`bracket-${i}`} 
                className={`code-bracket ${element.direction}`} 
                style={style}
              />
            );
          } else if (element.type === 'neural-node') {
            return (
              <div 
                key={`neural-${i}`} 
                className={`neural-node ${element.orientation}`} 
                style={style} 
              />
            );
          }
          return null;
        })}
        
        {/* Interactive glow effect */}
        <div ref={interactiveRef} className="interactive-glow"></div>
      </div>
    </div>
  );
};

export default React.memo(TechBackground);
