import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  progress: number;
  registerLoader: (id: string) => void;
  markLoaded: (id: string) => void;
  setCustomProgress: (progress: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
  minimumLoadTime?: number; // Minimum time to show loading (ms)
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ 
  children, 
  minimumLoadTime = 2000 // 2 seconds minimum
}) => {
  const [loaders, setLoaders] = useState<Set<string>>(new Set());
  const [loadedItems, setLoadedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());

  const registerLoader = (id: string) => {
    setLoaders(prev => new Set(prev).add(id));
  };

  const markLoaded = (id: string) => {
    setLoadedItems(prev => new Set(prev).add(id));
  };

  const setCustomProgress = (customProgress: number) => {
    setProgress(Math.min(100, Math.max(0, customProgress)));
  };

  // Safety timeout to ensure loading never gets stuck
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      console.log('Safety timeout triggered - forcing loading completion');
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }, minimumLoadTime + 2000); // Safety net after minimum time + 2 seconds

    return () => clearTimeout(safetyTimer);
  }, [minimumLoadTime]);

  // Calculate progress and manage loading state
  useEffect(() => {
    const totalLoaders = loaders.size;
    const loadedCount = loadedItems.size;
    
    // Debug logging
    console.log('Loading Debug:', {
      totalLoaders,
      loadedCount,
      loaders: Array.from(loaders),
      loadedItems: Array.from(loadedItems)
    });
    
    if (totalLoaders === 0) {
      // If no loaders registered yet, show initial progress and wait a bit
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > 1000) { // After 1 second, start increasing progress even without loaders
        const timeProgress = Math.min(90, ((elapsedTime - 1000) / minimumLoadTime) * 90);
        setProgress(10 + timeProgress);
        
        // If minimum time passed and still no loaders, complete loading
        if (elapsedTime >= minimumLoadTime) {
          setProgress(100);
          const hideTimer = setTimeout(() => {
            setIsLoading(false);
          }, 300);
          return () => clearTimeout(hideTimer);
        }
      } else {
        setProgress(10);
      }
      return;
    }

    // Calculate base progress from loaded components
    const baseProgress = totalLoaders > 0 ? (loadedCount / totalLoaders) * 90 : 0;
    
    // Add time-based progress for smooth animation
    const elapsedTime = Date.now() - startTime;
    const timeProgress = Math.min(10, (elapsedTime / minimumLoadTime) * 10);
    
    const newProgress = Math.min(100, baseProgress + timeProgress);
    setProgress(newProgress);

    // Check if everything is loaded and minimum time has passed
    const allLoaded = totalLoaders > 0 && loadedCount >= totalLoaders;
    const minimumTimePassed = elapsedTime >= minimumLoadTime;
    
    if (allLoaded && minimumTimePassed && newProgress >= 100) {
      // Add a small delay before hiding loading
      const hideTimer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      
      return () => clearTimeout(hideTimer);
    }
  }, [loaders, loadedItems, startTime, minimumLoadTime]);

  return (
    <LoadingContext.Provider value={{
      isLoading,
      progress,
      registerLoader,
      markLoaded,
      setCustomProgress
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Hook for components to register themselves for loading tracking
export const useComponentLoader = (componentId: string) => {
  const { registerLoader, markLoaded } = useLoading();
  
  useEffect(() => {
    console.log(`Registering component: ${componentId}`);
    registerLoader(componentId);
    
    // Simulate component load time or mark as loaded immediately
    const loadTimer = setTimeout(() => {
      console.log(`Marking component loaded: ${componentId}`);
      markLoaded(componentId);
    }, 100 + Math.random() * 400); // Random delay between 100-500ms for realistic loading
    
    return () => clearTimeout(loadTimer);
  }, [componentId, registerLoader, markLoaded]);
};
