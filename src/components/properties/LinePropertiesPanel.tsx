// src/components/properties/LinePropertiesPanel.tsx
import { useState, useEffect, useRef } from 'react'
import { 
  Minus,
  ChevronDown,
  Lock,
  Unlock,
  Circle,
  Square
} from 'lucide-react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import useSlideStore from '@/stores/slideStore'
import { useSelectedElements, useCurrentSlide } from '@/stores/slideStore'
import type { ElementStyle, LineContent } from '@/types/slide.types'

interface LinePropertiesPanelProps {
  className?: string
}

export default function LinePropertiesPanel({ className = '' }: LinePropertiesPanelProps) {
  const selectedElements = useSelectedElements()
  const currentSlide = useCurrentSlide()
  const updateElement = useSlideStore((state) => state.updateElement)
  
  // Get all selected line elements
  const lineElements = selectedElements.filter(el => el.type === 'line')
  const firstLineElement = lineElements[0]
  const lineContent = firstLineElement?.content as LineContent | undefined
  const style = firstLineElement?.style || {}
  
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [opacityValue, setOpacityValue] = useState(Math.round((firstLineElement?.opacity || 1) * 100))
  const colorButtonRef = useRef<HTMLButtonElement>(null)
  
  // Update opacity value when element changes
  useEffect(() => {
    setOpacityValue(Math.round((firstLineElement?.opacity || 1) * 100))
  }, [firstLineElement?.id, firstLineElement?.opacity])
  
  // Close color picker on outside click
  useEffect(() => {
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
  
  // If no line elements are selected, return null
  if (lineElements.length === 0 || !currentSlide || !lineContent) {
    return null
  }
  
  const updateStyle = (updates: Partial<ElementStyle>) => {
    // Update all selected line elements
    lineElements.forEach(element => {
      const newStyle = { ...element.style, ...updates }
      updateElement(currentSlide.id, element.id, { style: newStyle })
    })
  }
  
  const updateContent = (updates: Partial<LineContent>) => {
    // Update all selected line elements
    lineElements.forEach(element => {
      const elementContent = element.content as LineContent
      const newContent = { ...elementContent, ...updates }
      updateElement(currentSlide.id, element.id, { content: newContent })
    })
  }
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="pb-3 border-b border-gray-200">
        <h3 className="text-gray-800 font-medium flex items-center gap-2">
          <Minus className="w-4 h-4" />
          Line
          {lineElements.length > 1 && (
            <span className="text-sm font-normal text-gray-500">({lineElements.length} selected)</span>
          )}
        </h3>
      </div>
      
      {/* Stroke Section */}
      <div className="pt-3">
        <h4 className="text-gray-800 text-sm font-medium mb-3">Stroke</h4>
        
        {/* Color Picker */}
        <div className="space-y-2">
          <div className="relative">
            <button
              ref={colorButtonRef}
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full h-10 rounded-lg border border-gray-200 relative overflow-hidden hover:border-gray-300 transition-colors"
              style={{ 
                background: style.borderColor || '#000000' 
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
                      
                      // Position below if there's enough space, otherwise above
                      if (spaceBelow >= 320) {
                        return { top: `${rect.bottom + 8}px`, left: `${Math.min(rect.left, window.innerWidth - 280)}px` }
                      } else if (spaceAbove >= 320) {
                        return { bottom: `${window.innerHeight - rect.top + 8}px`, left: `${Math.min(rect.left, window.innerWidth - 280)}px` }
                      } else {
                        // If neither has enough space, position to the left of the button
                        return { top: `${Math.max(8, rect.top)}px`, right: `${window.innerWidth - rect.left + 8}px` }
                      }
                    })())
                  }}
                >
                  <HexColorPicker
                    color={style.borderColor || '#000000'}
                    onChange={(color) => updateStyle({ borderColor: color })}
                  />
                  <HexColorInput
                    color={style.borderColor || '#000000'}
                    onChange={(color) => updateStyle({ borderColor: color })}
                    className="mt-2 w-full px-2 py-1 bg-gray-50 text-gray-800 text-sm rounded border border-gray-200 focus:outline-none focus:border-blue-500"
                    prefixed
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Thickness */}
      <div className="pt-3 border-t border-gray-200">
        <h4 className="text-gray-800 text-sm font-medium mb-3">Thickness</h4>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max="20"
            value={style.borderWidth || 2}
            onChange={(e) => updateStyle({ borderWidth: Number(e.target.value) })}
            className="flex-1 slider-light"
          />
          <div className="relative">
            <input
              type="number"
              value={style.borderWidth || 2}
              onChange={(e) => updateStyle({ borderWidth: Math.max(1, Math.min(20, Number(e.target.value))) })}
              className="w-16 px-2 py-1 bg-white text-gray-800 text-sm rounded border border-gray-200 appearance-none hover:bg-gray-50 focus:outline-none focus:border-blue-500"
              min="1"
              max="20"
            />
          </div>
          <span className="text-sm text-gray-600">px</span>
        </div>
      </div>
      
      {/* End Points Style */}
      <div className="pt-3 border-t border-gray-200">
        <h4 className="text-gray-800 text-sm font-medium mb-3">End Points</h4>
        <div className="flex gap-2">
          <button
            onClick={() => updateContent({ lineCap: 'butt' })}
            className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              (lineContent.lineCap || 'round') === 'butt'
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Square"
          >
            <Square className="w-4 h-4" />
            <span className="text-sm">Square</span>
          </button>
          
          <button
            onClick={() => updateContent({ lineCap: 'round' })}
            className={`flex-1 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              (lineContent.lineCap || 'round') === 'round'
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Round"
          >
            <Circle className="w-4 h-4" />
            <span className="text-sm">Round</span>
          </button>
        </div>
      </div>
      
      {/* Opacity */}
      <div className="pt-3 border-t border-gray-200">
        <h4 className="text-gray-800 text-sm font-medium mb-3">Opacity</h4>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={opacityValue}
            onChange={(e) => {
              const value = Number(e.target.value)
              setOpacityValue(value)
              // Update all selected line elements
              lineElements.forEach(element => {
                updateElement(currentSlide.id, element.id, { 
                  opacity: value / 100 
                })
              })
            }}
            className="flex-1 slider-light"
          />
          <div className="relative flex items-center gap-1">
            <input
              type="number"
              value={opacityValue}
              onChange={(e) => {
                const value = Math.max(0, Math.min(100, Number(e.target.value)))
                setOpacityValue(value)
                // Update all selected line elements
                lineElements.forEach(element => {
                  updateElement(currentSlide.id, element.id, { 
                    opacity: value / 100 
                  })
                })
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
      
      {/* Actions */}
      <div className="pt-4">
        <button
          onClick={() => {
            const newLocked = !firstLineElement.locked
            lineElements.forEach(el => {
              updateElement(currentSlide.id, el.id, { locked: newLocked })
            })
          }}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            firstLineElement.locked
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {firstLineElement.locked ? (
            <>
              <Lock className="w-4 h-4" />
              Locked {lineElements.length > 1 && `(${lineElements.length})`}
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Unlocked {lineElements.length > 1 && `(${lineElements.length})`}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
