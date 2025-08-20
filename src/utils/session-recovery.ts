// src/utils/session-recovery.ts
import { supabase } from '@/lib/supabase'

/**
 * Ensures a valid session exists before executing database operations
 * This fixes issues with session persistence when switching tabs
 */
export async function ensureValidSession() {
  try {
    // First, try to get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      // Try to refresh the session
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession()
      
      if (refreshError) {
        throw new Error('Failed to refresh session')
      }
      
      return refreshedSession
    }
    
    // Check if session exists and is valid
    if (!session) {
      throw new Error('No active session')
    }
    
    // Check if the session is about to expire (within 5 minutes)
    const expiresAt = session.expires_at
    if (expiresAt) {
      const expiryTime = expiresAt * 1000
      const timeUntilExpiry = expiryTime - Date.now()
      
      if (timeUntilExpiry < 5 * 60 * 1000) { // Less than 5 minutes
        console.log('Session expiring soon, refreshing...')
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession()
        
        if (refreshError) {
          throw new Error('Failed to refresh expiring session')
        }
        
        return refreshedSession
      }
    }
    
    return session
  } catch (error) {
    console.error('Session validation failed:', error)
    throw error
  }
}

/**
 * Wraps a database operation with session recovery
 * Automatically retries the operation if it fails due to auth issues
 */
export async function withSessionRecovery<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    onError?: (error: any) => void
  } = {}
): Promise<T> {
  const { maxRetries = 3, onError } = options
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Ensure we have a valid session before the operation
      await ensureValidSession()
      
      // Execute the operation
      return await operation()
    } catch (error: any) {
      console.error(`Operation failed (attempt ${attempt}/${maxRetries}):`, error)
      
      // Check if it's an auth-related error
      const isAuthError = 
        error?.message?.toLowerCase().includes('auth') ||
        error?.message?.toLowerCase().includes('jwt') ||
        error?.message?.toLowerCase().includes('token') ||
        error?.message?.toLowerCase().includes('session') ||
        error?.status === 401 ||
        error?.status === 403
      
      if (isAuthError && attempt < maxRetries) {
        console.log('Auth error detected, attempting session recovery...')
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 500 * attempt))
        
        try {
          // Try to refresh the session
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            console.error('Session refresh failed:', refreshError)
          }
        } catch (refreshError) {
          console.error('Session refresh error:', refreshError)
        }
        
        // Continue to next retry
        continue
      }
      
      // Not an auth error or max retries reached
      if (onError) {
        onError(error)
      }
      throw error
    }
  }
  
  // Should never reach here, but TypeScript needs this
  throw new Error('Max retries exceeded')
}
