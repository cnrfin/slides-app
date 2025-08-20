// src/components/dashboard/AIPromptInput.tsx
import { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Plus, X, ArrowUp, ArrowLeft, Brain, Layers, User, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './AIPromptInput.css'

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
  description: string
  vocabulary?: string[]
  grammarPoints?: string[]
  topics?: string[]
  date?: string
}

interface SlideTemplateInfo {
  id: string
  name: string
  category: string
  order?: number
}

interface AIPromptInputProps {
  onSubmit: (data: {
    prompt: string
    selectedStudent?: StudentProfile | null
    selectedLesson?: Lesson | null
    selectedSlides?: SlideTemplateInfo[]
    geniusMode?: boolean
  }) => void
  suggestions?: Suggestion[]
  students?: StudentProfile[]
  loadingStudents?: boolean
}

type PopupView = 'main' | 'slides' | 'student' | 'lesson'

export default function AIPromptInput({ 
  onSubmit,
  suggestions = [],
  students = [],
  loadingStudents = false 
}: AIPromptInputProps) {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupView, setPopupView] = useState<PopupView>('main')
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedSlides, setSelectedSlides] = useState<SlideTemplateInfo[]>([])
  const [lessonSearchQuery, setLessonSearchQuery] = useState('')
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [slideSearchQuery, setSlideSearchQuery] = useState('')
  const [popupPosition, setPopupPosition] = useState<{ bottom: number; left: number } | null>(null)
  const [isGeniusMode, setIsGeniusMode] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const plusButtonRef = useRef<HTMLButtonElement>(null)

  // Debug logging for students
  useEffect(() => {
    console.log('AIPromptInput - students prop:', students)
    console.log('AIPromptInput - loadingStudents:', loadingStudents)
  }, [students, loadingStudents])

  // Mock lessons data (TODO: Load from Supabase)
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

  // Mock slide templates (TODO: Load from templates)
  const availableTemplates: SlideTemplateInfo[] = [
    { id: '1', name: 'Title Slide', category: 'intro' },
    { id: '2', name: 'Warm Up', category: 'warm-up' },
    { id: '3', name: 'Vocabulary', category: 'vocabulary' },
    { id: '4', name: 'Reading Passage', category: 'reading' },
    { id: '5', name: 'Conversation Questions', category: 'conversation' },
    { id: '6', name: 'Review', category: 'review' },
  ]

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

  const filteredLessons = mockLessons.filter(lesson =>
    lesson.title.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
    lesson.topics?.some(topic => topic.toLowerCase().includes(lessonSearchQuery.toLowerCase()))
  )

  const filteredSlides = availableTemplates.filter(slide =>
    slide.name.toLowerCase().includes(slideSearchQuery.toLowerCase()) ||
    slide.category.toLowerCase().includes(slideSearchQuery.toLowerCase())
  )

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isExpanded])

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
          setSlideSearchQuery('')
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPopup])

  const handleSubmit = () => {
    if (!prompt.trim() || selectedSlides.length === 0) return
    
    setIsGenerating(true)
    onSubmit({
      prompt,
      selectedStudent: selectedProfile,
      selectedLesson,
      selectedSlides,
      geniusMode: isGeniusMode
    })
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
      setSlideSearchQuery('')
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

  const toggleSlideTemplate = (slide: SlideTemplateInfo) => {
    setSelectedSlides(prev => {
      const exists = prev.find(s => s.id === slide.id)
      if (exists) {
        const filtered = prev.filter(s => s.id !== slide.id)
        return filtered.map((s, index) => ({ ...s, order: index + 1 }))
      } else {
        return [...prev, { ...slide, order: prev.length + 1 }]
      }
    })
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

  // Render the popup
  const renderPopup = () => {
    if (!showPopup || !isExpanded || !popupPosition) return null

    return ReactDOM.createPortal(
      <div 
        className="main-popup fixed bg-white rounded-lg shadow-lg border border-gray-200 animate-popup-in"
        style={{ 
          bottom: `${popupPosition.bottom}px`,
          left: `${popupPosition.left}px`,
          width: popupView === 'slides' ? '400px' : '320px',
          maxHeight: '400px',
          zIndex: 9999
        }}
      >
        {popupView === 'main' && (
          <>
            <div className="p-3">
              <button
                onClick={() => setPopupView('slides')}
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
            </div>
          </>
        )}

        {popupView === 'slides' && (
          <>
            <div className="flex items-center gap-2 p-3 border-b border-gray-100">
              <button
                onClick={() => {
                  setPopupView('main')
                  setSlideSearchQuery('')
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} className="text-gray-600" strokeWidth={1.5} />
              </button>
              <input
                type="text"
                value={slideSearchQuery}
                onChange={(e) => setSlideSearchQuery(e.target.value)}
                placeholder="Search templates"
                className="w-full px-3 py-1.5 text-sm outline-none bg-transparent"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 'calc(400px - 120px)' }}>
              {filteredSlides.map((slide) => {
                const selectedSlide = selectedSlides.find(s => s.id === slide.id)
                const isSelected = !!selectedSlide
                return (
                  <button
                    key={slide.id}
                    onClick={() => toggleSlideTemplate(slide)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-colors ${
                      isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected && (
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {selectedSlide.order}
                        </div>
                      )}
                      {!isSelected && (
                        <div className="w-6 h-6 border border-gray-300 rounded-full" />
                      )}
                      <div>
                        <div className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                          {slide.name}
                        </div>
                        <div className="text-xs text-gray-500">{slide.category}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="p-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowPopup(false)
                  setPopupView('main')
                  setSlideSearchQuery('')
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Done ({selectedSlides.length} selected)
              </button>
            </div>
          </>
        )}

        {popupView === 'student' && (
          <>
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

            <div className="max-h-48 overflow-y-auto">
              {loadingStudents ? (
                <div className="px-4 py-6 text-center">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto" />
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

            <div className="max-h-64 overflow-y-auto">
              {filteredLessons.length > 0 ? (
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
                  No lessons found
                </div>
              )}
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
      
      {!isExpanded ? (
        // Collapsed State
        <div className="flex flex-col items-center">
          {/* Build a lesson button */}
          <button
            onClick={() => setIsExpanded(true)}
            className="relative px-8 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full font-medium transition-all hover:scale-105 mb-10 animate-fade-in overflow-hidden shine-button"
          >
            <span className="relative z-10">Build a lesson</span>
            <div className="shine-effect" />
          </button>
          
          {/* Suggestions - Bento style: 2 on top, 3 below */}
          {suggestions.length > 0 && (
            <div className="w-full opacity-0 animate-fade-in-delay-2">
              <div className="flex flex-col gap-2">
                {/* Top row - 2 buttons */}
                <div className="flex gap-2 justify-center">
                  {suggestions.slice(0, 2).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-xs"
                    >
                      <span>{suggestion.icon}</span>
                      <span className="text-gray-600">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
                {/* Bottom row - 3 buttons */}
                <div className="flex gap-2 justify-center">
                  {suggestions.slice(2).map((suggestion, index) => (
                    <button
                      key={index + 2}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-xs"
                    >
                      <span>{suggestion.icon}</span>
                      <span className="text-gray-600">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Expanded State
        <div className="flex flex-col items-center">
          {/* Text input area with footer buttons */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full animate-fade-in">
            <div className="p-1">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the lesson you want to create..."
                className="w-full px-4 py-3 rounded-lg resize-none focus:outline-none bg-transparent text-gray-700 placeholder-gray-400"
                rows={5}
                disabled={isGenerating}
                style={{ minHeight: '120px' }}
              />
              
              {/* Bottom Toolbar */}
              <div className="flex items-center justify-between px-3 pb-3">
                {/* Left Section - Plus Button and Selected Items */}
                <div className="flex items-center gap-2">
                  {/* Plus Button */}
                  <button
                    ref={plusButtonRef}
                    onClick={togglePopup}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 transition-all duration-200 hover:bg-gray-100 active:bg-gray-100 rounded-lg"
                    style={{
                      backgroundColor: showPopup ? '#f3f4f6' : 'white'
                    }}
                    title="Add content"
                  >
                    <Plus size={16} className="text-gray-600" strokeWidth={1.5} />
                  </button>

                  {/* Genius Mode Toggle Button with scale animation */}
                  <button
                    onClick={toggleGeniusMode}
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
                    className={`px-3 h-8 flex items-center justify-center transition-all duration-200 rounded-lg border ${
                      isGeniusMode 
                        ? 'border-purple-700 text-purple-700 bg-purple-50' 
                        : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                    }`}
                    title={isGeniusMode ? 'Genius mode enabled' : 'Enable Genius mode'}
                  >
                    <Brain size={16} strokeWidth={1.5} className="mr-1.5" />
                    <span className="text-sm font-medium">Genius</span>
                  </button>

                  {/* Selected Slides Indicator */}
                  {selectedSlides.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">
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
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">
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
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">
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

                {/* Generate Button - Solid purple */}
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || selectedSlides.length === 0 || isGenerating}
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  tabIndex={-1}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Suggestions - Same buttons when expanded */}
          {suggestions.length > 0 && (
            <div className="w-full animate-fade-in mt-10">
              <div className="flex flex-col gap-2">
                {/* Top row - 2 buttons */}
                <div className="flex gap-2 justify-center">
                  {suggestions.slice(0, 2).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-xs"
                    >
                      <span>{suggestion.icon}</span>
                      <span className="text-gray-600">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
                {/* Bottom row - 3 buttons */}
                <div className="flex gap-2 justify-center">
                  {suggestions.slice(2).map((suggestion, index) => (
                    <button
                      key={index + 2}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-xs"
                    >
                      <span>{suggestion.icon}</span>
                      <span className="text-gray-600">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
