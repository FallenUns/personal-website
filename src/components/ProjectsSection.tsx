import React, { memo, useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useComponentLoader } from '../contexts/LoadingContext'; // Import the hook
import './performance.css';

// Device mockup component
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
  
  // Landing page mockup
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

// Hook for responsive card count
const useResponsiveCards = () => {
  const [visibleCards, setVisibleCards] = useState(2);
  const [cardWidth, setCardWidth] = useState(500);

  useEffect(() => {
    const updateLayout = () => {
      const screenWidth = window.innerWidth;
      
      if (screenWidth < 768) { // Mobile
        setVisibleCards(1);
        setCardWidth(Math.min(340, screenWidth - 48)); // Full width minus padding
      } else if (screenWidth < 1024) { // Tablet
        setVisibleCards(1);
        setCardWidth(Math.min(420, screenWidth - 64));
      } else if (screenWidth < 1280) { // Small desktop
        setVisibleCards(2);
        setCardWidth(380);
      } else if (screenWidth < 1536) { // Medium desktop
        setVisibleCards(2);
        setCardWidth(450);
      } else { // Large desktop
        setVisibleCards(2);
        setCardWidth(500);
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  return { visibleCards, cardWidth };
};

// Memoize project data to prevent unnecessary re-creation
const projects = [
  {
    id: 1,
    title: 'UI/UX Design',
    description: 'Modern mobile app interface design with intuitive user experience',
    mockupType: 'ui-ux',
    technologies: ['Figma', 'Adobe XD', 'Principle'],
    category: 'Design'
  },
  {
    id: 2,
    title: 'Web Design',
    description: 'Responsive web application with modern design principles',
    mockupType: 'web',
    technologies: ['React', 'TypeScript', 'Tailwind'],
    category: 'Development'
  },
  {
    id: 3,
    title: 'Landing Page',
    description: 'High-converting landing page with optimized user flow',
    mockupType: 'landing',
    technologies: ['Next.js', 'Framer Motion', 'CSS3'],
    category: 'Development'
  },
  {
    id: 4,
    title: 'Mobile App',
    description: 'Cross-platform mobile application with native performance',
    mockupType: 'ui-ux',
    technologies: ['React Native', 'Expo', 'Firebase'],
    category: 'Mobile'
  },
  {
    id: 5,
    title: 'E-commerce',
    description: 'Full-featured e-commerce platform with payment integration',
    mockupType: 'web',
    technologies: ['Next.js', 'Stripe', 'MongoDB'],
    category: 'Development'
  },
];

const ProjectCard = memo(({ project, index, cardWidth }: { 
  project: typeof projects[0]; 
  index: number; 
  cardWidth: number;
}) => {
  const cardHeight = 340; 

  // Optimize LiquidGlass props - disable expensive features during scroll
  const optimizedProps = useMemo(() => ({
    width: cardWidth,
    height: cardHeight,
    positioning: "relative" as const,
    style: { borderRadius: '24px' },
    elasticity: 0.05,
    saturation: 120,
    aberrationIntensity: 0,
    displacementScale: 50,
    overLight: false,
    blurAmount: 8,
    mode: 'standard' as const,
    isElastic: false,
  }), [cardWidth, cardHeight]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ 
        duration: 0.5, 
        ease: 'easeOut',
        delay: index * 0.1
      }}
      style={{ width: `${cardWidth}px`, height: `${cardHeight}px` }}
      className="group cursor-pointer"
    >
      <LiquidGlass {...optimizedProps}>
        <div className="w-full h-full flex flex-col relative p-6 overflow-hidden">
          {/* Header with title */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white [text-shadow:0_2px_5px_rgba(0,0,0,0.8)]">
              {project.title}
            </h3>
          </div>

          {/* Main content area with device mockup */}
          <div className="flex-1 flex items-center justify-center mb-4">
            <div className="relative w-full h-32 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 overflow-hidden">
              {/* Device mockup */}
              <div className="absolute inset-2 flex items-center justify-center">
                <DeviceMockup 
                  type={project.mockupType} 
                  color="bg-white/20" 
                />
              </div>
              
              {/* Category badge */}
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-xs bg-white/20 text-white rounded-full backdrop-blur-sm">
                  {project.category}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom section with description and arrow */}
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <p className="text-sm text-white/80 leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {project.technologies.slice(0, 2).map((tech, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-white/10 text-white/70 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Arrow icon */}
            <div className="ml-4 p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors duration-300">
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7L17 7L17 17" />
              </svg>
            </div>
          </div>
        </div>
      </LiquidGlass>
    </motion.div>
  );
});

ProjectCard.displayName = 'ProjectCard';

const ProjectsSection: React.FC = () => {
  useComponentLoader('ProjectsSection'); // Register component for loading
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { visibleCards, cardWidth } = useResponsiveCards();

  const totalCards = projects.length;
  const maxIndex = Math.max(0, totalCards - visibleCards);

  const scrollToIndex = (index: number) => {
    const newIndex = Math.max(0, Math.min(maxIndex, index));
    setCurrentIndex(newIndex);
    
    if (scrollContainerRef.current) {
      const gap = window.innerWidth < 640 ? 24 : 32; // Responsive gap
      const cardWidthWithGap = cardWidth + gap;
      const scrollPosition = newIndex * cardWidthWithGap;
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const handlePrevious = () => {
    const step = visibleCards === 1 ? 1 : 1; // Move one card at a time for better UX
    scrollToIndex(currentIndex - step);
  };

  const handleNext = () => {
    const step = visibleCards === 1 ? 1 : 1; // Move one card at a time for better UX
    scrollToIndex(currentIndex + step);
  };

  // Handle scroll events to update current index
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const gap = window.innerWidth < 640 ? 24 : 32; // Responsive gap
    const cardWidthWithGap = cardWidth + gap;
    const scrollLeft = container.scrollLeft;
    const newIndex = Math.round(scrollLeft / cardWidthWithGap);
    setCurrentIndex(Math.max(0, Math.min(maxIndex, newIndex)));
  };

  return (
    <motion.section 
      id="projects" 
      className="py-16 px-4 sm:px-6 lg:px-8 w-full pt-24"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{ 
        duration: 0.8, 
        ease: 'easeOut'
      }}
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        <motion.h2 
          className="text-3xl sm:text-4xl font-bold text-center text-white mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        >
          My Work
        </motion.h2>

        {/* Navigation and Scrollable Container */}
        <div className="relative w-full">
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2 sm:p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5">
                <path d="M15 18L9 12L15 6" />
              </svg>
            </button>
            
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(totalCards / (visibleCards === 1 ? 1 : visibleCards)) }).map((_, index) => {
                const isActive = visibleCards === 1 
                  ? currentIndex === index
                  : Math.floor(currentIndex / visibleCards) === index;
                
                return (
                  <button
                    key={index}
                    onClick={() => scrollToIndex(index * (visibleCards === 1 ? 1 : visibleCards))}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      isActive ? 'bg-orange-500' : 'bg-white/30'
                    }`}
                  />
                );
              })}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="p-2 sm:p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5">
                <path d="M9 18L15 12L9 6" />
              </svg>
            </button>
          </div>

          {/* Scrollable Cards Container */}
          <motion.div
            ref={scrollContainerRef}
            className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide horizontal-scroll snap-x snap-mandatory pb-4 mx-auto px-4 sm:px-0"
            style={{ 
              maxWidth: visibleCards === 1 
                ? `${cardWidth + 32}px` // Add padding for mobile
                : `calc(${visibleCards} * ${cardWidth}px + ${(visibleCards - 1) * 32}px)`,
              width: '100%'
            }}
            onScroll={handleScroll}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            {projects.map((project, index) => (
              <div key={project.id} className="flex-shrink-0 snap-start">
                <ProjectCard project={project} index={index} cardWidth={cardWidth} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default memo(ProjectsSection);