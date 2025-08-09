// Navigation utility for smooth scrolling to sections
export const scrollToSection = (sectionId: string): void => {
  console.log(`🔍 Navigation utility called with sectionId: ${sectionId}`);

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    console.log(`✅ Section found:`, targetSection);
    targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    console.log(`🚀 scrollIntoView issued for: ${sectionId}`);
  } else {
    console.error(`❌ Section not found: ${sectionId}`);
  }
};
// Validate section ID
export const isValidSection = (sectionId: string): boolean => {
  const validSections = ['about', 'projects', 'experience', 'contact'];
  return validSections.includes(sectionId.toLowerCase());
};