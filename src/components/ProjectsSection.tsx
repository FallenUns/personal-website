import React, { memo } from 'react';
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

// Memoize individual project component
const ProjectCard = memo(({ project }: { project: typeof projects[0] }) => (
  // The outer div is important for grid layout
  <div> 
    <LiquidGlass
      width={600}
      height={300}
      blur={12}
    >
      <div className="w-full p-8 text-center">
        <h2 className="relative text-xl font-bold mb-2 text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{project.title}</h2>
        <p className="relative text-sm text-white/90 leading-relaxed [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{project.content}</p>
      </div>
    </LiquidGlass>
  </div>
));

ProjectCard.displayName = 'ProjectCard';

const ProjectsSection: React.FC = () => {
  return (
    <section id="projects" className="py-16 px-4 w-full">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-4xl font-bold text-center text-white mb-10">My Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 place-items-center">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(ProjectsSection);