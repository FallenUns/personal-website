import { getLenis } from './lenis';

/**
 * Compute the Lenis-scroll offset that lands the section's centred content on
 * the true viewport centre.
 *
 * We MEASURE the actual rendered content child rather than assume the
 * section's geometric midpoint — padding asymmetry and `items-center` on
 * content that doesn't fill the section both mean the content's real centre
 * sits at an offset within the section that we can't infer from height alone.
 *
 *   visible_center  = vp/2
 *   content_centre  = section_top_in_vp + content_offset_in_section + content_h/2
 *   Solve:            section_top_in_vp = visible_center − content_offset_in_section − content_h/2
 *   Lenis offset    = −section_top_in_vp
 */
export const sectionScrollOffset = (el: HTMLElement): number => {
  if (el.id === 'experience') {
    return 0;
  }

  const vp = window.innerHeight;
  const visibleCentre = vp / 2;
  // Pick the first in-flow direct child as the content stage. Skips absolute
  // / fixed decorations (bottom-pinned category strips, scroll cues, etc.)
  // that aren't part of the centred composition.
  const sectionRect = el.getBoundingClientRect();
  let contentOffsetInSection = 0;
  let contentH = el.offsetHeight || sectionRect.height;
  for (const child of Array.from(el.children) as HTMLElement[]) {
    const pos = window.getComputedStyle(child).position;
    if (pos === 'absolute' || pos === 'fixed') continue;
    const rect = child.getBoundingClientRect();
    if (rect.height < 40) continue; // tiny utility elements
    contentOffsetInSection = child.offsetParent === el
      ? child.offsetTop
      : rect.top - sectionRect.top;
    contentH = child.offsetHeight || rect.height;
    break;
  }
  const sectionTopTarget = visibleCentre - contentOffsetInSection - contentH / 2;
  return -sectionTopTarget;
};

// Prefers the Lenis instance so anchor jumps share the same eased motion as
// the wheel; falls back to native window.scrollTo when Lenis isn't ready.
export const scrollToSection = (sectionId: string): void => {
  const targetSection = document.getElementById(sectionId);
  if (!targetSection) {
    if (import.meta.env.DEV) console.error(`Section not found: ${sectionId}`);
    return;
  }

  const offset = sectionScrollOffset(targetSection);
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(targetSection, { duration: 1.2, lock: false, offset });
    return;
  }

  try {
    const top = targetSection.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: 'smooth' });
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Scroll error for ${sectionId}:`, error);
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
