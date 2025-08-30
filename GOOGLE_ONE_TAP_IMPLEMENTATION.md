# Google One Tap Authentication Implementation Guide

## Overview
This implementation provides Google One Tap sign-in/login functionality for your Figma Slides app, integrated with your existing Supabase authentication system.

## Features
- ✅ Seamless One Tap login for returning users
- ✅ Automatic sign-in prompts on the login page
- ✅ Fallback to traditional Google OAuth when needed
- ✅ Integration with existing Supabase auth system
- ✅ Support for Google Drive and other Google API scopes
- ✅ Clean separation of concerns with services and hooks

## Architecture

### 1. **Provider Layer** (`src/providers/GoogleAuthProvider.tsx`)
- Wraps the app with Google OAuth Provider
- Provides Google Identity Services context to all components

### 2. **Service Layer** (`src/services/googleAuthService.ts`)
- Handles Google One Tap authentication logic
- Manages token verification and user session creation
- Integrates with Supabase for user management
- Provides methods for checking Google API access

### 3. **Hook Layer** (`src/hooks/useGoogleOneTap.tsx`)
- Custom React hook for managing One Tap state
- Handles auto-prompt timing and user preferences
- Provides loading states and error handling

### 4. **Component Layer** (`src/components/auth/GoogleOneTap.tsx`)
- Reusable component for Google One Tap UI
- Supports both automatic prompts and button fallback
- Customizable for different contexts (signin/signup)

## Setup Instructions

### 1. Environment Configuration
Ensure your `.env.local` file has the following:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Google Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project or create a new one
3. Enable Google Identity Services API
4. Configure OAuth 2.0 credentials:
   - Add `http://localhost:5173` to Authorized JavaScript origins
   - Add `http://localhost:5173/auth/google/callback` to Authorized redirect URIs
   - For production, add your production domain

### 3. Supabase Configuration
1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google Client ID and Secret
4. Configure redirect URLs to match your app

### 4. Backend Implementation (Required)
The Google One Tap flow requires backend verification for security. Implement the endpoint shown in `src/api/auth/google-one-tap.example.ts`:

#### Option A: Supabase Edge Functions
```typescript
// supabase/functions/google-one-tap/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { OAuth2Client } from 'npm:google-auth-library'
import { createClient } from 'npm:@supabase/supabase-js'

serve(async (req) => {
  // Implementation from google-one-tap.example.ts
})
```

#### Option B: Express.js Backend
```javascript
// server.js
const express = require('express')
const { OAuth2Client } = require('google-auth-library')
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(express.json())

app.post('/api/auth/google-one-tap', async (req, res) => {
  // Implementation from google-one-tap.example.ts
})
```

## Usage Examples

### Basic Implementation (Login Page)
```tsx
import { GoogleOneTap } from '@/components/auth/GoogleOneTap'

function LoginPage() {
  return (
    <GoogleOneTap
      showButton={true}
      context="signin"
      autoPrompt={true}
      promptDelay={1500}
      onSuccess={(user) => {
        console.log('User signed in:', user)
      }}
      onError={(error) => {
        console.error('Login failed:', error)
      }}
    />
  )
}
```

### Manual Trigger
```tsx
import { useGoogleOneTap } from '@/hooks/useGoogleOneTap'

function MyComponent() {
  const { triggerOneTap, isOneTapLoading } = useGoogleOneTap({
    auto: false, // Don't auto-prompt
  })

  return (
    <button onClick={triggerOneTap}>
      Sign in with Google
    </button>
  )
}
```

### Checking Google Drive Access
```tsx
import { googleAuthService } from '@/services/googleAuthService'

async function checkDriveAccess() {
  const hasAccess = await googleAuthService.checkGoogleDriveAccess()
  
  if (!hasAccess) {
    // Request additional scopes
    await googleAuthService.requestAdditionalScopes([
      'https://www.googleapis.com/auth/drive.file'
    ])
  }
}
```

## Integration with Google Drive

The One Tap authentication seamlessly integrates with your existing Google Drive functionality:

1. **Initial Sign-in**: Users sign in with Google One Tap
2. **Scope Check**: When accessing Google Drive features, check if user has granted Drive permissions
3. **Additional Authorization**: If needed, request additional scopes using the popup flow
4. **Token Management**: Tokens are stored in Supabase and managed by `googleDriveAuthService`

## Security Considerations

1. **Token Verification**: Always verify Google ID tokens on the backend
2. **HTTPS Only**: Use HTTPS in production for secure token transmission
3. **CSRF Protection**: Implement CSRF tokens for state management
4. **Session Management**: Use Supabase's built-in session management
5. **Scope Limitation**: Only request necessary Google API scopes

## Troubleshooting

### One Tap Not Showing
- Check if Google Client ID is correctly configured
- Verify domain is added to Google Console authorized origins
- Check browser console for errors
- Ensure cookies are enabled (One Tap requires cookies)

### Authentication Fails
- Verify backend endpoint is correctly implemented
- Check Supabase configuration for Google provider
- Ensure user email is verified in Google account
- Check network requests for error messages

### Session Issues
- Clear browser storage and cookies
- Check Supabase session expiration settings
- Verify refresh token handling
- Ensure proper logout with `googleLogout()`

## Best Practices

1. **User Experience**
   - Show One Tap only on sign-in, not sign-up pages
   - Provide fallback options if One Tap fails
   - Use appropriate delay before showing prompt (1-2 seconds)

2. **Performance**
   - Lazy load Google Identity Services library
   - Cache user preferences for auto-prompt
   - Minimize authentication redirects

3. **Accessibility**
   - Provide keyboard navigation support
   - Include proper ARIA labels
   - Offer alternative authentication methods

## Migration from Existing Auth

Your current authentication flow remains unchanged. Google One Tap is an enhancement that:
- Works alongside existing Google OAuth through Supabase
- Falls back to traditional flow when needed
- Maintains same user sessions and profiles
- Preserves all existing functionality

## Next Steps

1. Implement the backend verification endpoint
2. Test One Tap flow in development
3. Configure production domains in Google Console
4. Monitor authentication analytics
5. Gather user feedback on the experience

## Support Resources

- [Google One Tap Documentation](https://developers.google.com/identity/gsi/web/guides/display-google-one-tap)
- [React OAuth Google Library](https://github.com/MomenSherif/react-oauth)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google Identity Services Migration](https://developers.google.com/identity/gsi/web/guides/migration)
