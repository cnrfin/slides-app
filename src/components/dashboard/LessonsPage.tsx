// src/components/dashboard/LessonsPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, FileText, MoreVertical, Calendar, Sparkles, Loader2, Trash2, Copy, Edit2 } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, deleteLesson } from '@/lib/database'
import { toast } from '@/utils/toast'

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
}

export default function LessonsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null)

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
        .select('*, slides(id)')
        .eq('user_id', user.id)
        .order('last_opened_at', { ascending: false })

      if (error) throw error

      // Transform data to include slide count
      const lessonsWithCount = (data || []).map(lesson => ({
        ...lesson,
        slide_count: lesson.slides?.length || 0,
        slides: undefined // Remove the slides array from the lesson object
      }))

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
    // Navigate to canvas with lesson loaded
    navigate('/canvas', { state: { lessonId } })
  }

  const handleDeleteLesson = async (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
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
    } finally {
      setShowOptionsMenu(null)
    }
  }

  const handleDuplicateLesson = async (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      const lessonToDuplicate = lessons.find(l => l.id === lessonId)
      if (!lessonToDuplicate) return

      const user = await getCurrentUser()
      if (!user) {
        toast.error('Please sign in to duplicate lessons')
        return
      }

      // Get full lesson data including slides
      const { data: fullLesson, error: fetchError } = await supabase
        .from('lessons')
        .select('*, slides(*, slide_elements(*))')
        .eq('id', lessonId)
        .single()

      if (fetchError) throw fetchError

      // Create new lesson
      const { data: newLesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          user_id: user.id,
          title: `${fullLesson.title} (Copy)`,
          description: fullLesson.description,
          slide_order: [], // Will be updated after slides are created
          target_language: fullLesson.target_language,
          course_id: fullLesson.course_id,
          lesson_type: fullLesson.lesson_type,
          estimated_duration: fullLesson.estimated_duration,
          is_template: false,
          version: 1
        })
        .select()
        .single()

      if (lessonError) throw lessonError

      // Duplicate slides
      if (fullLesson.slides && fullLesson.slides.length > 0) {
        const slideIdMapping: Record<string, string> = {}
        
        for (const slide of fullLesson.slides) {
          const { data: newSlide, error: slideError } = await supabase
            .from('slides')
            .insert({
              lesson_id: newLesson.id,
              slide_order: slide.slide_order,
              slide_type: slide.slide_type,
              background: slide.background,
              template_id: slide.template_id,
              notes: slide.notes,
              metadata: slide.metadata
            })
            .select()
            .single()

          if (slideError) throw slideError
          
          slideIdMapping[slide.id] = newSlide.id

          // Duplicate slide elements
          if (slide.slide_elements && slide.slide_elements.length > 0) {
            const elementsToInsert = slide.slide_elements.map((element: any) => ({
              slide_id: newSlide.id,
              element_type: element.element_type,
              position_x: element.position_x,
              position_y: element.position_y,
              width: element.width,
              height: element.height,
              rotation: element.rotation,
              opacity: element.opacity,
              z_index: element.z_index,
              content: element.content,
              style: element.style,
              animations: element.animations,
              interactions: element.interactions,
              metadata: element.metadata,
              locked: element.locked,
              visible: element.visible
            }))

            const { error: elementsError } = await supabase
              .from('slide_elements')
              .insert(elementsToInsert)

            if (elementsError) throw elementsError
          }
        }

        // Update slide_order with new slide IDs
        const newSlideOrder = fullLesson.slide_order.map((oldId: string) => slideIdMapping[oldId] || oldId)
        
        const { error: updateError } = await supabase
          .from('lessons')
          .update({ slide_order: newSlideOrder })
          .eq('id', newLesson.id)

        if (updateError) throw updateError
      }

      // Reload lessons to show the new copy
      await loadLessons()
      toast.success('Lesson duplicated successfully')
    } catch (error: any) {
      console.error('Error duplicating lesson:', error)
      toast.error('Failed to duplicate lesson')
    } finally {
      setShowOptionsMenu(null)
    }
  }

  const handleRenameLesson = async (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const lesson = lessons.find(l => l.id === lessonId)
    if (!lesson) return

    const newTitle = prompt('Enter new title:', lesson.title)
    if (!newTitle || newTitle === lesson.title) {
      setShowOptionsMenu(null)
      return
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .update({ title: newTitle })
        .eq('id', lessonId)

      if (error) throw error

      setLessons(lessons.map(l => 
        l.id === lessonId ? { ...l, title: newTitle } : l
      ))
      toast.success('Lesson renamed successfully')
    } catch (error: any) {
      console.error('Error renaming lesson:', error)
      toast.error('Failed to rename lesson')
    } finally {
      setShowOptionsMenu(null)
    }
  }

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">My Lessons</h1>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Start from blank</span>
            </button>
            
            <button
              onClick={handleCreateWithAI}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Start with AI</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search presentations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="flex-1 p-8">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No lessons found' : 'No lessons yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first lesson'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Lesson
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group relative"
                onClick={() => handleOpenLesson(lesson.id)}
                onMouseEnter={() => setSelectedLesson(lesson.id)}
                onMouseLeave={() => setSelectedLesson(null)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative">
                  {lesson.thumbnail ? (
                    <img 
                      src={lesson.thumbnail} 
                      alt={lesson.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Lesson
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate flex-1">
                      {lesson.title || 'Untitled'}
                    </h3>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowOptionsMenu(showOptionsMenu === lesson.id ? null : lesson.id)
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      {/* Options Menu */}
                      {showOptionsMenu === lesson.id && (
                        <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[150px]">
                          <button
                            onClick={(e) => handleRenameLesson(lesson.id, e)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => handleDuplicateLesson(lesson.id, e)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          <div className="border-t border-gray-200 my-1" />
                          <button
                            onClick={(e) => handleDeleteLesson(lesson.id, e)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {lesson.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {lesson.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {lesson.target_language && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        {lesson.target_language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(lesson.last_opened_at || lesson.updated_at), 'MMM d')}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-600">
                    {lesson.slide_count} {lesson.slide_count === 1 ? 'slide' : 'slides'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {showOptionsMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowOptionsMenu(null)}
        />
      )}
    </div>
  )
}
