// src/App.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { TimeProvider } from './contexts/TimeContext';
import { useAssetPreloader, useCriticalResourceLoader } from './hooks/useAssetPreloader';
import { useMobileDetection } from './utils/mobileDetection';
import GooeyBackground from './components/GooeyBackground';
import HeroSection from './components/HeroSection';
import ProjectsSection from './components/ProjectsSection';
import ExperienceSection from './components/ExperienceSection';
import ProjectDetail from './components/ProjectDetail';
import Navbar from './components/NavBar';
import Contact from './components/Contact';
import CircularLoader from './components/CircularLoader';
import FloatingAssistant from './components/FloatingAssistant';
import MobileComingSoon from './components/MobileComingSoon';
import { websiteControlService } from './api/controlService';
import { scrollToSection } from './utils/navigation';
import { getCurrentPath, isProjectDetailPage, getProjectSlug } from './utils/router';
import './components/performance.css';

// Function to get the background color based on the hour
const getLoaderBackgroundColor = (hour: number) => {
  if (hour >= 5 && hour < 8) { // Dawn
    return 'rgb(139, 75, 48)';
  } else if (hour >= 8 && hour < 17) { // Day
    return 'rgb(65, 105, 165)';
  } else if (hour >= 17 && hour < 20) { // Dusk
    return 'rgb(62, 29, 93)';
  } else { // Night
    return 'rgb(0, 17, 82)';
  }
};


// App content component that uses the loading hooks
const AppContent: React.FC = () => {
  const { isLoading } = useLoading();
  const isMobile = useMobileDetection();
  const [currentRoute, setCurrentRoute] = useState(() => {
    return getCurrentPath();
  });

  // Simple routing system
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getCurrentPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check if current route is a project detail page
  const isProjectDetail = isProjectDetailPage(currentRoute);
  const projectSlug = getProjectSlug(currentRoute);

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
    if (isLoading || isProjectDetail) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isLoading, isProjectDetail]);

  const [isAuto, setIsAuto] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  });
  const [isDarkMode, setIsDarkMode] = useState(currentTime >= 17 || currentTime < 5);

  // Create stable control functions using useCallback
  const controlFunctions = useMemo(() => ({
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
      {/* Show mobile coming soon screen for mobile devices */}
      {isMobile && <MobileComingSoon />}
      
      {/* Render main content always - it stays in the background */}
      <TimeProvider hour={currentTime} isDarkMode={isDarkMode}>
        <AnimatePresence>
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <GooeyBackground hour={currentTime} />
              
              <Navbar
                time={currentTime}
                onTimeChange={handleTimeChange}
                isDarkMode={isDarkMode}
                onToggleDarkMode={handleToggleDarkMode}
                isAuto={isAuto}
                onToggleAuto={handleToggleAuto}
              />
              
              <main className="relative z-10">
                <HeroSection />
                <ProjectsSection />
                <ExperienceSection />
                <Contact />
              </main>
              
              <FloatingAssistant isLoading={isLoading} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Detail Overlay - Only shows when on project route */}
        <AnimatePresence>
          {isProjectDetail && (
            <motion.div
              className="fixed inset-0 z-[9998] p-8 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="w-full h-full">
                <ProjectDetail slug={projectSlug || undefined} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </TimeProvider>

      {/* The loading screen acts as an overlay on top of everything */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ backgroundColor: loaderBackgroundColor }}
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