// src/components/lessons/RecentLessonsPopup.tsx
import { useState, useEffect, useRef } from 'react'
import { Clock, Trash2, ChevronRight, Loader2 } from 'lucide-react'
import { loadUserLessons, deleteLesson } from '@/lib/database'
import useAuthStore from '@/stores/authStore'
import useSlideStore from '@/stores/slideStore'
import { toast } from '@/utils/toast'
import { withSessionRecovery } from '@/utils/session-recovery'

interface Lesson {
  id: string
  title: string
  slide_order: string[]
  updated_at: string
  created_at: string
  target_language?: string
  slides: any[]
}

interface RecentLessonsPopupProps {
  isOpen: boolean
  onClose: () => void
  anchorElement: HTMLElement | null
}

export default function RecentLessonsPopup({ isOpen, onClose, anchorElement }: RecentLessonsPopupProps) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()
  const { loadFromDatabase, presentation } = useSlideStore()

  // Fetch lessons when popup opens
  useEffect(() => {
    if (isOpen && user) {
      fetchLessons()
    }
  }, [isOpen, user])

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const fetchLessons = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Wrap the database operation with session recovery
      const data = await withSessionRecovery(
        () => loadUserLessons(user.id),
        {
          onError: (error) => {
            console.error('Error fetching lessons after retries:', error)
          }
        }
      )
      // Sort by updated_at desc (most recent first)
      const sortedLessons = data.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      setLessons(sortedLessons)
    } catch (error) {
      console.error('Error fetching lessons:', error)
      toast.error('Failed to load lessons. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return
    }

    setDeletingId(lessonId)
    try {
      await deleteLesson(lessonId)
      // Remove from local state
      setLessons(lessons.filter(l => l.id !== lessonId))
      toast.success('Lesson deleted successfully')
    } catch (error) {
      console.error('Error deleting lesson:', error)
      toast.error('Failed to delete lesson')
    } finally {
      setDeletingId(null)
    }
  }

  const handleOpenLesson = async (lesson: Lesson) => {
    try {
      // If the lesson is already open, just close the popup
      if (presentation?.id === lesson.id) {
        onClose()
        return
      }

      // Load the lesson
      await loadFromDatabase(lesson.id)
      onClose()
    } catch (error) {
      console.error('Error loading lesson:', error)
      toast.error('Failed to load lesson')
    }
  }

  if (!isOpen || !anchorElement) return null

  const rect = anchorElement.getBoundingClientRect()

  return (
    <div
      ref={popupRef}
      data-recent-lessons-popup
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-[500px] overflow-hidden"
      style={{
        top: 176,
        left: 258,
      }}
    >


      {/* Content */}
      <div className="overflow-y-auto max-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No lessons yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first lesson to see it here</p>
          </div>
        ) : (
          <div>
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => handleOpenLesson(lesson)}
                className={`group px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                  presentation?.id === lesson.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {lesson.title || 'Untitled Lesson'}
                    </h4>
                    {lesson.target_language && (
                      <p className="text-xs text-gray-500 mt-1">
                        {lesson.target_language}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {presentation?.id === lesson.id && (
                      <span className="text-xs text-blue-600 font-medium mr-2">Current</span>
                    )}
                    <button
                      onClick={(e) => handleDeleteLesson(lesson.id, e)}
                      disabled={deletingId === lesson.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete lesson"
                    >
                      {deletingId === lesson.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  )
}
