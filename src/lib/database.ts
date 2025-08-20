// src/lib/database.ts
import { supabase } from './supabase'
import { sessionManager } from './session-manager'
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

      // Save slides with the proper lesson ID
      const savedSlides = []
      for (const slide of slides) {
        const savedSlide = await saveSlide(slide, lesson.id, idMapping)
        savedSlides.push(savedSlide)
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

      console.log('✅ Lesson saved successfully!', {
        lessonId: lesson.id,
        totalSlides: savedSlides.length,
        mappedSlides: Object.keys(idMapping.slides).length,
        mappedElements: Object.keys(idMapping.elements).length
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
// USAGE TRACKING
// =============================================

export async function trackLessonGeneration(userId: string, promptData: any) {
  try {
    // Record in prompt history
    await supabase
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

    // Update usage tracking for current month
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    
    await supabase
      .from('usage_tracking')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        lessons_generated: 1, // This will be incremented by the database
      }, {
        onConflict: 'user_id,month_year',
        ignoreDuplicates: false
      })

  } catch (error) {
    console.error('Error tracking lesson generation:', error)
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
        pdf_exports: 0,
        storage_used_mb: 0,
        student_profiles_count: 0
      }
    }

    return data || {
      lessons_generated: 0,
      pdf_exports: 0,
      storage_used_mb: 0,
      student_profiles_count: 0
    }
  } catch (error: any) {
    console.warn('Usage tracking not available:', error)
    return {
      lessons_generated: 0,
      pdf_exports: 0,
      storage_used_mb: 0,
      student_profiles_count: 0
    }
  }
}
