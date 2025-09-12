// src/lib/database.ts
import { supabase } from './supabase'
import { sessionManager } from './session-manager'
import { extractVocabularyFromSlides, extractDetailedVocabularyFromSlides } from '@/utils/vocabulary-extractor'
import type { 
  Presentation, 
  Slide, 
  SlideElement 
} from '@/types/slide.types'

// =============================================
// USER MANAGEMENT
// =============================================

export async function getCurrentUser() {
  // Directly get user without session manager wrapper to avoid blocking
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserProfile(userId: string) {
  return sessionManager.withSessionCheck(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  })
}

export async function createUserProfile(user: any) {
  return sessionManager.withSessionCheck(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  })
}

export async function updateUserProfile(userId: string, updates: any) {
  return sessionManager.withSessionCheck(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  })
}

// =============================================
// LESSON MANAGEMENT
// =============================================

export async function saveLesson(presentation: Presentation, slides: Slide[]) {
  return sessionManager.withSessionCheck(async () => {
    try {
      console.log('🔄 Starting lesson save...', { 
        presentationId: presentation.id, 
        slideCount: slides.length,
        totalElements: slides.reduce((acc, s) => acc + s.elements.length, 0)
      })
      
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      // Check if this is a new lesson or an update
      // We'll use a UUID pattern check to determine if the ID is from the database
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(presentation.id)
      
      let lesson
      
      if (isValidUUID) {
        // This is an update - the ID is already a valid UUID from the database
        // First check if the lesson exists
        const { data: existingLesson, error: checkError } = await supabase
          .from('lessons')
          .select('id')
          .eq('id', presentation.id)
          .single()
        
        if (checkError || !existingLesson) {
          // Lesson doesn't exist, create a new one with a new ID
          console.log('Lesson with ID not found, creating new lesson:', presentation.id)
          const { data, error: lessonError } = await supabase
            .from('lessons')
            .insert({
              user_id: user.id,
              title: presentation.title,
              description: presentation.description,
              slide_order: presentation.slides,
              target_language: presentation.settings?.language,
              version: presentation.version,
              last_opened_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (lessonError) throw lessonError
          lesson = data
        } else {
          // Lesson exists, update it
          const { data, error: lessonError } = await supabase
            .from('lessons')
            .update({
              title: presentation.title,
              description: presentation.description,
              slide_order: presentation.slides,
              target_language: presentation.settings?.language,
              version: presentation.version,
              last_opened_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', presentation.id)
            .select()
            .single()

          if (lessonError) throw lessonError
          lesson = data
        }
      } else {
        // This is a new lesson - let the database generate the UUID
        const { data, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            user_id: user.id,
            title: presentation.title,
            description: presentation.description,
            slide_order: presentation.slides,
            target_language: presentation.settings?.language,
            version: presentation.version,
            last_opened_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (lessonError) throw lessonError
        lesson = data
      }

      // Create ID mapping to track old IDs to new IDs
      const idMapping: IdMapping = {
        slides: {},
        elements: {}
      }

      // First, get all existing slides for this lesson to identify which ones to delete
      const { data: existingSlides, error: fetchError } = await supabase
        .from('slides')
        .select('id')
        .eq('lesson_id', lesson.id)

      if (fetchError) {
        console.error('Error fetching existing slides:', fetchError)
      }

      // Save slides with the proper lesson ID
      const savedSlides = []
      const currentSlideIds = new Set<string>() // Track which slide IDs are currently active
      
      for (const slide of slides) {
        const savedSlide = await saveSlide(slide, lesson.id, idMapping)
        savedSlides.push(savedSlide)
        currentSlideIds.add(savedSlide.id)
      }

      // Delete slides that are no longer in the presentation
      if (existingSlides) {
        const slidesToDelete = existingSlides
          .filter(existingSlide => !currentSlideIds.has(existingSlide.id))
          .map(slide => slide.id)

        if (slidesToDelete.length > 0) {
          console.log(`🗑️ Deleting ${slidesToDelete.length} orphaned slides:`, slidesToDelete)
          
          // Delete the orphaned slides (this will cascade delete their elements)
          const { error: deleteError } = await supabase
            .from('slides')
            .delete()
            .in('id', slidesToDelete)

          if (deleteError) {
            console.error('Error deleting orphaned slides:', deleteError)
          } else {
            console.log('✅ Successfully deleted orphaned slides')
          }
        }
      }

      // Update slide_order with the new slide IDs if needed
      const newSlideOrder = presentation.slides.map(oldId => idMapping.slides[oldId] || oldId)
      
      // If slide IDs changed, update the lesson's slide_order
      if (Object.keys(idMapping.slides).length > 0) {
        const { data: updatedLesson, error: updateError } = await supabase
          .from('lessons')
          .update({ slide_order: newSlideOrder })
          .eq('id', lesson.id)
          .select()
          .single()
        
        if (updateError) throw updateError
        lesson = updatedLesson
      }

      // ===== VOCABULARY EXTRACTION AND SAVING =====
      console.log('📚 Extracting vocabulary from slides...')
      
      try {
        // Extract vocabulary from the slides
        const extractedVocabulary = extractDetailedVocabularyFromSlides(slides)
        console.log(`Found ${extractedVocabulary.length} vocabulary words`)
        
        if (extractedVocabulary.length > 0) {
          // First, check if lesson_vocabulary table exists
          const { error: tableCheckError } = await supabase
            .from('lesson_vocabulary')
            .select('id')
            .limit(0)
          
          if (tableCheckError && tableCheckError.code === '42P01') {
            console.warn('lesson_vocabulary table does not exist. Skipping vocabulary save.')
          } else {
            // Delete existing vocabulary for this lesson
            const { error: deleteVocabError } = await supabase
              .from('lesson_vocabulary')
              .delete()
              .eq('lesson_id', lesson.id)
            
            if (deleteVocabError) {
              console.error('Error deleting existing vocabulary:', deleteVocabError)
            }
            
            // Insert new vocabulary
            const vocabularyToInsert = extractedVocabulary.map(v => ({
              lesson_id: lesson.id,
              word: v.word,
              translation: v.translation || null,
              category: v.category || null,
              difficulty_level: v.difficulty_level || null,
              context_sentence: v.context_sentence || null
            }))
            
            const { data: insertedVocab, error: insertVocabError } = await supabase
              .from('lesson_vocabulary')
              .insert(vocabularyToInsert)
              .select()
            
            if (insertVocabError) {
              console.error('Error inserting vocabulary:', insertVocabError)
            } else {
              console.log(`✅ Successfully saved ${insertedVocab?.length || 0} vocabulary words`)
              
              // Update vocabulary count in lessons table
              const { error: updateCountError } = await supabase
                .from('lessons')
                .update({ vocabulary_count: extractedVocabulary.length })
                .eq('id', lesson.id)
              
              if (updateCountError) {
                console.error('Error updating vocabulary count:', updateCountError)
              }
            }
          }
        } else {
          // No vocabulary found, update count to 0
          await supabase
            .from('lessons')
            .update({ vocabulary_count: 0 })
            .eq('id', lesson.id)
        }
      } catch (vocabError) {
        console.error('Error processing vocabulary:', vocabError)
        // Don't fail the entire save operation if vocabulary extraction fails
      }

      console.log('✅ Lesson saved successfully!', {
        lessonId: lesson.id,
        totalSlides: savedSlides.length,
        mappedSlides: Object.keys(idMapping.slides).length,
        mappedElements: Object.keys(idMapping.elements).length,
        vocabularyCount: lesson.vocabulary_count || 0
      })
      
      // Return the lesson with the mapping info so the frontend can update its state
      return {
        lesson,
        idMapping
      }
    } catch (error) {
      console.error('Error saving lesson:', error)
      throw error
    }
  }, {
    maxRetries: 3, // Increase retries for save operations
    onAuthError: () => {
      window.dispatchEvent(new CustomEvent('auth:error', { 
        detail: { message: 'Authentication error while saving. Please try again.' }
      }))
    }
  })
}

// Keep track of ID mappings during save
interface IdMapping {
  slides: Record<string, string> // old ID -> new ID
  elements: Record<string, string> // old ID -> new ID
}

async function saveSlide(slide: Slide, lessonId: string, idMapping?: IdMapping) {
  try {
    // Validate slide data
    if (!slide || !lessonId) {
      throw new Error('Invalid slide or lesson ID')
    }
    
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slide.id)
    
    let slideData
    
    if (isValidUUID) {
      // Update existing slide
      const { data, error: slideError } = await supabase
        .from('slides')
        .update({
          lesson_id: lessonId,
          slide_order: slide.order,
          slide_type: slide.slideType,
          background: typeof slide.background === 'string' ? slide.background : JSON.stringify(slide.background),
          template_id: slide.templateId,
          notes: slide.notes,
          metadata: slide.metadata || {},
          updated_at: new Date().toISOString(),
        })
        .eq('id', slide.id)
        .select()
        .single()

      if (slideError) throw slideError
      slideData = data
    } else {
      // Insert new slide
      const { data, error: slideError } = await supabase
        .from('slides')
        .insert({
          lesson_id: lessonId,
          slide_order: slide.order,
          slide_type: slide.slideType,
          background: typeof slide.background === 'string' ? slide.background : JSON.stringify(slide.background),
          template_id: slide.templateId,
          notes: slide.notes,
          metadata: slide.metadata || {},
        })
        .select()
        .single()

      if (slideError) throw slideError
      slideData = data
      
      // Store the ID mapping
      if (idMapping) {
        idMapping.slides[slide.id] = slideData.id
      }
    }

    // Delete existing elements for this slide
    await supabase
      .from('slide_elements')
      .delete()
      .eq('slide_id', slideData.id)

    // Save slide elements
    if (slide.elements.length > 0) {
      // Separate elements into new (without UUID) and existing (with UUID)
      const newElements: any[] = []
      const existingElements: any[] = []
      const newElementIndices: number[] = []
      const existingElementIndices: number[] = []
      
      slide.elements.forEach((element, index) => {
        const elementData: any = {
          slide_id: slideData.id,
          element_type: element.type,
          position_x: element.x,
          position_y: element.y,
          width: element.width,
          height: element.height,
          rotation: element.rotation || 0,
          opacity: element.opacity || 1,
          z_index: index, // Use array index as z-index
          content: element.content || {},
          style: element.style || {},
          animations: element.animations || [],
          interactions: element.interactions || [],
          metadata: element.metadata || {},
          locked: element.locked || false,
          visible: element.visible !== false,
        }
        
        // Check if it's an existing element with valid UUID
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(element.id)) {
          elementData.id = element.id
          existingElements.push(elementData)
          existingElementIndices.push(index)
        } else {
          newElements.push(elementData)
          newElementIndices.push(index)
        }
      })

      // Insert new elements (without IDs)
      if (newElements.length > 0) {
        console.log(`  📝 Inserting ${newElements.length} new elements for slide ${slideData.id}`)
        
        const { data: insertedNewElements, error: newElementsError } = await supabase
          .from('slide_elements')
          .insert(newElements)
          .select()

        if (newElementsError) {
          console.error('Error inserting new elements:', newElementsError, {
            slideId: slideData.id,
            elementCount: newElements.length,
            firstElement: newElements[0]
          })
          throw newElementsError
        }
        
        console.log(`  ✅ Successfully inserted ${insertedNewElements?.length || 0} elements`)
        
        // Store element ID mappings for new elements
        if (idMapping && insertedNewElements && insertedNewElements.length === newElements.length) {
          insertedNewElements.forEach((insertedElement, idx) => {
            const originalIndex = newElementIndices[idx]
            const originalElement = slide.elements[originalIndex]
            if (originalElement && insertedElement.id) {
              idMapping.elements[originalElement.id] = insertedElement.id
            }
          })
        }
      }
      
      // Upsert existing elements (with IDs)
      if (existingElements.length > 0) {
        console.log(`  🔄 Upserting ${existingElements.length} existing elements for slide ${slideData.id}`)
        
        const { error: existingElementsError } = await supabase
          .from('slide_elements')
          .upsert(existingElements, {
            onConflict: 'id',
            ignoreDuplicates: false
          })

        if (existingElementsError) {
          console.error('Error upserting existing elements:', existingElementsError, {
            slideId: slideData.id,
            elementCount: existingElements.length,
            firstElement: existingElements[0]
          })
          throw existingElementsError
        }
        
        console.log(`  ✅ Successfully upserted ${existingElements.length} elements`)
      }
    }

    return slideData
  } catch (error) {
    console.error('Error saving slide:', error)
    throw error
  }
}

export async function loadUserLessons(userId: string) {
  return sessionManager.withSessionCheck(async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        slides (
          *,
          slide_elements (*)
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  }, {
    maxRetries: 3
  })
}

export async function loadLesson(lessonId: string) {
  return sessionManager.withSessionCheck(async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        slides (
          *,
          slide_elements (*)
        )
      `)
      .eq('id', lessonId)
      .single()

    if (error) throw error
  
    // Transform the data back to your app's format
    const presentation: Presentation = {
      id: data.id,
      title: data.title,
      description: data.description,
      slides: data.slide_order || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      version: data.version,
      settings: {
        language: data.target_language
      }
    }

    const slides: Slide[] = data.slides
      .sort((a: any, b: any) => a.slide_order - b.slide_order)
      .map((slideData: any) => {
        const elements: SlideElement[] = slideData.slide_elements
          .sort((a: any, b: any) => a.z_index - b.z_index)
          .map((elementData: any) => ({
            id: elementData.id,
            type: elementData.element_type,
            x: elementData.position_x,
            y: elementData.position_y,
            width: elementData.width,
            height: elementData.height,
            rotation: elementData.rotation,
            opacity: elementData.opacity,
            locked: elementData.locked,
            visible: elementData.visible,
            content: elementData.content,
            style: elementData.style,
            animations: elementData.animations,
            interactions: elementData.interactions,
            metadata: elementData.metadata,
            createdAt: elementData.created_at,
            updatedAt: elementData.updated_at,
          }))

        return {
          id: slideData.id,
          presentationId: data.id,
          elements,
          background: slideData.background,
          order: slideData.slide_order,
          templateId: slideData.template_id,
          slideType: slideData.slide_type,
          notes: slideData.notes,
          metadata: slideData.metadata,
          createdAt: slideData.created_at,
          updatedAt: slideData.updated_at,
        }
      })

    return { presentation, slides }
  }, {
    maxRetries: 3
  })
}

export async function deleteLesson(lessonId: string) {
  return sessionManager.withSessionCheck(async () => {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)

    if (error) throw error
  })
}

// =============================================
// STUDENT PROFILES
// =============================================

export async function getUserStudentProfiles(userId: string) {
  try {
    console.log('Fetching student profiles for user:', userId)
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('tutor_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching student profiles:', error)
      throw error
    }
    
    console.log('Fetched student profiles:', data)
    return data || []
  } catch (error) {
    console.error('Failed to get student profiles:', error)
    return []
  }
}

export async function createStudentProfile(profile: any) {
  return sessionManager.withSessionCheck(async () => {
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('student_profiles')
      .insert({
        ...profile,
        tutor_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  })
}

// =============================================
// STUDENT-LESSON ASSOCIATIONS
// =============================================

export async function assignLessonToStudent(studentId: string, lessonId: string, notes?: string) {
  try {
    // Check if table exists first
    const { error: tableError } = await supabase
      .from('student_lessons')
      .select('id')
      .limit(0)
    
    if (tableError && tableError.code === '42P01') {
      console.error('student_lessons table does not exist. Please run the migration.')
      throw new Error('Database tables not configured. Please contact support.')
    }
    
    const { data, error } = await supabase
      .from('student_lessons')
      .insert({
        student_id: studentId,
        lesson_id: lessonId,
        notes
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('This lesson is already assigned to this student')
      }
      throw error
    }
    
    // Check if the lesson has vocabulary count, if not, try to extract and save
    const { data: lessonData } = await supabase
      .from('lessons')
      .select('vocabulary_count')
      .eq('id', lessonId)
      .single()
    
    if (lessonData && (!lessonData.vocabulary_count || lessonData.vocabulary_count === 0)) {
      // Extract and save vocabulary if not already done
      console.log('Lesson has no vocabulary count, extracting from slides...')
      
      const { data: slidesData } = await supabase
        .from('slides')
        .select(`
          id,
          slide_type,
          metadata,
          slide_elements (
            id,
            element_type,
            content
          )
        `)
        .eq('lesson_id', lessonId)
      
      if (slidesData && slidesData.length > 0) {
        // Transform database slides to match the Slide type
        const slides = slidesData.map((slide: any) => ({
          ...slide,
          slideType: slide.slide_type,
          elements: slide.slide_elements?.map((element: any) => ({
            ...element,
            type: element.element_type,
            content: element.content
          })) || []
        }))
        
        const extractedVocabulary = extractDetailedVocabularyFromSlides(slides)
        
        if (extractedVocabulary.length > 0) {
          // Save vocabulary
          const vocabularyToInsert = extractedVocabulary.map(v => ({
            lesson_id: lessonId,
            word: v.word,
            translation: v.translation || null,
            category: v.category || null,
            difficulty_level: v.difficulty_level || null,
            context_sentence: v.context_sentence || null
          }))
          
          const { error: vocabError } = await supabase
            .from('lesson_vocabulary')
            .insert(vocabularyToInsert)
          
          if (!vocabError) {
            // Update vocabulary count
            await supabase
              .from('lessons')
              .update({ vocabulary_count: extractedVocabulary.length })
              .eq('id', lessonId)
            
            console.log(`Extracted and saved ${extractedVocabulary.length} vocabulary words for lesson ${lessonId}`)
          }
        }
      }
    }
    
    return data
  } catch (error) {
    console.error('Error assigning lesson to student:', error)
    throw error
  }
}

export async function unassignLessonFromStudent(studentId: string, lessonId: string) {
  return sessionManager.withSessionCheck(async () => {
    const { error } = await supabase
      .from('student_lessons')
      .delete()
      .match({ student_id: studentId, lesson_id: lessonId })
    
    if (error) throw error
  })
}

export async function getStudentLessons(studentId: string) {
  try {
    console.log('Fetching lessons for student:', studentId)
    
    // First check if the student_lessons table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('student_lessons')
      .select('id')
      .limit(0)
    
    if (tableError && tableError.code === '42P01') {
      console.warn('student_lessons table does not exist. Please run the migration.')
      return []
    }
    
    // Fetch student lessons with basic lesson info
    const { data, error } = await supabase
      .from('student_lessons')
      .select(`
        *,
        lessons (
          id,
          title,
          description,
          lesson_type,
          difficulty_level,
          vocabulary_count,
          created_at,
          updated_at
        )
      `)
      .eq('student_id', studentId)
      .order('assigned_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching student lessons:', error)
      return []
    }
    
    // For each lesson, fetch vocabulary separately
    const lessonsWithVocab = await Promise.all(
      (data || []).map(async (item) => {
        const lessonData = item.lessons || item.lesson || null
        
        let vocabulary: string[] = []
        
        if (lessonData?.id) {
          // Fetch vocabulary from lesson_vocabulary table
          const { data: vocabData, error: vocabError } = await supabase
            .from('lesson_vocabulary')
            .select('word, translation')
            .eq('lesson_id', lessonData.id)
          
          if (!vocabError && vocabData) {
            vocabulary = vocabData.map(v => v.word)
          } else if (vocabError) {
            console.warn(`Could not fetch vocabulary for lesson ${lessonData.id}:`, vocabError)
            
            // Fallback: Try to extract from slides if vocabulary table fails
            const { data: slidesData } = await supabase
              .from('slides')
              .select(`
                id,
                slide_type,
                metadata,
                slide_elements (
                  id,
                  element_type,
                  content
                )
              `)
              .eq('lesson_id', lessonData.id)
            
            if (slidesData) {
              const slides = slidesData.map((slide: any) => ({
                ...slide,
                slideType: slide.slide_type,
                elements: slide.slide_elements?.map((element: any) => ({
                  ...element,
                  type: element.element_type,
                  content: element.content
                })) || []
              }))
              
              vocabulary = extractVocabularyFromSlides(slides)
              
              // Try to save the extracted vocabulary for next time
              if (vocabulary.length > 0) {
                const vocabToInsert = vocabulary.map(word => ({
                  lesson_id: lessonData.id,
                  word: word
                }))
                
                await supabase
                  .from('lesson_vocabulary')
                  .insert(vocabToInsert)
                  .select()
                  .then(() => {
                    console.log(`Saved ${vocabulary.length} vocabulary words for lesson ${lessonData.id}`)
                  })
                  .catch(err => {
                    console.error('Could not save vocabulary:', err)
                  })
              }
            }
          }
        }
        
        return {
          ...item,
          lesson: lessonData,
          vocabulary
        }
      })
    )
    
    console.log(`Found ${lessonsWithVocab.length} lessons for student ${studentId}`)
    return lessonsWithVocab
  } catch (error) {
    console.error('Failed to get student lessons:', error)
    return []
  }
}

export async function updateLessonProgress(studentId: string, lessonId: string, progress: number) {
  return sessionManager.withSessionCheck(async () => {
    const { data, error } = await supabase
      .from('student_lessons')
      .update({ 
        progress,
        completed_at: progress === 100 ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .match({ student_id: studentId, lesson_id: lessonId })
      .select()
      .single()
    
    if (error) throw error
    return data
  })
}

// =============================================
// VOCABULARY MANAGEMENT
// =============================================

export async function saveLessonVocabulary(lessonId: string, vocabulary: any[]) {
  return sessionManager.withSessionCheck(async () => {
    // Delete existing vocabulary for this lesson
    await supabase
      .from('lesson_vocabulary')
      .delete()
      .eq('lesson_id', lessonId)
    
    // Insert new vocabulary
    if (vocabulary.length > 0) {
      const { data, error } = await supabase
        .from('lesson_vocabulary')
        .insert(
          vocabulary.map(v => ({
            lesson_id: lessonId,
            word: v.word,
            translation: v.translation,
            category: v.category,
            difficulty_level: v.difficulty_level,
            context_sentence: v.context_sentence
          }))
        )
        .select()
      
      if (error) throw error
      
      // Update vocabulary count in lessons table
      await supabase
        .from('lessons')
        .update({ vocabulary_count: vocabulary.length })
        .eq('id', lessonId)
      
      return data
    }
    
    return []
  })
}

export async function getStudentVocabularyHistory(studentId: string, limit = 100) {
  return sessionManager.withSessionCheck(async () => {
    const { data, error } = await supabase
      .from('student_lessons')
      .select(`
        lesson_id,
        lesson:lessons(
          vocabulary:lesson_vocabulary(*)
        )
      `)
      .eq('student_id', studentId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    // Flatten vocabulary from all lessons
    const allVocabulary = data?.flatMap(sl => 
      sl.lesson?.vocabulary || []
    ) || []
    
    // Remove duplicates
    const uniqueVocabulary = Array.from(
      new Map(allVocabulary.map(v => [v.word, v])).values()
    )
    
    return uniqueVocabulary
  })
}

// =============================================
// ENHANCED LESSON CREATION WITH STUDENT CONTEXT
// =============================================

export async function createLessonWithStudentContext(
  presentation: Presentation, 
  slides: Slide[], 
  studentId?: string
) {
  return sessionManager.withSessionCheck(async () => {
    try {
      // Save the lesson (this now includes vocabulary extraction)
      const { lesson, idMapping } = await saveLesson(presentation, slides)
      
      // If student is specified, create association
      if (studentId) {
        // Check if student_lessons table exists
        const { error: tableError } = await supabase
          .from('student_lessons')
          .select('id')
          .limit(0)
        
        if (!tableError || tableError.code !== '42P01') {
          // Table exists, create assignment
          await assignLessonToStudent(studentId, lesson.id)
          
          // Update lesson with student profile ID
          await supabase
            .from('lessons')
            .update({ student_profile_id: studentId })
            .eq('id', lesson.id)
        } else {
          console.warn('student_lessons table does not exist. Skipping student assignment.')
        }
      }
      
      return { lesson, idMapping }
    } catch (error) {
      console.error('Error creating lesson with student context:', error)
      throw error
    }
  })
}

export async function getAllUserLessons() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      console.error('No user found when loading lessons')
      return []
    }
    
    console.log('Fetching lessons for user:', user.id)
    
    const { data, error } = await supabase
      .from('lessons')
      .select('id, title, description, lesson_type, vocabulary_count, created_at, updated_at, target_language')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching user lessons:', error)
      throw error
    }
    
    console.log(`Found ${data?.length || 0} lessons for user`)
    return data || []
  } catch (error) {
    console.error('Failed to get all user lessons:', error)
    throw error
  }
}

// =============================================
// USAGE TRACKING
// =============================================

export async function trackLessonGeneration(userId: string, promptData: any) {
  try {
    console.log('📊 Tracking lesson generation:', {
      userId,
      studentProfileId: promptData.studentProfileId,
      promptLength: promptData.promptText?.length,
      slidesGenerated: promptData.slidesGenerated,
      model: promptData.modelUsed
    })
    
    // Record in prompt history
    const { data, error } = await supabase
      .from('prompt_history')
      .insert({
        user_id: userId,
        student_profile_id: promptData.studentProfileId,
        prompt_text: promptData.promptText,
        genius_mode_used: promptData.geniusModeUsed,
        slides_generated: promptData.slidesGenerated,
        template_types_used: promptData.templateTypesUsed,
        template_order: promptData.templateOrder,
        model_used: promptData.modelUsed,
        generation_time_ms: promptData.generationTimeMs,
      })
      .select()
    
    if (error) {
      console.error('❌ Error inserting into prompt_history:', error)
      throw error
    }
    
    console.log('✅ Successfully tracked prompt in prompt_history:', data)

    // Update usage tracking for current month
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    
    const { data: usageData, error: usageError } = await supabase
      .from('usage_tracking')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        lessons_generated: 1, // This will be incremented by the database
      }, {
        onConflict: 'user_id,month_year',
        ignoreDuplicates: false
      })
      .select()
    
    if (usageError) {
      console.error('❌ Error updating usage_tracking:', usageError)
      // Don't throw for usage tracking errors
    } else {
      console.log('✅ Successfully updated usage tracking:', usageData)
    }

  } catch (error) {
    console.error('❌ Error tracking lesson generation:', error)
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    // Don't throw - this shouldn't block lesson creation
  }
}

export async function getCurrentMonthUsage(userId: string) {
  try {
    // Non-critical operation - skip session validation for performance
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .maybeSingle()

    if (error) {
      console.warn('Usage tracking query failed:', error.message)
      return {
        lessons_generated: 0,
        genius_generations: 0,
        pdf_exports: 0,
        storage_used_mb: 0,
        student_profiles_count: 0
      }
    }

    return data || {
      lessons_generated: 0,
      genius_generations: 0,
      pdf_exports: 0,
      storage_used_mb: 0,
      student_profiles_count: 0
    }
  } catch (error: any) {
    console.warn('Usage tracking not available:', error)
    return {
      lessons_generated: 0,
      genius_generations: 0,
      pdf_exports: 0,
      storage_used_mb: 0,
      student_profiles_count: 0
    }
  }
}
