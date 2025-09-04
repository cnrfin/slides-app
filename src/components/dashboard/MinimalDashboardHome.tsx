// src/components/dashboard/MinimalDashboardHome.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import AIPromptInput from './AIPromptInput'
import './AIPromptInput.css' // Import for shine animation styles
import { savePromptToHistory } from '@/lib/prompt-history'
import { getUserStudentProfiles, getCurrentUser, loadUserLessons } from '@/lib/database'
import { MessageCircle, Headphones, BookOpen, BookType, CaseUpper, Star } from 'lucide-react'

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

export default function MinimalDashboardHome() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingLessons, setLoadingLessons] = useState(true)
  
  // Get state from navigation (when coming from Students or Lessons page)
  const navigationState = location.state as {
    expandPrompt?: boolean
    selectedStudent?: StudentProfile
    selectedLesson?: Lesson
  } | null

  // Clear navigation state after using it (prevents persistence on refresh)
  useEffect(() => {
    if (navigationState) {
      // Clear the state to prevent it from persisting
      window.history.replaceState({}, document.title)
    }
  }, [navigationState])

  // Load students from Supabase
  useEffect(() => {
    // Create async function inside effect to handle data fetching properly
    const loadStudents = async () => {
      try {
        setLoadingStudents(true)
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          console.log('No user found')
          setLoadingStudents(false)
          return
        }
        
        console.log('Loading students for user:', currentUser.id)
        const profiles = await getUserStudentProfiles(currentUser.id)
        console.log('MinimalDashboardHome - Loaded student profiles:', profiles)
        setStudents(profiles || [])
      } catch (error) {
        console.error('Error loading students:', error)
        setStudents([])
      } finally {
        setLoadingStudents(false)
      }
    }

    // Call the async function - not passing it as a callback
    loadStudents()
  }, []) // Empty dependency array - only run on mount

  // Load lessons from Supabase
  useEffect(() => {
    // Create async function inside effect to handle data fetching properly
    const loadLessons = async () => {
      try {
        setLoadingLessons(true)
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          console.log('No user found for lessons')
          setLoadingLessons(false)
          return
        }
        
        console.log('Loading lessons for user:', currentUser.id)
        const userLessons = await loadUserLessons(currentUser.id)
        
        // Transform lessons to the expected format
        const transformedLessons: Lesson[] = userLessons?.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title || 'Untitled Lesson',
          description: lesson.description || '',
          vocabulary: lesson.vocabulary || [],
          grammarPoints: lesson.grammar_points || [],
          topics: lesson.topics || [],
          date: lesson.created_at
        })) || []
        
        console.log('MinimalDashboardHome - Loaded lessons:', transformedLessons)
        setLessons(transformedLessons)
      } catch (error) {
        console.error('Error loading lessons:', error)
        setLessons([])
      } finally {
        setLoadingLessons(false)
      }
    }

    // Call the async function - not passing it as a callback
    loadLessons()
  }, []) // Empty dependency array - only run on mount

  const getGreeting = () => {
    const now = new Date()
    const hour = now.getHours()
    const name = user?.display_name?.split(' ')[0] || 'Connor'
    
    if (hour < 12) return `Good morning, ${name}`
    if (hour < 17) return `Good afternoon, ${name}`
    return `Good evening, ${name}`
  }

  const handlePromptSubmit = async (promptData: any) => {
    // Save prompt to history if we have a simple string
    if (user?.id && promptData.prompt?.trim()) {
      await savePromptToHistory(user.id, promptData.prompt)
    }

    // Navigate to canvas with all the data from AIPromptInput
    navigate('/canvas', { 
      state: { 
        prompt: promptData.prompt?.trim(),
        action: 'generate',
        selectedStudent: promptData.selectedStudent,
        selectedLesson: promptData.selectedLesson,
        selectedSlides: promptData.selectedSlides,
        geniusMode: promptData.geniusMode
      } 
    })
  }

  // Generate lesson type suggestions with Lucide icons
  const lessonTypes = [
    { 
      icon: <MessageCircle size={16} strokeWidth={1.5} className="text-gray-600" />, 
      text: 'Conversation' 
    },
    { 
      icon: <BookOpen size={16} strokeWidth={1.5} className="text-gray-600" />, 
      text: 'Reading' 
    },
    { 
      icon: <Headphones size={16} strokeWidth={1.5} className="text-gray-600" />, 
      text: 'Listening' 
    },
    { 
      icon: <BookType size={16} strokeWidth={1.5} className="text-gray-600" />, 
      text: 'TOEIC' 
    },
    { 
      icon: <CaseUpper size={16} strokeWidth={1.5} className="text-gray-600" />, 
      text: 'Pronunciation' 
    },
  ]

  // Get all suggestions
  const suggestions = lessonTypes

  // Check if user is on free plan - be very explicit
  const subscriptionTier = user?.subscription_tier
  const isFreePlan = !subscriptionTier || subscriptionTier === 'free' || subscriptionTier === null || subscriptionTier === undefined
  
  // Debug logging
  useEffect(() => {
    console.log('User object:', user)
    console.log('User subscription_tier:', subscriptionTier)
    console.log('Is Free Plan:', isFreePlan)
  }, [user, subscriptionTier, isFreePlan])

  const handleUpgradeClick = () => {
    navigate('/dashboard/billing')
  }

  return (
    <div className="min-h-full flex flex-col px-8">
      {/* Upgrade Button - Only show for free users */}
      {isFreePlan && (
        <div className="flex justify-center pt-8">
          <button
            onClick={handleUpgradeClick}
            className="relative px-4 py-2 bg-app-green-100 hover:bg-app-green-700 text-green-700 hover:text-white rounded-full text-body font-normal transition-all hover:scale-105 overflow-hidden shine-button animate-fade-in"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Star size={18} strokeWidth={0} fill="#f0ba2c" className="text-app-yellow" />
              <span>Upgrade plan</span>
            </span>
            <div className="shine-effect" />
          </button>
        </div>
      )}
      
      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl flex flex-col items-center">
          {/* Centered Greeting */}
          <div className="text-center mb-10 animate-fade-in-delay-1 w-full">
            <h1 className="text-h1 text-gray-800 mb-2">
              {getGreeting()}
            </h1>
            <p className="text-body text-gray-500">What kind of lesson shall we make?</p>
          </div>

          {/* AI Prompt Input - Always expanded */}
          <div className="w-full flex justify-center">
            <AIPromptInput 
              onSubmit={handlePromptSubmit}
              suggestions={suggestions}
              students={students}
              lessons={lessons}
              loadingStudents={loadingStudents}
              loadingLessons={loadingLessons}
              isInitiallyExpanded={true}
              initialStudent={navigationState?.selectedStudent}
              initialLesson={navigationState?.selectedLesson}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
