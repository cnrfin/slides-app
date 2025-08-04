// src/components/properties/ImagePropertiesPanel.tsx
import { useState, useEffect } from 'react'
import { Image as ImageIcon, Lock, Unlock, Eye, EyeOff, CornerDownRight } from 'lucide-react'
import useSlideStore, { useCurrentSlide, useSelectedElements } from '@/stores/slideStore'
import type { SlideElement, ImageContent, BlendMode } from '@/types/slide.types'
import BlendModeSelector from './BlendModeSelector'

export default function ImagePropertiesPanel() {
  const currentSlide = useCurrentSlide()
  const selectedElements = useSelectedElements()
  const { updateElement, selectElement } = useSlideStore()
  
  // Get selected image elements
  const selectedImages = selectedElements.filter(el => el.type === 'image')
  const isMultiple = selectedImages.length > 1
  const firstImage = selectedImages[0]
  
  // Local state for properties
  const [opacity, setOpacity] = useState(100)
  const [cornerRadius, setCornerRadius] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [blendMode, setBlendMode] = useState<BlendMode>('normal')
  
  // Initialize state from first selected image
  useEffect(() => {
    if (firstImage) {
      setOpacity(Math.round((firstImage.opacity ?? 1) * 100))
      setCornerRadius(firstImage.style?.borderRadius || 0)
      setIsLocked(firstImage.locked || false)
      setBlendMode(firstImage.style?.blendMode || 'normal')
    }
  }, [firstImage])
  
  // Handle opacity change
  const handleOpacityChange = (value: number) => {
    setOpacity(value)
    
    if (!currentSlide) return
    
    selectedImages.forEach(image => {
      updateElement(currentSlide.id, image.id, {
        opacity: value / 100
      })
    })
  }
  
  // Handle corner radius change
  const handleCornerRadiusChange = (value: number) => {
    setCornerRadius(value)
    
    if (!currentSlide) return
    
    selectedImages.forEach(image => {
      updateElement(currentSlide.id, image.id, {
        style: {
          ...image.style,
          borderRadius: value
        }
      })
    })
  }
  
  // Toggle lock
  const toggleLock = () => {
    if (!currentSlide) return
    
    const newLocked = !isLocked
    setIsLocked(newLocked)
    
    selectedImages.forEach(image => {
      updateElement(currentSlide.id, image.id, {
        locked: newLocked
      })
    })
  }
  
  // Handle blend mode change
  const handleBlendModeChange = (value: BlendMode) => {
    setBlendMode(value)
    
    if (!currentSlide) return
    
    selectedImages.forEach(image => {
      updateElement(currentSlide.id, image.id, {
        style: {
          ...image.style,
          blendMode: value
        }
      })
    })
  }
  
  if (selectedImages.length === 0) return null
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <ImageIcon className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">
          Image Properties
          {isMultiple && <span className="text-sm font-normal text-gray-500 ml-2">({selectedImages.length} selected)</span>}
        </h3>
      </div>
      
      {/* Image info */}
      {!isMultiple && firstImage && (
        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-gray-600">Alt text: </span>
            <span className="text-gray-800">{(firstImage.content as ImageContent).alt || 'No alt text'}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Size: </span>
            <span className="text-gray-800">{Math.round(firstImage.width)} × {Math.round(firstImage.height)}px</span>
          </div>
        </div>
      )}
      
      {/* Opacity */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Opacity</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={opacity}
              onChange={(e) => {
                const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                handleOpacityChange(value)
              }}
              className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${opacity}%, #e5e7eb ${opacity}%, #e5e7eb 100%)`
          }}
        />
      </div>
      
      {/* Corner Radius */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <CornerDownRight className="w-4 h-4" />
            Corner Radius
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={cornerRadius}
              onChange={(e) => {
                const value = Math.max(0, Math.min(50, parseInt(e.target.value) || 0))
                handleCornerRadiusChange(value)
              }}
              className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="50"
            />
            <span className="text-sm text-gray-500">px</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          value={cornerRadius}
          onChange={(e) => handleCornerRadiusChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${cornerRadius * 2}%, #e5e7eb ${cornerRadius * 2}%, #e5e7eb 100%)`
          }}
        />
      </div>
      
      {/* Blend Mode */}
      <BlendModeSelector
        value={blendMode}
        onChange={handleBlendModeChange}
        className="mt-4"
      />
      
      {/* Actions */}
      <div className="pt-4">
        <button
          onClick={toggleLock}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            isLocked
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isLocked ? (
            <>
              <Lock className="w-4 h-4" />
              Locked {isMultiple && `(${selectedImages.length})`}
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Unlocked {isMultiple && `(${selectedImages.length})`}
            </>
          )}
        </button>
      </div>
      
      {/* Style for range inputs */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          border-color: #3b82f6;
          transform: scale(1.1);
        }
        
        .slider-thumb::-webkit-slider-thumb:active {
          border-color: #2563eb;
          transform: scale(0.95);
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        }
        
        .slider-thumb::-moz-range-thumb:hover {
          border-color: #3b82f6;
          transform: scale(1.1);
        }
        
        .slider-thumb::-moz-range-thumb:active {
          border-color: #2563eb;
          transform: scale(0.95);
        }
      `}</style>
    </div>
  )
}
