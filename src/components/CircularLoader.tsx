import React from 'react';
import { motion } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';

const CircularLoader: React.FC = () => {
  const { progress } = useLoading();
  
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  // Calculate the stroke offset. As progress goes from 0 to 100, the offset goes from circumference to 0.
  const strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      className="relative w-32 h-32 flex items-center justify-center"
      key="loader"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ duration: 0.4 }}
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
        {/* Progress circle */}
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          stroke="white"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          // Animate the strokeDashoffset property
          animate={{ strokeDashoffset: strokeOffset }}
          transition={{ duration: 0.2, ease: 'linear' }}
        />
      </svg>
      {/* Percentage Text */}
      <motion.span
        key={Math.floor(progress)}
        className="absolute text-2xl font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {`${Math.floor(progress)}%`}
      </motion.span>
    </motion.div>
  );
};

export default CircularLoader;