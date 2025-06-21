import { useEffect, useCallback } from 'react';
import { useLoading } from '../contexts/LoadingContext';

// Hook to prevent interactions during loading
export const useLoadingBarrier = () => {
  const { isLoading } = useLoading();

  useEffect(() => {
    if (isLoading) {
      // Disable scrolling during loading
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Prevent all clicks during loading
      const preventClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      // Prevent keyboard navigation
      const preventKeyboard = (e: KeyboardEvent) => {
        // Prevent tab, enter, space, arrow keys during loading
        if (['Tab', 'Enter', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };

      // Add event listeners to prevent interactions
      document.addEventListener('click', preventClick, true);
      document.addEventListener('keydown', preventKeyboard, true);
      document.addEventListener('touchstart', preventClick, true);

      return () => {
        // Restore interactions when loading is complete
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('click', preventClick, true);
        document.removeEventListener('keydown', preventKeyboard, true);
        document.removeEventListener('touchstart', preventClick, true);
      };
    }
  }, [isLoading]);

  return { isLoading };
};

// Hook for smooth navigation after loading
export const useSmoothNavigation = () => {
  const { isLoading } = useLoading();

  const scrollToSection = useCallback((sectionId: string) => {
    if (isLoading) return; // Prevent navigation during loading

    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 140;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [isLoading]);

  return { scrollToSection, isLoading };
};
