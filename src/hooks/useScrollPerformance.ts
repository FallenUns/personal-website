import { useState, useEffect } from 'react';

interface ScrollPerformanceHook {
  isScrolling: boolean;
  scrollFPS: number;
  shouldReduceAnimations: boolean;
}

export const useScrollPerformance = (): ScrollPerformanceHook => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollFPS, setScrollFPS] = useState(60);
  const [shouldReduceAnimations, setShouldReduceAnimations] = useState(false);
  
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrame: number;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) { // Every second
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setScrollFPS(fps);
        setShouldReduceAnimations(fps < 30); // Reduce animations if FPS drops below 30
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      if (isScrolling) {
        animationFrame = requestAnimationFrame(measureFPS);
      }
    };
    
    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Start FPS measurement if not already running
      if (!isScrolling) {
        animationFrame = requestAnimationFrame(measureFPS);
      }
      
      // Set timeout to detect end of scrolling
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isScrolling]);
  
  return {
    isScrolling,
    scrollFPS,
    shouldReduceAnimations,
  };
};
