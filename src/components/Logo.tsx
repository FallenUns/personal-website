import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Logo: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href="/"
      className="relative w-12 h-12 flex items-center justify-center cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        fontFamily: "'safiro-regular-i' ,sans-serif",
        fontSize: '20px',
        fontWeight: '20',
        color: 'white',
        width: '50px',
        height: '40px',
        textShadow: '0 1px 3px rgba(0,0,0,0.5)'
      }}
    >      {/* P */}
      <motion.span
        className="left-0 right-0"
        animate={{
          x: isHovered ? 0 : -3,
          y: isHovered ? 0 : -6,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        P
      </motion.span>

      {/* A */}
      <motion.span
        className="left-0 right-0"
        animate={{
          x: isHovered ? 0 : 3,
          y: isHovered ? 0 : 6,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        A
      </motion.span>

      {/* Slash */}
      <AnimatePresence>
        {!isHovered && (
          <motion.div
            className="absolute w-0.5 h-10 bg-white/90"
            style={{
                boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
            }}
            initial={{ opacity: 0, rotate: 25 }}
            animate={{ opacity: 1, rotate: 25 }}
            exit={{ opacity: 0, rotate: -25, scale: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </a>
  );
};

export default Logo;