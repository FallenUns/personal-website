import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { TimeProvider } from './contexts/TimeContext';
import { useAssetPreloader, useCriticalResourceLoader } from './hooks/useAssetPreloader';
import GooeyBackground from './components/GooeyBackground';
import HeroSection from './components/HeroSection';
import ProjectsSection from './components/ProjectsSection';
import Navbar from './components/NavBar';
import Contact from './components/Contact';
import CircularLoader from './components/CircularLoader';
import FloatingAssistant from './components/FloatingAssistant';
import { websiteControlService } from './api/controlService';
import { scrollToSection } from './utils/navigation';
import './components/performance.css';

// Function to get the background color based on the hour
const getLoaderBackgroundColor = (hour: number) => {
  if (hour >= 5 && hour < 8) { // Dawn
    return 'rgb(247, 170, 107)';
  } else if (hour >= 8 && hour < 17) { // Day
    return 'rgb(64, 121, 196)';
  } else if (hour >= 17 && hour < 20) { // Dusk
    return 'rgb(62, 29, 93)';
  } else { // Night
    return 'rgb(0, 17, 82)';
  }
};


// App content component that uses the loading hooks
const AppContent: React.FC = () => {
  const { isLoading } = useLoading();

  // Register critical resource loaders
  useCriticalResourceLoader();
  useAssetPreloader({
       images: [
      '/vite.svg',
      '/react-logo.png',
      '/python-logo.png',
      '/js-logo.png',
      '/tensorflow-logo.png'
    ],
  });

  // Prevent scrolling during loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      // Restore normal scrolling after loading
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isLoading]);

  const [isAuto, setIsAuto] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  });
  const [isDarkMode, setIsDarkMode] = useState(currentTime >= 17 || currentTime < 5);

  // Create stable control functions using useCallback
  const controlFunctions = React.useMemo(() => ({
    setTime: (time: number) => {
      if (isAuto) setIsAuto(false);
      setCurrentTime(time);
      setIsDarkMode(time >= 17 || time < 5);
    },
    getTime: () => currentTime,
    toggleDarkMode: () => {
      if (isAuto) {
        setIsAuto(false);
      }
      setIsDarkMode(prev => {
        const newIsDarkMode = !prev;
        if (newIsDarkMode) {
          setCurrentTime(20);
        } else {
          setCurrentTime(8);
        }
        return newIsDarkMode;
      });
    },
    setDarkMode: (enabled: boolean) => {
      if (isAuto) {
        setIsAuto(false);
      }
      if (enabled !== isDarkMode) {
        setIsDarkMode(enabled);
        if (enabled) {
          setCurrentTime(20);
        } else {
          setCurrentTime(8);
        }
      }
    },
    getDarkMode: () => isDarkMode,
    toggleAutoSync: () => {
      setIsAuto(prev => {
        const newIsAuto = !prev;
        if (newIsAuto) {
          const now = new Date();
          const newTime = now.getHours() + now.getMinutes() / 60;
          setCurrentTime(newTime);
          setIsDarkMode(newTime >= 17 || newTime < 5);
        }
        return newIsAuto;
      });
    },
    setAutoSync: (enabled: boolean) => {
      if (enabled !== isAuto) {
        setIsAuto(enabled);
        if (enabled) {
          const now = new Date();
          const newTime = now.getHours() + now.getMinutes() / 60;
          setCurrentTime(newTime);
          setIsDarkMode(newTime >= 17 || newTime < 5);
        }
      }
    },
    getAutoSync: () => isAuto,
    navigateToSection: (sectionId: string) => {
      console.log(`🎯 App.tsx navigateToSection called with: ${sectionId}`);
      try {
        scrollToSection(sectionId);
        console.log(`✅ Navigation completed for: ${sectionId}`);
      } catch (error) {
        console.error('❌ Navigation failed:', error);
        throw error;
      }
    }
  }), [isAuto, currentTime, isDarkMode]);

  // Initialize website controls for the LLM - only once
  useEffect(() => {
    websiteControlService.setControls(controlFunctions);
  }, [controlFunctions]);

  useEffect(() => {
    if (isAuto) {
      const timer = setInterval(() => {
        const now = new Date();
        const newTime = now.getHours() + now.getMinutes() / 60;
        setCurrentTime(newTime);
        setIsDarkMode(newTime >= 17 || newTime < 5);
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [isAuto]);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAuto) setIsAuto(false);
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    setIsDarkMode(newTime >= 17 || newTime < 5);
  }, [isAuto]);

  const handleToggleAuto = useCallback(() => {
    setIsAuto(prev => {
        const newIsAuto = !prev;
        if (newIsAuto) {
            const now = new Date();
            const newTime = now.getHours() + now.getMinutes() / 60;
            setCurrentTime(newTime);
            setIsDarkMode(newTime >= 17 || newTime < 5);
        }
        return newIsAuto;
    });
  }, []);

  const handleToggleDarkMode = () => {
    if (isAuto) {
      setIsAuto(false);
    }
    setIsDarkMode(prev => {
      const newIsDarkMode = !prev;
      if (newIsDarkMode) {
        setCurrentTime(20);
      } else {
        setCurrentTime(8);
      }
      return newIsDarkMode;
    });
  };

  const loaderBackgroundColor = getLoaderBackgroundColor(Math.floor(currentTime));

  return (
    <>
      {/* Render main content immediately but let loading screen cover it */}
      <TimeProvider hour={currentTime} isDarkMode={isDarkMode}>
        <GooeyBackground hour={currentTime} />
        
        <Navbar
          time={currentTime}
          onTimeChange={handleTimeChange}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          isAuto={isAuto}
          onToggleAuto={handleToggleAuto}
        />
        
        <motion.main 
          className="relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            delay: isLoading ? 0 : 0.3
          }}
        >
          <HeroSection />
          <ProjectsSection />
          <Contact />
        </motion.main>
        
        {/* Floating Assistant is now self-contained and manages its own state */}
        <FloatingAssistant isLoading={isLoading} />
      </TimeProvider>

      {/* The loading screen acts as an overlay on top of everything */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backgroundColor: loaderBackgroundColor }}
            exit={{ opacity: 0, backgroundColor: loaderBackgroundColor }}
            transition={{ duration: 0.3 }}
          >
            <CircularLoader />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

function App() {
  return (
    <LoadingProvider minimumLoadTime={3000}>
      <AppContent />
    </LoadingProvider>
  );
}

export default App;