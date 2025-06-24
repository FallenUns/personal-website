import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  minimumLoadTime = 200 // 200 ms minimum
}) => {
  const [loaders, setLoaders] = useState<Set<string>>(new Set());
  const [loadedItems, setLoadedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());

  const registerLoader = useCallback((id: string) => {
    setLoaders(prev => new Set(prev).add(id));
  }, []);

  const markLoaded = useCallback((id: string) => {
    setLoadedItems(prev => new Set(prev).add(id));
  }, []);

  const setCustomProgress = useCallback((customProgress: number) => {
    setProgress(p => Math.min(100, Math.max(p, customProgress)));
  }, []);

  // Safety timeout to ensure loading never gets stuck
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        console.log('Safety timeout triggered - forcing loading completion');
        setProgress(100);
        setTimeout(() => setIsLoading(false), 300);
      }
    }, minimumLoadTime);

    return () => clearTimeout(safetyTimer);
  }, [minimumLoadTime, isLoading]);

  // Calculate progress and manage loading state
  useEffect(() => {
    const totalLoaders = loaders.size;
    const loadedCount = loadedItems.size;
    const elapsedTime = Date.now() - startTime;

    // If no loaders have registered, progress is 0.
    if (totalLoaders === 0) {
        setProgress(0);
        // If minimum time passes and still no loaders, finish.
        if (elapsedTime >= minimumLoadTime) {
            setProgress(100);
            const hideTimer = setTimeout(() => setIsLoading(false), 300);
            return () => clearTimeout(hideTimer);
        }
        return;
    }

    // Calculate progress based purely on loaded components.
    const newProgress = Math.floor((loadedCount / totalLoaders) * 100);
    setProgress(newProgress);

    // Check for completion
    const allLoaded = loadedCount >= totalLoaders;
    const minimumTimePassed = elapsedTime >= minimumLoadTime;

    if (allLoaded && minimumTimePassed) {
        // Ensure progress hits 100 before hiding.
        if (progress < 100) {
            setProgress(100);
        }
      
        const hideTimer = setTimeout(() => {
            setIsLoading(false);
        }, 300); // Small delay to show 100%
      
        return () => clearTimeout(hideTimer);
    }
  }, [loaders, loadedItems, startTime, minimumLoadTime, progress]);

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
    }, 500 + Math.random() * 1000); // Increased random delay for a more visible progress
    
    return () => clearTimeout(loadTimer);
  }, [componentId, registerLoader, markLoaded]);
};