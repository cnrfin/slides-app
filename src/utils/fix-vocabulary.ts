// src/utils/fix-vocabulary.ts
// Utility to extract and save vocabulary for existing lessons

import { supabase } from '@/lib/supabase'
import { extractDetailedVocabularyFromSlides } from '@/utils/vocabulary-extractor'
import { getCurrentUser } from '@/lib/database'

export async function fixExistingLessonsVocabulary() {
  try {
    console.log('Starting vocabulary fix for existing lessons...')
    
    const user = await getCurrentUser()
    if (!user) {
      console.error('User not authenticated')
      return { success: false, message: 'User not authenticated' }
    }
    
    // Get all lessons for the current user that have no vocabulary
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        vocabulary_count,
        slides (
          id,
          slide_type,
          metadata,
          slide_elements (
            id,
            element_type,
            content
          )
        )
      `)
      .eq('user_id', user.id)
      .or('vocabulary_count.is.null,vocabulary_count.eq.0')
    
    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError)
      return { success: false, message: 'Error fetching lessons', error: lessonsError }
    }
    
    console.log(`Found ${lessons?.length || 0} lessons to process`)
    
    let fixedCount = 0
    let errorCount = 0
    let noVocabCount = 0
    const results: any[] = []
    
    for (const lesson of lessons || []) {
      try {
        console.log(`Processing lesson: ${lesson.title} (${lesson.id})`)
        
        // Transform slides to match expected structure
        const slides = lesson.slides.map((slide: any) => ({
          id: slide.id,
          slideType: slide.slide_type,
          metadata: slide.metadata,
          elements: slide.slide_elements?.map((element: any) => ({
            id: element.id,
            type: element.element_type,
            content: element.content
          })) || []
        }))
        
        // Extract vocabulary
        const extractedVocabulary = extractDetailedVocabularyFromSlides(slides)
        
        if (extractedVocabulary.length > 0) {
          console.log(`  Found ${extractedVocabulary.length} vocabulary words`)
          
          // Delete any existing vocabulary for this lesson
          await supabase
            .from('lesson_vocabulary')
            .delete()
            .eq('lesson_id', lesson.id)
          
          // Insert new vocabulary
          const vocabularyToInsert = extractedVocabulary.map(v => ({
            lesson_id: lesson.id,
            word: v.word,
            translation: v.translation || null,
            category: v.category || null,
            difficulty_level: v.difficulty_level || null,
            context_sentence: v.context_sentence || null
          }))
          
          const { error: insertError } = await supabase
            .from('lesson_vocabulary')
            .insert(vocabularyToInsert)
          
          if (insertError) {
            console.error(`  Error inserting vocabulary:`, insertError)
            errorCount++
            results.push({
              lessonId: lesson.id,
              title: lesson.title,
              status: 'error',
              error: insertError.message
            })
            continue
          }
          
          // Update vocabulary count
          const { error: updateError } = await supabase
            .from('lessons')
            .update({ vocabulary_count: extractedVocabulary.length })
            .eq('id', lesson.id)
          
          if (updateError) {
            console.error(`  Error updating vocabulary count:`, updateError)
            errorCount++
            results.push({
              lessonId: lesson.id,
              title: lesson.title,
              status: 'error',
              error: updateError.message
            })
            continue
          }
          
          console.log(`  ✅ Fixed vocabulary for lesson: ${lesson.title}`)
          fixedCount++
          results.push({
            lessonId: lesson.id,
            title: lesson.title,
            status: 'fixed',
            vocabularyCount: extractedVocabulary.length
          })
        } else {
          console.log(`  No vocabulary found in lesson: ${lesson.title}`)
          noVocabCount++
          
          // Update count to 0 to mark as processed
          await supabase
            .from('lessons')
            .update({ vocabulary_count: 0 })
            .eq('id', lesson.id)
          
          results.push({
            lessonId: lesson.id,
            title: lesson.title,
            status: 'no_vocabulary'
          })
        }
      } catch (error: any) {
        console.error(`Error processing lesson ${lesson.id}:`, error)
        errorCount++
        results.push({
          lessonId: lesson.id,
          title: lesson.title,
          status: 'error',
          error: error.message
        })
      }
    }
    
    const summary = {
      success: true,
      totalProcessed: lessons?.length || 0,
      fixed: fixedCount,
      errors: errorCount,
      noVocabulary: noVocabCount,
      results
    }
    
    console.log(`\n✅ Vocabulary fix complete!`)
    console.log(`  Fixed: ${fixedCount} lessons`)
    console.log(`  Errors: ${errorCount} lessons`)
    console.log(`  No vocabulary: ${noVocabCount} lessons`)
    
    return summary
  } catch (error: any) {
    console.error('Error in vocabulary fix:', error)
    return { 
      success: false, 
      message: 'Error in vocabulary fix', 
      error: error.message 
    }
  }
}

// Function to fix a single lesson
export async function fixLessonVocabulary(lessonId: string) {
  try {
    console.log(`Fixing vocabulary for lesson ${lessonId}...`)
    
    // Get the lesson with slides
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        vocabulary_count,
        slides (
          id,
          slide_type,
          metadata,
          slide_elements (
            id,
            element_type,
            content
          )
        )
      `)
      .eq('id', lessonId)
      .single()
    
    if (lessonError || !lesson) {
      console.error('Error fetching lesson:', lessonError)
      return { success: false, message: 'Lesson not found' }
    }
    
    // Transform slides
    const slides = lesson.slides.map((slide: any) => ({
      id: slide.id,
      slideType: slide.slide_type,
      metadata: slide.metadata,
      elements: slide.slide_elements?.map((element: any) => ({
        id: element.id,
        type: element.element_type,
        content: element.content
      })) || []
    }))
    
    // Extract vocabulary
    const extractedVocabulary = extractDetailedVocabularyFromSlides(slides)
    
    if (extractedVocabulary.length > 0) {
      // Delete existing vocabulary
      await supabase
        .from('lesson_vocabulary')
        .delete()
        .eq('lesson_id', lessonId)
      
      // Insert new vocabulary
      const vocabularyToInsert = extractedVocabulary.map(v => ({
        lesson_id: lessonId,
        word: v.word,
        translation: v.translation || null,
        category: v.category || null,
        difficulty_level: v.difficulty_level || null,
        context_sentence: v.context_sentence || null
      }))
      
      const { error: insertError } = await supabase
        .from('lesson_vocabulary')
        .insert(vocabularyToInsert)
      
      if (insertError) {
        console.error('Error inserting vocabulary:', insertError)
        return { success: false, message: 'Error saving vocabulary' }
      }
      
      // Update vocabulary count
      await supabase
        .from('lessons')
        .update({ vocabulary_count: extractedVocabulary.length })
        .eq('id', lessonId)
      
      console.log(`✅ Fixed ${extractedVocabulary.length} vocabulary words for lesson: ${lesson.title}`)
      return { 
        success: true, 
        vocabularyCount: extractedVocabulary.length,
        vocabulary: extractedVocabulary
      }
    } else {
      // Update count to 0
      await supabase
        .from('lessons')
        .update({ vocabulary_count: 0 })
        .eq('id', lessonId)
      
      console.log(`No vocabulary found in lesson: ${lesson.title}`)
      return { success: true, vocabularyCount: 0, vocabulary: [] }
    }
  } catch (error: any) {
    console.error('Error fixing lesson vocabulary:', error)
    return { 
      success: false, 
      message: 'Error fixing lesson vocabulary', 
      error: error.message 
    }
  }
}
