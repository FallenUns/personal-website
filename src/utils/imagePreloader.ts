import { projects } from '../data/projects';

// Collect all images used throughout the application
export const getAllImages = (): string[] => {
  const heroImages = [
    '/Subject.png',
    '/react-logo.png',
    '/python-logo.png',
    '/js-logo.png',
    '/tensorflow-logo.png',
    '/r-logo.png',
    '/sql-logo.png',
    '/logo.png'
  ];

  // Collect project images from data
  const projectImages: string[] = [];
  projects.forEach((project) => {
    if (project.images && project.images.length > 0) {
      projectImages.push(...project.images);
    }
  });

  // Additional static images
  const staticImages = [
    '/cliniwatch-1.png',
    '/portfolio-1.png'
  ];

  // Combine and deduplicate all images
  const allUniqueImages = [...new Set([...heroImages, ...projectImages, ...staticImages])];
  
  return allUniqueImages;
};

// Cache for preloaded images with proper browser integration
const imageCache = new Map<string, HTMLImageElement>();
const imageBlobCache = new Map<string, string>();

// Force image into browser cache using link preload
const addImageToDocumentCache = (src: string) => {
  // Check if we already have a preload link for this image
  const existingLink = document.querySelector(`link[rel="preload"][href="${src}"]`);
  if (existingLink) return;

  // Create preload link to force browser caching
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

// Preload a single image and return a promise
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  // Return cached image if already loaded
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  return new Promise((resolve, reject) => {
    // First, add to browser's preload cache
    addImageToDocumentCache(src);
    
    const img = new Image();
    
    // Important: Set these BEFORE setting src to ensure proper caching
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log(`✅ Successfully preloaded and cached: ${src}`);
      imageCache.set(src, img);
      
      // Store blob URL for even better caching
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            imageBlobCache.set(src, blobUrl);
          }
        });
      }
      
      resolve(img);
    };
    
    img.onerror = () => {
      console.warn(`❌ Failed to load image: ${src}`);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    // Start loading the image
    img.src = src;
  });
};

// Preload all images with progress tracking
export const preloadAllImages = (
  onProgress?: (loaded: number, total: number, currentImage: string) => void
): Promise<{ loaded: HTMLImageElement[], failed: string[] }> => {
  const allImages = getAllImages();
  const loaded: HTMLImageElement[] = [];
  const failed: string[] = [];
  const startTime = performance.now();
  
  console.log(`🚀 Starting to preload ${allImages.length} images:`, allImages);
  
  // Force browser to preload each image by adding preload links immediately
  allImages.forEach(src => addImageToDocumentCache(src));
  
  const promises = allImages.map((src) => {
    return preloadImage(src)
      .then((img) => {
        loaded.push(img);
        
        // Report progress immediately - let LoadingContext handle timing
        onProgress?.(loaded.length + failed.length, allImages.length, src);
        console.log(`✅ Loaded and cached image ${loaded.length + failed.length}/${allImages.length}: ${src}`);
      })
      .catch((error) => {
        failed.push(src);
        onProgress?.(loaded.length + failed.length, allImages.length, src);
        console.warn(`❌ Failed to load image ${loaded.length + failed.length}/${allImages.length}: ${src}`, error);
      });
  });
  
  return Promise.allSettled(promises).then(() => {
    const totalTime = performance.now() - startTime;
    console.log(`🎉 Image preloading complete in ${totalTime.toFixed(2)}ms! Loaded: ${loaded.length}, Failed: ${failed.length}`);
    if (loaded.length > 0) {
      console.log(`📦 Successfully cached ${loaded.length} images for instant access`);
    }
    return { loaded, failed };
  });
};

// Get a preloaded image from cache
export const getCachedImage = (src: string): HTMLImageElement | null => {
  return imageCache.get(src) || null;
};

// Get cached blob URL for an image (for even better performance)
export const getCachedImageBlob = (src: string): string | null => {
  return imageBlobCache.get(src) || null;
};

// Get the best available cached version of an image
export const getBestCachedImageSrc = (src: string): string => {
  // First try blob URL for maximum performance
  const blobUrl = getCachedImageBlob(src);
  if (blobUrl) return blobUrl;
  
  // Fall back to original URL (should be in browser cache)
  return src;
};

// Check if all images are preloaded
export const areAllImagesPreloaded = (): boolean => {
  const allImages = getAllImages();
  return allImages.every(src => imageCache.has(src));
};

// Hook to get loading state
export const getImageLoadingProgress = (): { 
  totalImages: number; 
  loadedImages: number; 
  isComplete: boolean; 
} => {
  const allImages = getAllImages();
  const loadedImages = allImages.filter(src => imageCache.has(src)).length;
  
  return {
    totalImages: allImages.length,
    loadedImages,
    isComplete: loadedImages === allImages.length
  };
};