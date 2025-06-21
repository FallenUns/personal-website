import { useEffect } from 'react';
import { useLoading } from '../contexts/LoadingContext';

interface UseAssetPreloaderOptions {
  images?: string[];
  fonts?: string[];
  scripts?: string[];
}

export const useAssetPreloader = (options: UseAssetPreloaderOptions = {}) => {
  const { registerLoader, markLoaded, setCustomProgress } = useLoading();
  
  useEffect(() => {
    const { images = [], fonts = [], scripts = [] } = options;
    const totalAssets = images.length + fonts.length + scripts.length;
    
    if (totalAssets === 0) return;

    registerLoader('asset-preloader');
    let loadedCount = 0;

    const updateProgress = () => {
      loadedCount++;
      const progress = (loadedCount / totalAssets) * 100;
      setCustomProgress(progress);
      
      if (loadedCount === totalAssets) {
        markLoaded('asset-preloader');
      }
    };

    // Preload images
    const imagePromises = images.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          updateProgress();
          resolve();
        };
        img.onerror = () => {
          updateProgress(); // Still count as loaded to prevent hanging
          resolve();
        };
        img.src = src;
      });
    });

    // Preload fonts
    const fontPromises = fonts.map((fontFamily) => {
      return new Promise<void>((resolve) => {
        if ('fonts' in document) {
          document.fonts.load(`1em ${fontFamily}`).then(() => {
            updateProgress();
            resolve();
          }).catch(() => {
            updateProgress();
            resolve();
          });
        } else {
          // Fallback for browsers without FontFace API
          updateProgress();
          resolve();
        }
      });
    });

    // Preload scripts
    const scriptPromises = scripts.map((src) => {
      return new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.onload = () => {
          updateProgress();
          resolve();
        };
        script.onerror = () => {
          updateProgress();
          resolve();
        };
        script.src = src;
        document.head.appendChild(script);
      });
    });

    // Execute all preloading
    Promise.all([...imagePromises, ...fontPromises, ...scriptPromises]);

  }, [registerLoader, markLoaded, setCustomProgress, options]);
};

// Hook for preloading critical resources
export const useCriticalResourceLoader = () => {
  const { registerLoader, markLoaded } = useLoading();

  useEffect(() => {
    console.log('Critical resources loader starting');
    registerLoader('critical-resources');

    // Simulate critical resource loading (fonts, initial CSS, etc.)
    const criticalLoadTimer = setTimeout(() => {
      console.log('Critical resources loaded');
      markLoaded('critical-resources');
    }, 800); // Simulate 800ms for critical resources

    return () => clearTimeout(criticalLoadTimer);
  }, [registerLoader, markLoaded]);
};
