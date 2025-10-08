import React, { useState, useEffect } from 'react';
import { getCachedImage, getBestCachedImageSrc, areAllImagesPreloaded } from './imagePreloader';

// Hook to use a preloaded image with automatic fallback
export const usePreloadedImage = (src: string) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkAndSetImage = () => {
      const cachedImage = getCachedImage(src);
      if (cachedImage) {
        // Use the best cached version (blob URL if available)
        const bestSrc = getBestCachedImageSrc(src);
        setImageSrc(bestSrc);
        setIsLoaded(true);
        console.log(`🎯 Using cached image for: ${src} -> ${bestSrc !== src ? 'blob URL' : 'original'}`);
      } else {
        // Image not cached yet, keep checking
        setTimeout(checkAndSetImage, 100);
      }
    };

    checkAndSetImage();
  }, [src]);

  return { src: imageSrc, isLoaded };
};

// Hook to check if all images are ready
export const useImagesReady = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkReady = () => {
      if (areAllImagesPreloaded()) {
        setReady(true);
        console.log('🎉 All images are preloaded and ready!');
      } else {
        setTimeout(checkReady, 100);
      }
    };

    checkReady();
  }, []);

  return ready;
};

// Component wrapper that ensures image is preloaded before rendering
export const PreloadedImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}> = ({ src, alt, className, style, onLoad, onError }) => {
  const { src: preloadedSrc, isLoaded } = usePreloadedImage(src);

  if (!isLoaded) {
    // Return a placeholder or loading state
    return (
      <div 
        className={`${className || ''} bg-gray-200 animate-pulse`} 
        style={style}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  return (
    <img
      src={preloadedSrc}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
      onError={onError}
      loading="eager" // Force immediate loading since it's preloaded
    />
  );
};