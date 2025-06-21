import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimpleLoadingProvider, useSimpleLoading } from './contexts/SimpleLoadingContext';
import GooeyBackground from './components/GooeyBackground';
import HeroSection from './components/HeroSection';
import ProjectsSection from './components/ProjectsSection';
import Navbar from './components/NavBar';
import Contact from './components/Contact';
import CircularLoader from './components/CircularLoader';

// App content component that uses the loading hooks
const AppContent: React.FC = () => {
  const { isLoading } = useSimpleLoading();

  // Prevent scrolling during loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLoading]);

  // ... (rest of the state and handlers remain the same)
  const [isAuto, setIsAuto] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  });
  const [isDarkMode, setIsDarkMode] = useState(currentTime >= 18 || currentTime < 6);

  useEffect(() => {
    if (isAuto) {
      const timer = setInterval(() => {
        const now = new Date();
        const newTime = now.getHours() + now.getMinutes() / 60;
        setCurrentTime(newTime);
        setIsDarkMode(newTime >= 18 || newTime < 6);
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [isAuto]);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAuto) setIsAuto(false);
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    setIsDarkMode(newTime >= 18 || newTime < 6);
  }, [isAuto]);

  const handleToggleAuto = useCallback(() => {
    setIsAuto(prev => {
        const newIsAuto = !prev;
        if (newIsAuto) {
            const now = new Date();
            const newTime = now.getHours() + now.getMinutes() / 60;
            setCurrentTime(newTime);
            setIsDarkMode(newTime >= 18 || newTime < 6);
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
  return (
    <>
      {/* The circular loader will appear in the center during loading */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CircularLoader />
          </motion.div>
        )}
      </AnimatePresence>

      <GooeyBackground hour={currentTime} />
      
      {/* The Navbar will animate in after loading is complete */}
      <Navbar
        time={currentTime}
        onTimeChange={handleTimeChange}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isAuto={isAuto}
        onToggleAuto={handleToggleAuto}
      />
      
      {/* The main content fades in after loading */}
      <motion.main 
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
        }}
      >
        <HeroSection />
        <ProjectsSection />
        <Contact />
        <div className="h-screen flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-4">More Content</h2>
            <p className="text-lg">This is additional content to ensure the page is scrollable.</p>
          </div>
        </div>
      </motion.main>
    </>
  );
};

function App() {
  return (
    <SimpleLoadingProvider loadingTime={3000}>
      <AppContent />
    </SimpleLoadingProvider>
  );
}

export default App;