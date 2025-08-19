// src/components/TechBackground.tsx
import React, { useEffect, useRef, useMemo } from 'react';
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

  // Interactive element that follows mouse
  useEffect(() => {
    const pos = currentPosRef.current;

    const move = () => {
      if (interactiveRef.current) {
        pos.curX += (pos.tgX - pos.curX) / 20;
        pos.curY += (pos.tgY - pos.curY) / 20;
        interactiveRef.current.style.transform = `translate3d(${Math.round(
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

  const palette = useMemo(() => getPalette(hour), [hour]);

  // Generate data science and software development objects
  const techElements = useMemo(() => {
    const phase = phaseFromHour(hour);
    const rnd = seeded(`tech:${phase}:${Math.floor(hour * 4) / 4}`);
    
    const elements = [];
    
    // Generate function symbols - more spread out
    for (let i = 0; i < 4; i++) {
      elements.push({
        type: 'function',
        x: 5 + rnd() * 90,  // More spread out (5-95%)
        y: 5 + rnd() * 90,  // More spread out (5-95%)
        size: 35 + rnd() * 25,
        duration: 30 + rnd() * 20,
        delay: -rnd() * 50,
        variant: ['lambda', 'fx', 'def', 'lambda'][i % 4],
      });
    }
    
    // Generate floating green brackets with drift movement
    for (let i = 0; i < 8; i++) {
      elements.push({
        type: 'bracket',
        x: rnd() * 100,     // Full spread (0-100%)
        y: rnd() * 100,     // Full spread (0-100%)
        size: 25 + rnd() * 20,
        duration: 20 + rnd() * 25,
        delay: -rnd() * 45,
        direction: rnd() > 0.5 ? 'left' : 'right',
        driftX: 30 + rnd() * 40,  // Horizontal drift range
        driftY: 20 + rnd() * 30,  // Vertical drift range
      });
    }
    
    // Generate neural network nodes with different orientations
    for (let i = 0; i < 6; i++) {
      const orientations = ['right', 'down', 'left', 'up', 'diagonal-right', 'diagonal-left'];
      elements.push({
        type: 'neural-node',
        x: 10 + rnd() * 80,  // More spread out (10-90%)
        y: 10 + rnd() * 80,  // More spread out (10-90%)
        size: 20 + rnd() * 15,
        duration: 25 + rnd() * 20,
        delay: -rnd() * 40,
        pulse: 2 + rnd() * 3,
        orientation: orientations[i % orientations.length],
        nodeId: i,
      });
    }
    
    return elements;
  }, [hour]);

  return (
    <div className="tech-bg" style={palette as React.CSSProperties}>
      {/* Grid pattern overlay */}
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
