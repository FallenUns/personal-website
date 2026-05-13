import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { getLenis } from '../utils/lenis';
import { scrollToSection } from '../utils/navigation';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

/**
 * Vertical scroll progress rail + section dots on the right edge.
 *
 * Reads progress straight from the Lenis instance — framer-motion's default
 * useScroll() listens to native scroll events, which Lenis can intermittently
 * miss when it drives scroll via transforms or batched scrollTo() calls.
 * Polling Lenis on its own 'scroll' callback guarantees the rail tracks the
 * eased scroll exactly, including programmatic jumps.
 */
const ScrollProgress: React.FC = () => {
  const progress = useMotionValue(0);
  const scaleY = useSpring(progress, {
    stiffness: 140,
    damping: 26,
    mass: 0.25,
    restDelta: 0.001,
  });
  const dotTop = useTransform(scaleY, (v) => `${v * 100}%`);
  const activeSection = useScrollSpy(
    SECTIONS.map((section) => section.id),
    { offset: 100 }
  );
  const active = activeSection ?? 'about';

  useEffect(() => {
    // Subscribe once the Lenis instance is alive; small interval handles the
    // race where this component mounts before App's lenis effect.
    let cleanup: (() => void) | null = null;
    const attach = () => {
      const lenis = getLenis();
      if (!lenis) return false;
      const handle = ({ scroll, limit }: { scroll: number; limit: number }) => {
        const p = limit > 0 ? Math.min(1, Math.max(0, scroll / limit)) : 0;
        progress.set(p);
      };
      lenis.on('scroll', handle);
      // Seed initial value
      handle({ scroll: lenis.scroll || 0, limit: lenis.limit || 1 });
      cleanup = () => lenis.off('scroll', handle);
      return true;
    };
    if (!attach()) {
      const id = setInterval(() => {
        if (attach()) clearInterval(id);
      }, 100);
      return () => {
        clearInterval(id);
        cleanup?.();
      };
    }
    return () => cleanup?.();
  }, [progress]);

  const goTo = (id: string) => {
    scrollToSection(id);
  };

  return (
    <div
      aria-hidden="false"
      style={{
        position: 'fixed',
        top: '14vh',
        bottom: '14vh',
        right: 20,
        zIndex: 25,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      {/* Rail */}
      <div
        style={{
          position: 'relative',
          width: 3,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.14)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            originY: 0,
            scaleY,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(180,200,255,0.9) 45%, rgba(200,140,255,0.95) 100%)',
            boxShadow: '0 0 14px rgba(180,200,255,0.85), 0 0 32px rgba(200,140,255,0.55)',
            borderRadius: 999,
          }}
        />
        {/* Progress head — a soft glow disk at the bottom of the filled rail */}
        <motion.div
          style={{
            position: 'absolute',
            left: '50%',
            top: dotTop,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            borderRadius: 999,
            background: 'white',
            boxShadow: '0 0 14px rgba(255,255,255,0.95), 0 0 28px rgba(200,160,255,0.7)',
          }}
        />
      </div>

      {/* Section dots — clickable jumps */}
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          marginLeft: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          pointerEvents: 'auto',
        }}
      >
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <button
                onClick={() => goTo(s.id)}
                aria-label={`Jump to ${s.label}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)',
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  transition: 'color 0.25s ease-out',
                }}
              >
                <span
                  style={{
                    width: isActive ? 10 : 6,
                    height: isActive ? 10 : 6,
                    borderRadius: 999,
                    background: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                    boxShadow: isActive
                      ? '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(200,160,255,0.6)'
                      : 'none',
                    transition: 'all 0.25s ease-out',
                    display: 'inline-block',
                  }}
                />
                <span style={{ opacity: isActive ? 1 : 0, transition: 'opacity 0.25s ease-out', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default React.memo(ScrollProgress);
