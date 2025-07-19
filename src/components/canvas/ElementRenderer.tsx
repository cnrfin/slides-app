// src/components/canvas/ElementRenderer.tsx
import React, { useMemo, useState, useEffect } from 'react'
import { Group, Rect, Text, Image } from 'react-konva'
import { CANVAS_DIMENSIONS, CANVAS_COLORS } from '@/utils/canvas.constants'
import type { SlideElement, TextContent, ShapeContent, ImageContent } from '@/types/slide.types'
import Konva from 'konva'

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
  // Image loading state
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null)
  
  // Load image when element is an image type
  useEffect(() => {
    if (element.type === 'image') {
      const imageContent = element.content as ImageContent
      const img = new window.Image()
      img.onload = () => {
        setImageObj(img)
      }
      img.onerror = () => {
        console.error('Failed to load image:', imageContent.src)
      }
      img.src = imageContent.src
    }
  }, [element])
  
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
    onMouseDown: (e: any) => onSelect(e, element.id),
    onDragStart: onDragStart ? (e: any) => onDragStart(e, element.id) : undefined,
    onDragMove: onDrag,
    onDragEnd: (e: any) => onDragEnd(e, element.id),
    onDblClick: onDoubleClick ? (e: any) => onDoubleClick(e, element) : undefined,
    onDblTap: onDoubleClick ? (e: any) => onDoubleClick(e, element) : undefined,
    onMouseEnter: () => {
      onMouseEnter?.(element.id)
      const container = document.querySelector('.konvajs-content')
      if (container instanceof HTMLElement) {
        container.style.cursor = element.locked ? 'not-allowed' : (draggable ? (element.type === 'text' ? 'text' : 'move') : 'default')
      }
    },
    onMouseLeave: () => {
      onMouseLeave?.(element.id)
      const container = document.querySelector('.konvajs-content')
      if (container instanceof HTMLElement) {
        container.style.cursor = 'default'
      }
    },
  }), [element.id, element.x, element.y, element.width, element.height, element.rotation, element.locked, element.type, isEditing, draggable, onSelect, onDragStart, onDrag, onDragEnd, onDoubleClick, onMouseEnter, onMouseLeave])
  
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
        }
        
        return <Rect {...shapeProps} />
        
      case 'image':
        const imageContent = element.content as ImageContent
        if (!imageObj) {
          // Show placeholder while loading
          return (
            <>
              <Rect
                {...props}
                {...additionalProps}
                fill="#f3f4f6"
                stroke="#d1d5db"
                strokeWidth={1}
                perfectDrawEnabled={false}
                opacity={baseOpacity * (additionalProps.opacity || 1)}
              />
              <Text
                x={element.x + element.width / 2}
                y={element.y + element.height / 2}
                text="Loading..."
                fontSize={14}
                fill="#6b7280"
                align="center"
                verticalAlign="middle"
                offsetX={30}
                offsetY={7}
                listening={false}
              />
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
            <Image
              {...props}
              {...additionalProps}
              image={imageObj}
              opacity={baseOpacity * (additionalProps.opacity || 1)}
              cornerRadius={element.style?.borderRadius || 0}
            />
          </>
        )
        
      default:
        return null
    }
  }
  
  // If element is completely outside, render with low opacity
  if (isCompletelyOutside) {
    return (
      <Group>
        {renderShape(commonProps, { opacity: 0.3 })}
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
    return (
      <Group>
        {/* Part outside the slide with reduced opacity */}
        <Group opacity={0.3}>
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