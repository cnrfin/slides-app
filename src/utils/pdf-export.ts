// src/utils/pdf-export.ts
import { jsPDF } from 'jspdf'
import type { Slide, TextContent, ShapeContent, ImageContent, LineContent, BlurbContent, TableContent, IconContent } from '@/types/slide.types'
import { CANVAS_DIMENSIONS } from '@/utils/canvas.constants'
import { drawSVGPath } from '@/utils/svg-path-parser'
import { getIconPath } from '@/utils/icon.utils'
import { applyOpacityToColor } from '@/utils/color.utils'
import { applyCanvasShadow } from '@/utils/shadow.utils'

export interface ExportPDFOptions {
  slides: Slide[]
  slideOrder?: string[] // Optional array of slide IDs in the correct order
  currentSlideId?: string
  fileName?: string
  quality?: number
  onProgress?: (progress: number) => void
  returnBlob?: boolean // NEW: Option to return blob instead of downloading
}

// Preload all images in slides
async function preloadImages(slides: Slide[]): Promise<Map<string, HTMLImageElement>> {
  const imageMap = new Map<string, HTMLImageElement>()
  const imagePromises: Promise<void>[] = []

  for (const slide of slides) {
    for (const element of slide.elements) {
      if (element.type === 'image') {
        const imageContent = element.content as ImageContent
        if (imageContent.src && !imageContent.isPlaceholder && !imageMap.has(imageContent.src)) {
          const promise = new Promise<void>((resolve) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              imageMap.set(imageContent.src, img)
              resolve()
            }
            img.onerror = () => {
              console.warn(`Failed to load image: ${imageContent.src}`)
              resolve()
            }
            img.src = imageContent.src
          })
          imagePromises.push(promise)
        }
      }
    }
  }

  await Promise.all(imagePromises)
  return imageMap
}

// Helper function to apply drop shadow to canvas context
const applyDropShadow = (ctx: CanvasRenderingContext2D, dropShadow?: any) => {
  applyCanvasShadow(ctx, dropShadow)
}

// Helper function to apply blur filter
const applyBlurFilter = (ctx: CanvasRenderingContext2D, blur?: number) => {
  if (blur && blur > 0) {
    ctx.filter = `blur(${blur}px)`
  } else {
    ctx.filter = 'none'
  }
}

// Helper function to map blend mode to canvas composite operation
const mapBlendModeToCompositeOperation = (blendMode?: string): GlobalCompositeOperation => {
  if (!blendMode) return 'source-over'
  
  // Map blend mode values to canvas composite operations
  const blendModeMap: Record<string, GlobalCompositeOperation> = {
    'normal': 'source-over',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'darken': 'darken',
    'lighten': 'lighten',
    'color-dodge': 'color-dodge',
    'color-burn': 'color-burn',
    'hard-light': 'hard-light',
    'soft-light': 'soft-light',
    'difference': 'difference',
    'exclusion': 'exclusion',
    'hue': 'hue',
    'saturation': 'saturation',
    'color': 'color',
    'luminosity': 'luminosity'
  }
  
  return blendModeMap[blendMode] || 'source-over'
}

// Helper function to calculate gradient points based on angle (matching canvas renderer)
const getGradientPoints = (angle: number, x: number, y: number, width: number, height: number) => {
  // Convert angle to radians (subtract 90 to match CSS convention)
  const rad = (angle - 90) * Math.PI / 180
  
  // Calculate direction vector
  const dx = Math.cos(rad)
  const dy = Math.sin(rad)
  
  // Calculate the diagonal length
  const diag = Math.sqrt(width * width + height * height)
  
  // Calculate points that extend beyond the shape to ensure full coverage
  const cx = x + width / 2
  const cy = y + height / 2
  
  return {
    startX: cx - dx * diag / 2,
    startY: cy - dy * diag / 2,
    endX: cx + dx * diag / 2,
    endY: cy + dy * diag / 2
  }
}

/**
 * Exports slides to PDF with high quality
 */
export async function exportSlidesToPDF<T extends ExportPDFOptions = ExportPDFOptions>({
  slides,
  slideOrder,
  currentSlideId,
  fileName = 'presentation.pdf',
  quality = 0.95,
  onProgress,
  returnBlob = false
}: T): Promise<T extends { returnBlob: true } ? Blob : void> {
  try {
    // Preload all images first
    const imageCache = await preloadImages(slides)

    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [CANVAS_DIMENSIONS.WIDTH, CANVAS_DIMENSIONS.HEIGHT]
    })

    // Use slides in the exact order they're provided
    // The slides array from the store is already in the correct order (as displayed in the UI)
    const sortedSlides = [...slides]
    
    // Debug logging
    console.log('PDF Export - Exporting slides in array order:')
    sortedSlides.forEach((slide, index) => {
      console.log(`  Slide ${index + 1}: ID=${slide.id}, order=${slide.order}`)
    })
    
    if (sortedSlides.length === 0) {
      console.error('No slides to export')
      throw new Error('No slides to export')
    }

    // Use higher resolution for better quality
    const scale = 2 // 2x resolution
    const scaledWidth = CANVAS_DIMENSIONS.WIDTH * scale
    const scaledHeight = CANVAS_DIMENSIONS.HEIGHT * scale

    // Process each slide
    for (let i = 0; i < sortedSlides.length; i++) {
      const slide = sortedSlides[i]
      
      if (onProgress) {
        onProgress((i / sortedSlides.length) * 100)
      }

      console.log(`Processing slide ${i + 1}/${sortedSlides.length} (order: ${slide.order})`)

      // Create a high-resolution canvas
      const canvas = document.createElement('canvas')
      canvas.width = scaledWidth
      canvas.height = scaledHeight
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        console.error('Failed to get canvas context')
        continue
      }

      // Scale context for high DPI
      ctx.scale(scale, scale)

      // Clear canvas and set background
      ctx.clearRect(0, 0, CANVAS_DIMENSIONS.WIDTH, CANVAS_DIMENSIONS.HEIGHT)
      
      // Handle background
      if (typeof slide.background === 'string') {
        ctx.fillStyle = slide.background || '#FFFFFF'
        ctx.fillRect(0, 0, CANVAS_DIMENSIONS.WIDTH, CANVAS_DIMENSIONS.HEIGHT)
      } else if (slide.background && typeof slide.background === 'object') {
        if (slide.background.type === 'color') {
          ctx.fillStyle = slide.background.value
          ctx.fillRect(0, 0, CANVAS_DIMENSIONS.WIDTH, CANVAS_DIMENSIONS.HEIGHT)
        } else if (slide.background.type === 'gradient') {
          const gradient = ctx.createLinearGradient(0, 0, CANVAS_DIMENSIONS.WIDTH, CANVAS_DIMENSIONS.HEIGHT)
          gradient.addColorStop(0, slide.background.value)
          gradient.addColorStop(1, '#FFFFFF')
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, CANVAS_DIMENSIONS.WIDTH, CANVAS_DIMENSIONS.HEIGHT)
        }
      } else {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, CANVAS_DIMENSIONS.WIDTH, CANVAS_DIMENSIONS.HEIGHT)
      }

      // Sort elements by z-index if available, otherwise maintain order
      const sortedElements = [...slide.elements].sort((a, b) => {
        const aZIndex = a.style?.zIndex || 0
        const bZIndex = b.style?.zIndex || 0
        return aZIndex - bZIndex
      })

      // Render elements
      for (const element of sortedElements) {
        if (element.visible === false) continue

        // Get element opacity (default to 1 if not set)
        const elementOpacity = element.opacity ?? 1
        
        // Get element blend mode
        const blendMode = element.style?.blendMode
        
        console.log(`Rendering ${element.type} at (${element.x}, ${element.y}) with opacity ${elementOpacity} and blend mode ${blendMode || 'normal'}`)

        // Save the current composite operation
        const originalCompositeOperation = ctx.globalCompositeOperation
        
        // Apply blend mode if specified
        if (blendMode) {
          ctx.globalCompositeOperation = mapBlendModeToCompositeOperation(blendMode)
        }

        try {
          switch (element.type) {
            case 'text': {
              const textContent = element.content as TextContent
              ctx.save()
              
              // Apply effects
              applyDropShadow(ctx, element.style?.dropShadow)
              applyBlurFilter(ctx, element.style?.blur)
              
              // Always set opacity (default to 1)
              ctx.globalAlpha = elementOpacity
              console.log(`Text element opacity: ${elementOpacity}`)
              
              const fontSize = element.style?.fontSize || 16
              const fontFamily = element.style?.fontFamily || 'Arial'
              const fontWeight = element.style?.fontWeight || 'normal'
              const fontStyle = element.style?.fontStyle || 'normal'
              
              // Set font with proper weight handling
              const fontWeightValue = fontWeight === 'bold' ? 'bold' : fontWeight === 'normal' ? 'normal' : fontWeight
              ctx.font = `${fontStyle} ${fontWeightValue} ${fontSize}px ${fontFamily}`
              
              // Handle gradient for text
              if (element.style?.gradientStart && element.style?.gradientEnd) {
                const gradientPoints = getGradientPoints(
                  element.style.gradientAngle || 0,
                  element.x,
                  element.y,
                  element.width,
                  element.height
                )
                
                const gradient = ctx.createLinearGradient(
                  gradientPoints.startX,
                  gradientPoints.startY,
                  gradientPoints.endX,
                  gradientPoints.endY
                )
                const startPos = (element.style.gradientStartPosition || 0) / 100
                const endPos = (element.style.gradientEndPosition || 100) / 100
                
                gradient.addColorStop(startPos, element.style.gradientStart)
                gradient.addColorStop(endPos, element.style.gradientEnd)
                ctx.fillStyle = gradient
              } else {
                ctx.fillStyle = element.style?.color || '#000000'
              }
              
              // Handle text alignment properly
              const textAlign = element.style?.textAlign || 'left'
              ctx.textBaseline = 'top'
              
              // Ensure we have the element's actual dimensions
              const elementWidth = element.width || 100
              const elementHeight = element.height || 50
              
              // Handle text with word wrapping
              const text = textContent.text || ''
              const lines = text.split('\n')
              const lineHeight = fontSize * (element.style?.lineHeight || 1.2)
              let y = element.y
              
              // Function to wrap text and return wrapped lines
              const wrapText = (text: string, maxWidth: number): string[] => {
                // Handle empty text
                if (!text || text.trim() === '') {
                  return []
                }
                
                const words = text.split(' ')
                const wrappedLines: string[] = []
                let currentLine = ''
                
                for (let n = 0; n < words.length; n++) {
                  const testLine = currentLine + words[n] + ' '
                  const metrics = ctx.measureText(testLine)
                  
                  if (metrics.width > maxWidth && n > 0) {
                    wrappedLines.push(currentLine.trim())
                    currentLine = words[n] + ' '
                  } else {
                    currentLine = testLine
                  }
                }
                if (currentLine.trim()) {
                  wrappedLines.push(currentLine.trim())
                }
                return wrappedLines
              }
              
              // Process each line and wrap if needed
              for (const line of lines) {
                const wrappedLines = wrapText(line, elementWidth)
                
                for (const wrappedLine of wrappedLines) {
                  // Calculate x position based on alignment for each wrapped line
                  let textX = element.x
                  
                  if (textAlign === 'justify' && wrappedLines.length > 1 && wrappedLine !== wrappedLines[wrappedLines.length - 1]) {
                    // Handle justified text (except last line)
                    const words = wrappedLine.split(' ')
                    if (words.length > 1) {
                      const wordsWidth = words.reduce((sum, word) => sum + ctx.measureText(word).width, 0)
                      const totalSpaceWidth = elementWidth - wordsWidth
                      const spaceWidth = totalSpaceWidth / (words.length - 1)
                      
                      let currentX = element.x
                      for (let i = 0; i < words.length; i++) {
                        ctx.fillText(words[i], currentX, y)
                        const wordWidth = ctx.measureText(words[i]).width
                        currentX += wordWidth + (i < words.length - 1 ? spaceWidth : 0)
                      }
                    } else {
                      // Single word line, align left
                      ctx.fillText(wrappedLine, element.x, y)
                    }
                  } else {
                    // Handle other alignments
                    if (textAlign === 'center') {
                      const lineWidth = ctx.measureText(wrappedLine).width
                      textX = element.x + (elementWidth - lineWidth) / 2
                    } else if (textAlign === 'right') {
                      const lineWidth = ctx.measureText(wrappedLine).width
                      textX = element.x + elementWidth - lineWidth
                    }
                    ctx.fillText(wrappedLine, textX, y)
                  }
                  y += lineHeight
                  
                  // Stop if we've exceeded the element's height
                  if (y - element.y > elementHeight) {
                    break
                  }
                }
                
                // Stop processing lines if we've exceeded height
                if (y - element.y > elementHeight) {
                  break
                }
              }
              
              ctx.restore()
              break
            }

            case 'shape': {
              const shapeContent = element.content as ShapeContent
              ctx.save()
              
              // Apply effects
              applyDropShadow(ctx, element.style?.dropShadow)
              applyBlurFilter(ctx, element.style?.blur)
              
              // For shapes, we handle opacity differently - apply it to the colors directly
              // This matches how the canvas renderer handles it
              
              // Get separate opacities for fill and stroke
              // For backward compatibility, if fillOpacity is not set, use the element's opacity
              const fillOpacity = element.style?.fillOpacity ?? elementOpacity
              const borderOpacity = element.style?.borderOpacity ?? 1
              
              console.log(`Shape element opacity - fill: ${fillOpacity}, border: ${borderOpacity}, element: ${elementOpacity}`)
              
              // Apply opacity to colors
              const fillColor = element.style?.gradientStart && element.style?.gradientEnd
                ? null // Will handle gradient separately
                : applyOpacityToColor(element.style?.backgroundColor || '#3b82f6', fillOpacity)
              const strokeColor = element.style?.borderWidth && element.style?.borderWidth > 0 
                ? applyOpacityToColor(element.style?.borderColor || '#000000', borderOpacity)
                : undefined
              
              // Handle gradient if present
              if (element.style?.gradientStart && element.style?.gradientEnd) {
                const gradientPoints = getGradientPoints(
                  element.style.gradientAngle || 0,
                  element.x,
                  element.y,
                  element.width,
                  element.height
                )
                
                const gradient = ctx.createLinearGradient(
                  gradientPoints.startX,
                  gradientPoints.startY,
                  gradientPoints.endX,
                  gradientPoints.endY
                )
                const startPos = (element.style.gradientStartPosition || 0) / 100
                const endPos = (element.style.gradientEndPosition || 100) / 100
                
                // Apply opacity to gradient colors
                const gradientStartColor = applyOpacityToColor(element.style.gradientStart, fillOpacity) || element.style.gradientStart
                const gradientEndColor = applyOpacityToColor(element.style.gradientEnd, fillOpacity) || element.style.gradientEnd
                
                gradient.addColorStop(startPos, gradientStartColor)
                gradient.addColorStop(endPos, gradientEndColor)
                ctx.fillStyle = gradient
              } else if (fillColor) {
                ctx.fillStyle = fillColor
              } else {
                ctx.fillStyle = '#3b82f6'
              }
              if (strokeColor) {
                ctx.strokeStyle = strokeColor
                ctx.lineWidth = element.style?.borderWidth || 0
              }
              
              if (shapeContent.shape === 'rectangle') {
                // Calculate actual corner radius - convert percentage to pixels
                const smallerDimension = Math.min(element.width, element.height)
                const radiusPercent = element.style?.borderRadius || 0
                
                // For 100% radius, create an ellipse
                if (radiusPercent === 100) {
                  // Draw an ellipse using arc
                  ctx.beginPath()
                  ctx.ellipse(
                    element.x + element.width / 2,
                    element.y + element.height / 2,
                    element.width / 2,
                    element.height / 2,
                    0,
                    0,
                    2 * Math.PI
                  )
                  ctx.fill()
                  if (element.style?.borderWidth) ctx.stroke()
                } else if (radiusPercent > 0) {
                  // Calculate radius as percentage of half the smaller dimension
                  const radius = (radiusPercent / 100) * (smallerDimension / 2)
                  
                  // Ensure radius doesn't exceed half of the smallest dimension
                  const maxRadius = smallerDimension / 2
                  const actualRadius = Math.min(radius, maxRadius)
                  
                  // Rounded rectangle
                  ctx.beginPath()
                  ctx.moveTo(element.x + actualRadius, element.y)
                  ctx.lineTo(element.x + element.width - actualRadius, element.y)
                  ctx.quadraticCurveTo(element.x + element.width, element.y, element.x + element.width, element.y + actualRadius)
                  ctx.lineTo(element.x + element.width, element.y + element.height - actualRadius)
                  ctx.quadraticCurveTo(element.x + element.width, element.y + element.height, element.x + element.width - actualRadius, element.y + element.height)
                  ctx.lineTo(element.x + actualRadius, element.y + element.height)
                  ctx.quadraticCurveTo(element.x, element.y + element.height, element.x, element.y + element.height - actualRadius)
                  ctx.lineTo(element.x, element.y + actualRadius)
                  ctx.quadraticCurveTo(element.x, element.y, element.x + actualRadius, element.y)
                  ctx.closePath()
                  ctx.fill()
                  if (element.style?.borderWidth) ctx.stroke()
                } else {
                  // Regular rectangle
                  ctx.fillRect(element.x, element.y, element.width, element.height)
                  if (element.style?.borderWidth) {
                    ctx.strokeRect(element.x, element.y, element.width, element.height)
                  }
                }
              } else if (shapeContent.shape === 'circle') {
                ctx.beginPath()
                ctx.ellipse(
                  element.x + element.width / 2,
                  element.y + element.height / 2,
                  element.width / 2,
                  element.height / 2,
                  0,
                  0,
                  2 * Math.PI
                )
                ctx.fill()
                if (element.style?.borderWidth) ctx.stroke()
              } else if (shapeContent.shape === 'svg') {
                // Handle custom SVG shapes
                console.log('Rendering SVG shape:', {
                  svgId: shapeContent.svgId,
                  hasPath: !!shapeContent.svgPath,
                  pathLength: shapeContent.svgPath?.length,
                  viewBox: shapeContent.viewBox
                })
                
                if (!shapeContent.svgPath) {
                  console.warn('SVG shape has no path data, rendering as rectangle')
                  ctx.fillRect(element.x, element.y, element.width, element.height)
                  break
                }
                
                  // Already inside a save/restore block
                  // Don't apply globalAlpha since we're handling opacity in the colors
                ctx.translate(element.x, element.y)
                
                // Scale to fit the element bounds
                if (shapeContent.viewBox) {
                  const viewBoxParts = shapeContent.viewBox.split(' ').map(Number)
                  const vbX = viewBoxParts[0] || 0
                  const vbY = viewBoxParts[1] || 0
                  const vbWidth = viewBoxParts[2]
                  const vbHeight = viewBoxParts[3]
                  const scaleX = element.width / vbWidth
                  const scaleY = element.height / vbHeight
                  
                  // Translate for viewBox offset
                  ctx.translate(-vbX * scaleX, -vbY * scaleY)
                  ctx.scale(scaleX, scaleY)
                }
                
                try {
                  // Apply opacity to SVG shape colors
                  const svgFillOpacity = element.style?.fillOpacity ?? elementOpacity
                  
                  // Handle gradient for SVG shapes
                  if (element.style?.gradientStart && element.style?.gradientEnd) {
                    // For SVG shapes, gradient is relative to the shape's local coordinates
                    const gradientPoints = getGradientPoints(
                      element.style.gradientAngle || 0,
                      0,  // Local coordinates start at 0
                      0,  // Local coordinates start at 0
                      element.width,
                      element.height
                    )
                    
                    const gradient = ctx.createLinearGradient(
                      gradientPoints.startX,
                      gradientPoints.startY,
                      gradientPoints.endX,
                      gradientPoints.endY
                    )
                    const startPos = (element.style.gradientStartPosition || 0) / 100
                    const endPos = (element.style.gradientEndPosition || 100) / 100
                    
                    // Apply opacity to gradient colors
                    const gradientStartColor = applyOpacityToColor(element.style.gradientStart, svgFillOpacity) || element.style.gradientStart
                    const gradientEndColor = applyOpacityToColor(element.style.gradientEnd, svgFillOpacity) || element.style.gradientEnd
                    
                    gradient.addColorStop(startPos, gradientStartColor)
                    gradient.addColorStop(endPos, gradientEndColor)
                    ctx.fillStyle = gradient
                  } else {
                    const svgFillColor = applyOpacityToColor(element.style?.backgroundColor || '#cccccc', svgFillOpacity)
                    ctx.fillStyle = svgFillColor || '#cccccc'
                  }
                  
                  const svgStrokeColor = element.style?.borderWidth && element.style?.borderWidth > 0
                    ? applyOpacityToColor(element.style?.borderColor || '#000000', element.style?.borderOpacity ?? 1)
                    : undefined
                  if (svgStrokeColor) {
                    ctx.strokeStyle = svgStrokeColor
                    ctx.lineWidth = element.style?.borderWidth || 0
                  }
                  // First try native Path2D if available
                  if (typeof Path2D !== 'undefined') {
                    try {
                      const path = new Path2D(shapeContent.svgPath)
                      ctx.fill(path)
                      if (element.style?.borderWidth) {
                        ctx.stroke(path)
                      }
                    } catch (pathError) {
                      console.log('Path2D failed, using custom parser')
                      // Fallback to custom parser
                      drawSVGPath(ctx, shapeContent.svgPath)
                      ctx.fill()
                      if (element.style?.borderWidth) {
                        drawSVGPath(ctx, shapeContent.svgPath)
                        ctx.stroke()
                      }
                    }
                  } else {
                    // Use custom parser directly
                    drawSVGPath(ctx, shapeContent.svgPath)
                    ctx.fill()
                    if (element.style?.borderWidth) {
                      drawSVGPath(ctx, shapeContent.svgPath)
                      ctx.stroke()
                    }
                  }
                } catch (error) {
                  console.error('Failed to render SVG path:', error)
                  // Fallback: render as rectangle
                  ctx.fillRect(0, 0, element.width, element.height)
                }
                  // Don't need another restore since parent handles it
              }
              
              ctx.restore()
              break
            }

            case 'image': {
              const imageContent = element.content as ImageContent
              const img = imageCache.get(imageContent.src)
              
              if (img) {
                ctx.save()
                
                // Apply effects
                applyDropShadow(ctx, element.style?.dropShadow)
                applyBlurFilter(ctx, element.style?.blur)
                
                // Always set opacity (default to 1)
                ctx.globalAlpha = elementOpacity
                console.log(`Image element opacity: ${elementOpacity}`)
                
                // Create clipping path with corner radius if needed
                const radiusPercent = element.style?.borderRadius || 0
                if (radiusPercent > 0) {
                  const smallerDimension = Math.min(element.width, element.height)
                  
                  // For 100% radius, use ellipse for perfect circle/ellipse
                  if (radiusPercent === 100) {
                    ctx.beginPath()
                    ctx.ellipse(
                      element.x + element.width / 2,
                      element.y + element.height / 2,
                      element.width / 2,
                      element.height / 2,
                      0,
                      0,
                      2 * Math.PI
                    )
                    ctx.clip()
                  } else {
                    // For other radius values, create rounded rectangle clipping path
                    const radius = (radiusPercent / 100) * (smallerDimension / 2)
                    
                    ctx.beginPath()
                    ctx.moveTo(element.x + radius, element.y)
                    ctx.lineTo(element.x + element.width - radius, element.y)
                    ctx.quadraticCurveTo(element.x + element.width, element.y, element.x + element.width, element.y + radius)
                    ctx.lineTo(element.x + element.width, element.y + element.height - radius)
                    ctx.quadraticCurveTo(element.x + element.width, element.y + element.height, element.x + element.width - radius, element.y + element.height)
                    ctx.lineTo(element.x + radius, element.y + element.height)
                    ctx.quadraticCurveTo(element.x, element.y + element.height, element.x, element.y + element.height - radius)
                    ctx.lineTo(element.x, element.y + radius)
                    ctx.quadraticCurveTo(element.x, element.y, element.x + radius, element.y)
                    ctx.closePath()
                    ctx.clip()
                  }
                } else {
                  // Regular rectangular clipping
                  ctx.beginPath()
                  ctx.rect(element.x, element.y, element.width, element.height)
                  ctx.clip()
                }
                
                // Handle object-fit with proper clipping
                const objectFit = imageContent.objectFit || 'cover'
                
                if (objectFit === 'cover') {
                  const imgAspect = img.width / img.height
                  const elementAspect = element.width / element.height
                  const scale = imageContent.scale || 1
                  const offsetX = imageContent.offsetX ?? 0.5
                  const offsetY = imageContent.offsetY ?? 0.5
                  
                  let sourceWidth = img.width
                  let sourceHeight = img.height
                  let sourceX = 0
                  let sourceY = 0
                  
                  // Calculate the scaled display dimensions
                  let displayWidth: number
                  let displayHeight: number
                  
                  if (imgAspect > elementAspect) {
                    // Image is wider - fit to height and crop width
                    displayHeight = element.height
                    displayWidth = displayHeight * imgAspect
                  } else {
                    // Image is taller - fit to width and crop height
                    displayWidth = element.width
                    displayHeight = displayWidth / imgAspect
                  }
                  
                  // Apply scale
                  displayWidth *= scale
                  displayHeight *= scale
                  
                  // Calculate source rectangle for cropping
                  // We need to map the visible area back to source coordinates
                  const scaleFactorX = img.width / displayWidth
                  const scaleFactorY = img.height / displayHeight
                  
                  // Calculate how much of the image extends beyond the frame
                  const overflowX = Math.max(0, displayWidth - element.width)
                  const overflowY = Math.max(0, displayHeight - element.height)
                  
                  // Calculate source crop region based on offset
                  sourceX = overflowX * offsetX * scaleFactorX
                  sourceY = overflowY * offsetY * scaleFactorY
                  sourceWidth = element.width * scaleFactorX
                  sourceHeight = element.height * scaleFactorY
                  
                  // Ensure source coordinates are within bounds
                  sourceX = Math.max(0, Math.min(sourceX, img.width - sourceWidth))
                  sourceY = Math.max(0, Math.min(sourceY, img.height - sourceHeight))
                  sourceWidth = Math.min(sourceWidth, img.width - sourceX)
                  sourceHeight = Math.min(sourceHeight, img.height - sourceY)
                  
                  // Draw the cropped image
                  ctx.drawImage(
                    img,
                    sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
                    element.x, element.y, element.width, element.height // Destination rectangle
                  )
                } else if (objectFit === 'contain') {
                  // Contain: Scale image to fit within element, maintaining aspect ratio
                  const imgAspect = img.width / img.height
                  const elementAspect = element.width / element.height
                  
                  let drawX = element.x
                  let drawY = element.y
                  let drawWidth = element.width
                  let drawHeight = element.height
                  
                  if (imgAspect > elementAspect) {
                    // Image is wider - fit to width
                    drawWidth = element.width
                    drawHeight = drawWidth / imgAspect
                    drawY = element.y + (element.height - drawHeight) / 2
                  } else {
                    // Image is taller - fit to height
                    drawHeight = element.height
                    drawWidth = drawHeight * imgAspect
                    drawX = element.x + (element.width - drawWidth) / 2
                  }
                  
                  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
                } else if (objectFit === 'fill' || objectFit === 'scale-down') {
                  // Fill: Stretch image to fill element
                  ctx.drawImage(img, element.x, element.y, element.width, element.height)
                } else {
                  // None: Draw image at natural size
                  ctx.drawImage(img, element.x, element.y, img.width, img.height)
                }
                
                ctx.restore()
              }
              break
            }

            case 'line': {
              const lineContent = element.content as LineContent
              const points = lineContent.points || []
              if (points.length >= 4) {
                ctx.save()
                
                // Apply effects
                applyDropShadow(ctx, element.style?.dropShadow)
                applyBlurFilter(ctx, element.style?.blur)
                
                // Always set opacity (default to 1)
                ctx.globalAlpha = elementOpacity
                console.log(`Line element opacity: ${elementOpacity}`)
                
                ctx.strokeStyle = element.style?.borderColor || '#000000'
                ctx.lineWidth = element.style?.borderWidth || 2
                ctx.lineCap = lineContent.lineCap || 'round'
                
                ctx.beginPath()
                ctx.moveTo(points[0] + element.x, points[1] + element.y)
                ctx.lineTo(points[2] + element.x, points[3] + element.y)
                ctx.stroke()
                
                ctx.restore()
              }
              break
            }

            case 'icon': {
              const iconContent = element.content as IconContent
              
              // Get the SVG path from content or icon utils
              let svgPath = iconContent.svgPath
              let iconData = { path: '', filled: false, viewBox: '0 0 24 24' }
              
              // If path is not in content, get it from icon utils
              if (!svgPath && iconContent.iconId) {
                try {
                  iconData = getIconPath(iconContent.iconId)
                  svgPath = iconData.path
                  console.log(`Retrieved icon path for '${iconContent.iconId}':`, {
                    hasPath: !!svgPath,
                    pathLength: svgPath?.length,
                    filled: iconData.filled
                  })
                } catch (error) {
                  console.error(`Error getting icon path for '${iconContent.iconId}':`, error)
                }
              }
              
              console.log('Rendering icon:', {
                iconId: iconContent.iconId,
                iconType: iconContent.iconType,
                hasPath: !!svgPath,
                pathLength: svgPath?.length,
                filled: iconData.filled,
                opacity: element.opacity
              })
              
              if (!svgPath || svgPath.trim() === '') {
                console.warn(`Icon has no SVG path data: ${iconContent.iconId}, rendering placeholder`)
                // Render a placeholder circle
                ctx.save()
                ctx.globalAlpha = elementOpacity
                console.log(`Icon placeholder opacity: ${elementOpacity}`)
                ctx.strokeStyle = element.style?.color || '#000000'
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.arc(
                  element.x + element.width / 2,
                  element.y + element.height / 2,
                  Math.min(element.width, element.height) / 3,
                  0,
                  2 * Math.PI
                )
                ctx.stroke()
                ctx.restore()
                break
              }
              
              ctx.save()
              
              // Apply effects
              applyDropShadow(ctx, element.style?.dropShadow)
              applyBlurFilter(ctx, element.style?.blur)
              
              // Always set opacity (default to 1)
              ctx.globalAlpha = elementOpacity
              console.log(`Icon element opacity: ${elementOpacity}`)
              
              // Set up colors and stroke
              const color = element.style?.color || element.style?.borderColor || '#000000'
              ctx.fillStyle = color
              ctx.strokeStyle = color
              ctx.lineCap = 'round'
              ctx.lineJoin = 'round'
              
              // Parse viewBox if available
              let viewBoxWidth = 24
              let viewBoxHeight = 24
              if (iconData.viewBox) {
                const parts = iconData.viewBox.split(' ').map(Number)
                if (parts.length >= 4) {
                  viewBoxWidth = parts[2] || 24
                  viewBoxHeight = parts[3] || 24
                }
              }
              
              // Center and scale the icon in the element bounds
              const scale = Math.min(element.width / viewBoxWidth, element.height / viewBoxHeight)
              const offsetX = (element.width - viewBoxWidth * scale) / 2
              const offsetY = (element.height - viewBoxHeight * scale) / 2
              
              // Adjust stroke width based on scale to match canvas rendering
              // The canvas divides strokeWidth by (element.width / 24)
              const scaledStrokeWidth = (element.style?.strokeWidth || 2) / scale
              ctx.lineWidth = scaledStrokeWidth
              
              console.log('Icon render settings:', {
                color,
                originalStrokeWidth: element.style?.strokeWidth || 2,
                scale,
                scaledStrokeWidth,
                globalAlpha: ctx.globalAlpha
              })
              
              ctx.translate(element.x + offsetX, element.y + offsetY)
              ctx.scale(scale, scale)
              
              try {
                // First try native Path2D if available
                if (typeof Path2D !== 'undefined') {
                  try {
                    const path = new Path2D(svgPath)
                    
                    // Check if icon should be filled or stroked
                    if (iconData.filled || iconContent.iconType === 'custom') {
                      console.log('Filling icon path')
                      ctx.fill(path)
                    } else {
                      // Most icons are stroked
                      console.log('Stroking icon path')
                      ctx.stroke(path)
                    }
                  } catch (pathError) {
                    console.log('Path2D failed for icon, using custom parser:', pathError)
                    // Fallback to custom parser
                    drawSVGPath(ctx, svgPath)
                    
                    if (iconData.filled || iconContent.iconType === 'custom') {
                      ctx.fill()
                    } else {
                      ctx.stroke()
                    }
                  }
                } else {
                  // Use custom parser directly
                  drawSVGPath(ctx, svgPath)
                  
                  if (iconData.filled || iconContent.iconType === 'custom') {
                    ctx.fill()
                  } else {
                    ctx.stroke()
                  }
                }
              } catch (error) {
                console.error('Failed to render icon path:', error)
                console.error('Icon path data:', svgPath)
                // Fallback: render a simple circle
                ctx.beginPath()
                ctx.arc(12, 12, 10, 0, 2 * Math.PI)
                ctx.stroke()
              }
              
              ctx.restore()
              break
            }

            case 'table': {
              const tableContent = element.content as TableContent
              ctx.save()
              
              // Apply effects
              applyDropShadow(ctx, element.style?.dropShadow)
              applyBlurFilter(ctx, element.style?.blur)
              
              // Always set opacity (default to 1)
              ctx.globalAlpha = elementOpacity
              console.log(`Table element opacity: ${elementOpacity}`)
              
              // Calculate cell dimensions
              const cellWidth = element.width / tableContent.columns
              const cellHeight = element.height / tableContent.rows
              
              // Draw table border
              ctx.strokeStyle = element.style?.borderColor || '#e5e7eb'
              ctx.lineWidth = 1
              ctx.strokeRect(element.x, element.y, element.width, element.height)
              
              // Draw cells
              for (let row = 0; row < tableContent.rows; row++) {
                for (let col = 0; col < tableContent.columns; col++) {
                  const x = element.x + col * cellWidth
                  const y = element.y + row * cellHeight
                  
                  // Draw cell border
                  ctx.strokeRect(x, y, cellWidth, cellHeight)
                  
                  // Draw cell content
                  const cell = tableContent.cells[row]?.[col]
                  if (cell?.text) {
                    ctx.fillStyle = cell.style?.color || '#000000'
                    ctx.font = `${cell.style?.fontSize || 14}px ${element.style?.fontFamily || 'Arial'}`
                    ctx.textAlign = (cell.style?.textAlign as CanvasTextAlign) || 'center'
                    ctx.textBaseline = 'middle'
                    
                    const textX = x + cellWidth / 2
                    const textY = y + cellHeight / 2
                    ctx.fillText(cell.text, textX, textY)
                  }
                }
              }
              
              ctx.restore()
              break
            }

            case 'blurb': {
              const blurbContent = element.content as BlurbContent
              ctx.save()
              
              // Apply effects
              applyDropShadow(ctx, element.style?.dropShadow)
              applyBlurFilter(ctx, element.style?.blur)
              
              // Always set opacity (default to 1)
              ctx.globalAlpha = elementOpacity
              console.log(`Blurb element opacity: ${elementOpacity}`)
              
              const tailSize = 20 // Size of the speech bubble tail
              const tailPosition = blurbContent.tailPosition || 'bottom-left'
              const padding = 20 // Internal padding for text
              
              // Calculate bubble dimensions accounting for tail
              const bubbleX = element.x + (tailPosition === 'left-center' ? tailSize : 0)
              const bubbleY = element.y + (tailPosition.startsWith('top') ? tailSize : 0)
              const bubbleWidth = element.width - (tailPosition === 'left-center' || tailPosition === 'right-center' ? tailSize : 0)
              const bubbleHeight = element.height - (tailPosition.startsWith('bottom') || tailPosition.startsWith('top') ? tailSize : 0)
              
              // Calculate corner radius
              const smallerDimension = Math.min(bubbleWidth, bubbleHeight)
              const radiusPercent = element.style?.borderRadius || 25
              const radius = radiusPercent === 100 
                ? smallerDimension / 2
                : (radiusPercent / 100) * (smallerDimension / 2)
              
              // Set styles
              ctx.fillStyle = element.style?.backgroundColor || '#3b82f6'
              ctx.strokeStyle = element.style?.borderColor || '#3b82f6'
              ctx.lineWidth = element.style?.borderWidth || 0
              
              // Draw main bubble body (rounded rectangle)
              ctx.beginPath()
              ctx.moveTo(bubbleX + radius, bubbleY)
              ctx.lineTo(bubbleX + bubbleWidth - radius, bubbleY)
              ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + radius)
              ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius)
              ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - radius, bubbleY + bubbleHeight)
              ctx.lineTo(bubbleX + radius, bubbleY + bubbleHeight)
              ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - radius)
              ctx.lineTo(bubbleX, bubbleY + radius)
              ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + radius, bubbleY)
              ctx.closePath()
              ctx.fill()
              if (element.style?.borderWidth && element.style.borderWidth > 0) {
                ctx.stroke()
              }
              
              // Draw the tail
              ctx.beginPath()
              if (tailPosition.startsWith('bottom')) {
                // Bottom tail
                const tailX = element.x + (tailPosition === 'bottom-left' ? element.width * 0.2 : 
                                         tailPosition === 'bottom-right' ? element.width * 0.8 :
                                         element.width * 0.5)
                
                const bubbleBottom = element.y + element.height - tailSize
                
                // Start from left side of tail base
                ctx.moveTo(tailX - 15, bubbleBottom - 5)
                // Draw to tail point
                ctx.lineTo(tailX, element.y + element.height)
                // Draw to right side of tail base
                ctx.lineTo(tailX + 15, bubbleBottom - 5)
                ctx.closePath()
              } else if (tailPosition.startsWith('top')) {
                // Top tail
                const tailX = element.x + (tailPosition === 'top-left' ? element.width * 0.2 : 
                                         tailPosition === 'top-right' ? element.width * 0.8 :
                                         element.width * 0.5)
                
                ctx.moveTo(tailX - 15, element.y + tailSize + 5)
                ctx.lineTo(tailX, element.y)
                ctx.lineTo(tailX + 15, element.y + tailSize + 5)
                ctx.closePath()
              } else if (tailPosition === 'left-center') {
                // Left tail
                const tailY = element.y + element.height * 0.5
                
                ctx.moveTo(element.x + tailSize + 5, tailY - 15)
                ctx.lineTo(element.x, tailY)
                ctx.lineTo(element.x + tailSize + 5, tailY + 15)
                ctx.closePath()
              } else if (tailPosition === 'right-center') {
                // Right tail
                const tailY = element.y + element.height * 0.5
                const bubbleRight = element.x + element.width - tailSize
                
                ctx.moveTo(bubbleRight - 5, tailY - 15)
                ctx.lineTo(element.x + element.width, tailY)
                ctx.lineTo(bubbleRight - 5, tailY + 15)
                ctx.closePath()
              }
              ctx.fill()
              if (element.style?.borderWidth && element.style.borderWidth > 0) {
                ctx.stroke()
              }
              
              // Draw text inside bubble
              const fontSize = element.style?.fontSize || 16
              const fontFamily = element.style?.fontFamily || 'Arial'
              const fontWeight = element.style?.fontWeight || 'normal'
              const fontStyle = element.style?.fontStyle || 'normal'
              
              ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
              ctx.fillStyle = element.style?.color || '#ffffff'
              ctx.textAlign = 'left'
              ctx.textBaseline = 'top'
              
              // Calculate text area
              const textX = bubbleX + padding
              const textY = bubbleY + padding
              const textMaxWidth = bubbleWidth - (padding * 2)
              const textMaxHeight = bubbleHeight - (padding * 2)
              
              // Text wrapping
              const text = blurbContent.text || ''
              const lines = text.split('\n')
              const lineHeight = fontSize * (element.style?.lineHeight || 1.2)
              let currentY = textY
              
              for (const line of lines) {
                const words = line.split(' ')
                let currentLine = ''
                
                for (let n = 0; n < words.length; n++) {
                  const testLine = currentLine + words[n] + ' '
                  const metrics = ctx.measureText(testLine)
                  
                  if (metrics.width > textMaxWidth && n > 0) {
                    // Handle text alignment
                    let lineX = textX
                    const textAlign = element.style?.textAlign || 'left'
                    
                    if (textAlign === 'center') {
                      const lineWidth = ctx.measureText(currentLine.trim()).width
                      lineX = textX + (textMaxWidth - lineWidth) / 2
                    } else if (textAlign === 'right') {
                      const lineWidth = ctx.measureText(currentLine.trim()).width
                      lineX = textX + textMaxWidth - lineWidth
                    }
                    
                    ctx.fillText(currentLine.trim(), lineX, currentY)
                    currentLine = words[n] + ' '
                    currentY += lineHeight
                    
                    // Check if we've exceeded max height
                    if (currentY - textY > textMaxHeight) {
                      break
                    }
                  } else {
                    currentLine = testLine
                  }
                }
                
                // Draw the last line of the paragraph
                if (currentLine.trim() && currentY - textY <= textMaxHeight) {
                  let lineX = textX
                  const textAlign = element.style?.textAlign || 'left'
                  
                  if (textAlign === 'center') {
                    const lineWidth = ctx.measureText(currentLine.trim()).width
                    lineX = textX + (textMaxWidth - lineWidth) / 2
                  } else if (textAlign === 'right') {
                    const lineWidth = ctx.measureText(currentLine.trim()).width
                    lineX = textX + textMaxWidth - lineWidth
                  }
                  
                  ctx.fillText(currentLine.trim(), lineX, currentY)
                  currentY += lineHeight
                }
                
                // Check if we've exceeded max height
                if (currentY - textY > textMaxHeight) {
                  break
                }
              }
              
              ctx.restore()
              break
            }
          }
        } catch (error) {
          console.error(`Error rendering ${element.type}:`, error)
        } finally {
          // Always restore the original composite operation
          ctx.globalCompositeOperation = originalCompositeOperation
        }
      }

      // Add to PDF
      if (i > 0) {
        pdf.addPage([CANVAS_DIMENSIONS.WIDTH, CANVAS_DIMENSIONS.HEIGHT])
      }

      // Convert canvas to data URL and add to PDF
      const dataURL = canvas.toDataURL('image/jpeg', quality)
      pdf.addImage(
        dataURL,
        'JPEG',
        0,
        0,
        CANVAS_DIMENSIONS.WIDTH,
        CANVAS_DIMENSIONS.HEIGHT
      )
    }

    // Report completion
    if (onProgress) {
      onProgress(100)
    }

    // Return blob if requested, otherwise save
    if (returnBlob) {
      return pdf.output('blob') as any
    }
    
    // Save the PDF
    pdf.save(fileName)

  } catch (error) {
    console.error('Error exporting PDF:', error)
    throw error
  }
}

/**
 * Exports a single slide to PDF
 */
export async function exportSlideToPDF(
  slide: Slide,
  fileName?: string
): Promise<void> {
  return exportSlidesToPDF({
    slides: [slide],
    fileName: fileName || `slide-${slide.id}.pdf`
  })
}
