// src/utils/selection.utils.ts
import type { SlideElement } from '@/types/slide.types'

/**
 * Check if an element is within a selection rectangle
 * @param element The element to check
 * @param selectionRect The selection rectangle (can have negative width/height)
 * @returns true if the element is at least partially within the selection
 */
export function isElementInSelectionRect(
  element: SlideElement,
  selectionRect: { x: number; y: number; width: number; height: number }
): boolean {
  // Normalize the selection rect to handle negative width/height (dragging from right to left or bottom to top)
  const rectLeft = Math.min(selectionRect.x, selectionRect.x + selectionRect.width)
  const rectRight = Math.max(selectionRect.x, selectionRect.x + selectionRect.width)
  const rectTop = Math.min(selectionRect.y, selectionRect.y + selectionRect.height)
  const rectBottom = Math.max(selectionRect.y, selectionRect.y + selectionRect.height)
  
  // Element bounds
  const elementLeft = element.x
  const elementRight = element.x + element.width
  const elementTop = element.y
  const elementBottom = element.y + element.height
  
  // Check if element overlaps with selection rectangle
  const overlapsHorizontally = elementLeft < rectRight && elementRight > rectLeft
  const overlapsVertically = elementTop < rectBottom && elementBottom > rectTop
  
  return overlapsHorizontally && overlapsVertically
}

/**
 * Get all elements within a selection rectangle
 * @param elements All elements to check
 * @param selectionRect The selection rectangle
 * @returns Array of elements within the selection (excluding locked elements)
 */
export function getElementsInSelectionRect(
  elements: SlideElement[],
  selectionRect: { x: number; y: number; width: number; height: number }
): SlideElement[] {
  return elements.filter(element => 
    !element.locked && isElementInSelectionRect(element, selectionRect)
  )
}

/**
 * Calculate bounding box for a group of elements
 * @param elements Elements to calculate bounds for
 * @returns Bounding box with x, y, width, height
 */
export function calculateBoundingBox(
  elements: SlideElement[]
): { x: number; y: number; width: number; height: number } | null {
  if (elements.length === 0) return null
  
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  
  elements.forEach(element => {
    minX = Math.min(minX, element.x)
    minY = Math.min(minY, element.y)
    maxX = Math.max(maxX, element.x + element.width)
    maxY = Math.max(maxY, element.y + element.height)
  })
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}
