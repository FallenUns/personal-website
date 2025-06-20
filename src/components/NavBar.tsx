// src/components/NavBar.tsx
import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from './LiquidGlass';

// Interfaces for component props
interface NavbarProps {
  time: number;
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAuto: boolean;
  onToggleAuto: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

// Modal props now include all NavbarProps
interface SkyControllerModalProps extends NavbarProps {
  onClose: () => void;
}

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

const DarkModeToggle = memo(({ isDarkMode, onToggleDarkMode }: { isDarkMode: boolean, onToggleDarkMode: () => void }) => (
    <button 
        onClick={onToggleDarkMode} 
        className="p-2 rounded-full hover:bg-white/20 transition-colors text-white" 
        aria-label="Toggle dark mode"
    >
        {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
        ) : (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 5.05a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" clipRule="evenodd" />
            </svg>
        )}
    </button>
));
DarkModeToggle.displayName = 'DarkModeToggle';

// UPDATED: The modal now uses LiquidGlass for its background
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }} 
        transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
        onClick={handleContentClick}
      >
        <LiquidGlass
          width={370}
          height={230}
          blur={15}
          positioning="relative"
          style={{ borderRadius: '24px' }}
        >
          <div className="p-6 w-full text-white">
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
                <span className="[text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">{props.isDarkMode ? 'Dark' : 'Light'} Mode</span>
                <button
                  onClick={props.onToggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${props.isDarkMode ? 'bg-purple-500' : 'bg-yellow-400'}`}
                  aria-label="Toggle dark mode"
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${props.isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </LiquidGlass>
      </motion.div>
    </motion.div>
  );
});
SkyControllerModal.displayName = 'SkyControllerModal';


const Navbar: React.FC<NavbarProps> = (props) => {
  const [isControllerVisible, setIsControllerVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [navDimensions, setNavDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setNavDimensions({ width, height });
      }
    });

    if (navRef.current) {
      resizeObserver.observe(navRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const handleToggleController = useCallback(() => {
    setIsControllerVisible(prev => !prev);
  }, []);

  const handleCloseController = useCallback(() => {
    setIsControllerVisible(false);
  }, []);

  const { isDarkMode, onToggleDarkMode } = props;

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
    transition: 'all 0.3s ease-in-out',
    top: isScrolled ? '20px' : '0px',
    width: isScrolled ? '90vw' : '100%',
    left: isScrolled ? '5vw' : '0',
    maxWidth: isScrolled ? '5000px' : 'none',
    marginLeft: 'auto',
    marginRight: 'auto',
    height: isScrolled ? '54px' : '68px',
  };
  
  const liquidGlassStyle: React.CSSProperties = {
    borderRadius: isScrolled ? '9999px' : '0px',
    border: isScrolled ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
    borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
  };

  return (
    <>
      <nav ref={navRef} style={navStyle}>
        {navDimensions.width > 0 && navDimensions.height > 0 && (
          <LiquidGlass
            width={navDimensions.width}
            height={navDimensions.height}
            positioning="relative"
            style={liquidGlassStyle}
            blur={8}
            isElastic={isScrolled}
          >
            <div className="flex items-center justify-between font-sans w-full h-full mx-auto px-6">
              <div className="text-lg font-bold text-white tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
              </div>
              <div className="flex items-center space-x-4 text-sm text-white/80">
                <div className="hidden md:flex items-center space-x-8">
                  <a href="#about" className="hover:text-white transition-colors duration-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] font-medium">About</a>
                  <a href="#projects" className="hover:text-white transition-colors duration-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] font-medium">Projects</a>
                  <a href="#contact" className="hover:text-white transition-colors duration-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] font-medium">Contact</a>
                </div>
                <DarkModeToggle isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
                <button 
                  onClick={handleToggleController} 
                  className="p-2 rounded-full hover:bg-white/20 transition-colors" 
                  aria-label="Toggle sky controls"
                >
                  <SettingsIcon />
                </button>
              </div>
            </div>
          </LiquidGlass>
        )}
      </nav>

      <AnimatePresence>
        {isControllerVisible && <SkyControllerModal {...props} onClose={handleCloseController} />}
      </AnimatePresence>
    </>
  );
};

export default memo(Navbar);