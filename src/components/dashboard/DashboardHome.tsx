// src/components/dashboard/DashboardHome.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, BookOpen, FileText, Presentation } from 'lucide-react'
import AIPromptInput from './AIPromptInput'
import { getUserStudentProfiles, getCurrentUser } from '@/lib/database'
import { useLessons } from '@/hooks/useLessons'
import ToastContainer from '@/components/ui/Toast'

export default function DashboardHome() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const { lessons, loadingLessons, refreshLessons } = useLessons()

  // Load students from Supabase
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoadingStudents(true)
      const user = await getCurrentUser()
      if (!user) {
        console.log('No user found')
        setLoadingStudents(false)
        return
      }
      
      console.log('Loading students for user:', user.id)
      const profiles = await getUserStudentProfiles(user.id)
      console.log('DashboardHome - Loaded student profiles:', profiles)
      setStudents(profiles || [])
    } catch (error) {
      console.error('Error loading students:', error)
      setStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  // Fixed suggestions for language lessons
  const suggestions = [
    { icon: '💬', text: 'Conversation Practice' },
    { icon: '👂', text: 'Listening Comprehension' },
    { icon: '📖', text: 'Reading & Vocabulary' },
    { icon: '✍️', text: 'Grammar Exercises' },
    { icon: '🎯', text: 'Pronunciation Training' },
  ]

  const handleGenerate = async (promptData: any) => {
    if (!promptData.prompt?.trim()) return
    
    // Navigate to the canvas with the prompt and selected data
    navigate('/canvas', { 
      state: { 
        prompt: promptData.prompt.trim(),
        action: 'generate',
        selectedStudent: promptData.selectedStudent,
        selectedLesson: promptData.selectedLesson,
        selectedSlides: promptData.selectedSlides,
        geniusMode: promptData.geniusMode
      } 
    })
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = 'Connor' // You can get this from auth store
    
    if (hour < 12) return `Good morning ${name}`
    if (hour < 17) return `Good afternoon ${name}`
    return `Good evening ${name}`
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-900">{getGreeting()}</h1>
        <p className="mt-1 text-gray-600">What would you like to create today?</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          {/* AI Prompt Input */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-medium text-gray-900">Create with AI</h2>
              {loadingStudents && (
                <span className="text-xs text-gray-500">(Loading students...)</span>
              )}
              {!loadingStudents && students.length > 0 && (
                <span className="text-xs text-green-600">({students.length} student{students.length !== 1 ? 's' : ''} loaded)</span>
              )}
            </div>
            
            <AIPromptInput 
              onSubmit={handleGenerate}
              suggestions={suggestions}
              students={students}
              loadingStudents={loadingStudents}
              lessons={lessons}
              loadingLessons={loadingLessons}
            />
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/canvas')}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <FileText className="w-8 h-8 text-gray-600 mb-3" />
              <h3 className="font-medium text-gray-900">Blank Canvas</h3>
              <p className="text-sm text-gray-600 mt-1">Start from scratch</p>
            </button>

            <button
              onClick={() => navigate('/dashboard/lessons')}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <BookOpen className="w-8 h-8 text-gray-600 mb-3" />
              <h3 className="font-medium text-gray-900">My Lessons</h3>
              <p className="text-sm text-gray-600 mt-1">Continue working</p>
            </button>

            <button
              onClick={() => navigate('/dashboard/tutorials')}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <Presentation className="w-8 h-8 text-gray-600 mb-3" />
              <h3 className="font-medium text-gray-900">Templates</h3>
              <p className="text-sm text-gray-600 mt-1">Use a template</p>
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
