// src/services/addonService.ts
import { supabase } from '@/lib/supabase';

// Type definitions
export interface UserAddon {
  id: string;
  user_id: string;
  addon_name: string;
  enabled: boolean;
  connected_at: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GoogleDriveUpload {
  id: string;
  user_id: string;
  drive_file_id: string;
  file_name: string;
  mime_type: string | null;
  file_size: number | null;
  folder_id: string | null;
  uploaded_at: string;
  metadata: Record<string, any>;
}

class AddonService {
  /**
   * Get all addons for a user
   */
  async getUserAddons(userId: string): Promise<UserAddon[]> {
    const { data, error } = await supabase
      .from('user_addons')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user addons:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a specific addon for a user
   */
  async getUserAddon(userId: string, addonName: string): Promise<UserAddon | null> {
    const { data, error } = await supabase
      .from('user_addons')
      .select('*')
      .eq('user_id', userId)
      .eq('addon_name', addonName)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user addon:', error);
      throw error;
    }

    return data;
  }

  /**
   * Enable/Connect an addon for a user
   */
  async enableAddon(
    userId: string, 
    addonName: string, 
    settings: Record<string, any> = {}
  ): Promise<UserAddon> {
    const { data, error } = await supabase
      .from('user_addons')
      .upsert(
        {
          user_id: userId,
          addon_name: addonName,
          enabled: true,
          connected_at: new Date().toISOString(),
          settings
        },
        {
          onConflict: 'user_id,addon_name',
          ignoreDuplicates: false
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error enabling addon:', error);
      throw error;
    }

    // Emit event to notify UI components
    window.dispatchEvent(new CustomEvent('addons:updated', { 
      detail: { action: 'enabled', addonName } 
    }));

    return data;
  }

  /**
   * Disable/Disconnect an addon for a user
   */
  async disableAddon(userId: string, addonName: string): Promise<void> {
    const { error } = await supabase
      .from('user_addons')
      .update({
        enabled: false,
        connected_at: null
      })
      .eq('user_id', userId)
      .eq('addon_name', addonName);

    if (error) {
      console.error('Error disabling addon:', error);
      throw error;
    }

    // Emit event to notify UI components
    window.dispatchEvent(new CustomEvent('addons:updated', { 
      detail: { action: 'disabled', addonName } 
    }));
  }

  /**
   * Update addon settings
   */
  async updateAddonSettings(
    userId: string,
    addonName: string,
    settings: Record<string, any>
  ): Promise<UserAddon> {
    const { data, error } = await supabase
      .from('user_addons')
      .update({ settings })
      .eq('user_id', userId)
      .eq('addon_name', addonName)
      .select()
      .single();

    if (error) {
      console.error('Error updating addon settings:', error);
      throw error;
    }

    return data;
  }

  /**
   * Check if Google Drive addon is enabled for a user
   */
  async isGoogleDriveEnabled(userId: string): Promise<boolean> {
    const addon = await this.getUserAddon(userId, 'google_drive');
    return addon?.enabled || false;
  }

  /**
   * Record a Google Drive upload
   */
  async recordGoogleDriveUpload(
    userId: string,
    uploadData: {
      drive_file_id: string;
      file_name: string;
      mime_type?: string;
      file_size?: number;
      folder_id?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<GoogleDriveUpload> {
    const { data, error } = await supabase
      .from('google_drive_uploads')
      .insert({
        user_id: userId,
        ...uploadData
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording Google Drive upload:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get Google Drive upload history for a user
   */
  async getGoogleDriveUploads(
    userId: string,
    limit: number = 50
  ): Promise<GoogleDriveUpload[]> {
    const { data, error } = await supabase
      .from('google_drive_uploads')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching Google Drive uploads:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get addon stats from the connected_addons view
   */
  async getAddonStats(userId: string, addonName: string) {
    const { data, error } = await supabase
      .from('connected_addons')
      .select('*')
      .eq('user_id', userId)
      .eq('addon_name', addonName)
      .maybeSingle();

    if (error) {
      console.error('Error fetching addon stats:', error);
      throw error;
    }

    return data;
  }
}

// Create and export the service instance
export const addonService = new AddonService();

// Default export for convenience
export default addonService;