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
  <div className="flex items-center justify-center w-full">
    <LiquidGlass
      cornerRadius={32}
      padding="32px"
      elasticity={0.2}
      blurAmount={0.5}
      saturation={140}
      displacementScale={70}
      aberrationIntensity={2}
      mode="shader"
      style={{ width: '400px', height: '150px' }}
    >
      <div className="w-full">
        <h2 className="relative text-xl font-bold mb-2">{project.title}</h2>
        <p className="relative text-sm text-white/90 leading-relaxed">{project.content}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(ProjectsSection);