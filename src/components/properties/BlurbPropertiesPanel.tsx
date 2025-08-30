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
  ChevronDown,
  Lock,
  Unlock,
  ChevronsUpDown,
  ChevronsLeftRight,
  Scan
} from 'lucide-react'
import useSlideStore from '@/stores/slideStore'
import { useSelectedElements, useCurrentSlide } from '@/stores/slideStore'
import type { BlurbContent, ElementStyle, BlendMode } from '@/types/slide.types'
import { FONTS, getAvailableWeights, isWeightAvailable, getClosestAvailableWeight } from '@/utils/fonts.config'
import CircularTailSelector from './CircularTailSelector'
import BlendModeSelector from './BlendModeSelector'
import EffectsControls from './EffectsControls'

import { ColorOpacityControl, CustomSlider } from '@/components/ui'

interface BlurbPropertiesPanelProps {
  className?: string
}



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
  
  const [opacityValue, setOpacityValue] = useState(Math.round((firstBlurbElement?.opacity || 1) * 100))
  const [cornerRadiusValue, setCornerRadiusValue] = useState(style.borderRadius || 25)
  const [individualCorners, setIndividualCorners] = useState(false)
  const [cornerValues, setCornerValues] = useState({
    topLeft: style.borderRadius || 25,
    topRight: style.borderRadius || 25,
    bottomLeft: style.borderRadius || 25,
    bottomRight: style.borderRadius || 25
  })
  
  // Refs for drag functionality
  const lineHeightDragRef = useRef<{ startY: number; startValue: number } | null>(null)
  const letterSpacingDragRef = useRef<{ startY: number; startValue: number } | null>(null)
  
  // Update values when element changes
  useEffect(() => {
    setOpacityValue(Math.round((firstBlurbElement?.opacity || 1) * 100))
    const radius = style.borderRadius || 25
    setCornerRadiusValue(radius)
    
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
  }, [firstBlurbElement?.id, firstBlurbElement?.opacity, style.borderRadius, style.borderRadiusCorners])
  
  if (blurbElements.length === 0 || !currentSlide) return null
  
  const handleStyleChange = (updates: Partial<ElementStyle>) => {
    // Check if font family is changing
    if (updates.fontFamily && updates.fontFamily !== style.fontFamily) {
      // Check if current weight is available for new font
      const currentWeight = style.fontWeight || '400'
      if (!isWeightAvailable(updates.fontFamily, currentWeight)) {
        // Auto-select closest available weight
        updates.fontWeight = getClosestAvailableWeight(updates.fontFamily, currentWeight)
      }
    }
    
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
  
  const handleOpacityChange = (opacity: number) => {
    setOpacityValue(Math.round(opacity * 100))
    // Update all selected blurb elements
    blurbElements.forEach(element => {
      updateElement(currentSlide.id, element.id, { opacity })
    })
  }
  
  const handleCornerRadiusChange = (value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setCornerRadiusValue(numValue)
      setCornerValues({
        topLeft: numValue,
        topRight: numValue,
        bottomLeft: numValue,
        bottomRight: numValue
      })
      handleStyleChange({ borderRadius: numValue })
    }
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
      handleStyleChange({ 
        borderRadiusCorners: cornerRadiusString // Store individual corners
      })
    }
  }
  
  const toggleIndividualCorners = () => {
    const newState = !individualCorners
    setIndividualCorners(newState)
    
    if (newState) {
      // When turning on individual corners, initialize with the current borderRadius value
      const currentRadius = cornerRadiusValue
      const newValues = {
        topLeft: currentRadius,
        topRight: currentRadius,
        bottomLeft: currentRadius,
        bottomRight: currentRadius
      }
      setCornerValues(newValues)
      
      // Store individual corner values
      const cornerRadiusString = `${newValues.topLeft} ${newValues.topRight} ${newValues.bottomRight} ${newValues.bottomLeft}`
      handleStyleChange({ 
        borderRadiusCorners: cornerRadiusString
      })
    } else {
      // When turning off individual corners, clear the borderRadiusCorners property
      // Keep the current borderRadius value (don't change it)
      handleStyleChange({ 
        borderRadiusCorners: undefined // Clear individual corners
      })
    }
  }
  
  const isLocked = blurbElements.every(el => el.locked)
  
  // Handle drag for line height
  const handleLineHeightDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    const startValue = Math.round((style.lineHeight || 1.2) * 100)
    lineHeightDragRef.current = { startY: e.clientY, startValue }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!lineHeightDragRef.current) return
      const deltaY = lineHeightDragRef.current.startY - e.clientY
      const newValue = Math.max(50, Math.min(300, lineHeightDragRef.current.startValue + Math.round(deltaY / 2)))
      handleStyleChange({ lineHeight: newValue / 100 })
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
      handleStyleChange({ letterSpacing: newValue / 100 })
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
    <div className={`${className}`}>
      {/* Tail Position - New Circular Selector */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">Tail Position</label>
        <CircularTailSelector
          value={blurbContent?.tailPosition || 'bottom-center'}
          onChange={(position) => handleContentChange({ tailPosition: position })}
        />
      </div>
      
      {/* Text Label */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block">Text</label>
      </div>
      
      {/* Font Family */}
      <div className="pb-3">
        <div className="relative">
          <select
            value={style.fontFamily || 'Arial, sans-serif'}
            onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 bg-white text-gray-800 text-sm rounded-lg border border-gray-200 appearance-none hover:bg-gray-50 focus:outline-none focus:border-blue-500 pr-10"
          >
            {FONTS.map(font => (
              <option key={font.family} value={font.family} style={{ fontFamily: font.family }}>
                {font.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
      
      {/* Font Weight and Size */}
      <div className="pb-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">Weight</label>
            <div className="relative">
              <select
                value={style.fontWeight || '400'}
                onChange={(e) => handleStyleChange({ fontWeight: e.target.value })}
                className="w-full px-3 py-2 bg-white text-gray-800 text-sm rounded-lg border border-gray-200 appearance-none hover:bg-gray-50 focus:outline-none focus:border-blue-500 pr-10"
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
      </div>
      
      {/* Line Height and Letter Spacing */}
      <div className="pb-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Line Height</label>
            <div className="relative">
              <input
                type="number"
                value={Math.round((style.lineHeight || 1.2) * 100)}
                onChange={(e) => handleStyleChange({ lineHeight: Number(e.target.value) / 100 })}
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
            <label className="block text-xs text-gray-600 mb-1">Spacing</label>
            <div className="relative">
              <input
                type="number"
                value={Math.round((style.letterSpacing || 0) * 100)}
                onChange={(e) => handleStyleChange({ letterSpacing: Number(e.target.value) / 100 })}
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
      </div>
      
      {/* Style Section */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">Style</label>
        
        {/* Text Style Buttons */}
        <div className="flex gap-2 mb-2">
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
      
      {/* Text Color */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">Text</label>
        <ColorOpacityControl
          style={style}
          opacity={firstBlurbElement?.opacity || 1}
          colorType="text"
          onChange={handleStyleChange}
          onOpacityChange={handleOpacityChange}
          disableGradient={true}
        />
      </div>
      
      {/* Fill */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">Fill</label>
        <ColorOpacityControl
          style={style}
          opacity={firstBlurbElement?.opacity || 1}
          colorType="fill"
          onChange={handleStyleChange}
          onOpacityChange={handleOpacityChange}
          disableGradient={true}
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
            value={cornerRadiusValue}
            onChange={(value) => handleCornerRadiusChange(value.toString())}
            min={0}
            max={100}
            className="flex-1"
            disabled={individualCorners}
          />
          <div className="relative">
            <input
              type="number"
              value={cornerRadiusValue}
              onChange={(e) => handleCornerRadiusChange(e.target.value)}
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
      
      {/* Blend Mode */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">Blend</label>
        <BlendModeSelector
          value={style.blendMode}
          onChange={(blendMode: BlendMode) => handleStyleChange({ blendMode })}
        />
      </div>
      
      {/* Effects */}
      <EffectsControls
        style={style}
        onChange={handleStyleChange}
        showBlur={true}
        showDropShadow={true}
      />
      

      
      {/* Actions */}
      <div>
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
