import React, { memo, useRef, useState, useEffect } from 'react';
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

// UPDATED: ProjectCard is now a responsive component
const ProjectCard = memo(({ project }: { project: typeof projects[0] }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Observe the size of the container div and update state
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    // This container div defines the card's responsive size within the grid
    <div ref={cardRef} className="w-full h-[150px] max-w-[600px]">
      {dimensions.width > 0 && (
        <LiquidGlass
          width={dimensions.width}
          height={dimensions.height}
          blur={12}
          positioning="relative"
          style={{ borderRadius: '32px' }}
          elasticity={0.08}
          edgeRefraction={0.2}
          borderType='dynamic'
          borderWidth={2}
        >
          <div className="w-full p-8 text-center">
            <h2 className="relative text-xl font-bold mb-2 text-white [text-shadow:0_2px_5px_rgba(0,0,0,1)]">{project.title}</h2>
            <p className="relative text-sm text-white/90 leading-relaxed [text-shadow:0_2px_5px_rgba(0,0,0,1)]">{project.content}</p>
          </div>
        </LiquidGlass>
      )}
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

const ProjectsSection: React.FC = () => {
  return (
    <section id="projects" className="py-16 px-4 w-full pt-24">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-4xl font-bold text-center text-white mb-10">My Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 place-items-center">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(ProjectsSection);