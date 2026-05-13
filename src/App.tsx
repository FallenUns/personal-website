// src/App.tsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { setLenis } from './utils/lenis';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { TimeProvider } from './contexts/TimeContext';
import { useCriticalResourceLoader, useImagePreloader } from './hooks/useAssetPreloader';
import SectionBackground from './components/visuals/SectionBackground';
import CursorSpotlight from './components/animations/CursorSpotlight';
import HeroSection from './components/HeroSection';
import SkillsMarquee from './components/SkillsMarquee';
import FilmGrain from './components/FilmGrain';
import CameraWheel from './components/CameraWheel';
import ProjectsSection from './components/ProjectsSection';
import ExperienceSection from './components/ExperienceSection';
import ExperienceDetail from './components/ExperienceDetail';
import ProjectDetail from './components/ProjectDetail';
import BirthdayPage from './components/BirthdayPage';
import Navbar from './components/NavBar';
import Contact from './components/Contact';
import DustToOrbLoader from './components/DustToOrbLoader';
import FloatingAssistant from './components/FloatingAssistant';
import { FeedbackButton } from './components/FeedbackButton';
import { FeedbackManager } from './components/FeedbackManager';
import { GlobalFeedbackShortcut } from './components/GlobalFeedbackShortcut';
import TerminalHud from './components/TerminalHud';
import { websiteControlService } from './api/controlService';
import { scrollToSection } from './utils/navigation';
import { getCurrentPath, isProjectDetailPage, getProjectSlug, isExperienceDetailPage, getExperienceSlug, isBirthdayPage } from './utils/router';
import './components/performance.css';

// Function to get the background color based on the hour
const getLoaderBackgroundColor = (hour: number) => {
  if (hour >= 5 && hour < 8) { // Dawn
    return 'rgb(45, 25, 65)';
  } else if (hour >= 8 && hour < 17) { // Day
    return 'rgb(25, 35, 55)';
  } else if (hour >= 17 && hour < 20) { // Dusk
    return 'rgb(40, 20, 60)';
  } else { // Night
    return 'rgb(15, 8, 35)';
  }
};


// App content component that uses the loading hooks
const AppContent: React.FC = () => {
  const { isLoading } = useLoading();
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

  // Check if current route is an experience detail page
  const isExperienceDetail = isExperienceDetailPage(currentRoute);
  const experienceSlug = getExperienceSlug(currentRoute);

  // Check if current route is the birthday page
  const isBirthday = isBirthdayPage(currentRoute);

  // Register critical resource loaders
  useCriticalResourceLoader();
  useImagePreloader();

  // Prevent scrolling during loading and prevent pull-to-refresh on detail pages
  useEffect(() => {
    if (isLoading || isProjectDetail || isExperienceDetail || isBirthday) {
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      // Prevent pull-to-refresh on mobile
      document.documentElement.style.overscrollBehavior = 'none';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.overscrollBehavior = 'auto';
      document.documentElement.style.overscrollBehavior = 'auto';
    }
  }, [isLoading, isProjectDetail, isExperienceDetail, isBirthday]);

  // Smooth scroll with Lenis. Native wheel events get eased; the styled
  // scrollbar in index.css stays visible because Lenis doesn't replace the
  // scroll mechanism — it intercepts wheel/touch and drives window.scroll.
  const lenisRef = useRef<Lenis | null>(null);
  useEffect(() => {
    if (isLoading) return;
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
    });
    lenisRef.current = lenis;
    setLenis(lenis);
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [isLoading]);

  // Pause Lenis while detail overlays / birthday page own the scroll context.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (isProjectDetail || isExperienceDetail || isBirthday) lenis.stop();
    else lenis.start();
  }, [isProjectDetail, isExperienceDetail, isBirthday]);

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
        // Use the proven navigation utility function directly
        console.log(`🚀 Using navigation utility for ${sectionId}`);
        scrollToSection(sectionId);
        console.log(`✅ Navigation utility called for: ${sectionId}`);
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
      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10002] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>

      {/* Show loading screen immediately with background color */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ backgroundColor: loaderBackgroundColor }}
          >
            <DustToOrbLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render main content - hidden during loading but allows components to mount */}
      <TimeProvider hour={currentTime} isDarkMode={isDarkMode}>
        <div style={{
          opacity: isLoading ? 0 : 1,
          visibility: isLoading ? 'hidden' : 'visible',
          transition: isLoading ? 'none' : 'opacity 0.8s ease-out'
        }}>
          <SectionBackground />
          {/* Site-wide cursor spotlight — fixed-position, tracks the cursor
              across every section instead of only the hero. */}
          <CursorSpotlight fixed />

          <Navbar
            time={currentTime}
            onTimeChange={handleTimeChange}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            isAuto={isAuto}
            onToggleAuto={handleToggleAuto}
          />

          <main id="main-content" className="relative z-10">
            <HeroSection />
            <SkillsMarquee />
            <ExperienceSection />
            <ProjectsSection />
            <Contact />
          </main>

          <FloatingAssistant isLoading={isLoading} />
          <FeedbackButton />
          <FeedbackManager />
          <GlobalFeedbackShortcut />
          <FilmGrain />
          <CameraWheel />
          <TerminalHud />
        </div>

        {/* Project Detail Overlay - Only shows when on project route */}
        <AnimatePresence>
          {isProjectDetail && (
            <motion.div
              className="fixed inset-0 z-[9998] p-2 sm:p-4 md:p-8 flex items-center justify-center"
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

        {/* Experience Detail Overlay - Only shows when on experience route */}
        <AnimatePresence>
          {isExperienceDetail && (
            <motion.div
              className="fixed inset-0 z-[9998] p-2 sm:p-4 md:p-8 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="w-full h-full">
                <ExperienceDetail slug={experienceSlug || undefined} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Birthday Page - Replaces entire content */}
        <AnimatePresence>
          {isBirthday && (
            <motion.div
              className="fixed inset-0 z-[9999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <BirthdayPage />
            </motion.div>
          )}
        </AnimatePresence>
      </TimeProvider>
    </>
  );
};

function App() {
  return (
    <LoadingProvider minimumLoadTime={1000}>
      <AppContent />
    </LoadingProvider>
  );
}

export default App;
