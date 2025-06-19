import React from 'react';
import { motion } from 'framer-motion';

interface FrostedGlassCardProps {
  title: string;
  content: string;
}

const FrostedGlassCard: React.FC<FrostedGlassCardProps> = ({ title, content }) => {
  return (
    <motion.div
      className="relative backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 rounded-2xl shadow-lg p-6 max-w-md mx-auto text-white overflow-hidden"
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.25), transparent)',
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <h2 className="relative text-xl font-bold mb-2">{title}</h2>
      <p className="relative text-sm text-white/90">{content}</p>
    </motion.div>
  );
};

export default FrostedGlassCard;