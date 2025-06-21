import React, { useState, useEffect, useCallback } from 'react';
import GooeyBackground from './components/GooeyBackground';
import HeroSection from './components/HeroSection';
import ProjectsSection from './components/ProjectsSection';
import Navbar from './components/NavBar';
import Contact from './components/Contact';

function App() {
  // Correctly manage time, auto-sync, and day/night state
  const [isAuto, setIsAuto] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  });
  const [isDarkMode, setIsDarkMode] = useState(currentTime >= 18 || currentTime < 6);

  // Effect to update time automatically, now updates isDarkMode
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

  // Handlers updated to use isDarkMode
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

  // Handler for dark mode toggle
  const handleToggleDarkMode = () => {
    // When manually toggling dark mode, we should disable auto-sync
    if (isAuto) {
      setIsAuto(false);
    }
    // Set the time to a representative value for the new mode
    setIsDarkMode(prev => {
      const newIsDarkMode = !prev;
      if (newIsDarkMode) {
        setCurrentTime(20); // A time when it's dark
      } else {
        setCurrentTime(8); // A time when it's light
      }
      return newIsDarkMode;
    });
  };

  return (
    <>
      <GooeyBackground hour={currentTime} />
      {/* Navbar now receives the correct props for dark mode */}
      <Navbar
        time={currentTime}
        onTimeChange={handleTimeChange}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isAuto={isAuto}
        onToggleAuto={handleToggleAuto}
      />
      {/* This main element will contain all scrollable content */}
      <main className="relative z-10">
        <HeroSection />
        <ProjectsSection />
        <Contact />
        {/* Additional content section */}
        <div className="h-screen flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-4">More Content</h2>
            <p className="text-lg">This is additional content to ensure the page is scrollable.</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;