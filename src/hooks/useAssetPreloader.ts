import { useEffect, useRef } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { preloadAllImages } from '../utils/imagePreloader';

interface UseAssetPreloaderOptions {
  images?: string[];
  fonts?: string[];
  scripts?: string[];
  onProgress?: (loaded: number, total: number) => void;
  onError?: (error: string, asset: string) => void;
}

// Cache for loaded assets to prevent reloading
const assetCache = new Set<string>();

// Hook for comprehensive image preloading using the new image preloader
export const useImagePreloader = () => {
  const { registerLoader, markLoaded, setCustomProgress } = useLoading();
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasStartedRef = useRef(false); // Prevent duplicate preloading
  
  useEffect(() => {
    // Prevent duplicate preloading
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    registerLoader('image-preloader');
    console.log('🚀 Starting comprehensive image preloading...');
    
    // Use the enhanced image preloader
    preloadAllImages((loaded, total, currentImage) => {
      if (signal.aborted) return;
      
      // Let LoadingContext handle progress smoothing - just report actual progress
      const rawProgress = (loaded / total) * 100;
      
      console.log(`📸 Image loading progress: ${loaded}/${total} (${rawProgress.toFixed(1)}%) - ${currentImage}`);
      setCustomProgress(rawProgress);
      
      if (loaded === total) {
        console.log('🎉 All images preloaded successfully!');
        // Mark as loaded immediately - let LoadingContext handle timing
        markLoaded('image-preloader');
      }
    }).catch((error) => {
      console.error('❌ Error during image preloading:', error);
      // Still mark as loaded to prevent infinite loading
      setTimeout(() => markLoaded('image-preloader'), 500);
    });

    // Cleanup function
    return () => {
      abortControllerRef.current?.abort();
      hasStartedRef.current = false; // Reset for potential future use
    };
  }, [registerLoader, markLoaded, setCustomProgress]);
};

export const useAssetPreloader = (options: UseAssetPreloaderOptions = {}) => {
  const { registerLoader, markLoaded, setCustomProgress } = useLoading();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  useEffect(() => {
    const { images = [], fonts = [], scripts = [], onProgress, onError } = options;
    
    // Filter out already cached assets
    const uncachedImages = images.filter((src: string) => !assetCache.has(src));
    const uncachedFonts = fonts.filter((font: string) => !assetCache.has(font));
    const uncachedScripts = scripts.filter((src: string) => !assetCache.has(src));
    
    const totalAssets = uncachedImages.length + uncachedFonts.length + uncachedScripts.length;
    
    if (totalAssets === 0) {
      // All assets are cached, mark as loaded immediately
      if (images.length > 0 || fonts.length > 0 || scripts.length > 0) {
        registerLoader('asset-preloader');
        markLoaded('asset-preloader');
      }
      return;
    }

    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    registerLoader('asset-preloader');
    console.log(`Starting to preload ${totalAssets} assets:`, {
      images: uncachedImages.length,
      fonts: uncachedFonts.length,
      scripts: uncachedScripts.length
    });
    
    let loadedCount = 0;
    let errorCount = 0;

    const updateProgress = (assetUrl?: string, isError = false) => {
      if (signal.aborted) return;
      
      loadedCount++;
      
      if (assetUrl) {
        if (isError) {
          errorCount++;
          console.warn(`Failed to load asset: ${assetUrl}`);
          onError?.('Failed to load asset', assetUrl);
        } else {
          console.log(`Successfully loaded asset: ${assetUrl}`);
          assetCache.add(assetUrl);
        }
      }
      
      const progress = (loadedCount / totalAssets) * 100;
      console.log(`Asset loading progress: ${loadedCount}/${totalAssets} (${progress.toFixed(1)}%)`);
      setCustomProgress(progress);
      onProgress?.(loadedCount, totalAssets);
      
      if (loadedCount === totalAssets) {
        console.log(`All assets loaded! Errors: ${errorCount}/${totalAssets}`);
        markLoaded('asset-preloader');
      }
    };

    // Preload images
    const imagePromises = uncachedImages.map((src: string) => {
      return new Promise<void>((resolve) => {
        if (signal.aborted) {
          resolve();
          return;
        }
        
        const img = new Image();
        
        // Set a timeout for slow connections
        const imageTimeout = setTimeout(() => {
          console.warn(`Image loading timeout for: ${src}`);
          updateProgress(src, true); // Count as error after timeout
          resolve();
        }, 10000); // 10 second timeout for each image
        
        img.onload = () => {
          clearTimeout(imageTimeout);
          updateProgress(src, false);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(imageTimeout);
          updateProgress(src, true); // Count as error
          resolve();
        };
        
        // Start loading the image
        img.src = src;
        
        // Handle abort
        signal.addEventListener('abort', () => {
          clearTimeout(imageTimeout);
          img.onload = null;
          img.onerror = null;
          resolve();
        });
      });
    });

    // Preload fonts
    const fontPromises = uncachedFonts.map((fontFamily: string) => {
      return new Promise<void>((resolve) => {
        if (signal.aborted) {
          resolve();
          return;
        }
        
        if ('fonts' in document) {
          document.fonts.load(`1em ${fontFamily}`).then(() => {
            updateProgress(fontFamily, false);
            resolve();
          }).catch(() => {
            updateProgress(fontFamily, true);
            resolve();
          });
        } else {
          // Fallback for browsers without FontFace API
          updateProgress(fontFamily, false);
          resolve();
        }
      });
    });

    // Preload scripts
    const scriptElements: HTMLScriptElement[] = [];
    const scriptPromises = uncachedScripts.map((src: string) => {
      return new Promise<void>((resolve) => {
        if (signal.aborted) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.onload = () => {
          updateProgress(src, false);
          resolve();
        };
        script.onerror = () => {
          updateProgress(src, true);
          resolve();
        };
        script.src = src;
        scriptElements.push(script);
        document.head.appendChild(script);
        
        // Handle abort
        signal.addEventListener('abort', () => {
          script.onload = null;
          script.onerror = null;
          resolve();
        });
      });
    });

    // Execute all preloading
    Promise.all([...imagePromises, ...fontPromises, ...scriptPromises]);

    // Cleanup function
    return () => {
      // Abort any ongoing requests
      abortControllerRef.current?.abort();
      
      // Remove any script elements that were added
      scriptElements.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerLoader, markLoaded, setCustomProgress, options.images?.join(','), options.fonts?.join(','), options.scripts?.join(',')]);
};

// Hook for preloading critical resources
export const useCriticalResourceLoader = () => {
  const { registerLoader, markLoaded } = useLoading();

  useEffect(() => {
    registerLoader('critical-resources');

    // Simulate critical resource loading (fonts, initial CSS, etc.)
    const criticalLoadTimer = setTimeout(() => {
      markLoaded('critical-resources');
    }, 1200); // Increased time for 3D resources

    return () => clearTimeout(criticalLoadTimer);
  }, [registerLoader, markLoaded]);
};

// Hook specifically for 3D components that need WebGL context
export const use3DResourceLoader = (componentId: string) => {
  const { registerLoader, markLoaded } = useLoading();

  useEffect(() => {
    registerLoader(componentId);

    // Wait for WebGL context and shaders to compile
    const loadTimer = setTimeout(() => {
      markLoaded(componentId);
    }, 1500); // Give enough time for 3D initialization

    return () => clearTimeout(loadTimer);
  }, [componentId, registerLoader, markLoaded]);
};