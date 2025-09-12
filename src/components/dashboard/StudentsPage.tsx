// src/components/dashboard/StudentsPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  UserPlus, 
  BookOpen, 
  Globe2, 
  User, 
  Edit2, 
  Trash2, 
  X, 
  Sparkles, 
  MoreVertical,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Languages,
  Target,
  Library,
  Book
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { 
  getCurrentUser, 
  getStudentLessons, 
  getAllUserLessons,
  assignLessonToStudent,
  unassignLessonFromStudent,
  updateLessonProgress 
} from '@/lib/database'
import { toast } from '@/utils/toast'
import { AssignLessonModal } from './AssignLessonModal'

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

interface StudentLesson {
  id: string
  name: string
  date: string
  vocabulary: string[]
}

interface SupportedLanguage {
  name: string
  native_name: string
}

const LEVEL_LABELS = {
  'beginner_a1': 'A1',
  'high_beginner_a2': 'A2',
  'intermediate_b1': 'B1',
  'high_intermediate_b2': 'B2',
  'advanced_c1': 'C1'
}

const LEVEL_COLORS = {
  'beginner_a1': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  'high_beginner_a2': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'intermediate_b1': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  'high_intermediate_b2': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  'advanced_c1': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
}

const ITEMS_PER_PAGE = 10

// Real lesson data will be loaded from the database
interface AssignedLesson {
  id: string
  name: string
  date: string
  vocabulary: string[]
  progress?: number
  completed?: boolean
}

// Custom No Students Icon Component with animation
const NoStudentsIcon = () => (
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

export default function StudentsPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null)
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [studentLessons, setStudentLessons] = useState<Record<string, AssignedLesson[]>>({})
  const [availableLessons, setAvailableLessons] = useState<any[]>([])
  const [loadingAvailableLessons, setLoadingAvailableLessons] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigningToStudent, setAssigningToStudent] = useState<StudentProfile | null>(null)
  const [loadingLessons, setLoadingLessons] = useState<Set<string>>(new Set())
  const [vocabularyModal, setVocabularyModal] = useState<{ lessonName: string; vocabulary: string[] } | null>(null)

  useEffect(() => {
    loadStudents()
    loadLanguages()
    loadAvailableLessons()
  }, [])

  // Close dropdown when clicking outside, pressing Escape, scrolling, or resizing window
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null)
      setDropdownPosition(null)
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null)
        setDropdownPosition(null)
      }
    }
    
    const handleResize = () => {
      setActiveDropdown(null)
      setDropdownPosition(null)
    }
    
    const handleScroll = () => {
      setActiveDropdown(null)
      setDropdownPosition(null)
    }
    
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)
    
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [])

  const handleDropdownClick = (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation()
    if (activeDropdown === studentId) {
      setActiveDropdown(null)
      setDropdownPosition(null)
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      setActiveDropdown(studentId)
      // Position dropdown to the right of the button, or to the left if too close to right edge
      const dropdownWidth = 192 // w-48 = 12rem = 192px
      let leftPosition = rect.right + window.scrollX + 5
      
      // If dropdown would go off right edge, position it to the left of the button
      if (leftPosition + dropdownWidth > window.innerWidth) {
        leftPosition = rect.left + window.scrollX - dropdownWidth - 5
      }
      
      setDropdownPosition({
        top: rect.top + window.scrollY,
        left: leftPosition
      })
    }
  }

  const loadStudents = async () => {
    try {
      setLoading(true)
      const user = await getCurrentUser()
      if (!user) {
        toast.error(t('studentsPage.errors.signInRequired'))
        navigate('/auth/signin')
        return
      }

      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('tutor_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Add mock lesson count and generate mock lessons for demo
      const studentsWithStats = (data || []).map(student => ({
        ...student,
        lesson_count: 0, // Will be updated when lessons are loaded
        progress: 0
      }))
      
      setStudents(studentsWithStats)
      
      // Load lessons for each student
      for (const student of studentsWithStats) {
        loadStudentLessonData(student.id)
      }
    } catch (error: any) {
      console.error('Error loading students:', error)
      toast.error(t('studentsPage.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableLessons = async () => {
    try {
      setLoadingAvailableLessons(true)
      console.log('Loading available lessons...')
      const lessons = await getAllUserLessons()
      console.log('Loaded lessons:', lessons)
      setAvailableLessons(lessons || [])
      
      // If no lessons found, show a helpful message
      if (!lessons || lessons.length === 0) {
        console.log('No lessons found for user')
      }
    } catch (error: any) {
      console.error('Error loading available lessons:', error)
      toast.error(t('studentsPage.errors.loadLessonsFailed') || 'Failed to load lessons')
      setAvailableLessons([])
    } finally {
      setLoadingAvailableLessons(false)
    }
  }

  const loadStudentLessonData = async (studentId: string) => {
    try {
      // Add to loading set
      setLoadingLessons(prev => new Set([...prev, studentId]))
      
      const lessons = await getStudentLessons(studentId)
      
      const formattedLessons: AssignedLesson[] = lessons
        .filter(sl => sl.lesson || sl.lessons) // Filter out any entries without a lesson (handle both naming conventions)
        .map(sl => {
          const lessonData = sl.lesson || sl.lessons // Handle both naming conventions
          return {
            id: lessonData.id,
            name: lessonData.title || 'Untitled Lesson',
            date: sl.assigned_at,
            vocabulary: sl.vocabulary || [], // Use the extracted vocabulary
            progress: sl.progress || 0,
            completed: sl.completed_at !== null
          }
        })
      
      setStudentLessons(prev => ({
        ...prev,
        [studentId]: formattedLessons
      }))
      
      // Update student's lesson count
      setStudents(prev => prev.map(s => 
        s.id === studentId 
          ? { ...s, lesson_count: formattedLessons.length }
          : s
      ))
    } catch (error: any) {
      console.error(`Error loading lessons for student ${studentId}:`, error)
    } finally {
      // Remove from loading set
      setLoadingLessons(prev => {
        const newSet = new Set(prev)
        newSet.delete(studentId)
        return newSet
      })
    }
  }

  const handleAssignLesson = async (studentId: string, lessonId: string) => {
    try {
      await assignLessonToStudent(studentId, lessonId)
      toast.success(t('studentsPage.assignSuccess'))
      // Reload the student's lessons
      await loadStudentLessonData(studentId)
    } catch (error: any) {
      console.error('Error assigning lesson:', error)
      toast.error(t('studentsPage.errors.assignFailed'))
    }
  }

  const handleUnassignLesson = async (studentId: string, lessonId: string) => {
    if (!confirm(t('studentsPage.unassignConfirmation'))) {
      return
    }
    
    try {
      await unassignLessonFromStudent(studentId, lessonId)
      toast.success(t('studentsPage.unassignSuccess'))
      // Reload the student's lessons
      await loadStudentLessonData(studentId)
    } catch (error: any) {
      console.error('Error unassigning lesson:', error)
      toast.error(t('studentsPage.errors.unassignFailed'))
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
        toast.error(t('studentsPage.errors.signInRequired'))
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
      toast.success(t('studentsPage.addSuccess'))
    } catch (error: any) {
      console.error('Error adding student:', error)
      toast.error(t('studentsPage.errors.addFailed'))
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
      toast.success(t('studentsPage.updateSuccess'))
    } catch (error: any) {
      console.error('Error updating student:', error)
      toast.error(t('studentsPage.errors.updateFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm(t('studentsPage.deleteConfirmation'))) {
      return
    }

    try {
      const { error } = await supabase
        .from('student_profiles')
        .update({ is_active: false })
        .eq('id', studentId)

      if (error) throw error
      
      setStudents(students.filter(s => s.id !== studentId))
      toast.success(t('studentsPage.deleteSuccess'))
    } catch (error: any) {
      console.error('Error removing student:', error)
      toast.error(t('studentsPage.errors.deleteFailed'))
    }
  }

  const toggleRowExpansion = async (studentId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId)
    } else {
      newExpanded.add(studentId)
      // Load lessons if not already loaded
      if (!studentLessons[studentId] && !loadingLessons.has(studentId)) {
        await loadStudentLessonData(studentId)
      }
    }
    setExpandedRows(newExpanded)
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.target_language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.interests?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.goals.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

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
          <p className="text-app-gray dark:text-app-light-gray">{t('studentsPage.loading')}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      className="p-2 sm:p-8 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page Header with Add Button */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-normal text-app-black dark:text-dark-text">{t('studentsPage.title')}</h1>
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-app-green-700 dark:bg-dark-accent text-white rounded-lg hover:bg-app-green-800 dark:hover:bg-dark-accent/80 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <UserPlus size={18} strokeWidth={1.5} />
            <span className="hidden sm:inline text-sm font-medium">{t('studentsPage.addStudent')}</span>
          </motion.button>
        </div>
        
        {/* Search Bar - Full Width */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-gray dark:text-app-light-gray w-5 h-5" strokeWidth={1.5} />
          <input
            type="text"
            placeholder={t('studentsPage.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg outline-none focus:ring-2 focus:ring-app-green-700/20 dark:focus:ring-dark-accent/20 focus:border-app-green-700 dark:focus:border-dark-accent transition-all dark:text-dark-text dark:placeholder-dark-border"
          />
        </div>
      </div>

      {/* Students Table or Empty State */}
      <AnimatePresence mode="wait">
        {filteredStudents.length === 0 ? (
          <motion.div 
            key="empty"
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <NoStudentsIcon />
            <h3 className="text-2xl font-medium text-app-black dark:text-dark-text mt-6 mb-3">
              {searchQuery 
                ? t('studentsPage.noStudentsFound')
                : t('studentsPage.empty.title')}
            </h3>
            <p className="text-app-gray dark:text-app-light-gray text-center max-w-md mb-8">
              {searchQuery 
                ? t('studentsPage.empty.tryAdjusting')
                : t('studentsPage.empty.description')}
            </p>
            {!searchQuery && (
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-app-green-700 dark:bg-dark-accent text-white rounded-lg hover:bg-app-green-800 dark:hover:bg-dark-accent/80 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('studentsPage.empty.addButton')}
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="table"
            className="bg-white dark:bg-dark-card rounded-lg border border-app-border dark:border-dark-border/20 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Table - Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-app-secondary-bg-solid dark:bg-white/5 border-b border-app-border dark:border-dark-border/20">
                  <tr>
                    <th className="w-10 px-4 py-3"></th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-app-gray dark:text-app-light-gray">
                      {t('studentsPage.table.name')}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-app-gray dark:text-app-light-gray">
                      {t('studentsPage.table.level')}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-app-gray dark:text-app-light-gray">
                      {t('studentsPage.table.learning')}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-app-gray dark:text-app-light-gray">
                      {t('studentsPage.table.goals')}
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-app-gray dark:text-app-light-gray w-20">
                      {t('studentsPage.table.tools')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student, index) => (
                    <React.Fragment key={student.id}>
                      <motion.tr
                        className={`hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-colors ${
                          index < paginatedStudents.length - 1 || expandedRows.has(student.id)
                            ? 'border-b border-app-border dark:border-dark-border/20' 
                            : ''
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <td className="px-4 py-4">
                          <button
                            onClick={() => toggleRowExpansion(student.id)}
                            className="p-1 hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 rounded transition-all"
                          >
                            <ChevronRight 
                              size={16} 
                              className={`text-app-gray dark:text-app-light-gray transition-transform ${
                                expandedRows.has(student.id) ? 'rotate-90' : ''
                              }`} 
                              strokeWidth={1.5} 
                            />
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-app-green-600 to-app-green-700 dark:from-dark-accent dark:to-dark-accent/80 rounded-full flex-shrink-0 flex items-center justify-center text-white font-medium text-xs shadow-sm">
                              {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-app-black dark:text-dark-text">
                              {student.name}
                              </p>
                              {student.native_language && (
                              <p className="text-xs text-app-gray dark:text-app-light-gray mt-0.5">
                              {student.native_language}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${LEVEL_COLORS[student.level]}`}>
                            {LEVEL_LABELS[student.level]}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            
                            <span className="text-sm text-app-black dark:text-dark-text">{student.target_language}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {student.goals.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {student.goals.slice(0, 2).map((goal, idx) => (
                                <span key={idx} className="inline-flex px-2 py-0.5 bg-app-secondary-bg-solid dark:bg-white/5 text-app-gray dark:text-app-light-gray rounded text-xs">
                                  {goal}
                                </span>
                              ))}
                              {student.goals.length > 2 && (
                                <span className="text-xs text-app-gray dark:text-app-light-gray">
                                  +{student.goals.length - 2} {t('studentsPage.more')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-app-gray dark:text-app-light-gray italic">{t('studentsPage.table.noGoalsSet')}</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button 
                            onClick={(e) => handleDropdownClick(e, student.id)}
                            className={`p-1.5 rounded-lg transition-all mx-auto ${
                              activeDropdown === student.id 
                                ? 'bg-app-secondary-bg-solid dark:bg-white/10' 
                                : 'hover:bg-app-secondary-bg-solid dark:hover:bg-white/10'
                            }`}
                          >
                            <MoreVertical size={16} className="text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
                          </button>
                        </td>
                      </motion.tr>
                      
                      {/* Expanded Row - Lessons */}
                      <AnimatePresence>
                        {expandedRows.has(student.id) && (
                          <>
                            {loadingLessons.has(student.id) ? (
                              <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`bg-white dark:bg-dark-card ${
                                  index < paginatedStudents.length - 1
                                    ? 'border-b border-app-border dark:border-dark-border/20'
                                    : ''
                                }`}
                              >
                                <td colSpan={6} className="px-4 py-4">
                                  <div className="text-center">
                                    <div className="w-6 h-6 border-2 border-app-green-700 dark:border-dark-accent border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-sm text-app-gray dark:text-app-light-gray">
                                      {t('studentsPage.loadingLessons')}
                                    </p>
                                  </div>
                                </td>
                              </motion.tr>
                            ) : studentLessons[student.id] && studentLessons[student.id].length > 0 ? (
                              <>
                                {studentLessons[student.id].map((lesson, lessonIndex) => (
                                  <motion.tr
                                    key={lesson.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2, delay: lessonIndex * 0.02 }}
                                    className={`bg-app-secondary-bg-solid/30 dark:bg-white/[0.02] hover:bg-app-secondary-bg-solid/50 dark:hover:bg-white/[0.03] ${
                                      lessonIndex < studentLessons[student.id].length - 1
                                        ? 'border-b border-app-border dark:border-dark-border/20' 
                                        : ''
                                    }`}
                                  >
                                    <td className="px-4 py-3"></td>
                                    <td className="px-4 py-3" colSpan={2}>
                                      <div className="flex items-center justify-between">
                                        <button
                                          onClick={() => navigate(`/canvas/${lesson.id}`)}
                                          className="text-sm font-medium text-app-black dark:text-dark-text hover:text-app-green-700 dark:hover:text-dark-accent transition-colors text-left"
                                        >
                                          {lesson.name}
                                        </button>
                                        {lesson.progress !== undefined && lesson.progress > 0 && (
                                          <div className="flex items-center gap-2">
                                            <div className="w-20 h-1.5 bg-app-border dark:bg-dark-border/20 rounded-full overflow-hidden">
                                              <div 
                                                className="h-full bg-app-green-700 dark:bg-dark-accent transition-all"
                                                style={{ width: `${lesson.progress}%` }}
                                              />
                                            </div>
                                            <span className="text-xs text-app-gray dark:text-app-light-gray">
                                              {lesson.progress}%
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td 
                                      className="px-4 py-3 cursor-pointer hover:bg-app-secondary-bg-solid/50 dark:hover:bg-white/[0.015] transition-colors group" 
                                      colSpan={2}
                                      onClick={() => {
                                        if (lesson.vocabulary.length > 0) {
                                          setVocabularyModal({ 
                                            lessonName: lesson.name, 
                                            vocabulary: lesson.vocabulary 
                                          })
                                        }
                                      }}
                                      title={lesson.vocabulary.length > 0 ? t('studentsPage.clickToViewVocabulary') || 'Click to view all vocabulary' : ''}
                                    >
                                      <div className="flex items-center gap-2 pointer-events-none">
                                        {lesson.vocabulary.length > 0 ? (
                                          <>
                                            {lesson.vocabulary.slice(0, 3).map((word, idx) => (
                                              <span key={idx} className="inline-flex px-2 py-0.5 bg-app-green-100 dark:bg-dark-accent/20 text-app-green-700 dark:text-dark-accent rounded-full text-xs">
                                                {word}
                                              </span>
                                            ))}
                                            {lesson.vocabulary.length > 3 && (
                                              <span className="text-xs text-app-gray dark:text-app-light-gray group-hover:text-app-green-700 dark:group-hover:text-dark-accent transition-colors">
                                                +{lesson.vocabulary.length - 3} {t('studentsPage.more') || 'more'}
                                              </span>
                                            )}
                                          </>
                                        ) : (
                                          <span className="text-xs text-app-gray dark:text-app-light-gray italic">No vocabulary</span>
                                        )}
                                        {lesson.completed && (
                                          <span className="inline-flex px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs ml-auto">
                                            {t('studentsPage.completed')}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <button
                                        onClick={() => handleUnassignLesson(student.id, lesson.id)}
                                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                                      >
                                        {t('studentsPage.unassign')}
                                      </button>
                                    </td>
                                  </motion.tr>
                                ))}
                                <motion.tr
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className={`bg-white dark:bg-dark-card ${
                                    index < paginatedStudents.length - 1
                                      ? 'border-b border-app-border dark:border-dark-border/20'
                                      : ''
                                  }`}
                                >
                                  <td colSpan={6} className="px-4 py-3">
                                    <div className="flex justify-center gap-2">
                                      <button
                                        onClick={() => {
                                          console.log('Assigning to student:', student)
                                          console.log('Available lessons:', availableLessons)
                                          setAssigningToStudent(student)
                                          setShowAssignModal(true)
                                        }}
                                        className="px-3 py-1.5 text-xs bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all text-app-green-700 dark:text-dark-accent font-medium disabled:opacity-50"
                                        disabled={loadingAvailableLessons}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <Library size={12} strokeWidth={1.5} />
                                          {loadingAvailableLessons 
                                            ? t('studentsPage.loadingLessons') || 'Loading...'
                                            : `${t('studentsPage.assignLesson')} (${availableLessons.length})`}
                                        </div>
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
                                        className="px-3 py-1.5 text-xs text-app-gray dark:text-app-light-gray hover:text-app-green-700 dark:hover:text-dark-accent hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 rounded-lg transition-all flex items-center gap-1.5 font-medium"
                                      >
                                        <Sparkles size={12} strokeWidth={1.5} />
                                        {t('studentsPage.createNewLesson')}
                                      </button>
                                    </div>
                                  </td>
                                </motion.tr>
                              </>
                            ) : (
                              <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`bg-white dark:bg-dark-card ${
                                  index < paginatedStudents.length - 1
                                    ? 'border-b border-app-border dark:border-dark-border/20'
                                    : ''
                                }`}
                              >
                                <td colSpan={6} className="px-4 py-6">
                                  <div className="text-center">
                                    <BookOpen size={24} className="mx-auto text-app-gray dark:text-app-light-gray mb-2" strokeWidth={1.5} />
                                    <p className="text-sm text-app-gray dark:text-app-light-gray mb-3">
                                      {t('studentsPage.table.noLessonsYet')}
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                      <button
                                        onClick={() => {
                                          console.log('Assigning to student (empty state):', student)
                                          console.log('Available lessons:', availableLessons)
                                          setAssigningToStudent(student)
                                          setShowAssignModal(true)
                                        }}
                                        className="px-3 py-1.5 text-xs bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all text-app-green-700 dark:text-dark-accent font-medium disabled:opacity-50"
                                        disabled={loadingAvailableLessons}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <Library size={12} strokeWidth={1.5} />
                                          {loadingAvailableLessons 
                                            ? t('studentsPage.loadingLessons') || 'Loading...'
                                            : `${t('studentsPage.assignExistingLesson')} (${availableLessons.length})`}
                                        </div>
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
                                        className="px-3 py-1.5 text-xs text-app-gray dark:text-app-light-gray hover:text-app-green-700 dark:hover:text-dark-accent hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 rounded-lg transition-all flex items-center gap-1.5 font-medium"
                                      >
                                        <Sparkles size={12} strokeWidth={1.5} />
                                        {t('studentsPage.table.createFirstLesson')}
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Two Column Layout */}
            <div className="sm:hidden">
              {paginatedStudents.map((student, index) => (
                <React.Fragment key={student.id}>
                  <motion.div
                    className={`overflow-hidden ${
                      index < paginatedStudents.length - 1 ? 'border-b border-app-border dark:border-dark-border/20' : ''
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    {/* Main Card Content */}
                    <div className="p-4">
                      {/* Two Column Layout */}
                      <div className="space-y-3">
                        {/* Name Row */}
                        <div className="flex justify-between items-start">
                          <span className="text-xs uppercase tracking-wide text-app-gray dark:text-app-light-gray font-medium">
                            {t('studentsPage.table.name')}
                          </span>
                          <div className="text-right">
                            <p className="text-sm font-medium text-app-black dark:text-dark-text">
                              {student.name}
                            </p>
                          </div>
                        </div>

                        {/* Level Row */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs uppercase tracking-wide text-app-gray dark:text-app-light-gray font-medium">
                            {t('studentsPage.table.level')}
                          </span>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${LEVEL_COLORS[student.level]}`}>
                            {LEVEL_LABELS[student.level]}
                          </span>
                        </div>

                        {/* Learning Row */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs uppercase tracking-wide text-app-gray dark:text-app-light-gray font-medium">
                            {t('studentsPage.table.learning')}
                          </span>
                          <div className="flex items-center gap-1">
                            
                            <span className="text-sm text-app-black dark:text-dark-text">
                              {student.target_language}
                            </span>
                          </div>
                        </div>

                        {/* Native Language Row (if exists) */}
                        {student.native_language && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs uppercase tracking-wide text-app-gray dark:text-app-light-gray font-medium">
                              {t('studentsPage.native')}
                            </span>
                            <span className="text-sm text-app-black dark:text-dark-text">
                              {student.native_language}
                            </span>
                          </div>
                        )}

                        {/* Goals Row */}
                        <div className="flex justify-between items-start">
                          <span className="text-xs uppercase tracking-wide text-app-gray dark:text-app-light-gray font-medium">
                            {t('studentsPage.table.goals')}
                          </span>
                          <div className="text-right">
                            {student.goals.length > 0 ? (
                              <div className="flex flex-wrap gap-1 justify-end">
                                {student.goals.map((goal, idx) => (
                                  <span key={idx} className="inline-flex px-2 py-0.5 bg-app-secondary-bg-solid dark:bg-white/5 text-app-gray dark:text-app-light-gray rounded text-xs">
                                    {goal}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-app-gray dark:text-app-light-gray italic">
                                {t('studentsPage.table.noGoalsSet')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Lessons Count Row */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs uppercase tracking-wide text-app-gray dark:text-app-light-gray font-medium">
                            {t('studentsPage.lessons')}
                          </span>
                          <span className="text-sm text-app-black dark:text-dark-text">
                            {student.lesson_count || 0}
                          </span>
                        </div>

                        {/* Added Date Row */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs uppercase tracking-wide text-app-gray dark:text-app-light-gray font-medium">
                            {t('studentsPage.added')}
                          </span>
                          <span className="text-sm text-app-black dark:text-dark-text">
                            {formatDate(student.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-app-border/10 dark:border-dark-border/10">
                        <button
                          onClick={() => toggleRowExpansion(student.id)}
                          className="flex items-center gap-2 text-xs text-app-green-700 dark:text-dark-accent hover:text-app-green-800 dark:hover:text-dark-accent/80 transition-colors"
                        >
                          <ChevronRight 
                            size={14} 
                            className={`transition-transform ${expandedRows.has(student.id) ? 'rotate-90' : ''}`} 
                            strokeWidth={1.5} 
                          />
                          {t('studentsPage.table.recentLessons')}
                        </button>

                        <div className="flex items-center gap-2">
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
                            className="p-1.5 text-app-green-700 dark:text-dark-accent hover:bg-app-green-50 dark:hover:bg-dark-accent/10 rounded-lg transition-all"
                            title={t('studentsPage.actions.createLesson')}
                          >
                            <Sparkles size={16} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="p-1.5 text-app-gray dark:text-app-light-gray hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 rounded-lg transition-all"
                            title={t('studentsPage.actions.edit')}
                          >
                            <Edit2 size={16} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title={t('studentsPage.actions.delete')}
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Lessons Section */}
                    <AnimatePresence>
                      {expandedRows.has(student.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-white dark:bg-dark-card border-t border-app-border dark:border-dark-border/20"
                        >
                          {studentLessons[student.id] && studentLessons[student.id].length > 0 ? (
                            <div>
                              {studentLessons[student.id].map((lesson, lessonIndex) => (
                                <div 
                                  key={lesson.id} 
                                  className="px-4 py-3 border-b border-app-border/10 dark:border-dark-border/10 last:border-b-0"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <button
                                      onClick={() => navigate(`/canvas/${lesson.id}`)}
                                      className="text-sm font-medium text-app-black dark:text-dark-text hover:text-app-green-700 dark:hover:text-dark-accent transition-colors text-left flex-1"
                                    >
                                      {lesson.name}
                                    </button>
                                    <button
                                      onClick={() => handleUnassignLesson(student.id, lesson.id)}
                                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors ml-2"
                                    >
                                      {t('studentsPage.unassign')}
                                    </button>
                                  </div>
                                  <div 
                                    className="flex flex-wrap items-center gap-1 cursor-pointer group p-1 -m-1 rounded hover:bg-app-secondary-bg-solid/30 dark:hover:bg-white/[0.02] transition-colors"
                                    onClick={() => {
                                      if (lesson.vocabulary.length > 0) {
                                        setVocabularyModal({ 
                                          lessonName: lesson.name, 
                                          vocabulary: lesson.vocabulary 
                                        })
                                      }
                                    }}
                                    title={lesson.vocabulary.length > 0 ? t('studentsPage.clickToViewVocabulary') || 'Click to view all vocabulary' : ''}
                                  >
                                    {lesson.vocabulary.length > 0 ? (
                                      <>
                                        {lesson.vocabulary.slice(0, 3).map((word, idx) => (
                                          <span key={idx} className="inline-flex px-2 py-0.5 bg-app-green-100 dark:bg-dark-accent/20 text-app-green-700 dark:text-dark-accent rounded-full text-xs">
                                            {word}
                                          </span>
                                        ))}
                                        {lesson.vocabulary.length > 3 && (
                                          <span className="text-xs text-app-gray dark:text-app-light-gray group-hover:text-app-green-700 dark:group-hover:text-dark-accent transition-colors">
                                            +{lesson.vocabulary.length - 3}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-xs text-app-gray dark:text-app-light-gray italic">No vocabulary</span>
                                    )}
                                    {lesson.completed && (
                                      <span className="inline-flex px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs ml-auto">
                                        {t('studentsPage.completed')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              <div className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setAssigningToStudent(student)
                                      setShowAssignModal(true)
                                    }}
                                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all text-app-green-700 dark:text-dark-accent font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
                                    disabled={loadingAvailableLessons}
                                  >
                                    <Library size={12} strokeWidth={1.5} />
                                    {loadingAvailableLessons 
                                      ? t('studentsPage.loadingLessons') || 'Loading...'
                                      : `${t('studentsPage.assignLesson')} (${availableLessons.length})`}
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
                                    className="flex-1 px-3 py-1.5 text-xs text-app-gray dark:text-app-light-gray hover:text-app-green-700 dark:hover:text-dark-accent hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 rounded-lg transition-all flex items-center justify-center gap-1.5 font-medium"
                                  >
                                    <Sparkles size={12} strokeWidth={1.5} />
                                    {t('studentsPage.createNewLesson')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 px-4">
                              <BookOpen size={20} className="mx-auto text-app-gray dark:text-app-light-gray mb-2" strokeWidth={1.5} />
                              <p className="text-xs text-app-gray dark:text-app-light-gray mb-3">
                                {t('studentsPage.table.noLessonsYet')}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setAssigningToStudent(student)
                                    setShowAssignModal(true)
                                  }}
                                  className="flex-1 px-3 py-1 text-xs bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all text-app-green-700 dark:text-dark-accent font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
                                  disabled={loadingAvailableLessons}
                                >
                                  <Library size={12} strokeWidth={1.5} />
                                  {loadingAvailableLessons 
                                    ? t('studentsPage.loadingLessons') || 'Loading...'
                                    : `${t('studentsPage.assignExistingLesson')} (${availableLessons.length})`}
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
                                  className="flex-1 px-3 py-1 text-xs text-app-gray dark:text-app-light-gray hover:text-app-green-700 dark:hover:text-dark-accent hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 rounded-lg transition-all flex items-center justify-center gap-1.5 font-medium"
                                >
                                  <Sparkles size={12} strokeWidth={1.5} />
                                  {t('studentsPage.table.createFirstLesson')}
                                </button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </React.Fragment>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-app-border dark:border-dark-border/20">
                <p className="text-sm text-app-gray dark:text-app-light-gray">
                  {t('studentsPage.table.showing', { 
                    start: startIndex + 1, 
                    end: Math.min(endIndex, filteredStudents.length), 
                    total: filteredStudents.length 
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} className="text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm rounded-lg transition-all ${
                          page === currentPage
                            ? 'bg-app-green-700 dark:bg-dark-accent text-white'
                            : 'text-app-gray dark:text-app-light-gray hover:bg-app-secondary-bg-solid dark:hover:bg-white/5'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} className="text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dropdown Menu - Outside table */}
      <AnimatePresence>
        {activeDropdown && dropdownPosition && (
          <>
            {/* Invisible backdrop to catch clicks */}
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => {
                setActiveDropdown(null)
                setDropdownPosition(null)
              }}
            />
          <motion.div
            className="fixed w-48 bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg shadow-xl z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                const student = filteredStudents.find(s => s.id === activeDropdown)
                if (student) {
                  navigate('/dashboard', {
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
                  })
                }
                setActiveDropdown(null)
                setDropdownPosition(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-app-gray dark:text-app-light-gray hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-colors flex items-center gap-2 rounded-t-lg"
            >
              <Sparkles size={14} strokeWidth={1.5} />
              {t('studentsPage.actions.createLesson')}
            </button>
            <button
              onClick={() => {
                const student = filteredStudents.find(s => s.id === activeDropdown)
                if (student) {
                  setEditingStudent(student)
                }
                setActiveDropdown(null)
                setDropdownPosition(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-app-gray dark:text-app-light-gray hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <Edit2 size={14} strokeWidth={1.5} />
              {t('studentsPage.actions.edit')}
            </button>
            <button
              onClick={() => {
                handleDeleteStudent(activeDropdown)
                setActiveDropdown(null)
                setDropdownPosition(null)
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2 rounded-b-lg"
            >
              <Trash2 size={14} strokeWidth={1.5} />
              {t('studentsPage.actions.delete')}
            </button>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Assign Lesson Modal */}
      <AnimatePresence>
        {showAssignModal && assigningToStudent && (
          <AssignLessonModal
            isOpen={showAssignModal}
            onClose={() => {
              setShowAssignModal(false)
              setAssigningToStudent(null)
            }}
            studentId={assigningToStudent.id}
            studentName={assigningToStudent.name}
            availableLessons={availableLessons}
            assignedLessonIds={studentLessons[assigningToStudent.id]?.map(l => l.id) || []}
            onAssign={(lessonId) => handleAssignLesson(assigningToStudent.id, lessonId)}
          />
        )}
      </AnimatePresence>

      {/* Vocabulary Modal */}
      <AnimatePresence>
        {vocabularyModal && (
          <VocabularyModal
            lessonName={vocabularyModal.lessonName}
            vocabulary={vocabularyModal.vocabulary}
            onClose={() => setVocabularyModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence mode="wait">
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
            title={editingStudent ? t('studentsPage.modal.editTitle') : t('studentsPage.modal.addTitle')}
            initialData={editingStudent || undefined}
          />
        )}
      </AnimatePresence>
    </motion.div>
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
  const { t } = useTranslation('dashboard')
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
    <motion.div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-white dark:bg-dark-card rounded-lg p-6 w-full max-w-md border border-app-border dark:border-dark-border/20 shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-medium mb-4 text-app-black dark:text-dark-text">{title}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app-gray dark:text-app-light-gray mb-1">
              {t('studentsPage.modal.name')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-transparent border border-app-border dark:border-dark-border/20 rounded-lg outline-none focus:ring-2 focus:ring-app-green-700/20 dark:focus:ring-dark-accent/20 focus:border-app-green-700 dark:focus:border-dark-accent transition-all dark:text-dark-text"
              required
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app-gray dark:text-app-light-gray mb-1">
                {t('studentsPage.modal.targetLanguage')} *
              </label>
              <select
                value={formData.target_language}
                onChange={(e) => setFormData({ ...formData, target_language: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-transparent border border-app-border dark:border-dark-border/20 rounded-lg outline-none focus:ring-2 focus:ring-app-green-700/20 dark:focus:ring-dark-accent/20 focus:border-app-green-700 dark:focus:border-dark-accent transition-all dark:text-dark-text"
                required
                disabled={saving}
              >
                <option value="">{t('studentsPage.modal.selectLanguage')}</option>
                {languages.map(lang => (
                  <option key={lang.name} value={lang.name}>
                    {lang.native_name} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-app-gray dark:text-app-light-gray mb-1">
                {t('studentsPage.modal.nativeLanguage')}
              </label>
              <select
                value={formData.native_language}
                onChange={(e) => setFormData({ ...formData, native_language: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-transparent border border-app-border dark:border-dark-border/20 rounded-lg outline-none focus:ring-2 focus:ring-app-green-700/20 dark:focus:ring-dark-accent/20 focus:border-app-green-700 dark:focus:border-dark-accent transition-all dark:text-dark-text"
                disabled={saving}
              >
                <option value="">{t('studentsPage.modal.selectLanguage')}</option>
                {languages.map(lang => (
                  <option key={lang.name} value={lang.name}>
                    {lang.native_name} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app-gray dark:text-app-light-gray mb-1">
              {t('studentsPage.modal.level')} *
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as StudentProfile['level'] })}
              className="w-full px-3 py-2 text-sm bg-transparent border border-app-border dark:border-dark-border/20 rounded-lg outline-none focus:ring-2 focus:ring-app-green-700/20 dark:focus:ring-dark-accent/20 focus:border-app-green-700 dark:focus:border-dark-accent transition-all dark:text-dark-text"
              required
              disabled={saving}
            >
              {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-app-gray dark:text-app-light-gray mb-1">
              {t('studentsPage.modal.learningGoals')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentGoal}
                onChange={(e) => setCurrentGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                placeholder={t('studentsPage.modal.goalPlaceholder')}
                className="flex-1 px-3 py-2 text-sm bg-transparent border border-app-border dark:border-dark-border/20 rounded-lg outline-none focus:ring-2 focus:ring-app-green-700/20 dark:focus:ring-dark-accent/20 focus:border-app-green-700 dark:focus:border-dark-accent transition-all dark:text-dark-text dark:placeholder-dark-border"
                disabled={saving}
              />
              <motion.button
                type="button"
                onClick={addGoal}
                className="px-4 py-2 bg-app-secondary-bg-solid dark:bg-white/5 text-app-gray dark:text-app-light-gray rounded-lg hover:bg-app-secondary-bg-solid/80 dark:hover:bg-white/10 transition-all text-sm"
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('studentsPage.modal.add')}
              </motion.button>
            </div>
            {formData.goals.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.goals.map((goal, idx) => (
                  <motion.span 
                    key={idx} 
                    className="inline-flex items-center gap-1 px-2 py-1 bg-app-green-100 dark:bg-dark-accent/20 text-app-green-700 dark:text-dark-accent rounded-full text-xs"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {goal}
                    <button
                      type="button"
                      onClick={() => removeGoal(goal)}
                      className="hover:bg-app-green-200 dark:hover:bg-dark-accent/30 rounded-full p-0.5"
                      disabled={saving}
                    >
                      <X size={12} strokeWidth={2} />
                    </button>
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-app-gray dark:text-app-light-gray mb-1">
              {t('studentsPage.modal.interests')}
            </label>
            <textarea
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              placeholder={t('studentsPage.modal.interestsPlaceholder')}
              className="w-full px-3 py-2 text-sm bg-transparent border border-app-border dark:border-dark-border/20 rounded-lg outline-none focus:ring-2 focus:ring-app-green-700/20 dark:focus:ring-dark-accent/20 focus:border-app-green-700 dark:focus:border-dark-accent transition-all dark:text-dark-text dark:placeholder-dark-border min-h-[80px] resize-none"
              disabled={saving}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-app-border/10 dark:border-dark-border/10">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-app-gray dark:text-app-light-gray border border-app-border dark:border-dark-border/20 rounded-lg hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('studentsPage.modal.cancel')}
            </motion.button>
            <motion.button
              type="submit"
              className="px-4 py-2 text-sm bg-app-green-700 dark:bg-dark-accent text-white rounded-lg hover:bg-app-green-800 dark:hover:bg-dark-accent/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving || !formData.name || !formData.target_language}
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
            >
              {saving ? t('studentsPage.modal.saving') : (initialData ? t('studentsPage.modal.updateStudent') : t('studentsPage.modal.addStudent'))}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Vocabulary Modal Component
interface VocabularyModalProps {
  lessonName: string
  vocabulary: string[]
  onClose: () => void
}

function VocabularyModal({ lessonName, vocabulary, onClose }: VocabularyModalProps) {
  const { t } = useTranslation('dashboard')
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md border border-app-border dark:border-dark-border/20 shadow-xl overflow-hidden"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.2, type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-app-border/10 dark:border-dark-border/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-app-green-100 dark:bg-dark-accent/20 rounded-full flex items-center justify-center">
              <Book size={18} className="text-app-green-700 dark:text-dark-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-app-black dark:text-dark-text">
                {t('studentsPage.vocabularyModal.title') || 'Vocabulary List'}
              </h3>
              <p className="text-xs text-app-gray dark:text-app-light-gray mt-0.5">
                {lessonName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={18} className="text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
          </button>
        </div>
        
        {/* Vocabulary Count Badge */}
        <div className="px-4 py-3 bg-app-secondary-bg-solid/50 dark:bg-white/[0.02] border-b border-app-border/10 dark:border-dark-border/10">
          <span className="text-sm text-app-gray dark:text-app-light-gray">
            {t('studentsPage.vocabularyModal.totalWords', { count: vocabulary.length }) || `${vocabulary.length} words in this lesson`}
          </span>
        </div>
        
        {/* Vocabulary List */}
        <div className="max-h-[460px] overflow-y-auto p-4">
          <div className={`grid gap-2 ${
            vocabulary.length <= 10 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
          }`}>
            {vocabulary.map((word, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 p-3 bg-app-secondary-bg-solid/30 dark:bg-white/[0.02] rounded-lg border border-app-border/10 dark:border-dark-border/10"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: Math.min(index * 0.02, 0.3), 
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <span className="flex-shrink-0 w-8 h-8 bg-app-green-100 dark:bg-dark-accent/20 rounded-full flex items-center justify-center text-xs font-medium text-app-green-700 dark:text-dark-accent">
                  {index + 1}
                </span>
                <span className="text-sm text-app-black dark:text-dark-text font-medium">
                  {word}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}