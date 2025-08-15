import React, { memo, useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { navigateBack } from '../utils/router';
import './performance.css';

// Project data (should match the data from ProjectsSection)
const projects = [
  { 
    id: 1, 
    title: 'UI/UX Design', 
    description: 'Modern mobile app interface design with intuitive user experience', 
    mockupType: 'ui-ux', 
    technologies: ['Figma', 'Adobe XD', 'Principle'], 
    category: 'Design',
    slug: 'ui-ux-design',
    fullDescription: 'A comprehensive mobile app design project focusing on user-centered design principles and modern interface patterns. This project showcases the complete design process from user research to final prototype, emphasizing accessibility and usability across different devices and user contexts.',
    images: ['/project1-1.jpg', '/project1-2.jpg', '/project1-3.jpg'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['Responsive Design', 'User Research', 'Prototyping', 'Usability Testing'],
    challenges: [
      'Creating intuitive navigation for complex user flows',
      'Balancing visual appeal with accessibility requirements',
      'Optimizing performance across different device capabilities'
    ],
    outcomes: [
      '40% increase in user engagement',
      '25% reduction in task completion time',
      '95% user satisfaction rating'
    ]
  },
  { 
    id: 2, 
    title: 'Web Design', 
    description: 'Responsive web application with modern design principles', 
    mockupType: 'web', 
    technologies: ['React', 'TypeScript', 'Tailwind'], 
    category: 'Development',
    slug: 'web-design',
    fullDescription: 'A modern web application built with React and TypeScript, featuring responsive design and optimal performance. The project demonstrates advanced state management, component composition, and modern web development best practices.',
    images: ['/project2-1.jpg', '/project2-2.jpg', '/project2-3.jpg'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['React Framework', 'TypeScript', 'Responsive Design', 'Performance Optimization'],
    challenges: [
      'Implementing complex state management across components',
      'Ensuring type safety throughout the application',
      'Optimizing bundle size and loading performance'
    ],
    outcomes: [
      '99.9% uptime reliability',
      '2s average page load time',
      '100% type coverage'
    ]
  },
  { 
    id: 3, 
    title: 'Landing Page', 
    description: 'High-converting landing page with optimized user flow', 
    mockupType: 'landing', 
    technologies: ['Next.js', 'Framer Motion', 'CSS3'], 
    category: 'Development',
    slug: 'landing-page',
    fullDescription: 'A high-converting landing page designed to maximize user engagement and conversion rates. Features smooth animations, optimized loading performance, and data-driven design decisions based on user behavior analytics.',
    images: ['/project3-1.jpg', '/project3-2.jpg', '/project3-3.jpg'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['Next.js Framework', 'Smooth Animations', 'SEO Optimized', 'Conversion Focused'],
    challenges: [
      'Balancing animation complexity with performance',
      'A/B testing different conversion strategies',
      'Implementing advanced SEO optimization'
    ],
    outcomes: [
      '150% increase in conversion rate',
      '95+ PageSpeed Insights score',
      '300% improvement in organic traffic'
    ]
  },
  { 
    id: 4, 
    title: 'Mobile App', 
    description: 'Cross-platform mobile application with native performance', 
    mockupType: 'ui-ux', 
    technologies: ['React Native', 'Expo', 'Firebase'], 
    category: 'Mobile',
    slug: 'mobile-app',
    fullDescription: 'A cross-platform mobile application delivering native performance across iOS and Android platforms. Built with React Native and integrated with Firebase for real-time data synchronization and user authentication.',
    images: ['/project4-1.jpg', '/project4-2.jpg', '/project4-3.jpg'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['Cross-platform', 'Native Performance', 'Real-time Data', 'Push Notifications'],
    challenges: [
      'Achieving native performance in cross-platform environment',
      'Implementing offline-first architecture',
      'Handling different platform-specific behaviors'
    ],
    outcomes: [
      '4.8/5 app store rating',
      '1M+ downloads',
      '92% user retention rate'
    ]
  },
  { 
    id: 5, 
    title: 'E-commerce', 
    description: 'Full-featured e-commerce platform with payment integration', 
    mockupType: 'web', 
    technologies: ['Next.js', 'Stripe', 'MongoDB'], 
    category: 'Development',
    slug: 'ecommerce-platform',
    fullDescription: 'A complete e-commerce solution with secure payment processing and inventory management. Features include user authentication, product catalog, shopping cart, order management, and comprehensive admin dashboard.',
    images: ['/project5-1.jpg', '/project5-2.jpg', '/project5-3.jpg'],
    liveUrl: '#',
    githubUrl: '#',
    features: ['Payment Integration', 'Inventory Management', 'User Authentication', 'Admin Dashboard'],
    challenges: [
      'Implementing secure payment processing',
      'Building scalable inventory management system',
      'Creating intuitive admin interface'
    ],
    outcomes: [
      '$2M+ in processed transactions',
      '99.99% payment success rate',
      '50+ active merchants'
    ]
  },
  { 
    id: 6, 
    title: 'Liquid Glass Design System', 
    description: 'Advanced glassmorphism UI library with fluid animations and shader effects', 
    mockupType: 'web', 
    technologies: ['React', 'GLSL Shaders', 'WebGL', 'Framer Motion'], 
    category: 'UI Library',
    slug: 'liquid-glass-design',
    fullDescription: 'An innovative design system featuring advanced glassmorphism effects with real-time shader rendering. This project pushes the boundaries of web UI with fluid, liquid-like glass elements that respond to user interaction with physics-based animations and dynamic lighting effects. The system includes a comprehensive component library, shader utilities, and performance optimization tools.',
    liveUrl: '#',
    githubUrl: '#',
    features: ['Real-time Shader Effects', 'Physics-based Animation', 'Dynamic Lighting', 'Responsive Design'],
    challenges: [
      'Implementing complex GLSL shaders for web performance',
      'Creating smooth animations without impacting frame rate',
      'Ensuring cross-browser compatibility for WebGL effects',
      'Balancing visual quality with mobile device limitations',
      'Performance still needs improvement especially when rendering a large dimension'
    ],
    outcomes: [
      '>30fps performance',
      '98% browser compatibility',
    ]
  },
];

interface ProjectDetailProps {
  slug?: string;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ slug }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'challenges' | 'outcomes'>('overview');
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Find the project by slug
  const project = useMemo(() => {
    return projects.find(p => p.slug === slug);
  }, [slug]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (isVisible && containerRef.current) {
        const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }
  }, [isVisible]);


  if (!project) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <button
            onClick={navigateBack}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      navigateBack();
    }, 300);
  };

  const liquidGlassProps = useMemo(() => ({
    elasticity: 0.05,
    saturation: 120,
    displacementScale: 80,
    blurAmount: 6,
    mode: 'shader' as const,
  }), []);

  const tabContent = {
    overview: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">About This Project</h3>
          <p className="text-white/80 leading-relaxed">{project.fullDescription}</p>
        </div>
        
        {/* Special liquid glass demo section */}
        {project.slug === 'liquid-glass-design' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-3">Interactive Demo</h3>
            <div className="grid grid-cols-1 gap-4">
              <motion.div
                className="relative h-32"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <LiquidGlass
                  width={0}
                  height={0}
                  positioning="relative"
                  style={{ borderRadius: '12px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                  elasticity={0.4}
                  saturation={180}
                  displacementScale={150}
                  blurAmount={12}
                  mode="shader"
                  overLight="auto"
                >
                  <div className="w-full h-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: [-100, 400] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="text-white/90 font-medium">Hover for fluid effects</span>
                  </div>
                </LiquidGlass>
              </motion.div>
              
              <motion.div
                className="relative h-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <LiquidGlass
                  width={0}
                  height={0}
                  positioning="relative"
                  style={{ borderRadius: '12px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                  elasticity={0.3}
                  saturation={160}
                  displacementScale={100}
                  blurAmount={8}
                  mode="polar"
                  overLight="auto"
                >
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
                    <motion.div
                      className="flex space-x-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-8 bg-white/40 rounded-full"
                          animate={{ scaleY: [0.5, 1, 0.5] }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            delay: i * 0.2,
                            ease: "easeInOut" 
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </LiquidGlass>
              </motion.div>
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Technologies Used</h3>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech, index) => (
              <motion.span
                key={index}
                className="px-3 py-1.5 bg-white/20 text-white/90 rounded-full text-sm border border-white/10"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    ),
    features: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
        <div className="grid gap-3">
          {project.features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white/90">{feature}</span>
            </motion.div>
          ))}
        </div>
      </div>
    ),
    challenges: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">Technical Challenges</h3>
        <div className="grid gap-3">
          {project.challenges?.map((challenge, index) => (
            <motion.div
              key={index}
              className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-white/90">{challenge}</span>
            </motion.div>
          )) || <p className="text-white/70">No challenges documented for this project.</p>}
        </div>
      </div>
    ),
    outcomes: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">Project Outcomes</h3>
        <div className="grid gap-3">
          {project.outcomes?.map((outcome, index) => (
            <motion.div
              key={index}
              className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-white/90">{outcome}</span>
            </motion.div>
          )) || <p className="text-white/70">No outcomes documented for this project.</p>}
        </div>
      </div>
    ),
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
      className="fixed inset-0 z-[9999] bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-full h-full flex items-center justify-center p-4">
            <motion.div
              ref={containerRef}
        className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl h-[min(85vh,800px)] relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <LiquidGlass
                width={dimensions.width}
                height={dimensions.height}
                positioning="relative"
                style={{ borderRadius: '24px', width: '100%', height: '100%' }}
                {...liquidGlassProps}
                overLight="auto"
              >
                <div className="w-full h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5">
                  {/* Header with close button */}
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className="w-3 h-3 bg-red-400 rounded-full cursor-pointer"
                        whileHover={{ scale: 1.2 }}
                        onClick={handleClose}
                      />
                      <motion.div
                        className="w-3 h-3 bg-yellow-400 rounded-full cursor-pointer"
                        whileHover={{ scale: 1.2 }}
                      />
                      <motion.div
                        className="w-3 h-3 bg-green-400 rounded-full cursor-pointer"
                        whileHover={{ scale: 1.2 }}
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1.5 text-sm font-medium bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/10">
                        {project.category}
                      </span>
                      <motion.button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </motion.button>
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Left side - Hero */}
                    <div className="w-1/2 p-6 flex flex-col overflow-y-auto">
                      <div className="mb-6">
                        <motion.h1
                          className="text-4xl font-bold text-white mb-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {project.title}
                        </motion.h1>
                        <motion.p
                          className="text-lg text-white/80 leading-relaxed"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {project.description}
                        </motion.p>
                      </div>

                      {/* Project mockup/preview */}
                      <div className="flex-1 flex items-center justify-center">
                        <motion.div
                          className="w-full max-w-md h-64 relative"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          {project.slug === 'liquid-glass-design' ? (
                            // Special showcase for liquid glass project
                            <div className="w-full h-full grid grid-cols-2 gap-3">
                              <LiquidGlass
                                width={0}
                                height={0}
                                positioning="relative"
                                style={{ borderRadius: '12px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                                elasticity={0.3}
                                saturation={160}
                                displacementScale={120}
                                blurAmount={10}
                                mode="shader"
                                overLight="auto"
                              >
                                <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="w-8 h-8 border-2 border-white/60 border-t-transparent rounded-full"
                                  />
                                </div>
                              </LiquidGlass>
                              <LiquidGlass
                                width={0}
                                height={0}
                                positioning="relative"
                                style={{ borderRadius: '12px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                                elasticity={0.2}
                                saturation={180}
                                displacementScale={80}
                                blurAmount={6}
                                mode="polar"
                                overLight="auto"
                              >
                                <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-6 h-6 bg-white/40 rounded-full"
                                  />
                                </div>
                              </LiquidGlass>
                              <LiquidGlass
                                width={0}
                                height={0}
                                positioning="relative"
                                style={{ borderRadius: '12px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                                elasticity={0.25}
                                saturation={140}
                                displacementScale={100}
                                blurAmount={8}
                                mode="prominent"
                                overLight="auto"
                              >
                                <div className="w-full h-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
                                  <motion.div
                                    animate={{ y: [-10, 10, -10] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-4 h-8 bg-white/40 rounded-full"
                                  />
                                </div>
                              </LiquidGlass>
                              <LiquidGlass
                                width={0}
                                height={0}
                                positioning="relative"
                                style={{ borderRadius: '12px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                                elasticity={0.15}
                                saturation={200}
                                displacementScale={90}
                                blurAmount={5}
                                mode="standard"
                                overLight="auto"
                              >
                                <div className="w-full h-full bg-gradient-to-br from-orange-500/30 to-red-500/30 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
                                  <motion.div
                                    animate={{ rotate: [-45, 45, -45] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-6 h-6 border-2 border-white/60 rounded"
                                  />
                                </div>
                              </LiquidGlass>
                            </div>
                          ) : (
                            // Standard preview for other projects
                            <LiquidGlass
                              width={0}
                              height={0}
                              positioning="relative"
                              style={{ borderRadius: '16px', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
                              elasticity={0.2}
                              saturation={140}
                              displacementScale={60}
                              blurAmount={4}
                              mode="prominent"
                              overLight="auto"
                            >
                              <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                                <div className="text-center text-white/60">
                                  <div className="w-16 h-16 bg-white/20 rounded-xl mb-4 mx-auto flex items-center justify-center">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                      <polyline points="21,15 16,10 5,21"></polyline>
                                    </svg>
                                  </div>
                                  <p className="text-sm">Project Preview</p>
                                </div>
                              </div>
                            </LiquidGlass>
                          )}
                        </motion.div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 mt-6">
                        {project.liveUrl && project.liveUrl !== '#' && (
                          <motion.button
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 rounded-lg border border-green-500/30 hover:bg-gradient-to-r hover:from-green-500/30 hover:to-green-600/30 transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.open(project.liveUrl, '_blank')}
                          >
                            Live Demo
                          </motion.button>
                        )}
                        {project.githubUrl && project.githubUrl !== '#' && (
                          <motion.button
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 rounded-lg border border-gray-500/30 hover:bg-gradient-to-r hover:from-gray-500/30 hover:to-gray-600/30 transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.open(project.githubUrl, '_blank')}
                          >
                            GitHub
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Right side - Detailed content */}
                    <div className="w-1/2 border-l border-white/10 flex flex-col">
                      {/* Tab navigation */}
                      <div className="p-6 border-b border-white/10">
                        <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
                          {(['overview', 'features', 'challenges', 'outcomes'] as const).map((tab) => (
                            <motion.button
                              key={tab}
                              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                                activeTab === tab
                                  ? 'bg-white/20 text-white shadow-sm'
                                  : 'text-white/70 hover:text-white hover:bg-white/10'
                              }`}
                              onClick={() => setActiveTab(tab)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Tab content */}
                      <div className="flex-1 p-6 overflow-y-auto">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            {tabContent[activeTab]}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </LiquidGlass>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(ProjectDetail);