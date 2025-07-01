import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useComponentLoader } from '../contexts/LoadingContext'; // Import the hook
import './performance.css';

// Device mockup component
const DeviceMockup = memo(({ type, color }: { type: string; color: string }) => {
  if (type === 'ui-ux') {
    return (
      <div className="flex space-x-2 items-end">
        <div className={`w-14 h-24 ${color} rounded-lg border border-white/40 relative overflow-hidden`}>
          <div className="absolute top-2 left-2 right-2 h-1 bg-white/30 rounded-full"></div>
          <div className="absolute top-4 left-2 right-2 space-y-1">
            <div className="h-8 bg-orange-400/80 rounded"></div>
            <div className="h-2 bg-white/40 rounded w-3/4"></div>
            <div className="h-2 bg-white/30 rounded w-1/2"></div>
          </div>
          <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/20 rounded-full"></div>
        </div>
        <div className={`w-12 h-20 ${color} rounded-md border border-white/30 relative overflow-hidden`}>
          <div className="absolute top-1 left-1 right-1 space-y-1">
            <div className="h-6 bg-orange-400/60 rounded"></div>
            <div className="h-1 bg-white/30 rounded"></div>
            <div className="h-1 bg-white/20 rounded w-2/3"></div>
          </div>
        </div>
        <div className={`w-10 h-16 ${color} rounded border border-white/20 relative overflow-hidden`}>
          <div className="absolute top-1 left-1 right-1 space-y-0.5">
            <div className="h-4 bg-orange-400/40 rounded"></div>
            <div className="h-0.5 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'web') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className={`w-20 h-16 ${color} rounded border border-white/40 relative overflow-hidden`}>
          <div className="absolute top-1 left-1 right-1 h-1 bg-white/30 rounded"></div>
          <div className="absolute top-3 left-1 right-1 space-y-1">
            <div className="h-3 bg-orange-400/80 rounded"></div>
            <div className="flex space-x-1">
              <div className="h-6 bg-orange-500/60 rounded flex-1"></div>
              <div className="h-6 bg-orange-400/40 rounded flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Landing page mockup
  return (
    <div className="flex space-x-1 items-center">
      <div className={`w-16 h-20 ${color} rounded border border-white/40 relative overflow-hidden`}>
        <div className="absolute top-1 left-1 right-1 h-1 bg-white/30 rounded"></div>
        <div className="absolute top-3 left-1 right-1 space-y-1">
          <div className="h-4 bg-orange-400/80 rounded"></div>
          <div className="h-1 bg-white/40 rounded"></div>
          <div className="h-1 bg-white/30 rounded w-3/4"></div>
          <div className="h-6 bg-orange-500/60 rounded"></div>
        </div>
      </div>
      <div className={`w-12 h-16 ${color} rounded border border-white/30 relative overflow-hidden`}>
        <div className="absolute top-1 left-1 right-1 space-y-0.5">
          <div className="h-3 bg-orange-400/60 rounded"></div>
          <div className="h-0.5 bg-white/30 rounded"></div>
          <div className="h-4 bg-orange-500/40 rounded"></div>
        </div>
      </div>
    </div>
  );
});

DeviceMockup.displayName = 'DeviceMockup';

// Memoize project data to prevent unnecessary re-creation
const projects = [
  {
    id: 1,
    title: 'UI/UX Design',
    description: 'Modern mobile app interface design with intuitive user experience',
    mockupType: 'ui-ux',
    technologies: ['Figma', 'Adobe XD', 'Principle'],
    category: 'Design'
  },
  {
    id: 2,
    title: 'Web Design',
    description: 'Responsive web application with modern design principles',
    mockupType: 'web',
    technologies: ['React', 'TypeScript', 'Tailwind'],
    category: 'Development'
  },
  {
    id: 3,
    title: 'Landing Page',
    description: 'High-converting landing page with optimized user flow',
    mockupType: 'landing',
    technologies: ['Next.js', 'Framer Motion', 'CSS3'],
    category: 'Development'
  },
];

const ProjectCard = memo(({ project, index }: { project: typeof projects[0]; index: number }) => {
  const cardWidth = 380;
  const cardHeight = 340; 

  // Optimize LiquidGlass props - disable expensive features during scroll
  const optimizedProps = useMemo(() => ({
    width: cardWidth,
    height: cardHeight,
    positioning: "relative" as const,
    style: { borderRadius: '24px' },
    elasticity: 0.05,
    saturation: 120,
    aberrationIntensity: 0,
    displacementScale: 50,
    overLight: false,
    blurAmount: 8,
    mode: 'standard' as const,
    isElastic: false,
  }), [cardWidth, cardHeight]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ 
        duration: 0.5, 
        ease: 'easeOut',
        delay: index * 0.1
      }}
      style={{ width: `${cardWidth}px`, height: `${cardHeight}px` }}
      className="group cursor-pointer"
    >
      <LiquidGlass {...optimizedProps}>
        <div className="w-full h-full flex flex-col relative p-6 overflow-hidden">
          {/* Header with title */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white [text-shadow:0_2px_5px_rgba(0,0,0,0.8)]">
              {project.title}
            </h3>
          </div>

          {/* Main content area with device mockup */}
          <div className="flex-1 flex items-center justify-center mb-4">
            <div className="relative w-full h-32 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 overflow-hidden">
              {/* Device mockup */}
              <div className="absolute inset-2 flex items-center justify-center">
                <DeviceMockup 
                  type={project.mockupType} 
                  color="bg-white/20" 
                />
              </div>
              
              {/* Category badge */}
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-xs bg-white/20 text-white rounded-full backdrop-blur-sm">
                  {project.category}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom section with description and arrow */}
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <p className="text-sm text-white/80 leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {project.technologies.slice(0, 2).map((tech, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-white/10 text-white/70 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Arrow icon */}
            <div className="ml-4 p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors duration-300">
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7L17 7L17 17" />
              </svg>
            </div>
          </div>
        </div>
      </LiquidGlass>
    </motion.div>
  );
});

ProjectCard.displayName = 'ProjectCard';

const ProjectsSection: React.FC = () => {
  useComponentLoader('ProjectsSection'); // Register component for loading

  return (
    <motion.section 
      id="projects" 
      className="py-16 px-4 w-full pt-24"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{ 
        duration: 0.8, 
        ease: 'easeOut'
      }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <motion.h2 
          className="text-4xl font-bold text-center text-white mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        >
          My Work
        </motion.h2>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        >
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </motion.div>
        
        {/* Pagination dots */}
        <motion.div 
          className="flex justify-center space-x-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {projects.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === 0 ? 'bg-orange-500' : 'bg-white/30'
              }`}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default memo(ProjectsSection);