// src/App.tsx
import { useEffect, useRef, useState } from 'react'
import SlideCanvas from '@/components/canvas/SlideCanvas'
import useSlideStore from '@/stores/slideStore'
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts'
import TemplateModal from '@/components/templates/TemplateModal'
import TextPropertiesPanel from '@/components/properties/TextPropertiesPanel'
import ShapePropertiesPanel from '@/components/properties/ShapePropertiesPanel'
import ImagePropertiesPanel from '@/components/properties/ImagePropertiesPanel'
import TemplateDesigner from '@/components/TemplateDesigner'
import TemplateDemo from '@/components/TemplateDemo'
import DataKeyHelper from '@/components/DataKeyHelper'
import FloatingToolbar from '@/components/toolbar/FloatingToolbar'
import { Layers, Plus, Copy, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { SlideTemplate } from '@/types/template.types'
import { useSelectedElements } from '@/stores/slideStore'

function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isTemplateDesignerOpen, setIsTemplateDesignerOpen] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(100)
  
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
  } = useSlideStore()
  
  // Initialize with a presentation on mount
  useEffect(() => {
    if (!presentation) {
      createPresentation('My Language Lesson')
    }
  }, [presentation, createPresentation])
  
  // Update canvas size when container resizes or on mount
  useEffect(() => {
    const updateSize = () => {
      // Use full viewport dimensions
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  
  // Listen for zoom changes from canvas
  useEffect(() => {
    const handleZoomChange = (event: Event) => {
      const customEvent = event as CustomEvent
      const zoom = customEvent.detail.zoom
      setCurrentZoom(Math.round(zoom * 100))
    }
    
    window.addEventListener('canvas:zoom-change', handleZoomChange)
    return () => window.removeEventListener('canvas:zoom-change', handleZoomChange)
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
  

  
  return (
    <div className="relative h-screen bg-gray-50 overflow-hidden">
      {/* Canvas Area - Full viewport */}
      <div className="absolute inset-0">
        <div ref={canvasContainerRef} className="w-full h-full bg-gray-100">
          <SlideCanvas 
            containerWidth={canvasSize.width}
            containerHeight={canvasSize.height}
          />
        </div>
      </div>
      
      {/* Floating Toolbar */}
      <FloatingToolbar 
        onOpenTemplateMode={() => setIsTemplateDesignerOpen(!isTemplateDesignerOpen)}
        isTemplateMode={isTemplateDesignerOpen}
      />
      
      {/* Presentation Title and Navigation - Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 flex items-center gap-4 z-20">
        <h1 className="text-sm font-semibold text-gray-800">
          {presentation?.title || 'Untitled Presentation'}
        </h1>
        
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <button
            onClick={handlePreviousSlide}
            disabled={currentSlideIndex === 0}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs text-gray-600 min-w-[50px] text-center font-medium">
            {currentSlideIndex + 1} / {slides.length}
          </span>
          
          <button
            onClick={handleNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Zoom indicator */}
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <span className="text-xs text-gray-600 font-medium">
            {currentZoom}%
          </span>
        </div>
      </div>
      
      {/* Left Sidebar - Slide Thumbnails */}
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
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
              <div className="absolute inset-0 p-2 flex flex-col items-center justify-center">
                <div className="text-xs text-gray-400">Slide {index + 1}</div>
                {slide.slideType && (
                  <div className="text-[10px] text-purple-600 font-medium mt-1 capitalize">
                    {slide.slideType}
                  </div>
                )}
              </div>
              
              {/* Slide number badge */}
              <div className="absolute top-1 right-1 bg-gray-700 text-white text-xs px-2 py-0.5 rounded">
                {index + 1}
              </div>
              
              {/* Template indicator */}
              {slide.metadata?.templateName && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded truncate">
                    {slide.metadata.templateName}
                  </div>
                </div>
              )}
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
      
      {/* Right Sidebar - Properties Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 p-4 shadow-sm z-10 overflow-y-auto">
        {selectedElements.length > 0 ? (
          selectedElements.some(el => el.type === 'text') ? (
            <TextPropertiesPanel />
          ) : selectedElements.some(el => el.type === 'shape') ? (
            <ShapePropertiesPanel />
          ) : selectedElements.some(el => el.type === 'image') ? (
            <ImagePropertiesPanel />
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
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Alt</kbd> + Drag - Duplicate element</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Space</kbd> + Drag - Pan canvas</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Scroll</kbd> - Zoom in/out</li>
                <li><kbd className="px-1 py-0.5 bg-gray-200 rounded">Home</kbd> - Reset view</li>
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
      
      {/* Template Designer */}
      <TemplateDesigner
        isOpen={isTemplateDesignerOpen}
        onClose={() => setIsTemplateDesignerOpen(false)}
      />
      
      {/* Data Key Helper - show when template designer is open */}
      {isTemplateDesignerOpen && <DataKeyHelper />}
      
      {/* Template Demo - for development */}
      <TemplateDemo />
    </div>
  )
}

export default App