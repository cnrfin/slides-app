// src/hooks/useAddons.ts
import { useState, useEffect } from 'react';
import { addonService } from '@/services/addonService';
import type { UserAddon } from '@/services/addonService';
import useAuthStore from '@/stores/authStore';

export interface AddonStatus {
  googleDriveEnabled: boolean;
  addons: UserAddon[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useAddons(): AddonStatus {
  const { user } = useAuthStore();
  const [addons, setAddons] = useState<UserAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAddons = async () => {
    if (!user) {
      setAddons([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userAddons = await addonService.getUserAddons(user.id);
      setAddons(userAddons);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading addons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddons();
  }, [user]);

  const googleDriveEnabled = addons.some(
    addon => addon.addon_name === 'google_drive' && addon.enabled
  );

  return {
    googleDriveEnabled,
    addons,
    loading,
    error,
    refresh: loadAddons
  };
}

export function useGoogleDriveStatus() {
  const { user } = useAuthStore();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) {
        setEnabled(false);
        setLoading(false);
        return;
      }

      try {
        const isEnabled = await addonService.isGoogleDriveEnabled(user.id);
        setEnabled(isEnabled);
      } catch (error) {
        console.error('Error checking Google Drive status:', error);
        setEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user]);

  return { enabled, loading };
}