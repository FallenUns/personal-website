import React from 'react';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  return (
    // Add pt-24 to give space for the fixed navbar
    <section className="h-screen flex flex-col items-center justify-center pt-24">
      {/* Centered card */}
      <motion.div
        className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl shadow-lg p-8 max-w-3xl text-center text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* UPDATED: Added text-shadow for readability */}
        <h1 className="text-5xl font-bold mb-4 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">Your Name</h1>
        <h2 className="text-2xl mb-6 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">Full-Stack Developer</h2>
        <p className="text-sm text-white/90 max-w-xl mx-auto mb-8 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
          Passionate full-stack developer with 5+ years of experience building scalable web applications and elegant user interfaces.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="px-6 py-2 border border-white/70 rounded-lg hover:bg-white/10 transition [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            View My Work
          </button>
          <button className="px-6 py-2 border border-white/70 rounded-lg hover:bg-white/10 transition [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            Get In Touch
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;