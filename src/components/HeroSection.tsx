// src/components/HeroSection.tsx

import React from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';

const HeroSection: React.FC = () => {
  return (
    <section id="about" className="h-screen flex items-center px-12 md:px-20 lg:px-32 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-left"
      >
        <div className="text-white">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
            Patrick Adrianus
          </h1>
          <h2 className="text-2xl md:text-3xl mb-6 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
            Data Scientist
          </h2>
          <p className="text-base text-white/90 max-w-xl mb-8 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            Recently Graduated Student with excelency in Python, ML, AI.
          </p>
          <div className="flex space-x-4">
            <LiquidGlass
                width={180}
                height={44}
                blur={4}
                positioning="relative"
                style={{ borderRadius: '9999px', cursor: 'pointer' }}
                className="border border-white/70 hover:bg-white/20 transition-all duration-300"
                aberrationIntensity={1}
                borderType='dynamic'
                borderWidth={1}
                edgeRefraction={0.5}
                isElastic={true}
                elasticity={0.2}                onClick={() => {
                  const projectsSection = document.getElementById('projects');
                  if (projectsSection) {
                    const navHeight = 100; // Account for navbar height and padding
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
                blur={4}
                positioning="relative"
                style={{ borderRadius: '9999px', cursor: 'pointer' }}
                className="border border-white/70 hover:bg-white/20 transition-all duration-300"
                aberrationIntensity={1}
                borderType='dynamic'
                borderWidth={1}
                edgeRefraction={0.5}
                isElastic={true}
                elasticity={0.2}                onClick={() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      const navHeight = 100; // Account for navbar height and padding
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