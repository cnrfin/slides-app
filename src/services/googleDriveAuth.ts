// src/services/googleDriveAuth.ts
import { supabase } from '@/lib/supabase';
import { addonService } from '@/services/addonService';

// State management for OAuth flow
const GOOGLE_OAUTH_STATE_KEY = 'google_oauth_state';
const SUPABASE_SESSION_KEY = 'supabase.auth.token';

interface OAuthState {
  userId: string;
  returnUrl: string;
  timestamp: number;
}

class GoogleDriveAuthService {
  /**
   * Save current session state before OAuth redirect
   */
  async saveSessionState(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session to preserve');
    }

    // Create state object
    const state: OAuthState = {
      userId: session.user.id,
      returnUrl: window.location.pathname,
      timestamp: Date.now()
    };

    // Generate state token
    const stateToken = btoa(JSON.stringify(state));
    
    // Save to sessionStorage (survives page reload but not tab close)
    sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, stateToken);
    
    // Also save the current Supabase session
    const currentSession = localStorage.getItem(SUPABASE_SESSION_KEY);
    if (currentSession) {
      sessionStorage.setItem(`${SUPABASE_SESSION_KEY}_backup`, currentSession);
    }

    return stateToken;
  }

  /**
   * Restore session state after OAuth callback
   */
  async restoreSessionState(stateToken: string): Promise<OAuthState | null> {
    try {
      // Decode state
      const stateJson = atob(stateToken);
      const state: OAuthState = JSON.parse(stateJson);

      // Verify state is recent (within 10 minutes)
      if (Date.now() - state.timestamp > 10 * 60 * 1000) {
        console.warn('OAuth state expired');
        return null;
      }

      // Restore Supabase session if needed
      const backupSession = sessionStorage.getItem(`${SUPABASE_SESSION_KEY}_backup`);
      if (backupSession && !localStorage.getItem(SUPABASE_SESSION_KEY)) {
        localStorage.setItem(SUPABASE_SESSION_KEY, backupSession);
        
        // Force Supabase to reload the session
        await supabase.auth.getSession();
      }

      // Clean up
      sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
      sessionStorage.removeItem(`${SUPABASE_SESSION_KEY}_backup`);

      return state;
    } catch (error) {
      console.error('Failed to restore session state:', error);
      return null;
    }
  }

  /**
   * Generate OAuth URL with state parameter
   */
  async generateAuthUrl(): Promise<string> {
    // Save current session state
    const stateToken = await this.saveSessionState();

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
      access_type: 'offline',
      prompt: 'consent',
      state: stateToken // Include state for session preservation
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Open OAuth in popup window instead of redirect
   */
  async authenticateWithPopup(): Promise<boolean> {
    return new Promise((resolve) => {
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const authUrl = import.meta.env.VITE_GOOGLE_CLIENT_ID 
        ? this.generateAuthUrl() 
        : '';

      // Open popup
      const popup = window.open(
        '',
        'google-auth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );

      if (!popup) {
        console.error('Popup blocked');
        resolve(false);
        return;
      }

      // Load auth URL after popup is ready
      authUrl.then(url => {
        if (popup && !popup.closed) {
          popup.location.href = url;
        }
      });

      // Listen for messages from popup
      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'google-auth-success') {
          window.removeEventListener('message', messageHandler);
          
          // Close popup
          if (popup && !popup.closed) {
            popup.close();
          }

          // Update addon status
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await addonService.enableAddon(user.id, 'google_drive', {
              auth_completed: true,
              auth_method: 'popup'
            });
          }

          resolve(true);
        } else if (event.data.type === 'google-auth-error') {
          window.removeEventListener('message', messageHandler);
          
          // Close popup
          if (popup && !popup.closed) {
            popup.close();
          }

          resolve(false);
        }
      };

      window.addEventListener('message', messageHandler);

      // Check if popup is closed periodically
      const checkClosed = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          resolve(false);
        }
      }, 1000);
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
        redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for tokens: ${error}`);
    }

    return await response.json();
  }

  /**
   * Save tokens to database (preserving session)
   */
  async saveTokens(userId: string, tokens: any) {
    // Create a new Supabase client to ensure we have the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session when saving tokens');
    }

    const { error } = await supabase
      .from('google_drive_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        expiry_date: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : null,
        scope: tokens.scope
      });
    
    if (error) throw error;
  }
}

export const googleDriveAuthService = new GoogleDriveAuthService();