// src/Canvas.tsx
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SlideCanvas from '@/components/canvas/SlideCanvas'
import useSlideStore from '@/stores/slideStore'
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts'
import TemplateModal from '@/components/templates/TemplateModal'
import RightSidebar from '@/components/sidebar/RightSidebar'
import TemplateDesigner from '@/components/TemplateDesigner'
import DataKeyHelper from '@/components/DataKeyHelper'
import Sidebar from '@/components/sidebar/Sidebar'
import { Plus, ChevronLeft, ChevronRight, Undo2, Redo2, Wand2, ArrowLeft } from 'lucide-react'
import type { SlideTemplate } from '@/types/template.types'
import { preloadCommonFonts } from '@/utils/font.utils'
import SlidePreview from '@/components/previews/SlidePreview'
import { Trash2, Copy } from 'lucide-react'
import CollapsibleTextInput from '@/components/ui/CollapsibleTextInput'
import ToastContainer from '@/components/ui/Toast'
import { exportSlidesToPDF } from '@/utils/pdf-export'
import { toast } from '@/utils/toast'

export default function Canvas() {
  const location = useLocation()
  const navigate = useNavigate()
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isTemplateDesignerOpen, setIsTemplateDesignerOpen] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(75)
  const [textInputHeight, setTextInputHeight] = useState(0)
  const [slideBottomY, setSlideBottomY] = useState(0)
  
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
  
  // Check if we need to generate from prompt
  useEffect(() => {
    if (location.state?.action === 'generate' && location.state?.prompt) {
      // Handle AI generation with the prompt
      console.log('Generate from prompt:', location.state.prompt)
      // TODO: Trigger AI generation with the prompt
      // For now, just clear the state
      navigate('/canvas', { replace: true })
    }
  }, [location.state, navigate])
  
  useEffect(() => {
    if (!presentation) {
      createPresentation('My Language Lesson')
    }
  }, [presentation, createPresentation])
  
  useEffect(() => {
    preloadCommonFonts().catch(err => {
      console.warn('Failed to preload some fonts:', err)
    })
  }, [])
  
  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  
  useEffect(() => {
    const handleZoomChange = (event: Event) => {
      const customEvent = event as CustomEvent
      const zoom = customEvent.detail.zoom
      setCurrentZoom(Math.round(zoom * 100))
    }
    
    window.addEventListener('canvas:zoom-change', handleZoomChange)
    return () => window.removeEventListener('canvas:zoom-change', handleZoomChange)
  }, [])
  
  useEffect(() => {
    const CANVAS_HEIGHT = 600
    const zoom = currentZoom / 100
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
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        !target.closest('[class*="fixed left-0 top-0"]') &&
        !target.closest('.konvajs-content') &&
        !target.closest('[role="dialog"]') &&
        !target.closest('.properties-panel')
      ) {
        clearSelection()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [clearSelection])
  
  return (
    <div className="relative h-screen bg-gray-50 overflow-hidden">
      {/* Back to Dashboard Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-4 left-4 z-30 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Dashboard</span>
      </button>

      {/* Canvas Area */}
      <div className="absolute inset-0">
        <div ref={canvasContainerRef} className="w-full h-full" style={{ backgroundColor: '#f9f9f9' }}>
          <SlideCanvas 
            containerWidth={canvasSize.width}
            containerHeight={canvasSize.height}
            viewportOffset={(() => {
              if (textInputHeight <= 32) return 0
              const textInputHandleY = canvasSize.height - textInputHeight - 16
              const gap = textInputHandleY - slideBottomY
              if (gap > 0) return 0
              const desiredGap = 8
              const overlapAmount = slideBottomY - textInputHandleY + desiredGap
              return Math.max(0, overlapAmount)
            })()}
          />
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 flex items-center gap-4 z-20">
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
        
        <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
          <span className="text-xs text-gray-600 font-medium">
            {currentZoom}%
          </span>
        </div>
      </div>
      
      <Sidebar onAddSlide={() => setIsTemplateModalOpen(true)} />
      
      <RightSidebar 
        onPlaySlideshow={() => {
          console.log('Play slideshow')
        }}
        onExportAllPDF={async () => {
          try {
            const toastId = toast.loading('Generating PDF for all slides...')
            const fileName = presentation?.title ? 
              `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf` : 
              'presentation.pdf'
            await exportSlidesToPDF({
              slides,
              slideOrder: presentation?.slides,
              fileName,
              onProgress: (progress) => {
                toast.loading(`Generating PDF... ${Math.round(progress)}%`, toastId)
              }
            })
            toast.success('All slides exported successfully!', toastId)
          } catch (error) {
            console.error('Failed to export PDF:', error)
            toast.error('Failed to export PDF. Please try again.')
          }
        }}
        onExportCurrentPDF={async () => {
          try {
            const currentSlide = slides.find(s => s.id === currentSlideId)
            if (!currentSlide) {
              toast.error('No slide selected')
              return
            }
            const toastId = toast.loading('Generating PDF for current slide...')
            const slideIndex = slides.findIndex(s => s.id === currentSlideId) + 1
            const fileName = presentation?.title ? 
              `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_slide_${slideIndex}.pdf` : 
              `slide_${slideIndex}.pdf`
            await exportSlidesToPDF({
              slides: [currentSlide],
              fileName,
              onProgress: (progress) => {
                toast.loading(`Generating PDF... ${Math.round(progress)}%`, toastId)
              }
            })
            toast.success(`Slide ${slideIndex} exported successfully!`, toastId)
          } catch (error) {
            console.error('Failed to export PDF:', error)
            toast.error('Failed to export PDF. Please try again.')
          }
        }}
      />
      
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={(template: SlideTemplate) => {
          addSlide(template)
          setIsTemplateModalOpen(false)
        }}
      />
      
      <TemplateDesigner
        isOpen={isTemplateDesignerOpen}
        onClose={() => setIsTemplateDesignerOpen(false)}
      />
      
      {isTemplateDesignerOpen && <DataKeyHelper />}
      
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
      
      <CollapsibleTextInput 
        placeholder="Add a prompt..."
        onHeightChange={setTextInputHeight}
        onSubmit={(text, selectedProfile, selectedLesson, useGeniusMode, selectedSlides) => {
          console.log('Generated:', {
            text,
            profile: selectedProfile,
            lesson: selectedLesson,
            model: 'gpt-5-mini',
            geniusMode: useGeniusMode,
            slides: selectedSlides
          })
        }}
      />
      
      <ToastContainer />
    </div>
  )
}
