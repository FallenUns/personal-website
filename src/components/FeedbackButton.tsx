import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FeedbackForm } from './FeedbackForm';
import LiquidGlass from './LiquidGlass';

export const FeedbackButton: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      {/* Floating Feedback Button */}
      <motion.div
        className="fixed bottom-6 left-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5, type: "spring" }}
      >
        <div
          style={{ 
            cursor: 'pointer',
            position: 'relative',
            zIndex: 20,
          }}
        >
          <LiquidGlass
            width={64}
            height={64}
            className="cursor-pointer"
            onClick={() => setIsFormOpen(true)}
            isElastic={true}
            elasticity={0.2}
            blurAmount={12}
            saturation={150}
            displacementScale={50}
            mode='shader'
            overLight={false}
          >
            <motion.div
              className="flex items-center justify-center w-full h-full text-white"
            >
              <svg 
                className="w-7 h-7" 
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