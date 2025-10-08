import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';

const CircularLoader: React.FC = () => {
  const { progress } = useLoading();
  
  // Fun loading messages that change based on progress
  const loadingMessages = [
    { range: [0, 15], text: "🔥 Heating the furnace...", subtext: "Reaching 1100°C for molten glass" },
    { range: [15, 30], text: "� Gathering molten glass...", subtext: "Collecting the perfect amount" },
    { range: [30, 45], text: "🌪️ Shaping the form...", subtext: "Blowing and molding with precision" },
    { range: [45, 60], text: "✨ Adding crystalline details...", subtext: "Crafting intricate patterns" },
    { range: [60, 75], text: "🔧 Refining the edges...", subtext: "Polishing to perfection" },
    { range: [75, 90], text: "❄️ Cooling in the annealer...", subtext: "Slowly tempering the glass" },
    { range: [90, 100], text: "💎 Masterpiece complete!", subtext: "Welcome to my digital atelier" }
  ];
  
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [dots, setDots] = useState("");
  
  // Update message based on progress
  useEffect(() => {
    const validProgress = Math.max(0, Math.min(100, progress || 0));
    const newMessage = loadingMessages.find(msg => 
      validProgress >= msg.range[0] && validProgress < msg.range[1]
    ) || loadingMessages[loadingMessages.length - 1];
    
    if (newMessage !== currentMessage) {
      setCurrentMessage(newMessage);
    }
  }, [progress]);
  
  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  // Calculate the stroke offset. As progress goes from 0 to 100, the offset goes from circumference to 0.
  // Ensure progress is always a valid number to prevent undefined values
  const validProgress = Math.max(0, Math.min(100, progress || 0));
  const strokeOffset = circumference - (validProgress / 100) * circumference;

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center space-y-6"
      key="loader"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ duration: 0.4 }}
    >
      {/* Main loading text with smooth animation */}
      <motion.div
        className="text-center mb-4"
        key={currentMessage.text}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-white mb-2 [text-shadow:0_2px_4px_rgba(0,0,0,0.3)]"
          animate={{ 
            scale: [1, 1.02, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {currentMessage.text}{dots}
        </motion.h2>
        
        <motion.p 
          className="text-lg text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {currentMessage.subtext}
        </motion.p>
      </motion.div>

      {/* Circular progress loader */}
      <motion.div
        className="relative w-32 h-32 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <svg className="w-full h-full" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle with gradient */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
          </defs>
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            // Animate the strokeDashoffset property with smooth transitions
            initial={{ strokeDashoffset: circumference }} // Set initial value to prevent warning
            animate={{ strokeDashoffset: strokeOffset }}
            transition={{ 
              duration: 0.8, // Increased duration for smoother transitions
              ease: "easeInOut" // Smoother easing
            }}
            style={{
              filter: 'drop-shadow(0 0 6px rgba(164, 139, 250, 0.4))'
            }}
          />
        </svg>
        
        {/* Percentage Text with pulsing animation */}
        <motion.div
          className="absolute flex flex-col items-center"
          key={Math.floor(validProgress / 10)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            className="text-2xl font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {`${Math.floor(validProgress)}%`}
          </motion.span>
          
          {/* Small glassmaking emoji that spins */}
          <motion.span
            className="text-sm mt-1"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            🫧
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CircularLoader;