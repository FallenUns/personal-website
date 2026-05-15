// src/components/TechSphere.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from './LiquidGlassLite';
import { PreloadedImage } from '../utils/preloadedImageHooks';
import './TechSphere.css';

// Hook to check if the viewport is mobile-sized
const useIsMobile = (breakpoint = 1024) => { // Changed breakpoint to 1024px for lg
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isMobile;
};

// Hook to responsively size the portrait
const useResponsivePortrait = () => {
    const [size, setSize] = useState({ width: 320, height: 460 });
    useEffect(() => {
        const updateSize = () => {
            if (window.innerWidth < 768) { 
                setSize({ width: 250, height: 360 });
            } else if (window.innerWidth < 1024) {
                 setSize({ width: 280, height: 400 });
            }
            else {
                setSize({ width: 320, height: 460 });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
};

// Define the properties for a single tech bubble
interface TechBubbleProps {
  logo: string;
  size: number;
  style: React.CSSProperties;
  alt: string;
  delay: number;
  url?: string;
  description?: string;
  isFloating?: boolean; 
}

const TechBubble: React.FC<TechBubbleProps> = ({ logo, size, style, alt, delay, url, description, isFloating = true }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const animateProps = isFloating ? { opacity: 1, scale: 1, y: [0, -12, 0] } : { opacity: 1, scale: 1 };
  const transitionProps = isFloating ? {
    opacity: { duration: 0.7, delay },
    scale: { duration: 0.7, delay },
    y: { duration: Math.random() * 2 + 3, repeat: Infinity, ease: "easeInOut" as const, delay: delay + Math.random() }
  } : { opacity: { duration: 0.7 }, scale: { duration: 0.7 } };

  return (
    <motion.div
      className="tech-bubble"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={animateProps}
      transition={transitionProps}
      whileHover={{ scale: 1.15, zIndex: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={style}
    >
      <AnimatePresence>
        {isHovered && description && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-14 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
          >
             <LiquidGlass
                width={description.length * 8 + 20} height={35}
                positioning="relative" style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aberrationIntensity={0.2} elasticity={0.3} blurAmount={3} saturation={120} displacementScale={15} mode='shader'
            >
                <span className="text-white text-xs font-medium px-2 py-1 [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">{description}</span>
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>
      <LiquidGlass
        width={size} height={size}
        positioning="relative" style={{ borderRadius: '50%', cursor: 'pointer' }}
        className="hover:bg-white/10"
        aberrationIntensity={0.8}
        elasticity={0.2}
        blurAmount={4}
        saturation={130}
        displacementScale={30}
        mode='shader'
      >
        <PreloadedImage
          src={logo} alt={alt}
          style={{ width: '55%', height: '55%', objectFit: 'contain', transition: 'filter 0.3s ease', filter: isHovered ? 'brightness(1.2) drop-shadow(0 0 5px rgba(255,255,255,0.5))' : 'brightness(1)' }}
        />
      </LiquidGlass>
    </motion.div>
  );
};

// Main component for the technology sphere
const TechSphere: React.FC = () => {
  const isMobile = useIsMobile();
  const { width: portraitWidth, height: portraitHeight } = useResponsivePortrait();
  const containerClassName = isMobile ? 'tech-sphere-container is-mobile' : 'tech-sphere-container is-desktop';

  const bubbles: Omit<TechBubbleProps, 'isFloating'>[] = [
    { logo: '/react-logo.png', size: 80, style: { top: '8%', left: '15%' }, alt: 'React', delay: 0.2, url: '[https://reactjs.org](https://reactjs.org)', description: 'React.js' },
    { logo: '/tensorflow-logo.png', size: 75, style: { top: '40%', left: '0%' }, alt: 'TensorFlow', delay: 0.4, url: '[https://tensorflow.org](https://tensorflow.org)', description: 'TensorFlow' },
    { logo: '/python-logo.png', size: 85, style: { bottom: '15%', left: '20%' }, alt: 'Python', delay: 0.6, url: '[https://python.org](https://python.org)', description: 'Python' },
    { logo: '/js-logo.png', size: 70, style: { top: '12%', right: '18%' }, alt: 'JavaScript', delay: 0.3, url: '[https://developer.mozilla.org/en-US/docs/Web/JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)', description: 'JavaScript' },
    { logo: '/react-logo.png', size: 65, style: { bottom: '18%', right: '22%' }, alt: 'React Native', delay: 0.7, url: '[https://reactnative.dev](https://reactnative.dev)', description: 'React Native' },
  ];

  return (
    <div className={containerClassName}>
      {/* Central Portrait Container */}
      <div className="central-portrait-container">
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          style={{ width: portraitWidth, height: portraitHeight }}
        >
          {/* Background Liquid Glass */}
          <motion.div 
            className="absolute inset-0"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            <LiquidGlass
              width={portraitWidth} height={portraitHeight}
              positioning="absolute" style={{ borderRadius: '24px' }}
              elasticity={0.1} blurAmount={8} saturation={120} aberrationIntensity={0.5} displacementScale={80} mode='shader'
            />
          </motion.div>
          
          {/* Portrait Image */}
          <motion.img
            src="/Subject.png" alt="Patrick Adrianus"
            initial={{ clipPath: 'inset(0% 50% 0% 50%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              objectPosition: 'center top', 
              borderRadius: '24px', 
              position: 'relative', // Ensure it's on top of the absolute background
              zIndex: 10,
              boxShadow: '0 10px 30px -5px rgba(0,0,0,0.3)',
            }}
          />
        </motion.div>
      </div>

      {/* Render bubbles based on screen size */}
      {isMobile ? (
        <motion.div 
          className="mobile-bubbles-scroll-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {bubbles.map((bubble, index) => (
            <div key={index} className="mobile-bubble-item">
              <TechBubble {...bubble} size={70} style={{}} isFloating={false} />
            </div>
          ))}
        </motion.div>
      ) : (
        <>
          {bubbles.map((bubble, index) => (
            <TechBubble key={index} {...bubble} isFloating={true} />
          ))}
        </>
      )}
    </div>
  );
};

export default TechSphere;