import { useState, useRef, useEffect } from 'react'
import { Square, Circle, Triangle } from 'lucide-react'
import { getShapesByCategory, type SVGShapeDefinition } from '@/utils/svg-shapes'
import useSlideStore from '@/stores/slideStore'
import type { ShapeContent } from '@/types/slide.types'

interface ShapePopupProps {
  isOpen: boolean
  onClose: () => void
  anchorElement: HTMLElement | null
}

export default function ShapePopup({ isOpen, onClose, anchorElement }: ShapePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  
  const { slides, currentSlideId, addElement } = useSlideStore()
  const currentSlide = slides.find(s => s.id === currentSlideId)
  
  // Calculate popup position
  useEffect(() => {
    if (isOpen && anchorElement) {
      // Use setTimeout to ensure DOM is ready
      const calculatePosition = () => {
        const rect = anchorElement.getBoundingClientRect()
        const popupWidth = 320 // Fixed width from style
        const popupHeight = 400 // Max height from style
        
        // Position to the right of the button
        let left = rect.right + 8
        let top = rect.top
        
        // Check if popup would go off screen
        if (left + popupWidth > window.innerWidth) {
          left = rect.left - popupWidth - 8
        }
        
        // Ensure popup doesn't go below viewport
        if (top + popupHeight > window.innerHeight) {
          top = window.innerHeight - popupHeight - 8
        }
        
        setPosition({ top, left })
      }
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(calculatePosition, 0)
      return () => clearTimeout(timer)
    } else if (!isOpen) {
      // Reset position when closing
      setPosition(null)
    }
  }, [isOpen, anchorElement])
  
  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
          anchorElement && !anchorElement.contains(event.target as Node)) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, anchorElement])
  
  const handleAddShape = (shape: 'rectangle' | 'circle' | 'triangle' | 'svg', svgData?: SVGShapeDefinition) => {
    if (!currentSlide) return
    
    if (shape === 'svg' && svgData) {
      let width = 150
      let height = 150
      
      // Special handling for edge wave shapes
      if (svgData.id && svgData.id.startsWith('wave-')) {
        if (svgData.id === 'wave-bottom' || svgData.id === 'wave-top' || 
            svgData.id === 'wave-bottom-gentle' || svgData.id === 'wave-top-gentle') {
          width = 300
          height = 100
        } else if (svgData.id === 'wave-left' || svgData.id === 'wave-right') {
          width = 100
          height = 300
        } else if (svgData.id === 'wave-corner') {
          width = 200
          height = 200
        }
      } else if (svgData.aspectRatio) {
        height = width / svgData.aspectRatio
      }
      
      const shapeContent: ShapeContent = {
        shape: 'svg',
        svgPath: svgData.path,
        svgId: svgData.id,
        aspectRatio: svgData.aspectRatio,
        viewBox: svgData.viewBox
      }
      
      addElement(currentSlide.id, {
        type: 'shape',
        x: 400 - width / 2,
        y: 300 - height / 2,
        width,
        height,
        content: shapeContent,
        style: {
          backgroundColor: '#3b82f6',
        },
      })
    } else if (shape === 'triangle') {
      // Create triangle using SVG path
      const triangleContent: ShapeContent = {
        shape: 'svg',
        svgPath: 'M50,10 L90,90 L10,90 Z',
        svgId: 'triangle-basic',
        viewBox: '10 10 80 80'
      }
      
      addElement(currentSlide.id, {
        type: 'shape',
        x: 350,
        y: 250,
        width: 100,
        height: 100,
        content: triangleContent,
        style: {
          backgroundColor: '#3b82f6',
        },
      })
    } else {
      // Basic shapes (rectangle, circle)
      const shapeContent: ShapeContent = {
        shape: shape as 'rectangle' | 'circle',
      }
      
      addElement(currentSlide.id, {
        type: 'shape',
        x: 350,
        y: 250,
        width: 100,
        height: 100,
        content: shapeContent,
        style: {
          backgroundColor: shape === 'rectangle' ? '#3b82f6' : '#10b981',
          borderRadius: shape === 'rectangle' ? 8 : undefined,
        },
      })
    }
    
    onClose()
  }
  
  if (!isOpen || !position) return null
  
  // Get all shapes
  const waveShapes = getShapesByCategory('waves')
  const blobShapes = getShapesByCategory('blobs')
  const decorativeShapes = getShapesByCategory('decorative')
  const arrowShapes = getShapesByCategory('arrows')
  
  return (
    <div 
      ref={popupRef}
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 z-50 animate-popup-in overflow-hidden"
      style={{ top: position.top, left: position.left, width: '320px', maxHeight: '400px' }}
    >
      <div className="overflow-y-auto max-h-[392px] scrollbar-styled p-4">
        {/* Basic Shapes */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Basic Shapes</h3>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleAddShape('rectangle')}
              className="flex flex-col items-center justify-center p-3 rounded hover:bg-gray-100 transition-colors"
            >
              <Square className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => handleAddShape('circle')}
              className="flex flex-col items-center justify-center p-3 rounded hover:bg-gray-100 transition-colors"
            >
              <Circle className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => handleAddShape('triangle')}
              className="flex flex-col items-center justify-center p-3 rounded hover:bg-gray-100 transition-colors"
            >
              <Triangle className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        
        {/* Wave Shapes */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Waves</h3>
          <div className="grid grid-cols-4 gap-2">
            {waveShapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => handleAddShape('svg', shape)}
                className="flex items-center justify-center p-3 rounded hover:bg-gray-100 transition-colors"
                title={shape.name}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox={shape.viewBox || '0 0 100 100'} 
                  className="text-gray-600"
                >
                  <path d={shape.path} fill="currentColor" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        
        {/* Blob Shapes */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Blobs</h3>
          <div className="grid grid-cols-4 gap-2">
            {blobShapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => handleAddShape('svg', shape)}
                className="flex items-center justify-center p-3 rounded hover:bg-gray-100 transition-colors"
                title={shape.name}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox={shape.viewBox || '0 0 100 100'} 
                  className="text-gray-600"
                >
                  <path d={shape.path} fill="currentColor" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        
        {/* Decorative Shapes */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Decorative</h3>
          <div className="grid grid-cols-4 gap-2">
            {decorativeShapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => handleAddShape('svg', shape)}
                className="flex items-center justify-center p-3 rounded hover:bg-gray-100 transition-colors"
                title={shape.name}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox={shape.viewBox || '0 0 100 100'} 
                  className="text-gray-600"
                >
                  <path d={shape.path} fill="currentColor" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        
        {/* Arrow Shapes */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Arrows</h3>
          <div className="grid grid-cols-4 gap-2">
            {arrowShapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => handleAddShape('svg', shape)}
                className="flex items-center justify-center p-3 rounded hover:bg-gray-100 transition-colors"
                title={shape.name}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox={shape.viewBox || '0 0 100 100'} 
                  className="text-gray-600"
                >
                  <path d={shape.path} fill="currentColor" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
