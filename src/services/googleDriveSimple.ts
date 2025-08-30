// src/services/googleDriveSimple.ts
// Simplified Google Drive service using Google Identity Services (GIS)
// This approach uses implicit flow with popup, preventing logout issues

import { supabase } from '@/lib/supabase';
import { addonService } from '@/services/addonService';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

class GoogleDriveSimpleService {
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private gapiInited = false;
  private gisInited = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Don't auto-initialize, wait for user action
  }

  private async initializeGoogle(): Promise<void> {
    // If already initializing, return the existing promise
    if (this.initPromise) {
      return this.initPromise;
    }

    // If already initialized, return immediately
    if (this.gapiInited && this.gisInited) {
      return Promise.resolve();
    }

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('🔧 Initializing Google services...');
      
      // Load Google Identity Services first
      await this.loadScript('https://accounts.google.com/gsi/client');
      console.log('✅ Google Identity Services loaded');
      
      // Load Google API client
      await this.loadScript('https://apis.google.com/js/api.js');
      console.log('✅ Google API script loaded');
      
      // Wait for gapi to be available
      await this.waitForGapi();
      console.log('✅ GAPI is available');
      
      // Initialize GAPI client
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client', {
          callback: async () => {
            try {
              await window.gapi.client.init({
                apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
              });
              this.gapiInited = true;
              console.log('✅ GAPI client initialized');
              resolve();
            } catch (error) {
              console.error('Failed to initialize GAPI client:', error);
              reject(error);
            }
          },
          onerror: () => {
            reject(new Error('Failed to load GAPI client'));
          }
        });
      });

      // Initialize GIS token client
      this.initGisClient();
      this.gisInited = true;
      console.log('✅ Google services initialization complete');
      
    } catch (error) {
      console.error('Failed to initialize Google services:', error);
      this.initPromise = null; // Reset so it can be retried
      throw error;
    }
  }

  private async waitForGapi(maxAttempts = 50): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      if (window.gapi) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('GAPI failed to load after timeout');
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        // Script tag exists, but we need to ensure it's loaded
        if (src.includes('api.js') && window.gapi) {
          resolve();
          return;
        } else if (src.includes('gsi/client') && window.google) {
          resolve();
          return;
        }
        // Script tag exists but not loaded yet, wait for it
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error(`Failed to load: ${src}`)));
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log(`✅ Script loaded: ${src}`);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`❌ Failed to load script: ${src}`);
        reject(new Error(`Failed to load: ${src}`));
      };
      
      document.head.appendChild(script);
    });
  }

  private initGisClient(): void {
    if (!window.google?.accounts?.oauth2) {
      throw new Error('Google Identity Services not loaded');
    }

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
      callback: '', // Will be set during connection
    });
  }

  /**
   * Connect Google Drive using popup (no logout!)
   */
  async connectGoogleDrive(userId: string): Promise<boolean> {
    try {
      // Ensure Google services are initialized
      await this.initializeGoogle();
      
      return new Promise((resolve) => {
        // Update token client with callback
        this.tokenClient.callback = async (response: any) => {
          if (response.error) {
            console.error('OAuth error:', response.error);
            resolve(false);
            return;
          }

          try {
            // Store the access token
            this.accessToken = response.access_token;
            console.log('✅ Access token received');

            // Save connection info to database
            await this.saveTokenInfo(userId, response);
            
            // Enable the addon
            await addonService.enableAddon(userId, 'google_drive', {
              auth_completed: true,
              auth_method: 'gis_popup',
              token_expires_in: response.expires_in
            });

            console.log('✅ Google Drive connected successfully');
            resolve(true);
          } catch (error) {
            console.error('Failed to save connection:', error);
            resolve(false);
          }
        };

        // Request access token (opens popup)
        console.log('🔐 Requesting access token...');
        this.tokenClient.requestAccessToken({
          prompt: '', // Empty = only show consent if needed
        });
      });
    } catch (error) {
      console.error('Failed to connect Google Drive:', error);
      return false;
    }
  }

  /**
   * Save token info (not the actual token for security)
   */
  private async saveTokenInfo(userId: string, tokenResponse: any) {
    const { data, error } = await supabase
      .from('user_addons')
      .upsert(
        {
          user_id: userId,
          addon_name: 'google_drive',
          enabled: true,
          connected_at: new Date().toISOString(),
          settings: {
            token_expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
            scope: tokenResponse.scope,
            auth_method: 'gis_popup'
          }
        },
        {
          onConflict: 'user_id,addon_name',
          ignoreDuplicates: false
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Check if user has valid connection
   */
  async isConnected(userId: string): Promise<boolean> {
    try {
      const addon = await addonService.getUserAddon(userId, 'google_drive');
      if (!addon || !addon.enabled) return false;

      // Check if token is expired
      const expiresAt = addon.settings?.token_expires_at;
      if (expiresAt && new Date(expiresAt) < new Date()) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(
    userId: string, 
    file: Blob, 
    fileName: string, 
    mimeType: string
  ): Promise<any> {
    // Ensure Google services are initialized
    await this.initializeGoogle();

    // Check if we have a valid token
    if (!this.accessToken) {
      console.log('No access token, requesting new one...');
      // Try to get a new token
      const connected = await this.connectGoogleDrive(userId);
      if (!connected) {
        throw new Error('Failed to connect to Google Drive');
      }
    }

    // Set the access token for GAPI
    window.gapi.client.setToken({
      access_token: this.accessToken
    });

    try {
      // Get or create folder
      const folderId = await this.getOrCreateFolder('Figma Slides Exports');

      // Upload file
      const metadata = {
        name: fileName,
        mimeType: mimeType,
        parents: [folderId]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: form
      });

      if (!response.ok) {
        // Token might be expired, try to reconnect
        if (response.status === 401) {
          console.log('Token expired, reconnecting...');
          this.accessToken = null;
          const connected = await this.connectGoogleDrive(userId);
          if (connected) {
            // Retry upload
            return this.uploadFile(userId, file, fileName, mimeType);
          }
        }
        throw new Error('Failed to upload file');
      }

      const result = await response.json();

      // Record upload in database
      await addonService.recordGoogleDriveUpload(userId, {
        drive_file_id: result.id,
        file_name: fileName,
        mime_type: mimeType,
        file_size: file.size,
        folder_id: folderId
      });

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Get or create a folder in Google Drive
   */
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

  /**
   * Disconnect Google Drive
   */
  async disconnect(userId: string) {
    // Revoke token if we have one
    if (this.accessToken) {
      try {
        if (this.tokenClient?.revoke) {
          this.tokenClient.revoke(this.accessToken);
        } else {
          // Fallback to manual revoke
          await fetch(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`, {
            method: 'POST',
          });
        }
      } catch (error) {
        console.error('Failed to revoke token:', error);
      }
    }

    // Disable addon in database
    await addonService.disableAddon(userId, 'google_drive');

    // Clear local state
    this.accessToken = null;
  }
}

// Export singleton instance
export const googleDriveSimple = new GoogleDriveSimpleService();