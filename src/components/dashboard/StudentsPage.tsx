// src/components/dashboard/StudentsPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, Loader2, BookOpen, Target, Globe2, User, Edit2, Trash2, X, Sparkles } from 'lucide-react'
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
  'beginner_a1': 'bg-green-100 text-green-800',
  'high_beginner_a2': 'bg-blue-100 text-blue-800',
  'intermediate_b1': 'bg-yellow-100 text-yellow-800',
  'high_intermediate_b2': 'bg-orange-100 text-orange-800',
  'advanced_c1': 'bg-purple-100 text-purple-800'
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
      setStudents(data || [])
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
    if (!confirm('Are you sure you want to remove this student?')) return

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

  const handleCreateLesson = (student: StudentProfile) => {
    // Navigate to dashboard home
    navigate('/dashboard')
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.target_language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.interests?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Student</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Students Grid */}
      <div className="flex-1 p-8">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
            <p className="text-gray-600 mb-4">Add your first student to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Student
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${LEVEL_COLORS[student.level]}`}>
                        {LEVEL_LABELS[student.level]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe2 className="w-4 h-4 text-gray-400" />
                    <span>Learning: {student.target_language}</span>
                  </div>
                  
                  {student.native_language && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Native: {student.native_language}</span>
                    </div>
                  )}

                  {student.goals && student.goals.length > 0 && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <Target className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {student.goals.slice(0, 3).map((goal, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {goal}
                          </span>
                        ))}
                        {student.goals.length > 3 && (
                          <span className="text-xs text-gray-500">+{student.goals.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {student.interests && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="line-clamp-2">{student.interests}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Added {new Date(student.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCreateLesson(student)}
                        className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Create lesson for this student"
                      >
                        <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => setEditingStudent(student)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit student"
                      >
                        <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete student"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <StudentModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleAddStudent}
          languages={languages}
          saving={saving}
          title="Add New Student"
        />
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <StudentModal 
          onClose={() => setEditingStudent(null)}
          onSave={(data) => handleUpdateStudent(editingStudent.id, data)}
          languages={languages}
          saving={saving}
          title="Edit Student"
          initialData={editingStudent}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={saving}
              >
                {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Learning Goals</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Goals
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentGoal}
                  onChange={(e) => setCurrentGoal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                  placeholder="e.g., Conversational fluency, Business communication"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {goal}
                      <button
                        type="button"
                        onClick={() => removeGoal(goal)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                        disabled={saving}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interests & Hobbies
              </label>
              <textarea
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder="e.g., Music, cooking, travel, technology..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about the student..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                disabled={saving}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {initialData ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                initialData ? 'Update Student' : 'Add Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
