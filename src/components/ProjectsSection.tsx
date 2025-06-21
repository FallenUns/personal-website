import React, { memo } from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';

// Memoize project data to prevent unnecessary re-creation
const projects = [
  {
    id: 1,
    title: 'Project One',
    content: 'A brief and engaging description of what this project is about, its purpose, and the technologies used.',
  },
  {
    id: 2,
    title: 'Project Two',
    content: 'A brief and engaging description of what this project is about, its purpose, and the technologies used.',
  },
  {
    id: 3,
    title: 'Project Three',
    content: 'A brief and engaging description of what this project is about, its purpose, and the technologies used.',
  },
];

// UPDATED: ProjectCard is now more robust, with a defined size to prevent rendering issues.
const ProjectCard = memo(({ project }: { project: typeof projects[0] }) => {
  // Define a fixed size for the card to ensure consistent rendering.
  const cardWidth = 360;
  // Increased height to better accommodate the content.
  const cardHeight = 200; 

  return (
    // This div now simply holds the LiquidGlass component.
    <div style={{ width: `${cardWidth}px`, height: `${cardHeight}px` }}>
      <LiquidGlass
        width={cardWidth}
        height={cardHeight}
        blur={12}
        positioning="relative"
        style={{ borderRadius: '32px' }}
        elasticity={0.08}
        edgeRefraction={0.2}
        borderType='dynamic'
        borderWidth={2}
      >
        {/* Using flexbox to ensure content is centered and handles space better. */}
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <h2 className="relative text-xl font-bold mb-2 text-white [text-shadow:0_2px_5px_rgba(0,0,0,1)]">{project.title}</h2>
          <p className="relative text-sm text-white/90 leading-relaxed [text-shadow:0_2px_5px_rgba(0,0,0,1)]">{project.content}</p>
        </div>
      </LiquidGlass>
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

const ProjectsSection: React.FC = () => {
  return (
    <motion.section 
      id="projects" 
      className="py-16 px-4 w-full pt-24"
      // Simplified animation that runs once when the component is revealed.
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        ease: 'easeOut',
        delay: 0.5 // Staggered delay after the main page content appears.
      }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <motion.h2 
          className="text-4xl font-bold text-center text-white mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.6 }}
        >
          My Work
        </motion.h2>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.8 }}
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                ease: 'easeOut',
                // Stagger the animation for each card.
                delay: 1.0 + (index * 0.15)
              }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default memo(ProjectsSection);