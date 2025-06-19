import React, { useState, useEffect } from 'react';
import DynamicSkyBackground from './components/DynamicSkyBackground.tsx';
import HeroSection from './components/HeroSection.tsx';
import ProjectsSection from './components/ProjectsSection.tsx';
import Navbar from './components/NavBar.tsx';

function App() {
  // Correctly manage time, auto-sync, and day/night state
  const [isAuto, setIsAuto] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  });
  const [isNight, setIsNight] = useState(currentTime >= 18 || currentTime < 6);

  // Effect to update time automatically if isAuto is true
  useEffect(() => {
    if (isAuto) {
      const timer = setInterval(() => {
        const now = new Date();
        const newTime = now.getHours() + now.getMinutes() / 60;
        setCurrentTime(newTime);
        setIsNight(newTime >= 18 || newTime < 6);
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [isAuto]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAuto) setIsAuto(false);
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    setIsNight(newTime >= 18 || newTime < 6);
  };

  const handleToggleAuto = () => {
    const newIsAuto = !isAuto;
    setIsAuto(newIsAuto);
    if (newIsAuto) {
      const now = new Date();
      const newTime = now.getHours() + now.getMinutes() / 60;
      setCurrentTime(newTime);
      setIsNight(newTime >= 18 || newTime < 6);
    }
  };

  // Fixed handler for the Day/Night toggle
  const handleToggleDayNight = () => {
    setIsAuto(false); // Manual override
    const newIsNight = !isNight;
    setIsNight(newIsNight);
    setCurrentTime(newIsNight ? 20 : 8); // 8 PM for Night, 8 AM for Day
  };

  return (
    <>
      <DynamicSkyBackground hour={currentTime} />
      {/* The Navbar is outside the main scrollable area to remain fixed */}
      <Navbar
        time={currentTime}
        onTimeChange={handleTimeChange}
        isNight={isNight}
        onToggleDayNight={handleToggleDayNight}
        isAuto={isAuto}
        onToggleAuto={handleToggleAuto}
      />
      {/* This main element will contain all scrollable content */}
      <main className="relative z-10">
        <HeroSection />
        <ProjectsSection />
        {/* Add a footer or contact section here if you like */}
      </main>
    </>
  );
}

export default App;