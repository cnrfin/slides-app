// src/components/auth/GoogleOneTap.tsx
import { useEffect } from 'react'
import { useGoogleOneTap } from '@/hooks/useGoogleOneTap'
import { GoogleLogin } from '@react-oauth/google'
import { googleOneTapSimple } from '@/services/googleOneTapSimple'
import { toast } from '@/utils/toast'

interface GoogleOneTapProps {
  showButton?: boolean // Show fallback button
  buttonText?: string
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
  context?: 'signin' | 'signup' | 'use'
  autoPrompt?: boolean
  promptDelay?: number
  className?: string
}

export function GoogleOneTap({
  showButton = false,
  buttonText = 'Continue with Google',
  onSuccess,
  onError,
  context = 'signin',
  autoPrompt = true,
  promptDelay = 2000,
  className = ''
}: GoogleOneTapProps) {
  const { isOneTapLoading, triggerOneTap } = useGoogleOneTap({
    auto: autoPrompt,
    delay: promptDelay,
    context,
    onSuccess,
    onError
  })

  // Handle button click success
  const handleButtonSuccess = async (credentialResponse: any) => {
    try {
      const result = await googleOneTapSimple.handleOneTapResponse(credentialResponse)
      
      if (result.success) {
        if (result.action === 'redirect') {
          // Show a brief message before redirect
          toast.success(`Signing in as ${result.email}...`)
        }
        onSuccess?.(result)
      } else {
        throw new Error(result.error || 'Authentication failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in'
      console.error('Google login error:', error)
      toast.error(errorMessage)
      onError?.(errorMessage)
    }
  }

  if (!showButton) {
    return null // One Tap UI is rendered automatically by the hook
  }

  return (
    <div className={className}>
      {isOneTapLoading ? (
        <div className="flex items-center justify-center py-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-600">Signing in...</span>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleButtonSuccess}
          onError={() => {
            console.error('Google login failed')
            onError?.('Google sign-in failed')
          }}
          useOneTap={false} // We're handling One Tap separately
          text={context === 'signup' ? 'signup_with' : 'signin_with'}
          shape="rectangular"
          theme="outline"
          size="large"
          width="100%"
        />
      )}
    </div>
  )
}
