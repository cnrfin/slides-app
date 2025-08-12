import React, { useState, useRef, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Plus, X, ArrowUp, Search, User, BookOpen, Brain } from 'lucide-react'

interface StudentProfile {
  id: string
  name: string
  firstLanguage: string
  subjects?: string[]
}

interface Lesson {
  id: string
  title: string
  description: string
  vocabulary?: string[]
  grammarPoints?: string[]
  topics?: string[]
  date?: string
}

interface CollapsibleTextInputProps {
  placeholder?: string
  onSubmit?: (text: string, selectedProfile?: StudentProfile, selectedLesson?: Lesson, useGeniusMode?: boolean) => void
  onHeightChange?: (totalHeight: number) => void // New callback for height changes
  minHeight?: number
  maxHeight?: number
  defaultHeight?: number
}

const CollapsibleTextInput: React.FC<CollapsibleTextInputProps> = ({
  placeholder = "Add a prompt...",
  onSubmit,
  onHeightChange,
  minHeight = 0,
  maxHeight = 400,
  defaultHeight = 0,
}) => {
  const [contentHeight, setContentHeight] = useState(defaultHeight)
  const [isDragging, setIsDragging] = useState(false)
  const [text, setText] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isHoveringHandle, setIsHoveringHandle] = useState(false)
  const [showStudentPopup, setShowStudentPopup] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null)
  const [showLessonPopup, setShowLessonPopup] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [lessonSearchQuery, setLessonSearchQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [popupPosition, setPopupPosition] = useState<{ bottom: number; left: number } | null>(null)
  const [lessonPopupPosition, setLessonPopupPosition] = useState<{ bottom: number; left: number } | null>(null)
  const [isGeniusMode, setIsGeniusMode] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dragStartY = useRef(0)
  const dragStartHeight = useRef(0)
  const justFinishedDragging = useRef(false)
  const studentButtonRef = useRef<HTMLButtonElement>(null)
  const lessonButtonRef = useRef<HTMLButtonElement>(null)

  // Mock student profiles data - this will be replaced with actual data
  const mockStudentProfiles: StudentProfile[] = [
    { id: '1', name: 'Alex Johnson', firstLanguage: 'Spanish', subjects: ['Math', 'Science'] },
    { id: '2', name: 'Sarah Chen', firstLanguage: 'Mandarin', subjects: ['English', 'History'] },
    { id: '3', name: 'Marcus Williams', firstLanguage: 'French', subjects: ['Art', 'Music'] },
  ]

  // Mock lessons data - this will be replaced with actual data
  const mockLessons: Lesson[] = [
    { 
      id: '1', 
      title: 'Introduction to Present Perfect', 
      description: 'Basic introduction to present perfect tense',
      vocabulary: ['already', 'yet', 'ever', 'never', 'just'],
      grammarPoints: ['Have/Has + Past Participle', 'Time expressions'],
      topics: ['Travel experiences', 'Life achievements'],
      date: '2025-01-15'
    },
    { 
      id: '2', 
      title: 'Describing People and Places', 
      description: 'Using adjectives effectively',
      vocabulary: ['appearance', 'personality', 'landscape', 'architecture'],
      grammarPoints: ['Comparative and superlative forms', 'Order of adjectives'],
      topics: ['Famous landmarks', 'Character descriptions'],
      date: '2025-01-10'
    },
    { 
      id: '3', 
      title: 'Modal Verbs for Advice', 
      description: 'Should, could, might for giving advice',
      vocabulary: ['suggestion', 'recommendation', 'opinion', 'preference'],
      grammarPoints: ['Modal verbs', 'Conditional sentences'],
      topics: ['Health and wellness', 'Problem solving'],
      date: '2025-01-05'
    },
  ]

  // Filter students based on search query
  const filteredProfiles = mockStudentProfiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.firstLanguage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.subjects?.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Filter lessons based on search query
  const filteredLessons = mockLessons.filter(lesson =>
    lesson.title.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
    lesson.topics?.some(topic => topic.toLowerCase().includes(lessonSearchQuery.toLowerCase())) ||
    lesson.vocabulary?.some(word => word.toLowerCase().includes(lessonSearchQuery.toLowerCase())) ||
    lesson.grammarPoints?.some(point => point.toLowerCase().includes(lessonSearchQuery.toLowerCase()))
  )

  // Notify parent of height changes
  useEffect(() => {
    if (onHeightChange) {
      // Total height includes drag handle (32px) + content height
      const totalHeight = 32 + contentHeight
      onHeightChange(totalHeight)
    }
  }, [contentHeight, onHeightChange])

  // Update popup position when button is clicked
  useEffect(() => {
    if (showStudentPopup && studentButtonRef.current) {
      const buttonRect = studentButtonRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // Calculate bottom position (distance from bottom of viewport)
      const bottom = viewportHeight - buttonRect.top + 8 // 8px gap above button
      const left = buttonRect.left
      
      setPopupPosition({ bottom, left })
    } else {
      // Reset position when closing
      setPopupPosition(null)
    }
  }, [showStudentPopup])

  // Update lesson popup position when button is clicked
  useEffect(() => {
    if (showLessonPopup && lessonButtonRef.current) {
      const buttonRect = lessonButtonRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // Calculate bottom position (distance from bottom of viewport)
      const bottom = viewportHeight - buttonRect.top + 8 // 8px gap above button
      const left = buttonRect.left
      
      setLessonPopupPosition({ bottom, left })
    } else {
      // Reset position when closing
      setLessonPopupPosition(null)
    }
  }, [showLessonPopup])

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStudentPopup && studentButtonRef.current && 
          !studentButtonRef.current.contains(event.target as Node)) {
        // Check if click is not on the popup itself
        const popup = document.querySelector('.student-popup')
        if (popup && !popup.contains(event.target as Node)) {
          setShowStudentPopup(false)
          setSearchQuery('')
        }
      }
      
      if (showLessonPopup && lessonButtonRef.current && 
          !lessonButtonRef.current.contains(event.target as Node)) {
        // Check if click is not on the popup itself
        const popup = document.querySelector('.lesson-popup')
        if (popup && !popup.contains(event.target as Node)) {
          setShowLessonPopup(false)
          setLessonSearchQuery('')
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showStudentPopup, showLessonPopup])

  // Handle mouse down on drag handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setIsHoveringHandle(false) // Hide text when dragging starts
    dragStartY.current = e.clientY
    dragStartHeight.current = contentHeight
    document.body.style.cursor = 'ns-resize'
    document.body.style.userSelect = 'none'
  }, [contentHeight])

  // Handle mouse move during drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      // Invert the delta to make dragging up expand the container
      const deltaY = dragStartY.current - e.clientY
      const newHeight = Math.max(minHeight, Math.min(maxHeight, dragStartHeight.current + deltaY))
      setContentHeight(newHeight)
    }

    const handleMouseUp = () => {
      if (!isDragging) return
      
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      
      // Set flag to prevent click event from firing
      justFinishedDragging.current = true
      setTimeout(() => {
        justFinishedDragging.current = false
      }, 100)
      
      // Auto-collapse if dragged below 100px
      if (contentHeight < 100) {
        setIsAnimating(true)
        setContentHeight(0)
        setTimeout(() => setIsAnimating(false), 200)
      }
      // Focus textarea if expanded (no auto-expand)
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
    if (e.key === 'Enter' && e.ctrlKey && onSubmit && text.trim()) {
      e.preventDefault()
      onSubmit(text, selectedProfile || undefined)
      setText('') // Clear after submit
    }
    // ESC to collapse
    else if (e.key === 'Escape' && isExpanded) {
      e.preventDefault()
      setIsAnimating(true)
      setContentHeight(0)
      setTimeout(() => setIsAnimating(false), 200)
    }
  }

  const isExpanded = contentHeight > 0

  // Handle clicking on drag handle when collapsed to expand
  const handleDragHandleClick = useCallback(() => {
    // Don't expand if we just finished dragging
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

  const handleGenerate = useCallback(() => {
    if (onSubmit && text.trim()) {
      onSubmit(text, selectedProfile || undefined, selectedLesson || undefined, isGeniusMode)
      setText('')
    }
  }, [text, onSubmit, selectedProfile, selectedLesson, isGeniusMode])

  const toggleStudentPopup = () => {
    setShowStudentPopup(!showStudentPopup)
    if (!showStudentPopup) {
      setSearchQuery('')
    }
  }

  const selectProfile = (profile: StudentProfile) => {
    setSelectedProfile(profile)
    setShowStudentPopup(false)
    setSearchQuery('')
  }

  const clearSelectedProfile = () => {
    setSelectedProfile(null)
  }

  const toggleLessonPopup = () => {
    setShowLessonPopup(!showLessonPopup)
    if (!showLessonPopup) {
      setLessonSearchQuery('')
    }
  }

  const selectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setShowLessonPopup(false)
    setLessonSearchQuery('')
  }

  const clearSelectedLesson = () => {
    setSelectedLesson(null)
  }

  const handleCreateLesson = () => {
    // TODO: Implement create lesson functionality
    console.log('Create lesson clicked')
    setShowLessonPopup(false)
    setLessonSearchQuery('')
  }

  const toggleGeniusMode = () => {
    setIsGeniusMode(!isGeniusMode)
  }

  const handleCreateStudentProfile = () => {
    // TODO: Implement create student profile functionality
    console.log('Create student profile clicked')
    setShowStudentPopup(false)
    setSearchQuery('')
  }

  // Create portal for the student popup
  const renderStudentPopup = () => {
    if (!showStudentPopup || !isExpanded || !popupPosition) return null

    return ReactDOM.createPortal(
      <div 
        className="student-popup fixed bg-white rounded-lg shadow-lg border border-gray-200 w-80 animate-popup-in"
        style={{ 
          bottom: `${popupPosition.bottom}px`,
          left: `${popupPosition.left}px`,
          maxHeight: '320px',
          zIndex: 35
        }}
      >
        {/* Search Bar */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students"
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-gray-300"
            />
          </div>
        </div>

        {/* Student List */}
        <div className="max-h-48 overflow-y-auto">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => selectProfile(profile)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={14} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {profile.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {profile.firstLanguage}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No students found
            </div>
          )}
        </div>

        {/* Create Student Profile Button */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleCreateStudentProfile}
            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors text-sm"
          >
            <span className="text-gray-700">Create student profile</span>
            <div className="w-4 h-4 flex items-center justify-center">
              <Plus size={12} className="text-gray-600" />
            </div>
          </button>
        </div>
      </div>,
      document.body
    )
  }

  // Create portal for the lesson popup
  const renderLessonPopup = () => {
    if (!showLessonPopup || !isExpanded || !lessonPopupPosition) return null

    return ReactDOM.createPortal(
      <div 
        className="lesson-popup fixed bg-white rounded-lg shadow-lg border border-gray-200 w-96 animate-popup-in"
        style={{ 
          bottom: `${lessonPopupPosition.bottom}px`,
          left: `${lessonPopupPosition.left}px`,
          maxHeight: '400px',
          zIndex: 35
        }}
      >
        {/* Search Bar */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={lessonSearchQuery}
              onChange={(e) => setLessonSearchQuery(e.target.value)}
              placeholder="Search lessons"
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-gray-300"
            />
          </div>
        </div>

        {/* Lesson List */}
        <div className="max-h-64 overflow-y-auto">
          {filteredLessons.length > 0 ? (
            filteredLessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => selectLesson(lesson)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen size={14} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">
                      {lesson.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {lesson.description}
                    </div>
                    {lesson.topics && lesson.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lesson.topics.slice(0, 2).map((topic, index) => (
                          <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                            {topic}
                          </span>
                        ))}
                        {lesson.topics.length > 2 && (
                          <span className="text-xs text-gray-400">+{lesson.topics.length - 2} more</span>
                        )}
                      </div>
                    )}
                    {lesson.date && (
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(lesson.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No lessons found
            </div>
          )}
        </div>

        {/* Create Lesson Button */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleCreateLesson}
            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors text-sm"
          >
            <span className="text-gray-700">Create new lesson</span>
            <div className="w-4 h-4 flex items-center justify-center">
              <Plus size={12} className="text-gray-600" />
            </div>
          </button>
        </div>
      </div>,
      document.body
    )
  }

  return (
    <>
      {renderStudentPopup()}
      {renderLessonPopup()}
      <div
        className="fixed bottom-4 left-0 right-0 z-20 flex justify-center"
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
          // Only allow dragging when expanded (showing as handle)
          if (isExpanded) {
            handleMouseDown(e)
          }
        }}
        onClick={() => {
          // Only handle click when collapsed (showing as button)
          if (!isExpanded) {
            handleDragHandleClick()
          }
        }}
        onMouseEnter={() => setIsHoveringHandle(true)}
        onMouseLeave={() => setIsHoveringHandle(false)}
      >
        {/* Handle that expands to contain text */}
        <div 
          className={`flex items-center justify-center transition-all duration-300 ease-out ${
            !isExpanded
              ? 'h-8 px-6 border border-gray-300' 
              : 'h-1 w-10 bg-gray-400 rounded-full'
          }`}
          style={{
            borderRadius: !isExpanded ? '9999px' : undefined,
            backgroundColor: !isExpanded ? '#f9f9f9' : undefined
          }}
          onMouseEnter={(e) => {
            if (!isExpanded) {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.classList.add('shadow-sm')
              e.currentTarget.style.borderColor = '#e5e7eb' // border-gray-200
            }
          }}
          onMouseLeave={(e) => {
            if (!isExpanded) {
              e.currentTarget.style.backgroundColor = '#f9f9f9'
              e.currentTarget.classList.remove('shadow-sm')
              e.currentTarget.style.borderColor = '#d1d5db' // border-gray-300
            }
          }}
        >
          {/* Text that appears inside the expanded handle */}
          {!isExpanded && (
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap select-none">
              Generate a lesson
            </span>
          )}
        </div>
      </div>
      
      {/* Content Container - Height controlled by drag */}
      <div
        className={`backdrop-blur-sm overflow-hidden ${
          isAnimating ? 'transition-all duration-200 ease-out' : ''
        } ${
          isExpanded ? 'shadow-sm' : ''
        }`}
        style={{ 
          height: `${contentHeight}px`,
          borderRadius: '0.5rem',
          backgroundColor: 'white',
          border: isExpanded ? '1px solid #e5e7eb' : 'none' // gray-200 color only when expanded
        }}
      >
        {isExpanded && (
          <div className="h-full px-5 pt-4 pb-14 flex flex-col relative">
            {/* Selected Profile Indicator - Removed from here, moved to footer */}

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full h-full resize-none outline-none text-[15px] text-gray-700 placeholder-gray-400 leading-relaxed bg-transparent"
              style={{ 
                minHeight: `${Math.max(50, contentHeight - 70)}px`
              }}
            />
            
            {/* Bottom Toolbar */}
            <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-between px-4" style={{ backgroundColor: 'white', borderRadius: '0 0 0.5rem 0.5rem' }}>
              {/* Left Section - Buttons and Selected Items */}
              <div className="flex items-center gap-2">
                {/* Student Profile Button */}
                <button
                  ref={studentButtonRef}
                  onClick={toggleStudentPopup}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 transition-all duration-200"
                  style={{
                    borderRadius: '0.5rem',
                    backgroundColor: 'white'
                  }}
                  title="Add student profile"
                >
                  <User size={16} className="text-gray-600" strokeWidth={2} />
                </button>

                {/* Lesson Button */}
                <button
                  ref={lessonButtonRef}
                  onClick={toggleLessonPopup}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 transition-all duration-200"
                  style={{
                    borderRadius: '0.5rem',
                    backgroundColor: 'white'
                  }}
                  title="Add lesson context"
                >
                  <BookOpen size={16} className="text-gray-600" strokeWidth={2} />
                </button>

                {/* Genius Mode Toggle Button */}
                <button
                  onClick={toggleGeniusMode}
                  className={`px-3 h-8 flex items-center justify-center transition-all duration-200 ${isGeniusMode ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-600'}`}
                  style={{
                    borderRadius: '0.5rem',
                    backgroundColor: isGeniusMode ? 'rgba(52, 95, 216, 0.1)' : 'white',
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                  title={isGeniusMode ? 'Genius mode enabled (gpt-5-thinking-mini)' : 'Enable Genius mode'}
                >
                  <Brain size={16} strokeWidth={2} className="mr-1.5" />
                  <span className="text-sm font-medium">Genius</span>
                </button>

                {/* Selected Profile Indicator */}
                {selectedProfile && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-sm" style={{ borderRadius: '0.5rem' }}>
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
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-sm" style={{ borderRadius: '0.5rem' }}>
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
              </div>

              {/* Generate Button */}
              <button 
                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleGenerate}
                disabled={!text.trim()}
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
    </>
  )
}

export default CollapsibleTextInput