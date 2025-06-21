import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface SimpleLoadingContextType {
  isLoading: boolean;
  progress: number;
}

const SimpleLoadingContext = createContext<SimpleLoadingContextType | undefined>(undefined);

interface SimpleLoadingProviderProps {
  children: ReactNode;
  loadingTime?: number; // Total loading time in ms
}

export const SimpleLoadingProvider: React.FC<SimpleLoadingProviderProps> = ({ 
  children, 
  loadingTime = 3000 // 3 seconds total
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    // Update progress smoothly over time
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min(100, (elapsed / loadingTime) * 100);
      
      setProgress(progressPercent);
      
      if (progressPercent >= 100) {
        clearInterval(progressInterval);
        // Small delay before hiding
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      }
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(progressInterval);
  }, [loadingTime]);

  return (
    <SimpleLoadingContext.Provider value={{
      isLoading,
      progress
    }}>
      {children}
    </SimpleLoadingContext.Provider>
  );
};

export const useSimpleLoading = () => {
  const context = useContext(SimpleLoadingContext);
  if (context === undefined) {
    throw new Error('useSimpleLoading must be used within a SimpleLoadingProvider');
  }
  return context;
};
