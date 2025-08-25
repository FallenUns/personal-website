import React from 'react';
import { motion, useInView } from 'framer-motion';
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

// Progress indicator for the timeline - unused in horizontal layout
// const TimelineProgress: React.FC<{ progress: number }> = ({ progress }) => {
//   return (
//     <div className="absolute left-1/2 -translate-x-1/2 top-0 w-1 h-full bg-white/15">
//       <motion.div
//         className="w-full bg-gradient-to-b from-orange-400 to-blue-500"
//         initial={{ height: 0 }}
//         whileInView={{ height: `${progress}%` }}
//         viewport={{ once: true }}
//         transition={{ duration: 2, ease: "easeOut" }}
//       />
//     </div>
//   );
// };

const ExperienceItem: React.FC<{
  exp: Experience;
  index: number;
  cardWidth: number;
  onViewDetails: () => void;
}> = ({ exp, index, cardWidth, onViewDetails }) => {
  const period = formatPeriod(exp.start, exp.end);
  const durationMonths = diffMonths(exp.start, exp.end);
  const durationStr = exp.duration || (durationMonths >= 12 ? `${(durationMonths/12).toFixed(durationMonths % 12 === 0 ? 0 : 1)} yrs` : `${durationMonths} mos`);

  const [isHovered, setIsHovered] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '0px 0px -10% 0px' });

  // Add some stats for visual appeal
  const stats = [
    { label: 'Skills', value: exp.skills.length },
    { label: 'Highlights', value: exp.highlights.length },
    { label: 'Duration', value: exp.duration ? 2 : durationMonths, suffix: exp.duration ? 'days' : 'mo' }
  ];

  return (
    <div className="relative flex-shrink-0 w-80 lg:w-96 pb-12" ref={cardRef}>
  {/* Timeline connector line - horizontal at bottom */}
  {index > 0 && (
    <motion.div
      className="absolute -left-6 bottom-6 w-6 h-[2px] bg-gradient-to-r from-orange-400/70 to-blue-500/70"
      initial={{ scaleX: 0, opacity: 0 }}
      animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{ transformOrigin: 'left' }}
    />
  )}

  {/* Timeline dot BELOW the card */}
  <motion.div
    className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20"
    initial={{ scale: 0, opacity: 0 }}
    animate={isInView ? { scale: 1, opacity: 1 } : {}}
    transition={{ duration: 0.4, delay: index * 0.1 }}
  >
    <motion.div
      className="relative w-4 h-4 bg-orange-400 rounded-full shadow-lg"
      animate={isInView ? {
        boxShadow: isHovered
          ? ["0 0 0 0 rgba(251,146,60,.4)", "0 0 0 15px rgba(251,146,60,0)"]
          : "0 0 0 0 rgba(251,146,60,.4)"
      } : {}}
      transition={{
        boxShadow: { duration: isHovered ? 1.5 : 0.3, repeat: isHovered ? Infinity : 0, ease: "easeOut" }
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-orange-300"
        animate={isInView && isHovered ? { scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: 50, rotateY: -15 }}
        animate={isInView ? { 
          opacity: 1, 
          x: 0, 
          rotateY: 0 
        } : {}}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ 
          duration: 0.6, 
          ease: 'easeOut', 
          delay: index * 0.15,
          rotateY: { duration: 0.8 }
        }}
        className="w-full group cursor-pointer perspective-1000"
        onClick={onViewDetails}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
        whileHover={{ 
          scale: 1.02,
          y: -5,
          transition: { duration: 0.3 }
        }}
      >
        <LiquidGlass
          width={cardWidth}
          height={380}
          positioning="relative"
          style={{ borderRadius: '18px', width: '100%', minHeight: '380px' }}
          elasticity={0.15}
          saturation={isHovered ? 180 : 150}
          aberrationIntensity={isHovered ? 1.5 : 1.2}
          displacementScale={isHovered ? 80 : 60}
          blurAmount={isHovered ? 8 : 6}
          mode='shader'
        >
          <div className="p-6 md:p-8 text-white h-full flex flex-col relative overflow-hidden">
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
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4 relative z-10">
              <div className="flex-1">
                <motion.h3 
                  className="text-lg md:text-xl font-semibold [text-shadow:0_2px_5px_rgba(0,0,0,0.8)] mb-2"
                  animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {exp.role}
                </motion.h3>
                <motion.div 
                  className="text-white/80 text-sm mb-2"
                  animate={isHovered ? { x: 5 } : { x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {exp.company}{exp.location ? ` • ${exp.location}` : ''}
                </motion.div>
                <motion.div 
                  className="text-white/70 text-xs"
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
                className="px-3 py-1.5 text-xs font-medium bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.25)" }}
                transition={{ duration: 0.2 }}
              >
                {exp.category}
              </motion.div>
            </div>

            {/* Quick stats row */}
            <motion.div 
              className="flex gap-4 mb-4 relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              {stats.map((stat, statIndex) => (
                <div key={stat.label} className="text-center">
                  <motion.div 
                    className="text-lg font-bold text-orange-300"
                    animate={isInView ? { scale: [0.8, 1.1, 1] } : {}}
                    transition={{ delay: index * 0.1 + 0.4 + statIndex * 0.1, duration: 0.5 }}
                  >
                    <AnimatedCounter value={stat.value} duration={0.8} />
                    {stat.suffix && <span className="text-sm">{stat.suffix}</span>}
                  </motion.div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Main content - simplified without show more/less functionality */}
            <div className="flex-1 mb-4 relative z-10">
              <p className="text-white/90 text-sm leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                {exp.highlights[0]}
              </p>
            </div>

            {/* Bottom section with enhanced tags and action button */}
            <div className="flex items-center justify-between mt-4 relative z-10">
              {/* Animated skill tags */}
              <div className="flex flex-wrap gap-2">
                <Tag text={exp.category} index={0} />
                {exp.skills.slice(0, 2).map((skill, skillIndex) => (
                  <Tag key={skill} text={skill} index={skillIndex + 1} />
                ))}
                {exp.skills.length > 2 && (
                  <motion.span
                    className="text-xs px-2.5 py-1 bg-white/5 text-white/60 rounded-full backdrop-blur-sm border border-white/10"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.1)", scale: 1.05 }}
                  >
                    +{exp.skills.length - 2} more
                  </motion.span>
                )}
              </div>
              
              {/* Enhanced action button - matching ProjectsSection arrow style */}
              <motion.div 
                className="p-2.5 bg-white/15 rounded-full backdrop-blur-sm border border-white/10 group-hover:bg-white/25 transition-colors duration-300" 
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
    </div>
  );
};

const ExperienceSection: React.FC = () => {
  useComponentLoader('ExperienceSection');
  const { isLoading } = useLoading();

  // Measurement for responsive card width
  const containerRef = React.useRef<HTMLDivElement>(null);
  const sectionRef = React.useRef<HTMLElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isMdUp, setIsMdUp] = React.useState<boolean>(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  
  const isInView = useInView(sectionRef, { margin: '-20%' });

  React.useEffect(() => {
    const measure = () => {
      setIsMdUp(window.innerWidth >= 768);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const sorted = React.useMemo(() => {
    return [...experiences].sort((a, b) => {
      const aStart = new Date(a.start.year, a.start.month-1, 1).getTime();
      const bStart = new Date(b.start.year, b.start.month-1, 1).getTime();
      return aStart - bStart; // Oldest first for timeline
    });
  }, []);

  // Compute card width for horizontal timeline
  const computedCardWidth = React.useMemo(() => {
    return isMdUp ? 384 : 320; // Fixed width for horizontal timeline
  }, [isMdUp]);

  const handleViewDetails = (experienceId: string) => {
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
      className="min-h-screen w-full flex items-center justify-center px-6 sm:px-12 md:px-20 lg:px-32 pt-20 pb-16 relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 30 : 0 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: isLoading ? 0 : 0.8 }}
    >
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
      
      <div className="w-full max-w-7xl relative z-10" ref={containerRef}>
        {/* Enhanced Header with metrics */}
        <div className="text-center text-white mb-12">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-4 [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Experience Timeline
          </motion.h2>
          
          <motion.p
            className="text-white/85 max-w-2xl mx-auto mb-8 text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            My journey through data science and full-Thestack development from graduation.
          </motion.p>

          {/* Experience metrics */}
          <motion.div
            className="flex justify-center gap-8 md:gap-12 mb-8"
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

        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Timeline base line - moved to bottom */}
          <motion.div
            className="absolute bottom-6 left-0 right-0 h-[2px] z-0 pointer-events-none
                      bg-gradient-to-r from-transparent via-orange-400/70 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.3 }}
            style={{ transformOrigin: 'left' }}
          />

          {/* Horizontal scrollable timeline container */}
          <motion.div
              ref={scrollContainerRef}
              className="overflow-x-auto pb-16 pt-8 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(251,146,60,.5) transparent' }}
            >
            {/* Timeline items container */}
            <div className="flex gap-6 w-max pl-8 pr-8">
              {sorted.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  className="relative"
                  initial={{ opacity: 0, x: 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '0px -50px' }}
                  transition={{ 
                    duration: 0.6, 
                    delay: idx * 0.15,
                    ease: "easeOut"
                  }}
                >
                  <ExperienceItem
                    exp={exp}
                    index={idx}
                    cardWidth={computedCardWidth}
                    onViewDetails={() => handleViewDetails(exp.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Timeline end indicator - moved to bottom */}
          <motion.div
            className="absolute right-8 bottom-6 w-3 h-3 bg-blue-500 rounded-full shadow-lg"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            animate={{
              scale: 1,
              opacity: 1,
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0.4)",
                "0 0 0 10px rgba(59, 130, 246, 0)",
                "0 0 0 0 rgba(59, 130, 246, 0.4)"
              ]
            }}
            transition={{
              scale: { duration: 0.4, delay: sorted.length * 0.15 + 0.5 },
              opacity: { duration: 0.4, delay: sorted.length * 0.15 + 0.5 },
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }
            }}
          />
        </div>

        {/* Scroll hint */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.p
            className="text-white/60 text-sm mb-2"
            animate={{
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Scroll horizontally to explore the timeline →
          </motion.p>
          <motion.div
            className="text-orange-300 text-sm font-medium"
            whileHover={{ scale: 1.02 }}
          >
            Click on any card to view detailed experience
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default React.memo(ExperienceSection);