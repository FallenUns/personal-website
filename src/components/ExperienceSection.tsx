import React from 'react';
import { hudLog } from '../hooks/useHudBus';
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';
import RotatingText, { type RotatingTextRef } from './animations/RotatingText';
import LiquidGlass from './LiquidGlass';
import { useLoading, useComponentLoader } from '../contexts/LoadingContext';
import { navigateTo } from '../utils/router';
import { StickySectionBackground } from './visuals/SectionBackground';
import {
  experiences,
  formatPeriod,
  diffMonths
} from '../data/experiences';
import type {
  Experience
} from '../data/experiences';

// Module-scope: sort experiences chronologically (earliest first) and dedupe
// the year labels for the YearBillboard. Stable across renders.
const sortedExps = [...experiences].sort((a, b) => {
  const da = a.start.year * 12 + a.start.month;
  const db = b.start.year * 12 + b.start.month;
  return da - db;
});
const yearLabels: string[] = Array.from(
  new Set(sortedExps.map((e) => String(e.start.year)))
);

/**
 * Gate for the horizontal scrolljack layout.
 *
 * Returns true when both:
 *   - viewport ≥ 768px (scrolljacks are bad UX on touch)
 *   - `prefers-reduced-motion: no-preference` (the slide is contemplative
 *     but the locked-scroll feel is disorienting for users with vestibular
 *     sensitivity, so we honour the OS hint)
 *
 * Listens to both media queries live so resizing or toggling Reduce Motion
 * in System Settings flips the layout without a refresh.
 */
const useIsHorizontalEnabled = (): boolean => {
  const [enabled, setEnabled] = React.useState(() => {
    if (typeof window === 'undefined') return true;
    const wide = window.matchMedia('(min-width: 768px)').matches;
    const noReduce = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    return wide && noReduce;
  });
  React.useEffect(() => {
    const mqWide = window.matchMedia('(min-width: 768px)');
    const mqReduce = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const sync = () => setEnabled(mqWide.matches && mqReduce.matches);
    sync();
    mqWide.addEventListener?.('change', sync);
    mqReduce.addEventListener?.('change', sync);
    return () => {
      mqWide.removeEventListener?.('change', sync);
      mqReduce.removeEventListener?.('change', sync);
    };
  }, []);
  return enabled;
};

const Tag: React.FC<{ text: string; index?: number }> = ({ text, index = 0 }) => (
  <motion.span
    className="text-xs px-2.5 py-1 bg-white/10 text-white/85 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-200 cursor-default"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    whileHover={{ scale: 1.05 }}
  >
    {text}
  </motion.span>
);

// Animated counter component
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1 }) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (isInView) {
      let start = 0;
      const increment = value / (duration * 60); // 60 FPS
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
};

// Progress indicator for the timeline
const TimelineProgress: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-0 w-1 h-full bg-white/15">
      <motion.div
        className="w-full"
        style={{
          background:
            'linear-gradient(180deg, #2F293A 0%, #8b5cf6 58%, #FF9FFC 100%)',
          boxShadow:
            '0 0 12px rgba(139, 92, 246, 0.45), 0 0 6px rgba(255, 159, 252, 0.45)',
        }}
        initial={{ height: 0 }}
        whileInView={{ height: `${progress}%` }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
    </div>
  );
};

const ExperienceItem: React.FC<{
  exp: Experience;
  index: number;
  cardWidth: number;
  isMobile: boolean;
  layout?: 'timeline' | 'rail';
  onViewDetails: () => void;
}> = ({ exp, index, cardWidth, isMobile, layout = 'timeline', onViewDetails }) => {
  const period = formatPeriod(exp.start, exp.end);
  const durationMonths = diffMonths(exp.start, exp.end);
  const durationStr = durationMonths >= 12 ? `${(durationMonths / 12).toFixed(durationMonths % 12 === 0 ? 0 : 1)} yrs` : `${durationMonths} mos`;

  const [isHovered, setIsHovered] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '0px 0px -10% 0px' });

  // Add some stats for visual appeal
  const stats = [
    { label: 'Skills', value: exp.skills.length },
    { label: 'Highlights', value: exp.highlights.length },
    { label: 'Duration', value: durationMonths, suffix: 'mo' }
  ];
  const cardHeight = 380;
  const visibleSkills = isMobile ? exp.skills.slice(0, 1) : exp.skills.slice(0, 2);

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateY: index % 2 === 0 ? -15 : 15 }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        rotateY: 0
      } : {}}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{
        duration: 0.6,
        ease: 'easeOut',
        delay: index * 0.1,
        rotateY: { duration: 0.8 }
      }}
      style={{ width: `${cardWidth}px`, height: `${cardHeight}px`, maxWidth: '100%' }}
      className="group cursor-pointer perspective-1000 mx-auto"
      onClick={onViewDetails}
      onMouseEnter={() => { setIsHovered(true); hudLog(`> hover: ${exp.company} · ${exp.role}`); }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      whileHover={{
        scale: 1.02,
        rotateY: index % 2 === 0 ? 2 : -2,
        transition: { duration: 0.3 }
      }}
    >
      <LiquidGlass
        width={cardWidth}
        height={cardHeight}
        positioning="relative"
        style={{ borderRadius: '18px' }}
        elasticity={0.15}
        // Stable shader uniforms. Previously these flipped on hover, which
        // re-uploaded uniforms / re-evaluated the displacement map every
        // pointer-enter — visible as a frame stutter. The whileHover scale
        // (1.02) on the parent motion.div already conveys "lift" cheaply
        // via the compositor; we don't need to perturb the shader for it.
        saturation={165}
        aberrationIntensity={1.35}
        displacementScale={70}
        blurAmount={3.5}
        mode='shader'
      >
        <div className="detail-readable p-4 sm:p-6 md:p-8 text-white h-full flex flex-col relative overflow-hidden">
          {/* Animated background pattern */}
          <motion.div
            className="absolute inset-0 opacity-5"
            animate={isHovered ? {
              background: [
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)"
              ]
            } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Header with company info */}
          <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 relative z-10">
            <div className="flex-1">
              <motion.h3
                className="text-base sm:text-lg md:text-xl font-semibold leading-tight line-clamp-2 [text-shadow:0_2px_5px_rgba(0,0,0,0.8)] mb-2"
                animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {exp.role}
              </motion.h3>
              <motion.div
                className="text-white/80 text-xs sm:text-sm mb-2 line-clamp-2"
                animate={isHovered ? { x: 5 } : { x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {exp.company}{exp.location ? ` • ${exp.location}` : ''}
              </motion.div>
              <motion.div
                className="text-white/70 text-[11px] sm:text-xs"
                animate={isHovered ? { x: 5 } : { x: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <div className="flex items-center gap-2">
                  <span>{period}</span>
                  <span className="text-white/60">({durationStr})</span>
                </div>
              </motion.div>
            </div>

            {/* Category badge with animation */}
            <motion.div
              className="px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.25)" }}
              transition={{ duration: 0.2 }}
            >
              {exp.category}
            </motion.div>
          </div>

          {/* Quick stats row */}
          <motion.div
            className="flex gap-3 sm:gap-4 mb-4 relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            {stats.map((stat, statIndex) => (
              <div key={stat.label} className="text-center">
                <motion.div
                  className="text-base sm:text-lg font-bold text-orange-300"
                  animate={isInView ? { scale: [0.8, 1.1, 1] } : {}}
                  transition={{ delay: index * 0.1 + 0.4 + statIndex * 0.1, duration: 0.5 }}
                >
                  <AnimatedCounter value={stat.value} duration={0.8} />
                  {stat.suffix && <span className="text-xs sm:text-sm">{stat.suffix}</span>}
                </motion.div>
                <div className="text-[11px] sm:text-xs text-white/60">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Main content - simplified without show more/less functionality */}
          <div className="flex-1 mb-3 sm:mb-4 relative z-10 min-h-[72px]">
            <p className="text-white/90 text-sm leading-relaxed line-clamp-4 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] break-words">
              {exp.highlights[0]}
            </p>
          </div>

          {/* Bottom section with enhanced tags and action button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 sm:mt-4 gap-3 relative z-10">
            {/* Animated skill tags */}
            <div className="flex flex-wrap gap-2">
              <Tag text={exp.category} index={0} />
              {visibleSkills.map((skill, skillIndex) => (
                <Tag key={skill} text={skill} index={skillIndex + 1} />
              ))}
              {exp.skills.length > visibleSkills.length && (
                <motion.span
                  className="text-xs px-2.5 py-1 bg-white/5 text-white/60 rounded-full backdrop-blur-sm border border-white/10"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.1)", scale: 1.05 }}
                >
                  +{exp.skills.length - visibleSkills.length} more
                </motion.span>
              )}
            </div>

            {/* Enhanced action button - matching ProjectsSection arrow style */}
            <motion.div
              className="self-end sm:self-auto p-2.5 bg-white/15 rounded-full backdrop-blur-sm border border-white/10 group-hover:bg-white/25 transition-colors duration-300"
              animate={{
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 45 : 0
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut"
              }}
              whileTap={{ scale: 0.9 }}
              style={{
                transformOrigin: "center"
              }}
            >
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white transition-colors duration-300"
                animate={{
                  rotate: isHovered ? [0, 5, -5, 0] : 0
                }}
                transition={{
                  duration: isHovered ? 0.6 : 0.3,
                  ease: "easeInOut",
                  repeat: isHovered ? Infinity : 0,
                  repeatDelay: isHovered ? 2 : 0
                }}
              >
                <path d="M7 17L17 7" />
                <path d="M7 7L17 7L17 17" />
              </motion.svg>
            </motion.div>
          </div>
        </div>
      </LiquidGlass>
    </motion.div>
  );

  if (layout === 'rail') {
    return (
      <div className="relative flex h-full w-full items-center justify-center" ref={cardRef}>
        {card}
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={cardRef}>
      {/* Timeline dot — refined ripple.
          Old version had a repeating box-shadow keyframe (like a drop hitting
          water over and over) plus a separately repeating scale ring. That
          read as jittery "rain hitting the line" — too busy, no rest state.
          New version:
            - Outer halo: a soft, slow breathing glow (always on for in-view
              items). Steady ambient presence, like a star.
            - Inner dot: gradient orange→amber, gentle scale on hover.
            - Hover ripple: ONE single, spring-eased wave that emerges on
              hover-enter and resets on hover-leave — feels intentional,
              not noisy. */}
      <motion.div
        className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative flex h-4 w-4 items-center justify-center">
          {/* Soft ambient halo — always on, breathes slowly. */}
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(251,146,60,0.55) 0%, rgba(251,146,60,0) 70%)',
              filter: 'blur(4px)',
            }}
            animate={
              isInView
                ? { scale: [1, 1.45, 1], opacity: [0.55, 0.85, 0.55] }
                : {}
            }
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Single hover ripple — animates once on hover-enter. */}
          <motion.span
            key={isHovered ? 'on' : 'off'}
            className="absolute inset-0 rounded-full border border-orange-200/70"
            initial={{ scale: 1, opacity: 0 }}
            animate={
              isHovered
                ? { scale: 2.4, opacity: [0, 0.9, 0] }
                : { scale: 1, opacity: 0 }
            }
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
          />

          {/* Inner dot — gradient, lifts slightly on hover. */}
          <motion.span
            className="relative h-2.5 w-2.5 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #fde68a 0%, #fb923c 55%, #ea580c 100%)',
              boxShadow:
                '0 0 8px 0 rgba(251,146,60,0.55), 0 0 18px 2px rgba(251,146,60,0.25)',
            }}
            animate={isHovered ? { scale: 1.18 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          />
        </div>
      </motion.div>

      {/* Card wrapper with enhanced alternating layout */}
      <div className={`md:grid md:grid-cols-2 md:gap-10 items-start ${index % 2 === 0 ? '' : ''}`}>
        {index % 2 === 0 ? (
          <div className="hidden md:block" />
        ) : null}

        {card}

        {index % 2 !== 0 ? (
          <div className="hidden md:block" />
        ) : null}
      </div>
    </div>
  );
};

interface YearBillboardProps {
  /** All year labels in chronological order, deduped. */
  yearLabels: string[];
  /** Scroll progress through the parent section (0..1). */
  scrollYProgress: MotionValue<number>;
  /** For each card index, the scroll-progress value at which it sits centred. */
  cardCenters: number[];
}

/**
 * Giant year display that snaps to whichever card is centred. Uses
 * RotatingText's imperative ref (jumpTo) so the existing character-stagger
 * animation fires on each year change — no auto-rotate, no interval.
 */
const YearBillboard: React.FC<YearBillboardProps> = ({
  yearLabels,
  scrollYProgress,
  cardCenters,
}) => {
  const rotatingRef = React.useRef<RotatingTextRef>(null);
  const lastIdxRef = React.useRef(0);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (cardCenters.length === 0) return;
    // Pick the card whose centre is nearest to current progress.
    let nearest = 0;
    let bestDist = Infinity;
    for (let i = 0; i < cardCenters.length; i++) {
      const d = Math.abs(cardCenters[i] - v);
      if (d < bestDist) {
        bestDist = d;
        nearest = i;
      }
    }
    const year = String(sortedExps[nearest].start.year);
    const yearIdx = yearLabels.indexOf(year);
    if (yearIdx !== -1 && yearIdx !== lastIdxRef.current) {
      lastIdxRef.current = yearIdx;
      rotatingRef.current?.jumpTo(yearIdx);
    }
  });

  return (
    <div
      className="pointer-events-none absolute top-0 left-0 right-0 z-10 px-[6vw] pt-10 flex items-baseline gap-6"
      aria-hidden="true"
    >
      <span className="text-white/55 text-xs uppercase tracking-[0.32em] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
        What I've done
      </span>
      <RotatingText
        ref={rotatingRef}
        texts={yearLabels}
        auto={false}
        loop={false}
        rotationInterval={999999}
        staggerDuration={0.04}
        staggerFrom="last"
        splitBy="characters"
        mainClassName="font-black tracking-tight text-white leading-none"
        elementLevelClassName="text-[14vw] sm:text-[12vw] md:text-[10vw] lg:text-[9vw]"
        splitLevelClassName="overflow-hidden"
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        initial={{ y: '110%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '-110%', opacity: 0 }}
        style={{ textShadow: '0 4px 28px rgba(0,0,0,0.7)' }}
      />
    </div>
  );
};

interface ExperiencePhotoStripProps {
  /** Index into sortedExps for the currently centred card. */
  currentIdx: number;
  /** Honour the reduced-motion media query (disables stagger/fade). */
  reducedMotion: boolean;
}

/**
 * Photo strip that sits below the cards in the sticky scrolljack viewport.
 * Shows up to 3 photos from the currently-centred experience and crossfades
 * when the centred card changes. Photos are tiny "polaroids" with a caption
 * underneath; hovering one lifts and tilts it slightly (TiltedCard-style).
 *
 * Uses AnimatePresence with mode="popLayout" so old photos exit while new
 * ones stagger in — feels alive instead of snapping. Respects reduced-motion
 * by collapsing all animations to instant fades.
 */
const ExperiencePhotoStrip: React.FC<ExperiencePhotoStripProps> = ({
  currentIdx,
  reducedMotion,
}) => {
  const exp = sortedExps[currentIdx];
  const photos = exp?.photos?.slice(0, 3) ?? [];
  if (photos.length === 0) return null;

  // Use a stable key per experience so AnimatePresence swaps the WHOLE group
  // instead of trying to diff individual photos across experiences (which
  // would feel like a slot-machine flicker).
  return (
    <div
      className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex items-end justify-center gap-4"
      aria-hidden="true"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={exp.id}
          className="flex items-end gap-4"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{
            duration: reducedMotion ? 0.12 : 0.22,
            ease: 'easeOut',
          }}
        >
          {photos.map((photo, i) => (
            <motion.figure
              key={photo.url}
              className="pointer-events-auto relative w-[180px] shrink-0"
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 14, rotate: i % 2 === 0 ? -2 : 2 }
              }
              animate={{
                opacity: 1,
                y: 0,
                rotate: reducedMotion ? 0 : i % 2 === 0 ? -1.5 : 1.5,
              }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{
                duration: reducedMotion ? 0.12 : 0.26,
                delay: reducedMotion ? 0 : 0.04 + i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={
                reducedMotion
                  ? undefined
                  : {
                      y: -6,
                      rotate: 0,
                      scale: 1.05,
                      transition: { duration: 0.18, ease: 'easeOut' },
                    }
              }
            >
              <div
                className="relative overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/15 shadow-[0_18px_48px_-18px_rgba(0,0,0,0.7)] backdrop-blur-sm"
                style={{ aspectRatio: '4 / 3' }}
              >
                <img
                  src={photo.url}
                  alt={photo.caption ?? `${exp.role} photo ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Subtle bottom-edge vignette so caption stays legible if it
                    ever overlaps a bright photo region during entry. */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              {photo.caption ? (
                <figcaption className="mt-2 line-clamp-2 text-[11px] leading-snug text-white/70 [text-shadow:0_1px_3px_rgba(0,0,0,0.85)]">
                  {photo.caption}
                </figcaption>
              ) : null}
            </motion.figure>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

interface HorizontalExperienceTimelineProps {
  /** Click handler that opens the ExperienceDetail modal. */
  onViewDetails: (id: string) => void;
}

const CARD_WIDTH = 720;
const CARD_HEIGHT = 380;
const CARD_GAP = 32;

/**
 * Sticky scrolljack version of the experience timeline.
 *
 * Outer <div> is (N+1) viewport-heights tall so there's vertical scroll
 * travel. Inside, a sticky container locks the viewport for the duration
 * of the section. A flex rail of LiquidGlass cards translates left via
 * useTransform on the section's scrollYProgress. A YearBillboard sits in
 * the top-left and tracks which card is centred.
 */
const HorizontalExperienceTimeline: React.FC<HorizontalExperienceTimelineProps> = ({
  onViewDetails,
}) => {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'] as const,
  });

  // Viewport width tracked in state so xMax updates on resize. We also
  // recompute on mount to pick up the actual rendered width (in case
  // initial render runs at a wrong size during the loading-state).
  const [viewportW, setViewportW] = React.useState(() =>
    typeof window === 'undefined' ? 1280 : window.innerWidth
  );
  React.useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const N = sortedExps.length;
  const SLOT = CARD_WIDTH + CARD_GAP;
  const trackWidth = N * SLOT - CARD_GAP;
  // We want card i sitting centred when progress puts the rail at a
  // specific x. At progress=0, place the first card centred:
  //   xStart = viewportW/2 - CARD_WIDTH/2
  // At progress=1, last card centred:
  //   xEnd = viewportW/2 - ((N-1) * SLOT + CARD_WIDTH/2)
  const xStart = viewportW / 2 - CARD_WIDTH / 2;
  const xEnd = viewportW / 2 - ((N - 1) * SLOT + CARD_WIDTH / 2);
  const trackX = useTransform(scrollYProgress, [0, 1], [xStart, xEnd]);

  // Card centres in scroll-progress space: card i is centred at progress
  // i / (N-1) when N >= 2; for N=1 it's centred at 0.
  const cardCenters = React.useMemo(() => {
    if (N <= 1) return [0];
    return Array.from({ length: N }, (_, i) => i / (N - 1));
  }, [N]);

  // Track the currently-centred card so the photo strip below knows which
  // experience's photos to display. YearBillboard derives this internally
  // for its own (imperative) text rotation; we mirror the same nearest-
  // centre logic here so both stay in lockstep without coupling. Updates
  // are gated by an equality check so we only re-render when the index
  // actually changes — the motion value fires on every scroll frame.
  const [currentIdx, setCurrentIdx] = React.useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (cardCenters.length === 0) return;
    let nearest = 0;
    let bestDist = Infinity;
    for (let i = 0; i < cardCenters.length; i++) {
      const d = Math.abs(cardCenters[i] - v);
      if (d < bestDist) {
        bestDist = d;
        nearest = i;
      }
    }
    setCurrentIdx((prev) => (prev === nearest ? prev : nearest));
  });

  const prefersReducedMotion = useReducedMotion() ?? false;

  // Section height: (N + 1) viewports for comfortable scroll travel.
  const sectionHeight = `${(N + 1) * 100}vh`;

  return (
    <div
      ref={sectionRef}
      className="relative w-full"
      style={{ height: sectionHeight }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <YearBillboard
          yearLabels={yearLabels}
          scrollYProgress={scrollYProgress}
          cardCenters={cardCenters}
        />

        {/* Centre band — cards sit in a flex row. We apply `x` via motion so
            framer-motion takes the perf-friendly path (transform, no reflow). */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center"
          style={{
            x: trackX,
            gap: CARD_GAP,
            width: trackWidth,
            willChange: 'transform',
          }}
        >
          {sortedExps.map((exp, i) => (
            <div
              key={exp.id}
              style={{ width: CARD_WIDTH, height: CARD_HEIGHT, flexShrink: 0 }}
            >
              <ExperienceItem
                exp={exp}
                index={i}
                cardWidth={CARD_WIDTH}
                isMobile={false}
                layout="rail"
                onViewDetails={() => onViewDetails(exp.id)}
              />
            </div>
          ))}
        </motion.div>

        {/* Scroll-synced photo strip — shows photos from whichever experience
            is currently centred. Lives in the lower-third of the sticky view
            where the cards leave generous vertical breathing room. */}
        <ExperiencePhotoStrip
          currentIdx={currentIdx}
          reducedMotion={prefersReducedMotion}
        />

        {/* Scroll-progress rail — gradient fill, soft glow, traveling head.
            Three layers stacked at the same position:
              1. Track  — rounded 3px pill, low-alpha bg, faint inner shadow.
              2. Fill   — gradient (cyan → violet → magenta) scaled-X by
                          scrollYProgress; the gradient stays anchored so the
                          colour you see at any point on the track is stable.
              3. Head   — small glowing dot that rides the fill's leading edge
                          via useTransform(progress → left%). Acts as a
                          "comet" cursor for the timeline. */}
        <div className="pointer-events-none absolute bottom-10 left-[6vw] right-[6vw] h-[3px]">
          <div
            className="absolute inset-0 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
            style={{ backgroundColor: 'rgba(47, 41, 58, 0.88)' }}
          />
          <motion.div
            className="absolute inset-y-0 left-0 origin-left rounded-full"
            style={{
              scaleX: scrollYProgress,
              backgroundImage:
                'linear-gradient(90deg, #2F293A 0%, #8b5cf6 55%, #FF9FFC 100%)',
              boxShadow:
                '0 0 12px 0 rgba(139, 92, 246, 0.55), 0 0 6px 0 rgba(255, 159, 252, 0.5)',
              width: '100%',
            }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{
              left: useTransform(scrollYProgress, [0, 1], ['0%', '100%']),
            }}
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{
                background: '#FF9FFC',
                boxShadow:
                  '0 0 18px 4px rgba(255, 159, 252, 0.58), 0 0 6px 0 rgba(255, 159, 252, 0.95)',
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ExperienceSection: React.FC = () => {
  useComponentLoader('ExperienceSection');
  const { isLoading } = useLoading();
  const isHorizontal = useIsHorizontalEnabled();

  // Measurement for responsive card width
  const containerRef = React.useRef<HTMLDivElement>(null);
  const sectionRef = React.useRef<HTMLElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(860);
  const [isMdUp, setIsMdUp] = React.useState<boolean>(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

  const isInView = useInView(sectionRef, { margin: '-20%' });

  React.useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      setContainerWidth(Math.min(1200, Math.max(320, w)));
      setIsMdUp(window.innerWidth >= 768);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const sorted = React.useMemo(() => {
    return [...experiences].sort((a, b) => {
      const aEnd = a.end ? new Date(a.end.year, a.end.month - 1, 1).getTime() : Number.POSITIVE_INFINITY;
      const bEnd = b.end ? new Date(b.end.year, b.end.month - 1, 1).getTime() : Number.POSITIVE_INFINITY;
      if (aEnd !== bEnd) return bEnd - aEnd; // current first
      const aStart = new Date(a.start.year, a.start.month - 1, 1).getTime();
      const bStart = new Date(b.start.year, b.start.month - 1, 1).getTime();
      return bStart - aStart;
    });
  }, []);

  // Compute a safe card width that fits within a 2-column grid on md+, or full width on mobile
  const gridGap = 40; // Tailwind gap-10
  const computedCardWidth = React.useMemo(() => {
    if (!containerWidth) return 600;
    if (isMdUp) {
      return Math.floor((containerWidth - gridGap) / 2);
    }
    return Math.max(250, Math.min(520, containerWidth - 16));
  }, [containerWidth, isMdUp]);

  const handleViewDetails = (experienceId: string) => {
    const experience = sorted.find((item) => item.id === experienceId);
    hudLog(
      experience
        ? `> experience.open "${experience.company} · ${experience.role}"`
        : `> experience.open "${experienceId}"`,
      'ok'
    );
    navigateTo(`/experience/${experienceId}`);
  };

  // Calculate total experience metrics for the header
  const totalMonths = sorted.reduce((acc, exp) => acc + diffMonths(exp.start, exp.end), 0);
  const totalSkills = new Set(sorted.flatMap(exp => exp.skills)).size;
  const totalProjects = sorted.length;

  return (
    <motion.section
      ref={sectionRef}
      id="experience"
      className={
        isHorizontal
          ? 'relative w-full'
          : 'relative min-h-screen w-full flex items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 pt-24 pb-14'
      }
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 30 : 0 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: isLoading ? 0 : 0.8 }}
    >
      {isHorizontal ? (
        <>
          <StickySectionBackground variant="experience" />
          <div className="relative z-10">
            <HorizontalExperienceTimeline onViewDetails={handleViewDetails} />
          </div>
        </>
      ) : (
        <>
          <StickySectionBackground variant="experience" />
          {/* Animated background elements */}
          <motion.div
            className="absolute inset-0 opacity-5"
            animate={isInView ? {
              background: [
                "radial-gradient(circle at 20% 20%, rgba(251, 146, 60, 0.1) 0%, transparent 70%)",
                "radial-gradient(circle at 80% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
                "radial-gradient(circle at 60% 80%, rgba(251, 146, 60, 0.1) 0%, transparent 70%)",
                "radial-gradient(circle at 20% 20%, rgba(251, 146, 60, 0.1) 0%, transparent 70%)"
              ]
            } : {}}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          <div className="w-full max-w-6xl relative z-10" ref={containerRef}>
            {/* Enhanced Header with kinetic display typography */}
            <div className="text-center text-white mb-12">
              <motion.div
                className="flex justify-center mb-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="hero-eyebrow inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  What I've done
                </span>
              </motion.div>
              <motion.h2
                className="font-display font-extrabold text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.04em] mb-5 [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="relative inline-block">
                  Experiences
                </span>
              </motion.h2>

              <motion.p
                className="text-white/85 max-w-2xl mx-auto mb-8 text-lg font-body-grotesk"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                A journey through data science and full‑stack development, building impactful solutions.
              </motion.p>

              {/* Experience metrics */}
              <motion.div
                className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {[
                  { label: 'Experience', value: totalMonths, suffix: ' months' },
                  { label: 'Skills', value: totalSkills, suffix: '' },
                  { label: 'Projects', value: totalProjects, suffix: '' }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="text-2xl md:text-3xl font-bold text-orange-400 mb-1"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.3 + index * 0.1,
                        duration: 0.5,
                        type: "spring",
                        stiffness: 150
                      }}
                    >
                      <AnimatedCounter value={metric.value} duration={1.2} />
                      <span className="text-lg">{metric.suffix}</span>
                    </motion.div>
                    <div className="text-white/70 text-sm font-medium">{metric.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Enhanced Timeline */}
            <div className="relative space-y-12">
              {/* Animated progress line */}
              <div className="hidden md:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1">
                <div className="w-full h-full bg-white/15 rounded-full" />
                <TimelineProgress progress={isInView ? 100 : 0} />
              </div>

              {/* Timeline items */}
              {sorted.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  className="relative"
                >
                  <ExperienceItem
                    exp={exp}
                    index={idx}
                    cardWidth={computedCardWidth}
                    isMobile={!isMdUp}
                    onViewDetails={() => handleViewDetails(exp.id)}
                  />

                  {/* Optional: Add connecting elements between timeline items */}
                  {idx < sorted.length - 1 && (
                    <motion.div
                      className="hidden md:block absolute left-1/2 -translate-x-1/2 bottom-0 transform translate-y-6 text-white/20"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 + 0.5 }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 16l-4-4h8l-4 4z" />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Call to action */}
            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.p
                className="text-white/70 mb-4"
                whileHover={{ scale: 1.02 }}
              >
                Want to see the full details of any experience?
              </motion.p>
              <motion.div
                className="text-orange-300 text-sm font-medium"
                animate={{
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Click on any card to explore more →
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </motion.section>
  );
};

export default React.memo(ExperienceSection);
