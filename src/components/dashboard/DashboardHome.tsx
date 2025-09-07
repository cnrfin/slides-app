// src/components/dashboard/DashboardHome.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sparkles, BookOpen, FileText, Presentation } from 'lucide-react'
import AIPromptInput from './AIPromptInput'
import { getUserStudentProfiles, getCurrentUser } from '@/lib/database'
import { useLessons } from '@/hooks/useLessons'
import ToastContainer from '@/components/ui/Toast'

export default function DashboardHome() {
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
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

  // Fixed suggestions for language lessons - Only 3 as per new design
  const suggestions = [
    { icon: '💬', text: t('dashboardHome.suggestions.conversationPractice') },
    { icon: '📖', text: t('dashboardHome.suggestions.readingVocabulary') },
    { icon: '✍️', text: t('dashboardHome.suggestions.grammarExercises') },
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
    
    if (hour < 12) return t('dashboardHome.greetings.goodMorning', { name })
    if (hour < 17) return t('dashboardHome.greetings.goodAfternoon', { name })
    return t('dashboardHome.greetings.goodEvening', { name })
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-h2 text-gray-900">{getGreeting()}</h1>
        <p className="text-body mt-1 text-gray-600">{t('dashboardHome.subtitle')}</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          {/* AI Prompt Input */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-app-purple" />
              <h2 className="text-h5 text-gray-900">{t('dashboardHome.createWithAI')}</h2>
              {loadingStudents && (
                <span className="text-caption text-gray-500">({t('dashboardHome.loadingStudents')})</span>
              )}
              {!loadingStudents && students.length > 0 && (
                <span className="text-caption text-green-600">
                  ({students.length} {students.length === 1 ? t('dashboardHome.student') : t('dashboardHome.students')} {t('dashboardHome.loaded')})
                </span>
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
              <h3 className="text-h6 text-gray-900">{t('dashboardHome.quickActions.blankCanvas.title')}</h3>
              <p className="text-body-small text-gray-600 mt-1">{t('dashboardHome.quickActions.blankCanvas.description')}</p>
            </button>

            <button
              onClick={() => navigate('/dashboard/lessons')}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <BookOpen className="w-8 h-8 text-gray-600 mb-3" />
              <h3 className="text-h6 text-gray-900">{t('dashboardHome.quickActions.myLessons.title')}</h3>
              <p className="text-body-small text-gray-600 mt-1">{t('dashboardHome.quickActions.myLessons.description')}</p>
            </button>

            <button
              onClick={() => navigate('/dashboard/tutorials')}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <Presentation className="w-8 h-8 text-gray-600 mb-3" />
              <h3 className="text-h6 text-gray-900">{t('dashboardHome.quickActions.templates.title')}</h3>
              <p className="text-body-small text-gray-600 mt-1">{t('dashboardHome.quickActions.templates.description')}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
