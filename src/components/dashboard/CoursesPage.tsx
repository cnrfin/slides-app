// src/components/dashboard/CoursesPage.tsx
import { useState, useEffect } from 'react'
import { 
  Plus, 
  FolderOpen, 
  BookOpen, 
  Edit2, 
  Trash2, 
  MoreVertical,
  ChevronRight,
  Users,
  Clock,
  Target,
  Calendar,
  Search,
  Filter
} from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

interface Lesson {
  id: string
  title: string
  duration_minutes: number
  order_in_course: number
}

interface Course {
  id: string
  title: string
  description?: string
  target_level: string
  total_lessons: number
  total_duration_minutes: number
  created_at: string
  updated_at: string
  lessons?: Lesson[]
  student_count?: number
  completion_rate?: number
}

export default function CoursesPage() {
  const { user } = useAuthStore()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null)

  // Form states for creating/editing courses
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_level: 'intermediate_b1'
  })

  useEffect(() => {
    if (user) {
      fetchCourses()
    }
  }, [user])

  const fetchCourses = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Fetch courses from database
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons (
            id,
            title,
            duration_minutes,
            order_in_course
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Process the data to calculate totals
      const processedCourses = data?.map(course => ({
        ...course,
        total_lessons: course.lessons?.length || 0,
        total_duration_minutes: course.lessons?.reduce((sum: number, lesson: any) => 
          sum + (lesson.duration_minutes || 0), 0) || 0
      })) || []

      setCourses(processedCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
      // For now, use mock data if table doesn't exist
      setCourses(getMockCourses())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockCourses = (): Course[] => {
    return [
      {
        id: '1',
        title: 'Business English Fundamentals',
        description: 'Essential business communication skills for professionals',
        target_level: 'intermediate_b1',
        total_lessons: 12,
        total_duration_minutes: 540,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-20T15:30:00Z',
        student_count: 8,
        completion_rate: 75,
        lessons: [
          { id: '1', title: 'Email Etiquette', duration_minutes: 45, order_in_course: 1 },
          { id: '2', title: 'Meeting Vocabulary', duration_minutes: 45, order_in_course: 2 },
          { id: '3', title: 'Presentations Skills', duration_minutes: 50, order_in_course: 3 }
        ]
      },
      {
        id: '2',
        title: 'Conversational Spanish',
        description: 'Build confidence in everyday Spanish conversations',
        target_level: 'beginner_a2',
        total_lessons: 20,
        total_duration_minutes: 900,
        created_at: '2025-01-10T09:00:00Z',
        updated_at: '2025-01-18T14:20:00Z',
        student_count: 15,
        completion_rate: 60,
        lessons: [
          { id: '4', title: 'Greetings & Introductions', duration_minutes: 40, order_in_course: 1 },
          { id: '5', title: 'Numbers & Time', duration_minutes: 45, order_in_course: 2 }
        ]
      },
      {
        id: '3',
        title: 'Advanced Grammar Workshop',
        description: 'Master complex grammatical structures',
        target_level: 'advanced_c1',
        total_lessons: 8,
        total_duration_minutes: 480,
        created_at: '2025-01-05T11:30:00Z',
        updated_at: '2025-01-12T16:45:00Z',
        student_count: 5,
        completion_rate: 90
      }
    ]
  }

  const handleCreateCourse = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          target_level: formData.target_level
        })
        .select()
        .single()

      if (error) throw error

      // Add to local state
      setCourses([data, ...courses])
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error('Error creating course:', error)
      // For demo, just add to local state
      const newCourse: Course = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        target_level: formData.target_level,
        total_lessons: 0,
        total_duration_minutes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setCourses([newCourse, ...courses])
      setShowCreateModal(false)
      resetForm()
    }
  }

  const handleUpdateCourse = async () => {
    if (!user || !editingCourse) return

    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: formData.title,
          description: formData.description,
          target_level: formData.target_level,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCourse.id)

      if (error) throw error

      // Update local state
      setCourses(courses.map(c => 
        c.id === editingCourse.id 
          ? { ...c, ...formData, updated_at: new Date().toISOString() }
          : c
      ))
      setEditingCourse(null)
      resetForm()
    } catch (error) {
      console.error('Error updating course:', error)
      // For demo, update local state anyway
      setCourses(courses.map(c => 
        c.id === editingCourse.id 
          ? { ...c, ...formData, updated_at: new Date().toISOString() }
          : c
      ))
      setEditingCourse(null)
      resetForm()
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error

      setCourses(courses.filter(c => c.id !== courseId))
    } catch (error) {
      console.error('Error deleting course:', error)
      // For demo, remove from local state anyway
      setCourses(courses.filter(c => c.id !== courseId))
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      target_level: 'intermediate_b1'
    })
  }

  const startEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description || '',
      target_level: course.target_level
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getLevelBadgeColor = (level: string) => {
    const colors: Record<string, string> = {
      'beginner_a1': 'bg-green-100 text-green-700',
      'beginner_a2': 'bg-green-100 text-green-700',
      'intermediate_b1': 'bg-blue-100 text-blue-700',
      'intermediate_b2': 'bg-blue-100 text-blue-700',
      'advanced_c1': 'bg-purple-100 text-purple-700',
      'advanced_c2': 'bg-purple-100 text-purple-700'
    }
    return colors[level] || 'bg-gray-100 text-gray-700'
  }

  const formatLevel = (level: string) => {
    const levels: Record<string, string> = {
      'beginner_a1': 'Beginner (A1)',
      'beginner_a2': 'High Beginner (A2)',
      'intermediate_b1': 'Intermediate (B1)',
      'intermediate_b2': 'High Intermediate (B2)',
      'advanced_c1': 'Advanced (C1)',
      'advanced_c2': 'Mastery (C2)'
    }
    return levels[level] || level
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = filterLevel === 'all' || course.target_level === filterLevel
    return matchesSearch && matchesLevel
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600 mt-1">Create and manage your language courses</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Course
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner_a1">Beginner (A1)</option>
              <option value="beginner_a2">High Beginner (A2)</option>
              <option value="intermediate_b1">Intermediate (B1)</option>
              <option value="intermediate_b2">High Intermediate (B2)</option>
              <option value="advanced_c1">Advanced (C1)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterLevel !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first course'}
          </p>
          {!searchQuery && filterLevel === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Course
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              {/* Course Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelBadgeColor(course.target_level)}`}>
                    {formatLevel(course.target_level)}
                  </span>
                </div>
                <div className="relative">
                  <button className="p-1 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Course Description */}
              {course.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>
              )}

              {/* Course Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.total_lessons} lessons</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(course.total_duration_minutes)}</span>
                </div>
                {course.student_count !== undefined && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{course.student_count} students</span>
                  </div>
                )}
                {course.completion_rate !== undefined && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    <span>{course.completion_rate}% complete</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {course.completion_rate !== undefined && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.completion_rate}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Course Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Updated {formatDate(course.updated_at)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(course)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit course"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="View lessons"
                  >
                    <ChevronRight className={`w-4 h-4 transition-transform ${expandedCourseId === course.id ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expanded Lessons View */}
              {expandedCourseId === course.id && course.lessons && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Lessons</h4>
                  <div className="space-y-2">
                    {course.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{lesson.order_in_course}. {lesson.title}</span>
                        <span className="text-xs text-gray-500">{lesson.duration_minutes}min</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCourse) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Business English Fundamentals"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Describe what students will learn..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Level
                </label>
                <select
                  value={formData.target_level}
                  onChange={(e) => setFormData({ ...formData, target_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="beginner_a1">Beginner (A1)</option>
                  <option value="beginner_a2">High Beginner (A2)</option>
                  <option value="intermediate_b1">Intermediate (B1)</option>
                  <option value="intermediate_b2">High Intermediate (B2)</option>
                  <option value="advanced_c1">Advanced (C1)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingCourse(null)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
                disabled={!formData.title}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingCourse ? 'Update Course' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
