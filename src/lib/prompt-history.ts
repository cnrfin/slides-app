// src/lib/prompt-history.ts
import { supabase } from './supabase'

export interface PromptHistoryItem {
  id?: string
  user_id: string
  prompt: string
  created_at?: string
}

export async function savePromptToHistory(userId: string, prompt: string) {
  try {
    const { data, error } = await supabase
      .from('prompt_history')
      .insert([
        {
          user_id: userId,
          prompt: prompt.trim()
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

    return { success: true, data: data || [] }
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
