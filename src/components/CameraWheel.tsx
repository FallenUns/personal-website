import React, { useEffect, useRef, useState } from 'react';
import { hudLog } from '../hooks/useHudBus';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { getLenis } from '../utils/lenis';
import { sectionScrollOffset } from '../utils/navigation';

/**
 * Vertical section dial pinned to the right edge of the viewport.
 *
 * Architecture: the SVG arc + tick marks rotate with scroll, and labels are
 * projected onto the same arc so the section nav feels like typography printed
 * on a camera zoom ring.
 */

const SECTIONS = [
  { id: 'about',      label: 'about' },
  { id: 'experience', label: 'experiences' },
  { id: 'projects',   label: 'projects' },
  { id: 'contact',    label: 'contact' },
];

const STEP = 16;                 // degrees between section ticks
const MINOR_STEP = 1.25;         // degrees between minor measurement ticks
const MINOR_RANGE = 54;          // degrees of minor ticks each side of centre
const RADIUS = 690;              // wheel radius (svg units)
const CONTAINER_WIDTH = 285;
const CONTAINER_HEIGHT = 560;
const CENTRE_X = CONTAINER_WIDTH + RADIUS - 70;
const CENTRE_Y = CONTAINER_HEIGHT / 2;
const LABEL_RADIUS = RADIUS - 46; // label right edge hugs the tick line

const polar = (angle: number, r: number) => {
  const rad = (angle * Math.PI) / 180;
  return {
    x: CENTRE_X - r * Math.cos(rad),
    y: CENTRE_Y + r * Math.sin(rad),
  };
};

const CameraWheel: React.FC = () => {
  // Rotation snaps to the active section index. The spring below provides the
  // smooth between-section interpolation, while integer snapping guarantees
  // the active label sits at exactly visible angle 0 (no sub-pixel drift
  // from Lenis easing or rest-position math).
  const activeIdxMV = useMotionValue(0);

  const rotation = useTransform(activeIdxMV, (i) => {
    return (i - (SECTIONS.length - 1) / 2) * STEP;
  });
  const springRotation = useSpring(rotation, {
    stiffness: 150,
    damping: 26,
    mass: 0.4,
    restDelta: 0.01,
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const [hidden, setHidden] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    const attach = () => {
      const lenis = getLenis();
      if (!lenis) return false;
      const handle = ({ scroll }: { scroll: number; limit: number }) => {
        // Pick the active section by midpoint between resting scroll positions.
        // Using each section's exact navigation target (offsetTop + offset)
        // ensures the wheel + navbar agree on which section is current.
        const tops: { i: number; rest: number }[] = [];
        SECTIONS.forEach((s, i) => {
          const el = document.getElementById(s.id);
          if (el) tops.push({ i, rest: el.offsetTop + sectionScrollOffset(el) });
        });
        if (tops.length === 0) return;

        let current = tops[0].i;
        for (let k = 0; k < tops.length; k++) {
          const a = tops[k];
          const b = tops[k + 1];
          if (!b) {
            current = a.i;
            break;
          }
          const mid = (a.rest + b.rest) / 2;
          if (scroll < mid) {
            current = a.i;
            break;
          }
        }
        if (current !== activeIdxMV.get()) {
          activeIdxMV.set(current);
          setActiveIdx(current);
        }
        setHidden(false);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setHidden(true), 2400);
      };
      lenis.on('scroll', handle);
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
        if (hideTimer.current) clearTimeout(hideTimer.current);
        cleanup?.();
      };
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      cleanup?.();
    };
  }, [activeIdxMV]);

  const jump = (i: number) => {
    hudLog(`> wheel → ${SECTIONS[i].id}`, 'info');
    const el = document.getElementById(SECTIONS[i].id);
    if (!el) return;
    // Dynamic offset based on section height — same logic as navigation.ts
    // so the wheel and the navbar jump to identical positions.
    getLenis()?.scrollTo(el, { duration: 1.1, offset: sectionScrollOffset(el) });
  };

  // Minor measurement ticks (between sections).
  const minorTicks: number[] = [];
  for (let a = -MINOR_RANGE; a <= MINOR_RANGE; a += MINOR_STEP) {
    if (Math.abs(a % STEP) < 0.01) continue;
    minorTicks.push(a);
  }

  return (
    <div
      aria-hidden="false"
      onMouseEnter={() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setHidden(false);
      }}
      onMouseLeave={() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setHidden(true), 1400);
      }}
      style={{
        position: 'fixed',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 28,
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        pointerEvents: 'auto',
        opacity: hidden ? 0.35 : 1,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 112% 50%, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.06) 36%, rgba(255,255,255,0) 68%)',
          maskImage:
            'linear-gradient(180deg, transparent 0%, black 17%, black 83%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(180deg, transparent 0%, black 17%, black 83%, transparent 100%)',
        }}
      />

      {/* Wheel SVG ticks. Minor ticks make it read as a camera zoom/focus dial;
          major ticks mark the sections. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          maskImage:
            'linear-gradient(180deg, transparent 0%, black 16%, black 84%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(180deg, transparent 0%, black 16%, black 84%, transparent 100%)',
        }}
      >
        <motion.svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${CONTAINER_WIDTH} ${CONTAINER_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            rotate: springRotation,
            transformOrigin: `${CENTRE_X}px ${CENTRE_Y}px`,
          }}
        >
          {minorTicks.map((a, idx) => {
            const inner = polar(a, RADIUS - 20);
            const outer = polar(a, RADIUS - (idx % 4 === 0 ? 4 : 9));
            return (
              <line
                key={`minor-${idx}`}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={idx % 4 === 0 ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.16)'}
                strokeWidth={idx % 4 === 0 ? 1 : 0.7}
                strokeLinecap="round"
              />
            );
          })}
        </motion.svg>
      </div>

      {/* HTML labels overlay. Labels ride the arc and the active section becomes
          the bright zoom-ring reading. */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {SECTIONS.map((s, i) => (
          <SectionLabel
            key={s.id}
            label={s.label}
            sectionAngle={(i - (SECTIONS.length - 1) / 2) * STEP}
            isActive={i === activeIdx}
            wheelRotation={springRotation}
            onClick={() => jump(i)}
          />
        ))}
      </div>
    </div>
  );
};

interface SectionLabelProps {
  label: string;
  sectionAngle: number;
  isActive: boolean;
  wheelRotation: import('framer-motion').MotionValue<number>;
  onClick: () => void;
}

const SectionLabel: React.FC<SectionLabelProps> = ({
  label,
  sectionAngle,
  isActive,
  wheelRotation,
  onClick,
}) => {
  // Visible angle = static section angle - wheel rotation. Anchor the label's
  // right edge to the section tick, so it reads like lettering printed beside
  // the camera dial mark.
  const left = useTransform(wheelRotation, (rot) => {
    const visAngle = sectionAngle - rot;
    const rad = (visAngle * Math.PI) / 180;
    return CENTRE_X - LABEL_RADIUS * Math.cos(rad);
  });
  const top = useTransform(wheelRotation, (rot) => {
    const visAngle = sectionAngle - rot;
    const rad = (visAngle * Math.PI) / 180;
    return CENTRE_Y + LABEL_RADIUS * Math.sin(rad);
  });
  // Match the radial tick angle. The SVG tick line is drawn along the wheel
  // radius, which appears as the negative of the visible section angle.
  const rotate = useTransform(wheelRotation, (rot) => {
    const visAngle = sectionAngle - rot;
    return -visAngle;
  });
  const scale = useTransform(wheelRotation, (rot) => {
    const visAngle = Math.abs(sectionAngle - rot);
    if (visAngle < 1) return 1.03;
    if (visAngle > 28) return 0.9;
    return 1.03 - (visAngle / 28) * 0.13;
  });
  const opacity = useTransform(wheelRotation, (rot) => {
    const visAngle = Math.abs(sectionAngle - rot);
    if (visAngle < 1) return 1;
    if (visAngle > 42) return 0;
    return Math.max(0, 0.24 + (1 - (visAngle - 1) / 41) * 0.52);
  });
  const color = isActive ? '#ffffff' : 'rgba(255,255,255,0.46)';

  return (
    <motion.div
      onClick={onClick}
      style={{
        position: 'absolute',
        left,
        top,
        rotate,
        scale,
        opacity,
        transformOrigin: 'right center',
        x: '-100%',
        y: '-50%',
        color,
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        fontSize: isActive ? 19 : 14,
        fontWeight: isActive ? 650 : 500,
        letterSpacing: isActive ? '0.025em' : '0.055em',
        textShadow: isActive
          ? '0 2px 10px rgba(0,0,0,0.75), 0 0 18px rgba(255,255,255,0.18)'
          : '0 1px 5px rgba(0,0,0,0.65)',
        cursor: 'pointer',
        pointerEvents: 'auto',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: isActive ? 10 : 8,
        transition: 'color 0.3s ease-out, font-size 0.3s ease-out, font-weight 0.3s ease-out, letter-spacing 0.3s ease-out',
      }}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        style={{
          width: isActive ? 42 : 14,
          height: isActive ? 3 : 1.5,
          borderRadius: 999,
          background: isActive ? 'rgba(255,218,48,0.98)' : 'rgba(255,255,255,0.26)',
          boxShadow: isActive ? '0 0 10px rgba(255,205,38,0.65)' : undefined,
          flexShrink: 0,
        }}
      />
    </motion.div>
  );
};

export default React.memo(CameraWheel);
