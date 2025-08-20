// src/components/auth/AuthGuard.tsx
import { useEffect, useState, useRef } from 'react'
import useAuthStore from '@/stores/authStore'
import LoginPage from './LoginPage'
import { supabase } from '@/lib/supabase'
import { sessionManager } from '@/lib/session-manager'
import { toast } from '@/utils/toast'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, isInitialized, initialize, signOut } = useAuthStore()
  const [isHandlingCallback, setIsHandlingCallback] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)
  const sessionManagerInitialized = useRef(false)

  useEffect(() => {
    // Handle auth callback from OAuth providers
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const hasAuthParams = urlParams.has('code') || urlParams.has('access_token') || urlParams.has('refresh_token')
      
      if (hasAuthParams) {
        setIsHandlingCallback(true)
        try {
          const { data, error } = await supabase.auth.getSession()
          if (error) {
            console.error('Auth callback error:', error)
          }
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (error) {
          console.error('Auth callback error:', error)
        } finally {
          setIsHandlingCallback(false)
        }
      }
    }

    const initializeAuth = async () => {
      if (!isInitialized) {
        setIsInitializing(true)
        await initialize()
        await handleAuthCallback()
        setIsInitializing(false)
      } else {
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [isInitialized, initialize])

  // Initialize session manager ONCE when user is authenticated
  useEffect(() => {
    if (user && !isLoading && !isInitializing) {
      // Only initialize once per user session
      if (!sessionManagerInitialized.current) {
        console.log('🚀 Initializing session manager for user:', user.email)
        // Make session manager init non-blocking
        setTimeout(() => {
          sessionManager.init()
        }, 0)
        sessionManagerInitialized.current = true
      }
      
      // Reset session expired state when user logs in
      setSessionExpired(false)
    } else if (!user && sessionManagerInitialized.current) {
      // User logged out, cleanup session manager
      console.log('🧹 User logged out, cleaning up session manager')
      sessionManager.cleanup()
      sessionManagerInitialized.current = false
    }
  }, [user, isLoading, isInitializing])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionManagerInitialized.current) {
        console.log('🧹 Component unmounting, cleaning up session manager')
        sessionManager.cleanup()
        sessionManagerInitialized.current = false
      }
    }
  }, [])

  // Listen for session expiry events
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('🔒 Session expired event received')
      setSessionExpired(true)
      
      // Show toast notification
      toast.error('Your session has expired. Please sign in again.', {
        duration: 5000,
        action: {
          label: 'Sign In',
          onClick: () => {
            // Force sign out to clear any stale data
            signOut()
          }
        }
      })
    }

    const handleAuthError = (event: CustomEvent) => {
      console.log('⚠️ Auth error event received:', event.detail)
      toast.error(event.detail.message || 'Authentication error occurred', {
        duration: 4000
      })
    }

    window.addEventListener('session:expired', handleSessionExpired)
    window.addEventListener('auth:error', handleAuthError as EventListener)
    
    return () => {
      window.removeEventListener('session:expired', handleSessionExpired)
      window.removeEventListener('auth:error', handleAuthError as EventListener)
    }
  }, [signOut])

  // Monitor network status and show helpful messages
  useEffect(() => {
    const handleOffline = () => {
      toast.warning('You are offline. Some features may not work.', {
        duration: 4000
      })
    }

    const handleOnline = () => {
      toast.success('Back online!', {
        duration: 2000
      })
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  // Show session expired screen
  if (sessionExpired && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-yellow-500 mb-4">
              <svg className="h-full w-full" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Expired</h2>
            <p className="text-gray-600 mb-6">
              Your session has expired for security reasons. Please sign in again to continue.
            </p>
            <button
              onClick={() => {
                setSessionExpired(false)
                signOut()
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show callback loading screen
  if (isHandlingCallback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
          <p className="text-gray-600">Please wait while we sign you in.</p>
        </div>
      </div>
    )
  }

  // Show loading spinner while checking authentication
  if (!isInitialized || isLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />
  }

  // Show main app if authenticated
  return <>{children}</>
}
