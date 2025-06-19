import React from 'react';
import LiquidGlass from './LiquidGlass';
// import LiquidGlass from 'liquid-glass-react'

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
    <div id="projects" className="py-16 px-4 projects-background">
      <h2 className="text-4xl font-bold text-center text-white mb-10">My Work</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {projects.map((project, index) => (
          // Using flex to center the LiquidGlass component in the grid cell
          <div key={index} className="flex items-center justify-center">
            <LiquidGlass
              cornerRadius={30}
              padding="24px"
              elasticity={0.2}
              blurAmount={0.2}
              saturation={10}
              displacementScale={10} // Reduce from default 70
              aberrationIntensity={1} // Reduce from default 2
              mode="shader"
            >
              <div>
                <h2 className="relative text-xl font-bold mb-2">{project.title}</h2>
                <p className="relative text-sm text-white/90">{project.content}</p>
              </div>
            </LiquidGlass>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsSection;