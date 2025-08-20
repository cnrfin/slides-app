// src/lib/session-manager.ts
import { supabase } from './supabase'
import { AuthError } from '@supabase/supabase-js'

// Session refresh interval (45 minutes - well before the 1-hour expiry)
const SESSION_REFRESH_INTERVAL = 45 * 60 * 1000

// Track refresh timer
let refreshTimer: NodeJS.Timeout | null = null

// Track if we're currently refreshing to avoid concurrent refreshes
let isRefreshing = false

// Track if the session manager is initialized
let isInitialized = false

// Track last refresh time to avoid excessive refreshes
let lastRefreshTime = 0
const MIN_REFRESH_INTERVAL = 10000 // Don't refresh more than once per 10 seconds

/**
 * Enhanced session management with automatic refresh and error recovery
 */
export const sessionManager = {
  /**
   * Initialize session management
   */
  init() {
    // Prevent multiple initializations
    if (isInitialized) {
      console.log('🔐 Session manager already initialized, skipping...')
      return
    }
    
    isInitialized = true
    
    // Start refresh timer
    this.startRefreshTimer()
    
    // Handle visibility change to refresh session when tab becomes active
    // Use a single, properly managed event handler
    this.setupEventHandlers()
    
    console.log('🔐 Session manager initialized')
    
    // Do an immediate session check
    this.checkAndRefreshSession()
  },

  /**
   * Setup event handlers for visibility and online status
   */
  setupEventHandlers() {
    // Remove any existing handlers first
    this.removeEventHandlers()
    
    // Create bound handlers that we can reference for removal
    this.boundHandleVisibilityChange = this.handleVisibilityChange.bind(this)
    this.boundHandleOnline = this.handleOnline.bind(this)
    this.boundHandleFocus = this.handleFocus.bind(this)
    
    document.addEventListener('visibilitychange', this.boundHandleVisibilityChange)
    window.addEventListener('online', this.boundHandleOnline)
    window.addEventListener('focus', this.boundHandleFocus)
    
    console.log('📱 Event handlers setup')
  },

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    if (this.boundHandleVisibilityChange) {
      document.removeEventListener('visibilitychange', this.boundHandleVisibilityChange)
    }
    if (this.boundHandleOnline) {
      window.removeEventListener('online', this.boundHandleOnline)
    }
    if (this.boundHandleFocus) {
      window.removeEventListener('focus', this.boundHandleFocus)
    }
  },

  /**
   * Cleanup session management
   */
  cleanup() {
    console.log('🧹 Cleaning up session manager...')
    
    this.stopRefreshTimer()
    this.removeEventHandlers()
    
    isInitialized = false
    isRefreshing = false
    lastRefreshTime = 0
  },

  /**
   * Start automatic session refresh timer
   */
  startRefreshTimer() {
    this.stopRefreshTimer()
    
    refreshTimer = setInterval(async () => {
      console.log('⏰ Auto-refreshing session...')
      await this.refreshSession()
    }, SESSION_REFRESH_INTERVAL)
  },

  /**
   * Stop refresh timer
   */
  stopRefreshTimer() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  },

  /**
   * Check if enough time has passed since last refresh
   */
  canRefresh(): boolean {
    const now = Date.now()
    if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
      console.log('⏸️ Skipping refresh - too soon since last refresh')
      return false
    }
    return true
  },

  /**
   * Check session and refresh if needed
   */
  async checkAndRefreshSession(): Promise<boolean> {
    // Check if we can refresh (rate limiting)
    if (!this.canRefresh()) {
      return true
    }
    
    try {
      const isValid = await this.isSessionValid()
      if (!isValid) {
        console.log('⚠️ Session invalid, refreshing...')
        return await this.refreshSession()
      }
      return true
    } catch (error) {
      console.error('Error checking session:', error)
      return false
    }
  },

  /**
   * Manually refresh the session
   */
  async refreshSession(): Promise<boolean> {
    // Prevent concurrent refreshes
    if (isRefreshing) {
      console.log('🔄 Refresh already in progress, skipping...')
      return true
    }
    
    // Check rate limiting
    if (!this.canRefresh()) {
      return true
    }
    
    isRefreshing = true
    lastRefreshTime = Date.now()
    
    try {
      console.log('🔄 Refreshing session...')
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('❌ Session refresh failed:', error)
        
        // Check if it's a critical error that requires re-authentication
        if (error.message?.includes('refresh_token') || 
            error.message?.includes('invalid') ||
            error.message?.includes('expired')) {
          this.handleSessionExpired()
          return false
        }
        
        // For network errors, don't expire the session immediately
        if (error.message?.includes('network') || 
            error.message?.includes('fetch')) {
          console.log('📡 Network error during refresh, will retry later')
          return false
        }
        
        return false
      }
      
      if (!session) {
        console.warn('⚠️ No session after refresh')
        return false
      }
      
      console.log('✅ Session refreshed successfully, expires at:', 
        new Date(session.expires_at! * 1000).toLocaleTimeString())
      return true
    } catch (error) {
      console.error('❌ Unexpected error refreshing session:', error)
      return false
    } finally {
      isRefreshing = false
    }
  },

  /**
   * Check if current session is valid
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return false
      }
      
      if (!session) {
        return false
      }
      
      // Check if we have both access token and refresh token
      if (!session.access_token || !session.refresh_token) {
        console.warn('Missing tokens in session')
        return false
      }
      
      // Check if token is about to expire (within 10 minutes)
      const expiresAt = session.expires_at
      if (expiresAt) {
        const expiryTime = expiresAt * 1000
        const timeUntilExpiry = expiryTime - Date.now()
        
        if (timeUntilExpiry < 10 * 60 * 1000) {
          console.log('⚠️ Token expiring soon (', Math.round(timeUntilExpiry / 1000 / 60), 'minutes )')
          return false // This will trigger a refresh
        }
        
        console.log('✅ Session valid, expires in', Math.round(timeUntilExpiry / 1000 / 60), 'minutes')
      }
      
      return true
    } catch (error) {
      console.error('❌ Error checking session validity:', error)
      return false
    }
  },

  /**
   * Handle visibility change - refresh when tab becomes active
   */
  handleVisibilityChange() {
    if (!document.hidden) {
      console.log('👁️ Tab became visible')
      // Non-blocking approach: just trigger a refresh check
      // Don't await - let it run in the background
      setTimeout(() => {
        this.checkAndRefreshSession()
      }, 100)
    }
  },

  /**
   * Handle window focus - additional check for tab switches
   */
  handleFocus() {
    console.log('🎯 Window focused')
    // Non-blocking approach: just trigger a refresh check
    // Don't await - let it run in the background
    setTimeout(() => {
      this.checkAndRefreshSession()
    }, 100)
  },

  /**
   * Handle coming back online
   */
  async handleOnline() {
    console.log('🌐 Back online, checking session...')
    await this.checkAndRefreshSession()
  },

  /**
   * Handle expired session
   */
  handleSessionExpired() {
    console.error('🔒 Session expired, user needs to re-authenticate')
    
    // Emit custom event that the app can listen to
    window.dispatchEvent(new CustomEvent('session:expired'))
    
    // Stop refresh timer
    this.stopRefreshTimer()
  },

  /**
   * Wrap database operations with session check and retry
   */
  async withSessionCheck<T>(
    operation: () => Promise<T>,
    options: { 
      maxRetries?: number,
      onAuthError?: () => void,
      skipValidation?: boolean
    } = {}
  ): Promise<T> {
    const { maxRetries = 2, onAuthError, skipValidation = false } = options
    
    // For non-critical operations, skip validation
    if (!skipValidation) {
      // Ensure session is valid before operation
      const isValid = await this.isSessionValid()
      if (!isValid) {
        const refreshed = await this.refreshSession()
        if (!refreshed) {
          this.handleSessionExpired()
          throw new Error('Session expired. Please sign in again.')
        }
      }
    }
    
    let lastError: any
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error: any) {
        lastError = error
        
        console.log(`Operation error (attempt ${attempt + 1}/${maxRetries + 1}):`, error.message)
        
        // Check if it's an auth error
        const isAuthError = 
          error instanceof AuthError ||
          error?.message?.toLowerCase().includes('auth') ||
          error?.message?.toLowerCase().includes('jwt') ||
          error?.message?.toLowerCase().includes('token') ||
          error?.message?.toLowerCase().includes('expired') ||
          error?.message?.toLowerCase().includes('unauthorized') ||
          error?.status === 401 ||
          error?.status === 403 ||
          error?.code === 'PGRST301' || // JWT expired error from PostgREST
          error?.code === 'PGRST302' || // JWT required error
          (error?.status === 406 && error?.message?.includes('expired'))
        
        if (isAuthError && attempt < maxRetries) {
          console.log(`🔄 Auth error detected, refreshing session...`)
          
          const refreshed = await this.refreshSession()
          if (!refreshed) {
            this.handleSessionExpired()
            if (onAuthError) onAuthError()
            throw new Error('Session expired. Please sign in again.')
          }
          
          // Wait before retry to ensure token propagation
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Continue to next retry
          continue
        }
        
        // Not an auth error or max retries reached
        throw error
      }
    }
    
    // Throw the last error if all retries failed
    throw lastError
  },
  
  // Store bound event handlers
  boundHandleVisibilityChange: null as any,
  boundHandleOnline: null as any,
  boundHandleFocus: null as any
}
