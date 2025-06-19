// src/App.tsx
import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import './App.css';

// Lazy load components for better initial bundle size
const GooeyBackground = lazy(() => import('./components/GooeyBackground'));
const HeroSection = lazy(() => import('./components/HeroSection'));
const ProjectsSection = lazy(() => import('./components/ProjectsSection'));
const Navbar = lazy(() => import('./components/NavBar'));

// Loading component for suspense
const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
  </div>
);

function App() {
  // Optimize initial time calculation
  const [isAuto, setIsAuto] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  });
  const [isNight, setIsNight] = useState(() => {
    const now = new Date();
    const time = now.getHours() + now.getMinutes() / 60;
    return time >= 18 || time < 6;
  });

  // Effect to update time automatically if isAuto is true
  useEffect(() => {
    if (!isAuto) return;
    
    const timer = setInterval(() => {
      const now = new Date();
      const newTime = now.getHours() + now.getMinutes() / 60;
      setCurrentTime(newTime);
      setIsNight(newTime >= 18 || newTime < 6);
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [isAuto]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAuto) setIsAuto(false);
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    setIsNight(newTime >= 18 || newTime < 6);
  }, [isAuto]);

  const handleToggleAuto = useCallback(() => {
    setIsAuto(prev => {
      const newIsAuto = !prev;
      if (newIsAuto) {
        const now = new Date();
        const newTime = now.getHours() + now.getMinutes() / 60;
        setCurrentTime(newTime);
        setIsNight(newTime >= 18 || newTime < 6);
      }
      return newIsAuto;
    });
  }, []);

  const handleToggleDayNight = useCallback(() => {
    setIsAuto(false);
    setIsNight(prev => {
      const newIsNight = !prev;
      setCurrentTime(newIsNight ? 20 : 8); // 8 PM for Night, 8 AM for Day
      return newIsNight;
    });
  }, []);
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {/* Replace DynamicSkyBackground with GooeyBackground */}
      <GooeyBackground hour={currentTime} />
      
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
      {/* Ensure content is visible by setting a relative position and z-index */}
      <main className="relative z-10">
        <HeroSection />
        <ProjectsSection />
        {/* Add a footer or contact section here if you like */}
      </main>
    </Suspense>
  );
}

export default App;