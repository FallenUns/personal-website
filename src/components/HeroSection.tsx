// src/components/HeroSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useLoading, useComponentLoader } from '../contexts/LoadingContext';
import TechSphere from './TechSphere'; // Import the new component

const HeroSection: React.FC = () => {
  useComponentLoader('HeroSection');
  const { isLoading } = useLoading();

  const scrollToSection = (sectionId: string) => {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
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
              {/* Greeting */}
              <div className="flex items-center mb-4">
                <span className="text-5xl mr-3 wave-animation">👋</span>
              </div>

              {/* Main Title */}
              <h1 className="text-5xl md:text-6xl font-bold mb-4 [text-shadow:0_2px_5px_rgba(0,0,0,1)]">
                Hello! I'm Patrick
              </h1>

              {/* Subtitle with decorative element */}
              <div className="flex items-center mb-6">
                <div className="w-18 h-0.5 bg-white/60 mr-4"></div>
                <span className="text-lg font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                  Data Scientist ✦
                </span>
              </div>

              {/* Description */}
              <p className="text-base text-white/90 max-w-xl mb-6 [text-shadow:0_1px_4px_rgba(0,0,0,1)]">
                I'm a passionate Data Scientist and developer with a love for creating elegant, data-driven solutions and intuitive user experiences.
              </p>

              {/* Key Points */}
              <div className="mb-8 space-y-2">
                <div className="flex items-center text-white/90">
                  <span className="text-green-400 mr-3">✓</span>
                  <span className="text-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Building authentic, impactful products</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="text-green-400 mr-3">✓</span>
                  <span className="text-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Solving complex problems elegantly</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="text-green-400 mr-3">✓</span>
                  <span className="text-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">User testing, feedback, and validation</span>
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
                  onClick={() => scrollToSection('contact')}
                >
                  <span className="font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                    Let's Talk
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
                    Download CV
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </span>
                </LiquidGlass>
              </div>
            </div>
          </motion.div>

          {/* Right side - Refactored to use TechSphere component */}
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
                {/* The TechSphere component now handles the portrait and all floating icons */}
                <TechSphere />
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
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl"
        >
          <div className="flex justify-center items-center space-x-8 text-white/80 text-sm font-medium">
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
