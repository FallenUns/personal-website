// src/components/HeroSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import { useLoading, useComponentLoader } from '../contexts/LoadingContext';
import './TechSphere.css';

// --- TechSphere Component (inlined) ---
// Define the properties for a single tech bubble
interface TechBubbleProps {
  logo: string;
  size: number;
  style: React.CSSProperties;
  alt: string;
  delay: number;
  url?: string;
  description?: string;
}

const TechBubble: React.FC<TechBubbleProps> = ({ logo, size, style, alt, delay, url, description }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <motion.div
      className="tech-bubble"
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -10, 0],
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        scale: { duration: 0.6, delay },
        y: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay + 1,
        },
      }}
      whileHover={{ scale: 1.15, zIndex: 10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        ...style,
        cursor: url ? 'pointer' : 'default',
      }}
    >
      {/* Tooltip */}
      {isHovered && description && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap z-20"
        >
          {description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90" />
        </motion.div>
      )}

      <LiquidGlass
        width={size}
        height={size}
        positioning="relative"
        style={{
          borderRadius: '99px',
          cursor: 'pointer',
        }}
        className="hover:bg-white/10"
        aberrationIntensity={1.2}
        elasticity={0.2}
        blurAmount={12}
        saturation={150}
        displacementScale={25}
        mode="shader"
      >
        <img
          src={logo}
          alt={alt}
          style={{
            width: '60%',
            height: '60%',
            objectFit: 'contain',
            filter: isHovered ? 'brightness(1.1)' : 'brightness(1)',
          }}
        />
      </LiquidGlass>
    </motion.div>
  );
};

// Main component for the technology sphere
const TechSphere: React.FC = () => {
  const bubbles = [
    {
      logo: '/react-logo.png',
      size: 90,
      style: { top: '15%', left: '15%' },
      alt: 'React',
      delay: 0.2,
      url: 'https://reactjs.org',
      description: 'React - A JavaScript library for building user interfaces',
    },
    {
      logo: '/tensorflow-logo.png',
      size: 85,
      style: { top: '35%', left: '5%' },
      alt: 'TensorFlow',
      delay: 0.4,
      url: 'https://tensorflow.org',
      description: 'TensorFlow - Machine Learning platform',
    },
    {
      logo: '/python-logo.png',
      size: 95,
      style: { bottom: '20%', left: '10%' },
      alt: 'Python',
      delay: 0.6,
      url: 'https://python.org',
      description: 'Python - Programming language for data science & AI',
    },
    {
      logo: '/js-logo.png',
      size: 80,
      style: { top: '10%', right: '15%' },
      alt: 'JavaScript',
      delay: 0.3,
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      description: 'JavaScript - The language of the web',
    },
    {
      logo: '/vite.svg',
      size: 85,
      style: { top: '40%', right: '5%' },
      alt: 'Vite',
      delay: 0.5,
      url: 'https://vitejs.dev',
      description: 'Vite - Next generation frontend tooling',
    },
    {
      logo: '/react-logo.png',
      size: 75,
      style: { bottom: '15%', right: '20%' },
      alt: 'React Native',
      delay: 0.7,
      url: 'https://reactnative.dev',
      description: 'React Native - Build mobile apps with React',
    },
  ];

  return (
    <div className="tech-sphere-container">
      {/* Central Portrait with LiquidGlass Effect */}
      <div className="central-portrait-container">
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <LiquidGlass
            width={300}
            height={450}
            positioning="relative"
            style={{
              borderRadius: '24px',
            }}
            elasticity={0.2}
            blurAmount={12}
            saturation={150}
            aberrationIntensity={1.5}
            displacementScale={35}
            mode="shader"
          >
            <img
              src="/Subject.png"
              alt="Patrick Adrianus"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                borderRadius: '20px',
              }}
            />
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Floating Tech Bubbles */}
      {bubbles.map((bubble, index) => (
        <TechBubble key={index} {...bubble} />
      ))}
    </div>
  );
};

const HeroSection: React.FC = () => {
  useComponentLoader('HeroSection');
  const { isLoading } = useLoading();

  const scrollToSection = (sectionId: string) => {
    console.log(`${sectionId} button clicked`);
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      console.log(`${sectionId} section found:`, targetSection);
      
      // With scroll-snap removed, this should work smoothly
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
              Hello! I'm Patrick, I'm a <span className="font-semibold">UX leader, design thinker, product designer,</span> experience strategist, generative artist & human-loving introvert
            </p>
            
            {/* Key Points */}
            <div className="mb-8 space-y-2">
              <div className="flex items-center text-white/90">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Product must be authentic</span>
              </div>
              <div className="flex items-center text-white/90">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Solve pain points elegantly</span>
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

      {/* Right side - TechSphere - Always rendered but hidden during loading */}
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
        <TechSphere />
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
  );
};

export default React.memo(HeroSection);