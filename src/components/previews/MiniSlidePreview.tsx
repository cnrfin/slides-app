// src/components/previews/MiniSlidePreview.tsx
import { useMemo } from 'react'
import type { Slide, SlideElement, TextContent, BlurbContent, ImageContent, ShapeContent, LineContent, IconContent, TableContent } from '@/types/slide.types'

interface MiniSlidePreviewProps {
  slide: Slide
  width?: number
  height?: number
  className?: string
}

export default function MiniSlidePreview({ slide, width = 64, height = 64, className = '' }: MiniSlidePreviewProps) {
  // Canvas dimensions (matching the main canvas)
  const CANVAS_WIDTH = 1024
  const CANVAS_HEIGHT = 768
  
  // Calculate scale to fit the preview
  const scale = Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT)
  
  // Render an element based on its type
  const renderElement = (element: SlideElement) => {
    try {
      const scaledX = element.x * scale
      const scaledY = element.y * scale
      const scaledWidth = element.width * scale
      const scaledHeight = element.height * scale
    
    // Common style for all elements
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${scaledX}px`,
      top: `${scaledY}px`,
      width: `${scaledWidth}px`,
      height: `${scaledHeight}px`,
      opacity: element.opacity ?? 1,
      visibility: element.visible !== false ? 'visible' : 'hidden',
      overflow: 'hidden'
    }
    
    switch (element.type) {
      case 'text': {
        const content = element.content as TextContent
        const fontSize = (element.style?.fontSize || 16) * scale
        
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              fontSize: `${fontSize}px`,
              fontFamily: element.style?.fontFamily || 'Arial',
              fontWeight: element.style?.fontWeight || '400',
              fontStyle: element.style?.fontStyle || 'normal',
              color: element.style?.color || '#000000',
              textAlign: element.style?.textAlign as any || 'left',
              lineHeight: element.style?.lineHeight || 1.2,
              letterSpacing: `${(element.style?.letterSpacing || 0) * scale}px`,
              textDecoration: element.style?.textDecoration || 'none',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: element.style?.textAlign === 'center' ? 'center' : 
                             element.style?.textAlign === 'right' ? 'flex-end' : 'flex-start',
              padding: `${2 * scale}px`,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          >
            <span style={{ fontSize: `${fontSize}px` }}>
              {content.text || ''}
            </span>
          </div>
        )
      }
      
      case 'blurb': {
        const content = element.content as BlurbContent
        const fontSize = (element.style?.fontSize || 16) * scale
        const padding = 20 * scale
        
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: element.style?.backgroundColor || '#ffffff',
              borderRadius: `${8 * scale}px`,
              border: `${scale}px solid ${element.style?.borderColor || '#e5e7eb'}`,
              padding: `${padding}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{
              fontSize: `${fontSize}px`,
              fontFamily: element.style?.fontFamily || 'Arial',
              color: element.style?.color || '#000000',
              textAlign: 'center'
            }}>
              {content.text || ''}
            </span>
          </div>
        )
      }
      
      case 'image': {
        const content = element.content as ImageContent
        
        // Skip placeholder images
        if (content.isPlaceholder) {
          return (
            <div
              key={element.id}
              style={{
                ...baseStyle,
                backgroundColor: '#f3f4f6',
                borderRadius: element.style?.borderRadius ? `${element.style.borderRadius * scale}px` : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg
                width={scaledWidth * 0.4}
                height={scaledHeight * 0.4}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="1"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )
        }
        
        return (
          <img
            key={element.id}
            src={content.src}
            alt={content.alt || ''}
            style={{
              ...baseStyle,
              objectFit: (content.objectFit || 'cover') as any,
              borderRadius: element.style?.borderRadius ? `${element.style.borderRadius * scale}px` : 0
            }}
          />
        )
      }
      
      case 'shape': {
        const content = element.content as ShapeContent
        const fillColor = element.style?.backgroundColor || '#3b82f6'
        const strokeColor = element.style?.borderColor || 'transparent'
        const strokeWidth = (element.style?.borderWidth || 0) * scale
        
        if (content.shape === 'rectangle') {
          return (
            <div
              key={element.id}
              style={{
                ...baseStyle,
                backgroundColor: fillColor,
                border: strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : 'none',
                borderRadius: content.cornerRadius ? `${content.cornerRadius * scale}px` : 0
              }}
            />
          )
        } else if (content.shape === 'circle') {
          return (
            <div
              key={element.id}
              style={{
                ...baseStyle,
                backgroundColor: fillColor,
                border: strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : 'none',
                borderRadius: '50%'
              }}
            />
          )
        }
        
        // For other shapes, render a placeholder
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: fillColor,
              border: strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : 'none'
            }}
          />
        )
      }
      
      case 'line': {
        const content = element.content as LineContent
        const strokeColor = element.style?.borderColor || '#000000'
        const strokeWidth = (element.style?.borderWidth || 2) * scale
        
        // Simple line rendering using div with border
        const isHorizontal = Math.abs(content.points[3] - content.points[1]) < Math.abs(content.points[2] - content.points[0])
        
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: strokeColor,
              height: isHorizontal ? `${strokeWidth}px` : `${scaledHeight}px`,
              width: isHorizontal ? `${scaledWidth}px` : `${strokeWidth}px`
            }}
          />
        )
      }
      
      case 'icon': {
        const content = element.content as IconContent
        const color = element.style?.color || '#000000'
        
        // Render icon as a colored box placeholder for simplicity
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: color,
              opacity: 0.3,
              borderRadius: `${4 * scale}px`
            }}
          />
        )
      }
      
      case 'table': {
        const content = element.content as TableContent
        const borderColor = element.style?.borderColor || '#e5e7eb'
        
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              border: `${scale}px solid ${borderColor}`,
              backgroundColor: '#ffffff',
              display: 'grid',
              gridTemplateColumns: `repeat(${content.columns}, 1fr)`,
              gridTemplateRows: `repeat(${content.rows}, 1fr)`
            }}
          >
            {/* Render a simplified grid */}
            {Array.from({ length: content.rows * content.columns }).map((_, i) => (
              <div
                key={i}
                style={{
                  borderRight: i % content.columns !== content.columns - 1 ? `${scale * 0.5}px solid ${borderColor}` : 'none',
                  borderBottom: Math.floor(i / content.columns) !== content.rows - 1 ? `${scale * 0.5}px solid ${borderColor}` : 'none'
                }}
              />
            ))}
          </div>
        )
      }
      
      default:
        return null
    }
    } catch (error) {
      console.warn('Error rendering element in preview:', element.id, error)
      return null
    }
  }
  
  // Parse background color/gradient
  const backgroundStyle = useMemo(() => {
    const bg = slide.background || '#ffffff'
    
    // Check if it's a gradient (contains 'gradient')
    if (typeof bg === 'string' && bg.includes('gradient')) {
      return { background: bg }
    }
    
    // Otherwise treat as solid color
    return { backgroundColor: bg }
  }, [slide.background])
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...backgroundStyle
      }}
    >
      {/* Render all slide elements safely */}
      {slide.elements && Array.isArray(slide.elements) 
        ? slide.elements.map(renderElement).filter(Boolean)
        : null
      }
    </div>
  )
}
