import { useState, useEffect, useRef } from 'react';
import { hudLog } from './useHudBus';

/**
 * A custom hook to track which section is currently visible in the viewport using Intersection Observer.
 * @param sectionIds - An array of the DOM element IDs for the sections to track.
 * @param options - Configuration for root margin and threshold.
 * @returns The ID of the currently active section.
 */
export const useScrollSpy = (
  sectionIds: string[],
  options?: {
    offset?: number;
    threshold?: number;
  }
): string | null => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { offset = 100, threshold = 0.1 } = options || {};
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionsRef = useRef<Map<string, IntersectionObserverEntry>>(new Map());
  const lastLoggedRef = useRef<string | null>(null);

  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Update the sections map with new entries
        entries.forEach(entry => {
          if (entry.target.id) {
            sectionsRef.current.set(entry.target.id, entry);
          }
        });

        // Find the section with the highest intersection ratio that's actually visible
        let bestSection: string | null = null;
        let bestRatio = 0;
        let bestY = Infinity;

        sectionsRef.current.forEach((entry, sectionId) => {
          if (entry.isIntersecting) {
            const ratio = entry.intersectionRatio;
            const y = entry.boundingClientRect.top;
            
            // Prioritize sections that are higher up and have good visibility
            if (ratio > bestRatio || (ratio === bestRatio && y < bestY)) {
              bestSection = sectionId;
              bestRatio = ratio;
              bestY = y;
            }
          }
        });

        // If no section is intersecting, find the closest one
        if (!bestSection) {
          let closestSection: string | null = null;
          let minDistance = Infinity;

          sectionsRef.current.forEach((entry, sectionId) => {
            const rect = entry.boundingClientRect;
            const distance = Math.abs(rect.top + rect.height / 2);
            
            if (distance < minDistance) {
              minDistance = distance;
              closestSection = sectionId;
            }
          });
          
          bestSection = closestSection;
        }

        const commit = (next: string | null) => {
          if (next && lastLoggedRef.current !== next) {
            hudLog(`> section: ${next}`, 'ok');
            lastLoggedRef.current = next;
          }
          setActiveSection(next);
        };
        commit(bestSection);
      },
      {
        rootMargin: `-${offset}px 0px -${offset}px 0px`,
        threshold: [0, threshold, 0.5, 1]
      }
    );

    // Observe all sections
    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      sectionsRef.current.clear();
    };
  }, [sectionIds, offset, threshold]);

  return activeSection;
};