import React from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useLoading, useComponentLoader } from '../contexts/LoadingContext';
import { navigateTo } from '../utils/router';
import { experiences, formatPeriod, diffMonths, type Experience } from '../data/experiences';

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

// Animated counter
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1 }) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = value / (duration * 60);
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
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
};

// Single experience card with 3D slide positions
const ExperienceCard: React.FC<{
  exp: Experience;
  isActive: boolean;
  isPrev: boolean;
  isNext: boolean;
  position: 'prev' | 'active' | 'next' | 'hidden';
  onViewDetails: () => void;
}> = ({ exp, isActive, isPrev, isNext, position, onViewDetails }) => {
  const period = formatPeriod(exp.start, exp.end);
  const durationMonths = diffMonths(exp.start, exp.end);
  const durationStr =
    exp.duration ||
    (durationMonths >= 12
      ? `${(durationMonths / 12).toFixed(durationMonths % 12 === 0 ? 0 : 1)} yrs`
      : `${durationMonths} mos`);

  // Enhanced transforms based on card position
  const getTransforms = () => {
    switch (position) {
      case 'active':
        return {
          x: 0,
          scale: 1,
          opacity: 1,
          rotateY: 0,
          zIndex: 10,
          filter: 'blur(0px)'
        };
      case 'prev':
        return {
          x: -200,
          scale: 0.75,
          opacity: 0.3,
          rotateY: 45,
          zIndex: 5,
          filter: 'blur(2px)'
        };
      case 'next':
        return {
          x: 200,
          scale: 0.75,
          opacity: 0.3,
          rotateY: -45,
          zIndex: 5,
          filter: 'blur(2px)'
        };
      default:
        return {
          x: 0,
          scale: 0.5,
          opacity: 0,
          rotateY: 0,
          zIndex: 1,
          filter: 'blur(4px)'
        };
    }
  };

  const transforms = getTransforms();

  return (
    <motion.div
      className="absolute inset-0 w-full flex items-center justify-center"
      animate={{ 
        x: transforms.x, 
        scale: transforms.scale, 
        opacity: transforms.opacity, 
        rotateY: transforms.rotateY,
        filter: transforms.filter
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        damping: 20,
        stiffness: 100
      }}
      style={{ 
        transformStyle: 'preserve-3d', 
        perspective: '1000px',
        zIndex: transforms.zIndex
      }}
    >
      <motion.div
        className="cursor-pointer flex items-center justify-center w-full h-full"
        whileHover={isActive ? { scale: 1.02, y: -5, transition: { duration: 0.3 } } : {}}
        onClick={isActive ? onViewDetails : undefined}
      >
        <LiquidGlass
          width={650}
          height={480}
          positioning="relative"
          style={{ borderRadius: '18px', width: '650px', height: '480px' }}
          elasticity={0.15}
          saturation={isHovered ? 180 : 150}
          aberrationIntensity={isHovered ? 1.5 : 1.2}
          displacementScale={isHovered ? 80 : 60}
          blurAmount={isHovered ? 8 : 6}
          mode='shader'
        >
          <div className="p-6 md:p-8 text-white h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6 relative z-10">
              <div className="flex-1">
                <motion.h3
                  className="text-xl md:text-2xl font-semibold [text-shadow:0_2px_5px_rgba(0,0,0,0.8)] mb-3"
                  animate={isActive ? { scale: 1.02 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {exp.role}
                </motion.h3>
                <motion.div
                  className="text-white/80 text-base mb-3"
                  animate={isActive ? { x: 5 } : { x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {exp.company}
                  {exp.location ? ` • ${exp.location}` : ''}
                </motion.div>
                <motion.div
                  className="text-white/70 text-sm"
                  animate={isActive ? { x: 5 } : { x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                >
                  <div className="flex items-center gap-2">
                    <span>{period}</span>
                    <span className="text-white/60">({durationStr})</span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="px-3 py-1.5 text-sm font-medium bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/10"
                whileHover={isActive ? { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.25)' } : {}}
                transition={{ duration: 0.2 }}
              >
                {exp.category}
              </motion.div>
            </div>

            {/* Quick stats */}
            <motion.div
              className="flex gap-6 mb-6 relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 5 }}
              transition={{ delay: 0.3 }}
            >
              {[
                { label: 'Skills', value: exp.skills.length },
                { label: 'Highlights', value: exp.highlights.length },
                { label: 'Duration', value: durationMonths, suffix: ' mo' },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <motion.div
                    className="text-xl font-bold text-orange-300"
                    animate={isActive ? { scale: [0.8, 1.1, 1] } : { scale: 0.9 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  >
                    {isActive ? <AnimatedCounter value={stat.value} duration={0.8} /> : stat.value}
                    {stat.suffix && <span className="text-sm">{stat.suffix}</span>}
                  </motion.div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Highlights */}
            <div className="flex-1 mb-6 relative z-10">
              <motion.div
                className="space-y-3"
                animate={isActive ? { opacity: 1 } : { opacity: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {exp.highlights.slice(0, 3).map((h, hi) => (
                  <motion.p
                    key={hi}
                    className="text-white/90 text-sm leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"
                    initial={{ opacity: 0, x: 20 }}
                    animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.6, x: 10 }}
                    transition={{ duration: 0.4, delay: isActive ? hi * 0.1 : 0 }}
                  >
                    • {h}
                  </motion.p>
                ))}
              </motion.div>
            </div>

            {/* Skills */}
            <div className="relative z-10">
              <motion.h4
                className="text-sm font-semibold text-white/80 mb-3"
                animate={isActive ? { opacity: 1 } : { opacity: 0.7 }}
              >
                Key Technologies:
              </motion.h4>
              <div className="flex flex-wrap gap-2">
                {exp.skills.slice(0, 6).map((s, si) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={
                      isActive
                        ? { opacity: 1, scale: 1, transition: { delay: si * 0.05 } }
                        : { opacity: 0.6, scale: 0.9 }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <Tag text={s} index={si} />
                  </motion.div>
                ))}
                {exp.skills.length > 6 && (
                  <motion.span className="text-xs px-2.5 py-1 bg-white/5 text-white/60 rounded-full backdrop-blur-sm border border-white/10">
                    +{exp.skills.length - 6} more
                  </motion.span>
                )}
              </div>
            </div>

            {/* Corner action */}
            <motion.div
              className="absolute bottom-6 right-6 p-3 bg-white/15 rounded-full backdrop-blur-sm border border-white/10 group-hover:bg-white/25 transition-colors duration-300"
              animate={isActive ? { scale: 1.1, rotate: 45, opacity: 1 } : { scale: 0.9, rotate: 0, opacity: 0.7 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              whileTap={{ scale: 0.9 }}
              onClick={isActive ? onViewDetails : undefined}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white transition-colors duration-300"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7L17 7L17 17" />
              </svg>
            </motion.div>
          </div>
        </LiquidGlass>
      </motion.div>
    </motion.div>
  );
};

const ExperienceSection: React.FC = () => {
  useComponentLoader('ExperienceSection');
  const { isLoading } = useLoading();

  const sectionRef = React.useRef<HTMLDivElement>(null);

  // Sort oldest → newest (timeline)
  const sorted = React.useMemo(() => {
    return [...experiences].sort((a, b) => {
      const aStart = new Date(a.start.year, a.start.month - 1, 1).getTime();
      const bStart = new Date(b.start.year, b.start.month - 1, 1).getTime();
      return aStart - bStart;
    });
  }, []);

  // Fixed scroll progress tracking with better offset
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'], // Track full section scroll
  });

  // Use useTransform for smoother scroll-to-index mapping
  const activeIndexFloat = useTransform(
    scrollYProgress,
    [0, 1],
    [0, sorted.length - 1]
  );

  const [activeIndex, setActiveIndex] = React.useState(0);

  // Better scroll progress mapping
  React.useEffect(() => {
    const unsubscribe = activeIndexFloat.on('change', (latest) => {
      const newIndex = Math.round(latest);
      const clampedIndex = Math.max(0, Math.min(newIndex, sorted.length - 1));
      
      if (clampedIndex !== activeIndex) {
        setActiveIndex(clampedIndex);
        console.log('📊 Scroll progress:', latest.toFixed(3), '→ Active index:', clampedIndex);
      }
    });

    return unsubscribe;
  }, [activeIndexFloat, activeIndex, sorted.length]);

  // Totals for header
  const totalMonths = sorted.reduce((acc, exp) => acc + diffMonths(exp.start, exp.end), 0);
  const totalSkills = new Set(sorted.flatMap((e) => e.skills)).size;
  const totalProjects = sorted.length;

  const handleViewDetails = (id: string) => navigateTo(`/experience/${id}`);

  // Manual navigation via dots
  const handleDotClick = (index: number) => {
    const targetProgress = index / (sorted.length - 1);
    const sectionElement = sectionRef.current;
    if (sectionElement) {
      const rect = sectionElement.getBoundingClientRect();
      const sectionHeight = sectionElement.offsetHeight;
      const targetScrollTop = window.scrollY + rect.top + (targetProgress * sectionHeight) - window.innerHeight / 2;
      
      window.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      id="experience"
      className="relative w-full"
      ref={sectionRef}
      // Ensure enough scroll height - more generous multiplier
      style={{ height: `${Math.max(4, sorted.length * 2) * 100}vh` }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Header */}
        <div className="absolute top-20 left-0 right-0 text-center text-white z-20">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4 [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            Experience Timeline
          </motion.h2>

          <motion.p
            className="text-white/85 max-w-2xl mx-auto mb-8 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            A chronological journey through data science and full-stack development.
          </motion.p>

          {/* Metrics */}
          <motion.div
            className="flex justify-center gap-8 md:gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {[
              { label: 'Experience', value: totalMonths, suffix: ' months' },
              { label: 'Skills', value: totalSkills, suffix: '' },
              { label: 'Projects', value: totalProjects, suffix: '' },
            ].map((m, i) => (
              <motion.div key={m.label} className="text-center" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <motion.div
                  className="text-2xl md:text-3xl font-bold text-orange-400 mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5, type: 'spring', stiffness: 150 }}
                >
                  <AnimatedCounter value={m.value} duration={1.2} />
                  <span className="text-lg">{m.suffix}</span>
                </motion.div>
                <div className="text-white/70 text-sm font-medium">{m.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Progress indicator */}
        <div className="absolute top-1/2 left-8 transform -translate-y-1/2 z-20">
          <div className="text-white/60 text-sm mb-2">Progress</div>
          <div className="w-1 h-32 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="w-full bg-orange-400 rounded-full"
              style={{
                height: useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
              }}
            />
          </div>
        </div>

        {/* Enhanced dots progress */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {sorted.map((exp, i) => (
            <motion.div
              key={i}
              className="relative group cursor-pointer"
              onClick={() => handleDotClick(i)}
            >
              <motion.div
                className="w-3 h-3 rounded-full border-2 transition-colors duration-300"
                animate={{
                  backgroundColor: i === activeIndex ? '#fb923c' : 'rgba(255,255,255,0.2)',
                  borderColor: i === activeIndex ? '#fb923c' : 'rgba(255,255,255,0.4)',
                  scale: i === activeIndex ? 1.3 : 1,
                }}
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
              />
              
              {/* Tooltip */}
              <motion.div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 pointer-events-none"
                whileHover={{ opacity: 1, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {exp.company}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Cards stage */}
        <div className="relative flex-1 w-full flex items-center justify-center overflow-visible" style={{ maxHeight: '480px' }}>
          <div className="relative w-[650px] h-[480px] overflow-visible">
            {/* Render all cards with enhanced positioning logic */}
            {sorted.map((exp, i) => {
              const isActive = i === activeIndex;
              const isPrev = i === activeIndex - 1;
              const isNext = i === activeIndex + 1;
              
              let position: 'prev' | 'active' | 'next' | 'hidden';
              if (isActive) {
                position = 'active';
              } else if (isPrev) {
                position = 'prev';
              } else if (isNext) {
                position = 'next';
              } else {
                position = 'hidden';
              }

              return (
                <ExperienceCard
                  key={exp.id}
                  exp={exp}
                  isActive={isActive}
                  isPrev={isPrev}
                  isNext={isNext}
                  position={position}
                  onViewDetails={() => handleViewDetails(exp.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Enhanced scroll hint */}
        <motion.div
          className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center text-white/60 z-20"
          animate={{ 
            y: [0, 8, 0], 
            opacity: [0.4, 0.8, 0.4] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
        >
          <p className="text-sm mb-2">Scroll to navigate timeline</p>
          <div className="flex justify-center">
            <motion.svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </motion.svg>
          </div>
        </motion.div>

        {/* Current experience title overlay */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-8xl md:text-9xl font-black text-white/5 whitespace-nowrap">
            {sorted[activeIndex]?.company.split(' ')[0] || ''}
          </h3>
        </motion.div>
      </div>
    </section>
  );
};

export default React.memo(ExperienceSection);