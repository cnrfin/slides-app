import { useState, useRef, useEffect } from 'react'
import { 
  MousePointer2, 
  Square, 
  Circle, 
  Type,
  Image, 
  Undo2, 
  Redo2, 
  Home,
  Wand2,
  Layers,
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  Lock,
  Unlock
} from 'lucide-react'
import useSlideStore, { useSelectedElements } from '@/stores/slideStore'
import type { TextContent, ShapeContent } from '@/types/slide.types'
import { measureAutoText } from '@/utils/text.utils'

interface FloatingToolbarProps {
  onOpenTemplateMode: () => void
  isTemplateMode: boolean
}

export default function FloatingToolbar({ onOpenTemplateMode, isTemplateMode }: FloatingToolbarProps) {
  const [showLayerMenu, setShowLayerMenu] = useState(false)
  const [selectedTool, setSelectedTool] = useState<'select' | 'rectangle' | 'circle' | 'text' | 'image'>('select')
  const layersButtonRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const {
    slides,
    currentSlideId,
    addElement,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useSlideStore()
  
  const currentSlide = slides.find(s => s.id === currentSlideId)
  const selectedElements = useSelectedElements()
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layersButtonRef.current && !layersButtonRef.current.contains(event.target as Node)) {
        setShowLayerMenu(false)
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
  
  const handleAddShape = (shape: 'rectangle' | 'circle') => {
    if (!currentSlide) return
    
    const shapeContent: ShapeContent = {
      shape,
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
  
  const handleResetView = () => {
    const event = new CustomEvent('canvas:reset-view')
    window.dispatchEvent(event)
  }
  
  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />
      
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
          
          {/* Rectangle Tool */}
          <button
            onClick={() => {
              handleAddShape('rectangle')
              setSelectedTool('rectangle')
            }}
            className={`p-3 rounded-full transition-all ${
              selectedTool === 'rectangle' 
                ? 'bg-blue-100 text-blue-700' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Rectangle (R)"
          >
            <Square className="w-5 h-5" />
          </button>
          
          {/* Circle Tool */}
          <button
            onClick={() => {
              handleAddShape('circle')
              setSelectedTool('circle')
            }}
            className={`p-3 rounded-full transition-all ${
              selectedTool === 'circle' 
                ? 'bg-blue-100 text-blue-700' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Circle (O)"
          >
            <Circle className="w-5 h-5" />
          </button>
          
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
          
          {/* Image Tool */}
          <button
            onClick={() => {
              fileInputRef.current?.click()
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
          
          {/* Reset View */}
          <button
            onClick={handleResetView}
            className="p-3 rounded-full transition-all hover:bg-gray-100 text-gray-700"
            title="Reset View (Home)"
          >
            <Home className="w-5 h-5" />
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
