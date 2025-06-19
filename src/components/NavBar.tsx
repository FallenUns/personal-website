import React, { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaces for component props, based on your App.tsx state
interface NavbarProps {
  time: number;
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAuto: boolean;
  onToggleAuto: () => void;
  isNight: boolean;
  onToggleDayNight: () => void;
}

interface SkyControllerModalProps extends Omit<NavbarProps, 'isScrolled'> {
  onClose: () => void;
}

// Memoized settings icon component
const SettingsIcon = memo(() => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-5 w-5 text-white" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
    />
  </svg>
));

SettingsIcon.displayName = 'SettingsIcon';

// Memoized modal component
const SkyControllerModal = memo<SkyControllerModalProps>(({ onClose, ...props }) => {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
    >
      <motion.div 
        className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl shadow-lg p-6 w-full max-w-sm text-white" 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }} 
        transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
        onClick={handleContentClick}
      >
        <h3 className="text-lg font-bold text-center mb-4 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">Sky Controls</h3>
        <div className="mb-4">
          <label htmlFor="time-slider" className="block text-sm font-medium mb-2 text-center [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            Time: {String(Math.floor(props.time)).padStart(2, '0')}:{String(Math.round((props.time % 1) * 60)).padStart(2, '0')}
          </label>
          <input 
            id="time-slider" 
            type="range" 
            min="0" 
            max="23.99" 
            step="0.01" 
            value={props.time} 
            onChange={props.onTimeChange} 
            disabled={props.isAuto} 
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-50" 
          />
        </div>
        <div className="flex items-center justify-around text-sm mt-4">
          <div className="flex items-center space-x-2">
            <span className="[text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">Auto-Sync</span>
            <button 
              onClick={props.onToggleAuto} 
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${props.isAuto ? 'bg-blue-400' : 'bg-gray-500'}`}
              aria-label={`Toggle auto-sync ${props.isAuto ? 'off' : 'on'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${props.isAuto ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="[text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">{props.isNight ? 'Night' : 'Day'}</span>
            <button 
              onClick={props.onToggleDayNight} 
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${props.isNight ? 'bg-purple-600' : 'bg-amber-400'}`}
              aria-label={`Toggle to ${props.isNight ? 'day' : 'night'} mode`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${props.isNight ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

SkyControllerModal.displayName = 'SkyControllerModal';

const Navbar: React.FC<NavbarProps> = (props) => {
  const [isControllerVisible, setIsControllerVisible] = useState(false);

  const handleToggleController = useCallback(() => {
    setIsControllerVisible(prev => !prev);
  }, []);

  const handleCloseController = useCallback(() => {
    setIsControllerVisible(false);
  }, []);
  return (
    <>
      <nav 
        className="sticky top-5 mx-auto z-50" // Modified line: Replaced 'left-1/2 transform -translate-x-1/2' with 'mx-auto'
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(7px)',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '12px 32px',
          maxWidth: '1800px',
          width: '90vw'
        }}
      >
        <div className="flex items-center justify-between font-sans">
          <div className="text-lg font-bold text-white tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
            Your Name
          </div>
          <div className="flex items-center space-x-4 text-sm text-white/80">
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="hover:text-white transition-colors duration-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] font-medium">About</a>
              <a href="#projects" className="hover:text-white transition-colors duration-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] font-medium">Projects</a>
              <a href="#contact" className="hover:text-white transition-colors duration-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] font-medium">Contact</a>
            </div>
            <button 
              onClick={handleToggleController} 
              className="p-2 rounded-full hover:bg-white/20 transition-colors" 
              aria-label="Toggle sky controls"
            >
              <SettingsIcon />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isControllerVisible && <SkyControllerModal {...props} onClose={handleCloseController} />}
      </AnimatePresence>
    </>
  );
};

export default memo(Navbar);