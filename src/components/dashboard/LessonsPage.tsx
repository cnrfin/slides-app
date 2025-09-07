// src/components/dashboard/LessonsPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Search, 
  FileText, 
  Calendar, 
  Trash2, 
  Play,
  MoreVertical,
  Clock,
  BookOpen,
  ChevronRight,
  Edit2,
  Plus,
} from 'lucide-react'
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

// Custom No Lessons Icon Component
const NoLessonsIcon = () => (
  <div className="flex flex-col items-center gap-2">
    <div className="grid grid-cols-2 gap-2">
      <div className="w-12 h-12 border-2 border-dashed border-app-black dark:border-gray-600 rounded-lg"></div>
      <div className="w-12 h-12 border-2 border-dashed border-app-black dark:border-gray-600 rounded-lg"></div>
      <div className="w-12 h-12 border-2 border-dashed border-app-black dark:border-gray-600 rounded-lg"></div>
      <div className="w-12 h-12 border-2 border-dashed border-app-black dark:border-gray-600 rounded-lg"></div>
    </div>
  </div>
)

export default function LessonsPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all-lessons')
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
        toast.error(t('lessonsPage.errors.signInRequired'))
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
      toast.error(t('lessonsPage.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    navigate('/canvas')
  }

  const handleOpenLesson = (lessonId: string) => {
    navigate('/canvas', { state: { lessonId } })
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm(t('lessonsPage.deleteConfirmation'))) {
      return
    }

    try {
      await deleteLesson(lessonId)
      setLessons(lessons.filter(l => l.id !== lessonId))
      toast.success(t('lessonsPage.deleteSuccess'))
    } catch (error: any) {
      console.error('Error deleting lesson:', error)
      toast.error(t('lessonsPage.errors.deleteFailed'))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const locale = i18n.language || 'en'
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return t('lessonsPage.duration.hoursMinutes', { hours, minutes: mins })
    }
    return t('lessonsPage.duration.minutes', { minutes: mins })
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
          <div className="w-8 h-8 border-2 border-app-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('lessonsPage.loading')}</p>
        </div>
      </div>
    )
  }

  // Check if language is Asian (simplified check)
  const isAsianLanguage = () => {
    const lang = i18n.language || 'en'
    return ['zh', 'ja', 'ko'].some(code => lang.toLowerCase().startsWith(code))
  }

  const getFontFamily = () => {
    return isAsianLanguage() ? 'Noto Sans, sans-serif' : 'Inter, sans-serif'
  }

  return (
    <div className="p-2 sm:p-8 max-w-7xl mx-auto">
      {/* Page Header with New Lesson Button */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-normal text-app-black-900 dark:text-dark-heading">{t('lessonsPage.title')}</h1>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-2.5 bg-app-black dark:bg-dark-accent text-white font-medium rounded-lg hover:scale-105 hover:bg-app-black dark:hover:bg-dark-accent/80 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">{t('lessonsPage.newLesson')}</span>
          </button>
        </div>
        
        {/* Tabs and Search Bar - Same Row on Desktop, Stacked on Mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
          {/* Tabs */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab('all-lessons')}
              className={`px-4 py-2 text-base font-medium rounded-lg transition-all ${
                activeTab === 'all-lessons'
                  ? 'text-app-black dark:text-dark-heading'
                  : 'text-app-gray-500 dark:text-gray-400 hover:bg-app-light-gray-100 dark:hover:bg-white/10'
              }`}
            >
              {t('allLessons')}
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 text-base font-medium rounded-lg transition-all ${
                activeTab === 'courses'
                  ? 'text-app-black dark:text-dark-heading'
                  : 'text-app-gray-500 dark:text-gray-400 hover:bg-app-light-gray-100 dark:hover:bg-white/10'
              }`}
            >
              {t('courses')}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder={t('lessonsPage.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-app-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-card focus:bg-white dark:focus:bg-dark-card focus:outline-none focus:ring-2 focus:ring-app-secondary-bg dark:focus:ring-dark-accent focus:border-app-secondary-bg dark:focus:border-dark-accent transition-all dark:text-dark-text dark:placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'all-lessons' ? (
        <>
          {/* Lessons Grid or Empty State */}
          {filteredLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <NoLessonsIcon />
              <h3 
                className="text-2xl font-medium text-gray-700 dark:text-gray-300 mt-6 mb-3"
                style={{ fontFamily: getFontFamily() }}
              >
                {t('lessonsPage.empty.title')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
                {t('lessonsPage.empty.description')}
              </p>
              <button
                onClick={handleCreateNew}
                className="px-6 py-3 bg-app-black dark:bg-dark-accent text-white font-medium hover:scale-105 rounded-lg hover:bg-app-black dark:hover:bg-dark-accent/80 transition-colors"
              >
                {t('lessonsPage.empty.createButton')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl hover:shadow-lg dark:hover:shadow-dark transition-shadow cursor-pointer"
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
                        <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600" />
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
                      <h3 className="text-h5 text-gray-900 dark:text-dark-heading line-clamp-1">
                        {lesson.title || t('lessonsPage.untitled')}
                      </h3>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </button>
                    </div>

                    {/* Description */}
                    {lesson.description && (
                      <p className="text-body-small text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {lesson.description}
                      </p>
                    )}

                    {/* Lesson Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-body-small text-gray-600 dark:text-gray-400">
                        <BookOpen className="w-4 h-4" />
                        <span>{t('lessonsPage.slideCount', { count: lesson.slide_count })}</span>
                      </div>
                      {lesson.duration && (
                        <div className="flex items-center gap-2 text-body-small text-gray-600 dark:text-gray-400">
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
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-caption text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {t('lessonsPage.updated')} {formatDate(lesson.updated_at)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenLesson(lesson.id)
                          }}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                          title={t('lessonsPage.actions.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteLesson(lesson.id)
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t('lessonsPage.actions.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)
                          }}
                          className="p-2 text-app-purple-600 dark:text-app-purple-400 hover:bg-app-purple-50 dark:hover:bg-app-purple-900/20 rounded-lg transition-colors"
                          title={t('lessonsPage.actions.viewDetails')}
                        >
                          <ChevronRight className={`w-4 h-4 transition-transform ${expandedLessonId === lesson.id ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedLessonId === lesson.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="text-body-small font-medium text-gray-700 dark:text-gray-300 mb-2">{t('lessonsPage.details.title')}</h4>
                        <div className="space-y-2 text-body-small">
                          {lesson.vocabulary && lesson.vocabulary.length > 0 && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">{t('lessonsPage.details.vocabulary')}:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {lesson.vocabulary.map((word, idx) => (
                                  <span key={idx} className="inline-flex px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-caption">
                                    {word}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {lesson.grammarPoints && lesson.grammarPoints.length > 0 && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">{t('lessonsPage.details.grammar')}:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {lesson.grammarPoints.map((point, idx) => (
                                  <span key={idx} className="inline-flex px-2 py-1 bg-app-purple-100 dark:bg-app-purple-900/30 text-app-purple-700 dark:text-app-purple-300 rounded text-caption">
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
        </>
      ) : (
        // Courses Tab Content
        <div className="flex flex-col items-center justify-center py-16">
          <NoLessonsIcon />
          <h3 
            className="text-2xl font-medium text-gray-700 dark:text-gray-300 mt-6 mb-3"
            style={{ fontFamily: getFontFamily() }}
          >
            {t('lessonsPage.emptyCourses.title')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
            {t('lessonsPage.emptyCourses.description')}
          </p>
          <button
            onClick={() => {
              // Navigate to course creation or show course creation modal
              toast.info('Course creation coming soon!')
            }}
            className="px-6 py-3 bg-app-black dark:bg-dark-accent text-white font-medium hover:scale-105 rounded-lg hover:bg-app-black dark:hover:bg-dark-accent/80 transition-colors"
          >
            {t('lessonsPage.emptyCourses.createButton')}
          </button>
        </div>
      )}
    </div>
  )
}
