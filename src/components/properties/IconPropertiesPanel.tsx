// src/components/properties/IconPropertiesPanel.tsx
import React, { useState, useRef } from 'react'
import { Sparkles, Palette, Lock, Unlock } from 'lucide-react'
import type { SlideElement, IconContent } from '@/types/slide.types'
import useSlideStore from '@/stores/slideStore'
import BlendModeSelector from './BlendModeSelector'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import { getIconPath } from '@/utils/icon.utils'

interface IconPropertiesPanelProps {
  element: SlideElement
}

export default function IconPropertiesPanel({ element }: IconPropertiesPanelProps) {
  const currentSlide = useSlideStore((state) => state.slides.find(s => s.id === state.currentSlideId))
  const updateElement = useSlideStore((state) => state.updateElement)
  const iconContent = element.content as IconContent
  
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [opacityValue, setOpacityValue] = useState(Math.round((element.opacity || 1) * 100))
  const colorButtonRef = useRef<HTMLButtonElement>(null)
  
  // Close color picker on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.color-picker-container')) {
        setShowColorPicker(false)
      }
    }
    
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker])
  
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
  
  const handleOpacityChange = (value: number) => {
    if (!currentSlide) return
    setOpacityValue(value)
    updateElement(currentSlide.id, element.id, { opacity: value / 100 })
  }
  
  // Check if the icon should be filled based on its properties
  const iconData = getIconPath(iconContent.iconId)
  const isFilledIcon = iconData.filled === true
  
  return (
    <div className="space-y-1">
      {/* Color */}
      <div>
        <h4 className="text-gray-800 text-sm font-medium mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Color
        </h4>
        <div className="relative">
          <button
            ref={colorButtonRef}
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full h-10 rounded-lg border border-gray-200 relative overflow-hidden hover:border-gray-300 transition-colors"
            style={{ 
              background: element.style?.color || '#000000'
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
          </button>
          
          {showColorPicker && (
            <div className="relative">
              <div 
                className="fixed z-50 p-3 bg-white rounded-lg shadow-xl border border-gray-200 color-picker-container"
                style={{
                  // Use fixed positioning relative to viewport
                  ...(colorButtonRef.current && (() => {
                    const rect = colorButtonRef.current.getBoundingClientRect()
                    const spaceBelow = window.innerHeight - rect.bottom
                    const spaceAbove = rect.top
                    const pickerHeight = 320 // Approximate height
                    const pickerWidth = 280 // Approximate width
                    
                    // Position below if there's enough space, otherwise above
                    if (spaceBelow >= pickerHeight) {
                      return { top: `${rect.bottom + 8}px`, left: `${Math.min(rect.left, window.innerWidth - pickerWidth - 8)}px` }
                    } else if (spaceAbove >= pickerHeight) {
                      return { bottom: `${window.innerHeight - rect.top + 8}px`, left: `${Math.min(rect.left, window.innerWidth - pickerWidth - 8)}px` }
                    } else {
                      // If neither has enough space, position to the left of the button
                      return { top: `${Math.max(8, rect.top)}px`, right: `${window.innerWidth - rect.left + 8}px` }
                    }
                  })())
                }}
              >
                <HexColorPicker
                  color={element.style?.color || '#000000'}
                  onChange={(color) => handleStyleUpdate({ color })}
                />
                <HexColorInput
                  color={element.style?.color || '#000000'}
                  onChange={(color) => handleStyleUpdate({ color })}
                  className="mt-2 w-full px-2 py-1 bg-gray-50 text-gray-800 text-sm rounded border border-gray-200 focus:outline-none focus:border-blue-500"
                  prefixed
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Stroke Width - only show for non-filled icons */}
      {!isFilledIcon && (
        <div className="pt-3 border-t border-gray-200">
          <h4 className="text-gray-800 text-sm font-medium mb-3">Stroke Width</h4>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={element.style?.strokeWidth || 5}
              onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
              className="flex-1 slider-light"
            />
            <div className="relative flex items-center">
              <input
                type="number"
                value={element.style?.strokeWidth || 5}
                onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-white text-gray-800 text-sm rounded border border-gray-200 appearance-none hover:bg-gray-50 focus:outline-none focus:border-blue-500 text-center"
                min="0.5"
                max="20"
                step="0.5"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Opacity */}
      <div className="pt-3 border-t border-gray-200">
        <h4 className="text-gray-800 text-sm font-medium mb-3">Opacity</h4>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={opacityValue}
            onChange={(e) => handleOpacityChange(Number(e.target.value))}
            className="flex-1 slider-light"
          />
          <div className="relative flex items-center gap-1">
            <input
              type="number"
              value={opacityValue}
              onChange={(e) => {
                const value = Math.max(0, Math.min(100, Number(e.target.value)))
                handleOpacityChange(value)
              }}
              className="w-16 px-2 py-1 bg-white text-gray-800 text-sm rounded border border-gray-200 appearance-none hover:bg-gray-50 focus:outline-none focus:border-blue-500 text-center"
              min="0"
              max="100"
              step="1"
            />
            <span className="text-sm text-gray-600">%</span>
          </div>
        </div>
      </div>
      
      {/* Blend Mode */}
      <BlendModeSelector
        value={element.style?.blendMode || 'normal'}
        onChange={(blendMode) => handleStyleUpdate({ blendMode })}
        className="pt-3"
      />
      
      {/* Actions */}
      <div className="pt-4">
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
      
      {/* Icon Info */}
      <div className="pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div>Icon: {iconContent.iconId}</div>
          <div>Type: {iconContent.iconType || 'lucide'}</div>
        </div>
      </div>
    </div>
  )
}