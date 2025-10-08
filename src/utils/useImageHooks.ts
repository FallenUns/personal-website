import { useEffect, useState } from 'react';
import { getCachedImage, areAllImagesPreloaded, getImageLoadingProgress } from './imagePreloader';

// Hook to check if a specific image is preloaded
export const useImageReady = (src: string): boolean => {
  const [isReady, setIsReady] = useState(() => getCachedImage(src) !== null);

  useEffect(() => {
    if (isReady) return;

    const checkImage = () => {
      const cachedImage = getCachedImage(src);
      if (cachedImage) {
        setIsReady(true);
      }
    };

    // Check immediately
    checkImage();

    // Set up interval to check periodically until loaded
    const interval = setInterval(checkImage, 100);

    return () => clearInterval(interval);
  }, [src, isReady]);

  return isReady;
};

// Hook to check if all images are preloaded
export const useAllImagesReady = (): boolean => {
  const [allReady, setAllReady] = useState(() => areAllImagesPreloaded());

  useEffect(() => {
    if (allReady) return;

    const checkAllImages = () => {
      if (areAllImagesPreloaded()) {
        setAllReady(true);
      }
    };

    // Check immediately
    checkAllImages();

    // Set up interval to check periodically until all loaded
    const interval = setInterval(checkAllImages, 100);

    return () => clearInterval(interval);
  }, [allReady]);

  return allReady;
};

// Hook to get image loading progress
export const useImageLoadingProgress = () => {
  const [progress, setProgress] = useState(() => getImageLoadingProgress());

  useEffect(() => {
    if (progress.isComplete) return;

    const updateProgress = () => {
      const newProgress = getImageLoadingProgress();
      setProgress(newProgress);
    };

    // Check immediately
    updateProgress();

    // Set up interval to check periodically until complete
    const interval = setInterval(updateProgress, 100);

    return () => clearInterval(interval);
  }, [progress.isComplete]);

  return progress;
};

// Hook to get a preloaded image element
export const usePreloadedImage = (src: string): HTMLImageElement | null => {
  const [image, setImage] = useState<HTMLImageElement | null>(() => getCachedImage(src));

  useEffect(() => {
    if (image) return;

    const checkImage = () => {
      const cachedImage = getCachedImage(src);
      if (cachedImage) {
        setImage(cachedImage);
      }
    };

    // Check immediately
    checkImage();

    // Set up interval to check periodically until loaded
    const interval = setInterval(checkImage, 100);

    return () => clearInterval(interval);
  }, [src, image]);

  return image;
};