// src/components/sidebar/FloatingSidebar.tsx
import { useState, useRef, useEffect } from 'react'
import { 
  ChevronLeft,
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
  Search
} from 'lucide-react'
import useSlideStore from '@/stores/slideStore'
import SlidePreview from '@/components/previews/SlidePreview'
import { formatDistanceToNow } from 'date-fns'
import type { TextContent, ShapeContent, BlurbContent } from '@/types/slide.types'
import { measureAutoText } from '@/utils/text.utils'
import { getShapeById } from '@/utils/svg-shapes'

interface FloatingSidebarProps {
  onAddSlide: () => void
}

export default function FloatingSidebar({ onAddSlide }: FloatingSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'elements' | 'slides'>('slides')
  const [lessonTitle, setLessonTitle] = useState('Lesson Title')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
    presentation,
    lastSaved,
    updatePresentationTitle
  } = useSlideStore()
  
  const currentSlideIndex = slides.findIndex(s => s.id === currentSlideId)
  const currentSlide = slides.find(s => s.id === currentSlideId)
  
  // Handle title editing
  useEffect(() => {
    if (presentation?.title) {
      setLessonTitle(presentation.title)
    }
  }, [presentation?.title])
  
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])
  
  const handleTitleSave = () => {
    setIsEditingTitle(false)
    updatePresentationTitle(lessonTitle)
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
    { icon: Square, label: 'Shapes', onClick: () => handleAddShape('rectangle') },
    { icon: MessageSquare, label: 'Speech', onClick: handleAddBlurb },
    { icon: Minus, label: 'Line', onClick: handleAddLine },
    { icon: Image, label: 'Image', onClick: handleAddImage },
    { icon: BarChart3, label: 'Chart', onClick: () => {} },
  ]
  
  return (
    <div
      ref={sidebarRef}
      className={`floating-sidebar fixed left-4 top-4 bottom-4 z-30 transition-all duration-300 ${
        isCollapsed ? 'w-[4.5rem]' : 'w-56'
      }`}
    >
      <div className="h-full bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700 ${isCollapsed ? 'mx-auto' : ''}`}>
              CF
            </div>
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {isCollapsed && (
              <button
                onClick={() => setIsCollapsed(false)}
                className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 rotate-180" />
              </button>
            )}
          </div>
          
          {!isCollapsed && (
            <>
              <div className="mb-1">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleTitleSave()
                      } else if (e.key === 'Escape') {
                        setLessonTitle(presentation?.title || 'Lesson Title')
                        setIsEditingTitle(false)
                      }
                    }}
                    className="w-full text-lg font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none px-1 py-0.5"
                  />
                ) : (
                  <h2
                    className="text-lg font-semibold cursor-pointer hover:text-gray-700"
                    onDoubleClick={() => setIsEditingTitle(true)}
                  >
                    {lessonTitle}
                  </h2>
                )}
              </div>
              <p className="text-xs text-gray-500">{formatSavedTime()}</p>
            </>
          )}
        </div>
        
        {/* Tab Navigation */}
        {!isCollapsed && (
          <div className="px-4 pt-4">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setActiveTab('elements')}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'elements'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Elements
              </button>
              <button
                onClick={() => setActiveTab('slides')}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'slides'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Slides
              </button>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {isCollapsed ? (
            <div className="space-y-2">
              <button
                onClick={onAddSlide}
                className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Add Slide"
              >
                <Plus className="w-5 h-5 mx-auto" />
              </button>
            </div>
          ) : activeTab === 'elements' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {elementButtons.map((button, index) => (
                  <button
                    key={index}
                    onClick={button.onClick}
                    className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-none"
                  >
                    <button.icon className="w-6 h-6 text-gray-700" />
                    <span className="text-sm font-medium text-gray-700">{button.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={onAddSlide}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Slides
              </button>
              
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
                      transition-all duration-200 hover:shadow-md overflow-hidden group
                      ${slide.id === selectedSlideId
                        ? 'border-blue-500 shadow-lg ring-2 ring-blue-400'
                        : slide.id === currentSlideId 
                          ? 'border-blue-300 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
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
                        <Copy className="w-3 h-3 text-gray-700" />
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
                          <Trash2 className="w-3 h-3 text-red-600" />
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
              </div>
            </div>
          )}
        </div>
        
        {/* Search Footer - Only show in elements tab */}
        {!isCollapsed && activeTab === 'elements' && (
          <div className="p-4 border-t border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 'f') {
                    e.preventDefault()
                    e.currentTarget.focus()
                  }
                }}
                className="w-full pl-9 pr-16 py-2 bg-transparent border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-50 text-sm placeholder-gray-400"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                Ctrl+F
              </kbd>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}