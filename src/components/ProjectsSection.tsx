import React, { memo, useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useComponentLoader } from '../contexts/LoadingContext';
import { navigateTo } from '../utils/router';
import './performance.css';
import { projects} from '../data/projects';

// Device mockup component (no changes)
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

  if (type === 'paper') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className={`w-18 h-20 ${color} rounded border border-white/40 relative overflow-hidden shadow-lg`}>
          {/* Paper header with title area */}
          <div className="absolute top-1 left-1 right-1 h-2 bg-white/40 rounded-sm"></div>
          <div className="absolute top-4 left-1 right-1 h-1 bg-white/25 rounded-sm"></div>
          
          {/* Abstract/content lines */}
          <div className="absolute top-6 left-1 right-1 space-y-0.5">
            <div className="h-0.5 bg-orange-400/60 rounded w-full"></div>
            <div className="h-0.5 bg-white/30 rounded w-5/6"></div>
            <div className="h-0.5 bg-white/30 rounded w-4/5"></div>
            <div className="h-0.5 bg-white/30 rounded w-full"></div>
            <div className="h-0.5 bg-white/30 rounded w-3/4"></div>
          </div>
          
          {/* Chart/graph representation */}
          <div className="absolute bottom-3 left-1 right-1 h-6 bg-gradient-to-t from-orange-400/40 to-orange-300/20 rounded-sm flex items-end justify-center space-x-0.5">
            <div className="w-1 h-2 bg-orange-500/70 rounded-sm"></div>
            <div className="w-1 h-4 bg-orange-500/70 rounded-sm"></div>
            <div className="w-1 h-3 bg-orange-500/70 rounded-sm"></div>
            <div className="w-1 h-5 bg-orange-500/70 rounded-sm"></div>
            <div className="w-1 h-2 bg-orange-500/70 rounded-sm"></div>
          </div>
        </div>
      </div>
    );
  }
  
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

const useResponsiveCards = (containerRef: React.RefObject<HTMLDivElement | null>, totalCards: number) => {
  const [layout, setLayout] = useState({
    visibleCards: 2,
    cardWidth: 500,
    viewportWidth: 1200
  });

  useEffect(() => {
    const updateLayout = () => {
      if (!containerRef.current) return;

      // Base all calcs on the container width
      const containerWidth = containerRef.current.clientWidth;

      const buttonWidth = 56; // each side nav button
      const viewportMargin = 32; // horizontal padding inside the container
      const cardGap = 24; // gap between cards

      // Available width strictly for cards area
      const viewportWidthRaw = containerWidth - (buttonWidth * 2) - viewportMargin;
      const viewportWidth = Math.max(280, viewportWidthRaw);

      // How many cards can fit (up to 3) given a minimum card width
      const maxCards = Math.max(1, Math.min(3, totalCards || 1));
      const minCard = containerWidth < 640 ? 300 : containerWidth < 1024 ? 340 : 360;

      let computedVisible = 1;
      for (let n = maxCards; n >= 1; n--) {
        const needed = n * minCard + (n - 1) * cardGap;
        if (viewportWidth >= needed) {
          computedVisible = n;
          break;
        }
      }

      // Compute base card width to fill the viewport evenly
      const baseCardWidth = Math.floor((viewportWidth - (computedVisible - 1) * cardGap) / computedVisible);

      // NEW: clamp single-card width and shrink viewport to match
      const SINGLE_CARD_MAX = 520;  // <- tweak to taste
      const SINGLE_CARD_MIN = minCard; // keep your existing min size
      const finalCardWidth =
        computedVisible === 1
          ? Math.max(SINGLE_CARD_MIN, Math.min(SINGLE_CARD_MAX, baseCardWidth))
          : baseCardWidth;

      const finalViewportWidth =
        computedVisible === 1 ? finalCardWidth : viewportWidth;

      setLayout({
        visibleCards: computedVisible,
        cardWidth: finalCardWidth,
        viewportWidth: finalViewportWidth
      });
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [containerRef, totalCards]);

  return layout;
};

// ProjectCard component with navigation functionality
const ProjectCard = memo(({ project, index, cardWidth }: { project: typeof projects[0]; index: number; cardWidth: number; }) => {
  const cardHeight = 380; // Reduced from 480px to 380px
  const [isHovered, setIsHovered] = useState(false);
  
  // Special liquid glass configuration for the liquid glass project
  const isLiquidGlassProject = project.slug === 'liquid-glass-design';

  const optimizedProps = useMemo(() => ({
    width: cardWidth,
    height: cardHeight,
    positioning: "relative" as const,
    style: { borderRadius: '24px' },
    elasticity: isLiquidGlassProject ? 0.2 : 0.1,
    saturation: isLiquidGlassProject ? 180 : 150,
    displacementScale: isLiquidGlassProject ? 140 : 110,
    blurAmount: isLiquidGlassProject ? 12 : 8,
    mode: isLiquidGlassProject ? 'shader' as const : 'shader' as const,
  }), [cardWidth, cardHeight, isLiquidGlassProject]);

  // Handle project card click - navigate to project detail page
  const handleProjectClick = () => {
    // Navigate using the router utility
    navigateTo(`/projects/${project.slug}`);
  };

  // Handle external link clicks (prevent navigation to project detail)
  const handleExternalLinkClick = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (!url || url === '#') return; // type-safe guard
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
      style={{ width: `${cardWidth}px`, height: `${cardHeight}px` }}
      className="group cursor-pointer flex-shrink-0"
      onClick={handleProjectClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.3, ease: "easeOut" } }}
        whileTap={{ scale: 0.98, transition: { duration: 0.2 } }}
      >
        <LiquidGlass {...optimizedProps}>
          <div className="w-full h-full flex flex-col relative p-6 overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
            {/* Enhanced background effects for liquid glass project */}
            {isLiquidGlassProject ? (
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/30 to-transparent rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/30 to-transparent rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-r from-pink-400/20 to-transparent rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            ) : (
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-xl"></div>
              </div>
            )}
            <div className="relative z-10 mb-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">{project.title}</h3>
                <span className="px-3 py-1.5 text-xs font-medium bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/10">{project.category}</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{project.description}</p>
            </div>
            <div className="flex-1 flex items-center justify-center mb-4 relative">
              {isLiquidGlassProject ? (
                // Special liquid glass showcase
                <div className="relative w-full h-32 grid grid-cols-3 gap-2">
                  <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl backdrop-blur-sm border border-white/20 overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-2 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border border-white/60 border-t-transparent rounded-full"
                      />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl backdrop-blur-sm border border-white/20 overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-2 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-3 h-3 bg-white/50 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl backdrop-blur-sm border border-white/20 overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-2 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-lg flex items-center justify-center">
                      <motion.div
                        animate={{ y: [-4, 4, -4] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-2 h-6 bg-white/50 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Standard mockup for other projects
                <div className="relative w-full h-32 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-sm border border-white/10 overflow-hidden shadow-2xl">
                  <div className="absolute inset-4 flex items-center justify-center">
                    <DeviceMockup type={project.mockupType} color="bg-white/30" />
                  </div>
                  <div className="absolute top-3 left-3 w-2 h-2 bg-green-400/60 rounded-full animate-pulse"></div>
                  <div className="absolute top-3 right-3 w-2 h-2 bg-orange-400/60 rounded-full animate-pulse delay-300"></div>
                  <div className="absolute bottom-3 left-3 w-2 h-2 bg-blue-400/60 rounded-full animate-pulse delay-700"></div>
                </div>
              )}
            </div>
            <div className="relative z-10 flex items-end justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <motion.span key={i} className="text-xs px-3 py-1.5 bg-white/10 text-white/80 rounded-full backdrop-blur-sm border border-white/5 shadow-2xl relative" whileHover={{ scale: 1.05 }}>
                      {tech}
                    </motion.span>
                  ))}
                </div>
                {/* Quick action buttons */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {project.liveUrl && project.liveUrl !== '#' && (
                    <motion.button
                      onClick={(e) => handleExternalLinkClick(e, project.liveUrl)}
                      className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded border border-green-500/30 hover:bg-green-500/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Live Demo
                    </motion.button>
                  )}
                  {project.githubUrl && project.githubUrl !== '#' && (
                    <motion.button
                      onClick={(e) => handleExternalLinkClick(e, project.githubUrl)}
                      className="text-xs px-2 py-1 bg-gray-500/20 text-gray-300 rounded border border-gray-500/30 hover:bg-gray-500/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      GitHub
                    </motion.button>
                  )}
                </div>
              </div>
              <motion.div 
                className="ml-4 p-2.5 bg-white/15 rounded-full backdrop-blur-sm border border-white/10 group-hover:bg-white/25 transition-colors duration-300" 
                animate={{ 
                  scale: isHovered ? 1.1 : 1, 
                  rotate: isHovered ? 45 : 0 
                }}
                transition={{ 
                  duration: 0.3, 
                  ease: "easeOut" 
                }}
                whileTap={{ scale: 0.9 }}
                style={{ 
                  transformOrigin: "center" 
                }}
              >
                <motion.svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-white transition-colors duration-300"
                  animate={{ 
                    rotate: isHovered ? [0, 5, -5, 0] : 0
                  }}
                  transition={{ 
                    duration: isHovered ? 0.6 : 0.3, 
                    ease: "easeInOut",
                    repeat: isHovered ? Infinity : 0,
                    repeatDelay: isHovered ? 2 : 0
                  }}
                >
                  <path d="M7 17L17 7" />
                  <path d="M7 7L17 7L17 17" />
                </motion.svg>
              </motion.div>
            </div>
          </div>
        </LiquidGlass>
      </motion.div>
    </motion.div>
  );
});
ProjectCard.displayName = 'ProjectCard';

const ProjectsSection: React.FC = () => {
  useComponentLoader('ProjectsSection');
  const [currentPage, setCurrentPage] = useState(0);
  
  // Create a ref for the slider container
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Single, correct call to the hook with the ref
  const { visibleCards, cardWidth, viewportWidth } = useResponsiveCards(sliderContainerRef, projects.length);

  const totalCards = projects.length;
  const totalPages = Math.ceil(totalCards / visibleCards);

  const handlePrevious = () => setCurrentPage((prev) => Math.max(0, prev - 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  const handleDotClick = (pageIndex: number) => setCurrentPage(pageIndex);

  const getVisibleProjects = () => {
    const startIndex = currentPage * visibleCards;
    return projects.slice(startIndex, startIndex + visibleCards);
  };
  const visibleProjects = getVisibleProjects();
  
  const isPrevDisabled = currentPage === 0;
  const isNextDisabled = currentPage >= totalPages - 1;

  return (
    <motion.section 
      id="projects" 
      className="min-h-screen flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8 w-full"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
            Featured Work
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
            Explore my latest projects and creative solutions
          </p>
        </motion.div>
        
        {/* Attach the ref to this container */}
        <div ref={sliderContainerRef} className="w-full flex items-center justify-center mb-8">
          {/* Left Navigation Button */}
          <motion.button
              onClick={handlePrevious}
              disabled={isPrevDisabled}
              className={`z-20 flex-shrink-0 transition-opacity duration-300 mx-2 md:mx-4 ${isPrevDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
              whileHover={{ scale: isPrevDisabled ? 1 : 1.05 }}
              whileTap={{ scale: isPrevDisabled ? 1 : 0.95 }}
              aria-label="Previous project"
          >
              <div className="relative">
                  <LiquidGlass width={56} height={56} positioning="relative" style={{ borderRadius: '50%' }} elasticity={0.15} saturation={150} aberrationIntensity={1.5} displacementScale={60} blurAmount={6} mode='shader' />
                  <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white"><path d="M15 18L9 12L15 6" /></svg>
                  </div>
              </div>
          </motion.button>

          {/* Cards Viewport */}
          <div className="flex justify-center items-center" style={{ width: `${viewportWidth}px`}}>
              <motion.div 
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex gap-4 md:gap-6 justify-center items-start"
                  style={{ minHeight: '420px' }}
              >
                  {visibleProjects.map((project, index) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        index={index}
                        cardWidth={cardWidth}
                      />
                  ))}
              </motion.div>
          </div>

          {/* Right Navigation Button */}
          <motion.button
              onClick={handleNext}
              disabled={isNextDisabled}
              className={`z-20 flex-shrink-0 transition-opacity duration-300 mx-2 md:mx-4 ${isNextDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
              whileHover={{ scale: isNextDisabled ? 1 : 1.05 }}
              whileTap={{ scale: isNextDisabled ? 1 : 0.95 }}
              aria-label="Next project"
          >
              <div className="relative">
                  <LiquidGlass width={56} height={56} positioning="relative" style={{ borderRadius: '50%' }} elasticity={0.15} saturation={150} aberrationIntensity={1.5} displacementScale={60} blurAmount={6} mode='shader' />
                  <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white"><path d="M9 18L15 12L9 6" /></svg>
                  </div>
              </div>
          </motion.button>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-3 mb-6">
          {Array.from({ length: totalPages }).map((_, pageIndex) => {
            const isActive = currentPage === pageIndex;
            return (
              <motion.button
                key={`dot-${pageIndex}`}
                onClick={() => handleDotClick(pageIndex)}
                className={`relative w-3 h-3 rounded-full transition-all duration-300 ${isActive ? 'bg-orange-500 scale-125' : 'bg-white/30 hover:bg-white/50'}`}
                whileHover={{ scale: isActive ? 1.25 : 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isActive && (
                  <motion.div className="absolute inset-0 rounded-full bg-orange-400" animate={{ scale: [1, 1.3, 1], opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Project Counter */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <LiquidGlass
            width={215}
            height={56}
            positioning="relative"
            style={{ borderRadius: '28px' }}
            elasticity={0.12}
            saturation={140}
            displacementScale={150}
            blurAmount={8}
            mode="shader"
          >
            <span className="text-white text-base font-semibold [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
              Page {currentPage + 1} of {totalPages} • {totalCards} Projects
            </span>
          </LiquidGlass>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default memo(ProjectsSection);
