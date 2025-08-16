// src/components/properties/ShapePropertiesPanel.tsx
import { useState, useEffect } from 'react'
import { 
  Lock,
  Unlock,
  Scan
} from 'lucide-react'
import useSlideStore from '@/stores/slideStore'
import { useSelectedElements, useCurrentSlide } from '@/stores/slideStore'
import type { ElementStyle, ShapeContent, BlendMode } from '@/types/slide.types'
import BlendModeSelector from './BlendModeSelector'
import { ColorOpacityControl, CustomSlider } from '@/components/ui'

interface ShapePropertiesPanelProps {
  className?: string
}

export default function ShapePropertiesPanel({ className = '' }: ShapePropertiesPanelProps) {
  const selectedElements = useSelectedElements()
  const currentSlide = useCurrentSlide()
  const updateElement = useSlideStore((state) => state.updateElement)
  
  // Get all selected shape elements
  const shapeElements = selectedElements.filter(el => el.type === 'shape')
  const firstShapeElement = shapeElements[0]
  const shapeContent = firstShapeElement?.content as ShapeContent | undefined
  const style = firstShapeElement?.style || {}
  
  const [opacityValue, setOpacityValue] = useState(Math.round((firstShapeElement?.opacity || 1) * 100))
  const [individualCorners, setIndividualCorners] = useState(false)
  const [cornerValues, setCornerValues] = useState({
    topLeft: style.borderRadius || 0,
    topRight: style.borderRadius || 0,
    bottomLeft: style.borderRadius || 0,
    bottomRight: style.borderRadius || 0
  })
  
  // Update values when element changes
  useEffect(() => {
    setOpacityValue(Math.round((firstShapeElement?.opacity || 1) * 100))
    const radius = style.borderRadius || 0
    
    // Check if individual corners are stored
    if (style.borderRadiusCorners) {
      const corners = style.borderRadiusCorners.split(' ').map(Number)
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
  }, [firstShapeElement?.id, firstShapeElement?.opacity, style.borderRadius, style.borderRadiusCorners])
  
  // If no shape elements are selected, return null
  if (shapeElements.length === 0 || !currentSlide) {
    return null
  }
  
  const updateStyle = (updates: Partial<ElementStyle>) => {
    // Update all selected shape elements
    shapeElements.forEach(element => {
      const newStyle = { ...element.style, ...updates }
      updateElement(currentSlide.id, element.id, { style: newStyle })
    })
  }
  
  const handleOpacityChange = (opacity: number) => {
    setOpacityValue(Math.round(opacity * 100))
    // Update all selected shape elements
    shapeElements.forEach(element => {
      updateElement(currentSlide.id, element.id, { opacity })
    })
  }
  
  const handleIndividualCornerChange = (corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      const newValues = { ...cornerValues, [corner]: numValue }
      setCornerValues(newValues)
      
      // Store individual corner values in style
      // Format: "topLeft topRight bottomRight bottomLeft" (CSS order)
      const cornerRadiusString = `${newValues.topLeft} ${newValues.topRight} ${newValues.bottomRight} ${newValues.bottomLeft}`
      
      // Only update the borderRadiusCorners property, not the main borderRadius
      updateStyle({ 
        borderRadiusCorners: cornerRadiusString // Store individual corners
      })
    }
  }
  
  const toggleIndividualCorners = () => {
    const newState = !individualCorners
    setIndividualCorners(newState)
    
    if (newState) {
      // When turning on individual corners, initialize with the current borderRadius value
      const currentRadius = style.borderRadius || 0
      const newValues = {
        topLeft: currentRadius,
        topRight: currentRadius,
        bottomLeft: currentRadius,
        bottomRight: currentRadius
      }
      setCornerValues(newValues)
      
      // Store individual corner values
      const cornerRadiusString = `${newValues.topLeft} ${newValues.topRight} ${newValues.bottomRight} ${newValues.bottomLeft}`
      updateStyle({ 
        borderRadiusCorners: cornerRadiusString
      })
    } else {
      // When turning off individual corners, clear the borderRadiusCorners property
      // Keep the current borderRadius value (don't change it)
      updateStyle({ 
        borderRadiusCorners: undefined // Clear individual corners
      })
    }
  }
  
  return (
    <div className={`space-y-1 ${className}`}>
      {/* Fill with integrated Opacity */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">Fill</label>
        <ColorOpacityControl
          style={style}
          opacity={firstShapeElement?.opacity || 1}
          colorType="fill"
          onChange={updateStyle}
          onOpacityChange={handleOpacityChange}
        />
      </div>
      
      {/* Border Radius - Only show for rectangles and SVG shapes without fixed aspect ratio */}
      {(shapeContent?.shape === 'rectangle' || (shapeContent?.shape === 'svg' && !shapeContent.aspectRatio)) && (
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
              value={style.borderRadius || 0}
              onChange={(value) => updateStyle({ borderRadius: value })}
              min={0}
              max={100}
              className="flex-1"
              disabled={individualCorners}
            />
            <div className="relative">
              <input
                type="number"
                value={style.borderRadius || 0}
                onChange={(e) => updateStyle({ borderRadius: Math.max(0, Math.min(100, Number(e.target.value))) })}
                className={`w-[4.5rem] pl-3 pr-8 py-1 bg-gray-50 text-gray-800 text-sm rounded border border-gray-200 appearance-none focus:outline-none focus:border-blue-500 text-right ${
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
      )}
      
      {/* Blend Mode */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">Blend</label>
        <BlendModeSelector
          value={style.blendMode}
          onChange={(blendMode: BlendMode) => updateStyle({ blendMode })}
        />
      </div>
      
      {/* Actions */}
      <div>
        <button
          onClick={() => {
            const newLocked = !firstShapeElement.locked
            shapeElements.forEach(el => {
              updateElement(currentSlide.id, el.id, { locked: newLocked })
            })
          }}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            firstShapeElement.locked
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {firstShapeElement.locked ? (
            <>
              <Lock className="w-4 h-4" />
              Locked {shapeElements.length > 1 && `(${shapeElements.length})`}
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Unlocked {shapeElements.length > 1 && `(${shapeElements.length})`}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
