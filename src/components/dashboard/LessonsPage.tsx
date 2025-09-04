// src/components/dashboard/LessonsPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Plus, 
  FileText, 
  Calendar, 
  Sparkles, 
  Loader2, 
  Trash2, 
  Play,
  Filter,
  MoreVertical,
  Clock,
  BookOpen,
  ChevronRight,
  Edit2,
  FolderOpen
} from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, deleteLesson } from '@/lib/database'
import { toast } from '@/utils/toast'
import MiniSlidePreview from '@/components/previews/MiniSlidePreview'
import type { Slide, SlideElement } from '@/types/slide.types'

interface Lesson {
  id: string
  user_id: string
  title: string
  description: string | null
  slide_order: string[]
  target_language: string | null
  course_id: string | null
  created_at: string
  updated_at: string
  last_opened_at: string
  thumbnail?: string
  slide_count?: number
  vocabulary?: string[]
  grammarPoints?: string[]
  topics?: string[]
  firstSlide?: Slide
  duration?: number // in minutes
}

export default function LessonsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLanguage, setFilterLanguage] = useState<string>('all')
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null)

  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    try {
      setLoading(true)
      const user = await getCurrentUser()
      if (!user) {
        toast.error('Please sign in to view lessons')
        navigate('/auth/signin')
        return
      }

      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          slides(
            id,
            slide_order,
            background,
            slide_elements(
              id,
              element_type,
              position_x,
              position_y,
              width,
              height,
              rotation,
              opacity,
              z_index,
              content,
              style,
              locked,
              visible
            )
          )
        `)
        .eq('user_id', user.id)
        .order('last_opened_at', { ascending: false })

      if (error) throw error

      // Transform data to include slide count and first slide
      const lessonsWithCount = (data || []).map(lesson => {
        // Find the first slide (lowest slide_order)
        const firstSlideData = lesson.slides?.sort((a: any, b: any) => a.slide_order - b.slide_order)[0]
        
        // Transform the first slide data if it exists
        let firstSlide: Slide | undefined
        if (firstSlideData) {
          // Transform slide_elements to match the SlideElement type
          const elements: SlideElement[] = (firstSlideData.slide_elements || [])
            .sort((a: any, b: any) => a.z_index - b.z_index)
            .map((el: any) => ({
              id: el.id,
              type: el.element_type,
              x: el.position_x,
              y: el.position_y,
              width: el.width,
              height: el.height,
              rotation: el.rotation || 0,
              opacity: el.opacity ?? 1,
              locked: el.locked || false,
              visible: el.visible !== false,
              content: el.content || {},
              style: el.style || {},
              createdAt: el.created_at,
              updatedAt: el.updated_at
            }))
          
          firstSlide = {
            id: firstSlideData.id,
            presentationId: lesson.id,
            elements,
            background: firstSlideData.background || '#ffffff',
            order: firstSlideData.slide_order,
            createdAt: firstSlideData.created_at,
            updatedAt: firstSlideData.updated_at
          }
        }
        
        return {
          ...lesson,
          slide_count: lesson.slides?.length || 0,
          firstSlide,
          duration: Math.floor(Math.random() * 60) + 15, // Mock duration for demo
          slides: undefined // Remove the slides array from the lesson object
        }
      })

      setLessons(lessonsWithCount)
    } catch (error: any) {
      console.error('Error loading lessons:', error)
      toast.error('Failed to load lessons')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    navigate('/canvas')
  }

  const handleCreateWithAI = () => {
    navigate('/dashboard')
  }

  const handleOpenLesson = (lessonId: string) => {
    navigate('/canvas', { state: { lessonId } })
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return
    }

    try {
      await deleteLesson(lessonId)
      setLessons(lessons.filter(l => l.id !== lessonId))
      toast.success('Lesson deleted successfully')
    } catch (error: any) {
      console.error('Error deleting lesson:', error)
      toast.error('Failed to delete lesson')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'min' : ''}`
    }
    return `${mins}min`
  }

  // Get unique languages from lessons for filter
  const availableLanguages = Array.from(
    new Set(lessons.filter(l => l.target_language).map(l => l.target_language))
  ).sort()

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = filterLanguage === 'all' || lesson.target_language === filterLanguage
    return matchesSearch && matchesLanguage
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-app-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lessons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-h1 text-gray-900">Lessons</h1>
            <p className="text-body text-gray-600 mt-1">Create and manage your lesson materials</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateWithAI}
              className="flex items-center gap-2 px-4 py-2 bg-app-purple-600 text-white rounded-lg hover:bg-app-purple-700 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Create with AI
            </button>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Lesson
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-purple-500"
            />
          </div>
          {availableLanguages.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-purple-500"
              >
                <option value="all">All Languages</option>
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-h5 text-gray-900 mb-2">No lessons found</h3>
          <p className="text-body text-gray-600 mb-6">
            {searchQuery || filterLanguage !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first lesson'}
          </p>
          {!searchQuery && filterLanguage === 'all' && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Start from Scratch
              </button>
              <button
                onClick={handleCreateWithAI}
                className="inline-flex items-center gap-2 px-4 py-2 bg-app-purple-600 text-white rounded-lg hover:bg-app-purple-700 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                Create with AI
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleOpenLesson(lesson.id)}
            >
              {/* Lesson Thumbnail */}
              <div className="aspect-video relative bg-gradient-to-br from-app-purple-100 to-blue-100 rounded-t-xl overflow-hidden">
                {lesson.firstSlide ? (
                  <MiniSlidePreview 
                    slide={lesson.firstSlide} 
                    width={400} 
                    height={225}
                    className="w-full h-full object-cover"
                  />
                ) : lesson.thumbnail ? (
                  <img 
                    src={lesson.thumbnail} 
                    alt={lesson.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <Play className="w-6 h-6 text-app-purple-600" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Lesson Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-h5 text-gray-900 line-clamp-1">
                    {lesson.title || 'Untitled Lesson'}
                  </h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Description */}
                {lesson.description && (
                  <p className="text-body-small text-gray-600 mb-4 line-clamp-2">
                    {lesson.description}
                  </p>
                )}

                {/* Lesson Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-body-small text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{lesson.slide_count} slides</span>
                  </div>
                  {lesson.duration && (
                    <div className="flex items-center gap-2 text-body-small text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(lesson.duration)}</span>
                    </div>
                  )}
                </div>

                {/* Language Badge */}
                {lesson.target_language && (
                  <div className="mb-4">
                    <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-caption font-medium">
                      {lesson.target_language}
                    </span>
                  </div>
                )}

                {/* Lesson Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-caption text-gray-500">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Updated {formatDate(lesson.updated_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenLesson(lesson.id)
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit lesson"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteLesson(lesson.id)
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete lesson"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)
                      }}
                      className="p-2 text-app-purple-600 hover:bg-app-purple-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${expandedLessonId === lesson.id ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedLessonId === lesson.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-body-small font-medium text-gray-700 mb-2">Lesson Details</h4>
                    <div className="space-y-2 text-body-small">
                      {lesson.vocabulary && lesson.vocabulary.length > 0 && (
                        <div>
                          <span className="text-gray-500">Vocabulary:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {lesson.vocabulary.map((word, idx) => (
                              <span key={idx} className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded text-caption">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {lesson.grammarPoints && lesson.grammarPoints.length > 0 && (
                        <div>
                          <span className="text-gray-500">Grammar:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {lesson.grammarPoints.map((point, idx) => (
                              <span key={idx} className="inline-flex px-2 py-1 bg-app-purple-100 text-app-purple-700 rounded text-caption">
                                {point}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
