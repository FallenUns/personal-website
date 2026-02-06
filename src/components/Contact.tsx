import React from "react";
import { motion } from 'framer-motion';
import LiquidGlass from "./LiquidGlass";
import { useLoading, useComponentLoader } from '../contexts/LoadingContext';

const Contact: React.FC = () => {
  useComponentLoader('ContactSection'); // Register component for loading
  const { isLoading } = useLoading();

  return (
    <motion.section
      id="contact"
      className="min-h-screen h-auto flex flex-col justify-between py-12 sm:py-16 px-4 sm:px-6 w-full pt-24"
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: isLoading ? 0 : 1,
        y: isLoading ? 30 : 0
      }}
      transition={{
        duration: 0.8,
        ease: 'easeOut',
        delay: isLoading ? 0 : 1.0
      }}
    >
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-6 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isLoading ? 0 : 1,
              y: isLoading ? 20 : 0
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
              delay: isLoading ? 0 : 1.2
            }}
          >
            Get In Touch
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg mb-8 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isLoading ? 0 : 1,
              y: isLoading ? 20 : 0
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
              delay: isLoading ? 0 : 1.4
            }}
          >
            Let's work together on your next project.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isLoading ? 0 : 1,
              y: isLoading ? 20 : 0
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
              delay: isLoading ? 0 : 1.6
            }}
          >
            <LiquidGlass
              width={180}
              height={44}
              positioning="relative"
              style={{ borderRadius: '9999px', cursor: 'pointer' }}
              className="hover:bg-white/20"
              aberrationIntensity={2}
              elasticity={0.1}
              blurAmount={8}
              saturation={150}
              displacementScale={30}
              mode='shader'
              onClick={() => {
                window.location.href = 'mailto:patrickadrianus04@gmail.com';
              }}
              overLight={false}
            >
              <span className="px-6 py-3 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] flex items-center justify-center h-full">
                Email Me
              </span>
            </LiquidGlass>

            <LiquidGlass
              width={180}
              height={44}
              positioning="relative"
              style={{ borderRadius: '9999px', cursor: 'pointer' }}
              className="hover:bg-white/20"
              aberrationIntensity={2}
              elasticity={0.2}
              blurAmount={12}
              saturation={150}
              displacementScale={30}
              mode='shader'
              onClick={() => {
                window.open('https://linkedin.com/in/patrick-adrianus', '_blank');
              }}
              overLight={false}
            >
              <span className="px-6 py-3 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] flex items-center justify-center h-full">
                LinkedIn
              </span>
            </LiquidGlass>
          </motion.div>
        </div>
      </div>

      {/* Copyright Footer - Fixed at bottom */}
      <motion.div
        className="text-center text-white/60 text-xs sm:text-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] px-20 sm:px-0 pb-20 sm:pb-4"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoading ? 0 : 1
        }}
        transition={{
          duration: 0.6,
          ease: 'easeOut',
          delay: isLoading ? 0 : 1.8
        }}
      >
        © {new Date().getFullYear()} Patrick Adrianus. All rights reserved.
      </motion.div>
    </motion.section>
  );
}

export default Contact;
