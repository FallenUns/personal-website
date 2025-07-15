import React from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import TechSphere from './TechSphere';
import { useLoading, useComponentLoader } from '../contexts/LoadingContext';

const HeroSection: React.FC = () => {
  useComponentLoader('HeroSection');
  const { isLoading } = useLoading();

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
    <section id="about" className="h-screen flex items-center px-6 sm:px-12 md:px-20 lg:px-32 pt-20 relative">
      <div className="flex items-center justify-between w-full">
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
          className="text-left flex-1 max-w-2xl"
        >
          <div className="text-white">
             <h1 className="text-5xl md:text-6xl font-bold [text-shadow:0_2px_5px_rgba(0,0,0,1)]">
              PATRICK ADRIANUS
            </h1>
            <h2 className="text-2xl md:text-3xl mb-6 [text-shadow:0_2px_5px_rgba(0,0,0,1)]">
              Data Scientist
            </h2>
            <p className="text-base text-white/90 max-w-xl mb-8 [text-shadow:0_1px_4px_rgba(0,0,0,1)]">
              Recently Graduated Student with excelency in Python, ML, AI.
            </p>
            <div className="flex space-x-4">
            <LiquidGlass
                width={180}
                height={44}
                positioning="relative"
                style={{ borderRadius: '9999px', cursor: 'pointer' }}
                className="hover:bg-white/20"
                aberrationIntensity={1}
                elasticity={0.2}
                blurAmount={12}
                saturation={150}
                displacementScale={50}
                mode='shader'
                onClick={() => scrollToSection('projects')}
            >
                <span className="font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                    View My Work
                </span>
            </LiquidGlass>
            <LiquidGlass
                width={180}
                height={44}
                positioning="relative"
                style={{ borderRadius: '9999px', cursor: 'pointer' }}
                className="hover:bg-white/20"
                aberrationIntensity={1}
                elasticity={0.2}
                blurAmount={12}
                saturation={150}
                displacementScale={50}
                mode='shader'
                onClick={() => scrollToSection('contact')}
            >
                <span className="font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                    Get In Touch
                </span>
            </LiquidGlass>
          </div>
        </div>
      </motion.div>

      {/* Right side - TechSphere - Always rendered but hidden during loading */}
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
        <TechSphere />
      </motion.div>
      </div>
    </section>
  );
};

export default React.memo(HeroSection);