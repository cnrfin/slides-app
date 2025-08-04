// src/utils/text.utils.ts
import Konva from 'konva'
import { loadFont } from './font.utils'

interface MeasureTextOptions {
  text: string
  fontSize: number
  fontFamily: string
  fontWeight?: string
  width?: number
  lineHeight?: number
  letterSpacing?: number
  padding?: number
  wrap?: 'word' | 'char' | 'none'
}

/**
 * Synchronous version of measureAutoText for immediate use
 * Note: May be less accurate if font is not yet loaded
 */
export function measureAutoText({
  text,
  fontSize,
  fontFamily,
  fontWeight,
  lineHeight = 1.2,
  letterSpacing = 0,
  padding = 0,
  width
}: MeasureTextOptions): { width: number; height: number } {
  // Handle empty text
  if (!text || text.trim() === '') {
    return {
      width: width || 100,
      height: fontSize * lineHeight
    }
  }
  
  // Create a text node to measure
  const tempText = new Konva.Text({
    text,
    fontSize,
    fontFamily,
    fontStyle: fontWeight || 'normal',
    letterSpacing,
    padding,
    wrap: width ? 'word' : 'none',
    width: width || undefined,
    lineHeight,
    perfectDrawEnabled: false
  })
  
  // Get measured dimensions
  const measuredWidth = tempText.width()
  const measuredHeight = tempText.height()
  
  // Clean up
  tempText.destroy()
  
  return {
    width: width || Math.max(measuredWidth, 50), // Minimum width if not constrained
    height: Math.max(measuredHeight, fontSize * lineHeight) // At least one line height
  }
}

/**
 * Measure text dimensions using a temporary Konva.Text node
 */
export function measureText({
  text,
  fontSize,
  fontFamily,
  fontWeight,
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
    fontStyle: fontWeight || 'normal',
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
 * Async version that ensures font is loaded before measuring
 */
export async function measureTextAsync({
  text,
  fontSize,
  fontFamily,
  fontWeight = '400',
  width,
  lineHeight = 1.2,
  letterSpacing = 0,
  padding = 0,
  wrap = 'word'
}: MeasureTextOptions): Promise<{ width: number; height: number }> {
  // Ensure font is loaded before measuring
  await loadFont(fontFamily, fontWeight)
  
  // Use sync version after font is loaded
  return measureText({
    text,
    fontSize,
    fontFamily,
    fontWeight,
    width,
    lineHeight,
    letterSpacing,
    padding,
    wrap
  })
}

/**
 * Measure wrapped text dimensions with a specific width constraint
 */
export function measureWrappedText({
  text,
  fontSize,
  fontFamily,
  fontWeight,
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
    fontStyle: fontWeight || 'normal',
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
  fontWeight,
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
  
  const fontStylePrefix = fontWeight && fontWeight !== '400' && fontWeight !== 'normal' ? `${fontWeight} ` : ''
  context.font = `${fontStylePrefix}${fontSize}px ${fontFamily}`
  
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
