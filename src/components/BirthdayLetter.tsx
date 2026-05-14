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
            className="relative max-w-2xl w-full bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-transparent"
            style={{
              background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, #FFD700, #FF69B4, #00CED1, #FF6347, #9370DB) border-box',
            }}
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
            {/* Animated rainbow border */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(45deg, #FFD700, #FF69B4, #00CED1, #FF6347, #9370DB, #32CD32)',
                backgroundSize: '300% 300%',
                padding: '3px',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="w-full h-full bg-white rounded-2xl" />
            </motion.div>
            
            {/* Main content area */}
            <div className="relative bg-white p-8 md:p-12 rounded-2xl z-10">
              {/* Close button */}
              <motion.button
                onClick={handleClose}
                className="absolute top-6 right-6 w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 rounded-full flex items-center justify-center transition-all duration-200 group shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5 text-white group-hover:text-gray-100"
                  fill="none"
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Header */}
              <div className="text-center mb-8">
                <motion.h2 
                  className="text-4xl md:text-5xl font-bold mb-4 relative text-white"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <motion.span
                    className="relative inline-block"
                    animate={{
                      textShadow: [
                        '0 0 15px #FFD700, 0 0 25px #FF69B4, 0 0 35px #00CED1',
                        '0 0 15px #FF6347, 0 0 25px #9370DB, 0 0 35px #32CD32',
                        '0 0 15px #FF1493, 0 0 25px #00BFFF, 0 0 35px #FFD700',
                        '0 0 15px #FFD700, 0 0 25px #FF69B4, 0 0 35px #00CED1'
                      ]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    🎂🎉 Happy Birthday! 🎉🎂
                  </motion.span>
                  
                  {/* Colorful glow effect behind text */}
                  <motion.div
                    className="absolute inset-0 -z-10"
                    style={{
                      background: 'linear-gradient(45deg, #FFD700, #FF69B4, #00CED1, #FF6347, #9370DB, #32CD32)',
                      backgroundSize: '300% 300%',
                      filter: 'blur(15px)',
                      opacity: 0.5,
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Floating sparkles around title */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-white"
                      style={{
                        left: `${10 + i * 10}%`,
                        top: `${i % 2 === 0 ? -10 : 110}%`,
                        boxShadow: `0 0 10px ${['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#32CD32', '#FF1493', '#00BFFF'][i]}`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.6, 1, 0.6],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </motion.h2>
                
                <motion.div 
                  className="w-24 h-1 mx-auto rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </div>

              {/* Letter content */}
              <motion.div 
                className="text-center space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 text-xl font-medium">
                  Dear my beloved Kerel,
                </p>
                
                <div className="text-gray-800 text-lg leading-relaxed max-h-96 overflow-y-auto space-y-4">
                  <p className="mb-4">
                    Congrats on being another year more amazing! Thank you for always being here with me and supporting me 😊. I'm proud of the person you are, and I am excited for all the wonderful things that lie ahead for you. You’ve shown me that there’s another part of my life I need to fulfill, and I’m grateful for your love, kindness, and encouragement every single day.
                  </p>
                  
                  <p className="mb-4 text-gray-700">
                    Keep being yourself keep continue on your passion and I believe that every single effort that you made will pay off. Keep happy, dont overthink eveything is in God's hand.
                  </p>
                  
                  <motion.p 
                    className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      backgroundSize: '200% 200%',
                    }}
                  >
                    Here's to another year of being wonderfully, authentically you!
                  </motion.p>
                  
                  <p className="mt-4 text-lg text-gray-700">
                    Love uu sayangg 💖
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Enhanced decorative corner elements */}
            <motion.div 
              className="absolute top-4 left-4 w-4 h-4 rounded-full"
              style={{ background: 'linear-gradient(45deg, #FFD700, #FFA500)' }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div 
              className="absolute top-4 right-16 w-3 h-3 rounded-full"
              style={{ background: 'linear-gradient(45deg, #FF69B4, #FF1493)' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            <motion.div 
              className="absolute bottom-4 left-6 w-3 h-3 rounded-full"
              style={{ background: 'linear-gradient(45deg, #9370DB, #8A2BE2)' }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <motion.div 
              className="absolute bottom-4 right-4 w-4 h-4 rounded-full"
              style={{ background: 'linear-gradient(45deg, #00CED1, #008B8B)' }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
            />
            
            {/* Additional floating particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#32CD32'][i % 6],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BirthdayLetter;