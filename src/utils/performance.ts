// Performance monitoring utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private observers: Map<string, PerformanceObserver> = new Map();
  private metrics: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Monitor frame rates during scroll
  monitorScrollPerformance() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure' && entry.name.includes('scroll')) {
          const frameTimes = this.metrics.get('scroll-frames') || [];
          frameTimes.push(entry.duration);
          this.metrics.set('scroll-frames', frameTimes);
          
          // Log performance warnings
          if (entry.duration > 16.67) { // >60fps
            console.warn(`Slow scroll frame detected: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
    this.observers.set('scroll', observer);
  }

  // Monitor component render times
  measureComponentRender(componentName: string, renderFn: () => void) {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    const renderTimes = this.metrics.get(`${componentName}-render`) || [];
    renderTimes.push(duration);
    this.metrics.set(`${componentName}-render`, renderTimes);

    if (duration > 16) {
      console.warn(`Slow ${componentName} render: ${duration.toFixed(2)}ms`);
    }
  }

  // Get performance statistics
  getStats(metricName: string): { avg: number; max: number; min: number } | null {
    const values = this.metrics.get(metricName);
    if (!values || values.length === 0) return null;

    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values),
    };
  }

  // Clean up observers
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }
}

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();

  const measureRender = (renderFn: () => void) => {
    monitor.measureComponentRender(componentName, renderFn);
  };

  return { measureRender };
};

// Throttle function optimized for performance
export const performanceThrottle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = performance.now();
    
    if (currentTime - lastExecTime > delay) {
      if (timeoutId) {
        cancelAnimationFrame(timeoutId);
        timeoutId = null;
      }
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        cancelAnimationFrame(timeoutId);
      }
      
      timeoutId = requestAnimationFrame(() => {
        func(...args);
        lastExecTime = performance.now();
        timeoutId = null;
      });
    }
  };
};

// Detect if device has limited performance
export const isLowPerformanceDevice = (): boolean => {
  // Check for various performance indicators
  if ('hardwareConcurrency' in navigator && navigator.hardwareConcurrency <= 2) {
    return true;
  }
  
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
      return true;
    }
  }
  
  // Check device memory (if available)
  if ('deviceMemory' in navigator && (navigator as any).deviceMemory <= 2) {
    return true;
  }
  
  return false;
};

// Performance-optimized intersection observer
export const createPerformantIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  const throttledCallback: IntersectionObserverCallback = performanceThrottle(
    callback,
    16 // ~60fps
  );
  
  return new IntersectionObserver(throttledCallback, {
    rootMargin: '50px',
    threshold: [0, 0.1, 0.5, 1.0],
    ...options,
  });
};
