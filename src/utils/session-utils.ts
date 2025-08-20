// src/utils/session-utils.ts
import { supabase } from '@/lib/supabase'

/**
 * Clear any stale session data from localStorage
 */
export function clearStaleSessionData() {
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage)
    
    // Find and remove any stale Supabase tokens
    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth-token')) {
        const value = localStorage.getItem(key)
        if (value) {
          try {
            const parsed = JSON.parse(value)
            // Check if it's a session object with an expiry
            if (parsed.expires_at || parsed.expiresAt) {
              const expiryTime = (parsed.expires_at || parsed.expiresAt) * 1000
              if (Date.now() > expiryTime) {
                console.log(`🧹 Clearing stale session data for key: ${key}`)
                localStorage.removeItem(key)
              }
            }
          } catch {
            // If we can't parse it, it might be corrupted
            console.log(`🧹 Clearing potentially corrupted session data for key: ${key}`)
            localStorage.removeItem(key)
          }
        }
      }
    })
  } catch (error) {
    console.error('Error clearing stale session data:', error)
  }
}

/**
 * Force a complete session refresh
 */
export async function forceSessionRefresh() {
  try {
    console.log('🔄 Forcing complete session refresh...')
    
    // Clear any stale data first
    clearStaleSessionData()
    
    // Get the current session
    const { data: { session }, error: getError } = await supabase.auth.getSession()
    
    if (getError) {
      console.error('Error getting session for refresh:', getError)
      return null
    }
    
    if (!session) {
      console.log('No session to refresh')
      return null
    }
    
    // Force a refresh
    const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession()
    
    if (refreshError) {
      console.error('Error refreshing session:', refreshError)
      
      // If refresh failed, try to sign out cleanly
      if (refreshError.message?.includes('refresh_token') || 
          refreshError.message?.includes('invalid')) {
        await supabase.auth.signOut()
      }
      
      return null
    }
    
    console.log('✅ Session refreshed successfully')
    return newSession
  } catch (error) {
    console.error('Unexpected error during force refresh:', error)
    return null
  }
}

/**
 * Check if we're in a browser environment
 */
export function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * Get session expiry time in human-readable format
 */
export function getSessionExpiryTime(session: any): string {
  if (!session?.expires_at) return 'Unknown'
  
  const expiryTime = session.expires_at * 1000
  const now = Date.now()
  const timeLeft = expiryTime - now
  
  if (timeLeft <= 0) return 'Expired'
  
  const minutes = Math.floor(timeLeft / 1000 / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  
  return `${minutes}m`
}

/**
 * Debug helper to log session state
 */
export async function debugSessionState() {
  if (process.env.NODE_ENV !== 'development') return
  
  console.group('🔍 Session Debug Info')
  
  try {
    // Check Supabase session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
    } else if (session) {
      console.log('Session exists:', {
        userId: session.user?.id,
        email: session.user?.email,
        expiresIn: getSessionExpiryTime(session),
        hasAccessToken: !!session.access_token,
        hasRefreshToken: !!session.refresh_token
      })
    } else {
      console.log('No active session')
    }
    
    // Check localStorage
    const storageKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || key.includes('auth')
    )
    
    console.log('Auth-related localStorage keys:', storageKeys)
    
  } catch (error) {
    console.error('Debug error:', error)
  }
  
  console.groupEnd()
}
