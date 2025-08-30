// src/services/googleDriveSecure.ts
// Secure Google Drive service using Google Identity Services (GIS)
// This implementation doesn't expose the client secret in the frontend

import { supabase } from '@/lib/supabase';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

class GoogleDriveSecureService {
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private gapiInited = false;
  private gisInited = false;
  private tokenExpiresAt: number | null = null;

  constructor() {
    this.initializeGoogleAPI();
  }

  // Initialize Google API and Identity Services
  private async initializeGoogleAPI() {
    try {
      // Load the Google API client library
      await this.loadScript('https://apis.google.com/js/api.js');
      await this.loadScript('https://accounts.google.com/gsi/client');
      
      // Wait for GAPI to load
      await new Promise<void>((resolve) => {
        if (window.gapi) {
          window.gapi.load('client', () => resolve());
        } else {
          // Retry if gapi is not ready
          setTimeout(() => this.initializeGoogleAPI(), 100);
        }
      });
    } catch (error) {
      console.error('Failed to initialize Google API:', error);
    }
  }

  // Helper to load external scripts
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  // Initialize GAPI client
  private async initGapiClient() {
    if (this.gapiInited) return;
    
    try {
      await window.gapi.client.init({
        // No API key needed for user-authenticated requests
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      });
      
      this.gapiInited = true;
    } catch (error) {
      console.error('Failed to initialize GAPI client:', error);
      throw error;
    }
  }

  // Initialize Google Identity Services with implicit flow
  private initGisClient(): Promise<TokenResponse> {
    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }

      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: (response: TokenResponse) => {
          if ('error' in response) {
            reject(response);
            return;
          }
          
          // Store token and expiration time
          this.accessToken = response.access_token;
          this.tokenExpiresAt = Date.now() + (response.expires_in * 1000);
          
          // Save token info to localStorage for persistence
          this.saveTokenToStorage(response);
          
          resolve(response);
        },
        error_callback: (error: any) => {
          console.error('Token request error:', error);
          reject(error);
        }
      });

      this.gisInited = true;
    });
  }

  // Save token to localStorage (temporary storage)
  private saveTokenToStorage(token: TokenResponse) {
    const tokenData = {
      access_token: token.access_token,
      expires_at: Date.now() + (token.expires_in * 1000),
      scope: token.scope
    };
    localStorage.setItem('gdrive_token', JSON.stringify(tokenData));
  }

  // Get token from localStorage
  private getTokenFromStorage(): { access_token: string; expires_at: number } | null {
    const stored = localStorage.getItem('gdrive_token');
    if (!stored) return null;
    
    try {
      const data = JSON.parse(stored);
      // Check if token is expired
      if (data.expires_at && data.expires_at < Date.now()) {
        localStorage.removeItem('gdrive_token');
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  // Request access token using popup flow (implicit grant)
  async requestAccessToken(prompt: 'none' | 'consent' | 'select_account' = 'none'): Promise<string> {
    // Check if we have a valid stored token
    const storedToken = this.getTokenFromStorage();
    if (storedToken && prompt === 'none') {
      this.accessToken = storedToken.access_token;
      this.tokenExpiresAt = storedToken.expires_at;
      return storedToken.access_token;
    }

    // Initialize GIS if needed
    if (!this.gisInited) {
      await this.initGisClient();
    }

    return new Promise((resolve, reject) => {
      // Set up one-time callback
      this.tokenClient.callback = (response: TokenResponse) => {
        if ('error' in response) {
          reject(new Error(`Token error: ${(response as any).error}`));
          return;
        }
        
        this.accessToken = response.access_token;
        this.tokenExpiresAt = Date.now() + (response.expires_in * 1000);
        this.saveTokenToStorage(response);
        
        resolve(response.access_token);
      };

      // Request access token
      this.tokenClient.requestAccessToken({ prompt });
    });
  }

  // Check if we have a valid access token
  hasValidToken(): boolean {
    if (!this.accessToken || !this.tokenExpiresAt) {
      // Check localStorage
      const stored = this.getTokenFromStorage();
      if (stored) {
        this.accessToken = stored.access_token;
        this.tokenExpiresAt = stored.expires_at;
        return true;
      }
      return false;
    }
    
    // Check if token is expired (with 5 minute buffer)
    return this.tokenExpiresAt > (Date.now() + 5 * 60 * 1000);
  }

  // Upload file to Google Drive
  async uploadToDrive(fileData: Blob, fileName: string, mimeType: string) {
    // Ensure GAPI is initialized
    await this.initGapiClient();

    // Get or request access token
    if (!this.hasValidToken()) {
      try {
        // Try silent auth first
        await this.requestAccessToken('none');
      } catch {
        // If silent auth fails, prompt user
        await this.requestAccessToken('consent');
      }
    }

    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    // Set the access token for GAPI
    window.gapi.client.setToken({
      access_token: this.accessToken
    });

    // Create folder if it doesn't exist
    const folderName = 'Figma Slides Exports';
    const folderId = await this.getOrCreateFolder(folderName);

    // Create file metadata
    const metadata = {
      name: fileName,
      mimeType: mimeType,
      parents: [folderId]
    };

    // Create form data for multipart upload
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', fileData);

    // Upload file using multipart upload
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: form
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload file to Google Drive: ${error}`);
    }

    const result = await response.json();
    
    // Save upload record to database
    if (result.id) {
      await this.saveUploadRecord(result.id, fileName, mimeType);
    }

    return result;
  }

  // Helper to get or create folder
  private async getOrCreateFolder(folderName: string): Promise<string> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    // Search for existing folder
    const searchResponse = await window.gapi.client.drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (searchResponse.result.files && searchResponse.result.files.length > 0) {
      return searchResponse.result.files[0].id;
    }

    // Create new folder
    const createResponse = await window.gapi.client.drive.files.create({
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id'
    });

    return createResponse.result.id;
  }

  // Save upload record to database
  private async saveUploadRecord(driveFileId: string, fileName: string, mimeType: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase
        .from('google_drive_uploads')
        .insert({
          user_id: user.id,
          drive_file_id: driveFileId,
          file_name: fileName,
          mime_type: mimeType,
          uploaded_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to save upload record:', error);
      // Non-critical error, don't throw
    }
  }

  // Connect Google Drive (initiate OAuth flow)
  async connect(): Promise<boolean> {
    try {
      await this.requestAccessToken('consent');
      
      // Save connection status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_addons')
          .upsert({
            user_id: user.id,
            addon_name: 'google_drive',
            enabled: true,
            connected_at: new Date().toISOString()
          });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to connect Google Drive:', error);
      return false;
    }
  }

  // Disconnect Google Drive
  async disconnect() {
    // Revoke access token if available
    if (this.accessToken) {
      try {
        // Note: This will revoke all app permissions
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Failed to revoke token:', error);
      }
    }

    // Clear local storage
    localStorage.removeItem('gdrive_token');
    
    // Clear local state
    this.accessToken = null;
    this.tokenExpiresAt = null;

    // Update database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_addons')
        .update({ enabled: false })
        .eq('user_id', user.id)
        .eq('addon_name', 'google_drive');
    }
  }

  // Check connection status
  async isConnected(): Promise<boolean> {
    // First check if we have a valid token
    if (this.hasValidToken()) {
      return true;
    }

    // Check database for connection status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('user_addons')
      .select('enabled')
      .eq('user_id', user.id)
      .eq('addon_name', 'google_drive')
      .single();

    return data?.enabled || false;
  }
}

export const googleDriveSecureService = new GoogleDriveSecureService();