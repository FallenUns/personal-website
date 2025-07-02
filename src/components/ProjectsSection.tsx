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
        setCardWidth(Math.min(350, screenWidth - 120)); 
      } else if (screenWidth < 1024) { // Tablet
        setVisibleCards(1);
        setCardWidth(Math.min(450, screenWidth - 160)); 
      } else if (screenWidth < 1280) { // Small desktop - 2 columns
        setVisibleCards(2);
        setCardWidth(Math.min(450, (screenWidth - 200) / 2));
      } else if (screenWidth < 1920) { // Large Desktop - 2 columns
        setVisibleCards(2);
        setCardWidth(Math.min(550, (screenWidth - 240) / 2));
      } else { // XL Desktop - 3 columns
        setVisibleCards(3);
        setCardWidth(Math.min(500, (screenWidth - 320) / 3));
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
  const cardHeight = 450; // Increased from 380 to 450

  // Optimize LiquidGlass props - disable expensive features during scroll
  const optimizedProps = useMemo(() => ({
    width: cardWidth,
    height: cardHeight,
    positioning: "relative" as const,
    style: { borderRadius: '24px' },
    elasticity: 0.07,
    saturation: 150,
    aberrationIntensity: 0,
    displacementScale: 50,
    overLight: false,
    blurAmount: 8,
    mode: 'standard' as const,
    isElastic: true, 
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
  useComponentLoader('ProjectsSection');
  const [currentPage, setCurrentPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { visibleCards, cardWidth } = useResponsiveCards();

  const totalCards = projects.length;
  const totalPages = Math.ceil(totalCards / visibleCards);

  const scrollToPage = (page: number) => {
    const newPage = Math.max(0, Math.min(totalPages - 1, page));
    setCurrentPage(newPage);
    
    if (scrollContainerRef.current) {
      const gap = window.innerWidth < 640 ? 16 : window.innerWidth < 1024 ? 24 : 32;
      const cardWidthWithGap = cardWidth + gap;
      const startIndex = newPage * visibleCards;
      
      // Calculate if we're on the last page and need to center remaining cards
      const remainingCards = totalCards - startIndex;
      const cardsOnCurrentPage = Math.min(remainingCards, visibleCards);
      
      let scrollPosition = startIndex * cardWidthWithGap;
      
      // Center cards on the last page if there are fewer cards than visible slots
      if (newPage === totalPages - 1 && cardsOnCurrentPage < visibleCards) {
        const containerWidth = visibleCards * cardWidth + (visibleCards - 1) * gap;
        const contentWidth = cardsOnCurrentPage * cardWidth + (cardsOnCurrentPage - 1) * gap;
        const centerOffset = (containerWidth - contentWidth) / 2;
        scrollPosition = startIndex * cardWidthWithGap - centerOffset;
      }
      
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  };

  const handlePrevious = () => {
    scrollToPage(currentPage - 1);
  };

  const handleNext = () => {
    scrollToPage(currentPage + 1);
  };

  // Handle scroll events to update current page
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const gap = window.innerWidth < 640 ? 16 : window.innerWidth < 1024 ? 24 : 32;
    const cardWidthWithGap = cardWidth + gap;
    const scrollLeft = container.scrollLeft;
    
    // Calculate which page is currently visible
    const cardIndex = Math.round(scrollLeft / cardWidthWithGap);
    const page = Math.floor(cardIndex / visibleCards);
    
    setCurrentPage(Math.max(0, Math.min(totalPages - 1, page)));
  };

  return (
    <motion.section 
      id="projects" 
      className="min-h-screen flex flex-col justify-center py-16 px-2 sm:px-6 lg:px-8 w-full overflow-visible"
    >
      <div className="max-w-none mx-auto w-full flex flex-col items-center">
        <motion.h2 
          className="text-3xl sm:text-4xl font-bold text-center text-white mb-8 sm:mb-10"
        >
          My Work
        </motion.h2>

        <div className="w-full overflow-visible"> {/* Added overflow-visible */}
          {/* Container with proper spacing for arrows */}
          <div className="relative flex items-center justify-center mx-auto px-8 sm:px-16 lg:px-20 overflow-visible"> {/* Added overflow-visible */}
            {/* Left Arrow - positioned outside the cards */}
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5"><path d="M15 18L9 12L15 6" /></svg>
            </button>

            {/* Scrollable Cards Container */}
            <motion.div
              ref={scrollContainerRef}
              className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto scrollbar-hide horizontal-scroll snap-x snap-mandatory overflow-y-visible"
              style={{ 
                width: (() => {
                  const gap = window.innerWidth < 640 ? 16 : window.innerWidth < 1024 ? 24 : 32;
                  return visibleCards === 1 
                    ? `${cardWidth}px` 
                    : `${visibleCards * cardWidth + (visibleCards - 1) * gap}px`;
                })(),
                height: '490px',
                paddingTop: '20px',
                paddingBottom: '20px'
              }}
              onScroll={handleScroll}
            >
              {projects.map((project, index) => (
                <div key={project.id} className="flex-shrink-0 snap-start">
                  <ProjectCard project={project} index={index} cardWidth={cardWidth} />
                </div>
              ))}
            </motion.div>

            {/* Right Arrow - positioned outside the cards */}
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5"><path d="M9 18L15 12L9 6" /></svg>
            </button>
          </div>

          {/* Navigation Dots Container */}
          <div className="flex justify-center space-x-2 mt-8">
            {Array.from({ length: totalPages }).map((_, pageIndex) => {
              const isActive = currentPage === pageIndex;
              
              return (
                <button
                  key={`page-${pageIndex}`}
                  onClick={() => scrollToPage(pageIndex)}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    isActive ? 'bg-orange-500' : 'bg-white/30'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default memo(ProjectsSection);