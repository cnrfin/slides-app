// src/components/previews/SlidePreview.tsx
import React, { useMemo, useState, useEffect } from 'react'
import { Stage, Layer, Rect, Text, Image, Shape, Path, Line, Group } from 'react-konva'
import Konva from 'konva'
import { CANVAS_DIMENSIONS } from '@/utils/canvas.constants'
import type { Slide, SlideElement, TextContent, ShapeContent, ImageContent, BlurbContent, LineContent } from '@/types/slide.types'

// Preview scale factor (1/4 of original size for performance)
const PREVIEW_SCALE = 0.25
const PREVIEW_WIDTH = CANVAS_DIMENSIONS.WIDTH * PREVIEW_SCALE
const PREVIEW_HEIGHT = CANVAS_DIMENSIONS.HEIGHT * PREVIEW_SCALE

interface SlidePreviewProps {
  slide: Slide
  className?: string
}

// Helper to parse viewBox for SVG shapes
const parseViewBox = (viewBox: string) => {
  const [x, y, width, height] = viewBox.split(' ').map(Number)
  return { x, y, width, height }
}

// Simplified element renderer for preview
const PreviewElement = React.memo(({ element, scale }: { element: SlideElement; scale: number }) => {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null)
  
  // Load images
  useEffect(() => {
    if (element.type === 'image') {
      const imageContent = element.content as ImageContent
      if (!imageContent.isPlaceholder && imageContent.src) {
        const img = new window.Image()
        img.onload = () => setImageObj(img)
        img.onerror = () => console.warn('Failed to load preview image')
        img.src = imageContent.src
      }
    }
  }, [element])
  
  // Scale all dimensions
  const scaledProps = useMemo(() => ({
    x: element.x * scale,
    y: element.y * scale,
    width: element.width * scale,
    height: element.height * scale,
    rotation: element.rotation || 0,
    opacity: element.opacity ?? 1,
  }), [element, scale])
  
  switch (element.type) {
    case 'text': {
      const textContent = element.content as TextContent
      let displayText = textContent.text || ''
      
      // Add bullets if enabled
      if (element.style?.listStyle === 'bullet') {
        const lines = displayText.split('\n')
        displayText = lines.map(line => line.trim() ? `• ${line}` : line).join('\n')
      }
      
      return (
        <Text
          {...scaledProps}
          text={displayText}
          fontSize={(element.style?.fontSize || 16) * scale}
          fontFamily={element.style?.fontFamily || 'Arial'}
          fontStyle={`${element.style?.fontWeight || 'normal'} ${element.style?.fontStyle || 'normal'}`}
          fill={element.style?.color || '#000000'}
          align={element.style?.textAlign || 'left'}
          verticalAlign="top"
          wrap="word"
          lineHeight={element.style?.lineHeight || 1.2}
          letterSpacing={(element.style?.letterSpacing || 0) * scale}
          perfectDrawEnabled={false}
          listening={false}
        />
      )
    }
    
    case 'shape': {
      const shapeContent = element.content as ShapeContent
      const shapeProps = {
        ...scaledProps,
        fill: element.style?.backgroundColor || '#cccccc',
        cornerRadius: (element.style?.borderRadius || 0) * scale,
        perfectDrawEnabled: false,
        listening: false,
      }
      
      if (shapeContent.shape === 'circle') {
        return (
          <Rect
            {...shapeProps}
            cornerRadius={Math.min(scaledProps.width, scaledProps.height) / 2}
          />
        )
      } else if (shapeContent.shape === 'svg' && shapeContent.svgPath) {
        return (
          <Path
            {...scaledProps}
            data={shapeContent.svgPath}
            scaleX={scaledProps.width / (shapeContent.viewBox ? parseViewBox(shapeContent.viewBox).width : 100)}
            scaleY={scaledProps.height / (shapeContent.viewBox ? parseViewBox(shapeContent.viewBox).height : 100)}
            fill={element.style?.backgroundColor || '#cccccc'}
            perfectDrawEnabled={false}
            listening={false}
          />
        )
      }
      
      return <Rect {...shapeProps} />
    }
    
    case 'line': {
      const lineContent = element.content as LineContent
      return (
        <Line
          {...scaledProps}
          points={lineContent.points.map(p => p * scale)}
          stroke={element.style?.borderColor || '#000000'}
          strokeWidth={(element.style?.borderWidth || 2) * scale}
          lineCap={lineContent.lineCap || 'round'}
          perfectDrawEnabled={false}
          listening={false}
        />
      )
    }
    
    case 'blurb': {
      const blurbContent = element.content as BlurbContent
      const tailSize = 20 * scale
      const padding = 20 * scale
      const tailPosition = blurbContent.tailPosition || 'bottom-left'
      
      let displayText = blurbContent.text || ''
      if (element.style?.listStyle === 'bullet') {
        const lines = displayText.split('\n')
        displayText = lines.map(line => line.trim() ? `• ${line}` : line).join('\n')
      }
      
      return (
        <Group {...scaledProps}>
          {/* Main bubble body */}
          <Rect
            x={tailPosition === 'left-center' ? tailSize : 0}
            y={tailPosition.startsWith('bottom') ? 0 : (tailPosition.startsWith('top') ? tailSize : 0)}
            width={scaledProps.width - (tailPosition === 'left-center' || tailPosition === 'right-center' ? tailSize : 0)}
            height={scaledProps.height - (tailPosition.startsWith('bottom') || tailPosition.startsWith('top') ? tailSize : 0)}
            fill={element.style?.backgroundColor || '#3b82f6'}
            cornerRadius={(element.style?.borderRadius || 25) * scale}
            perfectDrawEnabled={false}
            listening={false}
          />
          
          {/* Speech bubble tail - simplified for preview */}
          <Shape
            sceneFunc={(context, shape) => {
              context.beginPath()
              
              if (tailPosition.startsWith('bottom')) {
                const tailX = scaledProps.width * (tailPosition === 'bottom-left' ? 0.2 : 
                           tailPosition === 'bottom-right' ? 0.8 : 0.5)
                const bubbleBottom = scaledProps.height - tailSize
                
                context.moveTo(tailX - 15 * scale, bubbleBottom - 5 * scale)
                context.lineTo(tailX, scaledProps.height)
                context.lineTo(tailX + 15 * scale, bubbleBottom - 5 * scale)
                context.closePath()
              }
              
              context.fillStrokeShape(shape)
            }}
            fill={element.style?.backgroundColor || '#3b82f6'}
            perfectDrawEnabled={false}
            listening={false}
          />
          
          {/* Text inside bubble */}
          <Text
            x={padding + (tailPosition === 'left-center' ? tailSize : 0)}
            y={tailPosition.startsWith('bottom') ? padding : (tailPosition.startsWith('top') ? tailSize + padding : padding)}
            text={displayText}
            fontSize={(element.style?.fontSize || 16) * scale}
            fontFamily={element.style?.fontFamily || 'Arial'}
            fill={element.style?.color || '#ffffff'}
            width={scaledProps.width - (padding * 2) - (tailPosition === 'left-center' || tailPosition === 'right-center' ? tailSize : 0)}
            align={element.style?.textAlign || 'left'}
            wrap="word"
            lineHeight={element.style?.lineHeight || 1.2}
            perfectDrawEnabled={false}
            listening={false}
          />
        </Group>
      )
    }
    
    case 'image': {
      const imageContent = element.content as ImageContent
      
      // Show placeholder for placeholder images
      if (!imageObj || imageContent.isPlaceholder) {
        return (
          <Rect
            {...scaledProps}
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth={1 * scale}
            dash={[5 * scale, 5 * scale]}
            cornerRadius={(element.style?.borderRadius || 0) * scale}
            perfectDrawEnabled={false}
            listening={false}
          />
        )
      }
      
      // Render actual image - simplified without cropping for performance
      return (
        <Image
          {...scaledProps}
          image={imageObj}
          cornerRadius={(element.style?.borderRadius || 0) * scale}
          perfectDrawEnabled={false}
          listening={false}
        />
      )
    }
    
    default:
      return null
  }
})

PreviewElement.displayName = 'PreviewElement'

const SlidePreview = React.memo(({ slide, className = '' }: SlidePreviewProps) => {
  // Get background color
  const backgroundColor = typeof slide.background === 'string' 
    ? slide.background 
    : slide.background?.value || '#ffffff'
  
  return (
    <div className={`slide-preview ${className}`}>
      <Stage 
        width={PREVIEW_WIDTH} 
        height={PREVIEW_HEIGHT}
        style={{ 
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          overflow: 'hidden'
        }}
      >
        <Layer>
          {/* Slide background */}
          <Rect
            x={0}
            y={0}
            width={PREVIEW_WIDTH}
            height={PREVIEW_HEIGHT}
            fill={backgroundColor}
            listening={false}
          />
          
          {/* Render elements */}
          {slide.elements
            .filter(element => element.visible !== false)
            .map(element => (
              <PreviewElement 
                key={element.id} 
                element={element} 
                scale={PREVIEW_SCALE}
              />
            ))}
        </Layer>
      </Stage>
    </div>
  )
})

SlidePreview.displayName = 'SlidePreview'

export default SlidePreview
