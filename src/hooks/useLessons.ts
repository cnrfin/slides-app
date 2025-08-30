// src/hooks/useLessons.ts
import { useState, useEffect } from 'react'
import { loadUserLessons, getCurrentUser } from '@/lib/database'

export interface Lesson {
  id: string
  title: string
  description?: string
  vocabulary?: string[]
  grammarPoints?: string[]
  topics?: string[]
  date?: string
  created_at?: string
  updated_at?: string
  target_language?: string
  slide_order?: string[]
}

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingLessons, setLoadingLessons] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    try {
      setLoadingLessons(true)
      setError(null)
      
      const user = await getCurrentUser()
      if (!user) {
        console.log('No user found')
        setLoadingLessons(false)
        return
      }
      
      console.log('Loading lessons for user:', user.id)
      const lessonsData = await loadUserLessons(user.id)
      
      // Transform the lessons data to match our interface
      const transformedLessons: Lesson[] = (lessonsData || []).map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title || 'Untitled Lesson',
        description: lesson.description,
        vocabulary: lesson.vocabulary || [],
        grammarPoints: lesson.grammar_points || [],
        topics: lesson.topics || [],
        date: lesson.updated_at || lesson.created_at,
        created_at: lesson.created_at,
        updated_at: lesson.updated_at,
        target_language: lesson.target_language,
        slide_order: lesson.slide_order || []
      }))
      
      console.log('Loaded lessons:', transformedLessons)
      setLessons(transformedLessons)
    } catch (err) {
      console.error('Error loading lessons:', err)
      setError(err as Error)
      setLessons([])
    } finally {
      setLoadingLessons(false)
    }
  }

  const refreshLessons = () => {
    loadLessons()
  }

  return {
    lessons,
    loadingLessons,
    error,
    refreshLessons
  }
}
