import { projects } from '../data/projects';

// Helper to check if a file is a video
const isVideoFile = (src: string): boolean => {
  return /\.(mp4|webm|mov)$/i.test(src);
};

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

  // Collect project images from data (excluding videos)
  const projectImages: string[] = [];
  projects.forEach((project) => {
    if (project.images && project.images.length > 0) {
      projectImages.push(...project.images.filter(img => !isVideoFile(img)));
    }
  });

  // Combine and deduplicate all images
  const allUniqueImages = [...new Set([...heroImages, ...projectImages])];
  
  return allUniqueImages;
};

// Collect all videos used throughout the application
export const getAllVideos = (): string[] => {
  const projectVideos: string[] = [];
  projects.forEach((project) => {
    if (project.images && project.images.length > 0) {
      projectVideos.push(...project.images.filter(img => isVideoFile(img)));
    }
  });

  // Combine and deduplicate all videos
  const allUniqueVideos = [...new Set(projectVideos)];
  
  return allUniqueVideos;
};

// Cache for preloaded images with proper browser integration
const imageCache = new Map<string, HTMLImageElement>();
const imageBlobCache = new Map<string, string>();

// Cache for preloaded videos
const videoCache = new Map<string, HTMLVideoElement>();
const videoBlobCache = new Map<string, string>();

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
  // Don't set crossorigin for same-origin resources to avoid mismatch warnings
  // crossorigin is only needed for cross-origin resources
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
    
    // Fetch as blob for better caching - use same-origin mode for local resources
    fetch(src, { 
      mode: 'same-origin',
      credentials: 'same-origin'
    })
      .then(response => response.blob())
      .then(blob => {
        // Create blob URL for the image
        const blobUrl = URL.createObjectURL(blob);
        imageBlobCache.set(src, blobUrl);
        
        const img = new Image();
        
        img.onload = () => {
          console.log(`✅ Successfully preloaded and cached as blob: ${src}`);
          imageCache.set(src, img);
          resolve(img);
        };
        
        img.onerror = () => {
          console.warn(`❌ Failed to load image blob: ${src}`);
          reject(new Error(`Failed to load image: ${src}`));
        };
        
        // Use the blob URL
        img.src = blobUrl;
      })
      .catch(() => {
        // Fallback to direct loading if fetch fails
        console.warn(`⚠️ Fetch failed for ${src}, falling back to direct load`);
        const img = new Image();
        
        // Don't set crossOrigin for same-origin resources
        // img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          console.log(`✅ Successfully preloaded (fallback): ${src}`);
          imageCache.set(src, img);
          resolve(img);
        };
        
        img.onerror = () => {
          console.warn(`❌ Failed to load image: ${src}`);
          reject(new Error(`Failed to load image: ${src}`));
        };
        
        img.src = src;
      });
  });
};

// Preload a single video and return a promise
export const preloadVideo = (src: string): Promise<HTMLVideoElement> => {
  // Return cached video if already loaded
  if (videoCache.has(src)) {
    console.log(`📹 Video already cached: ${src}`);
    return Promise.resolve(videoCache.get(src)!);
  }

  return new Promise((resolve, reject) => {
    // First, fetch the video as a blob to ensure it's fully cached
    fetch(src, {
      mode: 'same-origin',
      credentials: 'same-origin'
    })
      .then(response => response.blob())
      .then(blob => {
        // Create a blob URL for the video
        const blobUrl = URL.createObjectURL(blob);
        videoBlobCache.set(src, blobUrl);
        
        const video = document.createElement('video');
        
        // Set video attributes for preloading
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        
        let hasResolved = false;
        
        const onCanPlayThrough = () => {
          if (hasResolved) return;
          hasResolved = true;
          
          console.log(`✅ Successfully preloaded and cached video as blob: ${src}`);
          videoCache.set(src, video);
          
          // Clean up event listeners
          video.removeEventListener('canplaythrough', onCanPlayThrough);
          video.removeEventListener('loadeddata', onLoadedData);
          video.removeEventListener('error', onError);
          
          resolve(video);
        };
        
        const onLoadedData = () => {
          // Also resolve on loadeddata as a fallback
          if (hasResolved) return;
          
          // Give it a moment to ensure data is ready
          setTimeout(() => {
            if (!hasResolved) {
              hasResolved = true;
              console.log(`✅ Successfully preloaded video blob (loadeddata): ${src}`);
              videoCache.set(src, video);
              
              video.removeEventListener('canplaythrough', onCanPlayThrough);
              video.removeEventListener('loadeddata', onLoadedData);
              video.removeEventListener('error', onError);
              
              resolve(video);
            }
          }, 100);
        };
        
        const onError = (e: Event) => {
          if (hasResolved) return;
          hasResolved = true;
          
          console.warn(`❌ Failed to load video blob: ${src}`, e);
          
          // Clean up event listeners
          video.removeEventListener('canplaythrough', onCanPlayThrough);
          video.removeEventListener('loadeddata', onLoadedData);
          video.removeEventListener('error', onError);
          
          reject(new Error(`Failed to load video: ${src}`));
        };
        
        video.addEventListener('canplaythrough', onCanPlayThrough);
        video.addEventListener('loadeddata', onLoadedData);
        video.addEventListener('error', onError);
        
        // Set a timeout to prevent hanging
        const timeout = setTimeout(() => {
          if (!hasResolved && video.readyState >= 2) {
            // If we have enough data loaded, resolve anyway
            hasResolved = true;
            console.log(`✅ Video blob preloaded (timeout with ready data): ${src}`);
            videoCache.set(src, video);
            clearTimeout(timeout);
            resolve(video);
          }
        }, 15000); // 15 second timeout
        
        // Use the blob URL instead of the original src
        video.src = blobUrl;
        video.load();
      })
      .catch(error => {
        console.error(`❌ Failed to fetch video: ${src}`, error);
        reject(error);
      });
  });
};

// Preload all images with progress tracking
export const preloadAllImages = (
  onProgress?: (loaded: number, total: number, currentAsset: string) => void
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

// Preload all videos with progress tracking
export const preloadAllVideos = (
  onProgress?: (loaded: number, total: number, currentVideo: string) => void
): Promise<{ loaded: HTMLVideoElement[], failed: string[] }> => {
  const allVideos = getAllVideos();
  const loaded: HTMLVideoElement[] = [];
  const failed: string[] = [];
  const startTime = performance.now();
  
  if (allVideos.length === 0) {
    console.log('📹 No videos to preload');
    return Promise.resolve({ loaded, failed });
  }
  
  console.log(`🚀 Starting to preload ${allVideos.length} videos:`, allVideos);
  
  const promises = allVideos.map((src) => {
    return preloadVideo(src)
      .then((video) => {
        loaded.push(video);
        
        // Report progress immediately
        onProgress?.(loaded.length + failed.length, allVideos.length, src);
        console.log(`✅ Loaded and cached video ${loaded.length + failed.length}/${allVideos.length}: ${src}`);
      })
      .catch((error) => {
        failed.push(src);
        onProgress?.(loaded.length + failed.length, allVideos.length, src);
        console.warn(`❌ Failed to load video ${loaded.length + failed.length}/${allVideos.length}: ${src}`, error);
      });
  });
  
  return Promise.allSettled(promises).then(() => {
    const totalTime = performance.now() - startTime;
    console.log(`🎉 Video preloading complete in ${totalTime.toFixed(2)}ms! Loaded: ${loaded.length}, Failed: ${failed.length}`);
    if (loaded.length > 0) {
      console.log(`📦 Successfully cached ${loaded.length} videos for instant access`);
    }
    return { loaded, failed };
  });
};

// Preload all media (images + videos) with combined progress tracking
// LOADS VIDEOS FIRST since they are the heaviest resources
export const preloadAllMedia = (
  onProgress?: (loaded: number, total: number, currentAsset: string) => void
): Promise<{ 
  images: { loaded: HTMLImageElement[], failed: string[] },
  videos: { loaded: HTMLVideoElement[], failed: string[] }
}> => {
  const allImages = getAllImages();
  const allVideos = getAllVideos();
  const totalAssets = allImages.length + allVideos.length;
  
  let imagesLoaded = 0;
  let videosLoaded = 0;
  
  const imageProgressHandler = (loaded: number, _total: number, current: string) => {
    imagesLoaded = loaded;
    const totalLoaded = imagesLoaded + videosLoaded;
    console.log(`📊 Progress: Images ${imagesLoaded}/${allImages.length}, Videos ${videosLoaded}/${allVideos.length}, Total ${totalLoaded}/${totalAssets}`);
    onProgress?.(totalLoaded, totalAssets, current);
  };
  
  const videoProgressHandler = (loaded: number, _total: number, current: string) => {
    videosLoaded = loaded;
    const totalLoaded = imagesLoaded + videosLoaded;
    console.log(`📊 Progress: Images ${imagesLoaded}/${allImages.length}, Videos ${videosLoaded}/${allVideos.length}, Total ${totalLoaded}/${totalAssets}`);
    onProgress?.(totalLoaded, totalAssets, current);
  };
  
  // Load videos FIRST (sequential) since they're large resources
  // Then load images (can be faster since they're smaller)
  console.log('🎬 Starting video preloading first (heavy resources)...');
  return preloadAllVideos(videoProgressHandler).then(videos => {
    console.log('✅ Videos done, now loading images...');
    return preloadAllImages(imageProgressHandler).then(images => {
      console.log(`🎉 All media preloaded! Videos: ${videos.loaded.length}, Images: ${images.loaded.length}`);
      return { images, videos };
    });
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

// Get a preloaded video from cache
export const getCachedVideo = (src: string): HTMLVideoElement | null => {
  return videoCache.get(src) || null;
};

// Get cached blob URL for a video
export const getCachedVideoBlob = (src: string): string | null => {
  return videoBlobCache.get(src) || null;
};

// Get the best available cached version of a video
export const getBestCachedVideoSrc = (src: string): string => {
  // First try blob URL for maximum performance
  const blobUrl = getCachedVideoBlob(src);
  if (blobUrl) return blobUrl;
  
  // Fall back to original URL (should be in browser cache)
  return src;
};

// Check if all images are preloaded
export const areAllImagesPreloaded = (): boolean => {
  const allImages = getAllImages();
  return allImages.every(src => imageCache.has(src));
};

// Check if all videos are preloaded
export const areAllVideosPreloaded = (): boolean => {
  const allVideos = getAllVideos();
  return allVideos.every(src => videoCache.has(src));
};

// Check if all media is preloaded
export const areAllMediaPreloaded = (): boolean => {
  return areAllImagesPreloaded() && areAllVideosPreloaded();
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

// Get combined media loading progress
export const getMediaLoadingProgress = (): {
  totalAssets: number;
  loadedAssets: number;
  totalImages: number;
  loadedImages: number;
  totalVideos: number;
  loadedVideos: number;
  isComplete: boolean;
} => {
  const allImages = getAllImages();
  const allVideos = getAllVideos();
  const loadedImages = allImages.filter(src => imageCache.has(src)).length;
  const loadedVideos = allVideos.filter(src => videoCache.has(src)).length;
  
  return {
    totalAssets: allImages.length + allVideos.length,
    loadedAssets: loadedImages + loadedVideos,
    totalImages: allImages.length,
    loadedImages,
    totalVideos: allVideos.length,
    loadedVideos,
    isComplete: loadedImages === allImages.length && loadedVideos === allVideos.length
  };
};