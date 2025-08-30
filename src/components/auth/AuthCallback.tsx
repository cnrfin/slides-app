// src/components/auth/AuthCallback.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        
        // If there's an error in the URL, handle it
        const error = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')
        
        if (error) {
          console.error('OAuth error:', error, errorDescription)
          navigate('/login', { 
            replace: true,
            state: { error: errorDescription || 'Authentication failed' }
          })
          return
        }
        
        // Check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          navigate('/login', { 
            replace: true,
            state: { error: 'Failed to establish session' }
          })
          return
        }

        if (session?.user) {
          console.log('✅ OAuth successful, user:', session.user.email)
          
          // Ensure the auth store is updated
          // The onAuthStateChange listener should handle this, but we'll ensure it happens
          await new Promise(resolve => setTimeout(resolve, 100)) // Small delay for state update
          
          // Navigate to dashboard
          navigate('/dashboard', { replace: true })
        } else {
          console.error('No session found after OAuth callback')
          navigate('/login', { 
            replace: true,
            state: { error: 'No session found' }
          })
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/login', { 
          replace: true,
          state: { error: 'Authentication callback failed' }
        })
      }
    }

    handleAuthCallback()
  }, [navigate, setUser])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we authenticate you.</p>
      </div>
    </div>
  )
}
