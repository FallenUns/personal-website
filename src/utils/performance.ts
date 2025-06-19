// src/utils/performance.ts

/**
 * Performance monitoring utilities for the website
 */

// Track Core Web Vitals
export const trackWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Track First Contentful Paint (FCP)
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          console.log(`FCP: ${entry.startTime}ms`);
        }
      });
    });
    
    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('Performance observer not supported for paint entries');
    }
  }

  // Track Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`LCP: ${lastEntry.startTime}ms`);
    });
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('Performance observer not supported for LCP');
    }
  }

  // Track Cumulative Layout Shift (CLS)
  if ('PerformanceObserver' in window) {
    let clsValue = 0;
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      console.log(`CLS: ${clsValue}`);
    });
    
    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('Performance observer not supported for layout-shift');
    }
  }
};

// Memory usage monitoring
export const trackMemoryUsage = () => {
  if (typeof window === 'undefined' || !(performance as any).memory) return;

  const memory = (performance as any).memory;
  console.log('Memory Usage:', {
    used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
    total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
    limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`,
  });
};

// FPS monitoring
export const trackFPS = () => {
  if (typeof window === 'undefined') return;

  let frames = 0;
  let lastTime = performance.now();
  
  const countFrames = () => {
    frames++;
    const currentTime = performance.now();
    
    if (currentTime >= lastTime + 1000) {
      console.log(`FPS: ${Math.round((frames * 1000) / (currentTime - lastTime))}`);
      frames = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(countFrames);
  };
  
  requestAnimationFrame(countFrames);
};

// Resource loading performance
export const trackResourceTiming = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter(resource => resource.duration > 100);
    
    if (slowResources.length > 0) {
      console.warn('Slow loading resources:', slowResources.map(r => ({
        name: r.name,
        duration: `${Math.round(r.duration)}ms`
      })));
    }
  });
};

// Initialize all performance tracking
export const initPerformanceTracking = () => {
  if (import.meta.env.DEV) {
    trackWebVitals();
    trackMemoryUsage();
    trackFPS();
    trackResourceTiming();
    
    // Track memory usage every 30 seconds in development
    setInterval(trackMemoryUsage, 30000);
  }
};
