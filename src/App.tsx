import React, { useState, useEffect, useCallback } from 'react';
import GooeyBackground from './components/GooeyBackground';
import HeroSection from './components/HeroSection';
import ProjectsSection from './components/ProjectsSection';
import Navbar from './components/NavBar';

function App() {
  // Correctly manage time, auto-sync, and day/night state
  const [isAuto, setIsAuto] = useState(true);  const [currentTime, setCurrentTime] = useState(() => {
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
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <GooeyBackground hour={currentTime} />
      {/* Navbar now receives the correct props for dark mode */}      <Navbar
        time={currentTime}
        onTimeChange={handleTimeChange}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isAuto={isAuto}
        onToggleAuto={handleToggleAuto}
      />
      {/* This main element will contain all scrollable content */}      <main className="relative z-10">
        <HeroSection />
        <ProjectsSection />
        {/* Contact Section */}
        <section id="contact" className="h-screen flex items-center justify-center pt-20">
          <div className="text-white text-center">
            <h2 className="text-4xl font-bold mb-6 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">Get In Touch</h2>
            <p className="text-lg mb-8 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">Let's work together on your next project.</p>
            <div className="flex justify-center space-x-4">
              <button className="px-6 py-3 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                Email Me
              </button>
              <button className="px-6 py-3 bg-white/20 rounded-full hover:bg-white/30 transition-all duration-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                LinkedIn
              </button>
            </div>
          </div>
        </section>
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