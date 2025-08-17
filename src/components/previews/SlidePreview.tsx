// src/components/previews/SlidePreview.tsx
import React, { useMemo, useState, useEffect } from 'react'
import { Stage, Layer, Rect, Text, Image, Shape, Path, Line, Group } from 'react-konva'
import Konva from 'konva'
import { CANVAS_DIMENSIONS } from '@/utils/canvas.constants'
import type { Slide, SlideElement, TextContent, ShapeContent, ImageContent, BlurbContent, LineContent, IconContent, TableContent } from '@/types/slide.types'
import { getIconPath } from '@/utils/icon.utils'

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
      
      // Calculate gradient points if gradient is used
      const getGradientPoints = (angle: number, width: number, height: number) => {
        const rad = (angle - 90) * Math.PI / 180
        const dx = Math.cos(rad)
        const dy = Math.sin(rad)
        const diag = Math.sqrt(width * width + height * height)
        const cx = width / 2
        const cy = height / 2
        
        return {
          start: { x: cx - dx * diag / 2, y: cy - dy * diag / 2 },
          end: { x: cx + dx * diag / 2, y: cy + dy * diag / 2 }
        }
      }
      
      const hasGradient = element.style?.gradientStart && element.style?.gradientEnd
      const gradientPoints = hasGradient ? 
        getGradientPoints(element.style.gradientAngle || 0, scaledProps.width, scaledProps.height) : null
      
      return (
        <Text
          {...scaledProps}
          text={displayText}
          fontSize={(element.style?.fontSize || 16) * scale}
          fontFamily={element.style?.fontFamily || 'Arial'}
          fontStyle={`${element.style?.fontWeight || 'normal'} ${element.style?.fontStyle || 'normal'}`}
          fill={hasGradient ? undefined : (element.style?.color || '#000000')}
          fillLinearGradientStartPoint={gradientPoints?.start}
          fillLinearGradientEndPoint={gradientPoints?.end}
          fillLinearGradientColorStops={hasGradient ? [
            (element.style.gradientStartPosition || 0) / 100, element.style.gradientStart,
            (element.style.gradientEndPosition || 100) / 100, element.style.gradientEnd
          ] : undefined}
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
      // Calculate gradient points if gradient is used
      const getGradientPoints = (angle: number, width: number, height: number) => {
        const rad = (angle - 90) * Math.PI / 180
        const dx = Math.cos(rad)
        const dy = Math.sin(rad)
        const diag = Math.sqrt(width * width + height * height)
        const cx = width / 2
        const cy = height / 2
        
        return {
          start: { x: cx - dx * diag / 2, y: cy - dy * diag / 2 },
          end: { x: cx + dx * diag / 2, y: cy + dy * diag / 2 }
        }
      }
      
      const hasGradient = element.style?.gradientStart && element.style?.gradientEnd
      const gradientPoints = hasGradient ? 
        getGradientPoints(element.style.gradientAngle || 0, scaledProps.width, scaledProps.height) : null
      
      // Calculate actual corner radius - convert percentage to pixels
      const smallerDimension = Math.min(scaledProps.width, scaledProps.height)
      let actualCornerRadius: number | number[]
      if (element.style?.borderRadiusCorners) {
        const corners = element.style.borderRadiusCorners.split(' ').map(Number)
        if (corners.length === 4) {
          actualCornerRadius = corners.map(percent => {
            return percent === 100 
              ? smallerDimension / 2 
              : (percent / 100) * (smallerDimension / 2)
          })
        } else {
          const radiusPercent = element.style?.borderRadius || 0
          actualCornerRadius = radiusPercent === 100 
            ? smallerDimension / 2 
            : (radiusPercent / 100) * (smallerDimension / 2)
        }
      } else {
        const radiusPercent = element.style?.borderRadius || 0
        actualCornerRadius = radiusPercent === 100 
          ? smallerDimension / 2 
          : (radiusPercent / 100) * (smallerDimension / 2)
      }
      
      const shapeProps = {
        ...scaledProps,
        fill: hasGradient ? undefined : (element.style?.backgroundColor || '#cccccc'),
        fillLinearGradientStartPoint: gradientPoints?.start,
        fillLinearGradientEndPoint: gradientPoints?.end,
        fillLinearGradientColorStops: hasGradient ? [
          (element.style.gradientStartPosition || 0) / 100, element.style.gradientStart,
          (element.style.gradientEndPosition || 100) / 100, element.style.gradientEnd
        ] : undefined,
        stroke: element.style?.borderWidth && element.style?.borderWidth > 0 ? 
          (element.style?.borderColor || '#000000') : undefined,
        strokeWidth: (element.style?.borderWidth || 0) * scale,
        cornerRadius: actualCornerRadius,
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
        // Render SVG shape properly
        return (
          <Group
            x={scaledProps.x}
            y={scaledProps.y}
            rotation={scaledProps.rotation}
            opacity={scaledProps.opacity}
          >
            <Path
              data={shapeContent.svgPath}
              x={shapeContent.viewBox ? -parseViewBox(shapeContent.viewBox).x * (scaledProps.width / parseViewBox(shapeContent.viewBox).width) : 0}
              y={shapeContent.viewBox ? -parseViewBox(shapeContent.viewBox).y * (scaledProps.height / parseViewBox(shapeContent.viewBox).height) : 0}
              scaleX={scaledProps.width / (shapeContent.viewBox ? parseViewBox(shapeContent.viewBox).width : 100)}
              scaleY={scaledProps.height / (shapeContent.viewBox ? parseViewBox(shapeContent.viewBox).height : 100)}
              fill={hasGradient ? undefined : (element.style?.backgroundColor || '#cccccc')}
              fillLinearGradientStartPoint={gradientPoints?.start}
              fillLinearGradientEndPoint={gradientPoints?.end}
              fillLinearGradientColorStops={hasGradient ? [
                (element.style.gradientStartPosition || 0) / 100, element.style.gradientStart,
                (element.style.gradientEndPosition || 100) / 100, element.style.gradientEnd
              ] : undefined}
              stroke={element.style?.borderWidth && element.style?.borderWidth > 0 ? 
                (element.style?.borderColor || '#000000') : undefined}
              strokeWidth={(element.style?.borderWidth || 0) * scale}
              perfectDrawEnabled={false}
              listening={false}
            />
          </Group>
        )
      }
      
      return <Rect {...shapeProps} />
    }
    
    case 'icon': {
      const iconContent = element.content as IconContent
      const iconData = getIconPath(iconContent.iconId)
      
      return (
        <Group
          {...scaledProps}
        >
          <Path
            data={iconData.path}
            x={scaledProps.width / 2}
            y={scaledProps.height / 2}
            offsetX={12} // Half of the original 24px viewBox
            offsetY={12} // Half of the original 24px viewBox
            scaleX={scaledProps.width / 24}
            scaleY={scaledProps.height / 24}
            fill={iconData.filled ? (element.style?.color || '#000000') : 'transparent'}
            stroke={element.style?.color || '#000000'}
            strokeWidth={iconData.filled ? 0 : ((element.style?.strokeWidth || 5) / (scaledProps.width / 24))}
            lineCap="round"
            lineJoin="round"
            perfectDrawEnabled={false}
            listening={false}
          />
        </Group>
      )
    }
    
    case 'table': {
      const tableContent = element.content as TableContent
      const cellPadding = 8 * scale
      
      return (
        <Group
          {...scaledProps}
        >
          {/* Table background */}
          <Rect
            x={0}
            y={0}
            width={scaledProps.width}
            height={scaledProps.height}
            fill={element.style?.backgroundColor || '#ffffff'}
            stroke={element.style?.borderColor || '#d1d5db'}
            strokeWidth={(element.style?.borderWidth || 1) * scale}
            perfectDrawEnabled={false}
            listening={false}
          />
          
          {/* Draw cells */}
          {tableContent.cells.map((row, rowIndex) => {
            // Calculate row y position and height
            const rowY = tableContent.rowHeights
              ? tableContent.rowHeights.slice(0, rowIndex).reduce((sum, h) => sum + h, 0) * scale
              : (scaledProps.height / tableContent.rows) * rowIndex
            const rowHeight = tableContent.rowHeights
              ? tableContent.rowHeights[rowIndex] * scale
              : scaledProps.height / tableContent.rows
              
            return row.map((cell, colIndex) => {
              // Calculate column x position and width
              const colX = tableContent.columnWidths
                ? tableContent.columnWidths.slice(0, colIndex).reduce((sum, w) => sum + w, 0) * scale
                : (scaledProps.width / tableContent.columns) * colIndex
              const colWidth = tableContent.columnWidths
                ? tableContent.columnWidths[colIndex] * scale
                : scaledProps.width / tableContent.columns
              
              const isHeaderRow = tableContent.headerRow && rowIndex === 0
              const isHeaderCol = tableContent.headerColumn && colIndex === 0
              const isHeader = isHeaderRow || isHeaderCol
              
              return (
                <Group key={`cell-${rowIndex}-${colIndex}`}>
                  {/* Cell background */}
                  <Rect
                    x={colX}
                    y={rowY}
                    width={colWidth}
                    height={rowHeight}
                    fill={cell.style?.background || (isHeader ? '#f9fafb' : '#ffffff')}
                    stroke={element.style?.borderColor || '#d1d5db'}
                    strokeWidth={(element.style?.borderWidth || 1) * scale}
                    perfectDrawEnabled={false}
                    listening={false}
                  />
                  
                  {/* Cell text */}
                  <Text
                    x={colX + cellPadding}
                    y={rowY + cellPadding}
                    width={colWidth - cellPadding * 2}
                    height={rowHeight - cellPadding * 2}
                    text={cell.text || ''}
                    fontSize={(cell.style?.fontSize || element.style?.fontSize || 14) * scale}
                    fontFamily={element.style?.fontFamily || 'Arial'}
                    fontStyle={`${cell.style?.fontWeight || (isHeader ? 'bold' : 'normal')} normal`}
                    fill={cell.style?.color || element.style?.color || '#000000'}
                    align={cell.style?.textAlign || 'center'}
                    verticalAlign={cell.style?.verticalAlign || 'middle'}
                    wrap="word"
                    ellipsis={true}
                    perfectDrawEnabled={false}
                    listening={false}
                  />
                </Group>
              )
            })
          })}
        </Group>
      )
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
      
      // Calculate gradient points if gradient is used
      const getGradientPoints = (angle: number, width: number, height: number) => {
        const rad = (angle - 90) * Math.PI / 180
        const dx = Math.cos(rad)
        const dy = Math.sin(rad)
        const diag = Math.sqrt(width * width + height * height)
        const cx = width / 2
        const cy = height / 2
        
        return {
          start: { x: cx - dx * diag / 2, y: cy - dy * diag / 2 },
          end: { x: cx + dx * diag / 2, y: cy + dy * diag / 2 }
        }
      }
      
      const hasGradient = element.style?.gradientStart && element.style?.gradientEnd
      const bubbleWidth = scaledProps.width - (tailPosition === 'left-center' || tailPosition === 'right-center' ? tailSize : 0)
      const bubbleHeight = scaledProps.height - (tailPosition.startsWith('bottom') || tailPosition.startsWith('top') ? tailSize : 0)
      const gradientPoints = hasGradient ? 
        getGradientPoints(element.style.gradientAngle || 0, bubbleWidth, bubbleHeight) : null
      
      return (
        <Group {...scaledProps}>
          {/* Main bubble body */}
          <Rect
            x={tailPosition === 'left-center' ? tailSize : 0}
            y={tailPosition.startsWith('bottom') ? 0 : (tailPosition.startsWith('top') ? tailSize : 0)}
            width={bubbleWidth}
            height={bubbleHeight}
            fill={hasGradient ? undefined : (element.style?.backgroundColor || '#3b82f6')}
            fillLinearGradientStartPoint={gradientPoints?.start}
            fillLinearGradientEndPoint={gradientPoints?.end}
            fillLinearGradientColorStops={hasGradient ? [
              (element.style.gradientStartPosition || 0) / 100, element.style.gradientStart,
              (element.style.gradientEndPosition || 100) / 100, element.style.gradientEnd
            ] : undefined}
            stroke={element.style?.borderWidth && element.style?.borderWidth > 0 ? 
              (element.style?.borderColor || '#000000') : undefined}
            strokeWidth={(element.style?.borderWidth || 0) * scale}
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
              } else if (tailPosition.startsWith('top')) {
                const tailX = scaledProps.width * (tailPosition === 'top-left' ? 0.2 : 
                           tailPosition === 'top-right' ? 0.8 : 0.5)
                
                context.moveTo(tailX - 15 * scale, tailSize + 5 * scale)
                context.lineTo(tailX, 0)
                context.lineTo(tailX + 15 * scale, tailSize + 5 * scale)
                context.closePath()
              } else if (tailPosition === 'left-center') {
                const tailY = scaledProps.height * 0.5
                
                context.moveTo(tailSize + 5 * scale, tailY - 15 * scale)
                context.lineTo(0, tailY)
                context.lineTo(tailSize + 5 * scale, tailY + 15 * scale)
                context.closePath()
              } else if (tailPosition === 'right-center') {
                const tailY = scaledProps.height * 0.5
                const bubbleRight = scaledProps.width - tailSize
                
                context.moveTo(bubbleRight - 5 * scale, tailY - 15 * scale)
                context.lineTo(scaledProps.width, tailY)
                context.lineTo(bubbleRight - 5 * scale, tailY + 15 * scale)
                context.closePath()
              }
              
              context.fillStrokeShape(shape)
            }}
            fill={hasGradient ? undefined : (element.style?.backgroundColor || '#3b82f6')}
            fillLinearGradientStartPoint={hasGradient ? { x: 0, y: 0 } : undefined}
            fillLinearGradientEndPoint={hasGradient ? { x: scaledProps.width, y: scaledProps.height } : undefined}
            fillLinearGradientColorStops={hasGradient ? [
              (element.style.gradientStartPosition || 0) / 100, element.style.gradientStart,
              (element.style.gradientEndPosition || 100) / 100, element.style.gradientEnd
            ] : undefined}
            stroke={element.style?.borderWidth && element.style?.borderWidth > 0 ? 
              (element.style?.borderColor || '#000000') : undefined}
            strokeWidth={(element.style?.borderWidth || 0) * scale}
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
