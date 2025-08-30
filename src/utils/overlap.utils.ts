import type { SlideElement } from '@/types/slide.types';

/**
 * Check if two rectangles overlap
 */
export function rectanglesOverlap(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    rect1.x + rect1.width <= rect2.x ||
    rect2.x + rect2.width <= rect1.x ||
    rect1.y + rect1.height <= rect2.y ||
    rect2.y + rect2.height <= rect1.y
  );
}

/**
 * Calculate overlap area between two rectangles
 */
export function getOverlapArea(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): number {
  const xOverlap = Math.max(0, Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - Math.max(rect1.x, rect2.x));
  const yOverlap = Math.max(0, Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - Math.max(rect1.y, rect2.y));
  return xOverlap * yOverlap;
}

/**
 * Find background element(s) that a text element overlaps with
 * Returns elements sorted by z-index (topmost first)
 */
export function findBackgroundElements(
  textElement: SlideElement,
  allElements: SlideElement[]
): SlideElement[] {
  const backgroundElements: SlideElement[] = [];
  
  // Check each element that could be a background
  allElements.forEach((element, index) => {
    // Skip self and non-background elements
    if (element.id === textElement.id) return;
    // Don't consider blurbs as backgrounds for text elements
    // Blurbs are text containers themselves and shouldn't affect other text
    if (!['shape', 'image', 'table'].includes(element.type)) return;
    
    // Check for overlap
    if (rectanglesOverlap(textElement, element)) {
      backgroundElements.push({
        ...element,
        // Store z-index for sorting (elements array index represents z-order)
        metadata: { ...element.metadata, zIndex: index }
      });
    }
  });
  
  // Sort by z-index (higher index = on top)
  backgroundElements.sort((a, b) => 
    (b.metadata?.zIndex || 0) - (a.metadata?.zIndex || 0)
  );
  
  return backgroundElements;
}

/**
 * Get the dominant background color for a text element
 * Considers overlapping elements and their opacity
 */
export function getDominantBackgroundColor(
  textElement: SlideElement,
  allElements: SlideElement[],
  slideBackground: string = '#ffffff'
): string {
  const backgrounds = findBackgroundElements(textElement, allElements);
  
  if (backgrounds.length === 0) {
    return slideBackground;
  }
  
  // Find the topmost opaque element
  for (const bg of backgrounds) {
    const opacity = bg.opacity ?? 1;
    const fillOpacity = bg.style?.fillOpacity ?? opacity;
    
    // If element is mostly opaque, use its color
    if (fillOpacity > 0.8) {
      if (bg.type === 'shape' || bg.type === 'blurb') {
        return bg.style?.backgroundColor || slideBackground;
      } else if (bg.type === 'image') {
        // For images, we can't determine dominant color easily
        // Use a neutral approach or skip
        continue;
      }
    }
  }
  
  // If no opaque element found, use slide background
  return slideBackground;
}
