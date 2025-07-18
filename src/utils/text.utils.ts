// src/utils/text.utils.ts
import Konva from 'konva'

interface MeasureTextOptions {
  text: string
  fontSize: number
  fontFamily: string
  width?: number
  lineHeight?: number
  letterSpacing?: number
  padding?: number
  wrap?: 'word' | 'char' | 'none'
}

/**
 * Measure text dimensions using a temporary Konva.Text node
 */
export function measureText({
  text,
  fontSize,
  fontFamily,
  width,
  lineHeight = 1.2,
  letterSpacing = 0,
  padding = 0, // Changed default to 0
  wrap = 'word'
}: MeasureTextOptions): { width: number; height: number } {
  // Create a temporary text node to measure
  const tempText = new Konva.Text({
    text,
    fontSize,
    fontFamily,
    width: width || 'auto',
    lineHeight,
    letterSpacing,
    padding,
    wrap: width ? wrap : 'none',
    ellipsis: false
  })
  
  // Get measured dimensions
  const measuredWidth = tempText.width()
  const measuredHeight = tempText.height()
  
  // Clean up
  tempText.destroy()
  
  return {
    width: measuredWidth,
    height: measuredHeight
  }
}

/**
 * Measure text dimensions for auto-sizing (no width constraint)
 */
export function measureAutoText({
  text,
  fontSize,
  fontFamily,
  lineHeight = 1.2,
  letterSpacing = 0,
  padding = 0 // Changed default to 0
}: Omit<MeasureTextOptions, 'width' | 'wrap'>): { width: number; height: number } {
  // Handle empty text
  if (!text || text.trim() === '') {
    return {
      width: 100,
      height: fontSize * lineHeight
    }
  }
  
  // Create a single text node to measure without wrapping
  const tempText = new Konva.Text({
    text,
    fontSize,
    fontFamily,
    letterSpacing,
    padding,
    wrap: 'none',
    lineHeight,
    // Ensure accurate measurement
    perfectDrawEnabled: false
  })
  
  // Get measured dimensions
  const measuredWidth = tempText.width()
  const measuredHeight = tempText.height()
  
  // Clean up
  tempText.destroy()
  
  return {
    width: Math.max(measuredWidth, 50), // Minimum width
    height: Math.max(measuredHeight, fontSize * lineHeight) // At least one line height
  }
}

/**
 * Measure wrapped text dimensions with a specific width constraint
 */
export function measureWrappedText({
  text,
  fontSize,
  fontFamily,
  width,
  lineHeight = 1.2,
  letterSpacing = 0,
  padding = 0, // Changed default to 0
  wrap = 'word'
}: MeasureTextOptions & { width: number }): { width: number; height: number } {
  // Handle empty text
  if (!text || text.trim() === '') {
    return {
      width,
      height: fontSize * lineHeight
    }
  }
  
  // Create a text node with width constraint to measure wrapped text
  const tempText = new Konva.Text({
    text,
    fontSize,
    fontFamily,
    width,
    letterSpacing,
    padding,
    wrap,
    lineHeight,
    perfectDrawEnabled: false
  })
  
  // Get measured dimensions
  const measuredHeight = tempText.height()
  
  // Clean up
  tempText.destroy()
  
  return {
    width, // Width is constrained
    height: Math.max(measuredHeight, fontSize * lineHeight) // At least one line height
  }
}

/**
 * Calculate natural text dimensions without width constraints
 */
export function measureTextNatural({
  text,
  fontSize,
  fontFamily,
  lineHeight = 1.2,
  letterSpacing = 0,
  padding = 0 // Changed default to 0
}: Omit<MeasureTextOptions, 'width'>): { width: number; height: number; lines: string[] } {
  // Split text into lines
  const lines = text.split('\n')
  
  // Create canvas for measurement
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return { width: 100, height: fontSize * lineHeight, lines }
  
  context.font = `${fontSize}px ${fontFamily}`
  
  // Find the widest line
  let maxWidth = 0
  lines.forEach(line => {
    const metrics = context.measureText(line)
    if (metrics.width > maxWidth) {
      maxWidth = metrics.width
    }
  })
  
  // Calculate dimensions
  const width = maxWidth + padding * 2
  const height = (lines.length * fontSize * lineHeight) + padding * 2
  
  return {
    width: Math.max(width, 50), // Minimum width
    height: Math.max(height, fontSize * lineHeight), // At least one line height
    lines
  }
}