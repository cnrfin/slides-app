// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase URL:', supabaseUrl)
console.log('🔧 Supabase Key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-8) : 'MISSING')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce',
    debug: true, // Enable debug mode to see auth flow details
  },
  global: {
    headers: {
      'x-client-info': 'figma-slides-app'
    }
  }
})

// Handle OAuth redirects
if (typeof window !== 'undefined') {
  // Check if we're coming back from an OAuth redirect
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const accessToken = hashParams.get('access_token')
  
  if (accessToken) {
    console.log('🔐 OAuth redirect detected, processing authentication...')
    
    // The Supabase client will automatically handle the tokens
    // But we can ensure the auth state is refreshed
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session) {
        console.log('✅ OAuth authentication successful:', session.user.email)
        
        // Clear the hash from the URL
        window.history.replaceState(null, '', window.location.pathname)
        
        // If we're on the login page, redirect to dashboard
        if (window.location.pathname === '/login' || window.location.pathname === '/') {
          window.location.href = '/dashboard'
        }
      } else if (error) {
        console.error('❌ OAuth authentication failed:', error)
      }
    })
  }
}

console.log('✅ Supabase client created successfully')
