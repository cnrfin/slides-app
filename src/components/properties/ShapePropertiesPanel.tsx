// src/components/properties/ShapePropertiesPanel.tsx
import { useState, useEffect, useRef } from 'react'
import { 
  Square,
  Circle,
  Palette,
  Grid3x3,
  ChevronDown,
  RectangleHorizontal,
  Lock,
  Unlock,
  Shapes
} from 'lucide-react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import useSlideStore from '@/stores/slideStore'
import { useSelectedElements, useCurrentSlide } from '@/stores/slideStore'
import type { ElementStyle, ShapeContent, BlendMode } from '@/types/slide.types'
import { getShapeById } from '@/utils/svg-shapes'
import BlendModeSelector from './BlendModeSelector'

interface ShapePropertiesPanelProps {
  className?: string
}

type ColorMode = 'solid' | 'gradient'

export default function ShapePropertiesPanel({ className = '' }: ShapePropertiesPanelProps) {
  const selectedElements = useSelectedElements()
  const currentSlide = useCurrentSlide()
  const updateElement = useSlideStore((state) => state.updateElement)
  
  // Get all selected shape elements
  const shapeElements = selectedElements.filter(el => el.type === 'shape')
  const firstShapeElement = shapeElements[0]
  const shapeContent = firstShapeElement?.content as ShapeContent | undefined
  const style = firstShapeElement?.style || {}
  
  const [colorMode, setColorMode] = useState<ColorMode>(
    style.gradientStart && style.gradientEnd ? 'gradient' : 'solid'
  )
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showGradientPicker, setShowGradientPicker] = useState(false)
  const [gradientStops, setGradientStops] = useState([
    { color: style.gradientStart || style.backgroundColor || '#cccccc', position: style.gradientStartPosition || 0 },
    { color: style.gradientEnd || '#ffffff', position: style.gradientEndPosition || 100 }
  ])
  const [activeGradientStop, setActiveGradientStop] = useState<'start' | 'end'>('start')
  const [gradientAngle, setGradientAngle] = useState(style.gradientAngle || 0)
  const [isDragging, setIsDragging] = useState(false)
  const [opacityValue, setOpacityValue] = useState(Math.round((firstShapeElement?.opacity || 1) * 100))
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const solidColorButtonRef = useRef<HTMLButtonElement>(null)
  const gradientColorButtonRef = useRef<HTMLButtonElement>(null)
  
  // Use refs to avoid stale closures
  const gradientStopsRef = useRef(gradientStops)
  gradientStopsRef.current = gradientStops
  
  // Update opacity value when element changes
  useEffect(() => {
    setOpacityValue(Math.round((firstShapeElement?.opacity || 1) * 100))
  }, [firstShapeElement?.id, firstShapeElement?.opacity])
  
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
  }, [firstShapeElement?.id, style.gradientStart, style.gradientEnd, style.gradientAngle, style.gradientStartPosition, style.gradientEndPosition])
  
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
  
  // If no shape elements are selected, return null
  if (shapeElements.length === 0 || !currentSlide) {
    return null
  }
  
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
        backgroundColor: undefined
      })
    }, 50)
  }
  
  const updateStyle = (updates: Partial<ElementStyle>) => {
    // Update all selected shape elements
    shapeElements.forEach(element => {
      const newStyle = { ...element.style, ...updates }
      updateElement(currentSlide.id, element.id, { style: newStyle })
    })
  }
  
  const getShapeIcon = () => {
    if (shapeContent?.shape === 'circle') {
      return <Circle className="w-4 h-4" />
    } else if (shapeContent?.shape === 'svg' && shapeContent.svgId) {
      const svgShape = getShapeById(shapeContent.svgId)
      if (svgShape) {
        return (
          <svg width="16" height="16" viewBox={svgShape.viewBox || '0 0 100 100'} className="w-4 h-4">
            <path d={svgShape.path} fill="currentColor" />
          </svg>
        )
      }
      return <Shapes className="w-4 h-4" />
    }
    return <Square className="w-4 h-4" />
  }
  
  const getShapeName = () => {
    if (shapeContent?.shape === 'circle') {
      return 'Circle'
    } else if (shapeContent?.shape === 'svg' && shapeContent.svgId) {
      const svgShape = getShapeById(shapeContent.svgId)
      return svgShape?.name || 'SVG Shape'
    }
    return 'Rectangle'
  }
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="pb-3 border-b border-gray-200">
        <h3 className="text-gray-800 font-medium flex items-center gap-2">
          {getShapeIcon()}
          {getShapeName()}
          {shapeElements.length > 1 && (
            <span className="text-sm font-normal text-gray-500">({shapeElements.length} selected)</span>
          )}
        </h3>
      </div>
      
      {/* Fill Section */}
      <div className="pt-3">
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
                ref={solidColorButtonRef}
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full h-10 rounded-lg border border-gray-200 relative overflow-hidden hover:border-gray-300 transition-colors"
                style={{ 
                  background: style.backgroundColor || '#cccccc' 
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
                      ...(solidColorButtonRef.current && (() => {
                        const rect = solidColorButtonRef.current.getBoundingClientRect()
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
                    <div className="gradient-picker-wrapper">
                      <HexColorPicker
                        color={style.backgroundColor || '#cccccc'}
                        onChange={(color) => updateStyle({ 
                          backgroundColor: color,
                          gradientStart: undefined,
                          gradientEnd: undefined
                        })}
                      />
                    </div>
                    <HexColorInput
                      color={style.backgroundColor || '#cccccc'}
                      onChange={(color) => updateStyle({ 
                        backgroundColor: color,
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
              ref={gradientColorButtonRef}
              onClick={() => setShowGradientPicker(!showGradientPicker)}
              className="w-full h-10 rounded-lg border border-gray-200 relative overflow-hidden hover:border-gray-300 transition-colors"
              style={{ 
                background: `linear-gradient(${gradientAngle}deg, ${gradientStops[0].color} ${gradientStops[0].position}%, ${gradientStops[1].color} ${gradientStops[1].position}%)` 
              }}
            />
            
            {/* Integrated Gradient Picker */}
            {showGradientPicker && (
              <div className="relative">
                <div 
                  className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-72 color-picker-container select-none"
                  style={{
                    // Use fixed positioning relative to viewport
                    ...(gradientColorButtonRef.current && (() => {
                      const rect = gradientColorButtonRef.current.getBoundingClientRect()
                      const spaceBelow = window.innerHeight - rect.bottom
                      const spaceAbove = rect.top
                      const pickerHeight = 450 // Approximate height of gradient picker
                      const pickerWidth = 288 // w-72 = 18rem = 288px
                      
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
                              backgroundColor: undefined
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
                                  backgroundColor: undefined
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
                              backgroundColor: undefined
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
                            backgroundColor: undefined
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
                            backgroundColor: undefined
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
                          backgroundColor: undefined
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
      

      
      {/* Border Radius - Only show for rectangles and SVG shapes without fixed aspect ratio */}
      {(shapeContent?.shape === 'rectangle' || (shapeContent?.shape === 'svg' && !shapeContent.aspectRatio)) && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-gray-800 text-sm font-medium flex items-center gap-2">
              <RectangleHorizontal className="w-4 h-4" />
              Corner Radius
            </h4>
            {/* Preview */}
            <div 
              className="w-8 h-8 border-2 border-gray-300"
              style={{ 
                borderRadius: `${Math.min((style.borderRadius || 0), 16)}px`,
                backgroundColor: style.backgroundColor || style.gradientStart || '#cccccc'
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="50"
              value={style.borderRadius || 0}
              onChange={(e) => updateStyle({ borderRadius: Number(e.target.value) })}
              className="flex-1 slider-light"
            />
            <div className="relative">
              <input
                type="number"
                value={style.borderRadius || 0}
                onChange={(e) => updateStyle({ borderRadius: Math.max(0, Math.min(50, Number(e.target.value))) })}
                className="w-16 px-2 py-1 bg-white text-gray-800 text-sm rounded border border-gray-200 appearance-none hover:bg-gray-50 focus:outline-none focus:border-blue-500"
                min="0"
                max="50"
              />
            </div>
            <span className="text-sm text-gray-600">px</span>
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
            onChange={(e) => {
              const value = Number(e.target.value)
              setOpacityValue(value)
              // Update all selected shape elements
              shapeElements.forEach(element => {
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
                // Update all selected shape elements
                shapeElements.forEach(element => {
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
      
      {/* Blend Mode */}
      <BlendModeSelector
        value={style.blendMode}
        onChange={(blendMode: BlendMode) => updateStyle({ blendMode })}
        className="pt-3"
      />
      
      {/* Actions */}
      <div className="pt-4">
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
