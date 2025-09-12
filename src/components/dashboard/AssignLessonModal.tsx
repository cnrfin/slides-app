// src/components/dashboard/AssignLessonModal.tsx
import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Search, 
  BookOpen, 
  Calendar, 
  Check,
  ChevronRight,
  Languages,
  Hash
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  description?: string
  lesson_type?: string
  vocabulary_count?: number
  created_at: string
  updated_at: string
}

interface AssignLessonModalProps {
  isOpen: boolean
  onClose: () => void
  studentId: string
  studentName: string
  availableLessons: Lesson[]
  assignedLessonIds: string[]
  onAssign: (lessonId: string) => Promise<void>
}

export function AssignLessonModal({ 
  isOpen, 
  onClose, 
  studentId, 
  studentName,
  availableLessons,
  assignedLessonIds,
  onAssign 
}: AssignLessonModalProps) {
  const { t, i18n } = useTranslation('dashboard')
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(new Set())
  const [assigning, setAssigning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDetails, setShowDetails] = useState<string | null>(null)
  
  // Debug logging
  console.log('AssignLessonModal props:', {
    studentName,
    availableLessons: availableLessons.length,
    assignedLessonIds: assignedLessonIds.length,
    lessons: availableLessons
  })
  
  // Filter out already assigned lessons and apply search
  const filteredLessons = useMemo(() => {
    console.log('Filtering lessons:', {
      total: availableLessons.length,
      assigned: assignedLessonIds.length,
      searchQuery
    })
    
    const notAssigned = availableLessons.filter(lesson => !assignedLessonIds.includes(lesson.id))
    console.log('Not assigned lessons:', notAssigned.length)
    
    const filtered = notAssigned.filter(lesson => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return lesson.title?.toLowerCase().includes(query) ||
             lesson.description?.toLowerCase().includes(query) ||
             lesson.lesson_type?.toLowerCase().includes(query)
    })
    
    console.log('Filtered lessons:', filtered.length)
    return filtered
  }, [availableLessons, assignedLessonIds, searchQuery])
  
  const handleAssign = async () => {
    if (selectedLessonIds.size === 0) return
    
    setAssigning(true)
    try {
      // Assign all selected lessons
      const assignPromises = Array.from(selectedLessonIds).map(lessonId => 
        onAssign(lessonId)
      )
      await Promise.all(assignPromises)
      onClose()
    } catch (error) {
      console.error('Error assigning lessons:', error)
      // Stay open on error so user can retry
    } finally {
      setAssigning(false)
    }
  }
  
  const toggleLessonSelection = (lessonId: string) => {
    const newSelection = new Set(selectedLessonIds)
    if (newSelection.has(lessonId)) {
      newSelection.delete(lessonId)
    } else {
      newSelection.add(lessonId)
    }
    setSelectedLessonIds(newSelection)
  }
  
  const selectAll = () => {
    const allIds = new Set(filteredLessons.map(l => l.id))
    setSelectedLessonIds(allIds)
  }
  
  const deselectAll = () => {
    setSelectedLessonIds(new Set())
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
  
  const getLessonTypeIcon = (type?: string) => {
    switch (type) {
      case 'vocabulary':
        return <Hash size={14} strokeWidth={1.5} />
      case 'grammar':
        return <BookOpen size={14} strokeWidth={1.5} />
      case 'conversation':
        return <Languages size={14} strokeWidth={1.5} />
      default:
        return <BookOpen size={14} strokeWidth={1.5} />
    }
  }
  
  const getLessonTypeColor = (type?: string) => {
    switch (type) {
      case 'vocabulary':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
      case 'grammar':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'conversation':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
    }
  }
  
  if (!isOpen) return null
  
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
        className="bg-white dark:bg-dark-card rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col border border-app-border dark:border-dark-border/20 shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-app-border dark:border-dark-border/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-app-black dark:text-dark-text">
                {t('studentsPage.assignModal.title')}
              </h2>
              <p className="text-sm text-app-gray dark:text-app-light-gray mt-1">
                {t('studentsPage.assignModal.subtitle', { name: studentName })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 rounded-lg transition-all"
            >
              <X size={20} className="text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-gray dark:text-app-light-gray w-4 h-4" strokeWidth={1.5} />
            <input
              type="text"
              placeholder={t('studentsPage.assignModal.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-app-secondary-bg-solid dark:bg-white/5 border border-app-border dark:border-dark-border/20 rounded-lg outline-none focus:ring-2 focus:ring-app-green-700/20 dark:focus:ring-dark-accent/20 focus:border-app-green-700 dark:focus:border-dark-accent transition-all dark:text-dark-text dark:placeholder-dark-border"
              disabled={assigning}
            />
          </div>
        </div>
        
        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredLessons.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={32} className="mx-auto text-app-gray dark:text-app-light-gray mb-3" strokeWidth={1.5} />
              <p className="text-app-gray dark:text-app-light-gray mb-2">
                {searchQuery 
                  ? t('studentsPage.assignModal.noLessonsFound') || 'No lessons found matching your search'
                  : availableLessons.length === 0
                    ? t('studentsPage.assignModal.noLessonsCreated') || "You haven't created any lessons yet"
                    : t('studentsPage.assignModal.noAvailableLessons') || 'All lessons have been assigned to this student'}
              </p>
              {availableLessons.length === 0 && (
                <p className="text-xs text-app-gray dark:text-app-light-gray">
                  {t('studentsPage.assignModal.createLessonHint') || 'Create a lesson first from the Dashboard'}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLessons.map((lesson) => (
                <motion.div
                  key={lesson.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedLessonIds.has(lesson.id)
                      ? 'border-app-green-700 dark:border-dark-accent bg-app-green-50 dark:bg-dark-accent/10'
                      : 'border-app-border dark:border-dark-border/20 hover:border-app-green-600 dark:hover:border-dark-accent/60 hover:bg-app-secondary-bg-solid dark:hover:bg-white/5'
                  }`}
                  onClick={() => toggleLessonSelection(lesson.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-app-black dark:text-dark-text">
                          {lesson.title || 'Untitled Lesson'}
                        </h3>
                        {lesson.lesson_type && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${getLessonTypeColor(lesson.lesson_type)}`}>
                            {getLessonTypeIcon(lesson.lesson_type)}
                            {lesson.lesson_type}
                          </span>
                        )}
                      </div>
                      
                      {lesson.description && (
                        <p className="text-xs text-app-gray dark:text-app-light-gray mb-2 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-app-gray dark:text-app-light-gray">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} strokeWidth={1.5} />
                          <span>{formatDate(lesson.created_at)}</span>
                        </div>
                        {lesson.vocabulary_count !== undefined && lesson.vocabulary_count > 0 && (
                          <div className="flex items-center gap-1">
                            <Hash size={12} strokeWidth={1.5} />
                            <span>{t('studentsPage.assignModal.vocabularyCount', { count: lesson.vocabulary_count })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                          selectedLessonIds.has(lesson.id)
                            ? 'bg-app-green-700 dark:bg-dark-accent border-app-green-700 dark:border-dark-accent'
                            : 'border-app-border dark:border-dark-border/40 hover:border-app-green-600 dark:hover:border-dark-accent/60'
                        }`}
                      >
                        {selectedLessonIds.has(lesson.id) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <Check size={14} className="text-white" strokeWidth={2} />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expandable Details */}
                  <AnimatePresence>
                    {showDetails === lesson.id && (
                      <motion.div
                        className="mt-3 pt-3 border-t border-app-border dark:border-dark-border/20"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-app-gray dark:text-app-light-gray">
                              {t('studentsPage.assignModal.created')}:
                            </span>
                            <span className="ml-1 text-app-black dark:text-dark-text">
                              {formatDate(lesson.created_at)}
                            </span>
                          </div>
                          <div>
                            <span className="text-app-gray dark:text-app-light-gray">
                              {t('studentsPage.assignModal.lastUpdated')}:
                            </span>
                            <span className="ml-1 text-app-black dark:text-dark-text">
                              {formatDate(lesson.updated_at)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-app-border dark:border-dark-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm text-app-gray dark:text-app-light-gray">
                {selectedLessonIds.size === 0
                  ? (filteredLessons.length === 1 
                      ? t('studentsPage.assignModal.oneLesson')
                      : t('studentsPage.assignModal.lessonsAvailable', { count: filteredLessons.length }))
                  : t('studentsPage.assignModal.selectedCount', { 
                      selected: selectedLessonIds.size, 
                      total: filteredLessons.length 
                    }) || `${selectedLessonIds.size} of ${filteredLessons.length} selected`}
              </p>
              {filteredLessons.length > 0 && (
                <div className="flex gap-2">
                  {selectedLessonIds.size < filteredLessons.length ? (
                    <button
                      onClick={selectAll}
                      className="text-xs text-app-green-700 dark:text-dark-accent hover:text-app-green-800 dark:hover:text-dark-accent/80 transition-colors"
                      disabled={assigning}
                    >
                      {t('studentsPage.assignModal.selectAll') || 'Select all'}
                    </button>
                  ) : (
                    <button
                      onClick={deselectAll}
                      className="text-xs text-app-gray dark:text-app-light-gray hover:text-app-black dark:hover:text-dark-text transition-colors"
                      disabled={assigning}
                    >
                      {t('studentsPage.assignModal.deselectAll') || 'Deselect all'}
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-app-gray dark:text-app-light-gray border border-app-border dark:border-dark-border/20 rounded-lg hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all"
                disabled={assigning}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('studentsPage.assignModal.cancel')}
              </motion.button>
              <motion.button
                onClick={handleAssign}
                className="px-4 py-2 text-sm bg-app-green-700 dark:bg-dark-accent text-white rounded-lg hover:bg-app-green-800 dark:hover:bg-dark-accent/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={selectedLessonIds.size === 0 || assigning}
                whileHover={{ scale: assigning || selectedLessonIds.size === 0 ? 1 : 1.02 }}
                whileTap={{ scale: assigning || selectedLessonIds.size === 0 ? 1 : 0.98 }}
              >
                {assigning 
                  ? t('studentsPage.assignModal.assigning') 
                  : selectedLessonIds.size > 1
                    ? (t('studentsPage.assignModal.assignMultipleLessons', { count: selectedLessonIds.size }) || `Assign ${selectedLessonIds.size} Lessons`)
                    : t('studentsPage.assignModal.assignLesson')}
                {selectedLessonIds.size > 0 && !assigning && (
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-medium">
                    {selectedLessonIds.size}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}