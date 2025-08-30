# Google OAuth Redirect URI Fix Guide

## Issue
Getting `redirect_uri_mismatch` error when connecting to Google Drive

## Root Causes
1. Vite server runs on `127.0.0.1` but redirect URI uses `localhost`
2. Exact redirect URI must match in Google Cloud Console
3. Multiple OAuth implementations may be conflicting

## Solution 1: Update Vite Configuration (Recommended)

### Step 1: Update vite.config.ts
Change the server host from `127.0.0.1` to `localhost`:

```typescript
// vite.config.ts
export default defineConfig({
  // ... other config
  server: {
    host: 'localhost',  // Changed from '127.0.0.1'
    port: 5173         // Explicitly set port
  },
})
```

### Step 2: Verify .env.local
Ensure your redirect URI matches:

```env
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

### Step 3: Update Google Cloud Console
Add ALL of these redirect URIs to your OAuth 2.0 Client ID:

1. `http://localhost:5173/auth/google/callback`
2. `http://127.0.0.1:5173/auth/google/callback`
3. `http://localhost:5173` (for popup/implicit flow)
4. `http://127.0.0.1:5173` (for popup/implicit flow)

## Solution 2: Use Google Identity Services (Already Implemented)

Your app has a working implementation using Google Identity Services (GIS) in `googleDriveSimple.ts`. This uses popup authentication and doesn't require redirect URIs.

### To use this approach:
1. The `AddonsPageSimple.tsx` already uses this method
2. No redirect URIs needed in Google Cloud Console
3. Only requires the authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`

## Solution 3: Fix Traditional OAuth Flow

If you need to use the traditional OAuth flow with redirects:

### Step 1: Create OAuth Debug Page
Create `test-oauth-config.html` in your project root:

```html
<!DOCTYPE html>
<html>
<head>
    <title>OAuth Config Checker</title>
</head>
<body>
    <h1>OAuth Configuration Check</h1>
    <div id="config"></div>
    <button onclick="testOAuth()">Test OAuth Flow</button>
    
    <script>
        const config = {
            currentURL: window.location.origin,
            configuredRedirect: 'http://localhost:5173/auth/google/callback',
            clientId: '530840260937-mj2gegc043c3tb69geppdq7mpmb9ah3r.apps.googleusercontent.com'
        };
        
        document.getElementById('config').innerHTML = `
            <p><strong>Current Origin:</strong> ${config.currentURL}</p>
            <p><strong>Configured Redirect:</strong> ${config.configuredRedirect}</p>
            <p><strong>Client ID:</strong> ${config.clientId}</p>
            <p style="color: ${config.currentURL === 'http://localhost:5173' ? 'green' : 'red'}">
                ${config.currentURL === 'http://localhost:5173' ? '✅' : '❌'} URLs Match
            </p>
        `;
        
        function testOAuth() {
            const params = new URLSearchParams({
                client_id: config.clientId,
                redirect_uri: config.configuredRedirect,
                response_type: 'code',
                scope: 'https://www.googleapis.com/auth/drive.file',
                access_type: 'offline'
            });
            
            const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
            console.log('OAuth URL:', url);
            window.open(url, '_blank');
        }
    </script>
</body>
</html>
```

### Step 2: Google Cloud Console Settings
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services > Credentials
3. Click on your OAuth 2.0 Client ID
4. Add these exact URIs:

**Authorized JavaScript origins:**
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost`
- `http://127.0.0.1`

**Authorized redirect URIs:**
- `http://localhost:5173/auth/google/callback`
- `http://127.0.0.1:5173/auth/google/callback`

### Step 3: Update Your Code
Ensure consistency in `googleDriveAuth.ts`:

```typescript
async generateAuthUrl(): Promise<string> {
    const stateToken = await this.saveSessionState();
    
    // Use window.location.origin for dynamic redirect URI
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    
    const params = new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,  // Dynamic based on actual origin
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        access_type: 'offline',
        prompt: 'consent',
        state: stateToken
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
```

## Quick Debugging Steps

1. **Check your current access URL:**
   ```bash
   # Open your browser console and type:
   window.location.origin
   ```

2. **Verify environment variables:**
   ```bash
   # In your app, log these values:
   console.log('Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
   console.log('Redirect URI:', import.meta.env.VITE_GOOGLE_REDIRECT_URI);
   ```

3. **Test with curl:**
   ```bash
   curl -I "https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:5173/auth/google/callback&response_type=code&scope=https://www.googleapis.com/auth/drive.file"
   ```

## Recommended Approach

Use the **Google Identity Services (GIS)** implementation that's already working in your `AddonsPageSimple.tsx`. It:
- ✅ Doesn't cause logout issues
- ✅ Uses popup authentication
- ✅ Doesn't require exact redirect URI matching
- ✅ Better user experience

To ensure this works:
1. Only add JavaScript origins (not redirect URIs) in Google Console
2. Use the existing `googleDriveSimple.ts` service
3. The popup flow handles everything automatically

## Common Pitfalls to Avoid

1. **Don't mix** `localhost` and `127.0.0.1` - pick one and use it everywhere
2. **Don't forget** to save changes in Google Cloud Console (they can take a few minutes to propagate)
3. **Don't include** trailing slashes in redirect URIs
4. **Don't forget** the exact path including `/auth/google/callback`
5. **Clear browser cache** after making changes

## Testing Your Fix

After making changes:
1. Clear browser cache and cookies
2. Restart your Vite dev server
3. Access your app via the exact URL you configured (either `localhost` or `127.0.0.1`)
4. Try the OAuth flow again

The error should be resolved!
