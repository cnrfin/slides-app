// src/components/properties/TextPropertiesPanel.tsx
import { useState, useEffect, useRef } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  ChevronsUpDown,
  ChevronsLeftRight,
  Lock,
  Unlock
} from 'lucide-react'
import useSlideStore from '@/stores/slideStore'
import { useSelectedElements, useCurrentSlide } from '@/stores/slideStore'
import type { TextContent, ElementStyle, BlendMode } from '@/types/slide.types'
import { measureAutoText } from '@/utils/text.utils'
import { loadFont } from '@/utils/font.utils'
import { FONTS, getAvailableWeights, isWeightAvailable, getClosestAvailableWeight } from '@/utils/fonts.config'
import BlendModeSelector from './BlendModeSelector'
import EffectsControls from './EffectsControls'

import { ColorOpacityControl } from '@/components/ui'

interface TextPropertiesPanelProps {
  className?: string
}

// Text type presets
const TEXT_TYPES = [
  { name: 'Title', value: 'title', fontSize: 32, fontWeight: '700' },
  { name: 'Subtitle', value: 'subtitle', fontSize: 24, fontWeight: '600' },
  { name: 'Body', value: 'body', fontSize: 16, fontWeight: '400' },
  { name: 'Small', value: 'small', fontSize: 12, fontWeight: '400' },
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

export default function TextPropertiesPanel({ className = '' }: TextPropertiesPanelProps) {
  const selectedElements = useSelectedElements()
  const currentSlide = useCurrentSlide()
  const updateElement = useSlideStore((state) => state.updateElement)
  
  // Refs for drag functionality
  const lineHeightDragRef = useRef<{ startY: number; startValue: number } | null>(null)
  const letterSpacingDragRef = useRef<{ startY: number; startValue: number } | null>(null)
  
  // Get all selected text elements
  const textElements = selectedElements.filter(el => el.type === 'text')
  const firstTextElement = textElements[0]
  const textContent = firstTextElement?.content as TextContent | undefined
  const style = firstTextElement?.style || {}
  
  const [opacityValue, setOpacityValue] = useState(Math.round((firstTextElement?.opacity || 1) * 100))
  
  // Update opacity value when element changes
  useEffect(() => {
    setOpacityValue(Math.round((firstTextElement?.opacity || 1) * 100))
  }, [firstTextElement?.id, firstTextElement?.opacity])
  
  // If no text elements are selected, return null
  if (textElements.length === 0 || !currentSlide) {
    return null
  }
  
  const updateStyle = async (updates: Partial<ElementStyle>, skipMeasure = false) => {
    // Check if font family is changing
    if (updates.fontFamily && updates.fontFamily !== style.fontFamily) {
      // Check if current weight is available for new font
      const currentWeight = style.fontWeight || '400'
      if (!isWeightAvailable(updates.fontFamily, currentWeight)) {
        // Auto-select closest available weight
        updates.fontWeight = getClosestAvailableWeight(updates.fontFamily, currentWeight)
      }
    }
    
    // Load font if font family changed
    if (updates.fontFamily) {
      await loadFont(updates.fontFamily, updates.fontWeight || style.fontWeight || '400')
    }
    
    // Update all selected text elements
    textElements.forEach(element => {
      const elementStyle = element.style || {}
      const newStyle = { ...elementStyle, ...updates }
      
      updateElement(currentSlide.id, element.id, { style: newStyle })
      
      // Remeasure text if font properties changed (skip for gradient-only updates)
      if (!skipMeasure && (updates.fontSize || updates.fontFamily || updates.lineHeight || updates.letterSpacing || updates.listStyle !== undefined)) {
        const elementContent = element.content as TextContent
        // Add bullets to text if enabled
        let textToMeasure = elementContent?.text || ''
        if (newStyle.listStyle === 'bullet') {
          const lines = textToMeasure.split('\n')
          textToMeasure = lines.map(line => line.trim() ? `• ${line}` : line).join('\n')
        }
        
        const dimensions = measureAutoText({
          text: textToMeasure,
          fontSize: newStyle.fontSize || 16,
          fontFamily: newStyle.fontFamily || 'Arial',
          lineHeight: newStyle.lineHeight || 1.2,
          letterSpacing: newStyle.letterSpacing || 0,
          width: element.width, // Keep current width
          padding: 0
        })
        
        // Update height based on wrapped text
        updateElement(currentSlide.id, element.id, { 
          height: dimensions.height 
        })
      }
    })
  }
  
  const handleOpacityChange = (opacity: number) => {
    setOpacityValue(Math.round(opacity * 100))
    // Update all selected text elements
    textElements.forEach(element => {
      updateElement(currentSlide.id, element.id, { opacity })
    })
  }
  
  const toggleBold = () => {
    const isBold = style.fontWeight === 'bold' || style.fontWeight === '700'
    updateStyle({ fontWeight: isBold ? '400' : '700' })
  }
  
  const toggleItalic = () => {
    const isItalic = style.fontStyle === 'italic'
    updateStyle({ fontStyle: isItalic ? 'normal' : 'italic' })
  }
  
  const toggleUnderline = () => {
    const isUnderlined = style.textDecoration === 'underline'
    updateStyle({ textDecoration: isUnderlined ? 'none' : 'underline' })
  }
  
  const toggleBullets = () => {
    const hasBullets = style.listStyle === 'bullet'
    updateStyle({ listStyle: hasBullets ? 'none' : 'bullet' })
  }
  
  // Get current text type based on style
  const getCurrentTextType = () => {
    const matchingType = TEXT_TYPES.find(
      type => type.fontSize === style.fontSize && type.fontWeight === style.fontWeight
    )
    return matchingType?.value || 'body' // Default to body if no match
  }
  
  const handleTextTypeChange = (typeValue: string) => {
    const type = TEXT_TYPES.find(t => t.value === typeValue)
    if (type) {
      updateStyle({ fontSize: type.fontSize, fontWeight: type.fontWeight })
    }
  }
  
  // Handle drag for line height
  const handleLineHeightDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    const startValue = Math.round((style.lineHeight || 1.2) * 100)
    lineHeightDragRef.current = { startY: e.clientY, startValue }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!lineHeightDragRef.current) return
      const deltaY = lineHeightDragRef.current.startY - e.clientY
      const newValue = Math.max(50, Math.min(300, lineHeightDragRef.current.startValue + Math.round(deltaY / 2)))
      updateStyle({ lineHeight: newValue / 100 })
    }
    
    const handleMouseUp = () => {
      lineHeightDragRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  // Handle drag for letter spacing
  const handleLetterSpacingDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    const startValue = Math.round((style.letterSpacing || 0) * 100)
    letterSpacingDragRef.current = { startY: e.clientY, startValue }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!letterSpacingDragRef.current) return
      const deltaY = letterSpacingDragRef.current.startY - e.clientY
      const newValue = Math.max(-50, Math.min(200, letterSpacingDragRef.current.startValue + Math.round(deltaY / 2)))
      updateStyle({ letterSpacing: newValue / 100 })
    }
    
    const handleMouseUp = () => {
      letterSpacingDragRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  return (
    <div className={`space-y-1 ${className}`}>
      {/* Text Type */}
      <div className="space-y-2 pb-3">
        <label className="text-xs text-gray-600 block">Type</label>
        <div className="relative">
          <select
            value={getCurrentTextType()}
            onChange={(e) => handleTextTypeChange(e.target.value)}
            className="w-full px-3 py-2 bg-white text-gray-800 rounded-lg border border-gray-200 appearance-none cursor-pointer hover:bg-gray-50 focus:outline-none focus:border-blue-500 text-sm"
          >
            {TEXT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>
      
      {/* Font Family */}
      <div className="space-y-2 pb-3">
        <label className="text-xs text-gray-600 block">Font</label>
        <div className="relative">
          <select
            value={style.fontFamily || 'Arial, sans-serif'}
            onChange={(e) => updateStyle({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 bg-white text-gray-800 rounded-lg border border-gray-200 appearance-none cursor-pointer hover:bg-gray-50 focus:outline-none focus:border-blue-500 text-sm"
          >
            {FONTS.map(font => (
              <option key={font.family} value={font.family} style={{ fontFamily: font.family }}>
                {font.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>
      
      {/* Weight and Size */}
      <div className="grid grid-cols-2 gap-2 pb-3">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Weight</label>
          <div className="relative">
            <select
              value={style.fontWeight || '400'}
              onChange={(e) => updateStyle({ fontWeight: e.target.value })}
              className="w-full px-3 py-2 bg-white text-gray-800 rounded-lg border border-gray-200 appearance-none cursor-pointer hover:bg-gray-50 focus:outline-none focus:border-blue-500 text-sm"
            >
              {FONT_WEIGHTS.map(weight => {
                const isAvailable = isWeightAvailable(style.fontFamily || 'Arial, sans-serif', weight.value)
                return (
                  <option 
                    key={weight.value} 
                    value={weight.value}
                    disabled={!isAvailable}
                  >
                    {weight.name}
                  </option>
                )
              })}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
          </div>
        </div>
        
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Size</label>
          <div className="relative">
            <select
              value={style.fontSize || 16}
              onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-white text-gray-800 rounded-lg border border-gray-200 appearance-none cursor-pointer hover:bg-gray-50 focus:outline-none focus:border-blue-500 text-sm"
            >
              {FONT_SIZES.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      {/* Line Height and Letter Spacing */}
      <div className="grid grid-cols-2 gap-2 pb-3">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Line Height</label>
          <div className="relative">
            <input
              type="number"
              value={Math.round((style.lineHeight || 1.2) * 100)}
              onChange={(e) => updateStyle({ lineHeight: Number(e.target.value) / 100 })}
              className="w-full px-3 py-2 pr-8 bg-white text-gray-800 rounded-lg border border-gray-200 appearance-none focus:outline-none focus:border-blue-500 text-sm"
              min="50"
              max="300"
              step="10"
            />
            <ChevronsUpDown 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-ns-resize hover:text-gray-600 transition-colors"
              onMouseDown={handleLineHeightDragStart}
            />
          </div>
        </div>
        
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Spacing</label>
          <div className="relative">
            <input
              type="number"
              value={Math.round((style.letterSpacing || 0) * 100)}
              onChange={(e) => updateStyle({ letterSpacing: Number(e.target.value) / 100 })}
              className="w-full px-3 py-2 pr-8 bg-white text-gray-800 rounded-lg border border-gray-200 appearance-none focus:outline-none focus:border-blue-500 text-sm"
              min="-50"
              max="200"
              step="1"
            />
            <ChevronsLeftRight 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-ns-resize hover:text-gray-600 transition-colors"
              onMouseDown={handleLetterSpacingDragStart}
            />
          </div>
        </div>
      </div>
      
      {/* Style Section */}
      <div className="space-y-2 pb-3">
        <label className="text-xs text-gray-600 block">Style</label>
        
        {/* Text Style Buttons */}
        <div className="flex gap-2">
          <button
            onClick={toggleBold}
            className={`flex-1 p-2 rounded-lg transition-colors ${
              style.fontWeight === '700' || style.fontWeight === 'bold'
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bold className="w-4 h-4 mx-auto" />
          </button>
          
          <button
            onClick={toggleItalic}
            className={`flex-1 p-2 rounded-lg transition-colors ${
              style.fontStyle === 'italic'
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Italic className="w-4 h-4 mx-auto" />
          </button>
          
          <button
            onClick={toggleUnderline}
            className={`flex-1 p-2 rounded-lg transition-colors ${
              style.textDecoration === 'underline'
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Underline className="w-4 h-4 mx-auto" />
          </button>
          
          <button
            onClick={toggleBullets}
            className={`flex-1 p-2 rounded-lg transition-colors ${
              style.listStyle === 'bullet'
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4 mx-auto" />
          </button>
        </div>
        
        {/* Alignment */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => updateStyle({ textAlign: 'left' })}
            className={`p-2 rounded-lg transition-colors ${
              style.textAlign === 'left' || !style.textAlign
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <AlignLeft className="w-4 h-4 mx-auto" />
          </button>
          
          <button
            onClick={() => updateStyle({ textAlign: 'center' })}
            className={`p-2 rounded-lg transition-colors ${
              style.textAlign === 'center'
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <AlignCenter className="w-4 h-4 mx-auto" />
          </button>
          
          <button
            onClick={() => updateStyle({ textAlign: 'right' })}
            className={`p-2 rounded-lg transition-colors ${
              style.textAlign === 'right'
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <AlignRight className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
      
      {/* Color with integrated Opacity */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">
          Color
          {firstTextElement?.metadata?.colorSource === 'auto' && (
            <span className="ml-2 text-xs text-blue-500">(Auto-adjusted)</span>
          )}
        </label>
        <ColorOpacityControl
          style={style}
          opacity={firstTextElement?.opacity || 1}
          colorType="text"
          onChange={(updates) => {
            // Mark color as user-set when manually changed
            if (updates.color || updates.gradientStart || updates.gradientEnd) {
              textElements.forEach(element => {
                updateElement(currentSlide.id, element.id, {
                  style: {
                    ...element.style,  // Preserve existing style properties
                    ...updates         // Apply only the color updates
                  },
                  metadata: {
                    ...element.metadata,
                    colorSource: 'user',
                    originalColor: updates.color || style.color
                  }
                })
              })
            } else {
              updateStyle(updates, true)
            }
          }}
          onOpacityChange={handleOpacityChange}
        />
      </div>
      
      {/* Blend Mode */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">Blend</label>
        <BlendModeSelector
          value={style.blendMode}
          onChange={(blendMode: BlendMode) => updateStyle({ blendMode })}
        />
      </div>
      
      {/* Effects */}
      <EffectsControls
        style={style}
        onChange={updateStyle}
        showBlur={true}
        showDropShadow={true}
      />
      

      
      {/* Actions */}
      <div>
        <button
          onClick={() => {
            const newLocked = !firstTextElement.locked
            textElements.forEach(el => {
              updateElement(currentSlide.id, el.id, { locked: newLocked })
            })
          }}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            firstTextElement.locked
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {firstTextElement.locked ? (
            <>
              <Lock className="w-4 h-4" />
              Locked {textElements.length > 1 && `(${textElements.length})`}
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Unlocked {textElements.length > 1 && `(${textElements.length})`}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
