import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import Logo from './Logo';
import { useScrollSpy } from '../hooks/useScrollSpy';

// Interfaces for component props
interface NavbarProps {
  time: number;
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAuto: boolean;
  onToggleAuto: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

// Props for the new dropdown controller
interface SkyControllerDropdownProps extends NavbarProps {}

const SettingsIcon = memo(({ isActive }: { isActive?: boolean }) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
    animate={{
      rotate: isActive ? 180 : 0,
      scale: isActive ? 1.1 : 1
    }}
    transition={{
      duration: 0.3,
      ease: "easeInOut"
    }}
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
  </motion.svg>
));
SettingsIcon.displayName = 'SettingsIcon';

const SkyControllerDropdown: React.FC<SkyControllerDropdownProps> = memo((props) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 z-50"
        >
              <LiquidGlass
                width={300}
                height={180}
                positioning="relative"
                style={{ borderRadius: '32px' }}
                elasticity={0.1}
                saturation={150}
                aberrationIntensity={1}
                displacementScale={90}
                blurAmount={3}
                mode='shader'
              >
                <div className="p-6 w-full text-white">
                    <h3 className="text-lg font-bold text-center mb-4 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">Background Controls</h3>
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
                    </div>                    <div className="flex items-center justify-center text-sm mt-4">
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
                    </div>
                </div>
            </LiquidGlass>
        </motion.div>
    );
});
SkyControllerDropdown.displayName = 'SkyControllerDropdown';

const Navbar: React.FC<NavbarProps> = (props) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isNavbarPressed, setIsNavbarPressed] = useState(false);
  const [isLogoPressed, setIsLogoPressed] = useState(false);
  const rightContentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const [rightContentDimensions, setRightContentDimensions] = useState({
    width: 0, // Start with 0 to measure actual content
    height: 54  // A fixed height
  });

  // -- NEW: Scroll spy setup with better offset --
  const sectionIds = ['about', 'projects', 'contact'];
  const activeSection = useScrollSpy(sectionIds, { offset: 100 }); // Reduced offset for better accuracy

  // Improved scroll function
  const scrollToSection = useCallback((sectionId: string) => {
    console.log('Attempting to scroll to section:', sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      console.log('Element found:', element);
      
      // Use scrollIntoView with block: 'start' for better positioning
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      
      console.log('Scrolling to:', sectionId);
    } else {
      console.error('Element not found:', sectionId);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(target)
      ) {
        setIsDropdownVisible(false);
      }
    };
    if (isDropdownVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownVisible]);

  // Measure the right content dimensions
  useEffect(() => {
    const measureContent = () => {
      if (rightContentRef.current) {
        const rect = rightContentRef.current.getBoundingClientRect();
        const newWidth = Math.ceil(rect.width) + 48; // Add 24px padding on each side
        const newHeight = 54;

        setRightContentDimensions(prev => {
          if (prev.width !== newWidth || prev.height !== newHeight) {
            return { width: newWidth, height: newHeight };
          }
          return prev;
        });
      }
    };

    // Initial measurement
    measureContent();

    // Create ResizeObserver for dynamic updates
    const observer = new ResizeObserver(() => {
      measureContent();
    });

    if (rightContentRef.current) {
      observer.observe(rightContentRef.current);
    }

    // Also measure on window resize
    window.addEventListener('resize', measureContent);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureContent);
    };
  }, [activeSection]); // Re-measure when active section changes

  const handleToggleDropdown = useCallback(() => {
    setIsDropdownVisible(prev => !prev);
  }, []);

  const navContentHeight = '54px';
  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <>
      {/* Left Navigation Section - Logo */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          position: 'fixed',
          zIndex: 50,
          top: '20px',
          left: 'clamp(16px, 5vw, 48px)', // Using consistent pixel values
        }}
      >
        <motion.div
          className="flex items-center justify-center font-sans h-full relative cursor-pointer"
          style={{ height: navContentHeight }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseDown={() => setIsLogoPressed(true)}
          onMouseUp={() => setIsLogoPressed(false)}
          onMouseLeave={() => setIsLogoPressed(false)}
          onClick={() => scrollToSection('about')}
          animate={{
            scale: isLogoPressed ? 0.95 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25
          }}
        >
          <Logo />
        </motion.div>
      </motion.nav>

      {/* Right Navigation Section - Menu Items */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{
          position: 'fixed',
          zIndex: 50,
          top: '20px',
          right: 'clamp(16px, 5vw, 48px)', // Using consistent pixel values
          width: `${rightContentDimensions.width}px`,
          height: `${rightContentDimensions.height}px`,
          visibility: rightContentDimensions.width > 0 ? 'visible' : 'hidden',
        }}
      >
        {rightContentDimensions.width > 0 && (
          <motion.div
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98, y: 2 }}
            onMouseDown={() => setIsNavbarPressed(true)}
            onMouseUp={() => setIsNavbarPressed(false)}
            onMouseLeave={() => setIsNavbarPressed(false)}
            animate={{
              scale: isNavbarPressed ? 0.98 : 1,
              y: isNavbarPressed ? 2 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            style={{
              width: '100%',
              height: '100%',
              cursor: 'pointer'
            }}
          >
            <motion.div
              animate={{
                y: isNavbarPressed ? 1 : 0,
                scaleY: isNavbarPressed ? 0.96 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
            >
              <LiquidGlass
                width={rightContentDimensions.width}
                height={rightContentDimensions.height}
                positioning="relative"
                style={{
                  borderRadius: '9999px',
                }}
                elasticity={isNavbarPressed ? 0.3 : 0.1}
                saturation={150}
                aberrationIntensity={isNavbarPressed ? 2 : 1}
                displacementScale={isNavbarPressed ? 60 : 25}
                blurAmount={isNavbarPressed ? 8 : 5}
                mode='shader'
              />
            </motion.div>
          </motion.div>
        )}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
            <div
              ref={rightContentRef}
              className="flex items-center justify-center font-sans h-full relative" style={{height: navContentHeight}}>
              <div className="flex items-center space-x-3 text-sm">
                <div className="hidden md:flex items-center space-x-6">
                  {/* -- Navigation buttons with improved active indicator -- */}
                  {navLinks.map((link) => (
                    <motion.button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      className={`relative hover:text-white transition-colors duration-300 [text-shadow:0_1px_4px_rgba(0,0,0,1)] font-medium cursor-pointer bg-transparent border-none py-2 whitespace-nowrap
                        ${activeSection === link.id
                          ? 'text-white'
                          : 'text-white/70'
                        }`
                      }
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95, y: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }}
                    >
                      {link.label}
                      {activeSection === link.id && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                          layoutId="active-nav-link-indicator"
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          exit={{ opacity: 0, scaleX: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          style={{ 
                            borderRadius: '2px', 
                            boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                            transformOrigin: 'center'
                          }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
                  {/* Dark Mode Toggle Icon */}
                <motion.button
                  onClick={props.onToggleDarkMode}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors duration-300 flex-shrink-0"
                  aria-label="Toggle dark mode"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    className="relative w-5 h-5 flex items-center justify-center"
                    animate={{
                      rotate: props.isDarkMode ? 180 : 0,
                      scale: props.isDarkMode ? 1 : 1
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      duration: 0.4
                    }}
                  >
                    {/* Moon Icon */}
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute w-5 h-5 text-blue-200"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      animate={{
                        opacity: props.isDarkMode ? 0 : 1,
                        scale: props.isDarkMode ? 0.5 : 1,
                        rotate: props.isDarkMode ? -90 : 0
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                    >
                      <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                    </motion.svg>

                    {/* Sun Icon */}
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute w-5 h-5 text-yellow-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      animate={{
                        opacity: props.isDarkMode ? 1 : 0,
                        scale: props.isDarkMode ? 1 : 0.5,
                        rotate: props.isDarkMode ? 0 : 90
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                    >
                      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                    </motion.svg>
                  </motion.div>
                </motion.button>
                <motion.button
                  ref={settingsButtonRef}
                  onClick={handleToggleDropdown}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
                  aria-label="Toggle sky controls"
                  whileHover={{ scale: 1.1, rotate: 45 }}
                  whileTap={{ scale: 0.9, rotate: -45 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                >
                  <SettingsIcon isActive={isDropdownVisible} />
                </motion.button>
              </div>
            </div>
        </div>

        <AnimatePresence>
            {isDropdownVisible && (
              <div ref={dropdownRef}>
                <SkyControllerDropdown {...props} />
              </div>
            )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default memo(Navbar);