// src/components/properties/BlurbPropertiesPanel.tsx
import { useState, useEffect, useRef } from 'react'
import { 
  Bold, 
  Italic, 
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Palette,
  ChevronDown,
  Lock,
  Unlock,
  MessageSquare,
  Rows,
  MoveHorizontal
} from 'lucide-react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import useSlideStore from '@/stores/slideStore'
import { useSelectedElements, useCurrentSlide } from '@/stores/slideStore'
import type { BlurbContent, ElementStyle, BlendMode } from '@/types/slide.types'
import CircularTailSelector from './CircularTailSelector'
import BlendModeSelector from './BlendModeSelector'

interface BlurbPropertiesPanelProps {
  className?: string
}

// Common fonts available in most systems
const FONT_FAMILIES = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Helvetica', value: 'Helvetica' },
  { name: 'Times New Roman', value: 'Times New Roman' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Courier New', value: 'Courier New' },
  { name: 'Verdana', value: 'Verdana' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
]

const FONT_WEIGHTS = [
  { name: 'Thin', value: '100' },
  { name: 'Extra Light', value: '200' },
  { name: 'Light', value: '300' },
  { name: 'Regular', value: '400' },
  { name: 'Medium', value: '500' },
  { name: 'Semi Bold', value: '600' },
  { name: 'Bold', value: '700' },
  { name: 'Extra Bold', value: '800' },
  { name: 'Black', value: '900' },
]

const FONT_SIZES = [8, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 64, 72, 96]

export default function BlurbPropertiesPanel({ className = '' }: BlurbPropertiesPanelProps) {
  const selectedElements = useSelectedElements()
  const currentSlide = useCurrentSlide()
  const updateElement = useSlideStore((state) => state.updateElement)
  
  // Get all selected blurb elements
  const blurbElements = selectedElements.filter(el => el.type === 'blurb')
  const firstBlurbElement = blurbElements[0]
  const blurbContent = firstBlurbElement?.content as BlurbContent | undefined
  const style = firstBlurbElement?.style || {}
  
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [showBubbleColorPicker, setShowBubbleColorPicker] = useState(false)
  const [opacityValue, setOpacityValue] = useState(Math.round((firstBlurbElement?.opacity || 1) * 100))
  const [cornerRadiusValue, setCornerRadiusValue] = useState(style.borderRadius || 25)
  const textColorButtonRef = useRef<HTMLButtonElement>(null)
  const bubbleColorButtonRef = useRef<HTMLButtonElement>(null)
  
  // Update values when element changes
  useEffect(() => {
    setOpacityValue(Math.round((firstBlurbElement?.opacity || 1) * 100))
    setCornerRadiusValue(style.borderRadius || 25)
  }, [firstBlurbElement?.id, firstBlurbElement?.opacity, style.borderRadius])
  
  // Close color pickers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.color-picker-container')) {
        setShowTextColorPicker(false)
        setShowBubbleColorPicker(false)
      }
    }
    
    if (showTextColorPicker || showBubbleColorPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTextColorPicker, showBubbleColorPicker])
  
  if (blurbElements.length === 0 || !currentSlide) return null
  
  const handleStyleChange = (updates: Partial<ElementStyle>) => {
    // Update all selected blurb elements
    blurbElements.forEach(element => {
      updateElement(currentSlide.id, element.id, {
        style: {
          ...element.style,
          ...updates
        }
      })
    })
  }
  
  const handleContentChange = (updates: Partial<BlurbContent>) => {
    // Update all selected blurb elements
    blurbElements.forEach(element => {
      const elementContent = element.content as BlurbContent
      updateElement(currentSlide.id, element.id, {
        content: {
          ...elementContent,
          ...updates
        }
      })
    })
  }
  
  const handleOpacityChange = (value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setOpacityValue(numValue)
      // Update all selected blurb elements
      blurbElements.forEach(element => {
        updateElement(currentSlide.id, element.id, {
          opacity: numValue / 100
        })
      })
    }
  }
  
  const handleCornerRadiusChange = (value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      setCornerRadiusValue(numValue)
      handleStyleChange({ borderRadius: numValue })
    }
  }
  
  const isLocked = blurbElements.every(el => el.locked)
  const lockedCount = blurbElements.filter(el => el.locked).length
  
  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
        <MessageSquare className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">
          Speech
          {blurbElements.length > 1 && (
            <span className="text-sm font-normal text-gray-500 ml-2">({blurbElements.length} selected)</span>
          )}
        </h3>
      </div>
      
      {/* Tail Position - New Circular Selector */}
      <div className="pt-4">
        <h4 className="text-gray-800 text-sm font-medium mb-3">Tail Position</h4>
        <CircularTailSelector
          value={blurbContent?.tailPosition || 'bottom-center'}
          onChange={(position) => handleContentChange({ tailPosition: position })}
        />
      </div>
      
      {/* Text Properties */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <h4 className="text-gray-800 text-sm font-medium mb-3">Text</h4>
        
        {/* Font Family */}
        <div className="relative mb-2">
          <select
            value={style.fontFamily || 'Arial'}
            onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 bg-white text-gray-800 text-sm rounded-lg border border-gray-200 appearance-none hover:bg-gray-50 focus:outline-none focus:border-blue-500 pr-10"
          >
            {FONT_FAMILIES.map(font => (
              <option key={font.value} value={font.value}>{font.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        
        {/* Font Weight and Size */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">Weight</label>
            <div className="relative">
              <select
                value={style.fontWeight || '400'}
                onChange={(e) => handleStyleChange({ fontWeight: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-800 text-sm rounded-lg border border-gray-200 appearance-none hover:bg-gray-50 focus:outline-none focus:border-blue-500 pr-10"
              >
                {FONT_WEIGHTS.map(weight => (
                  <option key={weight.value} value={weight.value}>{weight.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Size</label>
            <div className="relative">
              <select
                value={style.fontSize || 16}
                onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value) })}
                className="w-24 px-3 py-2 bg-white text-gray-800 text-sm rounded-lg border border-gray-200 appearance-none hover:bg-gray-50 focus:outline-none focus:border-blue-500 pr-10"
              >
                {FONT_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        
        {/* Line Height and Letter Spacing */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
            <Rows className="w-4 h-4 text-gray-500" />
            <input
              type="number"
              value={Math.round((style.lineHeight || 1.2) * 100)}
              onChange={(e) => handleStyleChange({ lineHeight: Number(e.target.value) / 100 })}
              className="flex-1 bg-transparent text-gray-800 text-sm outline-none"
              min="50"
              max="300"
              step="10"
            />
            <span className="text-gray-500 text-xs">%</span>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
            <MoveHorizontal className="w-4 h-4 text-gray-500" />
            <input
              type="number"
              value={Math.round((style.letterSpacing || 0) * 100)}
              onChange={(e) => handleStyleChange({ letterSpacing: Number(e.target.value) / 100 })}
              className="flex-1 bg-transparent text-gray-800 text-sm outline-none"
              min="-50"
              max="200"
              step="1"
            />
            <span className="text-gray-500 text-xs">%</span>
          </div>
        </div>
        
        {/* Text Style Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => handleStyleChange({ fontWeight: style.fontWeight === '700' ? '400' : '700' })}
            className={`flex-1 p-2 rounded-lg transition-colors ${
              style.fontWeight === '700' 
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4 mx-auto" />
          </button>
          
          <button
            onClick={() => handleStyleChange({ fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' })}
            className={`flex-1 p-2 rounded-lg transition-colors ${
              style.fontStyle === 'italic' 
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4 mx-auto" />
          </button>
          
          <button
            onClick={() => handleStyleChange({ textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline' })}
            className={`flex-1 p-2 rounded-lg transition-colors ${
              style.textDecoration === 'underline' 
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Underline"
          >
            <Underline className="w-4 h-4 mx-auto" />
          </button>
          
          <button
            onClick={() => handleStyleChange({ listStyle: style.listStyle === 'bullet' ? undefined : 'bullet' })}
            className={`flex-1 p-2 rounded-lg transition-colors ${
              style.listStyle === 'bullet' 
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Bullet Points"
          >
            <List className="w-4 h-4 mx-auto" />
          </button>
        </div>
        
        {/* Alignment */}
        <div className="flex gap-2">
          <button
            onClick={() => handleStyleChange({ textAlign: 'left' })}
            className={`flex-1 p-2 rounded-lg transition-colors ${
              style.textAlign === 'left' || !style.textAlign
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <AlignLeft className="w-4 h-4 mx-auto" />
          </button>
          
          <button
            onClick={() => handleStyleChange({ textAlign: 'center' })}
            className={`flex-1 p-2 rounded-lg transition-colors ${
              style.textAlign === 'center' 
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <AlignCenter className="w-4 h-4 mx-auto" />
          </button>
          
          <button
            onClick={() => handleStyleChange({ textAlign: 'right' })}
            className={`flex-1 p-2 rounded-lg transition-colors ${
              style.textAlign === 'right' 
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <AlignRight className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
      
      {/* Colors */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <h4 className="text-gray-800 text-sm font-medium mb-3">Colors</h4>
        
        <div className="flex gap-3">
          {/* Text Color */}
          <div className="relative flex-1">
            <label className="block text-xs text-gray-600 mb-1">Text</label>
            <button
              ref={textColorButtonRef}
              onClick={() => setShowTextColorPicker(!showTextColorPicker)}
              className="w-full h-10 rounded-lg border border-gray-200 relative overflow-hidden hover:border-gray-300 transition-colors"
              style={{ backgroundColor: style.color || '#ffffff' }}
            />
            
            {showTextColorPicker && (
              <div className="relative">
                <div 
                  className="fixed z-50 p-3 bg-white rounded-lg shadow-xl border border-gray-200 color-picker-container"
                  style={{
                    // Use fixed positioning relative to viewport
                    ...(textColorButtonRef.current && (() => {
                      const rect = textColorButtonRef.current.getBoundingClientRect()
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
                    color={style.color || '#ffffff'} 
                    onChange={(color) => handleStyleChange({ color })}
                  />
                  <HexColorInput
                    color={style.color || '#ffffff'}
                    onChange={(color) => handleStyleChange({ color })}
                    className="mt-2 w-full px-2 py-1 bg-gray-50 text-gray-800 text-sm rounded border border-gray-200 focus:outline-none focus:border-blue-500"
                    prefixed
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Fill Color */}
          <div className="relative flex-1">
            <label className="block text-xs text-gray-600 mb-1">Fill</label>
            <button
              ref={bubbleColorButtonRef}
              onClick={() => setShowBubbleColorPicker(!showBubbleColorPicker)}
              className="w-full h-10 rounded-lg border border-gray-200 relative overflow-hidden hover:border-gray-300 transition-colors"
              style={{ backgroundColor: style.backgroundColor || '#3b82f6' }}
            />
            
            {showBubbleColorPicker && (
              <div className="relative">
                <div 
                  className="fixed z-50 p-3 bg-white rounded-lg shadow-xl border border-gray-200 color-picker-container"
                  style={{
                    // Use fixed positioning relative to viewport
                    ...(bubbleColorButtonRef.current && (() => {
                      const rect = bubbleColorButtonRef.current.getBoundingClientRect()
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
                    color={style.backgroundColor || '#3b82f6'} 
                    onChange={(backgroundColor) => handleStyleChange({ backgroundColor })}
                  />
                  <HexColorInput
                    color={style.backgroundColor || '#3b82f6'}
                    onChange={(backgroundColor) => handleStyleChange({ backgroundColor })}
                    className="mt-2 w-full px-2 py-1 bg-gray-50 text-gray-800 text-sm rounded border border-gray-200 focus:outline-none focus:border-blue-500"
                    prefixed
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Corner Radius */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <h4 className="text-gray-800 text-sm font-medium mb-3">Corner Radius</h4>
        <div className="flex items-center gap-3">
          <input
            type="range"
            value={cornerRadiusValue}
            onChange={(e) => handleCornerRadiusChange(e.target.value)}
            className="flex-1 slider-light"
            min="0"
            max="50"
          />
          <div className="relative flex items-center">
            <input
              type="number"
              value={cornerRadiusValue}
              onChange={(e) => handleCornerRadiusChange(e.target.value)}
              className="w-16 px-2 py-1 bg-white text-gray-800 text-sm rounded border border-gray-200 appearance-none hover:bg-gray-50 focus:outline-none focus:border-blue-500 text-center"
              min="0"
              max="50"
            />
          </div>
        </div>
      </div>
      
      {/* Opacity */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <h4 className="text-gray-800 text-sm font-medium mb-3">Opacity</h4>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={opacityValue}
            onChange={(e) => handleOpacityChange(e.target.value)}
            className="flex-1 slider-light"
          />
          <div className="relative flex items-center gap-1">
            <input
              type="number"
              value={opacityValue}
              onChange={(e) => handleOpacityChange(e.target.value)}
              className="w-16 px-2 py-1 bg-white text-gray-800 text-sm rounded border border-gray-200 appearance-none hover:bg-gray-50 focus:outline-none focus:border-blue-500 text-center"
              min="0"
              max="100"
            />
            <span className="text-sm text-gray-600">%</span>
          </div>
        </div>
      </div>
      
      {/* Blend Mode */}
      <BlendModeSelector
        value={style.blendMode}
        onChange={(blendMode: BlendMode) => handleStyleChange({ blendMode })}
        className="pt-4 mt-4"
      />
      
      {/* Actions */}
      <div className="pt-4">
        <button
          onClick={() => {
            const newLocked = !isLocked
            blurbElements.forEach(element => {
              updateElement(currentSlide.id, element.id, {
                locked: newLocked
              })
            })
          }}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            isLocked
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isLocked ? (
            <>
              <Lock className="w-4 h-4" />
              Locked {blurbElements.length > 1 && `(${blurbElements.length})`}
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Unlocked {blurbElements.length > 1 && `(${blurbElements.length})`}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
