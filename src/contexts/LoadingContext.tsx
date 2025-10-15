import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  progress: number;
  registerLoader: (id: string) => void;
  markLoaded: (id: string) => void;
  setCustomProgress: (progress: number) => void;
  preventAutoHide: () => void;
  allowAutoHide: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
  minimumLoadTime?: number; // Minimum time to show loading (ms)
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ 
  children, 
  minimumLoadTime = 1000 // Increased to 1 second to allow video preloading
}) => {
  const [loaders, setLoaders] = useState<Set<string>>(new Set());
  const [loadedItems, setLoadedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const [allContentLoaded, setAllContentLoaded] = useState(false);
  const [autoHidePrevented, setAutoHidePrevented] = useState(false);

  const registerLoader = useCallback((id: string) => {
    setLoaders(prev => new Set(prev).add(id));
  }, []);

  const markLoaded = useCallback((id: string) => {
    setLoadedItems(prev => new Set(prev).add(id));
  }, []);

  const setCustomProgress = useCallback((customProgress: number) => {
    setProgress(p => Math.min(100, Math.max(p, customProgress)));
  }, []);

  const preventAutoHide = useCallback(() => {
    setAutoHidePrevented(true);
  }, []);

  const allowAutoHide = useCallback(() => {
    setAutoHidePrevented(false);
  }, []);

  // No safety timeout - wait for actual completion
  // Loading will only complete when all loaders are done

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
            console.log('⚠️ No loaders registered, completing loading');
            setProgress(100);
            setTimeout(() => setIsLoading(false), 100);
        }
        return;
    }

    // Calculate progress based on loaded components
    const rawProgress = Math.floor((loadedCount / totalLoaders) * 100);
    
    // Log progress periodically
    if (rawProgress % 10 === 0 && rawProgress !== progress) {
      console.log(`📊 Loading: ${loadedCount}/${totalLoaders} loaders (${rawProgress}%)`);
      console.log(`   Registered: [${Array.from(loaders).join(', ')}]`);
      console.log(`   Loaded: [${Array.from(loadedItems).join(', ')}]`);
    }
    
    // Don't complete too fast - ensure smooth progression
    const timeBasedProgress = Math.min(
      Math.floor((elapsedTime / (minimumLoadTime * 2)) * 100),
      99 // Cap at 99% until everything is loaded
    );
    
    // Use the actual progress, but don't let time-based slow it down too much
    const smoothProgress = Math.max(rawProgress, timeBasedProgress);
    
    // Always move progress forward, never backward
    setProgress(prev => Math.max(prev, Math.min(smoothProgress, 99)));

    // Check for completion - be more strict
    const allLoaded = loadedCount >= totalLoaders;
    const minimumTimePassed = elapsedTime >= minimumLoadTime;

    if (allLoaded && !allContentLoaded) {
      console.log('✅ All loaders completed!');
      console.log(`   Total loaders: ${totalLoaders}`);
      console.log(`   Loaded: [${Array.from(loadedItems).join(', ')}]`);
      setAllContentLoaded(true);
    }

    // Only complete when ALL conditions are met AND auto-hide is not prevented
    if (allLoaded && minimumTimePassed && !autoHidePrevented) {
      setProgress(100);
      setTimeout(() => {
        console.log('🎉 Loading complete, hiding loading screen');
        setIsLoading(false);
      }, 300); // Give a moment for 100% to be visible
    }
  }, [loaders, loadedItems, startTime, minimumLoadTime, allContentLoaded, progress, autoHidePrevented]);

  return (
    <LoadingContext.Provider value={{
      isLoading,
      progress,
      registerLoader,
      markLoaded,
      setCustomProgress,
      preventAutoHide,
      allowAutoHide
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