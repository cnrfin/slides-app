// src/components/properties/ImagePropertiesPanel.tsx
import { useState, useEffect } from 'react'
import { Lock, Unlock, Scan } from 'lucide-react'
import useSlideStore, { useCurrentSlide, useSelectedElements } from '@/stores/slideStore'
import type { SlideElement, ImageContent, BlendMode } from '@/types/slide.types'
import BlendModeSelector from './BlendModeSelector'
import { CustomSlider } from '@/components/ui'

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
  const [individualCorners, setIndividualCorners] = useState(false)
  const [cornerValues, setCornerValues] = useState({
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0
  })
  
  // Initialize state from first selected image
  useEffect(() => {
    if (firstImage) {
      setOpacity(Math.round((firstImage.opacity ?? 1) * 100))
      const radius = firstImage.style?.borderRadius || 0
      setCornerRadius(radius)
      
      // Check if individual corners are stored
      if (firstImage.style?.borderRadiusCorners) {
        const corners = firstImage.style.borderRadiusCorners.split(' ').map(Number)
        if (corners.length === 4) {
          setCornerValues({
            topLeft: corners[0],
            topRight: corners[1],
            bottomLeft: corners[3], // CSS order is TL TR BR BL
            bottomRight: corners[2]
          })
          setIndividualCorners(true)
        } else {
          setCornerValues({
            topLeft: radius,
            topRight: radius,
            bottomLeft: radius,
            bottomRight: radius
          })
        }
      } else {
        setCornerValues({
          topLeft: radius,
          topRight: radius,
          bottomLeft: radius,
          bottomRight: radius
        })
      }
      
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
    setCornerValues({
      topLeft: value,
      topRight: value,
      bottomLeft: value,
      bottomRight: value
    })
    
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
  
  // Handle individual corner change
  const handleIndividualCornerChange = (corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      const newValues = { ...cornerValues, [corner]: numValue }
      setCornerValues(newValues)
      
      // Store individual corner values in style
      // Format: "topLeft topRight bottomRight bottomLeft" (CSS order)
      const cornerRadiusString = `${newValues.topLeft} ${newValues.topRight} ${newValues.bottomRight} ${newValues.bottomLeft}`
      
      // Only update the borderRadiusCorners property, not the main borderRadius
      if (!currentSlide) return
      
      selectedImages.forEach(image => {
        updateElement(currentSlide.id, image.id, {
          style: {
            ...image.style,
            borderRadiusCorners: cornerRadiusString // Store individual corners
          }
        })
      })
    }
  }
  
  // Toggle individual corners mode
  const toggleIndividualCorners = () => {
    const newState = !individualCorners
    setIndividualCorners(newState)
    
    if (!currentSlide) return
    
    if (newState) {
      // When turning on individual corners, initialize with the current borderRadius value
      const currentRadius = cornerRadius
      const newValues = {
        topLeft: currentRadius,
        topRight: currentRadius,
        bottomLeft: currentRadius,
        bottomRight: currentRadius
      }
      setCornerValues(newValues)
      
      // Store individual corner values
      const cornerRadiusString = `${newValues.topLeft} ${newValues.topRight} ${newValues.bottomRight} ${newValues.bottomLeft}`
      
      selectedImages.forEach(image => {
        updateElement(currentSlide.id, image.id, {
          style: {
            ...image.style,
            borderRadiusCorners: cornerRadiusString
          }
        })
      })
    } else {
      // When turning off individual corners, clear the borderRadiusCorners property
      // Keep the current borderRadius value (don't change it)
      selectedImages.forEach(image => {
        updateElement(currentSlide.id, image.id, {
          style: {
            ...image.style,
            borderRadiusCorners: undefined // Clear individual corners
          }
        })
      })
    }
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
      {/* Opacity */}
      <div className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-600">Opacity</label>
          <div className="relative">
            <input
              type="number"
              value={opacity}
              onChange={(e) => {
                const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                handleOpacityChange(value)
              }}
              className="w-[4.5rem] pl-3 pr-8 py-1 text-sm text-right bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">%</span>
          </div>
        </div>
        <CustomSlider
          value={opacity}
          onChange={handleOpacityChange}
          min={0}
          max={100}
          className="w-full"
        />
      </div>
      
      {/* Corner Radius */}
      <div className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-600">Corner Radius</label>
          <button
            onClick={toggleIndividualCorners}
            className={`p-1.5 rounded transition-colors ${
              individualCorners
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Individual corner control"
          >
            <Scan className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {individualCorners && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="relative">
              <input
                type="number"
                value={cornerValues.topLeft}
                onChange={(e) => handleIndividualCornerChange('topLeft', e.target.value)}
                className="w-full pl-2 pr-6 py-1 bg-gray-50 text-gray-800 text-sm rounded border border-gray-200 appearance-none focus:outline-none focus:border-blue-500 text-center"
                min="0"
                max="100"
                placeholder="TL"
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">%</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={cornerValues.topRight}
                onChange={(e) => handleIndividualCornerChange('topRight', e.target.value)}
                className="w-full pl-2 pr-6 py-1 bg-gray-50 text-gray-800 text-sm rounded border border-gray-200 appearance-none focus:outline-none focus:border-blue-500 text-center"
                min="0"
                max="100"
                placeholder="TR"
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">%</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={cornerValues.bottomLeft}
                onChange={(e) => handleIndividualCornerChange('bottomLeft', e.target.value)}
                className="w-full pl-2 pr-6 py-1 bg-gray-50 text-gray-800 text-sm rounded border border-gray-200 appearance-none focus:outline-none focus:border-blue-500 text-center"
                min="0"
                max="100"
                placeholder="BL"
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">%</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={cornerValues.bottomRight}
                onChange={(e) => handleIndividualCornerChange('bottomRight', e.target.value)}
                className="w-full pl-2 pr-6 py-1 bg-gray-50 text-gray-800 text-sm rounded border border-gray-200 appearance-none focus:outline-none focus:border-blue-500 text-center"
                min="0"
                max="100"
                placeholder="BR"
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">%</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <CustomSlider
            value={cornerRadius}
            onChange={handleCornerRadiusChange}
            min={0}
            max={100}
            className="flex-1"
            disabled={individualCorners}
          />
          <div className="relative">
            <input
              type="number"
              value={cornerRadius}
              onChange={(e) => {
                const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                handleCornerRadiusChange(value)
              }}
              className={`w-[4.5rem] pl-3 pr-8 py-1 text-sm text-right bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                individualCorners ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              min="0"
              max="100"
              disabled={individualCorners}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">%</span>
          </div>
        </div>
      </div>
      
      {/* Blend Mode */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">Blend</label>
        <BlendModeSelector
          value={blendMode}
          onChange={handleBlendModeChange}
        />
      </div>
      
      {/* Actions */}
      <div>
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
    </div>
  )
}
