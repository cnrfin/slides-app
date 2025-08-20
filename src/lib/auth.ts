// src/lib/auth.ts
import { supabase } from './supabase'

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}`
    }
  })
  
  if (error) throw error
  return data
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName
      }
    }
  })
  
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function initializeUserProfile(user: any) {
  try {
    // Try to get existing profile - use direct Supabase call to avoid session manager blocking
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      // If profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Error creating user profile:', createError)
        throw createError
      }
      return newProfile
    }
    
    return data
  } catch (error) {
    console.error('Error initializing user profile:', error)
    throw error
  }
}

// Get the initial session
export async function getInitialSession() {
  try {
    // First try to get the session
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error getting initial session:', error)
      throw error
    }
    
    if (session?.user) {
      console.log('🔍 Found session, checking validity...')
      
      // Check if the session is expired
      const expiresAt = session.expires_at
      if (expiresAt) {
        const expiryTime = expiresAt * 1000
        const isExpired = Date.now() > expiryTime
        
        if (isExpired) {
          console.log('⚠️ Session expired, attempting refresh...')
          // Try to refresh the session
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
          
          if (refreshError || !refreshedSession) {
            console.error('Failed to refresh expired session:', refreshError)
            // Clear the invalid session
            await supabase.auth.signOut()
            return { user: null, profile: null }
          }
          
          console.log('✅ Session refreshed successfully')
          // Use the refreshed session
          const profile = await initializeUserProfile(refreshedSession.user)
          return { user: refreshedSession.user, profile }
        }
      }
      
      // Session is valid, proceed normally
      const profile = await initializeUserProfile(session.user)
      return { user: session.user, profile }
    }
    
    return { user: null, profile: null }
  } catch (error) {
    console.error('Error getting initial session:', error)
    return { user: null, profile: null }
  }
}

// Listen for auth state changes
export function onAuthStateChange(callback: (user: any, profile: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change event:', event)
    
    // CRITICAL: Use setTimeout to make this non-blocking
    // This prevents Supabase operations from hanging when switching tabs
    // See: https://github.com/nuxt-modules/supabase/issues/273
    setTimeout(async () => {
      if (session?.user) {
        try {
          const profile = await initializeUserProfile(session.user)
          callback(session.user, profile)
        } catch (error) {
          console.error('Error initializing user profile:', error)
          callback(session.user, null)
        }
      } else {
        callback(null, null)
      }
    }, 0)
  })
}
