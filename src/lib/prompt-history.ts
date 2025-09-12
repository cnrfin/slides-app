// src/lib/prompt-history.ts
import { supabase } from './supabase'

export interface PromptHistoryItem {
  id?: string
  user_id: string
  prompt: string
  prompt_text?: string  // Support both field names for backward compatibility
  created_at?: string
  student_profile_id?: string
  genius_mode_used?: boolean
  slides_generated?: number
  template_types_used?: string[]
  template_order?: string[]
  model_used?: string
  generation_time_ms?: number
}

export async function savePromptToHistory(userId: string, prompt: string) {
  try {
    const { data, error } = await supabase
      .from('prompt_history')
      .insert([
        {
          user_id: userId,
          prompt_text: prompt.trim()  // Changed from 'prompt' to 'prompt_text'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error saving prompt to history:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error saving prompt to history:', error)
    return { success: false, error }
  }
}

export async function getPromptHistory(userId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('prompt_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching prompt history:', error)
      return { success: false, error, data: [] }
    }

    // Transform the data to ensure consistent field naming
    // Map 'prompt_text' to 'prompt' for backward compatibility
    const transformedData = (data || []).map(item => ({
      ...item,
      prompt: item.prompt_text || item.prompt || ''  // Use prompt_text if available, fallback to prompt
    }))

    return { success: true, data: transformedData }
  } catch (error) {
    console.error('Error fetching prompt history:', error)
    return { success: false, error, data: [] }
  }
}

export async function deletePromptFromHistory(promptId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('prompt_history')
      .delete()
      .eq('id', promptId)
      .eq('user_id', userId) // Ensure user owns the prompt

    if (error) {
      console.error('Error deleting prompt from history:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting prompt from history:', error)
    return { success: false, error }
  }
}
