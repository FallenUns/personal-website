import React from 'react';
import './SkillsMarquee.css';

const ROW_A = [
  'Python', 'TypeScript', 'React', 'Next.js', 'TensorFlow', 'PyTorch',
  'AWS', 'Docker', 'PostgreSQL', 'Tailwind', 'Three.js', 'FastAPI',
];

const ROW_B = [
  'Machine Learning', 'LLMs', 'Data Pipelines', 'Computer Vision',
  'NLP', 'A/B Testing', 'Statistical Modelling', 'React Native',
  'Node.js', 'WebGL', 'GraphQL', 'Prompt Engineering',
];

type Accent = 'blue' | 'fuchsia' | 'emerald' | 'amber';

const ACCENT_DOT: Record<Accent, string> = {
  blue:    'bg-sky-300',
  fuchsia: 'bg-fuchsia-300',
  emerald: 'bg-emerald-300',
  amber:   'bg-amber-300',
};

// Deterministic accent per label — variety without size chaos. Every pill
// shares the same height/shape; only the dot colour changes.
const accentFor = (label: string, i: number): Accent => {
  const accents: Accent[] = ['blue', 'fuchsia', 'emerald', 'amber'];
  let h = 0;
  for (const c of label) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return accents[Math.abs(h + i) % accents.length];
};

const Pill: React.FC<{ label: string; accent: Accent }> = React.memo(({ label, accent }) => (
  <div className="skills-pill" aria-hidden="false">
    <span className={`skills-pill-dot ${ACCENT_DOT[accent]}`} aria-hidden="true" />
    <span className="skills-pill-label">{label}</span>
  </div>
));
Pill.displayName = 'SkillsPill';

const Row: React.FC<{ items: string[]; reverse?: boolean }> = ({ items, reverse }) => {
  // The track contains the items twice. Translating by -50% returns the
  // second copy to the start position, producing a seamless loop.
  const doubled = [...items, ...items];
  return (
    <div className="skills-marquee-row">
      <div className={`skills-marquee-track ${reverse ? 'reverse' : ''}`}>
        {doubled.map((label, i) => (
          <Pill
            key={`${label}-${i}`}
            label={label}
            accent={accentFor(label, i % items.length)}
          />
        ))}
      </div>
    </div>
  );
};

const SkillsMarquee: React.FC = () => (
  <section
    aria-label="Skills and technologies"
    className="skills-marquee"
  >
    <Row items={ROW_A} />
    <Row items={ROW_B} reverse />
  </section>
);

export default React.memo(SkillsMarquee);
