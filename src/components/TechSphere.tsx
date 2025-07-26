// src/components/TechSphere.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const TechBubble: React.FC<TechBubbleProps> = ({ logo, size, style, alt, delay, url, description }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling up to parent containers
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      className="tech-bubble"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -12, 0], // Floating animation
      }}
      transition={{
        opacity: { duration: 0.7, delay },
        scale: { duration: 0.7, delay },
        y: {
          duration: Math.random() * 2 + 3, // Randomize duration for natural feel
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + Math.random(),
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
      {/* Tooltip with LiquidGlass effect */}
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
                width={description.length * 8 + 20}
                height={35}
                positioning="relative"
                style={{ 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
                }}
                aberrationIntensity={0.2}
                elasticity={0.3}
                blurAmount={6}
                saturation={120}
                displacementScale={15}
                mode='shader'
            >
                <span className="text-white text-xs font-medium px-2 py-1 [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
                {description}
                </span>
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>
      
      <LiquidGlass
        width={size}
        height={size}
        positioning="relative"
        style={{
          borderRadius: '50%', // Perfect circle
          cursor: 'pointer',
        }}
        className="hover:bg-white/10"
        aberrationIntensity={0.8}
        elasticity={0.2}
        blurAmount={8}
        saturation={130}
        displacementScale={20}
        mode='shader'
      >
        <img
          src={logo}
          alt={alt}
          style={{
            width: '55%',
            height: '55%',
            objectFit: 'contain',
            transition: 'filter 0.3s ease',
            filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
          }}
        />
      </LiquidGlass>
    </motion.div>
  );
};

// Main component for the technology sphere
const TechSphere: React.FC = () => {
  const bubbles: TechBubbleProps[] = [
    { 
      logo: '/react-logo.png', 
      size: 80, 
      style: { top: '8%', left: '15%' }, // Moved slightly further
      alt: 'React', 
      delay: 0.2,
      url: 'https://reactjs.org',
      description: 'React.js',
    },
    { 
      logo: '/tensorflow-logo.png', 
      size: 75, 
      style: { top: '40%', left: '10%' }, // Moved slightly further
      alt: 'TensorFlow', 
      delay: 0.4,
      url: 'https://tensorflow.org',
      description: 'TensorFlow',
    },
    { 
      logo: '/python-logo.png', 
      size: 85, 
      style: { bottom: '15%', left: '15%' }, // Moved slightly further
      alt: 'Python', 
      delay: 0.6,
      url: 'https://python.org',
      description: 'Python',
    },
    { 
      logo: '/js-logo.png', 
      size: 70, 
      style: { top: '12%', right: '18%' }, // Moved slightly further
      alt: 'JavaScript', 
      delay: 0.3,
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      description: 'JavaScript',
    },
    { 
      logo: '/vite.svg', 
      size: 75, 
      style: { top: '45%', right: '15%' }, // Moved slightly further
      alt: 'Vite', 
      delay: 0.5,
      url: 'https://vitejs.dev',
      description: 'Vite',
    },
    { 
      logo: '/react-logo.png', 
      size: 65, 
      style: { bottom: '18%', right: '18%' }, // Moved slightly further
      alt: 'React Native', 
      delay: 0.7,
      url: 'https://reactnative.dev',
      description: 'React Native',
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
            width={350}
            height={500}
            positioning="relative"
            style={{
              borderRadius: '24px',
            }}
            elasticity={0.2}
            blurAmount={10}
            saturation={140}
            aberrationIntensity={0.4}
            displacementScale={40}
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
                borderRadius: '24px', // Keep border radius consistent with the container
                transform: 'scale(0.92)', // Apply the scale to create the gap
                transition: 'transform 0.3s ease-out',
              }}
            />
          </LiquidGlass>
        </motion.div>
      </div>

      {/* Floating Tech Bubbles */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="relative w-full h-full">
            {bubbles.map((bubble, index) => (
                <TechBubble key={index} {...bubble} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default TechSphere;
