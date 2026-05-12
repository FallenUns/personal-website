// src/components/HeroSection.tsx
import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useLoading, useComponentLoader } from '../contexts/LoadingContext';
import { PreloadedImage } from '../utils/preloadedImageHooks';
import { scrollToSection } from '../utils/navigation';
import { useMagnetic } from '../hooks/useMagnetic';
import DecryptedText from './animations/DecryptedText';
import RotatingText from './animations/RotatingText';
import CursorSpotlight from './animations/CursorSpotlight';

const HeroSection: React.FC = () => {
  useComponentLoader('HeroSection');
  const { isLoading } = useLoading();

  // State for tooltip
  const [hoveredTech, setHoveredTech] = React.useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  // Local boolean that drives DecryptedText's trigger mode. We OR it with
  // `!isLoading` so the reveal happens once after the loader fades, and
  // each click on the headline replays the decrypt by briefly flipping
  // this back to false then true.
  const [replayTick, setReplayTick] = React.useState(0);
  const handleReplayName = React.useCallback(() => {
    setReplayTick((t) => t + 1);
  }, []);

  // Trigger composition: stays false while loading, then true after load.
  // `replayTick` increments on click; we use its parity to flip the boolean.
  const nameTrigger = !isLoading && replayTick % 2 === 0;
  // Only odd ticks need the follow-up increment. A click bumps tick → odd
  // (falling edge of nameTrigger). One RAF later we bump again → even
  // (rising edge of nameTrigger), which re-runs the decrypt. Even ticks
  // are the stable state and don't schedule another increment, so the
  // chain terminates after two transitions per click instead of looping.
  React.useEffect(() => {
    if (replayTick === 0 || replayTick % 2 === 0) return;
    const raf = requestAnimationFrame(() => setReplayTick((t) => t + 1));
    return () => cancelAnimationFrame(raf);
  }, [replayTick]);

  // Mouse-driven hero parallax — the text drifts left/down and the portrait
  // counter-tilts right/up, creating a soft 3D parallax that tracks the cursor.
  // Springs keep the motion fluid even when the cursor moves abruptly.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 90, damping: 18, mass: 0.6 });
  const textTx = useTransform(sx, (v) => v * -14);
  const textTy = useTransform(sy, (v) => v * -8);
  const portraitTx = useTransform(sx, (v) => v * 18);
  const portraitTy = useTransform(sy, (v) => v * 10);
  const portraitRotY = useTransform(sx, (v) => v * 6);
  const portraitRotX = useTransform(sy, (v) => v * -5);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mx, my]);

  // Magnetic refs for the two CTAs.
  const projectsBtnRef = useMagnetic<HTMLDivElement>({ strength: 0.4, radius: 160 });
  const resumeBtnRef = useMagnetic<HTMLDivElement>({ strength: 0.4, radius: 160 });

  // Scroll-scrubbed fade for the hero content. As the section scrolls out
  // upward the inner stage scales down slightly, drifts up, and fades — the
  // page beneath then takes the foreground.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(heroProgress, [0, 0.65, 1], [1, 1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.92]);
  const heroLift = useTransform(heroProgress, [0, 1], [0, -60]);

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
            blurAmount={3}
            saturation={120}
            displacementScale={15}
            mode='shader'
            overLight={false}
          >
            <span className="text-white text-xs font-medium px-2 py-1 [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
              {hoveredTech}
            </span>
          </LiquidGlass>
        </div>
      )}

      <section ref={heroRef} id="about" className="min-h-[100svh] lg:h-[100svh] box-border flex flex-col lg:flex-row items-start lg:items-center justify-center px-5 sm:px-10 md:px-16 lg:px-32 pt-24 pb-8 sm:pb-10 lg:pt-20 lg:pb-20 relative overflow-hidden">
        {/* Pure-visual cursor-tracked spotlight — pointer-events:none so it
            never blocks clicks; lives behind the content (z-index 0). */}
        <CursorSpotlight />
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroLift }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full max-w-[1720px] mx-auto mt-0 gap-8 lg:gap-10"
        >
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
            style={{ x: textTx, y: textTy }}
            className="text-left flex-1 max-w-[560px] w-full lg:w-auto"
          >
            <div className="text-white">
              {/* Eyebrow tag */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 12 : 0 }}
                transition={{ duration: 0.6, delay: isLoading ? 0 : 0.55 }}
                className="flex items-center gap-3 mb-5"
              >
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                  <span className="text-xl wave-animation leading-none">👋</span>
                </span>
                <span className="hero-eyebrow shiny-text [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                  Hello, my name is
                </span>
              </motion.div>

              {/* Display headline — the name decrypts character-by-character from
                  the centre outward when the hero comes into view. Real text is
                  preserved for screen readers via DecryptedText's sr-only span. */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 16 : 0 }}
                transition={{ duration: 0.7, delay: isLoading ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="hero-display mb-5"
              >
                <DecryptedText
                  text="PATRICK ADRIANUS"
                  animateOn="trigger"
                  trigger={nameTrigger}
                  sequential
                  revealDirection="center"
                  speed={55}
                  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#%&@"
                  parentClassName="block name cursor-pointer select-none"
                  className="name-char"
                  encryptedClassName="name-char-dim"
                  onClick={handleReplayName}
                />
              </motion.h1>

              {/* Subtitle — the role cycles through a list, animating each
                  character on enter/exit with a spring stagger. Reads as
                  alive without being noisy. */}
              <div className="flex items-center justify-start mb-5">
                <div className="w-14 h-0.5 bg-white/60 mr-3"></div>
                <RotatingText
                  texts={[
                    'Data Scientist',
                    'Full-Stack Developer',
                    'AI Engineer',
                  ]}
                  rotationInterval={2400}
                  staggerDuration={0.022}
                  staggerFrom="last"
                  splitBy="characters"
                  auto
                  loop
                  mainClassName="text-base sm:text-lg font-medium font-body-grotesk inline-flex"
                  splitLevelClassName="overflow-hidden"
                  elementLevelClassName="gradient-text"
                  transition={{ type: 'spring', damping: 28, stiffness: 360 }}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '-110%', opacity: 0 }}
                />
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-white/90 max-w-xl mb-6 [text-shadow:0_1px_4px_rgba(0,0,0,1)]">
                Hello! I’m Patrick, a <span className="font-semibold">Data Scientist</span> who loves building projects from apps and data solutions to creative tools and always experimenting with new technologies and development frameworks to turn fresh ideas into real-world impact.
              </p>

              {/* Key Points */}
              <div className="mb-8 space-y-2 max-w-sm">
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
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">

                <div ref={projectsBtnRef} style={{ willChange: 'transform' }}>
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
                    blurAmount={6}
                    saturation={150}
                    displacementScale={35}
                    mode='shader'
                    overLight={false}
                    onClick={() => scrollToSection('projects')}
                  >
                    <span className="font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                      My Projects
                    </span>
                  </LiquidGlass>
                </div>

                {/* Download Resume Button - Transparent with border */}
                <div ref={resumeBtnRef} style={{ willChange: 'transform' }}>
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
                    blurAmount={6}
                    saturation={150}
                    displacementScale={35}
                    mode='shader'
                    overLight={false}
                    onClick={() => {
                      try {
                        window.open('/resume.pdf', '_blank');
                      } catch (error) {
                        console.error('Failed to open Resume:', error);
                        // Fallback to download
                        const link = document.createElement('a');
                        link.href = '/resume.pdf';
                        link.download = 'Patrick_Adrianus_Resume.pdf';
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
            className="w-full hidden sm:flex justify-center mt-6 lg:hidden"
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
                blurAmount={4}
                saturation={150}
                displacementScale={80}
                overLight={false}
                mode='shader'
              >
                <PreloadedImage
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
                  blurAmount={3}
                  saturation={140}
                  displacementScale={20}
                  overLight={false}
                  mode='shader'
                >
                  <PreloadedImage src="/react-logo.png" alt="React" className="w-6 h-6" />
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
                  blurAmount={3}
                  saturation={140}
                  displacementScale={20}
                  overLight={false}
                  mode='shader'
                >
                  <PreloadedImage src="/python-logo.png" alt="Python" className="w-6 h-6" />
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
                  blurAmount={3}
                  saturation={140}
                  displacementScale={20}
                  overLight={false}
                  mode='shader'
                >
                  <PreloadedImage src="/js-logo.png" alt="JavaScript" className="w-6 h-6" />
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
                  blurAmount={3}
                  saturation={140}
                  displacementScale={20}
                  overLight={false}
                  mode='shader'
                >
                  <PreloadedImage src="/tensorflow-logo.png" alt="TensorFlow" className="w-6 h-6" />
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
                  blurAmount={3}
                  saturation={140}
                  displacementScale={18}
                  overLight={false}
                  mode='shader'
                >
                  <PreloadedImage src="/r-logo.png" alt="R" className="w-6 h-6" />
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
                  blurAmount={3}
                  saturation={140}
                  displacementScale={18}
                  overLight={false}
                  mode='shader'
                >
                  <PreloadedImage src="/sql-logo.png" alt="SQL" className="w-6 h-6" />
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
            style={{
              x: portraitTx,
              y: portraitTy,
              rotateY: portraitRotY,
              rotateX: portraitRotX,
              transformPerspective: 1200,
            }}
            className="flex-1 h-[68vh] min-h-[560px] max-h-[640px] max-w-4xl hidden lg:block"
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
                  blurAmount={4}
                  saturation={150}
                  displacementScale={120}
                  overLight={false}
                  mode='shader'
                >
                  <PreloadedImage
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
                    blurAmount={3}
                    saturation={140}
                    displacementScale={20}
                    overLight={false}
                    mode='shader'
                  >
                    <PreloadedImage src="/react-logo.png" alt="React" className="w-9 h-9" />
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
                    blurAmount={3}
                    saturation={140}
                    displacementScale={25}
                    overLight={false}
                    mode='shader'
                  >
                    <PreloadedImage src="/python-logo.png" alt="Python" className="w-9 h-9" />
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
                    blurAmount={3}
                    saturation={140}
                    displacementScale={25}
                    overLight={false}
                    mode='shader'
                  >
                    <PreloadedImage src="/tensorflow-logo.png" alt="TensorFlow" className="w-9 h-9" />
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
                    blurAmount={3}
                    saturation={140}
                    displacementScale={25}
                    overLight={false}
                    mode='shader'
                  >
                    <PreloadedImage src="/js-logo.png" alt="JavaScript" className="w-9 h-9" />
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
                    blurAmount={3}
                    saturation={140}
                    displacementScale={25}
                    overLight={false}
                    mode='shader'
                  >
                    <PreloadedImage src="/r-logo.png" alt="R" className="w-9 h-9" />
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
                    blurAmount={3}
                    saturation={140}
                    displacementScale={25}
                    overLight={false}
                    mode='shader'
                  >
                    <PreloadedImage src="/sql-logo.png" alt="SQL" className="w-9 h-9" />
                  </LiquidGlass>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

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
          className="w-full max-w-4xl mt-8 lg:absolute lg:bottom-16 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:mt-0"
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
