import React, { useState, useEffect, useCallback } from 'react';
import GooeyBackground from './components/GooeyBackground';
import HeroSection from './components/HeroSection';
import ProjectsSection from './components/ProjectsSection';
import Navbar from './components/NavBar';

function App() {
  // State management updated to use isDarkMode and initialize correctly
  const [isAuto, setIsAuto] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const now = new Date();
    const time = now.getHours() + now.getMinutes() / 60;
    return time >= 18 || time < 6;
  });

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

  // Handler renamed and updated for dark mode
  const handleToggleDarkMode = useCallback(() => {
    setIsAuto(false); // Manual override
    setIsDarkMode(prev => {
        const newIsDarkMode = !prev;
        setCurrentTime(newIsDarkMode ? 20 : 11); // 8 PM for Dark, 11 AM for Light
        return newIsDarkMode;
    });
  }, []);

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
        {/* Add a footer or contact section here if you like */}
        <div className="h-screen bg-gradient-to-b from-transparent to-black/20 flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-4">More Content</h2>
            <p className="text-lg">This is additional content to ensure the page is scrollable.</p>
          </div>
        </div>
        <div className="h-screen bg-gradient-to-b from-black/20 to-transparent flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Even More Content</h2>
            <p className="text-lg">More content to test scrolling behavior.</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;