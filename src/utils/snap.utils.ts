// src/utils/snap.utils.ts
import { CANVAS_DIMENSIONS, SNAP_SETTINGS } from './canvas.constants'
import type { SlideElement } from '@/types/slide.types'

export interface SnapResult {
  x: number
  y: number
  snappedX: boolean
  snappedY: boolean
  snapGuides: SnapGuide[]
}

export interface SnapGuide {
  type: 'vertical' | 'horizontal'
  position: number
  start: number
  end: number
  elementId?: string // ID of element being snapped to
}

export interface MarginGuide {
  type: 'vertical' | 'horizontal'
  position: number
  isCenter?: boolean
  isEdge?: boolean // New property to identify edge guides
}

export interface ElementSnapPoint {
  position: number
  elementId: string
  edge: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY'
}

// Margin and center positions
const MARGINS = {
  left: CANVAS_DIMENSIONS.MARGIN_H,
  right: CANVAS_DIMENSIONS.WIDTH - CANVAS_DIMENSIONS.MARGIN_H,
  top: CANVAS_DIMENSIONS.MARGIN_V,
  bottom: CANVAS_DIMENSIONS.HEIGHT - CANVAS_DIMENSIONS.MARGIN_V,
  centerX: CANVAS_DIMENSIONS.WIDTH / 2,
  centerY: CANVAS_DIMENSIONS.HEIGHT / 2,
}

// Slide edge positions (0px from edges)
const EDGES = {
  left: 0,
  right: CANVAS_DIMENSIONS.WIDTH,
  top: 0,
  bottom: CANVAS_DIMENSIONS.HEIGHT,
}

/**
 * Calculate snap position for an element being dragged
 * Optimized for performance by checking closest snap points first
 */
export function calculateSnapPosition(
  x: number,
  y: number,
  width: number,
  height: number
): SnapResult {
  const result: SnapResult = {
    x,
    y,
    snappedX: false,
    snappedY: false,
    snapGuides: []
  }

  const elementCenterX = x + width / 2
  const elementCenterY = y + height / 2

  // Check horizontal snapping - find the closest snap point
  const horizontalChecks = [
    // Edge snapping
    { edge: x, snapTo: EDGES.left, offset: 0 }, // Left edge to slide left edge
    { edge: x + width, snapTo: EDGES.right, offset: -width }, // Right edge to slide right edge
    // Margin snapping
    { edge: x, snapTo: MARGINS.left, offset: 0 }, // Left edge to left margin
    { edge: x + width, snapTo: MARGINS.right, offset: -width }, // Right edge to right margin
    { edge: x, snapTo: MARGINS.right, offset: 0 }, // Left edge to right margin
    { edge: x + width, snapTo: MARGINS.left, offset: -width }, // Right edge to left margin
    // Center snapping
    { edge: elementCenterX, snapTo: MARGINS.centerX, offset: -width / 2 }, // Center to center
  ]

  // Find the closest horizontal snap
  let closestHorizontal = null
  let minHorizontalDistance = SNAP_SETTINGS.THRESHOLD

  for (const check of horizontalChecks) {
    const distance = Math.abs(check.edge - check.snapTo)
    if (distance <= minHorizontalDistance) {
      minHorizontalDistance = distance
      closestHorizontal = check
    }
  }

  if (closestHorizontal) {
    result.x = closestHorizontal.snapTo + closestHorizontal.offset
    result.snappedX = true
    result.snapGuides.push({
      type: 'vertical',
      position: closestHorizontal.snapTo,
      start: 0,
      end: CANVAS_DIMENSIONS.HEIGHT
    })
  }

  // Check vertical snapping - find the closest snap point
  const verticalChecks = [
    // Edge snapping
    { edge: y, snapTo: EDGES.top, offset: 0 }, // Top edge to slide top edge
    { edge: y + height, snapTo: EDGES.bottom, offset: -height }, // Bottom edge to slide bottom edge
    // Margin snapping
    { edge: y, snapTo: MARGINS.top, offset: 0 }, // Top edge to top margin
    { edge: y + height, snapTo: MARGINS.bottom, offset: -height }, // Bottom edge to bottom margin
    { edge: y, snapTo: MARGINS.bottom, offset: 0 }, // Top edge to bottom margin
    { edge: y + height, snapTo: MARGINS.top, offset: -height }, // Bottom edge to top margin
    // Center snapping
    { edge: elementCenterY, snapTo: MARGINS.centerY, offset: -height / 2 }, // Center to center
  ]

  // Find the closest vertical snap
  let closestVertical = null
  let minVerticalDistance = SNAP_SETTINGS.THRESHOLD

  for (const check of verticalChecks) {
    const distance = Math.abs(check.edge - check.snapTo)
    if (distance <= minVerticalDistance) {
      minVerticalDistance = distance
      closestVertical = check
    }
  }

  if (closestVertical) {
    result.y = closestVertical.snapTo + closestVertical.offset
    result.snappedY = true
    result.snapGuides.push({
      type: 'horizontal',
      position: closestVertical.snapTo,
      start: 0,
      end: CANVAS_DIMENSIONS.WIDTH
    })
  }

  return result
}

/**
 * Calculate element-to-element snap position for dragging
 * Checks alignment with other elements' edges and centers
 */
export function calculateElementDragSnapPosition(
  draggingElement: { x: number; y: number; width: number; height: number; id: string },
  otherElements: SlideElement[]
): SnapResult {
  const result: SnapResult = {
    x: draggingElement.x,
    y: draggingElement.y,
    snappedX: false,
    snappedY: false,
    snapGuides: []
  }

  const elementCenterX = draggingElement.x + draggingElement.width / 2
  const elementCenterY = draggingElement.y + draggingElement.height / 2

  // Collect all snap points from other elements
  const horizontalSnapPoints: ElementSnapPoint[] = []
  const verticalSnapPoints: ElementSnapPoint[] = []

  otherElements.forEach(element => {
    if (element.id === draggingElement.id) return // Skip self

    // Horizontal snap points (for vertical alignment)
    horizontalSnapPoints.push(
      { position: element.x, elementId: element.id, edge: 'left' },
      { position: element.x + element.width, elementId: element.id, edge: 'right' },
      { position: element.x + element.width / 2, elementId: element.id, edge: 'centerX' }
    )

    // Vertical snap points (for horizontal alignment)
    verticalSnapPoints.push(
      { position: element.y, elementId: element.id, edge: 'top' },
      { position: element.y + element.height, elementId: element.id, edge: 'bottom' },
      { position: element.y + element.height / 2, elementId: element.id, edge: 'centerY' }
    )
  })

  // Check horizontal snapping
  const horizontalChecks = [
    { edge: draggingElement.x, points: horizontalSnapPoints, offset: 0 }, // Left edge
    { edge: draggingElement.x + draggingElement.width, points: horizontalSnapPoints, offset: -draggingElement.width }, // Right edge
    { edge: elementCenterX, points: horizontalSnapPoints, offset: -draggingElement.width / 2 }, // Center
  ]

  let closestHorizontal = null
  let minHorizontalDistance = SNAP_SETTINGS.THRESHOLD

  for (const check of horizontalChecks) {
    for (const snapPoint of check.points) {
      const distance = Math.abs(check.edge - snapPoint.position)
      if (distance <= minHorizontalDistance) {
        minHorizontalDistance = distance
        closestHorizontal = { snapPoint, offset: check.offset }
      }
    }
  }

  if (closestHorizontal) {
    result.x = closestHorizontal.snapPoint.position + closestHorizontal.offset
    result.snappedX = true
    
    // Find the element we're snapping to for guide calculation
    const targetElement = otherElements.find(el => el.id === closestHorizontal.snapPoint.elementId)
    if (targetElement) {
      result.snapGuides.push({
        type: 'vertical',
        position: closestHorizontal.snapPoint.position,
        start: Math.min(draggingElement.y, targetElement.y),
        end: Math.max(draggingElement.y + draggingElement.height, targetElement.y + targetElement.height),
        elementId: closestHorizontal.snapPoint.elementId
      })
    }
  }

  // Check vertical snapping
  const verticalChecks = [
    { edge: draggingElement.y, points: verticalSnapPoints, offset: 0 }, // Top edge
    { edge: draggingElement.y + draggingElement.height, points: verticalSnapPoints, offset: -draggingElement.height }, // Bottom edge
    { edge: elementCenterY, points: verticalSnapPoints, offset: -draggingElement.height / 2 }, // Center
  ]

  let closestVertical = null
  let minVerticalDistance = SNAP_SETTINGS.THRESHOLD

  for (const check of verticalChecks) {
    for (const snapPoint of check.points) {
      const distance = Math.abs(check.edge - snapPoint.position)
      if (distance <= minVerticalDistance) {
        minVerticalDistance = distance
        closestVertical = { snapPoint, offset: check.offset }
      }
    }
  }

  if (closestVertical) {
    result.y = closestVertical.snapPoint.position + closestVertical.offset
    result.snappedY = true
    
    // Find the element we're snapping to for guide calculation
    const targetElement = otherElements.find(el => el.id === closestVertical.snapPoint.elementId)
    if (targetElement) {
      result.snapGuides.push({
        type: 'horizontal',
        position: closestVertical.snapPoint.position,
        start: Math.min(draggingElement.x, targetElement.x),
        end: Math.max(draggingElement.x + draggingElement.width, targetElement.x + targetElement.width),
        elementId: closestVertical.snapPoint.elementId
      })
    }
  }

  return result
}

/**
 * Calculate snap position for resizing (width changes)
 * Includes center snapping for better alignment
 */
export function calculateResizeSnapPosition(
  x: number,
  width: number,
  direction: 'left' | 'right'
): { x: number; width: number; snapped: boolean; snapGuide?: SnapGuide } {
  let newX = x
  let newWidth = width
  let snapped = false
  let snapGuide: SnapGuide | undefined

  // Include both edge and margin snap points
  const snapPoints = [
    EDGES.left, EDGES.right, // Edge snapping
    MARGINS.left, MARGINS.right, MARGINS.centerX // Margin snapping
  ]
  let closestSnap = null
  let minDistance = SNAP_SETTINGS.THRESHOLD

  if (direction === 'left') {
    // Check all snap points for left edge
    for (const snapPoint of snapPoints) {
      const distance = Math.abs(x - snapPoint)
      if (distance <= minDistance) {
        minDistance = distance
        closestSnap = snapPoint
      }
    }

    if (closestSnap !== null) {
      const deltaX = x - closestSnap
      newX = closestSnap
      newWidth = width + deltaX
      snapped = true
      snapGuide = {
        type: 'vertical',
        position: closestSnap,
        start: 0,
        end: CANVAS_DIMENSIONS.HEIGHT
      }
    }
  } else if (direction === 'right') {
    // Check all snap points for right edge
    const rightEdge = x + width
    for (const snapPoint of snapPoints) {
      const distance = Math.abs(rightEdge - snapPoint)
      if (distance <= minDistance) {
        minDistance = distance
        closestSnap = snapPoint
      }
    }

    if (closestSnap !== null) {
      newWidth = closestSnap - x
      snapped = true
      snapGuide = {
        type: 'vertical',
        position: closestSnap,
        start: 0,
        end: CANVAS_DIMENSIONS.HEIGHT
      }
    }
  }

  return { x: newX, width: newWidth, snapped, snapGuide }
}

/**
 * Calculate snap position for vertical resizing (height changes)
 * Includes center snapping for better alignment
 */
export function calculateVerticalResizeSnapPosition(
  y: number,
  height: number,
  direction: 'top' | 'bottom'
): { y: number; height: number; snapped: boolean; snapGuide?: SnapGuide } {
  let newY = y
  let newHeight = height
  let snapped = false
  let snapGuide: SnapGuide | undefined

  // Include both edge and margin snap points
  const snapPoints = [
    EDGES.top, EDGES.bottom, // Edge snapping
    MARGINS.top, MARGINS.bottom, MARGINS.centerY // Margin snapping
  ]
  let closestSnap = null
  let minDistance = SNAP_SETTINGS.THRESHOLD

  if (direction === 'top') {
    // Check all snap points for top edge
    for (const snapPoint of snapPoints) {
      const distance = Math.abs(y - snapPoint)
      if (distance <= minDistance) {
        minDistance = distance
        closestSnap = snapPoint
      }
    }

    if (closestSnap !== null) {
      const deltaY = y - closestSnap
      newY = closestSnap
      newHeight = height + deltaY
      snapped = true
      snapGuide = {
        type: 'horizontal',
        position: closestSnap,
        start: 0,
        end: CANVAS_DIMENSIONS.WIDTH
      }
    }
  } else if (direction === 'bottom') {
    // Check all snap points for bottom edge
    const bottomEdge = y + height
    for (const snapPoint of snapPoints) {
      const distance = Math.abs(bottomEdge - snapPoint)
      if (distance <= minDistance) {
        minDistance = distance
        closestSnap = snapPoint
      }
    }

    if (closestSnap !== null) {
      newHeight = closestSnap - y
      snapped = true
      snapGuide = {
        type: 'horizontal',
        position: closestSnap,
        start: 0,
        end: CANVAS_DIMENSIONS.WIDTH
      }
    }
  }

  return { y: newY, height: newHeight, snapped, snapGuide }
}

/**
 * Calculate snap position for shape resizing (both dimensions)
 * Returns snap results for both horizontal and vertical axes
 */
export function calculateShapeResizeSnapPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  handle: string
): {
  x: number
  y: number
  width: number
  height: number
  snappedX: boolean
  snappedY: boolean
  snapGuides: SnapGuide[]
} {
  let result = {
    x,
    y,
    width,
    height,
    snappedX: false,
    snappedY: false,
    snapGuides: [] as SnapGuide[]
  }

  // Handle horizontal snapping based on handle position
  if (handle.includes('left')) {
    const horizontalSnap = calculateResizeSnapPosition(x, width, 'left')
    if (horizontalSnap.snapped) {
      result.x = horizontalSnap.x
      result.width = horizontalSnap.width
      result.snappedX = true
      if (horizontalSnap.snapGuide) {
        result.snapGuides.push(horizontalSnap.snapGuide)
      }
    }
  } else if (handle.includes('right')) {
    const horizontalSnap = calculateResizeSnapPosition(x, width, 'right')
    if (horizontalSnap.snapped) {
      result.width = horizontalSnap.width
      result.snappedX = true
      if (horizontalSnap.snapGuide) {
        result.snapGuides.push(horizontalSnap.snapGuide)
      }
    }
  }

  // Handle vertical snapping based on handle position
  if (handle.includes('top')) {
    const verticalSnap = calculateVerticalResizeSnapPosition(y, height, 'top')
    if (verticalSnap.snapped) {
      result.y = verticalSnap.y
      result.height = verticalSnap.height
      result.snappedY = true
      if (verticalSnap.snapGuide) {
        result.snapGuides.push(verticalSnap.snapGuide)
      }
    }
  } else if (handle.includes('bottom')) {
    const verticalSnap = calculateVerticalResizeSnapPosition(y, height, 'bottom')
    if (verticalSnap.snapped) {
      result.height = verticalSnap.height
      result.snappedY = true
      if (verticalSnap.snapGuide) {
        result.snapGuides.push(verticalSnap.snapGuide)
      }
    }
  }

  return result
}

/**
 * Calculate element-to-element snap positions for resizing
 * Checks if resizing element edges/dimensions align with other elements
 */
export function calculateElementToElementSnapPosition(
  resizingElement: { x: number; y: number; width: number; height: number; id: string },
  otherElements: SlideElement[],
  handle: string
): {
  x: number
  y: number
  width: number
  height: number
  snappedX: boolean
  snappedY: boolean
  snapGuides: SnapGuide[]
} {
  const result = {
    x: resizingElement.x,
    y: resizingElement.y,
    width: resizingElement.width,
    height: resizingElement.height,
    snappedX: false,
    snappedY: false,
    snapGuides: [] as SnapGuide[]
  }

  // Get all snap points from other elements
  const horizontalSnapPoints: ElementSnapPoint[] = []
  const verticalSnapPoints: ElementSnapPoint[] = []
  
  otherElements.forEach(element => {
    if (element.id === resizingElement.id) return // Skip self
    
    // Horizontal snap points (for vertical edges)
    horizontalSnapPoints.push(
      { position: element.x, elementId: element.id, edge: 'left' },
      { position: element.x + element.width, elementId: element.id, edge: 'right' },
      { position: element.x + element.width / 2, elementId: element.id, edge: 'centerX' }
    )
    
    // Vertical snap points (for horizontal edges)
    verticalSnapPoints.push(
      { position: element.y, elementId: element.id, edge: 'top' },
      { position: element.y + element.height, elementId: element.id, edge: 'bottom' },
      { position: element.y + element.height / 2, elementId: element.id, edge: 'centerY' }
    )
  })

  // Check for dimension matching (width/height)
  const widthMatches: { width: number; elementId: string }[] = []
  const heightMatches: { height: number; elementId: string }[] = []
  
  otherElements.forEach(element => {
    if (element.id === resizingElement.id) return
    widthMatches.push({ width: element.width, elementId: element.id })
    heightMatches.push({ height: element.height, elementId: element.id })
  })

  // Handle horizontal snapping based on resize handle
  if (handle.includes('left')) {
    // Check left edge snapping
    let closestSnap = null
    let minDistance = SNAP_SETTINGS.THRESHOLD
    
    for (const snapPoint of horizontalSnapPoints) {
      const distance = Math.abs(resizingElement.x - snapPoint.position)
      if (distance <= minDistance) {
        minDistance = distance
        closestSnap = snapPoint
      }
    }
    
    if (closestSnap) {
      const deltaX = resizingElement.x - closestSnap.position
      result.x = closestSnap.position
      result.width = resizingElement.width + deltaX
      result.snappedX = true
      
      // Find the element we're snapping to
      const targetElement = otherElements.find(el => el.id === closestSnap.elementId)
      if (targetElement) {
        result.snapGuides.push({
          type: 'vertical',
          position: closestSnap.position,
          start: Math.min(resizingElement.y, targetElement.y),
          end: Math.max(resizingElement.y + resizingElement.height, targetElement.y + targetElement.height),
          elementId: closestSnap.elementId
        })
      }
    }
  } else if (handle.includes('right')) {
    // Check right edge snapping and width matching
    let closestSnap = null
    let minDistance = SNAP_SETTINGS.THRESHOLD
    const rightEdge = resizingElement.x + resizingElement.width
    
    // Check edge alignment
    for (const snapPoint of horizontalSnapPoints) {
      const distance = Math.abs(rightEdge - snapPoint.position)
      if (distance <= minDistance) {
        minDistance = distance
        closestSnap = snapPoint
      }
    }
    
    // Check width matching
    for (const match of widthMatches) {
      const distance = Math.abs(resizingElement.width - match.width)
      if (distance <= minDistance) {
        minDistance = distance
        closestSnap = { position: resizingElement.x + match.width, elementId: match.elementId, edge: 'width' as any }
      }
    }
    
    if (closestSnap) {
      result.width = closestSnap.position - resizingElement.x
      result.snappedX = true
      
      const targetElement = otherElements.find(el => el.id === closestSnap.elementId)
      if (targetElement) {
        if (closestSnap.edge === 'width') {
          // Width matching - show guides at both elements
          result.snapGuides.push(
            {
              type: 'horizontal',
              position: resizingElement.y - 10,
              start: resizingElement.x,
              end: resizingElement.x + result.width,
              elementId: closestSnap.elementId
            },
            {
              type: 'horizontal',
              position: targetElement.y - 10,
              start: targetElement.x,
              end: targetElement.x + targetElement.width,
              elementId: closestSnap.elementId
            }
          )
        } else {
          // Edge alignment
          result.snapGuides.push({
            type: 'vertical',
            position: closestSnap.position,
            start: Math.min(resizingElement.y, targetElement.y),
            end: Math.max(resizingElement.y + resizingElement.height, targetElement.y + targetElement.height),
            elementId: closestSnap.elementId
          })
        }
      }
    }
  }

  // Handle vertical snapping based on resize handle
  if (handle.includes('top')) {
    // Check top edge snapping
    let closestSnap = null
    let minDistance = SNAP_SETTINGS.THRESHOLD
    
    for (const snapPoint of verticalSnapPoints) {
      const distance = Math.abs(resizingElement.y - snapPoint.position)
      if (distance <= minDistance) {
        minDistance = distance
        closestSnap = snapPoint
      }
    }
    
    if (closestSnap) {
      const deltaY = resizingElement.y - closestSnap.position
      result.y = closestSnap.position
      result.height = resizingElement.height + deltaY
      result.snappedY = true
      
      const targetElement = otherElements.find(el => el.id === closestSnap.elementId)
      if (targetElement) {
        result.snapGuides.push({
          type: 'horizontal',
          position: closestSnap.position,
          start: Math.min(resizingElement.x, targetElement.x),
          end: Math.max(resizingElement.x + resizingElement.width, targetElement.x + targetElement.width),
          elementId: closestSnap.elementId
        })
      }
    }
  } else if (handle.includes('bottom')) {
    // Check bottom edge snapping and height matching
    let closestSnap = null
    let minDistance = SNAP_SETTINGS.THRESHOLD
    const bottomEdge = resizingElement.y + resizingElement.height
    
    // Check edge alignment
    for (const snapPoint of verticalSnapPoints) {
      const distance = Math.abs(bottomEdge - snapPoint.position)
      if (distance <= minDistance) {
        minDistance = distance
        closestSnap = snapPoint
      }
    }
    
    // Check height matching
    for (const match of heightMatches) {
      const distance = Math.abs(resizingElement.height - match.height)
      if (distance <= minDistance) {
        minDistance = distance
        closestSnap = { position: resizingElement.y + match.height, elementId: match.elementId, edge: 'height' as any }
      }
    }
    
    if (closestSnap) {
      result.height = closestSnap.position - resizingElement.y
      result.snappedY = true
      
      const targetElement = otherElements.find(el => el.id === closestSnap.elementId)
      if (targetElement) {
        if (closestSnap.edge === 'height') {
          // Height matching - show guides at both elements
          result.snapGuides.push(
            {
              type: 'vertical',
              position: resizingElement.x - 10,
              start: resizingElement.y,
              end: resizingElement.y + result.height,
              elementId: closestSnap.elementId
            },
            {
              type: 'vertical',
              position: targetElement.x - 10,
              start: targetElement.y,
              end: targetElement.y + targetElement.height,
              elementId: closestSnap.elementId
            }
          )
        } else {
          // Edge alignment
          result.snapGuides.push({
            type: 'horizontal',
            position: closestSnap.position,
            start: Math.min(resizingElement.x, targetElement.x),
            end: Math.max(resizingElement.x + resizingElement.width, targetElement.x + targetElement.width),
            elementId: closestSnap.elementId
          })
        }
      }
    }
  }

  return result
}

/**
 * Get visible margin guides when dragging an element
 * Only shows margins that are within snap threshold
 */
export function getVisibleMarginGuides(
  x: number,
  y: number,
  width: number,
  height: number
): MarginGuide[] {
  const guides: MarginGuide[] = []
  const elementCenterX = x + width / 2
  const elementCenterY = y + height / 2

  // Check horizontal margins and edges
  const horizontalMargins = [
    // Edges
    { position: EDGES.left, isCenter: false, isEdge: true },
    { position: EDGES.right, isCenter: false, isEdge: true },
    // Margins
    { position: MARGINS.left, isCenter: false, isEdge: false },
    { position: MARGINS.right, isCenter: false, isEdge: false },
    { position: MARGINS.centerX, isCenter: true, isEdge: false },
  ]

  for (const margin of horizontalMargins) {
    // Check if any edge of the element is near this margin
    if (
      Math.abs(x - margin.position) <= SNAP_SETTINGS.THRESHOLD ||
      Math.abs(x + width - margin.position) <= SNAP_SETTINGS.THRESHOLD ||
      Math.abs(elementCenterX - margin.position) <= SNAP_SETTINGS.THRESHOLD
    ) {
      guides.push({
        type: 'vertical',
        position: margin.position,
        isCenter: margin.isCenter,
        isEdge: margin.isEdge
      })
    }
  }

  // Check vertical margins and edges
  const verticalMargins = [
    // Edges
    { position: EDGES.top, isCenter: false, isEdge: true },
    { position: EDGES.bottom, isCenter: false, isEdge: true },
    // Margins
    { position: MARGINS.top, isCenter: false, isEdge: false },
    { position: MARGINS.bottom, isCenter: false, isEdge: false },
    { position: MARGINS.centerY, isCenter: true, isEdge: false },
  ]

  for (const margin of verticalMargins) {
    // Check if any edge of the element is near this margin
    if (
      Math.abs(y - margin.position) <= SNAP_SETTINGS.THRESHOLD ||
      Math.abs(y + height - margin.position) <= SNAP_SETTINGS.THRESHOLD ||
      Math.abs(elementCenterY - margin.position) <= SNAP_SETTINGS.THRESHOLD
    ) {
      guides.push({
        type: 'horizontal',
        position: margin.position,
        isCenter: margin.isCenter,
        isEdge: margin.isEdge
      })
    }
  }

  return guides
}
