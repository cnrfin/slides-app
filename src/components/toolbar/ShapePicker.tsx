import { useState, useEffect } from 'react'
import { Square, Circle } from 'lucide-react'
import { SVG_SHAPES, getShapesByCategory, type SVGShapeDefinition } from '@/utils/svg-shapes'

interface ShapePickerProps {
  onSelectShape: (shape: 'rectangle' | 'circle' | 'blurb' | 'svg', svgData?: { id: string; path: string; aspectRatio?: number; viewBox?: string }) => void
  onClose: () => void
}

const CATEGORIES = [
  { id: 'basic', name: 'Basic', icon: Square },
  { id: 'waves', name: 'Waves', icon: null },
  { id: 'blobs', name: 'Blobs', icon: null },
  { id: 'decorative', name: 'Decorative', icon: null },
  { id: 'arrows', name: 'Arrows', icon: null },
] as const

export default function ShapePicker({ onSelectShape, onClose }: ShapePickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('basic')
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Trigger animation on mount
  useEffect(() => {
    // Use requestAnimationFrame to ensure the component renders first
    const animationFrame = requestAnimationFrame(() => {
      setIsAnimating(true)
    })
    
    return () => cancelAnimationFrame(animationFrame)
  }, [])
  
  const renderBasicShapes = () => (
    <div className="grid grid-cols-3 gap-3 p-4">
      <button
        onClick={() => {
          onSelectShape('rectangle')
          onClose()
        }}
        className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-100 transition-colors group"
      >
        <div className="w-12 h-12 border-2 border-gray-400 rounded group-hover:border-blue-500 transition-colors" />
        <span className="text-xs mt-2 text-gray-600">Rectangle</span>
      </button>
      
      <button
        onClick={() => {
          onSelectShape('circle')
          onClose()
        }}
        className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-100 transition-colors group"
      >
        <div className="w-12 h-12 border-2 border-gray-400 rounded-full group-hover:border-blue-500 transition-colors" />
        <span className="text-xs mt-2 text-gray-600">Circle</span>
      </button>
      
      <button
        onClick={() => {
          onSelectShape('blurb')
          onClose()
        }}
        className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-100 transition-colors group"
      >
        <svg width="48" height="48" viewBox="0 0 48 48" className="text-gray-400 group-hover:text-blue-500 transition-colors">
          <path 
            d="M8 8 L40 8 Q44 8 44 12 L44 28 Q44 32 40 32 L20 32 L12 40 L12 32 L8 32 Q4 32 4 28 L4 12 Q4 8 8 8 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3"
          />
        </svg>
        <span className="text-xs mt-2 text-gray-600">Speech</span>
      </button>
    </div>
  )
  
  const renderSVGShapes = (shapes: SVGShapeDefinition[]) => (
    <div className="grid grid-cols-3 gap-3 p-4 max-h-[320px] overflow-y-auto">
      {shapes.map((shape) => (
        <button
          key={shape.id}
          onClick={() => {
            onSelectShape('svg', {
              id: shape.id,
              path: shape.path,
              aspectRatio: shape.aspectRatio,
              viewBox: shape.viewBox
            })
            onClose()
          }}
          className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-100 transition-colors group"
        >
          <svg 
            width="48" 
            height="48" 
            viewBox={shape.viewBox || '0 0 100 100'} 
            className="text-gray-400 group-hover:text-blue-500 transition-colors"
          >
            <path d={shape.path} fill="currentColor" />
          </svg>
          <span className="text-xs mt-2 text-gray-600 text-center">{shape.name}</span>
        </button>
      ))}
    </div>
  )
  
  return (
    <div 
      className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200/50 backdrop-blur-sm transition-all duration-200 ease-out origin-bottom ${
        isAnimating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
      }`}
    >
      <div className="w-[380px]">
        {/* Category tabs */}
        <div className="flex border-b border-gray-200">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Shape grid */}
        <div className="min-h-[200px]">
          {selectedCategory === 'basic' && renderBasicShapes()}
          {selectedCategory === 'waves' && renderSVGShapes(getShapesByCategory('waves'))}
          {selectedCategory === 'blobs' && renderSVGShapes(getShapesByCategory('blobs'))}
          {selectedCategory === 'decorative' && renderSVGShapes(getShapesByCategory('decorative'))}
          {selectedCategory === 'arrows' && renderSVGShapes(getShapesByCategory('arrows'))}
        </div>
      </div>
    </div>
  )
}
