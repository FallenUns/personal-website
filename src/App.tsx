import React, { useState, useEffect, lazy, Suspense, useCallback, useRef } from 'react';
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
  const mainScrollRef = useRef<HTMLDivElement>(null);
  
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
      <GooeyBackground hour={currentTime} />
      
      <Navbar
        time={currentTime}
        onTimeChange={handleTimeChange}
        isNight={isNight}
        onToggleDayNight={handleToggleDayNight}
        isAuto={isAuto}
        onToggleAuto={handleToggleAuto}
      />
      {/* Main scrollable container */}
      <main 
        ref={mainScrollRef} 
        className={`relative z-10 h-screen overflow-y-auto hide-scrollbar`}
      >
        <HeroSection />
        <ProjectsSection />
        {/* Add more content to ensure scrollability */}
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
    </Suspense>
  );
}

export default App;