// src/components/properties/TextPropertiesPanel.tsx
import { useState, useEffect, useRef, useMemo } from 'react'
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
  Grid3x3,
  ChevronDown,
  Plus,
  Minus,
  Rows,
  MoveHorizontal,
  Lock,
  Unlock
} from 'lucide-react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import useSlideStore from '@/stores/slideStore'
import { useSelectedElements, useCurrentSlide } from '@/stores/slideStore'
import type { TextContent, ElementStyle } from '@/types/slide.types'
import { measureAutoText } from '@/utils/text.utils'

interface TextPropertiesPanelProps {
  className?: string
}

// Common fonts available in most systems
const FONT_FAMILIES = [
  { name: 'Custom', value: 'Inter' },
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

const FONT_SIZES = [8, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96]

type ColorMode = 'solid' | 'gradient' | 'image'

export default function TextPropertiesPanel({ className = '' }: TextPropertiesPanelProps) {
  const selectedElements = useSelectedElements()
  const currentSlide = useCurrentSlide()
  const updateElement = useSlideStore((state) => state.updateElement)
  
  const textElement = selectedElements.find(el => el.type === 'text')
  const textContent = textElement?.content as TextContent | undefined
  const style = textElement?.style || {}
  
  const [colorMode, setColorMode] = useState<ColorMode>(
    style.gradientStart && style.gradientEnd ? 'gradient' : 'solid'
  )
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showGradientPicker, setShowGradientPicker] = useState(false)
  const [gradientStops, setGradientStops] = useState([
    { color: style.gradientStart || '#0c8ce9', position: style.gradientStartPosition || 0 },
    { color: style.gradientEnd || '#ffffff', position: style.gradientEndPosition || 100 }
  ])
  const [activeGradientStop, setActiveGradientStop] = useState<'start' | 'end'>('start')
  const [gradientAngle, setGradientAngle] = useState(style.gradientAngle || 0)
  const [isDragging, setIsDragging] = useState(false)
  const [opacityValue, setOpacityValue] = useState(Math.round((textElement?.opacity || 1) * 100))
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Update opacity value when element changes
  useEffect(() => {
    setOpacityValue(Math.round((textElement?.opacity || 1) * 100))
  }, [textElement?.id, textElement?.opacity])
  
  // Update color mode when switching elements
  useEffect(() => {
    if (style.gradientStart && style.gradientEnd) {
      setColorMode('gradient')
      setGradientStops([
        { color: style.gradientStart, position: style.gradientStartPosition || 0 },
        { color: style.gradientEnd, position: style.gradientEndPosition || 100 }
      ])
      setGradientAngle(style.gradientAngle || 0)
    } else {
      setColorMode('solid')
    }
  }, [textElement?.id, style.gradientStart, style.gradientEnd, style.gradientAngle, style.gradientStartPosition, style.gradientEndPosition])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
      document.body.classList.remove('dragging-gradient-stop')
    }
  }, [])
  

  
  // Close color pickers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.color-picker-container')) {
        setShowColorPicker(false)
        setShowGradientPicker(false)
      }
    }
    
    if (showColorPicker || showGradientPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker, showGradientPicker])
  
  // If no text element is selected, return null
  if (!textElement || !currentSlide) {
    return null
  }
  
  // Use refs to avoid stale closures
  const gradientStopsRef = useRef(gradientStops)
  gradientStopsRef.current = gradientStops
  
  // Throttled update for gradient dragging
  const throttledGradientUpdate = (newStops: typeof gradientStops) => {
    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    // Update local state immediately for smooth UI
    setGradientStops(newStops)
    gradientStopsRef.current = newStops // Keep ref in sync
    
    // Throttle store updates to every 50ms
    updateTimeoutRef.current = setTimeout(() => {
      updateStyle({ 
        gradientStart: newStops[0].color,
        gradientEnd: newStops[1].color,
        gradientStartPosition: newStops[0].position,
        gradientEndPosition: newStops[1].position,
        gradientAngle: gradientAngle,
        color: undefined
      }, true) // Skip text measurement for gradient updates
    }, 50)
  }
  
  const updateStyle = (updates: Partial<ElementStyle>, skipMeasure = false) => {
    const newStyle = { ...style, ...updates }
    updateElement(currentSlide.id, textElement.id, { style: newStyle })
    
    // Remeasure text if font properties changed (skip for gradient-only updates)
    if (!skipMeasure && (updates.fontSize || updates.fontFamily || updates.lineHeight || updates.letterSpacing || updates.listStyle !== undefined)) {
      // Add bullets to text if enabled
      let textToMeasure = textContent?.text || ''
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
        width: textElement.width, // Keep current width
        padding: 0
      })
      
      // Update height based on wrapped text
      updateElement(currentSlide.id, textElement.id, { 
        height: dimensions.height 
      })
    }
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
  
  const formatLineHeight = (value: number) => {
    return `${Math.round(value * 100)}%`
  }
  
  const formatLetterSpacing = (value: number) => {
    return value === 0 ? '0%' : `${value > 0 ? '+' : ''}${Math.round(value * 100)}%`
  }
  
  const formatOpacity = (value: number) => {
    return `${Math.round(value * 100)}%`
  }
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-800 font-medium flex items-center gap-2">
            <Type className="w-4 h-4" />
            Text
          </h3>
          <button
            onClick={() => {
              // Lock/unlock all selected elements
              selectedElements.forEach(el => {
                updateElement(currentSlide.id, el.id, { locked: !textElement.locked })
              })
            }}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
            title={
              selectedElements.length > 1
                ? textElement.locked 
                  ? `Unlock ${selectedElements.length} selected elements` 
                  : `Lock ${selectedElements.length} selected elements`
                : textElement.locked 
                  ? "Unlock element" 
                  : "Lock element"
            }
          >
            {textElement.locked ? (
              <Lock className="w-4 h-4 text-gray-600" />
            ) : (
              <Unlock className="w-4 h-4 text-gray-600" />
            )}
            {selectedElements.length > 1 && (
              <span className="text-xs text-gray-600 font-medium">
                {selectedElements.length}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Font Family */}
      <div className="space-y-2 py-3">
        <div className="relative">
          <select
            value={style.fontFamily || 'Inter'}
            onChange={(e) => updateStyle({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 bg-white text-gray-800 rounded-lg border border-gray-200 appearance-none cursor-pointer hover:bg-gray-50 focus:outline-none focus:border-blue-500"
          >
            {FONT_FAMILIES.map(font => (
              <option key={font.value} value={font.value}>
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
              {FONT_WEIGHTS.map(weight => (
                <option key={weight.value} value={weight.value}>
                  {weight.name}
                </option>
              ))}
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
      <div className="grid grid-cols-2 gap-3 pb-3">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
          <Rows className="w-4 h-4 text-gray-500" />
          <input
            type="number"
            value={Math.round((style.lineHeight || 1.2) * 100)}
            onChange={(e) => updateStyle({ lineHeight: Number(e.target.value) / 100 })}
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
            onChange={(e) => updateStyle({ letterSpacing: Number(e.target.value) / 100 })}
            className="flex-1 bg-transparent text-gray-800 text-sm outline-none"
            min="-50"
            max="200"
            step="1"
          />
          <span className="text-gray-500 text-xs">%</span>
        </div>
      </div>
      
      {/* Text Style Buttons */}
      <div className="flex gap-2 pb-3">
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
      <div className="grid grid-cols-3 gap-2 pb-3">
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
      
      {/* Fill Section */}
      <div className="pt-3 border-t border-gray-200">
        <h4 className="text-gray-800 text-sm font-medium mb-3">Fill</h4>
        
        {/* Color Mode Selector */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => {
              setColorMode('solid')
              setShowGradientPicker(false)
            }}
            className={`p-2 rounded-lg transition-colors ${
              colorMode === 'solid'
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Solid Color"
          >
            <Palette className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              setColorMode('gradient')
              setShowColorPicker(false)
            }}
            className={`p-2 rounded-lg transition-colors ${
              colorMode === 'gradient'
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Gradient"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Color Picker */}
        {colorMode === 'solid' && (
          <div className="space-y-2">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full h-10 rounded-lg border border-gray-200 relative overflow-hidden hover:border-gray-300 transition-colors"
                style={{ 
                  background: style.gradientStart && style.gradientEnd ? 
                    `linear-gradient(to right, ${style.gradientStart}, ${style.gradientEnd})` : 
                    style.color || '#000000' 
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
              </button>
              
              {showColorPicker && (
                <div className="relative">
                  <div className="absolute top-12 right-0 z-50 p-3 bg-white rounded-lg shadow-xl border border-gray-200 color-picker-container">
                    <div className="gradient-picker-wrapper">
                      <HexColorPicker
                        color={style.color || '#000000'}
                        onChange={(color) => updateStyle({ 
                          color,
                          gradientStart: undefined,
                          gradientEnd: undefined
                        })}
                      />
                    </div>
                    <HexColorInput
                      color={style.color || '#000000'}
                      onChange={(color) => updateStyle({ 
                        color,
                        gradientStart: undefined,
                        gradientEnd: undefined
                      })}
                      className="mt-2 w-full px-2 py-1 bg-gray-50 text-gray-800 text-sm rounded border border-gray-200 focus:outline-none focus:border-blue-500"
                      prefixed
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {colorMode === 'gradient' && (
          <div className="space-y-2">
            <button
              onClick={() => setShowGradientPicker(!showGradientPicker)}
              className="w-full h-10 rounded-lg border border-gray-200 relative overflow-hidden hover:border-gray-300 transition-colors"
              style={{ 
                background: `linear-gradient(${gradientAngle}deg, ${gradientStops[0].color} ${gradientStops[0].position}%, ${gradientStops[1].color} ${gradientStops[1].position}%)` 
              }}
            />
            
            {/* Integrated Gradient Picker */}
            {showGradientPicker && (
              <div className="relative">
                <div className="absolute top-2 right-0 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-72 color-picker-container select-none">
                  {/* Gradient Preview with Stops */}
                  <div className="p-4 border-b border-gray-200">
                    <div 
                      className="relative h-10 rounded-lg overflow-visible mb-3 cursor-pointer select-none"
                      style={{ 
                        background: `linear-gradient(${gradientAngle}deg, ${gradientStops[0].color} ${gradientStops[0].position}%, ${gradientStops[1].color} ${gradientStops[1].position}%)` 
                      }}
                      onClick={(e) => {
                        // Add new color stop when clicking on gradient bar
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = e.clientX - rect.left
                        const position = (x / rect.width) * 100
                        
                        // Only add if not clicking on existing stops
                        const clickedOnStop = Math.abs(position - gradientStops[0].position) < 5 || 
                                            Math.abs(position - gradientStops[1].position) < 5
                        if (!clickedOnStop) {
                          // For now, just select the closest stop
                          const distToStart = Math.abs(position - gradientStops[0].position)
                          const distToEnd = Math.abs(position - gradientStops[1].position)
                          setActiveGradientStop(distToStart < distToEnd ? 'start' : 'end')
                        }
                      }}
                    >
                      {/* Start Color Stop */}
                      <div
                        className={`absolute top-1/2 w-5 h-5 rounded-full shadow-lg cursor-grab active:cursor-grabbing transition-[ring,transform] ${
                          activeGradientStop === 'start' 
                            ? 'ring-2 ring-blue-500 ring-offset-1 scale-110 z-10' 
                            : 'ring-1 ring-gray-300 hover:ring-gray-400'
                        }`}
                        style={{ 
                          left: `${gradientStops[0].position}%`,
                          transform: `translate(-50%, -50%)`,
                          backgroundColor: gradientStops[0].color,
                          border: '2px solid white'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          e.preventDefault() // Prevent text selection
                          setActiveGradientStop('start')
                          setIsDragging(true)
                          
                          const rect = e.currentTarget.parentElement!.getBoundingClientRect()
                          const startX = e.clientX
                          const startPosition = gradientStopsRef.current[0].position
                          
                          // Prevent text selection during drag
                          document.body.classList.add('dragging-gradient-stop')
                          
                          const handleMouseMove = (e: MouseEvent) => {
                            e.preventDefault()
                            const deltaX = e.clientX - startX
                            const deltaPercent = (deltaX / rect.width) * 100
                            const newPosition = Math.max(0, Math.min(100, startPosition + deltaPercent))
                            
                            const newStops = [
                              { ...gradientStopsRef.current[0], position: newPosition },
                              gradientStopsRef.current[1]
                            ]
                            
                            throttledGradientUpdate(newStops)
                          }
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove)
                            document.removeEventListener('mouseup', handleMouseUp)
                            document.body.style.cursor = ''
                            document.body.classList.remove('dragging-gradient-stop')
                            setIsDragging(false)
                            
                            // Clear any pending throttled update
                            if (updateTimeoutRef.current) {
                              clearTimeout(updateTimeoutRef.current)
                            }
                            
                            // Commit the final position to the store immediately
                            const finalStops = gradientStopsRef.current
                            updateStyle({ 
                              gradientStart: finalStops[0].color,
                              gradientEnd: finalStops[1].color,
                              gradientStartPosition: finalStops[0].position,
                              gradientEndPosition: finalStops[1].position,
                              gradientAngle: gradientAngle,
                              color: undefined
                            })
                          }
                          
                          document.body.style.cursor = 'grabbing'
                          document.addEventListener('mousemove', handleMouseMove)
                          document.addEventListener('mouseup', handleMouseUp)
                        }}
                      />
                      
                      {/* End Color Stop */}
                      <div
                        className={`absolute top-1/2 w-5 h-5 rounded-full shadow-lg cursor-grab active:cursor-grabbing transition-[ring,transform] ${
                          activeGradientStop === 'end' 
                            ? 'ring-2 ring-blue-500 ring-offset-1 scale-110 z-10' 
                            : 'ring-1 ring-gray-300 hover:ring-gray-400'
                        }`}
                        style={{ 
                          left: `${gradientStops[1].position}%`,
                          transform: `translate(-50%, -50%)`,
                          backgroundColor: gradientStops[1].color,
                          border: '2px solid white'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          e.preventDefault() // Prevent text selection
                          setActiveGradientStop('end')
                          setIsDragging(true)
                          
                          const rect = e.currentTarget.parentElement!.getBoundingClientRect()
                          const startX = e.clientX
                          const startPosition = gradientStopsRef.current[1].position
                          
                          // Prevent text selection during drag
                          document.body.classList.add('dragging-gradient-stop')
                          
                          const handleMouseMove = (e: MouseEvent) => {
                            e.preventDefault()
                            const deltaX = e.clientX - startX
                            const deltaPercent = (deltaX / rect.width) * 100
                            const newPosition = Math.max(0, Math.min(100, startPosition + deltaPercent))
                            
                            const newStops = [
                              gradientStopsRef.current[0],
                              { ...gradientStopsRef.current[1], position: newPosition }
                            ]
                            
                            throttledGradientUpdate(newStops)
                          }
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove)
                            document.removeEventListener('mouseup', handleMouseUp)
                            document.body.style.cursor = ''
                            document.body.classList.remove('dragging-gradient-stop')
                            setIsDragging(false)
                            
                            // Clear any pending throttled update
                            if (updateTimeoutRef.current) {
                              clearTimeout(updateTimeoutRef.current)
                            }
                            
                            // Commit the final position to the store immediately
                            const finalStops = gradientStopsRef.current
                            updateStyle({ 
                              gradientStart: finalStops[0].color,
                              gradientEnd: finalStops[1].color,
                              gradientStartPosition: finalStops[0].position,
                              gradientEndPosition: finalStops[1].position,
                              gradientAngle: gradientAngle,
                              color: undefined
                            })
                          }
                          
                          document.body.style.cursor = 'grabbing'
                          document.addEventListener('mousemove', handleMouseMove)
                          document.addEventListener('mouseup', handleMouseUp)
                        }}
                      />
                    </div>
                    
                    {/* Gradient Controls */}
                    <div className="flex items-center justify-between gap-3">
                      {/* Angle Control */}
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10 select-none">
                          <div
                            className="w-full h-full rounded-full border-2 border-gray-300 bg-white relative overflow-hidden hover:border-gray-400 transition-colors cursor-pointer"
                            onMouseDown={(e) => {
                              e.preventDefault() // Prevent text selection
                              const rect = e.currentTarget.getBoundingClientRect()
                              const centerX = rect.left + rect.width / 2
                              const centerY = rect.top + rect.height / 2
                              
                              const updateAngle = (clientX: number, clientY: number) => {
                                const angle = Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI + 90
                                const normalizedAngle = ((angle % 360) + 360) % 360
                                setGradientAngle(Math.round(normalizedAngle))
                                updateStyle({ 
                                  gradientAngle: Math.round(normalizedAngle),
                                  gradientStart: gradientStops[0].color,
                                  gradientEnd: gradientStops[1].color,
                                  color: undefined
                                })
                              }
                              
                              updateAngle(e.clientX, e.clientY)
                              
                              const handleMouseMove = (e: MouseEvent) => {
                                updateAngle(e.clientX, e.clientY)
                              }
                              
                              const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove)
                                document.removeEventListener('mouseup', handleMouseUp)
                              }
                              
                              document.addEventListener('mousemove', handleMouseMove)
                              document.addEventListener('mouseup', handleMouseUp)
                            }}
                          >
                            <div 
                              className="absolute inset-1 rounded-full opacity-50"
                              style={{ 
                                background: `conic-gradient(from 0deg, ${gradientStops[0].color}, ${gradientStops[1].color}, ${gradientStops[0].color})` 
                              }}
                            />
                            <div 
                              className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-gray-700 origin-bottom pointer-events-none"
                              style={{ 
                                transform: `translate(-50%, -100%) rotate(${gradientAngle}deg)`
                              }}
                            />
                            <div 
                              className="absolute top-1/2 left-1/2 w-2 h-2 bg-white border border-gray-400 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            />
                          </div>
                        </div>
                        <input
                          type="number"
                          value={gradientAngle}
                          onChange={(e) => {
                            const angle = parseInt(e.target.value) || 0
                            setGradientAngle(angle)
                            updateStyle({ 
                              gradientAngle: angle,
                              gradientStart: gradientStops[0].color,
                              gradientEnd: gradientStops[1].color,
                              color: undefined
                            })
                          }}
                          className="w-12 px-1 py-1 text-sm text-center border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                          min="0"
                          max="360"
                        />
                      </div>
                      
                      {/* Flip Colors Button */}
                      <button
                        onClick={() => {
                          const newStops = [
                            { ...gradientStops[0], color: gradientStops[1].color },
                            { ...gradientStops[1], color: gradientStops[0].color }
                          ]
                          setGradientStops(newStops)
                          updateStyle({ 
                            gradientStart: newStops[0].color,
                            gradientEnd: newStops[1].color,
                            color: undefined
                          })
                        }}
                        className="p-2 rounded hover:bg-gray-100 transition-colors"
                        title="Flip gradient colors"
                      >
                        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 16 16" fill="none">
                          <path 
                            d="M1 8H15M1 8L4 5M1 8L4 11M15 8L12 5M15 8L12 11" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Color Picker Area */}
                  <div className="p-4">
                    <div className="mb-2 text-xs font-medium text-gray-600">
                      {activeGradientStop === 'start' ? 'Start Color' : 'End Color'}
                    </div>
                    <div className="gradient-picker-wrapper">
                      <HexColorPicker
                        color={activeGradientStop === 'start' ? gradientStops[0].color : gradientStops[1].color}
                        onChange={(color) => {
                          const newStops = [...gradientStops]
                          if (activeGradientStop === 'start') {
                            newStops[0].color = color
                          } else {
                            newStops[1].color = color
                          }
                          setGradientStops(newStops)
                          updateStyle({ 
                            gradientStart: newStops[0].color,
                            gradientEnd: newStops[1].color,
                            gradientAngle: gradientAngle,
                            color: undefined
                          })
                        }}
                      />
                    </div>
                    <HexColorInput
                      color={activeGradientStop === 'start' ? gradientStops[0].color : gradientStops[1].color}
                      onChange={(color) => {
                        const newStops = [...gradientStops]
                        if (activeGradientStop === 'start') {
                          newStops[0].color = color
                        } else {
                          newStops[1].color = color
                        }
                        setGradientStops(newStops)
                        updateStyle({ 
                          gradientStart: newStops[0].color,
                          gradientEnd: newStops[1].color,
                          gradientAngle: gradientAngle,
                          color: undefined
                        })
                      }}
                      className="mt-3 w-full px-3 py-2 bg-gray-50 text-gray-800 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                      prefixed
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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
              updateElement(currentSlide.id, textElement.id, { 
                opacity: value / 100 
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
                updateElement(currentSlide.id, textElement.id, { 
                  opacity: value / 100 
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
    </div>
  )
}
