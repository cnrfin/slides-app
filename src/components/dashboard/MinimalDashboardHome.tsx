// src/components/dashboard/MinimalDashboardHome.tsx
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import AIPromptInput from './AIPromptInput'
import { savePromptToHistory } from '@/lib/prompt-history'
import { MessageCircle, Headphones, BookOpen, BookType, CaseUpper } from 'lucide-react'

export default function MinimalDashboardHome() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const getGreeting = () => {
    const now = new Date()
    const hour = now.getHours()
    const name = user?.display_name?.split(' ')[0] || 'Connor'
    
    if (hour < 12) return `Good morning, ${name}`
    if (hour < 17) return `Good afternoon, ${name}`
    return `Good evening, ${name}`
  }

  const handlePromptSubmit = async (prompt: string) => {
    // Save prompt to history
    if (user?.id && prompt.trim()) {
      await savePromptToHistory(user.id, prompt)
    }

    // Navigate to canvas with the prompt
    navigate('/canvas', { 
      state: { 
        prompt: prompt.trim(),
        action: 'generate' 
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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 relative">
      {/* Centered Greeting */}
      <div className="text-center mb-10 opacity-0 animate-fade-in-delay-1">
        <h1 className="text-3xl font-normal text-gray-800 mb-2">
          {getGreeting()}
        </h1>
        <p className="text-gray-500">What kind of lesson shall we make?</p>
      </div>

      {/* AI Prompt Input */}
      <AIPromptInput 
        onSubmit={handlePromptSubmit}
        suggestions={suggestions}
      />
    </div>
  )
}
