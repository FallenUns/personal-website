// Navigation utility for smooth scrolling to sections - Enhanced version based on navbar implementation
export const scrollToSection = (sectionId: string): void => {
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    // Get current scroll position
    const currentScrollY = window.scrollY;
    
    // Get target position
    const targetRect = targetSection.getBoundingClientRect();
    const targetY = targetRect.top + currentScrollY;
    
    // Use both scrollIntoView AND window.scrollTo for maximum compatibility
    try {
      // Method 1: scrollIntoView with improved settings
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start', // Align to top of viewport
        inline: 'nearest'
      });
      
      // Method 2: Backup using window.scrollTo
      setTimeout(() => {
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      }, 100);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Scroll error for ${sectionId}:`, error);
      }
    }
  } else {
    if (import.meta.env.DEV) {
      console.error(`Section not found: ${sectionId}`);
    }
  }
};

// Enhanced validation with better debugging
export const isValidSection = (sectionId: string): boolean => {
  const validSections = ['about', 'projects', 'experience', 'contact'];
  return validSections.includes(sectionId.toLowerCase());
};

// Debug function to check all sections (only logs in development)
export const debugSections = (): void => {
  if (!import.meta.env.DEV) return;
  
  console.log('=== SECTION DEBUG ===');
  const validSections = ['about', 'projects', 'experience', 'contact'];
  
  validSections.forEach(sectionId => {
    const element = document.getElementById(sectionId);
    if (element) {
      const rect = element.getBoundingClientRect();
      console.log(`✅ ${sectionId}:`, {
        element,
        top: rect.top,
        height: rect.height,
        visible: rect.top < window.innerHeight && rect.bottom > 0
      });
    } else {
      console.log(`❌ ${sectionId}: not found`);
    }
  });
};