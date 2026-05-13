import React from "react";
import { motion } from 'framer-motion';
import LiquidGlass from "./LiquidGlass";
import { useLoading, useComponentLoader } from '../contexts/LoadingContext';
import { StickySectionBackground } from './visuals/SectionBackground';
import { hudLog } from '../hooks/useHudBus';

const Contact: React.FC = () => {
  useComponentLoader('ContactSection'); // Register component for loading
  const { isLoading } = useLoading();

  return (
    <motion.section
      id="contact"
      className="relative min-h-screen h-auto flex flex-col justify-between py-12 sm:py-16 px-4 sm:px-6 w-full pt-24"
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
      <StickySectionBackground variant="contact" />
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="text-white text-center">
          <motion.div
            className="flex justify-center mb-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 8 : 0 }}
            transition={{ duration: 0.5, delay: isLoading ? 0 : 1.0 }}
          >
            <span className="hero-eyebrow inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
              Say hello
            </span>
          </motion.div>
          <motion.h2
            className="relative inline-block font-display font-extrabold text-[clamp(2.5rem,6.4vw,5.5rem)] leading-[0.95] tracking-[-0.04em] mb-5 [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: isLoading ? 0 : 1.2 }}
          >
            <span className="relative inline-block">
              Get In Touch
            </span>
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg mb-8 font-body-grotesk [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]"
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
              aberrationIntensity={1.2}
              elasticity={0.15}
              blurAmount={6}
              saturation={150}
              displacementScale={60}
              mode='shader'
              onClick={() => {
                hudLog('> contact.email compose', 'ok');
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
              aberrationIntensity={1.2}
              elasticity={0.15}
              blurAmount={3}
              saturation={150}
              displacementScale={60}
              mode='shader'
              onClick={() => {
                hudLog('> contact.linkedin open', 'ok');
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
        className="relative z-10 text-center text-white/60 text-xs sm:text-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] px-20 sm:px-0 pb-20 sm:pb-4"
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
