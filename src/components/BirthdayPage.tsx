import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BirthdayCake from './BirthdayCake';
import BirthdayLetter from './BirthdayLetter';
import { navigateTo } from '../utils/router';

const BirthdayPage: React.FC = () => {
  const [showLetter, setShowLetter] = useState(false);
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null);

  // Request microphone permission on component mount
  useEffect(() => {
    const requestAudioPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioPermission(true);
      } catch (error) {
        console.error('Microphone permission denied:', error);
        setAudioPermission(false);
      }
    };

    requestAudioPermission();
  }, []);

  const handleCandlesBlown = () => {
    // Delay showing the letter for a nice effect
    setTimeout(() => {
      setShowLetter(true);
    }, 2000);
  };

  const handleBackToMain = () => {
    navigateTo('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* Animated stars background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Floating magical particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50,
            }}
            animate={{
              y: -50,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          >
            <div 
              className="w-3 h-3 rounded-full shadow-lg"
              style={{
                background: `linear-gradient(45deg, ${['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#32CD32'][i % 6]}, transparent)`,
                boxShadow: `0 0 20px ${['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#32CD32'][i % 6]}`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Floating balloons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`balloon-${i}`}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
            }}
            animate={{
              y: -200,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: Math.random() * 8 + 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          >
            <motion.div
              className="relative"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 0.95, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Balloon */}
              <div
                className="w-16 h-20 rounded-full shadow-lg relative"
                style={{
                  background: `linear-gradient(135deg, ${['#FF69B4', '#FFD700', '#00CED1', '#FF6347', '#9370DB', '#32CD32', '#FF1493', '#00BFFF'][i % 8]}, ${['#FF1493', '#FFA500', '#008B8B', '#DC143C', '#8A2BE2', '#228B22', '#C71585', '#1E90FF'][i % 8]})`,
                  boxShadow: `0 8px 32px ${['#FF69B4', '#FFD700', '#00CED1', '#FF6347', '#9370DB', '#32CD32', '#FF1493', '#00BFFF'][i % 8]}40`,
                }}
              >
                {/* Balloon highlight */}
                <div className="absolute top-3 left-3 w-4 h-6 bg-white/40 rounded-full blur-sm" />
                
                {/* Balloon knot */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-3 bg-gray-700 rounded-b-full" />
              </div>
              
              {/* Balloon string */}
              <motion.div
                className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-600"
                style={{ height: '60px' }}
                animate={{
                  scaleY: [1, 1.1, 0.9, 1],
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen p-8 pt-24">
        {/* Back button */}
        <motion.button
          onClick={handleBackToMain}
          className="absolute top-8 left-8 text-white/90 hover:text-white transition-all duration-300 flex items-center gap-3 group backdrop-blur-lg bg-white/10 px-4 py-3 rounded-full border border-white/20 hover:bg-white/20"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back to Main Site</span>
        </motion.button>

        {/* Birthday title with enhanced styling */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "backOut", delay: 0.3 }}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-4 relative"
            style={{
              background: 'linear-gradient(45deg, #FFD700, #FF69B4, #00CED1, #FF6347, #9370DB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '300% 300%',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Happy Birthday!
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 rounded-3xl blur-xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.h1>
          
          <motion.div
            className="flex items-center justify-center gap-4 text-xl md:text-2xl text-white/90 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <span>Make a wish and blow out the candles</span>
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🎂
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Birthday cake with proper spacing */}
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <BirthdayCake
              onCandlesBlown={handleCandlesBlown}
              audioEnabled={audioPermission === true}
            />
          </motion.div>
        </div>

        {/* Birthday letter */}
        <AnimatePresence>
          {showLetter && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-[9999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <BirthdayLetter onClose={() => setShowLetter(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BirthdayPage;