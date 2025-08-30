// src/components/auth/GoogleDriveCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleDriveAuthService } from '@/services/googleDriveAuth';
import { addonService } from '@/services/addonService';
import useAuthStore from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast';

export default function GoogleDriveCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Handle errors
    if (error) {
      console.error('OAuth error:', error);
      
      // If in popup mode, notify parent
      if (window.opener) {
        window.opener.postMessage({ type: 'google-auth-error', error }, window.location.origin);
        window.close();
        return;
      }
      
      toast.error('Authorization failed: ' + error);
      navigate('/dashboard/addons');
      return;
    }

    if (!code) {
      toast.error('Invalid authorization response');
      navigate('/dashboard/addons');
      return;
    }

    try {
      // Restore session state if available
      if (state) {
        const restoredState = await googleDriveAuthService.restoreSessionState(state);
        console.log('Restored state:', restoredState);
      }

      // Ensure we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session, try to restore it
      if (!session) {
        console.log('No session found, attempting to restore...');
        
        // Check if we're in a popup
        if (window.opener) {
          // Get session from parent window
          window.opener.postMessage({ type: 'get-session' }, window.location.origin);
          
          // Wait for session response
          await new Promise((resolve) => {
            const handler = (event: MessageEvent) => {
              if (event.data.type === 'session-response' && event.data.session) {
                window.removeEventListener('message', handler);
                resolve(event.data.session);
              }
            };
            window.addEventListener('message', handler);
            
            // Timeout after 5 seconds
            setTimeout(() => {
              window.removeEventListener('message', handler);
              resolve(null);
            }, 5000);
          });
        }
        
        // Retry a few times if still no user
        if (!user && retryCount < 3) {
          setRetryCount(retryCount + 1);
          setTimeout(() => handleCallback(), 1000);
          return;
        }
      }

      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        console.error('No authenticated user after restore attempt');
        
        // If in popup, notify parent
        if (window.opener) {
          window.opener.postMessage({ type: 'google-auth-error', error: 'No authenticated user' }, window.location.origin);
          window.close();
          return;
        }
        
        // Store the code in session storage and redirect to login
        sessionStorage.setItem('google_oauth_code', code);
        toast.error('Please sign in to complete Google Drive connection');
        navigate('/login');
        return;
      }

      // Exchange code for tokens
      console.log('Exchanging code for tokens...');
      const tokens = await googleDriveAuthService.getTokens(code);
      
      // Save tokens
      console.log('Saving tokens...');
      await googleDriveAuthService.saveTokens(currentUser.id, tokens);
      
      // Enable the addon
      console.log('Enabling addon...');
      await addonService.enableAddon(currentUser.id, 'google_drive', {
        auth_completed: true,
        connected_email: tokens.email || null
      });

      // If in popup mode, notify parent window
      if (window.opener) {
        window.opener.postMessage({ type: 'google-auth-success' }, window.location.origin);
        window.close();
        return;
      }

      toast.success('Google Drive connected successfully!');
      navigate('/dashboard/addons');
    } catch (error) {
      console.error('Error handling callback:', error);
      
      // If in popup, notify parent
      if (window.opener) {
        window.opener.postMessage({ type: 'google-auth-error', error: error.message }, window.location.origin);
        window.close();
        return;
      }
      
      toast.error('Failed to connect Google Drive. Please try again.');
      navigate('/dashboard/addons');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Connecting to Google Drive...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we complete the connection</p>
        {retryCount > 0 && (
          <p className="text-xs text-gray-400 mt-2">Restoring session... (Attempt {retryCount}/3)</p>
        )}
      </div>
    </div>
  );
}