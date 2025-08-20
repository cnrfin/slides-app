import React, { useState, useRef, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Plus, X, ArrowUp, ArrowLeft, Brain, Layers, User, BookOpen, AlertCircle, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { openai } from '@/lib/openai'
import useSlideStore from '@/stores/slideStore'
import { nanoid } from 'nanoid'
import type { SlideTemplate } from '@/types/template.types'
import { populateTemplate } from '@/utils/template.utils'
import { useTemplates } from '@/hooks/useTemplates'
import Modal from './Modal'
import { showToast, clearLoadingToasts } from './Toast'
import { getUserStudentProfiles, getCurrentUser } from '@/lib/database'

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

interface CollapsibleTextInputProps {
  placeholder?: string
  onSubmit?: (text: string, selectedProfile?: StudentProfile, selectedLesson?: Lesson, useGeniusMode?: boolean, selectedSlides?: SlideTemplateInfo[]) => void
  onHeightChange?: (totalHeight: number) => void
  minHeight?: number
  maxHeight?: number
  defaultHeight?: number
}

type PopupView = 'main' | 'slides' | 'student' | 'lesson'

// Template data structure examples for OpenAI
const templateDataStructures: Record<string, any> = {
  'warm-up': {
    school: "string - School or institution name",
    question: ["array of 4 warm-up questions"]
  },
  'vocabulary': {
    school: "string - School or institution name", 
    vocabulary: [
      { word: "vocabulary word", meaning: "definition or translation" },
      "... exactly 5 items"
    ]
  },
  'conversation': {
    school: "string - School or institution name",
    question: ["array of 4 conversation questions"]
  },
  'reading': {
    school: "string - School or institution name",
    title: "string - Reading passage title",
    passage: "string - The main reading text (keep concise, 2-3 sentences)",
    question: ["array of 2 comprehension questions"],
    source: "string - Source citation (optional)"
  },
  'review': {
    school: "string - School or institution name",
    objective: ["array of 4 lesson objectives or key points"]
  },
  'title': {
    school: "string - School or institution name",
    title: "string - Lesson title",
    subtitle: "string - Lesson subtitle or description"
  },
  'end': {
    school: "string - School or institution name"
  },
  'objectives': {
    school: "string - School or institution name",
    objective: ["array of 4 lesson objectives"]
  }
}

// Special data structures for specific vocabulary templates
const specialTemplateStructures: Record<string, any> = {
  'synonyms-exercise': {
    school: "string - School or institution name",
    vocabulary: [
      { word: "word1", synonym: "primary synonym for word1", synonym2: "alternate synonym for word1" },
      { word: "word2", synonym: "primary synonym for word2" },
      { word: "word3", synonym: "primary synonym for word3", synonym2: "alternate synonym for word3" },
      { word: "word4", synonym: "primary synonym for word4", synonym2: "alternate synonym for word4" },
      { word: "word5", synonym: "primary synonym for word5" }
    ],
  },
  'gap-fill-exercise': {
    school: "string - School or institution name",
    vocabulary: [
      { word: "word1", gapfill: "sentence with _____ for word1" },
      { word: "word2", gapfill: "sentence with _____ for word2" },
      { word: "word3", gapfill: "sentence with _____ for word3" },
      { word: "word4", gapfill: "sentence with _____ for word4" },
      { word: "word5", gapfill: "sentence with _____ for word5" }
    ]
  },
  'vocabulary-6-items': {
    school: "string - School or institution name",
    title: "string - Vocabulary title",
    subtitle: "string - Vocabulary subtitle",
    vocabulary: [
      { word: "word1", meaning: "definition1" },
      { word: "word2", meaning: "definition2" },
      { word: "word3", meaning: "definition3" },
      { word: "word4", meaning: "definition4" },
      { word: "word5", meaning: "definition5" },
      { word: "word6", meaning: "definition6" }
    ]
  },
  'vocabulary': {
    school: "string - School or institution name",
    vocabulary: [
      { word: "vocabulary word 1", meaning: "definition or meaning 1" },
      { word: "vocabulary word 2", meaning: "definition or meaning 2" },
      { word: "vocabulary word 3", meaning: "definition or meaning 3" },
      { word: "vocabulary word 4", meaning: "definition or meaning 4" },
      { word: "vocabulary word 5", meaning: "definition or meaning 5" }
    ],
  }
}

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
  const [selectedSlides, setSelectedSlides] = useState<SlideTemplateInfo[]>([])
  const [lessonSearchQuery, setLessonSearchQuery] = useState('')
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [slideSearchQuery, setSlideSearchQuery] = useState('')
  const [popupPosition, setPopupPosition] = useState<{ bottom: number; left: number } | null>(null)
  const [isGeniusMode, setIsGeniusMode] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dragStartY = useRef(0)
  const dragStartHeight = useRef(0)
  const justFinishedDragging = useRef(false)
  const plusButtonRef = useRef<HTMLButtonElement>(null)

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

  // Mock lessons data
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

  // Get actual templates from the templates hook
  const availableTemplates: SlideTemplateInfo[] = templates
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
  const filteredLessons = mockLessons.filter(lesson =>
    lesson.title.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
    lesson.topics?.some(topic => topic.toLowerCase().includes(lessonSearchQuery.toLowerCase()))
  )

  // Filter slide templates based on search query
  const filteredSlides = availableTemplates.filter(slide =>
    slide.name.toLowerCase().includes(slideSearchQuery.toLowerCase()) ||
    slide.category.toLowerCase().includes(slideSearchQuery.toLowerCase())
  )

  // Notify parent of height changes
  useEffect(() => {
    if (onHeightChange) {
      const totalHeight = 32 + contentHeight
      onHeightChange(totalHeight)
    }
  }, [contentHeight, onHeightChange])

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

  const generateSystemPrompt = (selectedTemplates: SlideTemplate[], geniusMode: boolean) => {
    const templateInfo = selectedTemplates.map((template, index) => {
      const category = template.category
      // Check if it's a special template that needs a different structure
      const specialStructure = specialTemplateStructures[template.id]
      const structure = specialStructure || templateDataStructures[category] || {}
      
      return `
Slide ${index + 1}: ${template.name} (${category} type, template id: ${template.id})
Expected data structure:
${JSON.stringify(structure, null, 2)}
`
    }).join('\n')
    
    const basePrompt = `You are a language learning curriculum designer. Generate JSON data for a language lesson based on the user's prompt.

The lesson should have ${selectedTemplates.length} slides with the following templates:
${templateInfo}

Return a JSON object with the following structure:
{
  "lessonTitle": "Overall lesson title",
  "slides": [
    // Array of data objects, one for each slide template in order
  ]
}

Important guidelines:
- Each slide data object should match the expected structure for its template type
- For vocabulary slides, provide exactly 5 vocabulary items (or as many as specified)
- For synonyms-exercise: provide vocabulary as an array of 5 objects. Some words should have both 'synonym' and 'synonym2' properties to fill all 8 slots
- For gap-fill-exercise: provide vocabulary as an array of objects with 'word' and 'gapfill' properties
- For vocabulary-6-items: provide vocabulary as an array of 6 objects with 'word' and 'meaning' properties
- For standard vocabulary template: vocabulary should be an array of objects with 'word' and 'meaning' properties
- For question arrays, provide exactly 4 questions unless otherwise specified
- For reading slides, provide exactly 2 comprehension questions
- Keep reading passages concise (2-3 sentences) to fit in the template
- Keep content appropriate for language learning
- Make content engaging and educational
- If a school name is needed, use "Language Learning Academy" as default
- Ensure all text is clear and concise`
    
    // Add advanced reasoning instructions for genius mode
    if (geniusMode) {
      return basePrompt + `

ADVANCED REASONING MODE ACTIVATED:
- Think step-by-step about the educational objectives
- Consider the pedagogical progression across slides
- Ensure vocabulary difficulty is appropriately scaffolded
- Create connections between different slide contents
- Include more sophisticated language patterns and structures
- Add cultural context where relevant
- Consider different learning styles (visual, auditory, kinesthetic)
- Make questions thought-provoking and discussion-worthy
- Ensure content builds upon previous concepts systematically
- Use more creative and engaging examples
- Consider real-world applications of the language concepts

The user's language learning topic/prompt is below.`
    }
    
    return basePrompt + `\n\nThe user's language learning topic/prompt is below.`
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
      const selectedTemplateObjects = selectedSlides
        .map(slide => templates.find(t => t.id === slide.id))
        .filter((t): t is SlideTemplate => t !== undefined)
      
      if (selectedTemplateObjects.length === 0) {
        throw new Error('Please select at least one slide template')
      }

      // Check if OpenAI API key is configured
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.')
      }
      
      // Build the complete prompt with additional context
      let fullPrompt = currentText
      
      // Add student profile context if selected
      if (currentSelectedProfile) {
        fullPrompt += `\n\nStudent Profile:
- Name: ${currentSelectedProfile.name}
- Target Language: ${currentSelectedProfile.target_language || 'Not specified'}
- Native Language: ${currentSelectedProfile.native_language || 'Not specified'}
- Level: ${currentSelectedProfile.level || 'Not specified'}
- Goals: ${currentSelectedProfile.goals?.join(', ') || 'Not specified'}
- Interests: ${currentSelectedProfile.interests || 'Not specified'}
Please tailor the content appropriately for this student's background and language learning needs.`
      }
      
      // Add lesson context if selected
      if (currentSelectedLesson) {
        fullPrompt += `\n\nPrevious Lesson Context:
- Title: ${currentSelectedLesson.title}
- Description: ${currentSelectedLesson.description}
- Vocabulary covered: ${currentSelectedLesson.vocabulary?.join(', ') || 'None'}
- Grammar points: ${currentSelectedLesson.grammarPoints?.join(', ') || 'None'}
- Topics: ${currentSelectedLesson.topics?.join(', ') || 'None'}
Please build upon or reference this previous lesson content where appropriate.`
      }
      
      const systemPrompt = generateSystemPrompt(selectedTemplateObjects, currentIsGeniusMode)
      
      // Use gpt-5-mini for both modes (genius mode uses different prompting strategy)
      const model = 'gpt-5-mini'
      
      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullPrompt }
        ],
        temperature: 1, // GPT-5-mini only supports default temperature of 1
        response_format: { type: 'json_object' }
      })
      
      const content = response.choices[0].message.content
      if (!content) throw new Error('No content generated')
      
      const data = JSON.parse(content)
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
        
        // Add each template with its generated data
        selectedTemplateObjects.forEach((template, index) => {
          const slideData = data.slides[index] || {}
          
          // Deep clone the template to ensure we're working with fresh data
          const freshTemplate = JSON.parse(JSON.stringify(template))
          
          // Special handling for synonyms-exercise to use alternate synonyms
          if (freshTemplate.id === 'synonyms-exercise') {
            // Create modified elements that use synonym2 for duplicate references
            const modifiedElements = freshTemplate.elements.map((el) => {
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
            modifiedElements.forEach(el => {
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
            freshTemplate.elements.forEach(el => {
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
      setSlideSearchQuery('')
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

  const toggleSlideTemplate = (slide: SlideTemplateInfo) => {
    setSelectedSlides(prev => {
      const exists = prev.find(s => s.id === slide.id)
      if (exists) {
        // Remove and reorder remaining slides
        const filtered = prev.filter(s => s.id !== slide.id)
        return filtered.map((s, index) => ({ ...s, order: index + 1 }))
      } else {
        // Add with order number
        return [...prev, { ...slide, order: prev.length + 1 }]
      }
    })
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

  // Render the unified popup
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
          zIndex: 9
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
            {/* Search Bar with back button */}
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

            {/* Slide Templates List */}
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

            {/* Done Button */}
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
    <>
      {renderPopup()}
      
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
                  <li key={slide.id} className="flex items-center gap-2">
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
              <p className="text-sm text-gray-600">{selectedProfile.name} - {selectedProfile.firstLanguage}</p>
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
            className={`backdrop-blur-sm overflow-hidden ${
              isAnimating ? 'transition-all duration-200 ease-out' : ''
            } ${
              isExpanded ? 'shadow-sm' : ''
            } ${
              isGenerating ? 'opacity-75' : ''
            }`}
            style={{ 
              height: `${contentHeight}px`,
              borderRadius: '0.5rem',
              backgroundColor: isGenerating ? '#f9fafb' : 'white',
              border: isExpanded ? '1px solid #e5e7eb' : 'none',
              cursor: isGenerating ? 'not-allowed' : 'auto'
            }}
          >
            {isExpanded && (
              <div className="h-full px-5 pt-4 pb-14 flex flex-col relative">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className={`w-full h-full resize-none outline-none text-[15px] placeholder-gray-400 leading-relaxed bg-transparent ${
                    isGenerating ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
                  }`}
                  style={{ 
                    minHeight: `${Math.max(50, contentHeight - 70)}px`
                  }}
                  disabled={isGenerating}
                />
                
                {/* Bottom Toolbar */}
                <div className={`absolute bottom-0 left-0 right-0 h-12 flex items-center justify-between px-4 ${
                  isGenerating ? 'opacity-50 pointer-events-none' : ''
                }`} style={{ backgroundColor: 'white', borderRadius: '0 0 0.5rem 0.5rem' }}>
                  {/* Left Section - Plus Button and Selected Items */}
                  <div className="flex items-center gap-2">
                    {/* Unified Plus Button */}
                    <button
                      ref={plusButtonRef}
                      onClick={togglePopup}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 transition-all duration-200 hover:bg-gray-100 active:bg-gray-100"
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
                      className={`px-3 h-8 flex items-center justify-center transition-all duration-200 ${isGeniusMode ? 'border-purple-700 text-purple-700' : 'border-gray-300 text-gray-600'}`}
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
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-sm" style={{ borderRadius: '0.5rem' }}>
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
                    disabled={!text.trim() || selectedSlides.length === 0}
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
