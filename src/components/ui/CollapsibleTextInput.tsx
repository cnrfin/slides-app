import React, { useState, useRef, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Plus, X, ArrowUp, ArrowLeft, Brain, Layers, User, BookOpen, AlertCircle, Loader2, FileText, File } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { generateLesson } from '@/services/lessonGeneration'
import useSlideStore from '@/stores/slideStore'
import { nanoid } from 'nanoid'
import type { SlideTemplate } from '@/types/template.types'
import { populateTemplate } from '@/utils/template.utils'
import { useTemplates } from '@/hooks/useTemplates'
import Modal from './Modal'
import { showToast, clearLoadingToasts } from './Toast'
import { getUserStudentProfiles, getCurrentUser } from '@/lib/database'
import { useLessons } from '@/hooks/useLessons'
import { parseFile, formatFileSize, type FileUpload } from '@/utils/fileUtils'
import { EnhancedSlideSelector, type SelectedSlideInstance } from './SlideSelector'

interface StudentProfile {
  id: string
  name: string
  target_language?: string
  native_language?: string
  level?: string
  goals?: string[]
  interests?: string
}

interface Lesson {
  id: string
  title: string
  description?: string
  vocabulary?: string[]
  grammarPoints?: string[]
  topics?: string[]
  date?: string
  created_at?: string
  updated_at?: string
  target_language?: string
  slide_order?: string[]
}

interface CollapsibleTextInputProps {
  placeholder?: string
  onSubmit?: (text: string, selectedProfile?: StudentProfile, selectedLesson?: Lesson, useGeniusMode?: boolean, selectedSlides?: SelectedSlideInstance[]) => void
  onHeightChange?: (totalHeight: number) => void
  minHeight?: number
  maxHeight?: number
  defaultHeight?: number
}

type PopupView = 'main' | 'slides' | 'student' | 'lesson'

const CollapsibleTextInput: React.FC<CollapsibleTextInputProps> = ({
  placeholder = "Add a prompt...",
  onSubmit,
  onHeightChange,
  minHeight = 0,
  maxHeight = 400,
  defaultHeight = 0,
}) => {
  const navigate = useNavigate()
  const [contentHeight, setContentHeight] = useState(defaultHeight)
  const [isDragging, setIsDragging] = useState(false)
  const [text, setText] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isHoveringHandle, setIsHoveringHandle] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupView, setPopupView] = useState<PopupView>('main')
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedSlides, setSelectedSlides] = useState<SelectedSlideInstance[]>([])
  const [showEnhancedSelector, setShowEnhancedSelector] = useState(false)
  const [lessonSearchQuery, setLessonSearchQuery] = useState('')
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [popupPosition, setPopupPosition] = useState<{ bottom: number; left: number } | null>(null)
  const [isGeniusMode, setIsGeniusMode] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const { lessons, loadingLessons } = useLessons()
  
  // File upload states
  const [uploadedFile, setUploadedFile] = useState<FileUpload | null>(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [showFileContainer, setShowFileContainer] = useState(false)
  
  // Scroll state for fade gradient
  const [showFadeGradient, setShowFadeGradient] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dragStartY = useRef(0)
  const dragStartHeight = useRef(0)
  const justFinishedDragging = useRef(false)
  const plusButtonRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const footerScrollRef = useRef<HTMLDivElement>(null)

  const { templates } = useTemplates()
  const { slides, clearSelection, addSlide } = useSlideStore()

  // Load students from Supabase
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoadingStudents(true)
      const user = await getCurrentUser()
      if (!user) return
      
      const profiles = await getUserStudentProfiles(user.id)
      setStudents(profiles || [])
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoadingStudents(false)
    }
  }

  // Get actual templates from the templates hook
  const availableTemplates = templates
    .filter(t => t.category !== 'blank')
    .map(t => ({
      id: t.id,
      name: t.name,
      category: t.category
    }))

  // Filter students based on search query
  const filteredProfiles = students.filter(profile =>
    profile.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    profile.target_language?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    profile.native_language?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    profile.interests?.toLowerCase().includes(studentSearchQuery.toLowerCase())
  )

  // Filter lessons based on search query
  const filteredLessons = (lessons || []).filter(lesson =>
    lesson.title.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
    lesson.topics?.some((topic: string) => topic.toLowerCase().includes(lessonSearchQuery.toLowerCase()))
  )

  // Notify parent of height changes
  useEffect(() => {
    if (onHeightChange) {
      const totalHeight = 32 + contentHeight
      onHeightChange(totalHeight)
    }
  }, [contentHeight, onHeightChange])

  // Check for overflow on mount and when items change
  useEffect(() => {
    if (footerScrollRef.current) {
      const element = footerScrollRef.current
      const hasOverflow = element.scrollWidth > element.clientWidth
      const isAtEnd = Math.ceil(element.scrollLeft + element.clientWidth) >= element.scrollWidth
      setShowFadeGradient(hasOverflow && !isAtEnd)
    }
  }, [selectedSlides, selectedProfile, selectedLesson, isProcessingFile, showPopup])

  // Update popup position when button is clicked
  useEffect(() => {
    if (showPopup && plusButtonRef.current) {
      const buttonRect = plusButtonRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      const bottom = viewportHeight - buttonRect.top + 8
      const left = buttonRect.left
      
      setPopupPosition({ bottom, left })
    } else {
      setPopupPosition(null)
    }
  }, [showPopup])

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPopup && plusButtonRef.current && 
          !plusButtonRef.current.contains(event.target as Node)) {
        const popup = document.querySelector('.main-popup')
        if (popup && !popup.contains(event.target as Node)) {
          setShowPopup(false)
          setPopupView('main')
          setStudentSearchQuery('')
          setLessonSearchQuery('')
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPopup])

  // Handle mouse down on drag handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setIsHoveringHandle(false)
    dragStartY.current = e.clientY
    dragStartHeight.current = contentHeight
    document.body.style.cursor = 'ns-resize'
    document.body.style.userSelect = 'none'
  }, [contentHeight])

  // Handle mouse move during drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      const deltaY = dragStartY.current - e.clientY
      const newHeight = Math.max(minHeight, Math.min(maxHeight, dragStartHeight.current + deltaY))
      setContentHeight(newHeight)
    }

    const handleMouseUp = () => {
      if (!isDragging) return
      
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      
      justFinishedDragging.current = true
      setTimeout(() => {
        justFinishedDragging.current = false
      }, 100)
      
      if (contentHeight < 100) {
        setIsAnimating(true)
        setContentHeight(0)
        setTimeout(() => setIsAnimating(false), 200)
      }
      else if (contentHeight > 0 && textareaRef.current) {
        textareaRef.current.focus()
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, contentHeight, minHeight, maxHeight])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && text.trim()) {
      e.preventDefault()
      handleGenerate()
    }
    else if (e.key === 'Escape' && isExpanded) {
      e.preventDefault()
      setIsAnimating(true)
      setContentHeight(0)
      setTimeout(() => setIsAnimating(false), 200)
    }
  }

  const isExpanded = contentHeight > 0

  const handleDragHandleClick = useCallback(() => {
    if (justFinishedDragging.current) {
      return
    }
    
    if (!isExpanded && !isDragging) {
      setIsAnimating(true)
      setContentHeight(200)
      setTimeout(() => {
        setIsAnimating(false)
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 200)
    }
  }, [isExpanded, isDragging])

  // Add Cmd/Ctrl + K shortcut to toggle expansion
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!isExpanded) {
          handleDragHandleClick()
        } else {
          setIsAnimating(true)
          setContentHeight(0)
          setTimeout(() => setIsAnimating(false), 200)
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isExpanded, handleDragHandleClick])

  // File handling functions
  const handleFileSelect = async (file: File) => {
    setIsProcessingFile(true)
    try {
      const fileUpload = await parseFile(file)
      setUploadedFile(fileUpload)
      setShowFileContainer(true)
      showToast('success', `File "${file.name}" uploaded successfully`)
    } catch (error) {
      console.error('Error processing file:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to process file')
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isExpanded) {
      setIsDraggingFile(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check if we're leaving the drop zone entirely
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDraggingFile(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]
    
    if (file) {
      handleFileSelect(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setShowFileContainer(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleGenerate = useCallback(() => {
    const currentText = text.trim()
    if (!currentText) return
    
    // Show confirmation modal with the data to be submitted
    setShowConfirmModal(true)
  }, [text])

  const confirmAndGenerate = async () => {
    // Capture current values to avoid closure issues
    const currentText = text.trim()
    const currentSelectedProfile = selectedProfile
    const currentSelectedLesson = selectedLesson
    const currentIsGeniusMode = isGeniusMode
    const currentSelectedSlides = [...selectedSlides]
    
    if (!currentText) {
      setError('Please enter a prompt')
      return
    }
    
    setShowConfirmModal(false)
    setIsGenerating(true)
    setError(null)
    
    // Show loading toast
    showToast('loading', 'Generating lesson...', 0) // 0 duration means no auto-dismiss
    
    try {
      // Get the actual template objects for selected slides
      const selectedTemplateObjects: SlideTemplate[] = []
      currentSelectedSlides.forEach(slideInstance => {
        const template = templates.find(t => t.id === slideInstance.templateId)
        if (template) {
          selectedTemplateObjects.push(template)
        }
      })
      
      if (selectedTemplateObjects.length === 0) {
        throw new Error('Please select at least one slide template')
      }
      
      // Use the shared generateLesson service
      const data = await generateLesson({
        prompt: currentText,
        selectedTemplates: selectedTemplateObjects,
        selectedProfile: currentSelectedProfile,
        selectedLesson: currentSelectedLesson,
        isGeniusMode: currentIsGeniusMode,
        uploadedFile: uploadedFile
      })
      
      setGeneratedData(data)
      
      // Process and add slides
      if (data.slides && Array.isArray(data.slides)) {
        // Get the store instance for consistent access
        const store = useSlideStore.getState()
        
        // Get all current slide IDs to delete later
        const slidesToDelete = [...store.slides].map(s => s.id)
        
        // Clear selection before modifying slides
        clearSelection()
        
        // Track new slide IDs as we add them
        const newSlideIds: string[] = []
        
        // Add each template instance with its generated data
        currentSelectedSlides.forEach((slideInstance, index) => {
          const template = templates.find(t => t.id === slideInstance.templateId)
          if (!template) return
          
          const slideData = data.slides[index] || {}
          
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
            // Make sure elements are deep-cloned to avoid reference issues
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
            // Make sure elements are deep-cloned to avoid reference issues
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
        // We need to delete them one by one, checking state each time
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
        
        // Reset state after successful generation
        setText('')
        setSelectedSlides([])
        setSelectedProfile(null)
        setSelectedLesson(null)
        setIsGeniusMode(false)
        removeFile()
        setIsAnimating(true)
        setContentHeight(0)
        setTimeout(() => setIsAnimating(false), 200)
        
        // Clear loading toast and show success toast
        clearLoadingToasts()
        showToast('success', `Successfully generated ${selectedTemplateObjects.length} slides!`)
      }
    } catch (err) {
      console.error('Error generating content:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate content'
      setError(errorMsg)
      // Clear loading toast and show error toast
      clearLoadingToasts()
      showToast('error', errorMsg)
    } finally {
      setIsGenerating(false)
    }
  }

  const togglePopup = () => {
    if (!showPopup) {
      setPopupView('main')
      setShowPopup(true)
    } else {
      setShowPopup(false)
      setPopupView('main')
      setStudentSearchQuery('')
      setLessonSearchQuery('')
    }
  }

  const selectProfile = (profile: StudentProfile) => {
    setSelectedProfile(profile)
    setShowPopup(false)
    setPopupView('main')
    setStudentSearchQuery('')
  }

  const clearSelectedProfile = () => {
    setSelectedProfile(null)
  }

  const selectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setShowPopup(false)
    setPopupView('main')
    setLessonSearchQuery('')
  }

  const clearSelectedLesson = () => {
    setSelectedLesson(null)
  }

  const clearSelectedSlides = () => {
    setSelectedSlides([])
  }

  const toggleGeniusMode = () => {
    setIsGeniusMode(!isGeniusMode)
  }

  const handleAddNewStudent = () => {
    // Navigate to students page to add a new student
    navigate('/dashboard/students')
    setShowPopup(false)
    setPopupView('main')
    setStudentSearchQuery('')
  }

  const handleAddNewLesson = () => {
    // Navigate to lessons page to add a new lesson
    navigate('/dashboard/lessons')
    setShowPopup(false)
    setPopupView('main')
    setLessonSearchQuery('')
  }

  const handleOpenEnhancedSelector = () => {
    setShowPopup(false)
    setShowEnhancedSelector(true)
  }

  // Render the unified popup
  const renderPopup = () => {
    if (!showPopup || !isExpanded || !popupPosition) return null

    return ReactDOM.createPortal(
      <div 
        className="main-popup fixed bg-white rounded-lg shadow-lg border border-gray-200 animate-popup-in"
        style={{ 
          bottom: `${popupPosition.bottom}px`,
          left: `${popupPosition.left}px`,
          width: '320px',
          maxHeight: '400px',
          zIndex: 9
        }}
      >
        {popupView === 'main' && (
          <>
            <div className="p-3">
              <button
                onClick={handleOpenEnhancedSelector}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <Layers size={18} className="text-gray-600" strokeWidth={1.5} />
                <span className="text-sm text-gray-700">Add slides</span>
              </button>
              <button
                onClick={() => setPopupView('student')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <User size={18} className="text-gray-600" strokeWidth={1.5} />
                <span className="text-sm text-gray-700">Use a student</span>
              </button>
              <button
                onClick={() => setPopupView('lesson')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <BookOpen size={18} className="text-gray-600" strokeWidth={1.5} />
                <span className="text-sm text-gray-700">Use a lesson</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <FileText size={18} className="text-gray-600" strokeWidth={1.5} />
                <span className="text-sm text-gray-700">Upload article (.txt, .html, .pdf)</span>
              </button>
            </div>
          </>
        )}

        {popupView === 'student' && (
          <>
            {/* Search Bar with back button */}
            <div className="flex items-center gap-2 p-3 border-b border-gray-100">
              <button
                onClick={() => {
                  setPopupView('main')
                  setStudentSearchQuery('')
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} className="text-gray-600" strokeWidth={1.5} />
              </button>
              <input
                type="text"
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                placeholder="Search students"
                className="w-full px-3 py-1.5 text-sm outline-none bg-transparent"
              />
            </div>

            {/* Student List */}
            <div className="max-h-48 overflow-y-auto">
              {loadingStudents ? (
                <div className="px-4 py-6 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Loading students...</p>
                </div>
              ) : filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => selectProfile(profile)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-700">{profile.name}</div>
                    {profile.target_language && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Learning {profile.target_language}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  {students.length === 0 ? 'No students added yet' : 'No students found'}
                </div>
              )}
            </div>

            {/* Add New Student Button */}
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={handleAddNewStudent}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors text-sm"
              >
                <Plus size={16} className="text-gray-600" />
                <span className="text-gray-700">Add a new student</span>
              </button>
            </div>
          </>
        )}

        {popupView === 'lesson' && (
          <>
            {/* Search Bar with back button */}
            <div className="flex items-center gap-2 p-3 border-b border-gray-100">
              <button
                onClick={() => {
                  setPopupView('main')
                  setLessonSearchQuery('')
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} className="text-gray-600" strokeWidth={1.5} />
              </button>
              <input
                type="text"
                value={lessonSearchQuery}
                onChange={(e) => setLessonSearchQuery(e.target.value)}
                placeholder="Search lessons"
                className="w-full px-3 py-1.5 text-sm outline-none bg-transparent"
              />
            </div>

            {/* Lesson List */}
            <div className="max-h-64 overflow-y-auto">
              {loadingLessons ? (
                <div className="px-4 py-6 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Loading lessons...</p>
                </div>
              ) : filteredLessons.length > 0 ? (
                filteredLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => selectLesson(lesson)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-700">{lesson.title}</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  {lessons.length === 0 ? 'No lessons created yet' : 'No lessons found'}
                </div>
              )}
            </div>

            {/* Add New Lesson Button */}
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={handleAddNewLesson}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors text-sm"
              >
                <Plus size={16} className="text-gray-600" />
                <span className="text-gray-700">Create a new lesson</span>
              </button>
            </div>
          </>
        )}
      </div>,
      document.body
    )
  }

  return (
    <>
      {renderPopup()}
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.html,.pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Enhanced Slide Selector Modal */}
      {showEnhancedSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => {
            // Just close the modal without changing selected slides
            setShowEnhancedSelector(false)
          }} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl lg:max-w-6xl h-[90vh] sm:h-[85vh] overflow-hidden">
            <EnhancedSlideSelector
              availableTemplates={availableTemplates}
              onSelectionChange={setSelectedSlides}
              onClose={() => setShowEnhancedSelector(false)}
              disabled={isGenerating}
              initialSelection={selectedSlides}
            />
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Generation"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Prompt:</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{text || 'No prompt entered'}</p>
          </div>
          
          {selectedSlides.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Selected Templates ({selectedSlides.length}):</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedSlides.map((slide, index) => (
                  <li key={slide.instanceId} className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{index + 1}</span>
                    <span>{slide.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {selectedProfile && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Student Profile:</h3>
              <p className="text-sm text-gray-600">{selectedProfile.name} - {selectedProfile.target_language}</p>
            </div>
          )}
          
          {selectedLesson && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Previous Lesson:</h3>
              <p className="text-sm text-gray-600">{selectedLesson.title}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Model:</h3>
            <p className="text-sm text-gray-600">
              {isGeniusMode ? 'GPT-5 Mini (Advanced reasoning mode)' : 'GPT-5 Mini (Standard mode)'}
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This will clear all existing slides and replace them with the generated content.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              onClick={confirmAndGenerate}
              disabled={isGenerating || selectedSlides.length === 0}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>
          </div>
        </div>
      </Modal>
      
      <div
        className="fixed bottom-4 left-0 right-0 z-[5] flex justify-center"
        style={{ 
          paddingLeft: '256px',
          paddingRight: '256px',
        }}
      >
        <div style={{ width: '100%' }}>
          {/* Drag Handle - Always visible */}
          <div
            className={`h-8 flex items-center justify-center ${
              !isExpanded ? 'cursor-pointer' : 'cursor-ns-resize'
            }`}
            onMouseDown={(e) => {
              if (isExpanded) {
                handleMouseDown(e)
              }
            }}
            onClick={() => {
              if (!isExpanded) {
                handleDragHandleClick()
              }
            }}
            onMouseEnter={() => setIsHoveringHandle(true)}
            onMouseLeave={() => setIsHoveringHandle(false)}
          >
            <div 
              className={`flex items-center justify-center transition-all duration-300 ease-out ${
                !isExpanded
                  ? 'h-8 px-6 border hover:scale-110' 
                  : 'h-1 w-10 bg-gray-400 rounded-full'
              }`}
              style={{
                borderRadius: !isExpanded ? '9999px' : undefined,
                backgroundColor: !isExpanded ? '#ede8ff' : undefined,
                borderColor: !isExpanded ? '#ede8ff' : undefined
              }}
              onMouseEnter={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.backgroundColor = '#ede8ff'
                  e.currentTarget.classList.add('shadow-sm')
                  e.currentTarget.style.borderColor = '#ede8ff'
                }
              }}
              onMouseLeave={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.backgroundColor = '#ede8ff'
                  e.currentTarget.classList.remove('shadow-sm')
                  e.currentTarget.style.borderColor = '#ede8ff'
                }
              }}
            >
              {!isExpanded && (
                <span className="text-sm font-medium text-purple-700 whitespace-nowrap select-none">
                  Build a lesson
                </span>
              )}
            </div>
          </div>
          
          {/* Content Container */}
          <div
            ref={dropZoneRef}
            className={`backdrop-blur-sm overflow-hidden ${
              isAnimating ? 'transition-all duration-200 ease-out' : ''
            } ${
              isExpanded ? 'shadow-sm' : ''
            } ${
              isGenerating ? 'opacity-75' : ''
            } ${
              isDraggingFile ? 'border-blue-400 border-2 bg-blue-50' : ''
            }`}
            style={{ 
              height: `${contentHeight}px`,
              borderRadius: '0.5rem',
              backgroundColor: isDraggingFile ? '#eff6ff' : (isGenerating ? '#f9fafb' : 'white'),
              border: isDraggingFile ? '2px solid #60a5fa' : (isExpanded ? '1px solid #e5e7eb' : 'none'),
              cursor: isGenerating ? 'not-allowed' : 'auto',
              position: 'relative'
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            {isDraggingFile && (
              <div className="absolute inset-0 bg-blue-50 bg-opacity-90 rounded-lg z-10 flex items-center justify-center">
                <div className="text-center">
                  <File className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-blue-700 font-medium">Drop to add to prompt</p>
                  <p className="text-blue-600 text-sm mt-1">Supports .txt, .html, and .pdf files</p>
                </div>
              </div>
            )}
            
            {isExpanded && (
              <div className="h-full relative">
                {/* Main content area with padding */}
                <div className="h-full px-5 pt-4 pb-14">
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={`w-full resize-none outline-none text-[15px] placeholder-gray-400 leading-relaxed bg-transparent ${
                      isGenerating ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
                    }`}
                    style={{ 
                      minHeight: `${Math.max(50, contentHeight - 70)}px`
                    }}
                    disabled={isGenerating}
                  />
                </div>
                
                {/* File Upload Container - Positioned absolutely at bottom left */}
                {showFileContainer && uploadedFile && (
                  <div 
                    className="group absolute left-5 bg-gray-50 rounded-lg border border-gray-200 animate-slide-up p-3"
                    style={{ 
                      bottom: '56px',
                      width: '200px',
                      zIndex: 1
                    }}
                  >
                    <div className={`flex items-start justify-between ${uploadedFile.content && contentHeight > 250 ? 'mb-2' : ''}`}>
                      <div>
                        <p className="text-xs font-medium text-gray-700 truncate" style={{ maxWidth: '150px' }}>
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                      </div>
                      <button
                        onClick={removeFile}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-none"
                        disabled={isGenerating}
                      >
                        <X size={14} className="text-gray-500" />
                      </button>
                    </div>
                    {uploadedFile.content && contentHeight > 250 && (
                      <p className="text-xs text-gray-600 line-clamp-2 animate-fade-in">
                        {uploadedFile.content}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Bottom Toolbar */}
                <div className={`absolute bottom-0 left-0 right-0 h-12 flex items-center justify-between px-4 ${
                  isGenerating ? 'opacity-50 pointer-events-none' : ''
                }`} style={{ backgroundColor: 'white', borderRadius: '0 0 0.5rem 0.5rem', zIndex: 2 }}>
                  {/* Left Section - Plus Button and Selected Items */}
                  <div className="relative flex items-center flex-1 mr-3" style={{ maxWidth: 'calc(100% - 80px)' }}>
                    {/* Scrollable container */}
                    <div 
                      ref={footerScrollRef}
                      className="flex items-center gap-2 overflow-x-auto scrollbar-hide" 
                      style={{ scrollBehavior: 'smooth' }}
                      onScroll={(e) => {
                        const element = e.currentTarget
                        const hasOverflow = element.scrollWidth > element.clientWidth
                        const isAtEnd = Math.ceil(element.scrollLeft + element.clientWidth) >= element.scrollWidth
                        setShowFadeGradient(hasOverflow && !isAtEnd)
                      }}
                    >
                      {/* Unified Plus Button */}
                      <button
                        ref={plusButtonRef}
                        onClick={togglePopup}
                        className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-gray-300 transition-all duration-200 hover:bg-gray-100 active:bg-gray-100"
                        style={{
                          borderRadius: '0.5rem',
                          backgroundColor: showPopup ? '#f3f4f6' : 'white'
                        }}
                        title="Add content"
                      >
                        <Plus size={16} className="text-gray-600" strokeWidth={1.5} />
                      </button>

                      {/* Genius Mode Toggle Button */}
                      <button
                        onClick={toggleGeniusMode}
                        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
                        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        className={`px-3 h-8 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${isGeniusMode ? 'border-purple-700 text-purple-700' : 'border-gray-300 text-gray-600'}`}
                        style={{
                          borderRadius: '0.5rem',
                          backgroundColor: isGeniusMode ? '#f5f3ff' : 'white',
                          borderWidth: '1px',
                          borderStyle: 'solid'
                        }}
                        title={isGeniusMode ? 'Genius mode enabled (gpt-5-mini with advanced reasoning)' : 'Enable Genius mode'}
                      >
                        <Brain size={16} strokeWidth={1.5} className="mr-1.5" />
                        <span className="text-sm font-medium">Genius</span>
                      </button>

                      {/* Selected Slides Indicator */}
                      {selectedSlides.length > 0 && (
                        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-sm" style={{ borderRadius: '0.5rem' }}>
                          <Layers size={14} className="text-gray-600" />
                          <span className="text-gray-700 whitespace-nowrap">
                            {selectedSlides.length} slide{selectedSlides.length !== 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={clearSelectedSlides}
                            className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}

                      {/* Selected Profile Indicator */}
                      {selectedProfile && (
                        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-sm" style={{ borderRadius: '0.5rem' }}>
                          <User size={14} className="text-gray-600" />
                          <span className="text-gray-700 whitespace-nowrap">
                            {selectedProfile.name}
                          </span>
                          <button
                            onClick={clearSelectedProfile}
                            className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}

                      {/* Selected Lesson Indicator */}
                      {selectedLesson && (
                        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-sm" style={{ borderRadius: '0.5rem' }}>
                          <BookOpen size={14} className="text-gray-600" />
                          <span className="text-gray-700 whitespace-nowrap">
                            {selectedLesson.title}
                          </span>
                          <button
                            onClick={clearSelectedLesson}
                            className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}

                      {/* Processing File Indicator */}
                      {isProcessingFile && (
                        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                          <span className="text-gray-700">Processing file...</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Fade gradient overlay - only show when there's more content to scroll */}
                    {showFadeGradient && (
                      <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none" style={{
                        background: 'linear-gradient(to right, transparent, white)'
                      }} />
                    )}
                  </div>

                  {/* Generate Button */}
                  <button 
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    onClick={handleGenerate}
                    disabled={!text.trim() || selectedSlides.length === 0 || isProcessingFile}
                    tabIndex={-1}
                  >
                    <ArrowUp size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-in;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}

export default CollapsibleTextInput
