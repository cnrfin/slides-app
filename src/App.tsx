// src/App.tsx
import { useEffect, useRef, useState } from 'react'
import SlideCanvas from '@/components/canvas/SlideCanvas'
import useSlideStore from '@/stores/slideStore'
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts'
import TemplateModal from '@/components/templates/TemplateModal'
import TextPropertiesPanel from '@/components/properties/TextPropertiesPanel'
import ShapePropertiesPanel from '@/components/properties/ShapePropertiesPanel'
import ImagePropertiesPanel from '@/components/properties/ImagePropertiesPanel'
import BlurbPropertiesPanel from '@/components/properties/BlurbPropertiesPanel'
import LinePropertiesPanel from '@/components/properties/LinePropertiesPanel'
import TemplateDesigner from '@/components/TemplateDesigner'
// import TemplateDemo from '@/components/TemplateDemo'
import LessonBuilder from '@/components/LessonBuilder'
import DataKeyHelper from '@/components/DataKeyHelper'
import FloatingToolbar from '@/components/toolbar/FloatingToolbar'
import FloatingSidebar from '@/components/sidebar/FloatingSidebar'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { CANVAS_DIMENSIONS } from '@/utils/canvas.constants'
import type { SlideTemplate } from '@/types/template.types'
import { useSelectedElements } from '@/stores/slideStore'
import { preloadCommonFonts } from '@/utils/font.utils'
import SlidePreview from '@/components/previews/SlidePreview'
import { Trash2, Copy } from 'lucide-react'
import CollapsibleTextInput from '@/components/ui/CollapsibleTextInput'

function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isTemplateDesignerOpen, setIsTemplateDesignerOpen] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(100)
  const [textInputHeight, setTextInputHeight] = useState(0) // Track text input height
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts()
  
  const selectedElements = useSelectedElements()
  
  const {
    presentation,
    slides,
    currentSlideId,
    selectedSlideId,
    createPresentation,
    addSlide,
    setCurrentSlide,
    selectSlide,
    clearSelection,
    duplicateSelectedSlide,
    deleteSelectedSlide,
  } = useSlideStore()
  
  // Initialize with a presentation on mount
  useEffect(() => {
    if (!presentation) {
      createPresentation('My Language Lesson')
    }
  }, [presentation, createPresentation])
  
  // Preload common fonts on mount
  useEffect(() => {
    preloadCommonFonts().catch(err => {
      console.warn('Failed to preload some fonts:', err)
    })
  }, [])
  
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
  

  
  // Handle clicks outside to clear selections
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Check if click is not on any interactive elements
      if (
        !target.closest('.floating-sidebar') && // Not on floating sidebar
        !target.closest('.konvajs-content') && // Not on canvas elements
        !target.closest('[role="dialog"]') && // Not on modals
        !target.closest('.properties-panel') // Not on properties panel
      ) {
        clearSelection()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [clearSelection])
  
  return (
    <div className="relative h-screen bg-gray-50 overflow-hidden">
      {/* Canvas Area - Full viewport */}
      <div className="absolute inset-0">
        <div ref={canvasContainerRef} className="w-full h-full bg-gray-100">
          <SlideCanvas 
            containerWidth={canvasSize.width}
            containerHeight={canvasSize.height}
            viewportOffset={textInputHeight > 32 ? (textInputHeight - 32) / 2 : 0} // Offset canvas when text input expands
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
      
      {/* Floating Sidebar */}
      <FloatingSidebar onAddSlide={() => setIsTemplateModalOpen(true)} />
      
      {/* Right Sidebar - Properties Panel */}
      {selectedElements.length > 0 && (
        <div className="properties-panel absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 p-4 shadow-sm z-10 overflow-y-auto scrollbar-hide">
          {selectedElements.some(el => el.type === 'text') ? (
            <TextPropertiesPanel />
          ) : selectedElements.some(el => el.type === 'shape') ? (
            <ShapePropertiesPanel />
          ) : selectedElements.some(el => el.type === 'image') ? (
            <ImagePropertiesPanel />
          ) : selectedElements.some(el => el.type === 'blurb') ? (
            <BlurbPropertiesPanel />
          ) : selectedElements.some(el => el.type === 'line') ? (
            <LinePropertiesPanel />
          ) : (
            <>
              <h3 className="font-semibold text-gray-800 mb-4">Properties</h3>
              <p className="text-sm text-gray-500">
                Select an element to edit its properties
              </p>
            </>
          )}
        </div>
      )}
      
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
      {/* <TemplateDemo /> */}
      
      {/* AI Lesson Builder */}
      <LessonBuilder />
      
      {/* Collapsible Text Input */}
      <CollapsibleTextInput 
        placeholder="Add a prompt..."
        canvasWidth={CANVAS_DIMENSIONS.WIDTH} // Use same width as canvas
        canvasMargin={16} // 16px margin from bottom
        onHeightChange={setTextInputHeight} // Track height changes
        onSubmit={(text) => {
          // TODO: Implement prompt submission logic
          console.log('Generated:', text)
        }}
      />
    </div>
  )
}

export default App