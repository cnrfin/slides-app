// src/components/auth/LoginPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import { Palette, Wand2, Users } from 'lucide-react'
import { GoogleOneTap } from './GoogleOneTap'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, isLoading, isInitialized } = useAuthStore()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')

  // Check for auth errors from redirect
  useEffect(() => {
    const state = location.state as { error?: string } | null
    if (state?.error) {
      setError(state.error)
    }
  }, [location])

  // Redirect to dashboard if already logged in (only after initialization)
  useEffect(() => {
    if (isInitialized && user) {
      console.log('User already logged in, redirecting to dashboard...')
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate, isInitialized])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName)
      } else {
        await signInWithEmail(email, password)
      }
      // Navigation will be handled by the useEffect above when user state updates
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(error.message || 'Authentication failed')
    }
  }

  const handleGoogleAuth = async () => {
    setError('')
    try {
      await signInWithGoogle()
      // The OAuth redirect will handle navigation
    } catch (error: any) {
      console.error('Google auth error:', error)
      setError(error.message || 'Google authentication failed')
    }
  }

  // Show loading spinner while checking auth state
  if (!isInitialized || (isInitialized && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex-col justify-center text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-60 right-32 w-24 h-24 border-2 border-white rounded-lg rotate-45"></div>
          <div className="absolute bottom-32 left-40 w-28 h-28 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white rounded-lg p-3">
              <Palette className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Slides App</h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Create Engaging<br />
            Language Lessons<br />
            in Minutes
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Powered by AI to help language tutors design beautiful, 
            interactive lesson materials faster than ever.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-2">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">AI-Powered Generation</div>
                <div className="text-blue-100 text-sm">Generate complete lessons from simple prompts</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-2">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Student-Centered Design</div>
                <div className="text-blue-100 text-sm">Customize for individual learning needs</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-2">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Professional Templates</div>
                <div className="text-blue-100 text-sm">Beautiful, ready-to-use lesson formats</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <Palette className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Slides App</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Start creating amazing language lessons today' 
                : 'Sign in to continue creating lessons'
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In with One Tap */}
          <GoogleOneTap
            showButton={true}
            context={isSignUp ? 'signup' : 'signin'}
            autoPrompt={!isSignUp} // Only auto-prompt for sign-in
            promptDelay={1500} // Show One Tap after 1.5 seconds
            onSuccess={() => {
              // Navigation will be handled by the auth store
              console.log('Google One Tap success')
            }}
            onError={(error) => {
              setError(error)
            }}
            className="mb-6"
          />
          
          {/* Fallback for traditional Google OAuth if One Tap fails */}
          {error && error.includes('One Tap') && (
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 mb-6 font-medium text-sm"
            >
              Try traditional Google sign-in
            </button>
          )}

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setEmail('')
                setPassword('')
                setDisplayName('')
              }}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  )
}
