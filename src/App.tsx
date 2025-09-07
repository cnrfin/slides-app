// src/App.tsx
import { useEffect, useRef, useState } from 'react'
import SlideCanvas from '@/components/canvas/SlideCanvas'
import useSlideStore from '@/stores/slideStore'
import useUIStore from '@/stores/uiStore'
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts'
import TemplateModal from '@/components/templates/TemplateModal'
import RightSidebar from '@/components/sidebar/RightSidebar'
import TemplateDesigner from '@/components/TemplateDesigner'
// import TemplateDemo from '@/components/TemplateDemo'
import DataKeyHelper from '@/components/DataKeyHelper'
import Sidebar from '@/components/sidebar/Sidebar'
import { Plus, ChevronLeft, ChevronRight, Undo2, Redo2, Wand2 } from 'lucide-react'
import type { SlideTemplate } from '@/types/template.types'

import { preloadCommonFonts } from '@/utils/font.utils'
import SlidePreview from '@/components/previews/SlidePreview'
import { Trash2, Copy } from 'lucide-react'
import CollapsibleTextInput from '@/components/ui/CollapsibleTextInput'
import ToastContainer from '@/components/ui/Toast'
import { exportSlidesToPDF } from '@/utils/pdf-export'
import { toast } from '@/utils/toast'


function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isTemplateDesignerOpen, setIsTemplateDesignerOpen] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(75) // Default to 75% zoom
  const [textInputHeight, setTextInputHeight] = useState(0) // Track text input height
  const [slideBottomY, setSlideBottomY] = useState(0) // Track slide bottom position
  
  // Initialize theme on mount
  const { initializeTheme } = useUIStore()
  
  useEffect(() => {
    initializeTheme()
  }, [])
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts()
  
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
  
  // Calculate slide bottom position whenever zoom or canvas size changes
  useEffect(() => {
    // Canvas dimensions from constants
    const CANVAS_HEIGHT = 600
    const zoom = currentZoom / 100
    
    // Calculate the slide's bottom edge position on screen
    // The slide is centered in the viewport
    const slideHeight = CANVAS_HEIGHT * zoom
    const canvasCenterY = canvasSize.height / 2
    const slideBottomY = canvasCenterY + (slideHeight / 2)
    
    setSlideBottomY(slideBottomY)
  }, [currentZoom, canvasSize.height])
  
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
        !target.closest('[class*="fixed left-0 top-0"]') && // Not on fixed sidebar
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
        <div ref={canvasContainerRef} className="w-full h-full" style={{ backgroundColor: '#f9f9f9' }}>
          <SlideCanvas 
            containerWidth={canvasSize.width}
            containerHeight={canvasSize.height}
            viewportOffset={(() => {
              // Calculate viewport offset based on proximity to slide
              if (textInputHeight <= 32) return 0 // Not expanded
              
              // Calculate positions
              const textInputHandleY = canvasSize.height - textInputHeight - 16 // 16px bottom margin
              const gap = textInputHandleY - slideBottomY
              
              // Only start repositioning when handle touches the slide (gap <= 0)
              if (gap > 0) return 0
              
              // Calculate offset to maintain exactly 8px gap once repositioning starts
              // The offset should push the slide up by the amount needed
              const desiredGap = 8
              const overlapAmount = slideBottomY - textInputHandleY + desiredGap
              
              // Return the offset needed to maintain the gap
              return Math.max(0, overlapAmount)
            })()} // Offset canvas when text input touches slide
          />
        </div>
      </div>
      
      {/* Toolbar with Undo/Redo and Navigation - Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 flex items-center gap-4 z-20">
        {/* Undo/Redo Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
          
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <button
            onClick={handlePreviousSlide}
            disabled={currentSlideIndex === 0}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1} />
          </button>
          
          <span className="text-xs text-gray-600 min-w-[50px] text-center font-medium">
            {currentSlideIndex + 1} / {slides.length}
          </span>
          
          <button
            onClick={handleNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1} />
          </button>
        </div>
        
        {/* Zoom indicator */}
        <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
          <span className="text-xs text-gray-600 font-medium">
            {currentZoom}%
          </span>
        </div>
      </div>
      
      {/* Fixed Sidebar */}
      <Sidebar onAddSlide={() => setIsTemplateModalOpen(true)} />
      
      {/* Right Sidebar - Always Visible */}
      <RightSidebar 
        onPlaySlideshow={() => {
          // TODO: Implement slideshow functionality
          console.log('Play slideshow')
        }}
        onExportAllPDF={async () => {
          try {
            // Show loading toast
            const toastId = toast.loading('Generating PDF for all slides...')
            
            // Get presentation name for filename
            const fileName = presentation?.title ? 
              `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf` : 
              'presentation.pdf'
            
            // Export all slides to PDF
            await exportSlidesToPDF({
              slides,
              slideOrder: presentation?.slides, // Use presentation's slide order
              fileName,
              onProgress: (progress) => {
                // Update toast with progress
                toast.loading(`Generating PDF... ${Math.round(progress)}%`, toastId)
              }
            })
            
            // Show success toast
            toast.success('All slides exported successfully!', toastId)
          } catch (error) {
            console.error('Failed to export PDF:', error)
            toast.error('Failed to export PDF. Please try again.')
          }
        }}
        onExportCurrentPDF={async () => {
          try {
            // Find the current slide
            const currentSlide = slides.find(s => s.id === currentSlideId)
            if (!currentSlide) {
              toast.error('No slide selected')
              return
            }
            
            // Show loading toast
            const toastId = toast.loading('Generating PDF for current slide...')
            
            // Get slide index for filename
            const slideIndex = slides.findIndex(s => s.id === currentSlideId) + 1
            const fileName = presentation?.title ? 
              `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_slide_${slideIndex}.pdf` : 
              `slide_${slideIndex}.pdf`
            
            // Export only the current slide to PDF
            await exportSlidesToPDF({
              slides: [currentSlide], // Only export current slide
              fileName,
              onProgress: (progress) => {
                // Update toast with progress
                toast.loading(`Generating PDF... ${Math.round(progress)}%`, toastId)
              }
            })
            
            // Show success toast
            toast.success(`Slide ${slideIndex} exported successfully!`, toastId)
          } catch (error) {
            console.error('Failed to export PDF:', error)
            toast.error('Failed to export PDF. Please try again.')
          }
        }}
      />
      
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
      
      {/* Template Mode Button */}
      <button
        onClick={() => setIsTemplateDesignerOpen(!isTemplateDesignerOpen)}
        className={`fixed bottom-20 right-8 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-lg z-40 ${
          isTemplateDesignerOpen 
            ? 'bg-purple-600 text-white hover:bg-purple-700' 
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        }`}
        title="Template Mode"
      >
        <Wand2 className="w-4 h-4" strokeWidth={1} />
        Template Mode
      </button>
      
      {/* Collapsible Text Input */}
      <CollapsibleTextInput 
        placeholder="Add a prompt..."
        onHeightChange={setTextInputHeight} // Track height changes
        onSubmit={(text, selectedProfile, selectedLesson, useGeniusMode, selectedSlides) => {
          // This is now handled internally by the CollapsibleTextInput component
          // The component directly calls the OpenAI API and adds slides to the canvas
          console.log('Generated:', {
            text,
            profile: selectedProfile,
            lesson: selectedLesson,
            model: 'gpt-5-mini', // Both modes use gpt-5-mini
            geniusMode: useGeniusMode,
            slides: selectedSlides
          })
        }}
      />
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}

export default App