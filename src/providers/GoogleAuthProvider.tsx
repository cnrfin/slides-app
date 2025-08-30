// src/providers/GoogleAuthProvider.tsx
import { GoogleOAuthProvider } from '@react-oauth/google'
import { PropsWithChildren } from 'react'

interface GoogleAuthProviderProps extends PropsWithChildren {
  clientId?: string
}

export function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  
  if (!clientId) {
    console.warn('Google Client ID not configured. Google One Tap will be disabled.')
    return <>{children}</>
  }
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}
