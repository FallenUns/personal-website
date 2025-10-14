import React, { useEffect, useRef, useState } from 'react';
import { getCachedVideo, getCachedVideoBlob } from './imagePreloader';

interface PreloadedVideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  src: string;
}

/**
 * Component that uses preloaded videos from cache for instant playback
 * Videos are cached as blob URLs to prevent re-fetching
 */
export const PreloadedVideo: React.FC<PreloadedVideoProps> = ({ 
  src,
  className,
  autoPlay,
  loop,
  muted,
  playsInline,
  onLoadedData,
  onError,
  ...props 
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');

  useEffect(() => {
    // Try to get the cached blob URL first
    const blobUrl = getCachedVideoBlob(src);
    
    if (blobUrl) {
      console.log(`✅ Using preloaded video blob from cache: ${src}`);
      setVideoSrc(blobUrl);
    } else {
      // Try to get the cached video element
      const cachedVideo = getCachedVideo(src);
      
      if (cachedVideo && cachedVideo.src) {
        console.log(`✅ Using preloaded video src from cache: ${src}`);
        setVideoSrc(cachedVideo.src);
      } else {
        console.log(`⚠️ Video not in cache, loading directly: ${src}`);
        setVideoSrc(src);
      }
    }
  }, [src]);

  useEffect(() => {
    if (videoRef.current && autoPlay && videoSrc) {
      // Ensure autoplay works
      videoRef.current.play().catch(err => {
        console.warn('Autoplay failed:', err);
      });
    }
  }, [videoSrc, autoPlay]);

  if (!videoSrc) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      className={className}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      onLoadedData={onLoadedData}
      onError={onError}
      {...props}
    />
  );
};

export default PreloadedVideo;
