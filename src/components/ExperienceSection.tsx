import React from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useLoading, useComponentLoader } from '../contexts/LoadingContext';
import { navigateTo } from '../utils/router';

type Link = { label: string; url: string };
type Category = 'Data Science' | 'Full‑Stack' | 'Research' | 'Other';

type Experience = {
  id: string;
  role: string;
  company: string;
  start: { year: number; month: number }; // 1-12
  end?: { year: number; month: number }; // undefined => Present
  location?: string;
  category: Category;
  skills: string[];
  highlights: string[];
  achievements?: string[];
  links?: Link[];
};

const experiences: Experience[] = [
  {
    id: 'urban-waste-1',
    role: 'Summer Intern',
    company: 'Urban Waste',
    start: { year: 2022, month: 12 },
    end: { year: 2023, month: 2 },
    location: 'Melbourne, Victoria, Australia · Hybrid',
    category: 'Full‑Stack',
    skills: [
      'Python',
      'ERP System Management',
      'Data Integration',
      'Problem Solving',
      'Cross-Functional Collaboration'
    ],
    highlights: [
      'Collaborated with IT, finance, and operations to identify ERP requirements and challenges',
      'Researched best practices in ERP system management to improve efficiency and compliance',
      'Assisted in designing internal system architecture with focus on data integration and UX',
      'Developed and tested ERP system modules to align with business processes',
      'Created documentation, user manuals, and training materials for smooth adoption',
      'Monitored and optimized the system post-implementation based on user feedback'
    ],
    achievements: [
      'Contributed to successful development and rollout of an internal ERP management system',
      'Improved cross-departmental communication and workflow efficiency',
      'Gained hands-on experience in ERP system design, testing, and optimization'
    ],
    links: [
      { label: 'Company Website', url: 'https://urbanwaste.com.au' }
    ]
  }
];

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const formatPeriod = (start: Experience['start'], end?: Experience['end']) => {
  const startStr = `${monthNames[start.month-1]} ${start.year}`;
  const endStr = end ? `${monthNames[end.month-1]} ${end.year}` : 'Present';
  return `${startStr} — ${endStr}`;
};

const diffMonths = (start: Experience['start'], end?: Experience['end']) => {
  const s = new Date(start.year, start.month-1, 1);
  const e = end ? new Date(end.year, end.month-1, 1) : new Date();
  return (e.getFullYear()-s.getFullYear())*12 + (e.getMonth()-s.getMonth());
};

const Tag: React.FC<{ text: string }> = ({ text }) => (
  <span className="text-xs px-2.5 py-1 bg-white/10 text-white/85 rounded-full backdrop-blur-sm border border-white/10">
    {text}
  </span>
);

const ExperienceItem: React.FC<{
  exp: Experience;
  index: number;
  cardWidth: number;
  onViewDetails: () => void;
}> = ({ exp, index, cardWidth, onViewDetails }) => {
  const period = formatPeriod(exp.start, exp.end);
  const durationMonths = diffMonths(exp.start, exp.end);
  const durationStr = durationMonths >= 12 ? `${(durationMonths/12).toFixed(durationMonths % 12 === 0 ? 0 : 1)} yrs` : `${durationMonths} mos`;

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className="relative w-full">
      {/* Timeline dot aligned to the global center line */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-orange-400 rounded-full shadow-lg"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      />

      {/* Card wrapper uses alternating sides on md+ */}
      <div className={`md:grid md:grid-cols-2 md:gap-10 items-start ${index % 2 === 0 ? '' : ''}`}>
        {index % 2 === 0 ? (
          <div className="hidden md:block" />
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.08 }}
          className="w-full group cursor-pointer"
          onClick={onViewDetails}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <LiquidGlass
            width={cardWidth}
            height={320}
            positioning="relative"
            style={{ borderRadius: '18px', width: '100%', minHeight: '320px' }}
            elasticity={0.12}
            saturation={150}
            aberrationIntensity={1.2}
            displacementScale={60}
            blurAmount={6}
            mode='shader'
          >
            <div className="p-6 md:p-8 text-white h-full flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold [text-shadow:0_2px_5px_rgba(0,0,0,0.8)]">{exp.role}</h3>
                  <div className="text-white/80 text-sm">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</div>
                </div>
                <div className="text-white/70 text-xs md:text-sm text-right">
                  <div className="flex items-center gap-2">
                    <span>{period}</span>
                    <span className="text-white/60">({durationStr})</span>
                  </div>
                </div>
              </div>

              {/* Brief summary - Only show 1 key highlight */}
              <div className="flex-1 mb-4">
                <p className="text-white/90 text-sm leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                  {exp.highlights[0]}
                </p>
              </div>

              {/* Bottom section with tags and arrow button */}
              <div className="flex items-center justify-between mt-4">
                {/* Tags - Only show category and top 3 skills */}
                <div className="flex flex-wrap gap-2">
                  <Tag text={exp.category} />
                  {exp.skills.slice(0, 3).map((s) => (
                    <Tag key={s} text={s} />
                  ))}
                </div>
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

        {index % 2 !== 0 ? (
          <div className="hidden md:block" />
        ) : null}
      </div>
    </div>
  );
};

const ExperienceSection: React.FC = () => {
  useComponentLoader('ExperienceSection');
  const { isLoading } = useLoading();

  // Measurement for responsive card width
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(860);
  const [isMdUp, setIsMdUp] = React.useState<boolean>(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
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
      const aEnd = a.end ? new Date(a.end.year, a.end.month-1, 1).getTime() : Number.POSITIVE_INFINITY;
      const bEnd = b.end ? new Date(b.end.year, b.end.month-1, 1).getTime() : Number.POSITIVE_INFINITY;
      if (aEnd !== bEnd) return bEnd - aEnd; // current first
      const aStart = new Date(a.start.year, a.start.month-1, 1).getTime();
      const bStart = new Date(b.start.year, b.start.month-1, 1).getTime();
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
    return Math.max(300, containerWidth - 24);
  }, [containerWidth, isMdUp]);

  const handleViewDetails = (experienceId: string) => {
    navigateTo(`/experience/${experienceId}`);
  };

  return (
    <motion.section
      id="experience"
      className="min-h-screen w-full flex items-center justify-center px-6 sm:px-12 md:px-20 lg:px-32 pt-20 pb-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 30 : 0 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: isLoading ? 0 : 0.8 }}
    >
      <div className="w-full max-w-6xl" ref={containerRef}>
        {/* Header */}
        <div className="text-center text-white mb-6">
          <motion.h2 
            className="text-4xl font-bold mb-3 [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Experience
          </motion.h2>
          <motion.p
            className="text-white/85 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            A timeline of roles across data science and full‑stack development.
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative space-y-10">
          {/* Global center line spanning the entire list */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-white/15" />

          {sorted.map((exp, idx) => (
            <ExperienceItem
              key={exp.id}
              exp={exp}
              index={idx}
              cardWidth={computedCardWidth}
              onViewDetails={() => handleViewDetails(exp.id)}
            />)
          )}
        </div>

      </div>
    </motion.section>
  );
};

export default React.memo(ExperienceSection);
