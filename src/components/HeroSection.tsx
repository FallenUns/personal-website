// src/components/HeroSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useLoading, useComponentLoader } from '../contexts/LoadingContext';

const HeroSection: React.FC = () => {
  useComponentLoader('HeroSection');
  const { isLoading } = useLoading();
  
  // State for tooltip
  const [hoveredTech, setHoveredTech] = React.useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  const handleTechHover = (techName: string, event: React.MouseEvent) => {
    setHoveredTech(techName);
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPosition({ 
      x: rect.left + rect.width / 2, 
      y: rect.top - 14 
    });
  };

  const handleTechLeave = () => {
    setHoveredTech(null);
  };

  const scrollToSection = (sectionId: string) => {
    console.log(`${sectionId} button clicked`);
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      console.log(`${sectionId} section found:`, targetSection);
      
      // With scroll-snap removed, this should work smoothly
      targetSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    } else {
      console.error(`${sectionId} section not found`);
    }
  };

  return (
    <>
      {/* Tooltip */}
      {hoveredTech && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%) translateY(-65%)',
          }}
        >
          <LiquidGlass
            width={120}
            height={35}
            positioning="relative"
            style={{ 
              borderRadius: '24px',
            }}
            aberrationIntensity={0.2}
            elasticity={0.3}
            blurAmount={6}
            saturation={120}
            displacementScale={15}
            mode='shader'
          >
            <span className="text-white text-xs font-medium px-2 py-1 [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
              {hoveredTech}
            </span>
          </LiquidGlass>
        </div>
      )}
      
      <section id="about" className="h-screen flex flex-col lg:flex-row items-center px-6 sm:px-12 md:px-20 lg:px-32 pt-20 relative">
      <div className="flex flex-col lg:flex-row items-center justify-between w-full">
        {/* Left side - Text content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: isLoading ? 0 : 1, 
            y: isLoading ? 30 : 0 
          }}
          transition={{ 
            duration: 0.8, 
            ease: 'easeOut',
            delay: isLoading ? 0 : 0.5
          }}
          className="text-left flex-1 max-w-2xl w-full lg:w-auto"
        >
          <div className="text-white">
            {/* Greeting */}
            <div className="flex items-center mb-4">
              <span className="text-5xl mr-3 wave-animation">👋</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-semibold mb-4 [text-shadow:0_2px_5px_rgba(0,0,0,1)]">
              Hello! I'm <span className="font-bold"> Patrick Adrianus </span>
            </h1>
            
            {/* Subtitle with decorative element */}
            <div className="flex items-center mb-6">
              <div className="w-18 h-0.5 bg-white/60 mr-4"></div>
              <span className="text-lg font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                Data Scientist ✦ Full-Stack Developer
              </span>
            </div>
            
            {/* Description */}
            <p className="text-base text-white/90 max-w-xl mb-6 [text-shadow:0_1px_4px_rgba(0,0,0,1)]">
            Hello! I’m Patrick, a <span className="font-semibold">Data Scientist</span> who loves building projects from apps and data solutions to creative tools and always experimenting with new technologies and development frameworks to turn fresh ideas into real-world impact.
            </p>
            
            {/* Key Points */}
            <div className="mb-8 space-y-2">
              <div className="flex items-center text-white/90">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">End‑to‑end model deployment</span>
              </div>
              <div className="flex items-center text-white/90">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Storytelling with data</span>
              </div>
              <div className="flex items-center text-white/90">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">User‑centric collaboration</span>
              </div>
            </div>
            <div className="flex space-x-4">

            <LiquidGlass
                width={180}
                height={45}
                positioning="relative"
                style={{ 
                  borderRadius: '99px', 
                  cursor: 'pointer',
                }}
                className="hover:bg-white/10"
                aberrationIntensity={0.5}
                elasticity={0.2}
                blurAmount={12}
                saturation={150}
                displacementScale={35}
                mode='shader'
                onClick={() => scrollToSection('projects')}
            >
                <span className="font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                    My Projects
                </span>
            </LiquidGlass>
            
            {/* Download CV Button - Transparent with border */}
            <LiquidGlass
                width={180}
                height={45}
                positioning="relative"
                style={{ 
                  borderRadius: '99px', 
                  cursor: 'pointer',
                }}
                className="hover:bg-white/10"
                aberrationIntensity={0.5}
                elasticity={0.2}
                blurAmount={12}
                saturation={150}
                displacementScale={35}
                mode='shader'
                onClick={() => {
                  try {
                    window.open('/resume.pdf', '_blank');
                  } catch (error) {
                    console.error('Failed to open resume:', error);
                    // Fallback to download
                    const link = document.createElement('a');
                    link.href = '/resume.pdf';
                    link.download = 'Patrick_Resume.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
            >
                <span className="font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] flex items-center">
                    My Resume 
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </span>
            </LiquidGlass>
          </div>
        </div>
      </motion.div>

      {/* Mobile Portrait - Show only on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ 
          opacity: isLoading ? 0 : 1, 
          y: isLoading ? 30 : 0 
        }}
        transition={{ 
          duration: 0.8, 
          ease: 'easeOut',
          delay: isLoading ? 0 : 0.7
        }} 
        className="w-full flex justify-center mt-8 lg:hidden"
      >
        <div className="relative flex items-center justify-center">
          <LiquidGlass
            width={230}
            height={300}
            positioning="relative"
            style={{ 
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aberrationIntensity={0.3}
            elasticity={0.2}
            blurAmount={8}
            saturation={150}
            displacementScale={80}
            mode='shader'
          >
            <img
              src="/Subject.png"
              alt="Patrick's Portrait"
              className="w-full h-full object-cover object-top"
              style={{
                borderRadius: '20px',
                transform: 'scale(0.92)',
                transition: 'transform 0.3s ease-out'
              }}
            />
          </LiquidGlass>

          {/* Mobile Tech Spheres - Smaller and positioned around portrait */}
          {/* React Sphere - Top Left */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ top: '8%', left: '-20%' }}
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            onMouseEnter={(e) => handleTechHover('React.js', e)}
            onMouseLeave={handleTechLeave}
            whileHover={{ scale: 1.1 }}
          >
            <LiquidGlass
              width={50}
              height={50}
              positioning="relative"
              style={{ borderRadius: '20px' }}
              aberrationIntensity={0.2}
              elasticity={0.3}
              blurAmount={6}
              saturation={140}
              displacementScale={20}
              mode='shader'
            >
              <img src="/react-logo.png" alt="React" className="w-6 h-6" />
            </LiquidGlass>
          </motion.div>

          {/* Python Sphere - Top Right */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ top: '12%', right: '-20%' }}
            animate={{ 
              y: [0, 8, 0],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ 
              duration: 3.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
            onMouseEnter={(e) => handleTechHover('Python', e)}
            onMouseLeave={handleTechLeave}
            whileHover={{ scale: 1.1 }}
          >
            <LiquidGlass
              width={50}
              height={50}
              positioning="relative"
              style={{ borderRadius: '20px' }}
              aberrationIntensity={0.2}
              elasticity={0.3}
              blurAmount={6}
              saturation={140}
              displacementScale={20}
              mode='shader'
            >
              <img src="/python-logo.png" alt="Python" className="w-6 h-6" />
            </LiquidGlass>
          </motion.div>

          {/* JavaScript Sphere - Middle Right */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ top: '45%', right: '-25%' }}
            animate={{ 
              x: [0, 6, 0],
              y: [0, -4, 0]
            }}
            transition={{ 
              duration: 3.8, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            onMouseEnter={(e) => handleTechHover('JavaScript', e)}
            onMouseLeave={handleTechLeave}
            whileHover={{ scale: 1.1 }}
          >
            <LiquidGlass
              width={50}
              height={50}
              positioning="relative"
              style={{ borderRadius: '20px' }}
              aberrationIntensity={0.2}
              elasticity={0.3}
              blurAmount={6}
              saturation={140}
              displacementScale={20}
              mode='shader'
            >
              <img src="/js-logo.png" alt="JavaScript" className="w-6 h-6" />
            </LiquidGlass>
          </motion.div>

          {/* TensorFlow Sphere - Middle Left */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ top: '40%', left: '-25%' }}
            animate={{ 
              x: [0, -6, 0],
              rotate: [0, 8, -8, 0]
            }}
            transition={{ 
              duration: 4.2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1.5
            }}
            onMouseEnter={(e) => handleTechHover('TensorFlow', e)}
            onMouseLeave={handleTechLeave}
            whileHover={{ scale: 1.1 }}
          >
            <LiquidGlass
              width={50}
              height={50}
              positioning="relative"
              style={{ borderRadius: '20px' }}
              aberrationIntensity={0.2}
              elasticity={0.3}
              blurAmount={6}
              saturation={140}
              displacementScale={20}
              mode='shader'
            >
              <img src="/tensorflow-logo.png" alt="TensorFlow" className="w-6 h-6" />
            </LiquidGlass>
          </motion.div>

          {/* ML Sphere - Bottom Left */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ bottom: '18%', left: '-22%' }}
            animate={{ 
              y: [0, -6, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3.2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
            onMouseEnter={(e) => handleTechHover('R', e)}
            onMouseLeave={handleTechLeave}
            whileHover={{ scale: 1.15 }}
          >
            <LiquidGlass
              width={45}
              height={45}
              positioning="relative"
              style={{ borderRadius: '20px' }}
              aberrationIntensity={0.2}
              elasticity={0.3}
              blurAmount={6}
              saturation={140}
              displacementScale={18}
              mode='shader'
            >
              <img src="/r-logo.png" alt="R" className="w-6 h-6" />
            </LiquidGlass>
          </motion.div>

          {/* SQL Sphere - Bottom Right */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ bottom: '22%', right: '-22%' }}
            animate={{ 
              rotate: [0, -6, 0],
              scale: [1, 0.95, 1]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: "linear"
            }}
            onMouseEnter={(e) => handleTechHover('SQL', e)}
            onMouseLeave={handleTechLeave}
            whileHover={{ scale: 1.15 }}
          >
            <LiquidGlass
              width={45}
              height={45}
              positioning="relative"
              style={{ borderRadius: '20px' }}
              aberrationIntensity={0.2}
              elasticity={0.3}
              blurAmount={6}
              saturation={140}
              displacementScale={18}
              mode='shader'
            >
              <img src="/sql-logo.png" alt="SQL" className="w-6 h-6" />
            </LiquidGlass>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side  - Always rendered but hidden during loading */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isLoading ? 0 : 1, 
          scale: isLoading ? 0.8 : 1 
        }}
        transition={{ 
          duration: 0.8, 
          ease: 'easeOut',
          delay: isLoading ? 0 : 0.5
        }}
        className="flex-1 h-screen min-h-[700px] max-w-4xl hidden lg:block"
      >
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Main Portrait */}
          <LiquidGlass
            width={350}
            height={500}
            positioning="relative"
            style={{ 
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="hover:bg-white/10"
            aberrationIntensity={0.3}
            elasticity={0.2}
            blurAmount={8}
            saturation={150}
            displacementScale={120}
            mode='shader'
          >
            <img
              src="/Subject.png"
              alt="Patrick's Portrait"
              className="w-full h-full object-cover object-top"
              style={{
                borderRadius: '24px',
                transform: 'scale(0.92)', // Added scale for a gap
                transition: 'transform 0.3s ease-out' // Smooth transition for scale
              }}
            />
          </LiquidGlass>

          {/* Tech Spheres - Floating around the portrait */}
          {/* React Sphere - Top Left */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ top: '6%', left: '-35%' }} // Moved further out
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            onMouseEnter={(e) => handleTechHover('React.js', e)}
            onMouseLeave={handleTechLeave}
            whileHover={{ scale: 1.1 }}
          >
            <LiquidGlass
              width={70}
              height={70}
              positioning="relative"
              style={{ borderRadius: '24px' }}
              aberrationIntensity={0.2}
              elasticity={0.3}
              blurAmount={6}
              saturation={140}
              displacementScale={20}
              mode='shader'
            >
              <img src="/react-logo.png" alt="React" className="w-9 h-9" />
            </LiquidGlass>
          </motion.div>

          {/* Python Sphere - Top Right */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ top: '10%', right: '-35%' }} // Moved further out
            animate={{ 
              y: [0, 10, 0],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ 
              duration: 3.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
            onMouseEnter={(e) => handleTechHover('Python', e)}
            onMouseLeave={handleTechLeave}
            whileHover={{ scale: 1.1 }}
          >
            <LiquidGlass
              width={70} // Increased size
              height={70} // Increased size
              positioning="relative"
              style={{ borderRadius: '24px' }}
              aberrationIntensity={0.2}
              elasticity={0.3}
              blurAmount={6}
              saturation={140}
              displacementScale={25}
              mode='shader'
            >
              <img src="/python-logo.png" alt="Python" className="w-9 h-9" />
            </LiquidGlass>
          </motion.div>

          {/* TensorFlow Sphere - Middle Left */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ top: '32%', left: '-42%' }} // Moved further out
            animate={{ 
              x: [0, -8, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 4.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            onMouseEnter={(e) => handleTechHover('TensorFlow', e)}
            onMouseLeave={handleTechLeave}
            whileHover={{ scale: 1.1 }}
          >
            <LiquidGlass
              width={70} // Increased size
              height={70} // Increased size
              positioning="relative"
              style={{ borderRadius: '24px' }}
              aberrationIntensity={0.2}
              elasticity={0.3}
              blurAmount={6}
              saturation={140}
              displacementScale={25}
              mode='shader'
            >
              <img src="/tensorflow-logo.png" alt="TensorFlow" className="w-9 h-9" />
            </LiquidGlass>
          </motion.div>

          {/* JavaScript Sphere - Middle Right */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ top: '45%', right: '-35%' }} // Moved further out
            animate={{ 
              x: [0, 8, 0],
              y: [0, -5, 0]
            }}
            transition={{ 
              duration: 3.8, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1.5
            }}
            onMouseEnter={(e) => handleTechHover('JavaScript', e)}
            onMouseLeave={handleTechLeave}
            whileHover={{ scale: 1.1 }}
          >
            <LiquidGlass
              width={70} // Increased size
              height={70} // Increased size
              positioning="relative"
              style={{ borderRadius: '24px' }}
              aberrationIntensity={0.2}
              elasticity={0.3}
              blurAmount={6}
              saturation={140}
              displacementScale={25}
              mode='shader'
            >
              <img src="/js-logo.png" alt="JavaScript" className="w-9 h-9" />
            </LiquidGlass>
          </motion.div>

          {/* Additional Small Tech Spheres */}
          {/* Small sphere - Bottom Left */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ bottom: '15%', left: '-35%' }} // Moved further out
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
            onMouseEnter={(e) => handleTechHover('R', e)}
            onMouseLeave={handleTechLeave}
            whileHover={{ scale: 1.15 }}
          >
            <LiquidGlass
              width={70} // Increased size
              height={70} // Increased size
              positioning="relative"
              style={{ borderRadius: '24px' }}
              aberrationIntensity={0.2}
              elasticity={0.3}
              blurAmount={6}
              saturation={140}
              displacementScale={25}
              mode='shader'
            >
             <img src="/r-logo.png" alt="R" className="w-9 h-9" />
            </LiquidGlass>
          </motion.div>

          {/* Small sphere - Bottom Right */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ bottom: '20%', right: '-38%' }} // Moved further out
            animate={{ 
              rotate: [0, -8, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "linear"
            }}
            onMouseEnter={(e) => handleTechHover('SQL', e)}
            onMouseLeave={handleTechLeave}
            whileHover={{ scale: 1.15 }}
          >
            <LiquidGlass
              width={70} // Increased size
              height={70} // Increased size
              positioning="relative"
              style={{ borderRadius: '24px' }}
              aberrationIntensity={0.2}
              elasticity={0.3}
              blurAmount={6}
              saturation={140}
              displacementScale={25}
              mode='shader'
              overLight="auto"
            >
               <img src="/sql-logo.png" alt="SQL" className="w-9 h-9" />
            </LiquidGlass>
          </motion.div>
        </div>
      </div>
      </motion.div>
      </div>
      
      {/* Bottom Technology Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isLoading ? 0 : 1, 
          y: isLoading ? 20 : 0 
        }}
        transition={{ 
          duration: 0.8, 
          ease: 'easeOut',
          delay: isLoading ? 0 : 1
        }}
        className="w-full max-w-4xl mt-8 lg:absolute lg:bottom-8 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:mt-0"
      >
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 sm:gap-x-6 md:gap-x-8 px-4 text-white/80 text-sm font-medium">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">ML & AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">DEPLOYMENT</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">DEVELOPMENT</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">WEB DESIGN</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="[text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">RESEARCH</span>
          </div>
        </div>
      </motion.div>
    </section>
    </>
  );
};

export default React.memo(HeroSection);