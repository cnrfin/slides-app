import { useState, useRef, useEffect } from 'react'
import { 
  MousePointer2, 
  Square, 
  Circle, 
  Type,
  Image, 
  Undo2, 
  Redo2, 
  Eye,
  EyeOff,
  Wand2,
  Layers,
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  Lock,
  Unlock,
  Shapes,
  Minus
} from 'lucide-react'
import useSlideStore, { useSelectedElements } from '@/stores/slideStore'
import type { TextContent, ShapeContent, BlurbContent } from '@/types/slide.types'
import { measureAutoText } from '@/utils/text.utils'
import ShapePicker from './ShapePicker'
import { getShapeById } from '@/utils/svg-shapes'

interface FloatingToolbarProps {
  onOpenTemplateMode: () => void
  isTemplateMode: boolean
}

export default function FloatingToolbar({ onOpenTemplateMode, isTemplateMode }: FloatingToolbarProps) {
  const [showLayerMenu, setShowLayerMenu] = useState(false)
  const [showShapeMenu, setShowShapeMenu] = useState(false)
  const [selectedTool, setSelectedTool] = useState<'select' | 'rectangle' | 'circle' | 'text' | 'blurb' | 'image' | 'line'>('select')
  const [lastUsedShape, setLastUsedShape] = useState<{ type: 'rectangle' | 'circle' | 'blurb' | 'svg'; svgId?: string }>({ type: 'rectangle' })
  const layersButtonRef = useRef<HTMLButtonElement>(null)
  const shapeButtonRef = useRef<HTMLButtonElement>(null)
  
  const {
    slides,
    currentSlideId,
    addElement,
    canUndo,
    canRedo,
    undo,
    redo,
    showOutsideElements,
    toggleOutsideElements,
    selectedElementIds,
    selectElement,
  } = useSlideStore()
  
  // Listen for exit line mode event to reset tool selection
  useEffect(() => {
    const handleExitLineMode = () => {
      setSelectedTool('select')
    }
    
    window.addEventListener('canvas:exit-line-mode', handleExitLineMode)
    return () => window.removeEventListener('canvas:exit-line-mode', handleExitLineMode)
  }, [])
  
  const currentSlide = slides.find(s => s.id === currentSlideId)
  const selectedElements = useSelectedElements()
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layersButtonRef.current && !layersButtonRef.current.contains(event.target as Node)) {
        setShowLayerMenu(false)
      }
      if (shapeButtonRef.current && !shapeButtonRef.current.contains(event.target as Node)) {
        setShowShapeMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleAddText = () => {
    if (!currentSlide) return
    
    const text = 'Type here'
    const fontSize = 16
    const fontFamily = 'Arial'
    
    const dimensions = measureAutoText({
      text,
      fontSize,
      fontFamily,
      lineHeight: 1.2,
      padding: 0
    })
    
    const textContent: TextContent = {
      text,
    }
    
    addElement(currentSlide.id, {
      type: 'text',
      x: 400 - dimensions.width / 2,
      y: 300 - dimensions.height / 2,
      width: dimensions.width,
      height: dimensions.height,
      content: textContent,
      style: {
        fontSize,
        fontFamily,
        color: '#000000',
        textAlign: 'left',
      },
    })
  }
  
  const handleAddShape = (shape: 'rectangle' | 'circle' | 'blurb' | 'svg', svgData?: { id: string; path: string; aspectRatio?: number; viewBox?: string }) => {
    if (!currentSlide) return
    
    if (shape === 'blurb') {
      handleAddBlurb()
      return
    }
    
    if (shape === 'svg' && svgData) {
      // Add SVG shape
      let width = 150
      let height = 150
      
      // Special handling for edge wave shapes - make them larger by default
      if (svgData.id && svgData.id.startsWith('wave-')) {
        if (svgData.id === 'wave-bottom' || svgData.id === 'wave-top' || 
            svgData.id === 'wave-bottom-gentle' || svgData.id === 'wave-top-gentle') {
          width = 300
          height = 100
        } else if (svgData.id === 'wave-left' || svgData.id === 'wave-right') {
          width = 100
          height = 300
        } else if (svgData.id === 'wave-corner') {
          width = 200
          height = 200
        }
      } else if (svgData.aspectRatio) {
        height = width / svgData.aspectRatio
      }
      
      const shapeContent: ShapeContent = {
        shape: 'svg',
        svgPath: svgData.path,
        svgId: svgData.id,
        aspectRatio: svgData.aspectRatio,
        viewBox: svgData.viewBox
      }
      
      addElement(currentSlide.id, {
        type: 'shape',
        x: 400 - width / 2,
        y: 300 - height / 2,
        width,
        height,
        content: shapeContent,
        style: {
          backgroundColor: '#3b82f6',
        },
      })
      
      setLastUsedShape({ type: 'svg', svgId: svgData.id })
    } else {
      // Add basic shape
      const shapeContent: ShapeContent = {
        shape: shape as 'rectangle' | 'circle',
      }
      
      addElement(currentSlide.id, {
        type: 'shape',
        x: 350,
        y: 250,
        width: 100,
        height: 100,
        content: shapeContent,
        style: {
          backgroundColor: shape === 'rectangle' ? '#3b82f6' : '#10b981',
          borderRadius: shape === 'rectangle' ? 8 : undefined,
        },
      })
      
      setLastUsedShape({ type: shape as 'rectangle' | 'circle' })
    }
    
    setSelectedTool('select')
    setShowShapeMenu(false)
  }
  
  const handleAddBlurb = () => {
    if (!currentSlide) return
    
    const blurbContent: BlurbContent = {
      text: 'Type here',
      tailPosition: 'bottom-left',
    }
    
    addElement(currentSlide.id, {
      type: 'blurb',
      x: 325,  // Center on canvas (800/2 - 150/2 = 325)
      y: 262.5,  // Center on canvas (600/2 - 75/2 = 262.5)
      width: 150,
      height: 75,
      content: blurbContent,
      style: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Arial',
        borderRadius: 25,
      },
    })
    
    setLastUsedShape({ type: 'blurb' })
    setSelectedTool('select')
    setShowShapeMenu(false)
  }
  
  const handleAddPlaceholderImage = () => {
    if (!currentSlide) return
    
    // Add a placeholder image element
    const elementId = addElement(currentSlide.id, {
      type: 'image',
      x: 350,
      y: 250,
      width: 100,
      height: 100,
      content: {
        src: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#f9fafb" stroke="#e5e7eb" stroke-width="2" stroke-dasharray="8,4" rx="8"/>
            <g transform="translate(100, 90)">
              <!-- Image icon -->
              <path d="M-35,-35 L35,-35 Q40,-35 40,-30 L40,20 Q40,25 35,25 L-35,25 Q-40,25 -40,20 L-40,-30 Q-40,-35 -35,-35 Z" 
                    fill="none" stroke="#9ca3af" stroke-width="3"/>
              <!-- Mountain/landscape inside -->
              <path d="M-35,5 L-10,-10 L5,0 L20,-15 L35,5 L35,20 L-35,20 Z" fill="#e5e7eb"/>
              <!-- Sun/circle -->
              <circle cx="-18" cy="-15" r="7" fill="#d1d5db"/>
            </g>
            <text x="100" y="145" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" 
                  font-size="16" font-weight="500" fill="#6b7280">Drop image here</text>
            <text x="100" y="165" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" 
                  font-size="14" fill="#9ca3af">or resize placeholder</text>
          </svg>
        `),
        alt: 'Placeholder image',
        isPlaceholder: true,
        objectFit: 'cover',
        offsetX: 0.5,
        offsetY: 0.5,
        scale: 1
      },
      style: {},
    })
    
    // Select the new element
    selectElement(elementId)
    setSelectedTool('select')
  }
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !currentSlide) return
    
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          // Calculate appropriate size (max 400px)
          let width = img.width
          let height = img.height
          const maxSize = 400
          
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height)
            width *= ratio
            height *= ratio
          }
          
          // Center position with slight offset for multiple images
          const offsetX = index * 20
          const offsetY = index * 20
          
          addElement(currentSlide.id, {
            type: 'image',
            x: 400 - width / 2 + offsetX,
            y: 300 - height / 2 + offsetY,
            width,
            height,
            content: {
              src: e.target?.result as string,
              alt: file.name,
            },
            style: {},
          })
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
    
    // Reset input
    event.target.value = ''
    setSelectedTool('select')
  }
  
  const handleToggleOutsideElements = () => {
    toggleOutsideElements()
  }
  
  return (
    <>
      {/* Floating Toolbar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-white rounded-full shadow-xl border border-gray-200/50 flex items-center p-1.5 gap-0.5 backdrop-blur-sm">
          {/* Select Tool */}
          <button
            onClick={() => setSelectedTool('select')}
            className={`p-3 rounded-full transition-all ${
              selectedTool === 'select' 
                ? 'bg-blue-100 text-blue-700' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Select Tool (V)"
          >
            <MousePointer2 className="w-5 h-5" />
          </button>
          
          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 mx-1" />
          
          {/* Shape Tool */}
          <div className="relative" ref={shapeButtonRef}>
            <button
              onClick={() => setShowShapeMenu(!showShapeMenu)}
              className={`p-3 rounded-full transition-all ${
                ['rectangle', 'circle', 'blurb', 'svg'].includes(selectedTool) 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title="Shape Tool"
            >
              {lastUsedShape.type === 'rectangle' && <Square className="w-5 h-5" />}
              {lastUsedShape.type === 'circle' && <Circle className="w-5 h-5" />}
              {lastUsedShape.type === 'blurb' && (
                <svg width="20" height="20" viewBox="0 0 48 48" className="w-5 h-5">
                  <path 
                    d="M8 8 L40 8 Q44 8 44 12 L44 28 Q44 32 40 32 L20 32 L12 40 L12 32 L8 32 Q4 32 4 28 L4 12 Q4 8 8 8 Z" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  />
                </svg>
              )}
              {lastUsedShape.type === 'svg' && (() => {
                const shape = lastUsedShape.svgId ? getShapeById(lastUsedShape.svgId) : null
                if (shape) {
                  return (
                    <svg width="20" height="20" viewBox={shape.viewBox || '0 0 100 100'} className="w-5 h-5">
                      <path d={shape.path} fill="currentColor" />
                    </svg>
                  )
                }
                return <Shapes className="w-5 h-5" />
              })()}
            </button>
            
            {/* Shape Picker */}
            {showShapeMenu && (
              <ShapePicker
                onSelectShape={handleAddShape}
                onClose={() => setShowShapeMenu(false)}
              />
            )}
          </div>
          
          {/* Text Tool */}
          <button
            onClick={() => {
              handleAddText()
              setSelectedTool('text')
            }}
            className={`p-3 rounded-full transition-all ${
              selectedTool === 'text' 
                ? 'bg-blue-100 text-blue-700' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Text (T)"
          >
            <Type className="w-5 h-5" />
          </button>
          
          {/* Line Tool */}
          <button
            onClick={() => {
              setSelectedTool('line')
              // Emit event to start line drawing mode
              const event = new CustomEvent('canvas:start-line-mode')
              window.dispatchEvent(event)
            }}
            className={`p-3 rounded-full transition-all ${
              selectedTool === 'line' 
                ? 'bg-blue-100 text-blue-700' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Line Tool (L)"
          >
            <Minus className="w-5 h-5" />
          </button>
          
          {/* Image Tool */}
          <button
            onClick={() => {
              handleAddPlaceholderImage()
              setSelectedTool('image')
            }}
            className={`p-3 rounded-full transition-all ${
              selectedTool === 'image' 
                ? 'bg-blue-100 text-blue-700' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Add Image"
          >
            <Image className="w-5 h-5" />
          </button>
          
          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 mx-1" />
          
          {/* Undo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-3 rounded-full transition-all hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          
          {/* Redo */}
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-3 rounded-full transition-all hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-5 h-5" />
          </button>
          
          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 mx-1" />
          
          {/* Toggle Outside Elements Visibility */}
          <button
            onClick={handleToggleOutsideElements}
            className={`p-3 rounded-full transition-all ${
              showOutsideElements 
                ? 'hover:bg-gray-100 text-gray-700' 
                : 'bg-gray-100 text-gray-500'
            }`}
            title={showOutsideElements ? "Hide elements outside slide" : "Show elements outside slide"}
          >
            {showOutsideElements ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          
          {/* Lock/Unlock - only show when element(s) selected */}
          {selectedElements.length > 0 && currentSlide && (
            <>
              <div className="w-px h-8 bg-gray-200 mx-1" />
              
              <button
                onClick={() => {
                  const hasLocked = selectedElements.some(el => el.locked)
                  const hasUnlocked = selectedElements.some(el => !el.locked)
                  
                  // If all are locked, unlock all. If all are unlocked, lock all. If mixed, lock all.
                  const shouldLock = hasUnlocked
                  
                  selectedElements.forEach(element => {
                    useSlideStore.getState().updateElement(currentSlide.id, element.id, {
                      locked: shouldLock
                    })
                  })
                }}
                className="p-3 rounded-full transition-all hover:bg-gray-100 text-gray-700"
                title={selectedElements.length > 1 
                  ? `Lock/Unlock ${selectedElements.length} elements`
                  : selectedElements[0]?.locked ? 'Unlock' : 'Lock'
                }
              >
                {selectedElements.every(el => el.locked) ? (
                  <Unlock className="w-5 h-5" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
              </button>
            </>
          )}
          
          {/* Layer Controls - only show when single element is selected */}
          {selectedElements.length === 1 && currentSlide && (
            <>
              <div className="w-px h-8 bg-gray-200 mx-1" />
              
              <div className="relative" ref={layersButtonRef}>
                <button
                  onClick={() => setShowLayerMenu(!showLayerMenu)}
                  className="p-3 rounded-full transition-all hover:bg-gray-100 text-gray-700"
                  title="Layer Controls"
                >
                  <Layers className="w-5 h-5" />
                </button>
                
                {/* Layer Dropdown */}
                {showLayerMenu && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200/50 p-2 min-w-[180px] backdrop-blur-sm transform transition-all duration-200 ease-out origin-bottom">
                    <button
                      onClick={() => {
                        const element = selectedElements[0]
                        if (element) {
                          useSlideStore.getState().bringToFront(currentSlide.id, element.id)
                          setShowLayerMenu(false)
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm"
                    >
                      <ChevronsUp className="w-4 h-4" />
                      Bring to Front
                    </button>
                    
                    <button
                      onClick={() => {
                        const element = selectedElements[0]
                        if (element) {
                          useSlideStore.getState().bringForward(currentSlide.id, element.id)
                          setShowLayerMenu(false)
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm"
                    >
                      <ChevronUp className="w-4 h-4" />
                      Bring Forward
                    </button>
                    
                    <button
                      onClick={() => {
                        const element = selectedElements[0]
                        if (element) {
                          useSlideStore.getState().sendBackward(currentSlide.id, element.id)
                          setShowLayerMenu(false)
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm"
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                      Send Backward
                    </button>
                    
                    <button
                      onClick={() => {
                        const element = selectedElements[0]
                        if (element) {
                          useSlideStore.getState().sendToBack(currentSlide.id, element.id)
                          setShowLayerMenu(false)
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-sm"
                    >
                      <ChevronsDown className="w-4 h-4" />
                      Send to Back
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 mx-1" />
          
          {/* Template Mode */}
          <button
            onClick={onOpenTemplateMode}
            className={`p-3 rounded-full transition-all ${
              isTemplateMode 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
            title="Template Mode"
          >
            <Wand2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  )
}
