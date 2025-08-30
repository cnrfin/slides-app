// src/services/googleOneTapSimple.ts
// Simplified Google One Tap implementation that works with Supabase OAuth
// This version doesn't require a custom backend endpoint

import { googleLogout } from '@react-oauth/google'
import { supabase } from '@/lib/supabase'
import type { CredentialResponse, DecodedGoogleToken } from '@/types/google-oauth.types'

class GoogleOneTapSimpleService {
  private decodeJWT(token: string): DecodedGoogleToken {
    // Decode JWT without verification (for display purposes only)
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  }

  /**
   * Handle Google One Tap response - Simplified version
   * This redirects to Supabase OAuth flow for actual authentication
   */
  async handleOneTapResponse(response: CredentialResponse): Promise<{
    success: boolean
    action: 'redirect' | 'error'
    email?: string
    error?: string
  }> {
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google')
      }

      // Decode the JWT to get user info
      const decoded = this.decodeJWT(response.credential)
      
      // Store the email temporarily to pre-fill forms or show welcome message
      sessionStorage.setItem('google_one_tap_email', decoded.email)
      sessionStorage.setItem('google_one_tap_name', decoded.name || '')
      sessionStorage.setItem('google_one_tap_picture', decoded.picture || '')
      
      // Redirect to Supabase Google OAuth with the user's email as a hint
      // This will skip the account selection step
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'none', // Don't show consent screen if already authorized
            login_hint: decoded.email, // Pre-select the Google account
          },
        }
      })

      if (error) throw error

      return {
        success: true,
        action: 'redirect',
        email: decoded.email
      }
    } catch (error) {
      console.error('One Tap login error:', error)
      return {
        success: false,
        action: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get stored One Tap user info (if any)
   */
  getStoredOneTapInfo() {
    const email = sessionStorage.getItem('google_one_tap_email')
    const name = sessionStorage.getItem('google_one_tap_name')
    const picture = sessionStorage.getItem('google_one_tap_picture')
    
    if (email) {
      return { email, name, picture }
    }
    return null
  }

  /**
   * Clear stored One Tap info
   */
  clearStoredInfo() {
    sessionStorage.removeItem('google_one_tap_email')
    sessionStorage.removeItem('google_one_tap_name')
    sessionStorage.removeItem('google_one_tap_picture')
  }

  /**
   * Sign out and revoke Google One Tap
   */
  async signOut() {
    try {
      // Revoke Google One Tap
      googleLogout()
      
      // Clear stored info
      this.clearStoredInfo()
      
      // Sign out from Supabase
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }
}

export const googleOneTapSimple = new GoogleOneTapSimpleService()
