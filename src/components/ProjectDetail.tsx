import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useComponentLoader } from '../contexts/LoadingContext';

// Project data type (same as in ProjectsSection)
interface Project {
  id: number;
  title: string;
  description: string;
  mockupType: string;
  technologies: string[];
  category: string;
  slug: string;
  fullDescription: string;
  images: string[];
  liveUrl: string;
  githubUrl: string;
  features: string[];
}

// All projects data (same as ProjectsSection)
const allProjects: Project[] = [
  { 
    id: 1, 
    title: 'UI/UX Design', 
    description: 'Modern mobile app interface design with intuitive user experience', 
    mockupType: 'ui-ux', 
    technologies: ['Figma', 'Adobe XD', 'Principle'], 
    category: 'Design',
    slug: 'ui-ux-design',
    fullDescription: 'A comprehensive mobile app design project focusing on user-centered design principles and modern interface patterns. This project involved extensive user research, wireframing, prototyping, and usability testing to create an intuitive and engaging mobile experience.',
    images: ['/Subject.png', '/Subject.png', '/Subject.png'], // Using placeholder for now
    liveUrl: '#',
    githubUrl: '#',
    features: ['Responsive Design', 'User Research', 'Prototyping', 'Usability Testing']
  },
  { 
    id: 2, 
    title: 'Web Design', 
    description: 'Responsive web application with modern design principles', 
    mockupType: 'web', 
    technologies: ['React', 'TypeScript', 'Tailwind'], 
    category: 'Development',
    slug: 'web-design',
    fullDescription: 'A modern web application built with React and TypeScript, featuring responsive design and optimal performance. The project showcases clean code architecture, component reusability, and modern development practices.',
    images: ['/Subject.png', '/Subject.png', '/Subject.png'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['React Framework', 'TypeScript', 'Responsive Design', 'Performance Optimization']
  },
  { 
    id: 3, 
    title: 'Landing Page', 
    description: 'High-converting landing page with optimized user flow', 
    mockupType: 'landing', 
    technologies: ['Next.js', 'Framer Motion', 'CSS3'], 
    category: 'Development',
    slug: 'landing-page',
    fullDescription: 'A high-converting landing page designed to maximize user engagement and conversion rates. Features smooth animations, optimized loading times, and strategic placement of call-to-action elements.',
    images: ['/Subject.png', '/Subject.png', '/Subject.png'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['Next.js Framework', 'Smooth Animations', 'SEO Optimized', 'Conversion Focused']
  },
  { 
    id: 4, 
    title: 'Mobile App', 
    description: 'Cross-platform mobile application with native performance', 
    mockupType: 'ui-ux', 
    technologies: ['React Native', 'Expo', 'Firebase'], 
    category: 'Mobile',
    slug: 'mobile-app',
    fullDescription: 'A cross-platform mobile application delivering native performance across iOS and Android platforms. Built with React Native and integrated with Firebase for real-time data synchronization.',
    images: ['/Subject.png', '/Subject.png', '/Subject.png'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['Cross-platform', 'Native Performance', 'Real-time Data', 'Push Notifications']
  },
  { 
    id: 5, 
    title: 'E-commerce', 
    description: 'Full-featured e-commerce platform with payment integration', 
    mockupType: 'web', 
    technologies: ['Next.js', 'Stripe', 'MongoDB'], 
    category: 'Development',
    slug: 'ecommerce-platform',
    fullDescription: 'A complete e-commerce solution with secure payment processing and inventory management. Features include user authentication, shopping cart, order management, and admin dashboard.',
    images: ['/Subject.png', '/Subject.png', '/Subject.png'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['Payment Integration', 'Inventory Management', 'User Authentication', 'Admin Dashboard']
  },
];

// Image gallery component
const ImageGallery = memo(({ images, title }: { images: string[]; title: string }) => {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className="relative">
      {/* Main image display */}
      <div className="relative h-80 md:h-96 mb-4 overflow-hidden">
        <LiquidGlass
          width={800}
          height={400}
          positioning="relative"
          style={{ borderRadius: '16px', width: '100%', height: '100%' }}
          elasticity={0.2}
          saturation={140}
          displacementScale={80}
          blurAmount={8}
          mode="shader"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={images[currentImage]}
              alt={`${title} - Image ${currentImage + 1}`}
              className="w-full h-full object-cover"
              style={{ borderRadius: '16px' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </AnimatePresence>
        </LiquidGlass>
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <motion.button
              onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <LiquidGlass
                width={48}
                height={48}
                positioning="relative"
                style={{ borderRadius: '50%' }}
                elasticity={0.15}
                saturation={150}
                displacementScale={40}
                blurAmount={6}
                mode="shader"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="M15 18L9 12L15 6" />
                </svg>
              </LiquidGlass>
            </motion.button>
            
            <motion.button
              onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <LiquidGlass
                width={48}
                height={48}
                positioning="relative"
                style={{ borderRadius: '50%' }}
                elasticity={0.15}
                saturation={150}
                displacementScale={40}
                blurAmount={6}
                mode="shader"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="M9 18L15 12L9 6" />
                </svg>
              </LiquidGlass>
            </motion.button>
          </>
        )}
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center">
          {images.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`relative w-16 h-16 overflow-hidden rounded-lg ${
                currentImage === index ? 'ring-2 ring-orange-400' : ''
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
});
ImageGallery.displayName = 'ImageGallery';

// Main ProjectDetail component
interface ProjectDetailProps {
  slug?: string; // Optional slug prop for when used with routing
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ slug }) => {
  useComponentLoader('ProjectDetail');
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    // Get slug from URL if not provided as prop
    const projectSlug = slug || window.location.pathname.split('/').pop();
    
    // Find project by slug
    const foundProject = allProjects.find(p => p.slug === projectSlug);
    setProject(foundProject || null);
  }, [slug]);

  // Handle back navigation
  const handleBack = () => {
    window.history.back();
  };

  // Handle external links
  const handleExternalLink = (url: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  };

  if (!project) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        Project not found.
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-2xl"></div>
      
      <div className="relative z-10">
        {/* Header with back button */}
        <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <motion.button
              onClick={handleBack}
              className="flex items-center text-white/80 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Projects
            </motion.button>
            
            <div className="flex gap-4">
              {project.liveUrl && project.liveUrl !== '#' && (
                <motion.button
                  onClick={() => handleExternalLink(project.liveUrl)}
                  className="text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LiquidGlass
                    width={120}
                    height={40}
                    positioning="relative"
                    style={{ borderRadius: '20px' }}
                    elasticity={0.15}
                    saturation={150}
                    displacementScale={30}
                    blurAmount={6}
                    mode="shader"
                  >
                    Live Demo
                  </LiquidGlass>
                </motion.button>
              )}
              
              {project.githubUrl && project.githubUrl !== '#' && (
                <motion.button
                  onClick={() => handleExternalLink(project.githubUrl)}
                  className="text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LiquidGlass
                    width={100}
                    height={40}
                    positioning="relative"
                    style={{ borderRadius: '20px' }}
                    elasticity={0.15}
                    saturation={150}
                    displacementScale={30}
                    blurAmount={6}
                    mode="shader"
                  >
                    GitHub
                  </LiquidGlass>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-start"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {/* Left column - Project info */}
            <motion.div variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.5, ease: 'easeOut' }}>
              {/* Project header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-4 py-2 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium border border-orange-500/30">
                    {project.category}
                  </span>
                  <span className="text-white/60 text-sm">Project #{project.id}</span>
                </div>
                
                <h1 className="text-5xl font-bold text-white mb-4 [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
                  {project.title}
                </h1>
                
                <p className="text-xl text-white/80 leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                  {project.fullDescription}
                </p>
              </div>

              {/* Technologies */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Technologies Used</h3>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech, index) => (
                    <motion.div
                      key={index}
                      variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <LiquidGlass
                        width={120}
                        height={40}
                        positioning="relative"
                        style={{ borderRadius: '20px', padding: '0 16px', minWidth: 'fit-content' }}
                        elasticity={0.1}
                        saturation={140}
                        displacementScale={25}
                        blurAmount={6}
                        mode="shader"
                      >
                        <span className="text-white font-medium">{tech}</span>
                      </LiquidGlass>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
                <div className="space-y-3">
                  {project.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center text-white/90"
                    >
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      <span className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                {project.liveUrl && project.liveUrl !== '#' && (
                  <motion.button
                    onClick={() => handleExternalLink(project.liveUrl)}
                    className="text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LiquidGlass
                      width={160}
                      height={48}
                      positioning="relative"
                      style={{ borderRadius: '24px' }}
                      elasticity={0.2}
                      saturation={150}
                      displacementScale={40}
                      blurAmount={8}
                      mode="shader"
                    >
                      <span className="flex items-center">
                        View Live Demo
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </span>
                    </LiquidGlass>
                  </motion.button>
                )}
                
                {project.githubUrl && project.githubUrl !== '#' && (
                  <motion.button
                    onClick={() => handleExternalLink(project.githubUrl)}
                    className="text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LiquidGlass
                      width={140}
                      height={48}
                      positioning="relative"
                      style={{ borderRadius: '24px' }}
                      elasticity={0.2}
                      saturation={150}
                      displacementScale={40}
                      blurAmount={8}
                      mode="shader"
                    >
                      <span className="flex items-center">
                        View Code
                        <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </span>
                    </LiquidGlass>
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Right column - Image gallery */}
            <motion.div variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.5, ease: 'easeOut' }}>
              <ImageGallery images={project.images} title={project.title} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectDetail);