import React, { useState, useEffect } from 'react';
import { getCachedImage, getCachedImageBlob, areAllImagesPreloaded } from './imagePreloader';

// Hook to use a preloaded image with automatic fallback
export const usePreloadedImage = (src: string) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Try blob URL first for best performance
    const blobUrl = getCachedImageBlob(src);
    if (blobUrl) {
      setImageSrc(blobUrl);
      setIsLoaded(true);
      return;
    }

    // Then try cached image
    const cachedImage = getCachedImage(src);
    if (cachedImage) {
      setImageSrc(cachedImage.src);
      setIsLoaded(true);
      return;
    }

    // Otherwise use the original source. This is a normal first-render path:
    // the component can mount before the async media warmup finishes.
    setImageSrc(src);
    setIsLoaded(true);
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
  const { src: preloadedSrc } = usePreloadedImage(src);

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
