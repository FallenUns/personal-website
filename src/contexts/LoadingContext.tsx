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
  minimumLoadTime = 300 // Reduced to 300ms for much faster experience
}) => {
  const [loaders, setLoaders] = useState<Set<string>>(new Set());
  const [loadedItems, setLoadedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const [allContentLoaded, setAllContentLoaded] = useState(false);

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
        setProgress(100);
        setTimeout(() => setIsLoading(false), 100);
      }
    }, 8000); // Reduced to 8 seconds - sufficient for most connections

    return () => clearTimeout(safetyTimer);
  }, [minimumLoadTime, isLoading]);

  // Calculate progress and manage loading state
  useEffect(() => {
    const totalLoaders = loaders.size;
    const loadedCount = loadedItems.size;
    const elapsedTime = Date.now() - startTime;

    // If no loaders have registered yet, keep progress at 0
    if (totalLoaders === 0) {
        setProgress(0);
        // If minimum time passes and still no loaders, finish loading
        if (elapsedTime >= minimumLoadTime) {
            setProgress(100);
            setTimeout(() => setIsLoading(false), 100); // Fast transition
        }
        return;
    }

    // Calculate progress based on loaded components
    const rawProgress = Math.floor((loadedCount / totalLoaders) * 100);
    
    // For fast connections, smooth out the progress updates
    const timeBasedProgress = Math.floor((elapsedTime / minimumLoadTime) * 100);
    const smoothProgress = Math.min(rawProgress, timeBasedProgress);
    
    // Always move progress forward, never backward
    setProgress(prev => Math.max(prev, smoothProgress));

    // Check for completion
    const allLoaded = loadedCount >= totalLoaders;
    const minimumTimePassed = elapsedTime >= minimumLoadTime;

    if (allLoaded && !allContentLoaded) {
      setAllContentLoaded(true);
    }

    // Special case: if everything loads super fast (under 200ms), don't wait
    if (allLoaded && elapsedTime < 200) {
      setProgress(100);
      setTimeout(() => setIsLoading(false), 50); // Almost immediate for super fast loading
    }
    // Normal case: respect minimum time but transition quickly
    else if (allLoaded && minimumTimePassed) {
      setProgress(100);
      setTimeout(() => setIsLoading(false), 100); // Super fast transition when at 100%
    }
  }, [loaders, loadedItems, startTime, minimumLoadTime, allContentLoaded]);

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
    registerLoader(componentId);
    
    // Simulate component loading time for better UX
    const loadTimer = setTimeout(() => {
      markLoaded(componentId);
    }, 100 + Math.random() * 200); // 100-300ms simulation
    
    return () => clearTimeout(loadTimer);
  }, [componentId, registerLoader, markLoaded]);
};