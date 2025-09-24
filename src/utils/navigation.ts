// Navigation utility for smooth scrolling to sections - Enhanced version based on navbar implementation
export const scrollToSection = (sectionId: string): void => {
  console.log(`🔍 Navigation utility called with sectionId: ${sectionId}`);

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    console.log(`✅ Section found:`, targetSection);
    
    // Get current scroll position
    const currentScrollY = window.scrollY;
    console.log(`📍 Current scroll position: ${currentScrollY}`);
    
    // Get target position
    const targetRect = targetSection.getBoundingClientRect();
    const targetY = targetRect.top + currentScrollY;
    console.log(`🎯 Target scroll position: ${targetY}`);
    
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
        console.log(`🚀 Backup scroll issued to position: ${targetY}`);
      }, 100);
      
      console.log(`🚀 scrollIntoView issued for: ${sectionId}`);
      
      // Verify scroll happened after a delay
      setTimeout(() => {
        const newScrollY = window.scrollY;
        console.log(`📊 Scroll verification - Before: ${currentScrollY}, After: ${newScrollY}`);
        if (Math.abs(newScrollY - currentScrollY) > 50) {
          console.log(`✅ Scroll successful for: ${sectionId}`);
        } else {
          console.log(`⚠️ Scroll may not have worked for: ${sectionId}`);
        }
      }, 1000);
      
    } catch (error) {
      console.error(`❌ Scroll error for ${sectionId}:`, error);
    }
    
  } else {
    console.error(`❌ Section not found: ${sectionId}`);
    console.log('Available sections:', Array.from(document.querySelectorAll('[id]')).map(el => el.id).filter(Boolean));
  }
};

// Enhanced validation with better debugging
export const isValidSection = (sectionId: string): boolean => {
  const validSections = ['about', 'projects', 'experience', 'contact'];
  const isValid = validSections.includes(sectionId.toLowerCase());
  console.log(`🔍 Section validation: "${sectionId}" is ${isValid ? 'valid' : 'invalid'}`);
  return isValid;
};

// Debug function to check all sections
export const debugSections = (): void => {
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