// src/components/properties/IconPropertiesPanel.tsx
import React, { useState } from 'react'
import { Lock, Unlock } from 'lucide-react'
import type { SlideElement, IconContent } from '@/types/slide.types'
import useSlideStore from '@/stores/slideStore'
import BlendModeSelector from './BlendModeSelector'
import EffectsControls from './EffectsControls'
import { ColorOpacityControl, CustomSlider } from '@/components/ui'
import { getIconPath } from '@/utils/icon.utils'

interface IconPropertiesPanelProps {
  element: SlideElement
}

export default function IconPropertiesPanel({ element }: IconPropertiesPanelProps) {
  const currentSlide = useSlideStore((state) => state.slides.find(s => s.id === state.currentSlideId))
  const updateElement = useSlideStore((state) => state.updateElement)
  const iconContent = element.content as IconContent
  
  const [opacityValue, setOpacityValue] = useState(Math.round((element.opacity || 1) * 100))
  
  const handleStyleUpdate = (updates: Partial<typeof element.style>) => {
    if (!currentSlide) return
    updateElement(currentSlide.id, element.id, {
      style: {
        ...element.style,
        ...updates,
      },
    })
  }
  
  const handleStrokeWidthChange = (value: number) => {
    handleStyleUpdate({ strokeWidth: value })
  }
  
  const handleOpacityChange = (opacity: number) => {
    if (!currentSlide) return
    setOpacityValue(Math.round(opacity * 100))
    updateElement(currentSlide.id, element.id, { opacity })
  }
  
  // Check if the icon should be filled based on its properties
  const iconData = getIconPath(iconContent.iconId)
  const isFilledIcon = iconData.filled === true
  
  return (
    <div className="space-y-1">
      {/* Color with integrated Opacity */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">Color</label>
        <ColorOpacityControl
          style={element.style || {}}
          opacity={element.opacity || 1}
          colorType="text"  // Icons use the 'color' property, not 'borderColor'
          onChange={handleStyleUpdate}
          onOpacityChange={handleOpacityChange}
          disableGradient={true}
        />
      </div>
      
      {/* Stroke Width - only show for non-filled icons */}
      {!isFilledIcon && (
        <div className="pb-3">
          <label className="text-xs text-gray-600 block mb-2">Stroke Width</label>
          <div className="flex items-center gap-3">
            <CustomSlider
              value={element.style?.strokeWidth || 5}
              onChange={handleStrokeWidthChange}
              min={0.5}
              max={20}
              step={0.5}
              className="flex-1"
            />
            <div className="relative">
              <input
                type="number"
                value={element.style?.strokeWidth || 5}
                onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
                className="w-[4.5rem] pl-3 pr-8 py-1 bg-gray-50 text-gray-800 text-sm rounded border border-gray-200 appearance-none focus:outline-none focus:border-blue-500 text-right"
                min="0.5"
                max="20"
                step="0.5"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">px</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Blend Mode */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">Blend</label>
        <BlendModeSelector
          value={element.style?.blendMode || 'normal'}
          onChange={(blendMode) => handleStyleUpdate({ blendMode })}
        />
      </div>
      
      {/* Effects */}
      <EffectsControls
        style={element.style || {}}
        onChange={handleStyleUpdate}
        showBlur={true}
        showDropShadow={true}
      />
      
      {/* Actions */}
      <div>
        <button
          onClick={() => {
            if (!currentSlide) return
            updateElement(currentSlide.id, element.id, { locked: !element.locked })
          }}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            element.locked
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {element.locked ? (
            <>
              <Lock className="w-4 h-4" />
              Locked
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Unlocked
            </>
          )}
        </button>
      </div>
    </div>
  )
}
