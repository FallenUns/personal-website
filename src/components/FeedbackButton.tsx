import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FeedbackForm } from './FeedbackForm';
import LiquidGlass from './LiquidGlass';

export const FeedbackButton: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const buttonSize = isMobile ? 56 : 64;
  const iconSizeClass = isMobile ? 'w-6 h-6' : 'w-7 h-7';

  return (
    <>
      {/* Floating Feedback Button */}
      <motion.div
        // Mobile: pin to bottom-left so it doesn't float at mid-screen
        // crowding hero content. Desktop (sm+): keep the original
        // vertically-centred left rail. The inner translate-y-1/2 is also
        // gated to sm+ — at mobile we want the button anchored at its
        // bottom-left, no centring offset.
        className="feedback-fab fixed left-4 bottom-6 sm:left-6 sm:top-1/2 sm:bottom-auto z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5, type: "spring" }}
      >
        <div
          className="sm:-translate-y-1/2"
          style={{
            cursor: 'pointer',
            position: 'relative',
            zIndex: 20,
          }}
        >
          <LiquidGlass
            width={buttonSize}
            height={buttonSize}
            className="cursor-pointer"
            onClick={() => setIsFormOpen(true)}
            isElastic={true}
            elasticity={0.15}
            blurAmount={3}
            saturation={150}
            aberrationIntensity={1.2}
            displacementScale={60}
            mode='shader'
            overLight={false}
          >
            <motion.div
              className="flex items-center justify-center w-full h-full text-white"
            >
              <svg 
                className={iconSizeClass}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))'
                }}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
            </motion.div>
          </LiquidGlass>
        </div>
      </motion.div>

      {/* Feedback Form Modal */}
      <FeedbackForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </>
  );
};
