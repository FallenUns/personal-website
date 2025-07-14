import React from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useLoading, useComponentLoader } from '../contexts/LoadingContext';

const HeroSection: React.FC = () => {
  useComponentLoader('HeroSection'); // Register component for loading
  const { isLoading } = useLoading();

  return (
    <section id="about" className="h-screen flex items-center px-6 sm:px-12 md:px-20 lg:px-32 pt-20 relative">
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
        className="text-left"
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
                onClick={() => {
                  const projectsSection = document.getElementById('projects');
                  if (projectsSection) {
                    const navHeight = 0; // Account for navbar height and padding
                    const elementPosition = projectsSection.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - navHeight;

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
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
                onClick={() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      const navHeight = 0; // Account for navbar height and padding
                      const elementPosition = contactSection.getBoundingClientRect().top + window.pageYOffset;
                      const offsetPosition = elementPosition - navHeight;

                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }}
            >
                <span className="font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                    Get In Touch
                </span>
            </LiquidGlass>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default React.memo(HeroSection);