// src/components/dashboard/AIPromptInput.tsx
import { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Plus, X, ArrowUp, ArrowLeft, Brain, Layers, User, BookOpen, ChevronRight, Loader2, FileText, File, CornerDownLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './AIPromptInput.css'
import { generateLesson } from '@/services/lessonGeneration'
import { useTemplates } from '@/hooks/useTemplates'
import { toast } from '@/utils/toast'
import { clearLoadingToasts } from '@/components/ui/Toast'
import type { SlideTemplate } from '@/types/template.types'
import { parseFile, getFileType, type FileUpload } from '@/utils/fileUtils'
import { EnhancedSlideSelector, type SelectedSlideInstance } from '@/components/ui/SlideSelector'
import useUIStore from '@/stores/uiStore'

interface Suggestion {
  icon: string | React.ReactNode
  text: string
}

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

interface AIPromptInputProps {
  onSubmit: (data: {
    prompt: string
    selectedStudent?: StudentProfile | null
    selectedLesson?: Lesson | null
    selectedSlides?: SelectedSlideInstance[]
    geniusMode?: boolean
    uploadedFile?: FileUpload | null
  }) => void
  suggestions?: Suggestion[]
  students?: StudentProfile[]
  lessons?: Lesson[]
  loadingStudents?: boolean
  loadingLessons?: boolean
  isInitiallyExpanded?: boolean
  initialStudent?: StudentProfile | null
  initialLesson?: Lesson | null
}

type PopupView = 'main' | 'student' | 'lesson'

export default function AIPromptInput({ 
  onSubmit,
  suggestions = [],
  students = [],
  lessons = [],
  loadingStudents = false,
  loadingLessons = false,
  isInitiallyExpanded = false,
  initialStudent = null,
  initialLesson = null
}: AIPromptInputProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const { theme } = useUIStore()
  const [prompt, setPrompt] = useState('')
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupView, setPopupView] = useState<PopupView>('main')
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(initialStudent)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(initialLesson)
  const [selectedSlides, setSelectedSlides] = useState<SelectedSlideInstance[]>([])
  const [showEnhancedSelector, setShowEnhancedSelector] = useState(false)
  const [lessonSearchQuery, setLessonSearchQuery] = useState('')
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [popupPosition, setPopupPosition] = useState<{ bottom: number; left: number } | null>(null)
  const [isGeniusMode, setIsGeniusMode] = useState(false)
  
  // File upload states
  const [uploadedFile, setUploadedFile] = useState<FileUpload | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [showFileContainer, setShowFileContainer] = useState(false)
  
  // Scroll state for fade gradient
  const [showFadeGradient, setShowFadeGradient] = useState(false)
  
  const { templates } = useTemplates()
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const plusButtonRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const footerScrollRef = useRef<HTMLDivElement>(null)

  // Debug logging for data
  useEffect(() => {
    console.log('AIPromptInput - students prop:', students)
    console.log('AIPromptInput - lessons prop:', lessons)
    console.log('AIPromptInput - loadingStudents:', loadingStudents)
    console.log('AIPromptInput - loadingLessons:', loadingLessons)
  }, [students, lessons, loadingStudents, loadingLessons])

  // Handle initial expansion from navigation
  useEffect(() => {
    if (isInitiallyExpanded && !isExpanded) {
      setIsExpanded(true)
    }
  }, [isInitiallyExpanded])

  // Handle initial student selection
  useEffect(() => {
    if (initialStudent && !selectedProfile) {
      setSelectedProfile(initialStudent)
    }
  }, [initialStudent])

  // Handle initial lesson selection
  useEffect(() => {
    if (initialLesson && !selectedLesson) {
      setSelectedLesson(initialLesson)
    }
  }, [initialLesson])

  // Get actual templates from the templates hook
  const availableTemplates = templates
    .filter(t => t.category !== 'blank')
    .map(t => ({
      id: t.id,
      name: t.name,
      category: t.category
    }))

  // Filter functions
  const filteredProfiles = students.filter(profile => {
    const searchLower = studentSearchQuery.toLowerCase()
    return (
      profile.name.toLowerCase().includes(searchLower) ||
      (profile.target_language || '').toLowerCase().includes(searchLower) ||
      (profile.native_language || '').toLowerCase().includes(searchLower) ||
      (profile.interests || '').toLowerCase().includes(searchLower)
    )
  })

  const filteredLessons = (lessons || []).filter(lesson =>
    lesson.title.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
    lesson.topics?.some((topic: string) => topic.toLowerCase().includes(lessonSearchQuery.toLowerCase()))
  )

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set height to scrollHeight to fit content, with a max height
      const newHeight = Math.min(textareaRef.current.scrollHeight, 380); // Max height of 400px
      textareaRef.current.style.height = `${newHeight}px`;
      
      // If we've hit max height, allow scrolling
      if (textareaRef.current.scrollHeight > 400) {
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [prompt]); // Re-run when prompt changes

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isExpanded])

  // Check for overflow on mount and when items change
  useEffect(() => {
    if (footerScrollRef.current) {
      const element = footerScrollRef.current
      const hasOverflow = element.scrollWidth > element.clientWidth
      const isAtEnd = Math.ceil(element.scrollLeft + element.clientWidth) >= element.scrollWidth
      setShowFadeGradient(hasOverflow && !isAtEnd)
    }
  }, [selectedSlides, selectedProfile, selectedLesson, showPopup])

  // Handle Cmd/Ctrl + K to expand
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsExpanded(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  // File handling functions
  const handleFileSelect = async (file: File) => {
    setIsProcessingFile(true)
    try {
      const fileUpload = await parseFile(file)
      setUploadedFile(fileUpload)
      setShowFileContainer(true)
      // Show success toast for file upload
      toast.success(t('aiPrompt.fileUploadedSuccess', { fileName: file.name }))
    } catch (error) {
      console.error('Error processing file:', error)
      // Show error toast for file upload failure
      toast.error(error instanceof Error ? error.message : t('aiPrompt.fileProcessError'))
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
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only set dragging to false if we're leaving the component entirely
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

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

  const handleSubmit = async () => {
    if (!prompt.trim() || selectedSlides.length === 0) return
    
    setIsGenerating(true)
    
    // Show loading toast
    const loadingToastId = toast.loading(t('aiPrompt.generatingLesson'))
    
    try {
      // Get the actual template objects for selected slides
      const selectedTemplateObjects: SlideTemplate[] = []
      selectedSlides.forEach(slideInstance => {
        const template = templates.find(t => t.id === slideInstance.templateId)
        if (template) {
          selectedTemplateObjects.push(template)
        }
      })
      
      if (selectedTemplateObjects.length === 0) {
        throw new Error(t('aiPrompt.selectSlideError'))
      }
      
      // Generate lesson using shared service
      const generatedData = await generateLesson({
        prompt: prompt.trim(),
        selectedTemplates: selectedTemplateObjects,
        selectedProfile: selectedProfile,
        selectedLesson: selectedLesson,
        isGeniusMode: isGeniusMode,
        uploadedFile: uploadedFile
      })
      
      // Clear loading toasts and show success BEFORE navigation
      clearLoadingToasts()
      toast.success(t('aiPrompt.generationSuccess', { count: selectedTemplateObjects.length }))
      
      // Small delay to ensure toast is visible
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Navigate to canvas with the generated data
      navigate('/canvas', {
        state: {
          action: 'applyGenerated',
          generatedData,
          selectedTemplates: selectedTemplateObjects,
          prompt: prompt.trim()
        }
      })
      
      // Clear form
      setPrompt('')
      setSelectedSlides([])
      setSelectedProfile(null)
      setSelectedLesson(null)
      setIsGeniusMode(false)
      setIsExpanded(false)
      removeFile()
    } catch (error) {
      console.error('Error generating content:', error)
      const errorMsg = error instanceof Error ? error.message : t('aiPrompt.generationError')
      // Clear loading toasts and show error
      clearLoadingToasts()
      toast.error(errorMsg)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && prompt.trim() && selectedSlides.length > 0) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape' && isExpanded) {
      e.preventDefault()
      setIsExpanded(false)
      setPrompt('')
      removeFile()
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

  const selectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setShowPopup(false)
    setPopupView('main')
    setLessonSearchQuery('')
  }

  const toggleGeniusMode = () => {
    setIsGeniusMode(!isGeniusMode)
  }

  const handleSuggestionClick = (suggestionText: string) => {
    // If not expanded, expand first
    if (!isExpanded) {
      setIsExpanded(true)
    }
    // Add the suggestion text to the prompt
    setPrompt(suggestionText)
    // Focus the textarea after a brief delay to ensure it's rendered
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }, 100)
  }

  const clearSelectedProfile = () => {
    setSelectedProfile(null)
  }

  const clearSelectedLesson = () => {
    setSelectedLesson(null)
  }

  const clearSelectedSlides = () => {
    setSelectedSlides([])
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

  // Render the popup
  const renderPopup = () => {
    if (!showPopup || !isExpanded || !popupPosition) return null

    return ReactDOM.createPortal(
      <div 
        className="main-popup fixed bg-white dark:bg-dark-graybg backdrop-blur-md rounded-lg shadow-popup border border-gray-200 dark:border-dark-border/20 animate-popup-in"
        style={{ 
          bottom: `${popupPosition.bottom}px`,
          left: `${popupPosition.left}px`,
          width: '320px',
          maxHeight: '400px',
          zIndex: 9999
        }}
      >
        {popupView === 'main' && (
          <>
            <div className="p-1">
              <button
                onClick={handleOpenEnhancedSelector}
                className="w-full font-normal flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/10 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Layers size={18} className="text-gray-600 dark:text-app-light-gray" strokeWidth={1.5} />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{t('aiPrompt.addSlides')}</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setPopupView('student')}
                className="w-full font-normal flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/10 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User size={18} className="text-gray-600 dark:text-app-light-gray" strokeWidth={1.5} />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{t('aiPrompt.addStudentContext')}</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setPopupView('lesson')}
                className="w-full font-normal flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/10 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className="text-gray-600 dark:text-app-light-gray" strokeWidth={1.5} />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{t('aiPrompt.addLessonContext')}</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex font-normal items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/10 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-gray-600 dark:text-app-light-gray" strokeWidth={1.5} />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{t('aiPrompt.uploadArticle')}</span>
                </div>
              </button>
            </div>
          </>
        )}

        {popupView === 'student' && (
          <>
            <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700">
              <button
                onClick={() => {
                  setPopupView('main')
                  setStudentSearchQuery('')
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
              </button>
              <input
                type="text"
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                placeholder={t('aiPrompt.searchStudents')}
                className="w-full px-3 py-1.5 text-sm outline-none bg-transparent dark:text-dark-text dark:placeholder-gray-500"
              />
            </div>

            <div className="max-h-48 overflow-y-auto">
              {loadingStudents ? (
                <div className="px-4 py-6 text-center">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-app-purple-600 rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">{t('aiPrompt.loadingStudents')}</p>
                </div>
              ) : filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => selectProfile(profile)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50 dark:border-gray-700 last:border-b-0 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{profile.name}</div>
                    {profile.target_language && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {t('aiPrompt.learning')} {profile.target_language}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                  {students.length === 0 ? t('aiPrompt.noStudentsYet') : t('aiPrompt.noStudentsFound')}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleAddNewStudent}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/10 rounded-md transition-colors text-sm"
              >
                <Plus size={16} className="text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-200">{t('aiPrompt.addNewStudent')}</span>
              </button>
            </div>
          </>
        )}

        {popupView === 'lesson' && (
          <>
            <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700">
              <button
                onClick={() => {
                  setPopupView('main')
                  setLessonSearchQuery('')
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
              </button>
              <input
                type="text"
                value={lessonSearchQuery}
                onChange={(e) => setLessonSearchQuery(e.target.value)}
                placeholder={t('aiPrompt.searchLessons')}
                className="w-full px-3 py-1.5 text-sm outline-none bg-transparent dark:text-dark-text dark:placeholder-gray-500"
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {loadingLessons ? (
                <div className="px-4 py-6 text-center">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-app-purple-600 rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">{t('aiPrompt.loadingLessons')}</p>
                </div>
              ) : filteredLessons.length > 0 ? (
                filteredLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => selectLesson(lesson)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50 dark:border-gray-700 last:border-b-0 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{lesson.title}</div>
                    {lesson.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {lesson.description}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                  {lessons.length === 0 ? t('aiPrompt.noLessonsYet') : t('aiPrompt.noLessonsFound')}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleAddNewLesson}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/10 rounded-md transition-colors text-sm"
              >
                <Plus size={16} className="text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-200">{t('aiPrompt.createNewLesson')}</span>
              </button>
            </div>
          </>
        )}
      </div>,
      document.body
    )
  }

  return (
    <div className="w-full max-w-3xl">
      {renderPopup()}
      
      {/* Enhanced Slide Selector Modal */}
      {showEnhancedSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70" onClick={() => setShowEnhancedSelector(false)} />
          <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl dark:shadow-dark w-full max-w-4xl lg:max-w-6xl h-[90vh] sm:h-[85vh] overflow-hidden">
            <EnhancedSlideSelector
              availableTemplates={availableTemplates}
              onSelectionChange={setSelectedSlides}
              onClose={() => setShowEnhancedSelector(false)}
              disabled={isGenerating}
            />
          </div>
        </div>
      )}
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.html,.pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {!isExpanded ? (
        // Collapsed State - Empty since we're always expanded by default
        null
      ) : (
        // Expanded State
        <div className="flex flex-col items-center">
          {/* New wrapper container with specified styling */}
          <div 
            className={`w-full animate-fade-in transition-all relative flex flex-col ${
              isDragging ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            style={{
              padding: '.375rem',
              backgroundColor: 'var(--prompt-bg, #f6f5f4b3)',
              borderRadius: '.75rem'
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 bg-opacity-90 dark:bg-opacity-100 rounded-lg z-10 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <File className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-blue-700 dark:text-blue-300 font-medium">{t('aiPrompt.dropToAdd')}</p>
                  <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">{t('aiPrompt.supportedFormats')}</p>
                </div>
              </div>
            )}
            
            {/* Input container with footer buttons */}
            <div className="bg-white dark:bg-dark-card rounded-lg focus-within:ring-0 focus-within:outline-none" style={{ border: '1px solid var(--prompt-border, rgba(126, 117, 114, 0.2))' }}>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isGenerating ? t('aiPrompt.generatingLesson') : t('aiPrompt.placeholder')}
                className="w-full resize-none overflow-hidden focus:outline-none focus:ring-0 bg-transparent text-app-black dark:text-dark-text placeholder-app-light-gray dark:placeholder-dark-border disabled:cursor-not-allowed disabled:opacity-75 rounded-t-lg"
                disabled={isGenerating}
                style={{ 
                  minHeight: '120px',
                  padding: '.5rem'
                }}
              />
              
              {/* Footer with buttons */}
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="relative flex items-center flex-1 mr-3" style={{ maxWidth: 'calc(100% - 50px)' }}>
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
                    {/* Plus Button */}
                    <button
                      ref={plusButtonRef}
                      onClick={togglePopup}
                      disabled={isGenerating}
                      className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-app-border dark:border-dark-border/50 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/10 active:bg-gray-100 dark:active:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed dark:bg-dark-card"
                      style={{
                        backgroundColor: showPopup ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#f3f4f6') : undefined
                      }}
                      title="Add content"
                    >
                      <Plus size={16} className="text-app-gray dark:text-dark-text" strokeWidth={1.5} />
                    </button>

                    {/* Genius Mode Toggle Button */}
                    <button
                      onClick={toggleGeniusMode}
                      disabled={isGenerating}
                      onMouseDown={(e) => { 
                        const target = e.currentTarget;
                        target.style.transform = 'scale(0.95)';
                      }}
                      onMouseUp={(e) => { 
                        const target = e.currentTarget;
                        target.style.transform = 'scale(1)';
                      }}
                      onMouseLeave={(e) => { 
                        const target = e.currentTarget;
                        target.style.transform = 'scale(1)';
                      }}
                      className={`px-3 h-8 flex-shrink-0 flex items-center justify-center transition-all duration-200 rounded-lg border ${
                        isGeniusMode 
                          ? 'border-app-purple-700 dark:border-dark-accent text-app-purple-700 dark:text-dark-accent bg-app-purple-50 dark:bg-dark-accent/20' 
                          : 'border-app-border dark:border-dark-border/50 text-app-gray dark:text-dark-text bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-white/10'
                      }`}
                      title={isGeniusMode ? t('aiPrompt.geniusModeEnabled') : t('aiPrompt.enableGeniusMode')}
                    >
                      <Brain size={16} strokeWidth={1.5} className="mr-1.5" />
                      <span className="text-sm font-medium">{t('aiPrompt.genius')}</span>
                    </button>

                    {/* Selected Slides Indicator */}
                    {selectedSlides.length > 0 && (
                      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-app-border dark:border-dark-border/50 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/10 dark:hover:border-dark-card/0">
                        <Layers size={14} className="text-app-gray dark:text-dark-text" />
                        <span className="text-app-gray dark:text-dark-text whitespace-nowrap">
                          {selectedSlides.length} {selectedSlides.length !== 1 ? t('aiPrompt.slides') : t('aiPrompt.slide')}
                        </span>
                        <button
                          onClick={clearSelectedSlides}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-1"
                        >
                          <X size={24} className=" p-1 text-app-gray dark:hover:text-dark-text dark:text-app-light-gray" strokeWidth={2}/>
                        </button>
                      </div>
                    )}

                    {/* Selected Profile Indicator */}
                    {selectedProfile && (
                      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-app-border dark:border-dark-border/50 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/10 dark:hover:border-dark-card/0">
                        <User size={14} className="text-app-gray dark:text-dark-text" />
                        <span className="text-app-gray dark:text-dark-text whitespace-nowrap">
                          {selectedProfile.name}
                        </span>
                        <button
                          onClick={clearSelectedProfile}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-1"
                        >
                          <X size={24} className=" p-1 text-app-gray dark:hover:text-dark-text dark:text-app-light-gray" strokeWidth={2}/>
                        </button>
                      </div>
                    )}

                    {/* Selected Lesson Indicator */}
                    {selectedLesson && (
                      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-app-border dark:border-dark-border/50 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/10 dark:hover:border-dark-card/0">
                        <BookOpen size={14} className="text-app-gray dark:text-dark-text" />
                        <span className="text-app-gray dark:text-dark-text whitespace-nowrap">
                          {selectedLesson.title}
                        </span>
                        <button
                          onClick={clearSelectedLesson}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-1"
                        >
                          <X size={24} className=" p-1 text-app-gray dark:hover:text-dark-text dark:text-app-light-gray" strokeWidth={2}/>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Fade gradient overlay - only show when there's more content to scroll */}
                  {showFadeGradient && (
                    <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none" style={{
                      background: theme === 'dark'
                        ? 'linear-gradient(to right, transparent, #242323)' 
                        : 'linear-gradient(to right, transparent, white)'
                    }} />
                  )}
                </div>
                
                {/* Generate Button - Square with corner-down-left icon */}
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || selectedSlides.length === 0 || isGenerating || isProcessingFile}
                  className="w-10 h-10 flex items-center justify-center bg-app-green dark:bg-dark-accent text-white rounded-lg hover:bg-app-green-700 dark:hover:bg-dark-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  tabIndex={-1}
                  title="Generate"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CornerDownLeft size={18} className="text-white" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
              
            
            {/* Files Container - Below the input, inside wrapper */}
            {(showFileContainer || isProcessingFile) && (
              <div className="mt-2 mb-1 flex flex-wrap gap-2">

                {/* File Upload Container - Square with preview */}
                {showFileContainer && uploadedFile && (
                  <div className="group relative p-3 bg-app-blue-50 dark:bg-dark-graybg rounded-lg border border-app-blue-200 dark:border-dark-graybg animate-slide-up" style={{ width: '200px' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-app-blue-700 dark:text-dark-text truncate" style={{ maxWidth: '150px' }}>
                          {uploadedFile.name}
                        </p>
                        {uploadedFile.content && (
                          <p className="text-xs text-app-blue-500 dark:text-app-light-gray line-clamp-2 mt-0.5">
                            {uploadedFile.content}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={removeFile}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-app-blue-100 dark:hover:bg-white/10 rounded transition-none ml-2"
                        disabled={isGenerating}
                      >
                        <X size={16} className="text-app-blue-500 dark:text-dark-text" />
                      </button>
                    </div>
                    <p className="text-xs text-app-blue-500 bg-app-blue-100 dark:text-app-light-gray dark:bg-white/10 px-1 py-0.5 rounded w-fit">
                      {uploadedFile.type.toUpperCase()}
                    </p>
                  </div>
                )}

                {/* Processing File Indicator */}
                {isProcessingFile && (
                  <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/50 rounded-lg text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{t('aiPrompt.processingFile')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Suggestions - Only 3 buttons in a single row */}
          {suggestions.length > 0 && (
            <div className="w-full animate-fade-in mt-6">
              <div className="flex gap-2 justify-center">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-dark-card rounded-full border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm dark:hover:shadow-dark transition-all text-xs"
                  >
                    <span>{suggestion.icon}</span>
                    <span className="text-gray-600 dark:text-gray-300">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
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
        
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
