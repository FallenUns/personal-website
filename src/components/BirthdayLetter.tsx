import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BirthdayLetterProps {
  onClose: () => void;
}

const BirthdayLetter: React.FC<BirthdayLetterProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Dark overlay background */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={handleClose}
          />

          {/* Letter card */}
          <motion.div
            className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 20,
              duration: 0.6 
            }}
          >
            {/* Gradient border decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 opacity-20 rounded-2xl" />
            
            {/* Main content area */}
            <div className="relative bg-white p-8 md:p-12 rounded-2xl">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 group"
              >
                <svg 
                  className="w-5 h-5 text-gray-600 group-hover:text-gray-800" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 mb-4">
                  Happy Birthday! ✨
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full" />
              </div>

              {/* Letter content */}
              <div className="text-center space-y-6">
                <p className="text-gray-700 text-xl font-medium">
                  Dear Birthday Star,
                </p>
                
                <div className="text-gray-800 text-lg leading-relaxed max-h-96 overflow-y-auto">
                  <p className="mb-4">
                    On this extraordinary day, may your heart be filled with joy and your year ahead be painted with the most vibrant colors of happiness.
                  </p>
                  
                  <div className="space-y-3 my-6">
                    <p className="flex items-center justify-center gap-2">
                      <span>🌟</span>
                      <span>May you find magic in everyday moments</span>
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <span>💫</span>
                      <span>May your dreams unfold into beautiful realities</span>
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <span>❤️</span>
                      <span>May love and laughter surround you always</span>
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <span>🌸</span>
                      <span>May this new year bring you countless reasons to smile</span>
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <span>🎁</span>
                      <span>May every day be a gift worth celebrating</span>
                    </p>
                  </div>
                  
                  <p className="mb-4">
                    You are a rare and precious soul, bringing light and warmth to everyone around you. Today we celebrate not just another year, but the incredible journey that is uniquely yours.
                  </p>
                  
                  <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                    Here's to another year of being wonderfully, authentically you!
                  </p>
                  
                  <p className="mt-4 text-lg">
                    With love and sparkling birthday wishes 💖
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative corner elements */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full opacity-60" />
            <div className="absolute top-4 right-16 w-2 h-2 bg-pink-400 rounded-full opacity-60" />
            <div className="absolute bottom-4 left-6 w-2 h-2 bg-purple-400 rounded-full opacity-60" />
            <div className="absolute bottom-4 right-4 w-3 h-3 bg-blue-400 rounded-full opacity-60" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BirthdayLetter;