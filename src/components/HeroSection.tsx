import React from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';

const HeroSection: React.FC = () => {
  return (
    // Add pt-24 to give space for the fixed navbar
    <section className="h-screen flex flex-col items-center justify-center pt-24">
      {/* Centered card with LiquidGlass */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <LiquidGlass
          cornerRadius={32}
          padding="32px"
          elasticity={0.15}
          blurAmount={5}
          saturation={0}
          displacementScale={70}
          aberrationIntensity={2}
          mode="shader"
          style={{ width: '800px', height: '350px' }}
        >
          <div className="w-full text-center text-white">
            {/* UPDATED: Added text-shadow for readability */}
            <h1 className="text-5xl font-bold mb-4 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">Patrick Adrianus</h1>
            <h2 className="text-2xl mb-6 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">Data Scientist</h2>
            <p className="text-sm text-white/90 max-w-xl mx-auto mb-8 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
              Recently Graduated Student with excelency in Python, ML, AI.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-6 py-2 border border-white/70 rounded-lg hover:bg-white/10 transition [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                View My Work
              </button>
              <button className="px-6 py-2 border border-white/70 rounded-lg hover:bg-white/10 transition [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                Get In Touch
              </button>
            </div>
          </div>
        </LiquidGlass>
      </motion.div>
    </section>
  );
};

export default React.memo(HeroSection);