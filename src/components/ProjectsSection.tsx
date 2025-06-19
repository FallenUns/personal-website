import React from 'react';
import FrostedGlassCard from './FrostedGlassCard.tsx';

// You can replace this with your actual project data
const projects = [
  {
    title: 'Project One',
    content: 'A brief and engaging description of what this project is about, its purpose, and the technologies used.',
  },
  {
    title: 'Project Two',
    content: 'A brief and engaging description of what this project is about, its purpose, and the technologies used.',
  },
  {
    title: 'Project Three',
    content: 'A brief and engaging description of what this project is about, its purpose, and the technologies used.',
  },
];

const ProjectsSection: React.FC = () => {
  return (
    // Add the id="projects" here for the navbar link
    <div id="projects" className="py-24 px-4">
      <h2 className="text-4xl font-bold text-center text-white mb-12">My Work</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {projects.map((project, index) => (
          <FrostedGlassCard key={index} title={project.title} content={project.content} />
        ))}
      </div>
    </div>
  );
};

export default ProjectsSection;
