// src/components/layout/GlobalHeader.tsx
import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Star, ArrowLeft, Play } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import useSlideStore from '@/stores/slideStore'
import ExportDropdown from '@/components/ui/ExportDropdown'
import { toast } from '@/utils/toast'
import { exportSlidesToPDF } from '@/utils/pdf-export'
import { googleDriveService } from '@/services/googleDrive'

interface GlobalHeaderProps {
  // For Canvas page specific props
  onNavigateBack?: () => void
  onPlaySlideshow?: () => void
  onExportAllPDF?: () => void
  onExportCurrentPDF?: () => void
  onSaveToDrive?: () => void
}

export default function GlobalHeader({ 
  onNavigateBack, 
  onPlaySlideshow,
  onExportAllPDF,
  onExportCurrentPDF,
  onSaveToDrive 
}: GlobalHeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { presentation, slides, updatePresentationTitle, saveToDatabase } = useSlideStore()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(presentation?.title || '')
  const titleInputRef = useRef<HTMLInputElement>(null)
  
  // Determine if we're on the canvas page
  const isCanvasPage = location.pathname === '/canvas'
  const isLandingPage = location.pathname === '/' || location.pathname === '/login'
  
  // Don't show header on landing/login pages
  if (isLandingPage) {
    return null
  }
  
  // Handle upgrade button click
  const handleUpgradeClick = () => {
    navigate('/dashboard/billing')
  }
  
  // Update titleValue when presentation changes
  useEffect(() => {
    setTitleValue(presentation?.title || '')
  }, [presentation?.title])
  
  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])
  
  // Handle title edit
  const handleTitleClick = () => {
    if (isCanvasPage) {
      setIsEditingTitle(true)
    }
  }
  
  const handleTitleSave = async () => {
    if (titleValue.trim() && titleValue !== presentation?.title) {
      updatePresentationTitle(titleValue.trim())
      // Auto-save to database
      await saveToDatabase(true)
    } else if (!titleValue.trim()) {
      // Revert to original title if empty
      setTitleValue(presentation?.title || 'Untitled Lesson')
    }
    setIsEditingTitle(false)
  }
  
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setTitleValue(presentation?.title || 'Untitled Lesson')
      setIsEditingTitle(false)
    }
  }
  
  // Check if user has upgraded (pro or max tier)
  const hasUpgraded = user?.subscription_tier === 'pro' || user?.subscription_tier === 'max'
  
  return (
    <header 
      className="sticky top-0 w-full bg-white flex items-center justify-between px-6 py-4 z-50"
      style={{ 
        borderBottom: '1px solid var(--border-gray, #d9d9d9)',
        height: '60px'
      }}
    >
      {/* Left side */}
      <div className="flex items-center">
        {isCanvasPage ? (
          // Canvas page: Back button and lesson title
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateBack || (() => navigate('/dashboard'))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
            </button>
            {presentation && (
              <div className="relative">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyDown}
                    className="text-gray-900 bg-transparent outline-none"
                    style={{
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontSize: 'var(--text-h5)',
                      fontWeight: '500',
                      lineHeight: 'var(--leading-heading)',
                      letterSpacing: 'var(--tracking-heading)',
                      borderBottom: '2px dashed #9ca3af',
                      paddingBottom: '2px'
                    }}
                  />
                ) : (
                  <h2 
                    onClick={handleTitleClick}
                    className="text-gray-900 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontSize: 'var(--text-h5)',
                      fontWeight: '500',
                      lineHeight: 'var(--leading-heading)',
                      letterSpacing: 'var(--tracking-heading)'
                    }}
                    title="Click to edit"
                  >
                    {presentation.title || 'Untitled Lesson'}
                  </h2>
                )}
              </div>
            )}
          </div>
        ) : (
          // Other pages: Logo
          <img
            src="/src/images/LOGO.svg"
            alt="TutorSlides"
            className="h-6"
          />
        )}
      </div>
      
      {/* Right side */}
      <div className="flex items-center gap-3">
        {isCanvasPage ? (
          // Canvas page: Presentation preview and export buttons
          <>
            <button
              onClick={onPlaySlideshow}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Play Slideshow"
            >
              <Play className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
            </button>
            <ExportDropdown
              onExportAll={onExportAllPDF || (async () => {
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
              })}
              onExportCurrent={onExportCurrentPDF || (async () => {
                try {
                  const currentSlideId = useSlideStore.getState().currentSlideId
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
              })}
              onSaveToDrive={onSaveToDrive || (async () => {
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
              })}
            />
          </>
        ) : (
          // Other pages: Upgrade button (if not upgraded)
          !hasUpgraded && (
            <button
              onClick={handleUpgradeClick}
              className="flex items-center gap-2 px-4 py-2 bg-app-purple-700 hover:bg-app-purple rounded-md text-white font-medium transition-colors"
            >
              <Star className="w-4 h-4 fill-app-yellow-400" strokeWidth={0} />
              Upgrade
            </button>
          )
        )}
      </div>
    </header>
  )
}
