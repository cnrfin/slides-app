// src/components/sidebar/Sidebar.tsx
import { useState, useRef, useEffect } from 'react'
import { 
  Plus,
  Copy,
  Trash2,
  Type,
  Square,
  Circle,
  MessageSquare,
  Minus,
  Image,
  BarChart3,
  Table,
  Sparkles
} from 'lucide-react'
import useSlideStore from '@/stores/slideStore'
import SlidePreview from '@/components/previews/SlidePreview'
import { formatDistanceToNow } from 'date-fns'
import type { TextContent, ShapeContent, BlurbContent } from '@/types/slide.types'
import { measureAutoText } from '@/utils/text.utils'
import { getShapeById } from '@/utils/svg-shapes'
import ShapePopup from './popups/ShapePopup'
import IconsPopup from './popups/IconsPopup'
import ChartModal from './popups/ChartModal'
import TablePopup from './popups/TablePopup'
import { TabGroup } from '@/components/ui'

interface SidebarProps {
  onAddSlide: () => void
}

export default function Sidebar({ onAddSlide }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'elements' | 'slides'>('slides')
  const [lessonTitle, setLessonTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [activeLineTool, setActiveLineTool] = useState(false)
  const [showShapePopup, setShowShapePopup] = useState(false)
  const [showIconsPopup, setShowIconsPopup] = useState(false)
  const [showChartModal, setShowChartModal] = useState(false)
  const [showTablePopup, setShowTablePopup] = useState(false)
  const shapeButtonRef = useRef<HTMLButtonElement>(null)
  const iconsButtonRef = useRef<HTMLButtonElement>(null)
  const tableButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  
  const {
    slides,
    currentSlideId,
    selectedSlideId,
    setCurrentSlide,
    selectSlide,
    duplicateSlide,
    deleteSlide,
    addElement,
    addSlide,
    presentation,
    lastSaved,
    updatePresentationTitle
  } = useSlideStore()
  
  const currentSlideIndex = slides.findIndex(s => s.id === currentSlideId)
  const currentSlide = slides.find(s => s.id === currentSlideId)
  
  // Handle title editing
  useEffect(() => {
    if (presentation?.title !== undefined) {
      setLessonTitle(presentation.title || '')
    }
  }, [presentation?.title])
  
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  // Listen for line mode exit to deactivate line tool
  useEffect(() => {
    const handleExitLineMode = () => {
      setActiveLineTool(false)
    }

    const handleEscapePressed = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeLineTool) {
        setActiveLineTool(false)
      }
    }

    window.addEventListener('canvas:exit-line-mode', handleExitLineMode)
    window.addEventListener('keydown', handleEscapePressed)
    
    return () => {
      window.removeEventListener('canvas:exit-line-mode', handleExitLineMode)
      window.removeEventListener('keydown', handleEscapePressed)
    }
  }, [activeLineTool])
  
  const handleTitleSave = () => {
    setIsEditingTitle(false)
    // Use placeholder if title is empty
    const titleToSave = lessonTitle.trim() || 'Lesson Title'
    setLessonTitle(titleToSave)
    updatePresentationTitle(titleToSave)
  }
  
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
      shape: shape,
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
  }
  
  const handleAddBlurb = () => {
    if (!currentSlide) return
    
    const blurbContent: BlurbContent = {
      text: 'Type here',
      tailPosition: 'bottom-left',
    }
    
    addElement(currentSlide.id, {
      type: 'blurb',
      x: 325,
      y: 262.5,
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
  }
  
  const handleAddLine = () => {
    // Set line tool as active
    setActiveLineTool(true)
    // Emit event to start line drawing mode
    const event = new CustomEvent('canvas:start-line-mode')
    window.dispatchEvent(event)
  }
  
  const handleAddImage = () => {
    if (!currentSlide) return
    
    // Add a placeholder image element
    addElement(currentSlide.id, {
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
              <path d="M-35,-35 L35,-35 Q40,-35 40,-30 L40,20 Q40,25 35,25 L-35,25 Q-40,25 -40,20 L-40,-30 Q-40,-35 -35,-35 Z" 
                    fill="none" stroke="#9ca3af" stroke-width="3"/>
              <path d="M-35,5 L-10,-10 L5,0 L20,-15 L35,5 L35,20 L-35,20 Z" fill="#e5e7eb"/>
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
  }
  
  const formatSavedTime = () => {
    if (!lastSaved) return 'saved just now'
    try {
      return `saved ${formatDistanceToNow(new Date(lastSaved), { addSuffix: true })}`
    } catch {
      return 'saved recently'
    }
  }
  
  const elementButtons = [
    { icon: Type, label: 'Text', onClick: handleAddText },
    { icon: MessageSquare, label: 'Speech', onClick: handleAddBlurb },
    { icon: Square, label: 'Shapes', onClick: () => setShowShapePopup(!showShapePopup) },
    { icon: Sparkles, label: 'Icons', onClick: () => setShowIconsPopup(!showIconsPopup) },
    { icon: Minus, label: 'Line', onClick: handleAddLine },
    { icon: Image, label: 'Image', onClick: handleAddImage },
    { icon: BarChart3, label: 'Chart', onClick: () => setShowChartModal(true) },
    { icon: Table, label: 'Table', onClick: () => setShowTablePopup(!showTablePopup) },
  ]
  
  return (
    <div
      ref={sidebarRef}
      className="fixed left-0 top-0 h-screen z-30 transition-all duration-300 w-56"
    >
      <div className="h-full border-r border-gray-200 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
              CF
            </div>
          </div>
          
          <>
              <div className="mb-1">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    placeholder="Lesson Title..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleTitleSave()
                      } else if (e.key === 'Escape') {
                        setLessonTitle(presentation?.title || '')
                        setIsEditingTitle(false)
                      }
                    }}
                    className="w-full text-lg font-semibold bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none px-1 py-0.5"
                  />
                ) : (
                  <h2
                    className={`text-lg font-semibold cursor-pointer hover:text-gray-700 truncate ${
                      !lessonTitle ? 'text-gray-400' : ''
                    }`}
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {lessonTitle || 'Lesson Title...'}
                  </h2>
                )}
              </div>
              <p className="text-xs text-gray-500">{formatSavedTime()}</p>
          </>
        </div>
        
        {/* Tab Navigation */}
        <div className="px-4 pt-4">
          <TabGroup
            tabs={[
              { id: 'elements', label: 'Elements' },
              { id: 'slides', label: 'Slides' }
            ]}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as 'elements' | 'slides')}
            className="mb-3"
          />
        </div>
        
        {/* Content */}
        <div className={`flex-1 overflow-y-auto scrollbar-hide ${
          activeTab === 'elements' ? 'pt-4' : 'p-4'
        }`}>
          {activeTab === 'elements' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-0">
                {elementButtons.map((button, index) => {
                  const isLineToolActive = button.label === 'Line' && activeLineTool
                  const isShapeButton = button.label === 'Shapes'
                  const isIconsButton = button.label === 'Icons'
                  const isTableButton = button.label === 'Table'
                  return (
                    <button
                      key={index}
                      ref={isShapeButton ? shapeButtonRef : isIconsButton ? iconsButtonRef : isTableButton ? tableButtonRef : undefined}
                      onClick={button.onClick}
                      className={`flex flex-col items-center gap-2 p-4 transition-colors ${
                        isLineToolActive
                          ? 'bg-blue-500 text-white'
                          : (isShapeButton && showShapePopup) || (isIconsButton && showIconsPopup) || (isTableButton && showTablePopup)
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-white hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <button.icon className={`w-6 h-6 ${isLineToolActive ? 'text-white' : 'text-gray-700'}`} strokeWidth={1} />
                      <span className={`text-sm ${isLineToolActive ? 'text-white' : 'text-gray-700'}`}>{button.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    onClick={() => {
                      setCurrentSlide(slide.id)
                      selectSlide(slide.id)
                    }}
                    className={`
                      relative aspect-[4/3] bg-white border-2 rounded-lg cursor-pointer
                      transition-all duration-200 overflow-hidden group
                      ${slide.id === selectedSlideId
                        ? 'border-blue-500 ring-2 ring-blue-400'
                        : slide.id === currentSlideId 
                          ? 'border-blue-300' 
                          : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    style={{
                      boxShadow: slide.id === selectedSlideId || slide.id === currentSlideId
                        ? 'var(--shadow-primary)'
                        : undefined
                    }}
                    onMouseEnter={(e) => {
                      if (slide.id !== selectedSlideId && slide.id !== currentSlideId) {
                        e.currentTarget.style.boxShadow = 'var(--shadow-primary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (slide.id !== selectedSlideId && slide.id !== currentSlideId) {
                        e.currentTarget.style.boxShadow = ''
                      }
                    }}
                  >
                    {/* Action buttons on hover */}
                    <div className="absolute top-1 right-1 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateSlide(slide.id)
                        }}
                        className="p-1.5 bg-white/90 backdrop-blur-sm rounded hover:bg-gray-100 transition-colors shadow-sm"
                        title="Duplicate slide"
                      >
                        <Copy className="w-3 h-3 text-gray-700" strokeWidth={1} />
                      </button>
                      {slides.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm('Are you sure you want to delete this slide?')) {
                              deleteSlide(slide.id)
                            }
                          }}
                          className="p-1.5 bg-white/90 backdrop-blur-sm rounded hover:bg-red-100 transition-colors shadow-sm"
                          title="Delete slide"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" strokeWidth={1} />
                        </button>
                      )}
                    </div>
                    
                    {/* Slide preview */}
                    <SlidePreview slide={slide} className="absolute inset-0" />
                    
                    {/* Slide number */}
                    <div className="absolute bottom-1 right-1 bg-white/80 text-gray-700 text-xs font-medium px-1.5 py-0.5 rounded z-10">
                      {index + 1}
                    </div>
                  </div>
                ))}
                
                {/* Add new slide button */}
                <button
                  onClick={() => addSlide()}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-5 h-5" strokeWidth={1} />
                </button>
            </div>
          )}
        </div>
        
        {/* Footer - Only for Slides tab */}
        {activeTab === 'slides' && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={onAddSlide}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
              style={{ borderRadius: '0.5rem' }}
            >
              Add Slides
            </button>
          </div>
        )}
      </div>
      
      {/* Shape Popup */}
      <ShapePopup
        isOpen={showShapePopup}
        onClose={() => setShowShapePopup(false)}
        anchorElement={shapeButtonRef.current}
      />
      
      {/* Icons Popup */}
      <IconsPopup
        isOpen={showIconsPopup}
        onClose={() => setShowIconsPopup(false)}
        anchorElement={iconsButtonRef.current}
      />
      
      {/* Table Popup */}
      <TablePopup
        isOpen={showTablePopup}
        onClose={() => setShowTablePopup(false)}
        anchorElement={tableButtonRef.current}
      />
      
      {/* Chart Modal */}
      <ChartModal
        isOpen={showChartModal}
        onClose={() => setShowChartModal(false)}
        onAddToSlide={(imageDataUrl, width, height) => {
          // Add chart to current slide
          if (!currentSlide) return
          
          addElement(currentSlide.id, {
            type: 'image',
            x: 400 - width / 2,  // Center on canvas (800px width assumed)
            y: 300 - height / 2, // Center on canvas (600px height assumed)
            width,
            height,
            content: {
              src: imageDataUrl,
              alt: 'Generated Chart',
              objectFit: 'contain',
              isPlaceholder: false,
              offsetX: 0.5,
              offsetY: 0.5,
              scale: 1
            },
            style: {},
          })
          
          setShowChartModal(false)
        }}
      />
    </div>
  )
}