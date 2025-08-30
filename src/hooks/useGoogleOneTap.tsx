// src/hooks/useGoogleOneTap.tsx
import { useEffect, useState, useCallback } from 'react'
import { useGoogleOneTapLogin } from '@react-oauth/google'
import useAuthStore from '@/stores/authStore'
import { googleOneTapSimple } from '@/services/googleOneTapSimple'
import { toast } from '@/utils/toast'
import type { CredentialResponse } from '@/types/google-oauth.types'

interface UseGoogleOneTapOptions {
  auto?: boolean // Auto-prompt on mount
  delay?: number // Delay before showing prompt (ms)
  disabled?: boolean // Disable One Tap
  context?: 'signin' | 'signup' | 'use' // Google's context hint
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
}

export function useGoogleOneTap({
  auto = true,
  delay = 2000,
  disabled = false,
  context = 'signin',
  onSuccess,
  onError
}: UseGoogleOneTapOptions = {}) {
  const { user, isLoading, setUser, setProfile } = useAuthStore()
  const [isOneTapLoading, setIsOneTapLoading] = useState(false)
  const [hasPrompted, setHasPrompted] = useState(false)

  const handleSuccess = useCallback(async (credentialResponse: CredentialResponse) => {
    setIsOneTapLoading(true)
    
    try {
      const result = await googleOneTapSimple.handleOneTapResponse(credentialResponse)
      
      if (result.success) {
        if (result.action === 'redirect') {
          // Show a message before redirect
          toast.success(`Signing in as ${result.email}...`)
          // The actual sign-in will complete after redirect
        }
        onSuccess?.(result)
      } else {
        throw new Error(result.error || 'Authentication failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in'
      console.error('Google One Tap error:', error)
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsOneTapLoading(false)
    }
  }, [onSuccess, onError])

  const handleError = useCallback(() => {
    console.log('Google One Tap failed or was dismissed')
    onError?.('One Tap sign-in was cancelled or failed')
  }, [onError])

  // Configure Google One Tap
  useGoogleOneTapLogin({
    onSuccess: handleSuccess,
    onError: handleError,
    disabled: disabled || !!user || isLoading || hasPrompted,
    context,
    auto_select: false, // Don't auto-select account
    cancel_on_tap_outside: false, // Keep prompt visible
    use_federated_login_hint: true, // Use browser's saved credentials
    itp_support: true, // Support for Intelligent Tracking Prevention
  })

  // Auto-prompt logic
  useEffect(() => {
    if (auto && !user && !isLoading && !disabled && !hasPrompted) {
      const timer = setTimeout(() => {
        setHasPrompted(true)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [auto, user, isLoading, disabled, hasPrompted, delay])

  // Manual trigger function
  const triggerOneTap = useCallback(() => {
    if (!user && !isLoading && !disabled) {
      setHasPrompted(true)
      // Force re-render to trigger One Tap
      window.google?.accounts?.id?.prompt()
    }
  }, [user, isLoading, disabled])

  return {
    isOneTapLoading,
    triggerOneTap,
    hasPrompted,
    resetPrompt: () => setHasPrompted(false)
  }
}
