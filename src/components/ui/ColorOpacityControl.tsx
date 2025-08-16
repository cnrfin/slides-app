// src/components/ui/ColorOpacityControl.tsx
import { useState, useEffect, useRef } from 'react'
import { Pipette } from 'lucide-react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import type { ElementStyle } from '@/types/slide.types'
import useSlideStore from '@/stores/slideStore'
import { TabGroup } from './TabGroup'

interface ColorOpacityControlProps {
  style: ElementStyle
  opacity: number
  colorType?: 'fill' | 'stroke' | 'text'
  onChange: (updates: Partial<ElementStyle>) => void
  onOpacityChange: (opacity: number) => void
  className?: string
  disableGradient?: boolean // Option to disable gradient for specific instances
}

type ColorMode = 'solid' | 'gradient'

export default function ColorOpacityControl({
  style,
  opacity,
  colorType = 'fill',
  onChange,
  onOpacityChange,
  className = '',
  disableGradient = false
}: ColorOpacityControlProps) {
  // Determine color mode based on style
  const hasGradient = !disableGradient && (style.gradientStart && style.gradientEnd)
    
  const [colorMode, setColorMode] = useState<ColorMode>(hasGradient ? 'gradient' : 'solid')
  const [showPicker, setShowPicker] = useState(false)
  const [isPickingColor, setIsPickingColor] = useState(false)
  
  // Initialize opacity value - ensure 0 is handled correctly
  const initialOpacity = opacity ?? 1
  const [opacityInputValue, setOpacityInputValue] = useState(() => {
    const percentage = Math.round(initialOpacity * 100)
    return percentage.toString()
  })
  const [gradientStops, setGradientStops] = useState([
    { 
      color: style.gradientStart || 
             (colorType === 'text' ? (style.color || '#000000') :
              colorType === 'stroke' ? (style.borderColor || '#000000') :
              (style.backgroundColor || '#cccccc')),
      position: style.gradientStartPosition || 0 
    },
    { 
      color: style.gradientEnd || '#ffffff', 
      position: style.gradientEndPosition || 100 
    }
  ])
  const [activeGradientStop, setActiveGradientStop] = useState<'start' | 'end'>('start')
  const [gradientAngle, setGradientAngle] = useState(style.gradientAngle || 0)
  const [isDragging, setIsDragging] = useState(false)
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const colorControlRef = useRef<HTMLDivElement>(null)
  
  // Get canvas element from the slide store
  const canvasContainer = useSlideStore((state) => state.canvasContainer)
  
  // Don't auto-update from prop changes after initial mount to avoid conflicts
  // The local state should be the source of truth while editing
  
  // Update gradient stops when style changes
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
  }, [style.gradientStart, style.gradientEnd, style.gradientAngle, style.gradientStartPosition, style.gradientEndPosition])
  
  // Use refs to avoid stale closures
  const gradientStopsRef = useRef(gradientStops)
  gradientStopsRef.current = gradientStops
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
      document.body.classList.remove('dragging-gradient-stop')
    }
  }, [])
  
  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.color-picker-container') && !colorControlRef.current?.contains(target)) {
        setShowPicker(false)
      }
    }
    
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])
  
  // Get current color based on type and mode
  const getCurrentColor = () => {
    if (colorMode === 'gradient') {
      return `linear-gradient(${gradientAngle}deg, ${gradientStops[0].color} ${gradientStops[0].position}%, ${gradientStops[1].color} ${gradientStops[1].position}%)`
    }
    
    if (colorType === 'text') return style.color || '#000000'
    if (colorType === 'stroke') return style.borderColor || '#000000'
    return style.backgroundColor || '#cccccc'
  }
  
  // Get hex value for display
  const getHexValue = () => {
    if (colorMode === 'gradient') {
      return gradientStops[activeGradientStop === 'start' ? 0 : 1].color.toUpperCase()
    }
    
    const color = colorType === 'text' ? style.color :
                 colorType === 'stroke' ? style.borderColor :
                 style.backgroundColor
    return (color || '#CCCCCC').toUpperCase()
  }
  
  // Handle opacity input change
  const handleOpacityInputChange = (value: string) => {
    // Always update the display value immediately
    setOpacityInputValue(value)
    
    // Only update the actual opacity if we have a valid number
    const trimmed = value.trim()
    if (trimmed !== '' && trimmed !== '-') {
      const numValue = parseInt(trimmed, 10)
      if (!isNaN(numValue)) {
        // Clamp between 0 and 100
        const clamped = Math.max(0, Math.min(100, numValue))
        onOpacityChange(clamped / 100)
      }
    }
  }
  
  // Handle opacity input blur
  const handleOpacityInputBlur = () => {
    let finalValue: number
    
    if (opacityInputValue === '' || opacityInputValue === undefined) {
      finalValue = 0
    } else {
      const numValue = parseInt(opacityInputValue, 10)
      if (isNaN(numValue) || numValue < 0) {
        finalValue = 0
      } else if (numValue > 100) {
        finalValue = 100
      } else {
        finalValue = numValue
      }
    }
    
    // Update both the input display and the actual opacity
    setOpacityInputValue(finalValue.toString())
    onOpacityChange(finalValue / 100)
  }
  
  // Start color picker mode (simplified without magnifying glass)
  const startColorPicker = () => {
    setIsPickingColor(true)
    
    // Find canvas element
    let canvas: HTMLCanvasElement | null = null
    
    // Try to find Konva canvas
    const allCanvases = document.querySelectorAll('canvas')
    
    // Find the Konva canvas (usually the largest one or the one inside konvajs-content)
    for (const c of Array.from(allCanvases)) {
      const parent = c.parentElement
      if (parent?.classList.contains('konvajs-content') || 
          (c.width > 100 && c.height > 100)) { // Likely the main canvas
        canvas = c as HTMLCanvasElement
        break
      }
    }
    
    if (!canvas) {
      console.error('Could not find canvas')
      setIsPickingColor(false)
      return
    }
    
    // Change cursor to crosshair
    document.body.style.cursor = 'crosshair'
    canvas.style.cursor = 'crosshair'
    document.body.classList.add('color-picking')
    
    const handleClick = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Check if click is on canvas
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        return
      }
      
      e.preventDefault()
      e.stopPropagation()
      
      const ctx = canvas!.getContext('2d')
      if (!ctx) return
      
      // Calculate canvas coordinates
      const scaleX = canvas!.width / rect.width
      const scaleY = canvas!.height / rect.height
      const canvasX = Math.floor(x * scaleX)
      const canvasY = Math.floor(y * scaleY)
      
      try {
        const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data
        const r = pixel[0]
        const g = pixel[1]
        const b = pixel[2]
        
        // Convert to hex
        const toHex = (n: number) => n.toString(16).padStart(2, '0')
        const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`
        
        // Update color
        if (colorMode === 'gradient' && colorType === 'fill') {
          const newStops = [...gradientStops]
          if (activeGradientStop === 'start') {
            newStops[0].color = hexColor
          } else {
            newStops[1].color = hexColor
          }
          setGradientStops(newStops)
          onChange({
            gradientStart: newStops[0].color,
            gradientEnd: newStops[1].color,
            gradientAngle: gradientAngle
          })
        } else {
          if (colorType === 'text') {
            onChange({ color: hexColor })
          } else if (colorType === 'stroke') {
            onChange({ borderColor: hexColor })
          } else {
            onChange({ backgroundColor: hexColor })
          }
        }
        
        // End color picker
        cleanup()
      } catch (error) {
        console.error('Error picking color:', error)
      }
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup()
      }
    }
    
    const cleanup = () => {
      setIsPickingColor(false)
      document.body.style.cursor = ''
      document.body.classList.remove('color-picking')
      if (canvas) {
        canvas.style.cursor = ''
        canvas.style.outline = ''
      }
      
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousemove', handleMouseMove)
    }
    
    // Visual feedback on hover
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const isOverCanvas = e.clientX >= rect.left && e.clientX <= rect.right &&
                          e.clientY >= rect.top && e.clientY <= rect.bottom
      
      // Add outline to canvas when hovering
      if (isOverCanvas) {
        canvas.style.outline = '2px solid #3b82f6'
        canvas.style.outlineOffset = '-2px'
      } else {
        canvas.style.outline = ''
        canvas.style.outlineOffset = ''
      }
    }
    
    // Add event listeners
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousemove', handleMouseMove)
  }
  
  // Throttled update for gradient dragging
  const throttledGradientUpdate = (newStops: typeof gradientStops) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    setGradientStops(newStops)
    gradientStopsRef.current = newStops
    
    updateTimeoutRef.current = setTimeout(() => {
      const updates: Partial<ElementStyle> = {
        gradientStart: newStops[0].color,
        gradientEnd: newStops[1].color,
        gradientStartPosition: newStops[0].position,
        gradientEndPosition: newStops[1].position,
        gradientAngle: gradientAngle
      }
      if (colorType === 'text') {
        updates.color = undefined
      } else if (colorType === 'stroke') {
        updates.borderColor = undefined
      } else {
        updates.backgroundColor = undefined
      }
      onChange(updates)
    }, 50)
  }
  
  return (
    <div className={`${className}`}>
      {/* Combined Color and Opacity Row */}
      <div 
        ref={colorControlRef}
        className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          if (!isPickingColor) setShowPicker(!showPicker)
        }}
      >
        {/* Color Preview */}
        <div 
          className="w-5 h-5 rounded border border-gray-300 flex-shrink-0"
          style={{ background: getCurrentColor() }}
        />
        
        {/* Hex Value */}
        <span className="text-xs font-mono text-gray-700 flex-grow">
          {getHexValue()}
        </span>
        
        {/* Opacity */}
        <span className="text-xs text-gray-600">
          {opacityInputValue}%
        </span>
      </div>
      
      {/* Color Picker Popup */}
      {showPicker && (
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 color-picker-container w-56 overflow-hidden"
          style={{
            ...(colorControlRef.current && (() => {
              const rect = colorControlRef.current.getBoundingClientRect()
              const pickerWidth = 224 // 14rem = 224px
              const pickerHeight = colorMode === 'gradient' ? 420 : 320
              const spacing = 8
              
              // Check if there's enough space to the left
              const spaceLeft = rect.left
              const spaceRight = window.innerWidth - rect.right
              const spaceAbove = rect.top
              const spaceBelow = window.innerHeight - rect.bottom
              
              let position = {}
              
              // Try to position to the left first
              if (spaceLeft >= pickerWidth + spacing) {
                // Position to the left
                position = {
                  right: `${window.innerWidth - rect.left + spacing}px`,
                  top: `${Math.min(rect.top, window.innerHeight - pickerHeight - spacing)}px`
                }
              } else if (spaceRight >= pickerWidth + spacing) {
                // Position to the right if no space on left
                position = {
                  left: `${rect.right + spacing}px`,
                  top: `${Math.min(rect.top, window.innerHeight - pickerHeight - spacing)}px`
                }
              } else if (spaceAbove >= pickerHeight + spacing) {
                // Position above if no horizontal space
                position = {
                  left: `${Math.max(spacing, Math.min(rect.left, window.innerWidth - pickerWidth - spacing))}px`,
                  bottom: `${window.innerHeight - rect.top + spacing}px`
                }
              } else {
                // Position below as last resort
                position = {
                  left: `${Math.max(spacing, Math.min(rect.left, window.innerWidth - pickerWidth - spacing))}px`,
                  top: `${rect.bottom + spacing}px`
                }
              }
              
              return position
            })())
          }}
        >
            {/* Color Mode Tabs - Show for all color types unless disabled */}
            {!disableGradient && (
              <div className="p-2 border-b border-gray-200">
                <TabGroup
                  tabs={[
                    { 
                      id: 'solid', 
                      label: 'Solid',
                      onClick: () => {
                        setColorMode('solid')
                        const solidUpdates: Partial<ElementStyle> = {
                          gradientStart: undefined,
                          gradientEnd: undefined,
                          gradientAngle: undefined,
                          gradientStartPosition: undefined,
                          gradientEndPosition: undefined
                        }
                        if (colorType === 'text') {
                          solidUpdates.color = gradientStops[0].color
                        } else if (colorType === 'stroke') {
                          solidUpdates.borderColor = gradientStops[0].color
                        } else {
                          solidUpdates.backgroundColor = gradientStops[0].color
                        }
                        onChange(solidUpdates)
                      }
                    },
                    { 
                      id: 'gradient', 
                      label: 'Gradient',
                      onClick: () => {
                        setColorMode('gradient')
                        const currentColor = colorType === 'text' ? (style.color || '#000000') :
                                          colorType === 'stroke' ? (style.borderColor || '#000000') :
                                          (style.backgroundColor || '#cccccc')
                        setGradientStops([
                          { color: currentColor, position: 0 },
                          { color: '#ffffff', position: 100 }
                        ])
                        const gradientUpdates: Partial<ElementStyle> = {
                          gradientStart: currentColor,
                          gradientEnd: '#ffffff',
                          gradientStartPosition: 0,
                          gradientEndPosition: 100,
                          gradientAngle: 0
                        }
                        if (colorType === 'text') {
                          gradientUpdates.color = undefined
                        } else if (colorType === 'stroke') {
                          gradientUpdates.borderColor = undefined
                        } else {
                          gradientUpdates.backgroundColor = undefined
                        }
                        onChange(gradientUpdates)
                      }
                    }
                  ]}
                  activeTab={colorMode}
                  onTabChange={() => {}}
                />
              </div>
            )}
            
            {/* Gradient Controls */}
            {colorMode === 'gradient' && !disableGradient && (
              <div className="p-3 border-b border-gray-200">
                {/* Gradient Preview with Stops */}
                <div 
                  className="relative h-10 rounded-lg overflow-visible mb-3 cursor-pointer select-none"
                  style={{ 
                    background: `linear-gradient(${gradientAngle}deg, ${gradientStops[0].color} ${gradientStops[0].position}%, ${gradientStops[1].color} ${gradientStops[1].position}%)` 
                  }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    const position = (x / rect.width) * 100
                    
                    const clickedOnStop = Math.abs(position - gradientStops[0].position) < 5 || 
                                        Math.abs(position - gradientStops[1].position) < 5
                    if (!clickedOnStop) {
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
                      e.preventDefault()
                      setActiveGradientStop('start')
                      setIsDragging(true)
                      
                      const rect = e.currentTarget.parentElement!.getBoundingClientRect()
                      const startX = e.clientX
                      const startPosition = gradientStopsRef.current[0].position
                      
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
                        
                        if (updateTimeoutRef.current) {
                          clearTimeout(updateTimeoutRef.current)
                        }
                        
                        const finalStops = gradientStopsRef.current
                        const updates: Partial<ElementStyle> = {
                          gradientStart: finalStops[0].color,
                          gradientEnd: finalStops[1].color,
                          gradientStartPosition: finalStops[0].position,
                          gradientEndPosition: finalStops[1].position,
                          gradientAngle: gradientAngle
                        }
                        if (colorType === 'text') {
                          updates.color = undefined
                        } else if (colorType === 'stroke') {
                          updates.borderColor = undefined
                        } else {
                          updates.backgroundColor = undefined
                        }
                        onChange(updates)
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
                      e.preventDefault()
                      setActiveGradientStop('end')
                      setIsDragging(true)
                      
                      const rect = e.currentTarget.parentElement!.getBoundingClientRect()
                      const startX = e.clientX
                      const startPosition = gradientStopsRef.current[1].position
                      
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
                        
                        if (updateTimeoutRef.current) {
                          clearTimeout(updateTimeoutRef.current)
                        }
                        
                        const finalStops = gradientStopsRef.current
                        onChange({ 
                          gradientStart: finalStops[0].color,
                          gradientEnd: finalStops[1].color,
                          gradientStartPosition: finalStops[0].position,
                          gradientEndPosition: finalStops[1].position,
                          gradientAngle: gradientAngle,
                          backgroundColor: undefined
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
                          e.preventDefault()
                          const rect = e.currentTarget.getBoundingClientRect()
                          const centerX = rect.left + rect.width / 2
                          const centerY = rect.top + rect.height / 2
                          
                          const updateAngle = (clientX: number, clientY: number) => {
                            const angle = Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI + 90
                            const normalizedAngle = ((angle % 360) + 360) % 360
                            setGradientAngle(Math.round(normalizedAngle))
                            const updates: Partial<ElementStyle> = {
                              gradientAngle: Math.round(normalizedAngle),
                              gradientStart: gradientStops[0].color,
                              gradientEnd: gradientStops[1].color
                            }
                            if (colorType === 'text') {
                              updates.color = undefined
                            } else if (colorType === 'stroke') {
                              updates.borderColor = undefined
                            } else {
                              updates.backgroundColor = undefined
                            }
                            onChange(updates)
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
                        const updates: Partial<ElementStyle> = {
                          gradientAngle: angle,
                          gradientStart: gradientStops[0].color,
                          gradientEnd: gradientStops[1].color
                        }
                        if (colorType === 'text') {
                          updates.color = undefined
                        } else if (colorType === 'stroke') {
                          updates.borderColor = undefined
                        } else {
                          updates.backgroundColor = undefined
                        }
                        onChange(updates)
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
                      const updates: Partial<ElementStyle> = {
                        gradientStart: newStops[0].color,
                        gradientEnd: newStops[1].color
                      }
                      if (colorType === 'text') {
                        updates.color = undefined
                      } else if (colorType === 'stroke') {
                        updates.borderColor = undefined
                      } else {
                        updates.backgroundColor = undefined
                      }
                      onChange(updates)
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
            )}
            
            {/* Color Picker */}
            <div className="p-3">
              {colorMode === 'gradient' && !disableGradient && (
                <div className="mb-2 text-xs font-medium text-gray-600">
                  {activeGradientStop === 'start' ? 'Start Color' : 'End Color'}
                </div>
              )}
              <div className="gradient-picker-wrapper" style={{ width: '100%' }}>
                <HexColorPicker
                  color={
                    colorMode === 'gradient' ? 
                      (activeGradientStop === 'start' ? gradientStops[0].color : gradientStops[1].color) :
                      (colorType === 'text' ? (style.color || '#000000') :
                       colorType === 'stroke' ? (style.borderColor || '#000000') :
                       (style.backgroundColor || '#cccccc'))
                  }
                  onChange={(color) => {
                    if (colorMode === 'gradient' && !disableGradient) {
                      const newStops = [...gradientStops]
                      if (activeGradientStop === 'start') {
                        newStops[0].color = color
                      } else {
                        newStops[1].color = color
                      }
                      setGradientStops(newStops)
                      const updates: Partial<ElementStyle> = {
                        gradientStart: newStops[0].color,
                        gradientEnd: newStops[1].color,
                        gradientAngle: gradientAngle
                      }
                      if (colorType === 'text') {
                        updates.color = undefined
                      } else if (colorType === 'stroke') {
                        updates.borderColor = undefined
                      } else {
                        updates.backgroundColor = undefined
                      }
                      onChange(updates)
                    } else {
                      if (colorType === 'text') {
                        onChange({ color, gradientStart: undefined, gradientEnd: undefined })
                      } else if (colorType === 'stroke') {
                        onChange({ borderColor: color })
                      } else {
                        onChange({ backgroundColor: color, gradientStart: undefined, gradientEnd: undefined })
                      }
                    }
                  }}
                />
              </div>
              
              {/* Color Input Row with Dropper, Hex, and Opacity */}
              <div className="mt-2 flex items-center gap-1">
                {/* Color Dropper Button - 30x30px */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    startColorPicker()
                  }}
                  className={`w-[30px] h-[30px] flex items-center justify-center rounded border transition-colors flex-shrink-0 ${
                    isPickingColor 
                      ? 'bg-blue-50 border-blue-500 text-blue-600 hover:bg-blue-100' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Pick color from canvas"
                >
                  <Pipette className="w-4 h-4" />
                </button>
                
                {/* Hex Input */}
                <HexColorInput
                  color={
                    colorMode === 'gradient' ? 
                      (activeGradientStop === 'start' ? gradientStops[0].color : gradientStops[1].color) :
                      (colorType === 'text' ? (style.color || '#000000') :
                       colorType === 'stroke' ? (style.borderColor || '#000000') :
                       (style.backgroundColor || '#cccccc'))
                  }
                  onChange={(color) => {
                    if (colorMode === 'gradient' && !disableGradient) {
                      const newStops = [...gradientStops]
                      if (activeGradientStop === 'start') {
                        newStops[0].color = color
                      } else {
                        newStops[1].color = color
                      }
                      setGradientStops(newStops)
                      const updates: Partial<ElementStyle> = {
                        gradientStart: newStops[0].color,
                        gradientEnd: newStops[1].color,
                        gradientAngle: gradientAngle
                      }
                      if (colorType === 'text') {
                        updates.color = undefined
                      } else if (colorType === 'stroke') {
                        updates.borderColor = undefined
                      } else {
                        updates.backgroundColor = undefined
                      }
                      onChange(updates)
                    } else {
                      if (colorType === 'text') {
                        onChange({ color, gradientStart: undefined, gradientEnd: undefined })
                      } else if (colorType === 'stroke') {
                        onChange({ borderColor: color })
                      } else {
                        onChange({ backgroundColor: color, gradientStart: undefined, gradientEnd: undefined })
                      }
                    }
                  }}
                  className="flex-1 min-w-0 px-2 py-1.5 bg-gray-50 text-gray-800 text-xs rounded border border-gray-200 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  prefixed
                />
                
                {/* Opacity Input */}
                <input
                  type="number"
                  value={opacityInputValue}
                  onChange={(e) => handleOpacityInputChange(e.target.value)}
                  onBlur={handleOpacityInputBlur}
                  onFocus={(e) => e.target.select()}
                  className="w-10 px-1 py-1.5 bg-gray-50 text-gray-800 text-xs text-center rounded border border-gray-200 focus:outline-none focus:border-blue-500 flex-shrink-0"
                  min="0"
                  max="100"
                  step="1"
                />
                <span className="text-xs text-gray-600 flex-shrink-0">%</span>
              </div>
            </div>
        </div>
      )}
    </div>
  )
}
