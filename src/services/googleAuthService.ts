// src/services/googleAuthService.ts
import { googleLogout } from '@react-oauth/google'
import { supabase } from '@/lib/supabase'
import { initializeUserProfile } from '@/lib/auth'
import type { CredentialResponse, DecodedGoogleToken } from '@/types/google-oauth.types'

class GoogleAuthService {
  private decodeJWT(token: string): DecodedGoogleToken {
    // Decode JWT without verification (verification should be done server-side)
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
   * Handle Google One Tap login response
   */
  async handleOneTapResponse(response: CredentialResponse): Promise<{
    success: boolean
    user?: any
    error?: string
  }> {
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google')
      }

      // Decode the JWT to get user info
      const decoded = this.decodeJWT(response.credential)

      // Check if user exists in Supabase
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', decoded.email)
        .single()

      if (existingUser) {
        // User exists, sign them in with Supabase
        // We'll use the Google OAuth flow to maintain session consistency
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            skipBrowserRedirect: true, // Important: Don't redirect
            queryParams: {
              access_type: 'offline',
              prompt: 'none', // Don't show consent screen again
            },
          }
        })

        if (error) throw error

        // If using popup flow is not working, we can create a custom session
        // This requires backend support for verifying Google tokens
        return await this.createCustomSession(decoded)
      } else {
        // New user - create account
        return await this.createNewUserFromGoogle(decoded)
      }
    } catch (error) {
      console.error('One Tap login error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Create a custom session for Google One Tap users
   * This requires backend support for token verification
   */
  private async createCustomSession(decoded: DecodedGoogleToken) {
    try {
      // Call your backend endpoint to verify the Google token and create a Supabase session
      const response = await fetch('/api/auth/google-one-tap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: decoded,
          provider: 'google-one-tap'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to authenticate with backend')
      }

      const { session, user } = await response.json()

      // Set the Supabase session
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      })

      // Initialize user profile
      const profile = await initializeUserProfile(user)

      return {
        success: true,
        user: { ...user, profile }
      }
    } catch (error) {
      // Fallback to regular OAuth flow
      return this.fallbackToOAuth()
    }
  }

  /**
   * Create a new user from Google One Tap
   */
  private async createNewUserFromGoogle(decoded: DecodedGoogleToken) {
    try {
      // For new users, we should use the regular OAuth flow to properly create the account
      // One Tap doesn't provide refresh tokens on first sign-in
      return this.fallbackToOAuth()
    } catch (error) {
      console.error('Failed to create new user:', error)
      return {
        success: false,
        error: 'Failed to create account'
      }
    }
  }

  /**
   * Fallback to regular OAuth flow when One Tap can't complete
   */
  private async fallbackToOAuth() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      user: null // Will be set after redirect
    }
  }

  /**
   * Sign out and revoke Google One Tap
   */
  async signOut() {
    try {
      // Revoke Google One Tap
      googleLogout()
      
      // Sign out from Supabase
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  /**
   * Check if user has granted specific Google API scopes
   */
  async checkGoogleDriveAccess(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // Check if user has Google Drive tokens stored
      const { data: tokens } = await supabase
        .from('google_drive_tokens')
        .select('access_token, expiry_date')
        .eq('user_id', user.id)
        .single()

      if (!tokens) return false

      // Check if token is still valid
      if (tokens.expiry_date && new Date(tokens.expiry_date) < new Date()) {
        return false
      }

      return true
    } catch (error) {
      console.error('Error checking Google Drive access:', error)
      return false
    }
  }

  /**
   * Request additional Google API scopes
   */
  async requestAdditionalScopes(scopes: string[]): Promise<boolean> {
    try {
      // This will use the existing googleDriveAuthService
      const { googleDriveAuthService } = await import('./googleDriveAuth')
      return await googleDriveAuthService.authenticateWithPopup()
    } catch (error) {
      console.error('Failed to request additional scopes:', error)
      return false
    }
  }
}

export const googleAuthService = new GoogleAuthService()
