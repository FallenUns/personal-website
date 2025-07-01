import { useState, useEffect, useRef } from 'react';
import { throttle } from '../utils/throttle';

/**
 * A custom hook to track which section is currently visible in the viewport.
 * @param sectionIds - An array of the DOM element IDs for the sections to track.
 * @param options - Configuration for offset and throttle delay.
 * @returns The ID of the currently active section.
 */
export const useScrollSpy = (
  sectionIds: string[],
  options?: {
    offset?: number;
    throttleMs?: number;
  }
): string | null => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { offset = 100, throttleMs = 50 } = options || {}; // Reduced throttle for better responsiveness

  const sectionElementsRef = useRef<{ [id: string]: { top: number; bottom: number } }>({});

  // Function to calculate and cache the positions of all sections
  const calculateSectionPositions = () => {
    const positions: { [id: string]: { top: number; bottom: number } } = {};
    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        const top = rect.top + window.scrollY - offset;
        const bottom = top + rect.height;
        positions[id] = { top, bottom };
      }
    });
    sectionElementsRef.current = positions;
  };

  // Recalculate positions on mount and on resize to ensure accuracy
  useEffect(() => {
    calculateSectionPositions();
    const handleResize = throttle(calculateSectionPositions, 200);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sectionIds, offset]);


  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const sectionPositions = sectionElementsRef.current;
          
          let currentSection: string | null = null;
          for (const id of sectionIds) {
            const section = sectionPositions[id];
            if (section && scrollY >= section.top && scrollY < section.bottom) {
              currentSection = id;
              break;
            }
          }
          
          if (currentSection === null) {
            let lastVisibleSection: string | null = null;
            for (const id of sectionIds) {
                const section = sectionPositions[id];
                if (section && scrollY >= section.top) {
                    lastVisibleSection = id;
                }
            }
            currentSection = lastVisibleSection;
          }

          setActiveSection(currentSection);
          ticking = false;
        });
        ticking = true;
      }
    };

    const throttledHandleScroll = throttle(handleScroll, throttleMs);
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    throttledHandleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [sectionIds, throttleMs]);

  return activeSection;
};