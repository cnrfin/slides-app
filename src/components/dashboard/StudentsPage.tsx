// src/components/dashboard/StudentsPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  UserPlus, 
  Loader2, 
  BookOpen, 
  Target, 
  Globe2, 
  User, 
  Edit2, 
  Trash2, 
  X, 
  Sparkles, 
  GraduationCap,
  Filter,
  MoreVertical,
  Clock,
  Calendar,
  ChevronRight,
  Users
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/database'
import { toast } from '@/utils/toast'

interface StudentProfile {
  id: string
  tutor_id: string
  name: string
  target_language: string
  native_language: string | null
  level: 'beginner_a1' | 'high_beginner_a2' | 'intermediate_b1' | 'high_intermediate_b2' | 'advanced_c1'
  goals: string[]
  interests: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  lesson_count?: number
  progress?: number
}

interface SupportedLanguage {
  name: string
  native_name: string
}

const LEVEL_LABELS = {
  'beginner_a1': 'Beginner (A1)',
  'high_beginner_a2': 'High Beginner (A2)',
  'intermediate_b1': 'Intermediate (B1)',
  'high_intermediate_b2': 'High Intermediate (B2)',
  'advanced_c1': 'Advanced (C1)'
}

const LEVEL_COLORS = {
  'beginner_a1': 'bg-green-100 text-green-700',
  'high_beginner_a2': 'bg-blue-100 text-blue-700',
  'intermediate_b1': 'bg-yellow-100 text-yellow-700',
  'high_intermediate_b2': 'bg-orange-100 text-orange-700',
  'advanced_c1': 'bg-purple-100 text-purple-700'
}

export default function StudentsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null)
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null)

  useEffect(() => {
    loadStudents()
    loadLanguages()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const user = await getCurrentUser()
      if (!user) {
        toast.error('Please sign in to view students')
        return
      }

      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('tutor_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Add mock lesson count and progress for demo
      const studentsWithStats = (data || []).map(student => ({
        ...student,
        lesson_count: Math.floor(Math.random() * 20) + 5,
        progress: Math.floor(Math.random() * 100)
      }))
      
      setStudents(studentsWithStats)
    } catch (error: any) {
      console.error('Error loading students:', error)
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const loadLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('supported_languages')
        .select('name, native_name')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setLanguages(data || [])
    } catch (error: any) {
      console.error('Error loading languages:', error)
    }
  }

  const handleAddStudent = async (studentData: Omit<StudentProfile, 'id' | 'tutor_id' | 'is_active' | 'created_at' | 'updated_at'>) => {
    try {
      setSaving(true)
      const user = await getCurrentUser()
      if (!user) {
        toast.error('Please sign in to add students')
        return
      }

      const { data, error } = await supabase
        .from('student_profiles')
        .insert({
          ...studentData,
          tutor_id: user.id,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      
      setStudents([data, ...students])
      setShowAddModal(false)
      toast.success('Student added successfully!')
    } catch (error: any) {
      console.error('Error adding student:', error)
      toast.error('Failed to add student')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStudent = async (studentId: string, studentData: Omit<StudentProfile, 'id' | 'tutor_id' | 'is_active' | 'created_at' | 'updated_at'>) => {
    try {
      setSaving(true)
      
      const { data, error } = await supabase
        .from('student_profiles')
        .update({
          ...studentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', studentId)
        .select()
        .single()

      if (error) throw error
      
      setStudents(students.map(s => s.id === studentId ? data : s))
      setEditingStudent(null)
      toast.success('Student updated successfully!')
    } catch (error: any) {
      console.error('Error updating student:', error)
      toast.error('Failed to update student')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('student_profiles')
        .update({ is_active: false })
        .eq('id', studentId)

      if (error) throw error
      
      setStudents(students.filter(s => s.id !== studentId))
      toast.success('Student removed successfully')
    } catch (error: any) {
      console.error('Error removing student:', error)
      toast.error('Failed to remove student')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.target_language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.interests?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = filterLevel === 'all' || student.level === filterLevel
    return matchesSearch && matchesLevel
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600 mt-1">Manage your student profiles and track progress</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Add Student
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students..."
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
              {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterLevel !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first student'}
          </p>
          {!searchQuery && filterLevel === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Add Your First Student
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              {/* Student Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-medium text-sm">
                    {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${LEVEL_COLORS[student.level]}`}>
                      {LEVEL_LABELS[student.level]}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-1 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Language Info */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe2 className="w-4 h-4" />
                  <span>Learning {student.target_language}</span>
                </div>
                {student.native_language && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Native {student.native_language}</span>
                  </div>
                )}
              </div>

              {/* Student Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{student.lesson_count || 0} lessons</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>{student.progress || 0}% progress</span>
                </div>
              </div>

              {/* Progress Bar */}
              {student.progress !== undefined && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Goals Section */}
              {student.goals.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Goals</p>
                  <div className="flex flex-wrap gap-1">
                    {student.goals.slice(0, 2).map((goal, idx) => (
                      <span key={idx} className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {goal}
                      </span>
                    ))}
                    {student.goals.length > 2 && (
                      <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{student.goals.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Student Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Added {formatDate(student.created_at)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingStudent(student)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit student"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove student"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/dashboard', {
                      state: {
                        expandPrompt: true,
                        selectedStudent: {
                          id: student.id,
                          name: student.name,
                          target_language: student.target_language,
                          native_language: student.native_language,
                          level: student.level,
                          goals: student.goals,
                          interests: student.interests
                        }
                      }
                    })}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Create lesson"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingStudent) && (
        <StudentModal 
          onClose={() => {
            setShowAddModal(false)
            setEditingStudent(null)
          }}
          onSave={editingStudent 
            ? (data) => handleUpdateStudent(editingStudent.id, data)
            : handleAddStudent
          }
          languages={languages}
          saving={saving}
          title={editingStudent ? 'Edit Student' : 'Add New Student'}
          initialData={editingStudent || undefined}
        />
      )}
    </div>
  )
}

interface StudentModalProps {
  onClose: () => void
  onSave: (student: Omit<StudentProfile, 'id' | 'tutor_id' | 'is_active' | 'created_at' | 'updated_at'>) => void
  languages: SupportedLanguage[]
  saving: boolean
  title: string
  initialData?: StudentProfile
}

function StudentModal({ onClose, onSave, languages, saving, title, initialData }: StudentModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    target_language: initialData?.target_language || '',
    native_language: initialData?.native_language || '',
    level: initialData?.level || 'beginner_a1' as StudentProfile['level'],
    goals: initialData?.goals || [] as string[],
    interests: initialData?.interests || '',
    notes: initialData?.notes || ''
  })
  const [currentGoal, setCurrentGoal] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.target_language && formData.level) {
      onSave({
        ...formData,
        native_language: formData.native_language || null,
        interests: formData.interests || null,
        notes: formData.notes || null
      })
    }
  }

  const addGoal = () => {
    if (currentGoal.trim() && !formData.goals.includes(currentGoal.trim())) {
      setFormData({ ...formData, goals: [...formData.goals, currentGoal.trim()] })
      setCurrentGoal('')
    }
  }

  const removeGoal = (goal: string) => {
    setFormData({ ...formData, goals: formData.goals.filter(g => g !== goal) })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Language *
              </label>
              <select
                value={formData.target_language}
                onChange={(e) => setFormData({ ...formData, target_language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={saving}
              >
                <option value="">Select language</option>
                {languages.map(lang => (
                  <option key={lang.name} value={lang.name}>
                    {lang.native_name} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Native Language
              </label>
              <select
                value={formData.native_language}
                onChange={(e) => setFormData({ ...formData, native_language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={saving}
              >
                <option value="">Select language</option>
                {languages.map(lang => (
                  <option key={lang.name} value={lang.name}>
                    {lang.native_name} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level *
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as StudentProfile['level'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={saving}
            >
              {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Learning Goals
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentGoal}
                onChange={(e) => setCurrentGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                placeholder="e.g., Conversational fluency"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={saving}
              />
              <button
                type="button"
                onClick={addGoal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={saving}
              >
                Add
              </button>
            </div>
            {formData.goals.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.goals.map((goal, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {goal}
                    <button
                      type="button"
                      onClick={() => removeGoal(goal)}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                      disabled={saving}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interests & Hobbies
            </label>
            <textarea
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              placeholder="e.g., Music, cooking, travel..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
              disabled={saving}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving || !formData.name || !formData.target_language}
            >
              {saving ? 'Saving...' : (initialData ? 'Update Student' : 'Add Student')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
