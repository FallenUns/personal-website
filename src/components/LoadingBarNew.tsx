import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';

const LoadingBar: React.FC = () => {
  const { isLoading, progress } = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
          style={{ pointerEvents: 'all' }} // Prevent clicks during loading
        >
          <div className="text-center space-y-8 max-w-md mx-auto px-8">
            {/* Loading Animation */}
            <div className="space-y-4">
              {/* Animated Logo/Icon */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 0.8, 1] }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  className="w-8 h-8 bg-white rounded-lg"
                />
              </motion.div>

              {/* Loading Text */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white"
              >
                Loading Experience
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/70 text-sm"
              >
                Preparing something amazing for you...
              </motion.p>
            </div>

            {/* Progress Bar Container */}
            <div className="space-y-3">
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ 
                    duration: 0.5,
                    ease: "easeOut" 
                  }}
                >
                  {/* Animated glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-full"
                    animate={{ 
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </div>
              
              {/* Progress Percentage */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-between text-xs text-white/50"
              >
                <span>Loading assets...</span>
                <motion.span
                  key={Math.floor(progress)}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {Math.floor(progress)}%
                </motion.span>
              </motion.div>
            </div>

            {/* Floating Particles Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingBar;
