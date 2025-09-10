// src/components/previews/MiniSlidePreview.tsx
import { useMemo, useRef, useEffect, useState } from 'react'
import type { Slide, SlideElement, TextContent, BlurbContent, ImageContent, ShapeContent, LineContent, IconContent, TableContent } from '@/types/slide.types'

interface MiniSlidePreviewProps {
  slide: Slide
  width?: number
  height?: number
  className?: string
}

export default function MiniSlidePreview({ slide, width, height, className = '' }: MiniSlidePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: width || 400, height: height || 300 })
  
  // Canvas dimensions (matching the main canvas)
  const CANVAS_WIDTH = 1024
  const CANVAS_HEIGHT = 768
  const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT
  
  // Update dimensions based on container size if width/height not specified
  useEffect(() => {
    if (!width || !height) {
      const updateDimensions = () => {
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth
          const containerHeight = containerRef.current.clientHeight
          
          if (containerWidth && containerHeight) {
            // Maintain aspect ratio while fitting within container
            const containerAspect = containerWidth / containerHeight
            let finalWidth, finalHeight
            
            if (containerAspect > ASPECT_RATIO) {
              // Container is wider than slide aspect ratio
              finalHeight = containerHeight
              finalWidth = finalHeight * ASPECT_RATIO
            } else {
              // Container is taller than slide aspect ratio
              finalWidth = containerWidth
              finalHeight = finalWidth / ASPECT_RATIO
            }
            
            setDimensions({ 
              width: width || finalWidth, 
              height: height || finalHeight 
            })
          }
        }
      }
      
      updateDimensions()
      
      // Add resize observer for responsive behavior
      const resizeObserver = new ResizeObserver(updateDimensions)
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current)
      }
      
      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [width, height])
  
  // Calculate scale to fit the preview
  const scale = Math.min(dimensions.width / CANVAS_WIDTH, dimensions.height / CANVAS_HEIGHT)
  
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
      overflow: 'hidden',
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      transformOrigin: 'center'
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
              fontFamily: element.style?.fontFamily || 'Inter, sans-serif',
              fontWeight: element.style?.fontWeight || '400',
              fontStyle: element.style?.fontStyle || 'normal',
              color: element.style?.color || '#000000',
              textAlign: element.style?.textAlign as any || 'left',
              lineHeight: element.style?.lineHeight || 1.5,
              letterSpacing: `${(element.style?.letterSpacing || 0) * scale}px`,
              textDecoration: element.style?.textDecoration || 'none',
              display: 'flex',
              alignItems: element.style?.verticalAlign === 'middle' ? 'center' : 
                          element.style?.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
              justifyContent: element.style?.textAlign === 'center' ? 'center' : 
                             element.style?.textAlign === 'right' ? 'flex-end' : 'flex-start',
              padding: `${4 * scale}px`,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          >
            <span style={{ 
              fontSize: `${fontSize}px`,
              maxWidth: '100%',
              display: 'block'
            }}>
              {content.text || ''}
            </span>
          </div>
        )
      }
      
      case 'blurb': {
        const content = element.content as BlurbContent
        const fontSize = (element.style?.fontSize || 14) * scale
        const padding = 16 * scale
        
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
              justifyContent: 'center',
              boxShadow: element.style?.boxShadow ? `0 ${2 * scale}px ${4 * scale}px rgba(0,0,0,0.1)` : undefined
            }}
          >
            <span style={{
              fontSize: `${fontSize}px`,
              fontFamily: element.style?.fontFamily || 'Inter, sans-serif',
              color: element.style?.color || '#374151',
              textAlign: 'center',
              lineHeight: 1.4
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
                backgroundColor: '#f9fafb',
                borderRadius: element.style?.borderRadius ? `${element.style.borderRadius * scale}px` : `${4 * scale}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `${scale}px solid #e5e7eb`
              }}
            >
              <svg
                width={scaledWidth * 0.3}
                height={scaledHeight * 0.3}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="1.5"
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
              borderRadius: element.style?.borderRadius ? `${element.style.borderRadius * scale}px` : 0,
              border: element.style?.borderWidth ? `${element.style.borderWidth * scale}px solid ${element.style?.borderColor || '#e5e7eb'}` : undefined
            }}
            loading="lazy"
          />
        )
      }
      
      case 'shape': {
        const content = element.content as ShapeContent
        const fillColor = element.style?.backgroundColor || '#10b981'
        const strokeColor = element.style?.borderColor || 'transparent'
        const strokeWidth = (element.style?.borderWidth || 0) * scale
        
        if (content.shape === 'rectangle' || content.shape === 'square') {
          return (
            <div
              key={element.id}
              style={{
                ...baseStyle,
                backgroundColor: fillColor,
                border: strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : 'none',
                borderRadius: content.cornerRadius ? `${content.cornerRadius * scale}px` : 0,
                opacity: element.style?.opacity ?? 0.8
              }}
            />
          )
        } else if (content.shape === 'circle' || content.shape === 'ellipse') {
          return (
            <div
              key={element.id}
              style={{
                ...baseStyle,
                backgroundColor: fillColor,
                border: strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : 'none',
                borderRadius: '50%',
                opacity: element.style?.opacity ?? 0.8
              }}
            />
          )
        }
        
        // For other shapes, render a styled placeholder
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: fillColor,
              border: strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : 'none',
              clipPath: content.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 
                       content.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                       undefined,
              opacity: element.style?.opacity ?? 0.8
            }}
          />
        )
      }
      
      case 'line': {
        const content = element.content as LineContent
        const strokeColor = element.style?.borderColor || '#6b7280'
        const strokeWidth = Math.max((element.style?.borderWidth || 2) * scale, 0.5)
        
        // Calculate line angle and length
        const dx = content.points[2] - content.points[0]
        const dy = content.points[3] - content.points[1]
        const length = Math.sqrt(dx * dx + dy * dy) * scale
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)
        
        return (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: `${content.points[0] * scale}px`,
              top: `${content.points[1] * scale}px`,
              width: `${length}px`,
              height: `${strokeWidth}px`,
              backgroundColor: strokeColor,
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0 50%',
              opacity: element.opacity ?? 1
            }}
          />
        )
      }
      
      case 'icon': {
        const content = element.content as IconContent
        const color = element.style?.color || '#6b7280'
        const size = Math.min(scaledWidth, scaledHeight) * 0.6
        
        // Render icon as a simple colored circle with initial for simplicity in preview
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              fontSize: `${size}px`,
              fontWeight: 'bold'
            }}
          >
            <div style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              opacity: 0.15,
              borderRadius: `${4 * scale}px`
            }} />
          </div>
        )
      }
      
      case 'table': {
        const content = element.content as TableContent
        const borderColor = element.style?.borderColor || '#e5e7eb'
        const cellPadding = 4 * scale
        
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              border: `${Math.max(scale, 0.5)}px solid ${borderColor}`,
              backgroundColor: element.style?.backgroundColor || '#ffffff',
              borderRadius: `${4 * scale}px`,
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${content.columns}, 1fr)`,
              gridTemplateRows: `repeat(${content.rows}, 1fr)`,
              width: '100%',
              height: '100%'
            }}>
              {/* Render simplified grid cells */}
              {Array.from({ length: content.rows * content.columns }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    borderRight: i % content.columns !== content.columns - 1 ? `${Math.max(scale * 0.5, 0.5)}px solid ${borderColor}` : 'none',
                    borderBottom: Math.floor(i / content.columns) !== content.rows - 1 ? `${Math.max(scale * 0.5, 0.5)}px solid ${borderColor}` : 'none',
                    padding: `${cellPadding}px`,
                    backgroundColor: Math.floor(i / content.columns) === 0 ? element.style?.headerColor || '#f9fafb' : 'transparent'
                  }}
                />
              ))}
            </div>
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
    
    // Check if it's an image URL
    if (typeof bg === 'string' && (bg.startsWith('http') || bg.startsWith('data:'))) {
      return { 
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    
    // Otherwise treat as solid color
    return { backgroundColor: bg }
  }, [slide.background])
  
  // Use dynamic dimensions or provided ones
  const finalWidth = width || dimensions.width
  const finalHeight = height || dimensions.height
  const finalScale = Math.min(finalWidth / CANVAS_WIDTH, finalHeight / CANVAS_HEIGHT)
  
  return (
    <div 
      ref={containerRef}
      className={`relative bg-white dark:bg-gray-800 ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
        minHeight: height ? undefined : '200px',
        aspectRatio: width || height ? undefined : `${ASPECT_RATIO}`
      }}
    >
      <div
        className="absolute inset-0 overflow-hidden rounded"
        style={{
          ...backgroundStyle,
          width: `${CANVAS_WIDTH * finalScale}px`,
          height: `${CANVAS_HEIGHT * finalScale}px`,
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Render all slide elements safely */}
        {slide.elements && Array.isArray(slide.elements) 
          ? slide.elements
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map(el => renderElement(el))
              .filter(Boolean)
          : null
        }
      </div>
    </div>
  )
}
