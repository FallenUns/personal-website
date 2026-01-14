// src/utils/mobileDetection.ts

import React from 'react';
import { debounce } from './throttle';

/**
 * Detects if the user is on a mobile device
 * @returns boolean - true if on mobile device
 */
export const isMobileDevice = (): boolean => {
  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 
    'windows phone', 'mobile', 'opera mini', 'iemobile'
  ];
  
  const hasUserAgentMobileKeywords = mobileKeywords.some(keyword => 
    userAgent.includes(keyword)
  );
  
  // Check screen size (typically mobile devices have width <= 768px)
  const hasSmallScreen = window.innerWidth <= 768;
  
  // Check for touch capability (most mobile devices are touch-enabled)
  const hasTouchCapability = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Combine checks - if any mobile indicator is present, consider it mobile
  return hasUserAgentMobileKeywords || (hasSmallScreen && hasTouchCapability);
};

/**
 * Hook to detect mobile device with reactive updates
 * @returns boolean - true if on mobile device
 */
export const useMobileDetection = (): boolean => {
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkDevice = () => {
      setIsMobile(isMobileDevice());
    };
    
    // Initial check
    checkDevice();
    
    // Debounced resize handler to prevent excessive re-renders
    const debouncedCheckDevice = debounce(checkDevice, 150);
    
    // Listen for resize events (orientation change, window resize)
    window.addEventListener('resize', debouncedCheckDevice);
    
    return () => {
      window.removeEventListener('resize', debouncedCheckDevice);
    };
  }, []);
  
  return isMobile;
};
