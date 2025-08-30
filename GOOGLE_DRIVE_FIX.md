# Google Drive Integration Fix

## Problem
The application was trying to access a non-existent `google_drive_tokens` table in Supabase, resulting in a "Cannot coerce the result to a single JSON object" error when attempting to export slides to Google Drive.

## Root Cause
1. The database schema was updated to use `user_addons` table instead of `google_drive_tokens`
2. The Google Drive service was still trying to query the old table
3. Using `.single()` on a query that returns 0 rows causes an error

## Solution Applied

### 1. Updated Google Drive Service (`src/services/googleDrive.ts`)
- **Removed token storage**: No longer stores sensitive tokens in the database
- **Uses OAuth 2.0 implicit flow**: Authenticates via Google popup (more secure)
- **Fixed database queries**: Now uses `user_addons` table with `.maybeSingle()` to handle 0 rows gracefully
- **Tracks connection status**: Records when users connect Google Drive
- **Logs upload history**: Keeps track of files uploaded to Drive

### 2. Database Migration (`supabase/migrations/ensure_google_drive_tables.sql`)
Created a migration that ensures the proper tables exist:
- `user_addons`: Tracks which addons (like Google Drive) are connected
- `google_drive_uploads`: Logs history of uploaded files

## How to Apply the Fix

### Step 1: Run the Database Migration
Execute the migration in your Supabase SQL editor:
```sql
-- Copy and paste the contents of:
-- supabase/migrations/ensure_google_drive_tables.sql
```

### Step 2: Verify Environment Variables
Ensure your `.env.local` file has the Google OAuth credentials:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here  # Optional but recommended
```

### Step 3: Test the Integration
1. Restart your development server
2. Log in to the application
3. Navigate to the Canvas
4. Try exporting slides to Google Drive
5. A Google popup should appear asking for Drive permissions
6. After authorization, the PDF should upload successfully

## Key Changes Made

### Security Improvements
- **No token storage**: Access tokens are only kept in memory during the session
- **Popup-based auth**: Uses Google's recommended OAuth 2.0 implicit flow
- **Automatic re-authentication**: If token expires, user is prompted to re-authenticate

### Error Handling
- **Graceful fallbacks**: Uses `.maybeSingle()` to handle cases where no addon entry exists
- **Better error messages**: Provides clear feedback when authentication fails
- **Non-blocking tracking**: Upload tracking failures don't prevent successful uploads

### Database Structure
```sql
-- user_addons table
user_id: UUID (references auth.users)
addon_name: TEXT ('google_drive')
enabled: BOOLEAN
connected_at: TIMESTAMPTZ
settings: JSONB

-- google_drive_uploads table
user_id: UUID (references auth.users)
drive_file_id: TEXT
file_name: TEXT
mime_type: TEXT
file_size: BIGINT
folder_id: TEXT
uploaded_at: TIMESTAMPTZ
metadata: JSONB
```

## Troubleshooting

### If you still get errors:
1. **Check Supabase tables**: Verify `user_addons` and `google_drive_uploads` tables exist
2. **Check RLS policies**: Ensure Row Level Security policies are properly configured
3. **Clear browser cache**: Sometimes old auth tokens can cause issues
4. **Check console errors**: Look for specific Google API errors
5. **Verify OAuth consent screen**: Ensure your Google Cloud project has the OAuth consent screen configured

### Common Issues:
- **"popup_closed_by_user"**: User closed the Google auth popup - just try again
- **"access_denied"**: User denied permissions - they need to accept Drive access
- **Network errors**: Check internet connection and Google API status

## Future Enhancements
Consider implementing:
- Refresh token handling for long-term access (requires backend)
- Folder selection UI for organizing exports
- Export format options (PDF, images, etc.)
- Batch upload capabilities
- Upload progress indicators
