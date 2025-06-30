import React, { memo } from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useComponentLoader } from '../contexts/LoadingContext'; // Import the hook

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
  // {
  //   id: 4,
  //   title: 'Project One',
  //   content: 'A brief and engaging description of what this project is about, its purpose, and the technologies used.',
  // },
  // {
  //   id: 5,
  //   title: 'Project Two',
  //   content: 'A brief and engaging description of what this project is about, its purpose, and the technologies used.',
  // },
  // {
  //   id: 6,
  //   title: 'Project Three',
  //   content: 'A brief and engaging description of what this project is about, its purpose, and the technologies used.',
  // },
  //   {
  //   id: 7,
  //   title: 'Project One',
  //   content: 'A brief and engaging description of what this project is about, its purpose, and the technologies used.',
  // },
  // {
  //   id: 8,
  //   title: 'Project Two',
  //   content: 'A brief and engaging description of what this project is about, its purpose, and the technologies used.',
  // },
  // {
  //   id: 9,
  //   title: 'Project Three',
  //   content: 'A brief and engaging description of what this project is about, its purpose, and the technologies used.',
  // },
];

const ProjectCard = memo(({ project }: { project: typeof projects[0] }) => {
  const cardWidth = 360;
  const cardHeight = 200; 

  return (
    <div style={{ width: `${cardWidth}px`, height: `${cardHeight}px` }}>
      <LiquidGlass
        width={cardWidth}
        height={cardHeight}
        positioning="relative"
        style={{ borderRadius: '32px' }}
        elasticity={0.1}
        saturation={150}
        aberrationIntensity={1}
        displacementScale={15}
        overLight={false}
        blurAmount={12}
        mode='standard'
      >
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
  useComponentLoader('ProjectsSection'); // Register component for loading

  return (
    <motion.section 
      id="projects" 
      className="py-16 px-4 w-full pt-24"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        ease: 'easeOut',
        delay: 0.5 
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