import React from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useLoading, useComponentLoader } from '../contexts/LoadingContext';

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
    id: 'ds-1',
    role: 'Data Scientist',
    company: 'Your Company',
    start: { year: 2023, month: 2 },
    // Present role
    location: 'Remote',
    category: 'Data Science',
    skills: ['Python', 'TensorFlow', 'Pandas', 'Docker', 'GCP'],
    highlights: [
      'Built and deployed ML models end‑to‑end (training → serving → monitoring)',
      'Drove experimentation (A/B, offline metrics) that improved KPIs',
      'Partnered with product and engineering to ship user‑impacting features'
    ],
    achievements: [
      'Reduced inference latency by 35% with optimized preprocessing',
      'Introduced model monitoring dashboard; cut drift incidents by 50%'
    ],
    links: [
      { label: 'Case Study', url: '#' }
    ]
  },
  {
    id: 'fs-1',
    role: 'Full‑Stack Developer',
    company: 'Another Company',
    start: { year: 2021, month: 5 },
    end: { year: 2023, month: 1 },
    location: 'Hybrid',
    category: 'Full‑Stack',
    skills: ['React', 'TypeScript', 'Node.js', 'REST', 'CI/CD'],
    highlights: [
      'Developed responsive web apps with strong UX and performance',
      'Designed and maintained APIs, improved developer experience',
      'Led features end‑to‑end across frontend and backend'
    ],
    achievements: [
      'Cut page load by 40% through code‑splitting and caching',
      'Built internal component library adopted by 3 teams'
    ],
    links: [
      { label: 'Live Site', url: '#' },
      { label: 'GitHub', url: '#' }
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
  expanded: boolean;
  onToggle: () => void;
}> = ({ exp, index, cardWidth, expanded, onToggle }) => {
  const period = formatPeriod(exp.start, exp.end);
  const durationMonths = diffMonths(exp.start, exp.end);
  const durationStr = durationMonths >= 12 ? `${(durationMonths/12).toFixed(durationMonths % 12 === 0 ? 0 : 1)} yrs` : `${durationMonths} mos`;

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
          className="w-full"
        >
          <LiquidGlass
            width={cardWidth}
            height={300}
            positioning="relative"
            style={{ borderRadius: '18px', width: '100%', minHeight: '300px' }}
            elasticity={0.12}
            saturation={150}
            aberrationIntensity={1.2}
            displacementScale={60}
            blurAmount={6}
            mode='shader'
          >
            <div className="p-8 md:p-10 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold [text-shadow:0_2px_5px_rgba(0,0,0,0.8)]">{exp.role}</h3>
                  <div className="text-white/80 text-sm">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</div>
                </div>
                <div className="text-white/70 text-xs md:text-sm text-right">
                  <div>{period}</div>
                  <div className="text-white/60">{durationStr}</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Tag text={exp.category} />
                {exp.skills.slice(0, 5).map((s) => (
                  <Tag key={s} text={s} />
                ))}
              </div>

              {/* Highlights (brief) */}
              <ul className="list-disc list-inside space-y-2 text-white/90 mb-4">
                {(expanded ? exp.highlights : exp.highlights.slice(0, 2)).map((h, i) => (
                  <li key={i} className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{h}</li>
                ))}
              </ul>

              {/* Expandable details */}
              <motion.div
                initial={false}
                animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                {!!exp.achievements?.length && (
                  <div className="mt-4">
                    <div className="text-white/70 text-sm mb-2">Key Achievements</div>
                    <ul className="list-disc list-inside space-y-2 text-white/90">
                      {exp.achievements.map((a, i) => (
                        <li key={i} className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!!exp.links?.length && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {exp.links.map((l, i) => (
                      <a
                        key={i}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 bg-white/10 text-white rounded-full border border-white/10 hover:bg-white/20 transition-colors"
                      >
                        {l.label}
                      </a>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Toggle */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onToggle}
                  className="text-xs px-3 py-1.5 bg-white/10 text-white/90 rounded-full border border-white/10 hover:bg-white/20 transition-colors"
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
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

  const [expandedId, setExpandedId] = React.useState<string | null>(null);

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
              expanded={expandedId === exp.id}
              onToggle={() => setExpandedId(prev => prev === exp.id ? null : exp.id)}
            />)
          )}
        </div>

      </div>
    </motion.section>
  );
};

export default React.memo(ExperienceSection);
