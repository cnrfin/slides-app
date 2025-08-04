// src/components/canvas/ElementRenderer.tsx
import React, { useMemo, useState, useEffect } from 'react'
import { Group, Rect, Text, Image, Shape, Path, Line } from 'react-konva'
import { CANVAS_DIMENSIONS, CANVAS_COLORS } from '@/utils/canvas.constants'
import type { SlideElement, TextContent, ShapeContent, ImageContent, BlurbContent, LineContent } from '@/types/slide.types'
import Konva from 'konva'
import useSlideStore from '@/stores/slideStore'
import { loadFont } from '@/utils/font.utils'

// Helper function to parse viewBox string
const parseViewBox = (viewBox: string) => {
  const [x, y, width, height] = viewBox.split(' ').map(Number)
  return { x, y, width, height }
}

// Helper function to calculate gradient points based on angle
const getGradientPoints = (angle: number, width: number, height: number) => {
  // Convert angle to radians
  const rad = (angle - 90) * Math.PI / 180
  
  // Calculate direction vector
  const dx = Math.cos(rad)
  const dy = Math.sin(rad)
  
  // Calculate the diagonal length
  const diag = Math.sqrt(width * width + height * height)
  
  // Calculate points that extend beyond the shape to ensure full coverage
  const cx = width / 2
  const cy = height / 2
  
  return {
    start: {
      x: cx - dx * diag / 2,
      y: cy - dy * diag / 2
    },
    end: {
      x: cx + dx * diag / 2,
      y: cy + dy * diag / 2
    }
  }
}

interface ElementRendererProps {
  element: SlideElement
  isSelected: boolean
  isEditing?: boolean
  isHovered?: boolean
  isDragTarget?: boolean
  draggable?: boolean
  dataKey?: string
  showTemplateIndicators?: boolean
  onSelect: (e: any, elementId: string) => void
  onDragStart?: (e: any, elementId: string) => void
  onDrag?: (e: any) => void
  onDragEnd: (e: any, elementId: string) => void
  onDoubleClick?: (e: any, element: SlideElement) => void
  onMouseEnter?: (elementId: string) => void
  onMouseLeave?: (elementId: string) => void
}

const ElementRenderer = React.memo(({
element,
isSelected,
isEditing = false,
isHovered = false,
isDragTarget = false,
draggable = true,
dataKey,
showTemplateIndicators = false,
onSelect,
onDragStart,
onDrag,
onDragEnd,
onDoubleClick,
onMouseEnter,
onMouseLeave
}: ElementRendererProps) => {
// Image loading state and dimensions
const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 100, height: 100 })
  const [fontLoaded, setFontLoaded] = useState(false)
  
  // Get visibility state from store
  const showOutsideElements = useSlideStore(state => state.showOutsideElements)
  
  // Load image when element is an image type
  useEffect(() => {
    if (element.type === 'image') {
      const imageContent = element.content as ImageContent
      const img = new window.Image()
      img.onload = () => {
        setImageObj(img)
        setImageDimensions({ width: img.width, height: img.height })
      }
      img.onerror = () => {
        console.error('Failed to load image:', imageContent.src)
      }
      img.src = imageContent.src
    }
  }, [element])
  
  // Load font when element is a text type
  useEffect(() => {
    if ((element.type === 'text' || element.type === 'blurb') && element.style?.fontFamily) {
      setFontLoaded(false)
      loadFont(element.style.fontFamily, element.style.fontWeight || '400')
        .then(() => setFontLoaded(true))
        .catch(() => {
          console.warn(`Failed to load font: ${element.style?.fontFamily}`)
          setFontLoaded(true) // Continue rendering with fallback font
        })
    } else {
      setFontLoaded(true)
    }
  }, [element.type, element.style?.fontFamily, element.style?.fontWeight])
  
  // Memoize boundary checks
  const isOutsideSlide = useMemo(() => {
    return element.x < 0 || 
           element.y < 0 || 
           element.x + element.width > CANVAS_DIMENSIONS.WIDTH || 
           element.y + element.height > CANVAS_DIMENSIONS.HEIGHT
  }, [element.x, element.y, element.width, element.height])
  
  const isCompletelyOutside = useMemo(() => {
    return element.x + element.width < 0 || 
           element.y + element.height < 0 || 
           element.x > CANVAS_DIMENSIONS.WIDTH || 
           element.y > CANVAS_DIMENSIONS.HEIGHT
  }, [element.x, element.y, element.width, element.height])
  
  const commonProps = useMemo(() => ({
    id: `element-${element.id}`,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation || 0,
    draggable: draggable && !element.locked && !isEditing,
    globalCompositeOperation: element.style?.blendMode || 'normal',
    onMouseDown: (e: any) => {
      // Don't trigger selection when editing images
      if (!isEditing) {
        onSelect(e, element.id)
      }
    },
    onDragStart: onDragStart ? (e: any) => onDragStart(e, element.id) : undefined,
    onDragMove: onDrag,
    onDragEnd: (e: any) => onDragEnd(e, element.id),
    onDblClick: onDoubleClick ? (e: any) => onDoubleClick(e, element) : undefined,
    onDblTap: onDoubleClick ? (e: any) => onDoubleClick(e, element) : undefined,
    onMouseEnter: () => {
      onMouseEnter?.(element.id)
      const container = document.querySelector('.konvajs-content')
      if (container instanceof HTMLElement) {
        container.style.cursor = element.locked ? 'not-allowed' : (draggable && !isEditing ? (element.type === 'text' ? 'text' : 'move') : 'default')
      }
    },
    onMouseLeave: () => {
      onMouseLeave?.(element.id)
      const container = document.querySelector('.konvajs-content')
      if (container instanceof HTMLElement) {
        container.style.cursor = 'default'
      }
    },
  }), [element.id, element.x, element.y, element.width, element.height, element.rotation, element.locked, element.type, element.style?.blendMode, isEditing, draggable, onSelect, onDragStart, onDrag, onDragEnd, onDoubleClick, onMouseEnter, onMouseLeave])
  
  const renderShape = (props: any, additionalProps: any = {}) => {
    const baseOpacity = element.opacity ?? 1
    
    switch (element.type) {
      case 'text':
        const textContent = element.content as TextContent
        return (
          <>
            {/* Hover border for text - only show when not selected */}
            {isHovered && !isSelected && !isEditing && (
              <Rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                stroke="#0c8ce9"
                strokeWidth={1}
                fill="transparent"
                listening={false}
              />
            )}
            {/* Selection border for locked text elements */}
            {isSelected && !isEditing && element.locked && (
              <Rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                stroke={CANVAS_COLORS.LOCKED_SELECTION}
                strokeWidth={1}
                fill="transparent"
                listening={false}
              />
            )}
            <Text
              {...props}
              {...additionalProps}
              text={(() => {
                const originalText = textContent.text || ' '
                // Add bullets if enabled
                if (element.style?.listStyle === 'bullet') {
                  // Split by newlines and add bullets
                  const lines = originalText.split('\n')
                  return lines.map(line => line.trim() ? `• ${line}` : line).join('\n')
                }
                return originalText
              })()}
              fontSize={element.style?.fontSize || 16}
              fontFamily={element.style?.fontFamily || 'Arial'}
              fontStyle={`${element.style?.fontWeight || 'normal'} ${element.style?.fontStyle || 'normal'}`}
              fill={element.style?.gradientStart && element.style?.gradientEnd ? undefined : (element.style?.color || '#000000')}
              fillLinearGradientStartPoint={element.style?.gradientStart && element.style?.gradientEnd ? 
                getGradientPoints(element.style.gradientAngle || 0, element.width, element.height).start : undefined}
              fillLinearGradientEndPoint={element.style?.gradientStart && element.style?.gradientEnd ? 
                getGradientPoints(element.style.gradientAngle || 0, element.width, element.height).end : undefined}
              fillLinearGradientColorStops={element.style?.gradientStart && element.style?.gradientEnd ? 
                [(element.style.gradientStartPosition || 0) / 100, element.style.gradientStart, 
                 (element.style.gradientEndPosition || 100) / 100, element.style.gradientEnd] : undefined}
              align={element.style?.textAlign || 'left'}
              verticalAlign="top" // Changed from "middle" to "top" to match editor
              padding={0} // No padding for tight fit
              perfectDrawEnabled={false}
              wrap="word"
              ellipsis={false}
              lineHeight={element.style?.lineHeight || 1.2}
              letterSpacing={element.style?.letterSpacing || 0}
              textDecoration={element.style?.textDecoration || 'none'}
              width={element.width}
              height={element.height}
              hitStrokeWidth={0}
              visible={!isEditing}
              opacity={baseOpacity * (additionalProps.opacity || 1)}
            />
          </>
        )
        
      case 'shape':
        const shapeContent = element.content as ShapeContent
        const shapeProps = {
          ...props,
          ...additionalProps,
          fill: element.style?.gradientStart && element.style?.gradientEnd ? undefined : (element.style?.backgroundColor || '#cccccc'),
          fillLinearGradientStartPoint: element.style?.gradientStart && element.style?.gradientEnd ? 
            getGradientPoints(element.style.gradientAngle || 0, element.width, element.height).start : undefined,
          fillLinearGradientEndPoint: element.style?.gradientStart && element.style?.gradientEnd ? 
            getGradientPoints(element.style.gradientAngle || 0, element.width, element.height).end : undefined,
          fillLinearGradientColorStops: element.style?.gradientStart && element.style?.gradientEnd ? 
            [(element.style.gradientStartPosition || 0) / 100, element.style.gradientStart, 
             (element.style.gradientEndPosition || 100) / 100, element.style.gradientEnd] : undefined,
          cornerRadius: element.style?.borderRadius || 0,
          perfectDrawEnabled: false,
          opacity: baseOpacity * (additionalProps.opacity || 1),
        }
        
        if (shapeContent.shape === 'circle') {
          return (
            <Rect
              {...shapeProps}
              cornerRadius={Math.min(element.width, element.height) / 2}
            />
          )
        } else if (shapeContent.shape === 'svg' && shapeContent.svgPath) {
          // Render SVG shape
          return (
            <>
              {/* Hover border for SVG shapes */}
              {isHovered && !isSelected && (
                <Rect
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  stroke="#9ca3af"
                  strokeWidth={1}
                  fill="transparent"
                  listening={false}
                />
              )}
              {/* Selection border for locked SVG shapes */}
              {isSelected && element.locked && (
                <Rect
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  stroke={CANVAS_COLORS.LOCKED_SELECTION}
                  strokeWidth={1}
                  fill="transparent"
                  listening={false}
                />
              )}
              <Group
                {...props}
                {...additionalProps}
                opacity={baseOpacity * (additionalProps.opacity || 1)}
              >
                <Path
                  data={shapeContent.svgPath}
                  x={shapeContent.viewBox ? -parseViewBox(shapeContent.viewBox).x * (element.width / parseViewBox(shapeContent.viewBox).width) : 0}
                  y={shapeContent.viewBox ? -parseViewBox(shapeContent.viewBox).y * (element.height / parseViewBox(shapeContent.viewBox).height) : 0}
                  scaleX={element.width / (shapeContent.viewBox ? parseViewBox(shapeContent.viewBox).width : 100)}
                  scaleY={element.height / (shapeContent.viewBox ? parseViewBox(shapeContent.viewBox).height : 100)}
                  fill={element.style?.gradientStart && element.style?.gradientEnd ? undefined : (element.style?.backgroundColor || '#cccccc')}
                  fillLinearGradientStartPoint={element.style?.gradientStart && element.style?.gradientEnd ? 
                    getGradientPoints(element.style.gradientAngle || 0, element.width, element.height).start : undefined}
                  fillLinearGradientEndPoint={element.style?.gradientStart && element.style?.gradientEnd ? 
                    getGradientPoints(element.style.gradientAngle || 0, element.width, element.height).end : undefined}
                  fillLinearGradientColorStops={element.style?.gradientStart && element.style?.gradientEnd ? 
                    [(element.style.gradientStartPosition || 0) / 100, element.style.gradientStart, 
                     (element.style.gradientEndPosition || 100) / 100, element.style.gradientEnd] : undefined}
                  perfectDrawEnabled={false}
                />
              </Group>
            </>
          )
        }
        
        return <Rect {...shapeProps} />
        
      case 'line':
        const lineContent = element.content as LineContent
        return (
          <>
            {/* Hover border for lines */}
            {isHovered && !isSelected && (
              <Rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                stroke="#9ca3af"
                strokeWidth={1}
                fill="transparent"
                listening={false}
              />
            )}
            {/* Selection border for locked lines */}
            {isSelected && element.locked && (
              <Rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                stroke={CANVAS_COLORS.LOCKED_SELECTION}
                strokeWidth={1}
                fill="transparent"
                listening={false}
              />
            )}
            <Line
              {...props}
              {...additionalProps}
              points={lineContent.points}
              stroke={element.style?.borderColor || '#000000'}
              strokeWidth={element.style?.borderWidth || 2}
              lineCap={lineContent.lineCap || 'round'}
              perfectDrawEnabled={false}
              opacity={baseOpacity * (additionalProps.opacity || 1)}
              // Increase hit area for easier selection
              hitStrokeWidth={Math.max(10, element.style?.borderWidth || 2)}
            />
          </>
        )
        
      case 'blurb':
        const blurbContent = element.content as BlurbContent
        const tailSize = 20 // Size of the speech bubble tail
        const tailPosition = blurbContent.tailPosition || 'bottom-left'
        const padding = 20 // Internal padding for text
        
        // Calculate text dimensions for ellipsis
        const textMaxWidth = element.width - (padding * 2) - (tailPosition === 'left-center' || tailPosition === 'right-center' ? tailSize : 0)
        const textMaxHeight = element.height - (padding * 2) - (tailPosition.startsWith('bottom') || tailPosition.startsWith('top') ? tailSize : 0)
        
        // Measure text to see if it needs ellipsis
        const testText = new Konva.Text({
          text: blurbContent.text || '',
          fontSize: element.style?.fontSize || 16,
          fontFamily: element.style?.fontFamily || 'Arial',
          fontStyle: `${element.style?.fontWeight || 'normal'} ${element.style?.fontStyle || 'normal'}`,
          width: textMaxWidth,
          wrap: 'word',
          ellipsis: true,
          lineHeight: element.style?.lineHeight || 1.2,
        })
        
        const textHeight = testText.height()
        const needsEllipsis = textHeight > textMaxHeight
        
        return (
          <>
            {/* Hover border for blurb */}
            {isHovered && !isSelected && !isEditing && (
              <Rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                stroke="#0c8ce9"
                strokeWidth={1}
                fill="transparent"
                listening={false}
              />
            )}
            {/* Selection border for locked blurb elements */}
            {isSelected && !isEditing && element.locked && (
              <Rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                stroke={CANVAS_COLORS.LOCKED_SELECTION}
                strokeWidth={1}
                fill="transparent"
                listening={false}
              />
            )}
            {/* Speech bubble shape */}
            <Group
              {...props}
              {...additionalProps}
              opacity={baseOpacity * (additionalProps.opacity || 1)}
            >
              {/* Main bubble body */}
              <Rect
                x={tailPosition === 'left-center' ? tailSize : 0}
                y={tailPosition.startsWith('bottom') ? 0 : (tailPosition.startsWith('top') ? tailSize : 0)}
                width={element.width - (tailPosition === 'left-center' || tailPosition === 'right-center' ? tailSize : 0)}
                height={element.height - (tailPosition.startsWith('bottom') || tailPosition.startsWith('top') ? tailSize : 0)}
                fill={element.style?.backgroundColor || '#3b82f6'}
                cornerRadius={element.style?.borderRadius || 25}
                perfectDrawEnabled={false}
              />
              
              {/* Speech bubble tail */}
              <Shape
                sceneFunc={(context, shape) => {
                  context.beginPath()
                  
                  if (tailPosition.startsWith('bottom')) {
                    // Bottom tail
                    const tailX = tailPosition === 'bottom-left' ? element.width * 0.2 : 
                                 tailPosition === 'bottom-right' ? element.width * 0.8 :
                                 element.width * 0.5
                    
                    const bubbleBottom = element.height - tailSize
                    const cornerRadius = element.style?.borderRadius || 25
                    
                    // Start from left side of tail base
                    context.moveTo(tailX - 15, bubbleBottom - 5)
                    // Draw to tail point
                    context.lineTo(tailX, element.height)
                    // Draw to right side of tail base
                    context.lineTo(tailX + 15, bubbleBottom - 5)
                    // Complete the path
                    context.closePath()
                  } else if (tailPosition.startsWith('top')) {
                    // Top tail
                    const tailX = tailPosition === 'top-left' ? element.width * 0.2 : 
                                 tailPosition === 'top-right' ? element.width * 0.8 :
                                 element.width * 0.5
                    
                    context.moveTo(tailX - 15, tailSize + 5)
                    context.lineTo(tailX, 0)
                    context.lineTo(tailX + 15, tailSize + 5)
                    context.closePath()
                  } else if (tailPosition === 'left-center') {
                    // Left tail
                    const tailY = element.height * 0.5
                    
                    context.moveTo(tailSize + 5, tailY - 15)
                    context.lineTo(0, tailY)
                    context.lineTo(tailSize + 5, tailY + 15)
                    context.closePath()
                  } else if (tailPosition === 'right-center') {
                    // Right tail
                    const tailY = element.height * 0.5
                    const bubbleRight = element.width - tailSize
                    
                    context.moveTo(bubbleRight - 5, tailY - 15)
                    context.lineTo(element.width, tailY)
                    context.lineTo(bubbleRight - 5, tailY + 15)
                    context.closePath()
                  }
                  
                  context.fillStrokeShape(shape)
                }}
                fill={element.style?.backgroundColor || '#3b82f6'}
                perfectDrawEnabled={false}
              />
              
              {/* Text inside bubble */}
              <Text
                x={padding + (tailPosition === 'left-center' ? tailSize : 0)}
                y={tailPosition.startsWith('bottom') ? padding : (tailPosition.startsWith('top') ? tailSize + padding : padding)}
                text={(() => {
                  const originalText = blurbContent.text || ''
                  // Add bullets if enabled
                  if (element.style?.listStyle === 'bullet') {
                    // Split by newlines and add bullets
                    const lines = originalText.split('\n')
                    return lines.map(line => line.trim() ? `• ${line}` : line).join('\n')
                  }
                  return originalText
                })()}
                fontSize={element.style?.fontSize || 16}
                fontFamily={element.style?.fontFamily || 'Arial'}
                fontStyle={`${element.style?.fontWeight || 'normal'} ${element.style?.fontStyle || 'normal'}`}
                fill={element.style?.color || '#ffffff'}
                width={textMaxWidth}
                height={needsEllipsis ? textMaxHeight : undefined}
                align={element.style?.textAlign || 'left'}
                verticalAlign="top"
                wrap="word"
                ellipsis={needsEllipsis}
                lineHeight={element.style?.lineHeight || 1.2}
                letterSpacing={element.style?.letterSpacing || 0}
                textDecoration={element.style?.textDecoration || 'none'}
                perfectDrawEnabled={false}
                visible={!isEditing}
              />
            </Group>
          </>
        )
        
      case 'image':
        const imageContent = element.content as ImageContent
        
        // Show placeholder UI for placeholder images or while loading
        if (!imageObj || imageContent.isPlaceholder) {
          const isLoading = !imageContent.isPlaceholder && !imageObj
          return (
            <>
              {/* Drag target highlight for placeholder images */}
              {isDragTarget && (
                <Rect
                  x={element.x - 4}
                  y={element.y - 4}
                  width={element.width + 8}
                  height={element.height + 8}
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="#10b981"
                  opacity={0.2}
                  cornerRadius={(element.style?.borderRadius || 0) + 4}
                  listening={false}
                />
              )}
              {/* Hover border for placeholder images */}
              {isHovered && !isSelected && !isDragTarget && (
                <Rect
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  stroke="#9ca3af"
                  strokeWidth={1}
                  fill="transparent"
                  listening={false}
                />
              )}
              {/* Selection border for locked placeholder images */}
              {isSelected && element.locked && (
                <Rect
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  stroke={CANVAS_COLORS.LOCKED_SELECTION}
                  strokeWidth={1}
                  fill="transparent"
                  listening={false}
                />
              )}
              {/* Placeholder background */}
              <Rect
                {...props}
                {...additionalProps}
                fill="#f3f4f6"
                stroke="#d1d5db"
                strokeWidth={2}
                dash={[5, 5]}
                perfectDrawEnabled={false}
                opacity={baseOpacity * (additionalProps.opacity || 1)}
                cornerRadius={element.style?.borderRadius || 0}
              />
              {/* Calculate icon and text positions based on element size */}
              {(() => {
                const hasSecondaryText = element.width > 120 && element.height > 100 && !isLoading
                const iconSize = Math.min(element.width, element.height) * 0.35 // Icon takes 35% of smallest dimension
                const spacing = 8 // Space between icon and text
                
                // Calculate vertical positions to center the content
                let iconY: number
                let textY: number
                let secondaryTextY: number
                
                if (hasSecondaryText) {
                  // With secondary text: icon + primary text + secondary text
                  const totalHeight = iconSize + spacing + 16 + 6 + 12 // icon + spacing + text1 + spacing + text2
                  const startY = element.y + (element.height - totalHeight) / 2
                  iconY = startY + iconSize / 2
                  textY = startY + iconSize + spacing + 8 // Half of text height (16/2)
                  secondaryTextY = textY + 16 / 2 + 6 + 12 / 2 // Primary text half height + spacing + secondary half height
                } else if (element.width > 80 && element.height > 60) {
                  // Just primary text
                  const totalHeight = iconSize + spacing + 16 // icon + spacing + text
                  const startY = element.y + (element.height - totalHeight) / 2
                  iconY = startY + iconSize / 2
                  textY = startY + iconSize + spacing + 8
                } else if (element.width > 60 && element.height > 60) {
                  // Just icon
                  iconY = element.y + element.height / 2
                  textY = 0 // Not used
                } else {
                  // Nothing - too small
                  return null
                }
                
                return (
                  <>
                    {/* Icon - only show if element is large enough */}
                    {element.width > 60 && element.height > 60 && (
                      <Shape
                        x={element.x + element.width / 2}
                        y={iconY}
                        sceneFunc={(context, shape) => {
                          context.beginPath()
                          const scale = iconSize / 100 // Base icon size is 100
                          context.save()
                          context.scale(scale, scale)
                          
                          // Image frame
                          const frameWidth = 70
                          const frameHeight = 50
                          const cornerRadius = 5
                          
                          // Draw rounded rectangle frame
                          context.moveTo(-frameWidth/2 + cornerRadius, -frameHeight/2)
                          context.lineTo(frameWidth/2 - cornerRadius, -frameHeight/2)
                          context.quadraticCurveTo(frameWidth/2, -frameHeight/2, frameWidth/2, -frameHeight/2 + cornerRadius)
                          context.lineTo(frameWidth/2, frameHeight/2 - cornerRadius)
                          context.quadraticCurveTo(frameWidth/2, frameHeight/2, frameWidth/2 - cornerRadius, frameHeight/2)
                          context.lineTo(-frameWidth/2 + cornerRadius, frameHeight/2)
                          context.quadraticCurveTo(-frameWidth/2, frameHeight/2, -frameWidth/2, frameHeight/2 - cornerRadius)
                          context.lineTo(-frameWidth/2, -frameHeight/2 + cornerRadius)
                          context.quadraticCurveTo(-frameWidth/2, -frameHeight/2, -frameWidth/2 + cornerRadius, -frameHeight/2)
                          context.closePath()
                          context.strokeStyle = '#9ca3af'
                          context.lineWidth = 3
                          context.stroke()
                          
                          // Mountain/landscape inside
                          context.beginPath()
                          context.moveTo(-frameWidth/2 + 5, frameHeight/2 - 15)
                          context.lineTo(-frameWidth/2 + 20, -5)
                          context.lineTo(-5, frameHeight/2 - 25)
                          context.lineTo(15, -10)
                          context.lineTo(frameWidth/2 - 5, frameHeight/2 - 20)
                          context.lineTo(frameWidth/2 - 5, frameHeight/2 - 5)
                          context.lineTo(-frameWidth/2 + 5, frameHeight/2 - 5)
                          context.closePath()
                          context.fillStyle = '#e5e7eb'
                          context.fill()
                          
                          // Sun
                          context.beginPath()
                          context.arc(-frameWidth/2 + 22, -frameHeight/2 + 18, 7, 0, Math.PI * 2)
                          context.fillStyle = '#d1d5db'
                          context.fill()
                          
                          context.restore()
                        }}
                        listening={false}
                      />
                    )}
                    {/* Text - only show if element is large enough */}
                    {element.width > 80 && element.height > 60 && (
                      <>
                        <Text
                          x={element.x + element.width / 2}
                          y={textY}
                          text={isLoading ? "Loading..." : "Drop image here"}
                          fontSize={Math.min(14, Math.max(10, element.width / 10))}
                          fontFamily="system-ui, -apple-system, sans-serif"
                          fill="#6b7280"
                          align="center"
                          verticalAlign="middle"
                          width={element.width - 20}
                          listening={false}
                        />
                        {/* Secondary text - only show if very large */}
                        {hasSecondaryText && (
                          <Text
                            x={element.x + element.width / 2}
                            y={secondaryTextY!}
                            text="or resize placeholder"
                            fontSize={Math.min(12, Math.max(9, element.width / 12))}
                            fontFamily="system-ui, -apple-system, sans-serif"
                            fill="#9ca3af"
                            align="center"
                            verticalAlign="middle"
                            width={element.width - 20}
                            listening={false}
                          />
                        )}
                      </>
                    )}
                  </>
                )
              })()}
            </>
          )
        }
        
        return (
          <>
            {/* Drag target highlight for images */}
            {isDragTarget && (
              <Rect
                x={element.x - 4}
                y={element.y - 4}
                width={element.width + 8}
                height={element.height + 8}
                stroke="#10b981"
                strokeWidth={3}
                fill="#10b981"
                opacity={0.2}
                cornerRadius={(element.style?.borderRadius || 0) + 4}
                listening={false}
              />
            )}
            {/* Hover border for images */}
            {isHovered && !isSelected && !isDragTarget && (
              <Rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                stroke="#9ca3af"
                strokeWidth={1}
                fill="transparent"
                listening={false}
              />
            )}
            {/* Selection border for locked images */}
            {isSelected && element.locked && (
            <Rect
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            stroke={CANVAS_COLORS.LOCKED_SELECTION}
            strokeWidth={1}
            fill="transparent"
            listening={false}
            />
            )}
              {/* Image edit mode border */}
              {isEditing && (
                <>
                  <Rect
                    x={element.x - 2}
                    y={element.y - 2}
                    width={element.width + 4}
                    height={element.height + 4}
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="transparent"
                    cornerRadius={(element.style?.borderRadius || 0) + 2}
                    listening={false}
                  />
                  {/* Inner border for better visibility */}
                  <Rect
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    stroke="rgba(255, 255, 255, 0.5)"
                    strokeWidth={1}
                    fill="transparent"
                    cornerRadius={element.style?.borderRadius || 0}
                    listening={false}
                  />
                </>
              )}
            {/* Render image with object-fit handling */}
            {imageContent.objectFit === 'cover' && !isEditing ? (
              // Normal cover mode rendering (cropped)
              <Group
                {...props}
                {...additionalProps}
                clipFunc={(ctx) => {
                  // Clip to element bounds with corner radius
                  const cornerRadius = element.style?.borderRadius || 0
                  if (cornerRadius > 0) {
                    ctx.beginPath()
                    ctx.moveTo(cornerRadius, 0)
                    ctx.lineTo(element.width - cornerRadius, 0)
                    ctx.quadraticCurveTo(element.width, 0, element.width, cornerRadius)
                    ctx.lineTo(element.width, element.height - cornerRadius)
                    ctx.quadraticCurveTo(element.width, element.height, element.width - cornerRadius, element.height)
                    ctx.lineTo(cornerRadius, element.height)
                    ctx.quadraticCurveTo(0, element.height, 0, element.height - cornerRadius)
                    ctx.lineTo(0, cornerRadius)
                    ctx.quadraticCurveTo(0, 0, cornerRadius, 0)
                    ctx.closePath()
                  } else {
                    ctx.rect(0, 0, element.width, element.height)
                  }
                }}
              >
                <Image
                  image={imageObj}
                  x={0}
                  y={0}
                  width={element.width}
                  height={element.height}
                  opacity={baseOpacity * (additionalProps.opacity || 1)}
                  crop={(() => {
                    // Calculate crop based on image's natural dimensions and offsets
                    const imgWidth = imageObj.width
                    const imgHeight = imageObj.height
                    const frameAspect = element.width / element.height
                    const imgAspect = imgWidth / imgHeight
                    
                    let cropWidth: number
                    let cropHeight: number
                    
                    // Determine which dimension to fit
                    if (imgAspect > frameAspect) {
                      // Image is wider - fit height
                      cropHeight = imgHeight
                      cropWidth = imgHeight * frameAspect
                    } else {
                      // Image is taller - fit width
                      cropWidth = imgWidth
                      cropHeight = imgWidth / frameAspect
                    }
                    
                    // Apply scale
                    const scale = imageContent.scale || 1
                    cropWidth = cropWidth / scale
                    cropHeight = cropHeight / scale
                    
                    // Calculate crop position based on offset
                    const offsetX = imageContent.offsetX ?? 0.5
                    const offsetY = imageContent.offsetY ?? 0.5
                    
                    const cropX = (imgWidth - cropWidth) * offsetX
                    const cropY = (imgHeight - cropHeight) * offsetY
                    
                    return {
                      x: Math.max(0, Math.min(imgWidth - cropWidth, cropX)),
                      y: Math.max(0, Math.min(imgHeight - cropHeight, cropY)),
                      width: Math.min(imgWidth, cropWidth),
                      height: Math.min(imgHeight, cropHeight)
                    }
                  })()}
                />
              </Group>
            ) : imageContent.objectFit === 'cover' && isEditing ? (
              // Edit mode rendering (show full image)
              <Group
                {...props}
                {...additionalProps}
              >
                {(() => {
                  // Calculate how to show the full image
                  const imgWidth = imageDimensions.width
                  const imgHeight = imageDimensions.height
                  const frameAspect = element.width / element.height
                  const imgAspect = imgWidth / imgHeight
                  
                  let displayWidth: number
                  let displayHeight: number
                  
                  // Determine which dimension to fit for cover mode
                  if (imgAspect > frameAspect) {
                    // Image is wider - fit height
                    displayHeight = element.height
                    displayWidth = element.height * imgAspect
                  } else {
                    // Image is taller - fit width
                    displayWidth = element.width
                    displayHeight = element.width / imgAspect
                  }
                  
                  // Apply scale
                  const scale = imageContent.scale || 1
                  displayWidth = displayWidth * scale
                  displayHeight = displayHeight * scale
                  
                  // Calculate position based on offset
                  const offsetX = imageContent.offsetX ?? 0.5
                  const offsetY = imageContent.offsetY ?? 0.5
                  
                  const imageX = element.x - (displayWidth - element.width) * offsetX
                  const imageY = element.y - (displayHeight - element.height) * offsetY
                  
                  return (
                    <>
                      {/* Full image at low opacity */}
                      <Image
                        image={imageObj}
                        x={imageX}
                        y={imageY}
                        width={displayWidth}
                        height={displayHeight}
                        opacity={0.3}
                        listening={false}
                      />
                      {/* Frame area at full opacity with clipping */}
                      <Group
                        x={element.x}
                        y={element.y}
                        clipFunc={(ctx) => {
                          const cornerRadius = element.style?.borderRadius || 0
                          if (cornerRadius > 0) {
                            ctx.beginPath()
                            ctx.moveTo(cornerRadius, 0)
                            ctx.lineTo(element.width - cornerRadius, 0)
                            ctx.quadraticCurveTo(element.width, 0, element.width, cornerRadius)
                            ctx.lineTo(element.width, element.height - cornerRadius)
                            ctx.quadraticCurveTo(element.width, element.height, element.width - cornerRadius, element.height)
                            ctx.lineTo(cornerRadius, element.height)
                            ctx.quadraticCurveTo(0, element.height, 0, element.height - cornerRadius)
                            ctx.lineTo(0, cornerRadius)
                            ctx.quadraticCurveTo(0, 0, cornerRadius, 0)
                            ctx.closePath()
                          } else {
                            ctx.rect(0, 0, element.width, element.height)
                          }
                        }}
                      >
                        <Image
                          image={imageObj}
                          x={imageX - element.x}
                          y={imageY - element.y}
                          width={displayWidth}
                          height={displayHeight}
                          opacity={1}
                          listening={false}
                        />
                      </Group>
                    </>
                  )
                })()}
              </Group>
            ) : (
              // Default rendering for other object-fit modes
              <Image
                {...props}
                {...additionalProps}
                image={imageObj}
                opacity={baseOpacity * (additionalProps.opacity || 1)}
                cornerRadius={element.style?.borderRadius || 0}
              />
            )}
          </>
        )
        
      default:
        return null
    }
  }
  
  // If element is completely outside, render with low opacity or hide
  if (isCompletelyOutside) {
    const outsideOpacity = showOutsideElements ? 0.3 : 0
    return (
      <Group>
        {renderShape(commonProps, { opacity: outsideOpacity })}
        {/* Selection border with full opacity - hide when editing */}
        {isSelected && !isEditing && (element.type !== 'text' || element.locked) && (
          <Rect
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rotation={element.rotation || 0}
            stroke={element.locked ? CANVAS_COLORS.LOCKED_SELECTION : "#3b82f6"}
            strokeWidth={element.type === 'text' && element.locked ? 1 : 2}
            fill="transparent"
            listening={false}
          />
        )}
        {/* Hover border */}
        {isHovered && !isSelected && element.type !== 'text' && (
          <Rect
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rotation={element.rotation || 0}
            stroke="#9ca3af"
            strokeWidth={1}
            fill="transparent"
            listening={false}
          />
        )}
      </Group>
    )
  }
  
  // If element is partially outside, render with clipping
  if (isOutsideSlide) {
    const outsideOpacity = showOutsideElements ? 0.3 : 0
    return (
      <Group>
        {/* Part outside the slide with reduced opacity or hidden */}
        <Group opacity={outsideOpacity}>
          {renderShape(commonProps)}
        </Group>
        
        {/* Part inside the slide with full opacity - using clipping */}
        <Group
          clipFunc={(ctx: Konva.Context) => {
            ctx.rect(0, 0, CANVAS_DIMENSIONS.WIDTH, CANVAS_DIMENSIONS.HEIGHT)
          }}
        >
          {renderShape(commonProps)}
        </Group>
        
        {/* Selection border with full opacity - hide when editing */}
        {isSelected && !isEditing && (element.type !== 'text' || element.locked) && (
          <Rect
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rotation={element.rotation || 0}
            stroke={element.locked ? CANVAS_COLORS.LOCKED_SELECTION : "#3b82f6"}
            strokeWidth={element.type === 'text' && element.locked ? 1 : 2}
            fill="transparent"
            listening={false}
          />
        )}
        
        {/* Hover border */}
        {isHovered && !isSelected && element.type !== 'text' && (
          <Rect
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rotation={element.rotation || 0}
            stroke="#9ca3af"
            strokeWidth={1}
            fill="transparent"
            listening={false}
          />
        )}
      </Group>
    )
  }
  
  // Element is fully inside the slide
  return (
    <Group>
      {renderShape(commonProps)}
      
      {/* Selection border - hide when editing - for non-text elements or locked text */}
      {isSelected && !isEditing && (element.type !== 'text' || element.locked) && element.type !== 'image' && (
        <Rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation || 0}
          stroke={element.locked ? CANVAS_COLORS.LOCKED_SELECTION : "#3b82f6"}
          strokeWidth={element.type === 'text' && element.locked ? 1 : 2}
          fill="transparent"
          listening={false}
        />
      )}
      
      {/* Hover border - for non-text elements */}
      {isHovered && !isSelected && element.type !== 'text' && (
        <Rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation || 0}
          stroke="#9ca3af"
          strokeWidth={1}
          fill="transparent"
          listening={false}
        />
      )}
      
      {/* Template data key indicator */}
      {showTemplateIndicators && dataKey && (
        <Group x={element.x} y={element.y - 20}>
          <Rect
            width={Math.max(60, dataKey.length * 7 + 16)}
            height={18}
            fill="#7c3aed"
            cornerRadius={9}
            shadowColor="black"
            shadowBlur={3}
            shadowOffset={{ x: 1, y: 1 }}
            shadowOpacity={0.2}
          />
          <Text
            x={8}
            y={3}
            text={dataKey}
            fontSize={11}
            fontFamily="monospace"
            fill="white"
            listening={false}
          />
        </Group>
      )}
    </Group>
  )
})

ElementRenderer.displayName = 'ElementRenderer'

export default ElementRenderer