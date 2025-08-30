// src/services/googleDrive.ts
import { supabase } from '@/lib/supabase';

// Load Google API client library dynamically
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

class GoogleDriveService {
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private gapiInited = false;
  private gisInited = false;

  constructor() {
    this.initializeGoogleAPI();
  }

  // Initialize Google API and Identity Services
  private async initializeGoogleAPI() {
    // Load the Google API client library
    await this.loadScript('https://apis.google.com/js/api.js');
    await this.loadScript('https://accounts.google.com/gsi/client');
    
    // Wait for scripts to load
    await new Promise(resolve => {
      window.gapi.load('client', resolve);
    });
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
    
    await window.gapi.client.init({
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '', // Optional, for public data
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    });
    
    this.gapiInited = true;
  }

  // Initialize Google Identity Services
  private initGisClient(callback?: (response: any) => void) {
    if (this.gisInited && this.tokenClient) return;

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
      callback: callback || ((response: any) => {
        if (response.error) {
          console.error('Token error:', response);
          return;
        }
        this.accessToken = response.access_token;
      }),
    });

    this.gisInited = true;
  }

  // Check if user has connected Google Drive
  async isConnected(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_addons')
        .select('*')
        .eq('user_id', userId)
        .eq('addon_name', 'google_drive')
        .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 rows gracefully
      
      if (error) {
        console.error('Error checking Google Drive connection:', error);
        return false;
      }
      
      return data?.enabled || false;
    } catch (error) {
      console.error('Failed to check Google Drive connection:', error);
      return false;
    }
  }

  // Mark Google Drive as connected in database
  private async markAsConnected(userId: string) {
    try {
      const { error } = await supabase
        .from('user_addons')
        .upsert({
          user_id: userId,
          addon_name: 'google_drive',
          enabled: true,
          connected_at: new Date().toISOString(),
          settings: {}
        }, {
          onConflict: 'user_id,addon_name'
        });
      
      if (error) {
        console.error('Error saving Google Drive connection:', error);
      }
    } catch (error) {
      console.error('Failed to mark Google Drive as connected:', error);
    }
  }

  // Request access token using popup flow
  async requestAccessToken(userId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let tokenReceived = false;
      let popupWindow: Window | null = null;
      let checkInterval: NodeJS.Timeout | null = null;

      this.initGisClient(async (response: any) => {
        tokenReceived = true;
        
        // Clear the popup check interval
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
        
        if (response.error) {
          // Check if error is due to popup being closed or user denied access
          if (response.error === 'popup_closed_by_user' || response.error === 'access_denied') {
            reject(new Error('Authentication cancelled by user'));
          } else {
            reject(response.error);
          }
          return;
        }
        this.accessToken = response.access_token;
        
        // Mark as connected in database if userId provided
        if (userId) {
          await this.markAsConnected(userId);
        }
        
        resolve(response.access_token);
      });

      // Override window.open to capture the popup window reference
      const originalOpen = window.open;
      window.open = function(...args) {
        popupWindow = originalOpen.apply(window, args);
        window.open = originalOpen; // Restore original
        
        // Start checking if popup is closed
        if (popupWindow) {
          checkInterval = setInterval(() => {
            if (popupWindow && popupWindow.closed) {
              if (!tokenReceived) {
                // Popup was closed before completing auth
                if (checkInterval) {
                  clearInterval(checkInterval);
                }
                reject(new Error('Authentication cancelled by user'));
              }
            }
          }, 500);
        }
        
        return popupWindow;
      };

      // Request access token
      try {
        this.tokenClient.requestAccessToken({ 
          prompt: ''
        });
      } catch (error) {
        // Restore window.open if request fails
        window.open = originalOpen;
        reject(error);
      }

      // Clean up after 2 minutes (max auth time)
      setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval);
        }
        if (!tokenReceived) {
          reject(new Error('Authentication timeout'));
        }
      }, 120000);
    });
  }

  // Upload file to Google Drive
  async uploadToDrive(userId: string, fileData: Blob, fileName: string, mimeType: string) {
    // Ensure GAPI is initialized
    await this.initGapiClient();

    // Check if user has connected Google Drive before
    const isConnected = await this.isConnected(userId);
    
    // Request access token (will show popup if not connected or token expired)
    try {
      this.accessToken = await this.requestAccessToken(userId);
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw new Error('Failed to authenticate with Google Drive. Please try again.');
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

    // Create form data
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
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Drive upload failed:', errorData);
      throw new Error('Failed to upload file to Google Drive');
    }

    const result = await response.json();

    // Track the upload in database
    try {
      await supabase
        .from('google_drive_uploads')
        .insert({
          user_id: userId,
          drive_file_id: result.id,
          file_name: fileName,
          mime_type: mimeType,
          file_size: fileData.size,
          folder_id: folderId,
          metadata: result
        });
    } catch (error) {
      console.error('Failed to track upload:', error);
      // Don't throw here, the upload succeeded
    }

    return result;
  }

  // Helper to get or create folder
  private async getOrCreateFolder(folderName: string): Promise<string> {
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

  // Disconnect Google Drive
  async disconnect(userId: string) {
    // Revoke access token if available
    if (this.accessToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Failed to revoke token:', error);
      }
    }

    // Update addon status in database
    try {
      const { error } = await supabase
        .from('user_addons')
        .update({ 
          enabled: false,
          connected_at: null 
        })
        .eq('user_id', userId)
        .eq('addon_name', 'google_drive');
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to disconnect Google Drive:', error);
      throw error;
    }

    // Clear local state
    this.accessToken = null;
  }
}

export const googleDriveService = new GoogleDriveService();
