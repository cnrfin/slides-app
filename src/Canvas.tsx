// src/Canvas.tsx
import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate, useBeforeUnload } from 'react-router-dom'
import SlideCanvas from '@/components/canvas/SlideCanvas'
import useSlideStore from '@/stores/slideStore'
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts'
import TemplateModal from '@/components/templates/TemplateModal'
import RightSidebar from '@/components/sidebar/RightSidebar'
import TemplateDesigner from '@/components/TemplateDesigner'
import DataKeyHelper from '@/components/DataKeyHelper'
import Sidebar from '@/components/sidebar/Sidebar'
import GlobalHeader from '@/components/layout/GlobalHeader'
import { Plus, ChevronLeft, ChevronRight, Undo2, Redo2, Wand2, ArrowLeft, Loader2 } from 'lucide-react'
import type { SlideTemplate } from '@/types/template.types'
import { preloadCommonFonts } from '@/utils/font.utils'
import SlidePreview from '@/components/previews/SlidePreview'
import { Trash2, Copy } from 'lucide-react'
import CollapsibleTextInput from '@/components/ui/CollapsibleTextInput'
import ToastContainer from '@/components/ui/Toast'
import { exportSlidesToPDF } from '@/utils/pdf-export'
import { toast } from '@/utils/toast'
import { populateTemplate } from '@/utils/template.utils'
import { nanoid } from 'nanoid'
import { googleDriveService } from '@/services/googleDrive'
import useAuthStore from '@/stores/authStore'

export default function Canvas() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [templateTargetSlideId, setTemplateTargetSlideId] = useState<string | null>(null)
  const [isTemplateDesignerOpen, setIsTemplateDesignerOpen] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(75)
  const [textInputHeight, setTextInputHeight] = useState(0)
  const [slideBottomY, setSlideBottomY] = useState(0)
  const [isLoadingLesson, setIsLoadingLesson] = useState(false)
  
  useKeyboardShortcuts()
  
  const {
    presentation,
    slides,
    currentSlideId,
    selectedSlideId,
    createPresentation,
    addSlide,
    applyTemplateToSlide,
    setCurrentSlide,
    selectSlide,
    clearSelection,
    duplicateSelectedSlide,
    deleteSelectedSlide,
    canUndo,
    canRedo,
    undo,
    redo,
    loadFromDatabase,
    resetStore,
    hasUnsavedChanges,
    saveToDatabase,
  } = useSlideStore()
  
  // Track if we've already processed the initial load
  const [hasProcessedInitialLoad, setHasProcessedInitialLoad] = useState(false)
  
  // Handle browser refresh/close
  useBeforeUnload(
    useCallback(
      (e) => {
        if (hasUnsavedChanges()) {
          e.preventDefault()
          e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
          return e.returnValue
        }
      },
      [hasUnsavedChanges]
    )
  )
  
  // Handle navigation away from canvas
  const handleNavigation = useCallback(
    (path: string) => {
      if (hasUnsavedChanges()) {
        setPendingNavigation(path)
        setShowLeaveConfirmation(true)
      } else {
        resetStore()
        navigate(path)
      }
    },
    [hasUnsavedChanges, resetStore, navigate]
  )
  
  // Listen for navigation back event from sidebar
  useEffect(() => {
    const handleNavigateBack = () => {
      handleNavigation('/dashboard')
    }
    
    window.addEventListener('canvas:navigate-back', handleNavigateBack)
    return () => window.removeEventListener('canvas:navigate-back', handleNavigateBack)
  }, [handleNavigation])
  
  // Handle confirmation dialog actions
  const handleLeaveConfirm = useCallback(async (saveFirst: boolean) => {
    if (saveFirst) {
      await saveToDatabase()
    }
    resetStore()
    if (pendingNavigation) {
      navigate(pendingNavigation)
      setPendingNavigation(null)
    }
    setShowLeaveConfirmation(false)
  }, [saveToDatabase, resetStore, navigate, pendingNavigation])
  
  const handleLeaveCancel = useCallback(() => {
    setShowLeaveConfirmation(false)
    setPendingNavigation(null)
  }, [])
  
  // Cleanup on unmount
  useEffect(() => {
    // Store is already reset through navigation handler for normal navigation
    // This cleanup is for edge cases like browser back/forward
    return () => {
      // Only reset if we're actually leaving the canvas page
      // Check if the next location is not the canvas
      const currentPath = window.location.pathname
      if (currentPath !== '/canvas') {
        // Delay the reset slightly to avoid conflicts with navigation
        setTimeout(() => {
          const state = useSlideStore.getState()
          // Only reset if we haven't already navigated back to canvas
          if (window.location.pathname !== '/canvas') {
            state.resetStore()
          }
        }, 0)
      }
    }
  }, [])
  
  // Check if we need to load an existing lesson
  useEffect(() => {
    // Skip if we've already processed the initial load
    if (hasProcessedInitialLoad) return
    
    const loadLesson = async () => {
      if (location.state?.lessonId) {
        console.log('Loading lesson:', location.state.lessonId)
        setIsLoadingLesson(true)
        setHasProcessedInitialLoad(true) // Mark as processed immediately
        
        try {
          await loadFromDatabase(location.state.lessonId)
          // Clear the state after loading
          navigate('/canvas', { replace: true })
        } catch (error) {
          console.error('Failed to load lesson:', error)
          toast.error('Failed to load lesson. Starting with a blank canvas.')
          // If loading fails, create a new presentation
          if (!presentation) {
            createPresentation('My Language Lesson')
          }
        } finally {
          setIsLoadingLesson(false)
        }
      } else if (location.state?.action === 'applyGenerated' && location.state?.generatedData) {
        // Handle generated data from dashboard
        console.log('Applying generated data:', location.state.generatedData)
        setHasProcessedInitialLoad(true) // Mark as processed
        
        // Ensure we have a presentation
        if (!presentation) {
          createPresentation(location.state.generatedData.lessonTitle || 'My Language Lesson')
        }
        
        // Apply the generated slides
        applyGeneratedSlides(location.state.generatedData, location.state.selectedTemplates)
        
        // Clear the state after applying
        navigate('/canvas', { replace: true })
      } else {
        // No special state, just ensure we have a presentation
        setHasProcessedInitialLoad(true) // Mark as processed
        if (!presentation) {
          createPresentation('My Language Lesson')
        }
      }
    }
    
    loadLesson()
  }, [location.state?.lessonId, location.state?.action, hasProcessedInitialLoad]) // Removed dependencies that could cause re-runs
  
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
  
  const applyGeneratedSlides = (generatedData: any, selectedTemplates: SlideTemplate[]) => {
    if (!generatedData?.slides || !Array.isArray(generatedData.slides)) {
      console.error('Invalid generated data structure')
      return
    }
    
    // Get all current slide IDs to delete later
    const slidesToDelete = [...slides].map(s => s.id)
    
    // Clear selection before modifying slides
    clearSelection()
    
    // Track new slide IDs as we add them
    const newSlideIds: string[] = []
    
    // Add each template with its generated data
    selectedTemplates.forEach((template, index) => {
      const slideData = generatedData.slides[index] || {}
      
      // Deep clone the template to ensure we're working with fresh data
      const freshTemplate = JSON.parse(JSON.stringify(template))
      
      // Special handling for synonyms-exercise to use alternate synonyms
      if (freshTemplate.id === 'synonyms-exercise') {
        // Create modified elements that use synonym2 for duplicate references
        const modifiedElements = freshTemplate.elements.map((el: any) => {
          if (el.type === 'text' && el.content && 'text' in el.content) {
            const textContent = el.content as any
            // Remap duplicate synonym references based on y-position to use synonym2
            if (el.y === 426 && textContent.text === '{{vocabulary[0].synonym}}') {
              return { ...el, content: { ...el.content, text: '{{vocabulary[0].synonym2}}' } }
            }
            if (el.y === 470 && textContent.text === '{{vocabulary[2].synonym}}') {
              return { ...el, content: { ...el.content, text: '{{vocabulary[2].synonym2}}' } }
            }
            if (el.y === 518 && textContent.text === '{{vocabulary[3].synonym}}') {
              return { ...el, content: { ...el.content, text: '{{vocabulary[3].synonym2}}' } }
            }
          }
          return el
        })
        
        // Create data keys mapping for modified elements
        const dataKeys: Record<string, string> = {}
        modifiedElements.forEach((el: any) => {
          if (el.type === 'text' && el.content && 'text' in el.content) {
            const textContent = el.content as any
            const matches = textContent.text.matchAll(/\{\{([^}]+)\}\}/g)
            for (const match of matches) {
              if (el.id) {
                dataKeys[el.id] = match[1].trim()
              }
            }
          }
        })
        
        // Populate with modified elements
        const populatedElements = populateTemplate(modifiedElements, dataKeys, slideData)
        
        // Create a fresh template-like object for the slide
        const slideTemplate: SlideTemplate = {
          id: nanoid(), // Fresh ID for this template instance
          name: freshTemplate.name,
          category: freshTemplate.category,
          description: freshTemplate.description,
          background: freshTemplate.background,
          elements: JSON.parse(JSON.stringify(populatedElements)), // Deep clone to ensure fresh objects
          tags: ['ai-generated', ...(freshTemplate.tags || [])]
        }
        const newSlideId = addSlide(slideTemplate)
        newSlideIds.push(newSlideId)
      } else {
        // Create data keys mapping based on template elements
        const dataKeys: Record<string, string> = {}
        
        // Analyze template elements to find placeholders
        freshTemplate.elements.forEach((el: any) => {
          if (el.type === 'text' && el.content && 'text' in el.content) {
            const textContent = el.content as any
            const matches = textContent.text.matchAll(/\{\{([^}]+)\}\}/g)
            for (const match of matches) {
              if (el.id) {
                dataKeys[el.id] = match[1].trim()
              }
            }
          }
        })
        
        // Populate the template with data
        const populatedElements = populateTemplate(freshTemplate.elements, dataKeys, slideData)
        
        // Create a fresh template-like object for the slide
        const slideTemplate: SlideTemplate = {
          id: nanoid(), // Fresh ID for this template instance
          name: freshTemplate.name,
          category: freshTemplate.category,
          description: freshTemplate.description,
          background: freshTemplate.background,
          elements: JSON.parse(JSON.stringify(populatedElements)), // Deep clone to ensure fresh objects
          tags: ['ai-generated', ...(freshTemplate.tags || [])]
        }
        const newSlideId = addSlide(slideTemplate)
        newSlideIds.push(newSlideId)
      }
    })
    
    // Now delete all the old slides that are not in the new slides
    slidesToDelete.forEach(slideId => {
      // Skip if this is one of our new slides (shouldn't happen but just in case)
      if (newSlideIds.includes(slideId)) {
        return
      }
      
      const freshState = useSlideStore.getState()
      // Only delete if:
      // 1. We have more than one slide (to avoid deleting the last slide)
      // 2. The slide still exists
      // 3. It's not a newly added slide
      if (freshState.slides.length > 1 && 
          freshState.slides.some(s => s.id === slideId) &&
          !newSlideIds.includes(slideId)) {
        freshState.deleteSlide(slideId)
      }
    })
  }
  
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
  
  // Show loading state while lesson is being loaded
  if (isLoadingLesson) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative h-screen bg-gray-50 overflow-hidden flex flex-col">
      {/* Global Header */}
      <GlobalHeader 
        onNavigateBack={() => handleNavigation('/dashboard')}
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
        onSaveToDrive={async () => {
          if (!user) {
            toast.error('Please log in to save to Google Drive')
            return
          }

          const toastId = toast.loading('Preparing to save to Google Drive...')
          
          try {
            const pdfBlob = await exportSlidesToPDF({
              slides,
              slideOrder: presentation?.slides,
              returnBlob: true
            })
            
            const fileName = presentation?.title ? 
              `${presentation.title}_${new Date().toISOString().split('T')[0]}.pdf` : 
              `presentation_${new Date().toISOString().split('T')[0]}.pdf`
            
            const result = await googleDriveService.uploadToDrive(
              user.id,
              pdfBlob,
              fileName,
              'application/pdf'
            )
            
            toast.success('Saved to Google Drive successfully!', toastId)
            
            if (result.id) {
              window.open(`https://drive.google.com/file/d/${result.id}/view`, '_blank')
            }
          } catch (error: any) {
            console.error('Failed to save to Drive:', error)
            toast.dismiss(toastId)
            
            if (error.message?.includes('cancelled by user')) {
              // User closed the popup - no need to show an error
            } else if (error.message?.includes('timeout')) {
              toast.error('Authentication timed out. Please try again.')
            } else if (error.message?.includes('authenticate')) {
              toast.error('Please authorize Google Drive access and try again')
            } else if (error.message?.includes('popup')) {
              toast.error('Please allow popups for Google Drive authentication')
            } else {
              toast.error(error.message || 'Failed to save to Google Drive')
            }
          }
        }}
      />

      {/* Leave Confirmation Dialog */}
      {showLeaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Unsaved Changes</h3>
            <p className="text-gray-600 mb-6">
              You have unsaved changes. Would you like to save your work before leaving?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleLeaveCancel}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLeaveConfirm(false)}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Leave Without Saving
              </button>
              <button
                onClick={() => handleLeaveConfirm(true)}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Area - Now flex-1 to fill remaining space */}
      <div className="relative flex-1">
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
      
      {/* Toolbar - Positioned within canvas area */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 flex items-center gap-4 z-20">
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
      
      <Sidebar 
        onAddSlide={() => {
          setTemplateTargetSlideId(null)
          setIsTemplateModalOpen(true)
        }}
        onApplyTemplateToSlide={(slideId) => {
          setTemplateTargetSlideId(slideId)
          setIsTemplateModalOpen(true)
        }}
      />
      
      <RightSidebar />
      
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false)
          setTemplateTargetSlideId(null)
        }}
        onSelectTemplate={(template: SlideTemplate) => {
          if (templateTargetSlideId) {
            // Apply template to existing slide
            applyTemplateToSlide(templateTargetSlideId, template)
          } else {
            // Add new slide with template
            addSlide(template)
          }
          setIsTemplateModalOpen(false)
          setTemplateTargetSlideId(null)
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
