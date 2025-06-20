// src/components/HeroSection.tsx
import React from 'react';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  return (
    // The section now uses flexbox to position the content block
    <section id="about" className="h-screen flex items-center px-12 md:px-20 lg:px-32">
      {/* The motion.div contains all the text content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-left" // Aligns all text to the left
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
            <button className="px-6 py-2 border border-white/70 rounded-full hover:bg-white/10 transition-all duration-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
              View My Work
            </button>
            <button className="px-6 py-2 border border-white/70 rounded-full hover:bg-white/10 transition-all duration-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
              Get In Touch
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default React.memo(HeroSection);