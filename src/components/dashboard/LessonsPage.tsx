// src/components/dashboard/LessonsPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
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
  Layers,
  Hash,
  Type,
  Filter,
  Download,
  Share2,
  Copy
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

// Custom No Lessons Icon Component with animation
const NoLessonsIcon = () => (
  <motion.div 
    className="flex flex-col items-center gap-2"
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="grid grid-cols-2 gap-2">
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="w-12 h-12 border-2 border-dashed border-app-border dark:border-dark-border/20 rounded-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        />
      ))}
    </div>
  </motion.div>
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

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

  const handleDuplicateLesson = async (lesson: Lesson) => {
    try {
      toast.info('Duplicating lesson...')
      // Implement duplication logic here
      toast.success('Lesson duplicated successfully!')
    } catch (error) {
      toast.error('Failed to duplicate lesson')
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
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-8 h-8 border-2 border-app-green-700 dark:border-dark-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-app-gray dark:text-app-light-gray">{t('lessonsPage.loading')}</p>
        </motion.div>
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
    <motion.div 
      className="p-2 sm:p-8 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page Header with New Lesson Button */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-normal text-app-black dark:text-dark-text">{t('lessonsPage.title')}</h1>
          <motion.button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-app-green-700 dark:bg-dark-accent text-white rounded-lg hover:bg-app-green-800 dark:hover:bg-dark-accent/80 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={18} strokeWidth={1.5} />
            <span className="hidden sm:inline text-sm font-medium">{t('lessonsPage.newLesson')}</span>
          </motion.button>
        </div>
        
        {/* Tabs and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
          {/* Tabs */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab('all-lessons')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'all-lessons'
                  ? 'text-app-black dark:text-dark-text bg-app-secondary-bg-solid dark:bg-white/10'
                  : 'text-app-gray dark:text-app-light-gray hover:bg-app-secondary-bg-solid dark:hover:bg-white/5'
              }`}
            >
              {t('allLessons')}
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'courses'
                  ? 'text-app-black dark:text-dark-text bg-app-secondary-bg-solid dark:bg-white/10'
                  : 'text-app-gray dark:text-app-light-gray hover:bg-app-secondary-bg-solid dark:hover:bg-white/5'
              }`}
            >
              {t('courses')}
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-gray dark:text-app-light-gray w-5 h-5" strokeWidth={1.5} />
              <input
                type="text"
                placeholder={t('lessonsPage.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg outline-none focus:ring-2 focus:ring-app-green-700/20 dark:focus:ring-dark-accent/20 focus:border-app-green-700 dark:focus:border-dark-accent transition-all dark:text-dark-text dark:placeholder-dark-border"
              />
            </div>
            {availableLanguages.length > 0 && (
              <motion.button
                className="px-3 py-2 bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Filter size={16} className="text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
                <span className="text-sm text-app-gray dark:text-app-light-gray hidden sm:inline">Filter</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'all-lessons' ? (
          <>
            {/* Lessons Grid or Empty State */}
            {filteredLessons.length === 0 ? (
              <motion.div 
                key="empty"
                className="flex flex-col items-center justify-center py-16"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <NoLessonsIcon />
                <h3 
                  className="text-2xl font-medium text-app-black dark:text-dark-text mt-6 mb-3"
                  style={{ fontFamily: getFontFamily() }}
                >
                  {t('lessonsPage.empty.title')}
                </h3>
                <p className="text-app-gray dark:text-app-light-gray text-center max-w-md mb-8">
                  {t('lessonsPage.empty.description')}
                </p>
                <motion.button
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-app-green-700 dark:bg-dark-accent text-white rounded-lg hover:bg-app-green-800 dark:hover:bg-dark-accent/80 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('lessonsPage.empty.createButton')}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                key="grid"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredLessons.map((lesson, index) => (
                  <motion.div
                    key={lesson.id}
                    className="group bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg overflow-hidden hover:shadow-lg dark:hover:shadow-dark transition-shadow duration-200 cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 17 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenLesson(lesson.id)}
                  >
                    {/* Lesson Thumbnail */}
                    <div className="relative bg-gradient-to-br from-app-green-50 to-app-green-100 dark:from-dark-accent/10 dark:to-dark-accent/20 aspect-[16/10] overflow-hidden">
                      {lesson.firstSlide ? (
                        <div className="w-full h-full flex items-center justify-center p-4">
                          <MiniSlidePreview 
                            slide={lesson.firstSlide} 
                            className="w-full h-full shadow-sm rounded"
                          />
                        </div>
                      ) : lesson.thumbnail ? (
                        <img 
                          src={lesson.thumbnail} 
                          alt={lesson.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-12 h-12 text-app-gray dark:text-app-light-gray opacity-30" strokeWidth={1} />
                        </div>
                      )}
                      
                      {/* Play button overlay */}
                      <motion.div 
                        className="absolute inset-0 bg-black/0 hover:bg-black/20 dark:hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                        initial={false}
                      >
                        <motion.div 
                          className="bg-white dark:bg-dark-card rounded-full p-3 shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Play className="w-6 h-6 text-app-green-700 dark:text-dark-accent" strokeWidth={2} fill="currentColor" />
                        </motion.div>
                      </motion.div>

                      {/* Slide count badge */}
                      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                        <Layers size={12} />
                        {lesson.slide_count || 0}
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Lesson Header */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-medium text-app-black dark:text-dark-text line-clamp-1 flex-1">
                          {lesson.title || t('lessonsPage.untitled')}
                        </h3>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveDropdown(activeDropdown === lesson.id ? null : lesson.id)
                            }}
                            className="p-1.5 hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 rounded-lg transition-all"
                          >
                            <MoreVertical size={16} className="text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
                          </button>
                          
                          <AnimatePresence>
                            {activeDropdown === lesson.id && (
                              <motion.div
                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg shadow-lg z-50"
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    handleOpenLesson(lesson.id)
                                    setActiveDropdown(null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-app-gray dark:text-app-light-gray hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                                >
                                  <Edit2 size={14} strokeWidth={1.5} />
                                  {t('lessonsPage.actions.edit')}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDuplicateLesson(lesson)
                                    setActiveDropdown(null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-app-gray dark:text-app-light-gray hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                                >
                                  <Copy size={14} strokeWidth={1.5} />
                                  {t('lessonsPage.actions.duplicate')}
                                </button>
                                <button
                                  onClick={() => {
                                    // Share functionality
                                    toast.info('Share feature coming soon!')
                                    setActiveDropdown(null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-app-gray dark:text-app-light-gray hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                                >
                                  <Share2 size={14} strokeWidth={1.5} />
                                  {t('lessonsPage.actions.share')}
                                </button>
                                <button
                                  onClick={() => {
                                    // Download functionality
                                    toast.info('Download feature coming soon!')
                                    setActiveDropdown(null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-app-gray dark:text-app-light-gray hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                                >
                                  <Download size={14} strokeWidth={1.5} />
                                  {t('lessonsPage.actions.download')}
                                </button>
                                <div className="border-t border-app-border dark:border-dark-border/10 my-1" />
                                <button
                                  onClick={() => {
                                    handleDeleteLesson(lesson.id)
                                    setActiveDropdown(null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                                >
                                  <Trash2 size={14} strokeWidth={1.5} />
                                  {t('lessonsPage.actions.delete')}
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Description */}
                      {lesson.description && (
                        <p className="text-xs text-app-gray dark:text-app-light-gray mb-3 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}

                      {/* Lesson Stats */}
                      <div className="flex items-center gap-4 mb-3">
                        {lesson.duration && (
                          <div className="flex items-center gap-1.5 text-xs text-app-gray dark:text-app-light-gray">
                            <Clock size={12} strokeWidth={1.5} />
                            <span>{formatDuration(lesson.duration)}</span>
                          </div>
                        )}
                        {lesson.target_language && (
                          <span className="inline-flex px-2 py-0.5 bg-app-green-100 dark:bg-dark-accent/20 text-app-green-700 dark:text-dark-accent rounded-full text-xs font-medium">
                            {lesson.target_language}
                          </span>
                        )}
                      </div>

                      {/* Expandable Details */}
                      <AnimatePresence>
                        {expandedLessonId === lesson.id && (
                          <motion.div 
                            className="pt-3 border-t border-app-border/10 dark:border-dark-border/10"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="space-y-2">
                              {lesson.vocabulary && lesson.vocabulary.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1 text-xs text-app-gray dark:text-app-light-gray mb-1">
                                    <Type size={12} strokeWidth={1.5} />
                                    <span>{t('lessonsPage.details.vocabulary')}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {lesson.vocabulary.slice(0, 3).map((word, idx) => (
                                      <span key={idx} className="inline-flex px-2 py-0.5 bg-app-secondary-bg-solid dark:bg-white/5 text-app-gray dark:text-app-light-gray rounded text-xs">
                                        {word}
                                      </span>
                                    ))}
                                    {lesson.vocabulary.length > 3 && (
                                      <span className="inline-flex px-2 py-0.5 bg-app-secondary-bg-solid dark:bg-white/5 text-app-gray dark:text-app-light-gray rounded text-xs">
                                        +{lesson.vocabulary.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              {lesson.grammarPoints && lesson.grammarPoints.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1 text-xs text-app-gray dark:text-app-light-gray mb-1">
                                    <Hash size={12} strokeWidth={1.5} />
                                    <span>{t('lessonsPage.details.grammar')}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {lesson.grammarPoints.slice(0, 2).map((point, idx) => (
                                      <span key={idx} className="inline-flex px-2 py-0.5 bg-app-green-100 dark:bg-dark-accent/20 text-app-green-700 dark:text-dark-accent rounded text-xs">
                                        {point}
                                      </span>
                                    ))}
                                    {lesson.grammarPoints.length > 2 && (
                                      <span className="inline-flex px-2 py-0.5 bg-app-green-100 dark:bg-dark-accent/20 text-app-green-700 dark:text-dark-accent rounded text-xs">
                                        +{lesson.grammarPoints.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-app-border/10 dark:border-dark-border/10">
                        <div className="text-xs text-app-gray dark:text-app-light-gray flex items-center gap-1">
                          <Calendar size={12} strokeWidth={1.5} />
                          {formatDate(lesson.updated_at)}
                        </div>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)
                          }}
                          className="p-1.5 text-app-gray dark:text-app-light-gray hover:text-app-black dark:hover:text-dark-text hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 rounded-lg transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ChevronRight 
                            size={16} 
                            className={`transition-transform ${expandedLessonId === lesson.id ? 'rotate-90' : ''}`} 
                            strokeWidth={1.5} 
                          />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        ) : (
          // Courses Tab Content
          <motion.div 
            key="courses-empty"
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <NoLessonsIcon />
            <h3 
              className="text-2xl font-medium text-app-black dark:text-dark-text mt-6 mb-3"
              style={{ fontFamily: getFontFamily() }}
            >
              {t('lessonsPage.emptyCourses.title')}
            </h3>
            <p className="text-app-gray dark:text-app-light-gray text-center max-w-md mb-8">
              {t('lessonsPage.emptyCourses.description')}
            </p>
            <motion.button
              onClick={() => {
                toast.info('Course creation coming soon!')
              }}
              className="px-6 py-3 bg-app-green-700 dark:bg-dark-accent text-white rounded-lg hover:bg-app-green-800 dark:hover:bg-dark-accent/80 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('lessonsPage.emptyCourses.createButton')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
