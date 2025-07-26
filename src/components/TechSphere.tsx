// src/components/TechSphere.tsx
import React from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import './TechSphere.css';

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

const TechBubble: React.FC<TechBubbleProps> = ({ logo, size, style, alt, delay, url, description}) => {
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
          ease: "easeInOut",
          delay: delay + 1
        }
      }}
      whileHover={{ scale: 1.15, zIndex: 10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        ...style,
        cursor: url ? 'pointer' : 'default'
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
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
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
        mode='shader'
      >
        <img 
          src={logo} 
          alt={alt} 
          style={{ 
            width: '60%', 
            height: '60%', 
            objectFit: 'contain',
            filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
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
              mode='shader'
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

export default TechSphere;