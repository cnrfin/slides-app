# Google One Tap - Quick Start Guide

## 🚀 Quick Implementation (5 minutes)

This guide shows you how to implement Google One Tap authentication in your Figma Slides app using the **simplified approach** that works with your existing Supabase OAuth setup.

## How It Works

1. User clicks "Sign in with Google" or sees the One Tap prompt
2. Google returns a JWT token with user info
3. We decode the token and redirect to Supabase OAuth with the user's email pre-selected
4. Supabase handles the actual authentication and session creation
5. User is redirected to the dashboard

## Implementation Steps

### Step 1: Verify Environment Variables
Make sure your `.env.local` has:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Step 2: The Code is Already Added!
I've already added all the necessary files to your project:

- ✅ `src/providers/GoogleAuthProvider.tsx` - Wraps your app with Google OAuth context
- ✅ `src/services/googleOneTapSimple.ts` - Handles One Tap authentication
- ✅ `src/hooks/useGoogleOneTap.tsx` - React hook for One Tap functionality
- ✅ `src/components/auth/GoogleOneTap.tsx` - Reusable One Tap component
- ✅ Updated `AppRouter.tsx` - Added Google Auth Provider wrapper
- ✅ Updated `LoginPage.tsx` - Integrated One Tap on login page

### Step 3: Test It Out

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `/login` in your browser

3. You should see:
   - A Google sign-in button
   - After 1.5 seconds, a One Tap prompt in the top-right corner (if not already signed in)

### Step 4: Configure Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Add to **Authorized JavaScript origins**:
   - `http://localhost:5173` (for development)
   - Your production domain (when deploying)

## Features Included

### 🎯 Auto-Prompt on Login Page
The One Tap prompt automatically appears after 1.5 seconds on the login page for returning users.

### 🔄 Seamless Integration with Supabase
Works with your existing Supabase Google OAuth configuration - no backend changes needed!

### 📱 Smart Fallback
If One Tap fails or is dismissed, users can still use the regular Google sign-in button.

### 🔐 Secure Session Management
Sessions are managed by Supabase, maintaining your existing security model.

### 🎨 Customizable UI
The Google sign-in button adapts to your design and supports both light and dark themes.

## Advanced Features

### Using One Tap in Other Components
```tsx
import { useGoogleOneTap } from '@/hooks/useGoogleOneTap'

function MyComponent() {
  const { triggerOneTap } = useGoogleOneTap({
    auto: false, // Manual trigger only
  })

  return (
    <button onClick={triggerOneTap}>
      Quick Sign In
    </button>
  )
}
```

### Customizing the Prompt Delay
```tsx
<GoogleOneTap
  autoPrompt={true}
  promptDelay={3000} // Wait 3 seconds before showing
  context="signin"
/>
```

### Handling Sign-Out
The sign-out function automatically revokes One Tap sessions:
```tsx
import { googleOneTapSimple } from '@/services/googleOneTapSimple'

async function handleSignOut() {
  await googleOneTapSimple.signOut()
  // User is signed out from both Google One Tap and Supabase
}
```

## Google Drive Integration

Your existing Google Drive functionality continues to work seamlessly:

1. User signs in with One Tap
2. When they access Google Drive features, you check for Drive permissions
3. If additional scopes are needed, use your existing `googleDriveAuthService`

```tsx
import { googleDriveAuthService } from '@/services/googleDriveAuth'

// Request Google Drive access when needed
async function enableGoogleDrive() {
  const success = await googleDriveAuthService.authenticateWithPopup()
  if (success) {
    // User has granted Drive access
  }
}
```

## Troubleshooting

### One Tap Not Appearing
- **Check Console**: Look for errors in browser console
- **Verify Client ID**: Ensure `VITE_GOOGLE_CLIENT_ID` is set correctly
- **Domain Configuration**: Add your domain to Google Console authorized origins
- **Browser Settings**: Ensure third-party cookies are enabled

### Sign-In Redirects But Fails
- **Supabase Configuration**: Verify Google provider is enabled in Supabase
- **Redirect URLs**: Check that redirect URLs match in both Google Console and Supabase

### "Popup Blocked" Errors
- One Tap doesn't use popups, but the fallback might
- Ensure popup blockers allow your domain

## Production Deployment

When deploying to production:

1. **Update Google Console**:
   - Add production domain to Authorized JavaScript origins
   - Add `https://yourdomain.com/auth/google/callback` to redirect URIs

2. **Update Environment Variables**:
   - Set production Google Client ID
   - Ensure Supabase URLs are production values

3. **Enable HTTPS**:
   - Google One Tap requires HTTPS in production
   - Use services like Vercel, Netlify, or Cloudflare that provide automatic HTTPS

## Benefits of This Implementation

✅ **No Backend Required**: Works with existing Supabase OAuth
✅ **Quick Setup**: Implementation in under 5 minutes
✅ **User-Friendly**: Reduces friction for sign-in
✅ **Secure**: Leverages Google's and Supabase's security
✅ **Maintainable**: Clean separation of concerns
✅ **Extensible**: Easy to add more OAuth providers

## Next Steps

1. **Test the Implementation**: Try signing in with different Google accounts
2. **Customize the Experience**: Adjust timing and placement of One Tap
3. **Monitor Analytics**: Track conversion rates with One Tap vs traditional sign-in
4. **Gather Feedback**: Ask users about their sign-in experience

## Support

If you encounter any issues:
1. Check the browser console for detailed error messages
2. Review the [Google One Tap Documentation](https://developers.google.com/identity/gsi/web/guides/display-google-one-tap)
3. Verify your Supabase and Google Console configurations
4. Check the implementation files for inline documentation

The implementation is designed to be plug-and-play with your existing setup. Happy coding! 🎉
