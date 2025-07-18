// src/App.tsx
import { useEffect, useRef, useState } from 'react'
import SlideCanvas from '@/components/canvas/SlideCanvas'
import useSlideStore from '@/stores/slideStore'
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts'
import TemplateModal from '@/components/templates/TemplateModal'
import TextPropertiesPanel from '@/components/properties/TextPropertiesPanel'
import ShapePropertiesPanel from '@/components/properties/ShapePropertiesPanel'
import { Layers, Plus, Copy, Trash2, ChevronLeft, ChevronRight, ChevronsUp, ChevronsDown, ChevronUp, ChevronDown, Undo2, Redo2 } from 'lucide-react'
import type { TextContent, ShapeContent } from '@/types/slide.types'
import type { SlideTemplate } from '@/types/template.types'
import { measureAutoText } from '@/utils/text.utils'
import { useSelectedElements } from '@/stores/slideStore'

function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts()
  
  const selectedElements = useSelectedElements()
  
  const {
    presentation,
    slides,
    currentSlideId,
    createPresentation,
    addSlide,
    deleteSlide,
    duplicateSlide,
    setCurrentSlide,
    addElement,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useSlideStore()
  
  // Initialize with a presentation on mount
  useEffect(() => {
    if (!presentation) {
      createPresentation('My Language Lesson')
    }
  }, [presentation, createPresentation])
  
  // Update canvas size when container resizes
  useEffect(() => {
    const updateSize = () => {
      if (canvasContainerRef.current) {
        setCanvasSize({
          width: canvasContainerRef.current.clientWidth,
          height: canvasContainerRef.current.clientHeight
        })
      }
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  
  const currentSlideIndex = slides.findIndex(s => s.id === currentSlideId)
  const currentSlide = slides[currentSlideIndex]
  
  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlide(slides[currentSlideIndex - 1].id)
    }
  }
  
  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlide(slides[currentSlideIndex + 1].id)
    }
  }
  
  const handleAddText = () => {
    if (!currentSlide) return
    
    const text = 'Type here' // Simple default text
    const fontSize = 16 // Changed to 16 to match Figma's default
    const fontFamily = 'Arial'
    
    // Measure text dimensions
    const dimensions = measureAutoText({
      text,
      fontSize,
      fontFamily,
      lineHeight: 1.2,
      padding: 0 // No padding
    })
    
    const textContent: TextContent = {
      text,
    }
    
    // Add text in the center of the canvas with auto-sized dimensions
    addElement(currentSlide.id, {
      type: 'text',
      x: 400 - dimensions.width / 2, // Center horizontally
      y: 300 - dimensions.height / 2, // Center vertically
      width: dimensions.width,
      height: dimensions.height, // No extra padding
      content: textContent,
      style: {
        fontSize,
        fontFamily,
        color: '#000000',
        textAlign: 'left',
      },
    })
  }
  
  const handleAddShape = () => {
    if (!currentSlide) return
    
    const shapeContent: ShapeContent = {
      shape: 'rectangle',
    }
    
    // Add shape in the center of the canvas
    addElement(currentSlide.id, {
      type: 'shape',
      x: 350,
      y: 250,
      width: 100,
      height: 100,
      content: shapeContent,
      style: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      },
    })
  }
  
  const handleAddCircle = () => {
    if (!currentSlide) return
    
    const shapeContent: ShapeContent = {
      shape: 'circle',
    }
    
    addElement(currentSlide.id, {
      type: 'shape',
      x: 350,
      y: 250,
      width: 100,
      height: 100,
      content: shapeContent,
      style: {
        backgroundColor: '#10b981',
      },
    })
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Slide Thumbnails */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Slides
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => setCurrentSlide(slide.id)}
              className={`
                relative aspect-[4/3] bg-white border-2 rounded-lg cursor-pointer
                transition-all duration-200 hover:shadow-md
                ${slide.id === currentSlideId 
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Slide thumbnail preview */}
              <div className="absolute inset-0 p-2 flex items-center justify-center">
                <div className="text-xs text-gray-400">Slide {index + 1}</div>
              </div>
              
              {/* Slide number badge */}
              <div className="absolute top-1 right-1 bg-gray-700 text-white text-xs px-2 py-0.5 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
        
        {/* Slide controls */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Slide
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => currentSlide && duplicateSlide(currentSlide.id)}
              disabled={!currentSlide}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            
            <button
              onClick={() => currentSlide && deleteSlide(currentSlide.id)}
              disabled={!currentSlide || slides.length === 1}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            {presentation?.title || 'Untitled Presentation'}
          </h1>
          
          {/* Undo/Redo buttons */}
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1" />
          
          {/* Layer controls - only show when element is selected */}
          {selectedElements.length === 1 && currentSlide && (
            <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-3">
              <button
                onClick={() => {
                  const element = selectedElements[0]
                  if (element) {
                    useSlideStore.getState().bringToFront(currentSlide.id, element.id)
                  }
                }}
                className="p-2 rounded hover:bg-gray-100 transition-colors" 
                title="Bring to Front (Alt+Shift+↑)"
              >
                <ChevronsUp className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {
                  const element = selectedElements[0]
                  if (element) {
                    useSlideStore.getState().bringForward(currentSlide.id, element.id)
                  }
                }}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Bring Forward (Alt+↑)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {
                  const element = selectedElements[0]
                  if (element) {
                    useSlideStore.getState().sendBackward(currentSlide.id, element.id)
                  }
                }}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Send Backward (Alt+↓)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {
                  const element = selectedElements[0]
                  if (element) {
                    useSlideStore.getState().sendToBack(currentSlide.id, element.id)
                  }
                }}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Send to Back (Alt+Shift+↓)"
              >
                <ChevronsDown className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Element controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddText}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Add Text
            </button>
            
            <button
              onClick={handleAddShape}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Add Rectangle
            </button>
            
            <button
              onClick={handleAddCircle}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Add Circle
            </button>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
            <button
              onClick={handlePreviousSlide}
              disabled={currentSlideIndex === 0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-sm text-gray-600 min-w-[60px] text-center font-medium">
              {currentSlideIndex + 1} / {slides.length}
            </span>
            
            <button
              onClick={handleNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div ref={canvasContainerRef} className="flex-1 bg-gray-100 overflow-hidden">
          <SlideCanvas 
            containerWidth={canvasSize.width}
            containerHeight={canvasSize.height}
          />
        </div>
      </div>
      
      {/* Properties Panel */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 shadow-sm">
        {selectedElements.length > 0 ? (
          selectedElements.some(el => el.type === 'text') ? (
            <TextPropertiesPanel />
          ) : selectedElements.some(el => el.type === 'shape') ? (
            <ShapePropertiesPanel />
          ) : (
            <>
              <h3 className="font-semibold text-gray-800 mb-4">Properties</h3>
              <p className="text-sm text-gray-500">
                Select an element to edit its properties
              </p>
            </>
          )
        ) : (
          <>
            <h3 className="font-semibold text-gray-800 mb-4">Properties</h3>
            <p className="text-sm text-gray-500">
              Select an element to edit its properties
            </p>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Keyboard Shortcuts</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Double-click</kbd> - Edit text</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Drag</kbd> - Move elements</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Space</kbd> + Drag - Pan canvas</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Scroll</kbd> - Zoom in/out</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Delete</kbd> - Delete selected</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 rounded">Z</kbd> - Undo</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 rounded">Y</kbd> - Redo</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl</kbd> + Click - Multi-select</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Shift</kbd> + Drag - Proportional resize</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Alt</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 rounded">↑</kbd> - Bring forward</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Alt</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 rounded">↓</kbd> - Send backward</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Alt</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 rounded">Shift</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 rounded">↑</kbd> - Bring to front</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Alt</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 rounded">Shift</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 rounded">↓</kbd> - Send to back</li>
              </ul>
            </div>
          </>
        )}
      </div>
      
      {/* Template Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={(template: SlideTemplate) => {
          addSlide(template)
          setIsTemplateModalOpen(false)
        }}
      />
    </div>
  )
}

export default App