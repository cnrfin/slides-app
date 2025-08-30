// src/components/dashboard/AddonsPageSimple.tsx
// Simplified version using Google Identity Services (no logout issues!)

import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import GoogleDriveIcon from '@/components/ui/GoogleDriveIcon';
import useAuthStore from '@/stores/authStore';
import { addonService } from '@/services/addonService';
import { googleDriveSimpleFixed as googleDriveSimple } from '@/services/googleDriveSimpleFix';
import { toast } from '@/utils/toast';

interface Addon {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  connectedAt?: string | null;
  stats?: {
    totalUploads?: number;
    lastUpload?: string;
  };
}

export default function AddonsPageSimple() {
  const { user } = useAuthStore();
  const [addons, setAddons] = useState<Addon[]>([
    {
      id: 'google-drive',
      name: 'google_drive',
      displayName: 'Google Drive',
      description: 'Save your presentations directly to Google Drive',
      icon: <GoogleDriveIcon className="w-12 h-12" />,
      enabled: false
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    // Check for Google OAuth configuration
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      setConfigError('Google OAuth is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env.local file.');
      setLoading(false);
      return;
    }

    if (user) {
      loadAddonStates();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadAddonStates = async () => {
    if (!user) return;
    
    try {
      // Load addon states from database
      const userAddons = await addonService.getUserAddons(user.id);
      
      // Update addons with actual states
      setAddons(current => 
        current.map(addon => {
          const userAddon = userAddons.find(ua => ua.addon_name === addon.name);
          return {
            ...addon,
            enabled: userAddon?.enabled || false,
            connectedAt: userAddon?.connected_at
          };
        })
      );

      // Load stats for enabled addons
      const enabledAddons = userAddons.filter(ua => ua.enabled);
      for (const userAddon of enabledAddons) {
        try {
          const stats = await addonService.getAddonStats(user.id, userAddon.addon_name);
          if (stats) {
            setAddons(current =>
              current.map(addon =>
                addon.name === userAddon.addon_name
                  ? {
                      ...addon,
                      stats: {
                        totalUploads: stats.total_uploads,
                        lastUpload: stats.last_upload
                      }
                    }
                  : addon
              )
            );
          }
        } catch (error) {
          console.log('Stats not available:', error);
          // Stats view might not exist yet, that's okay
        }
      }
    } catch (error) {
      console.error('Error loading addons:', error);
      // Check if it's a permission error
      if (error?.message?.includes('permission') || error?.code === '42501') {
        toast.error('Database permissions error. Please ensure the migration has been applied.');
        setConfigError('Database tables might not be set up. Please run the migration in Supabase SQL Editor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDriveToggle = async () => {
    if (!user) {
      toast.error('Please sign in to connect Google Drive');
      return;
    }

    if (configError) {
      toast.error('Google OAuth is not configured properly');
      return;
    }
    
    const googleDrive = addons.find(a => a.id === 'google-drive');
    if (!googleDrive) return;

    setConnecting(true);

    try {
      if (!googleDrive.enabled) {
        // Connect Google Drive
        console.log('Connecting Google Drive for user:', user.id);
        const success = await googleDriveSimple.connectGoogleDrive(user.id);
        
        if (success) {
          toast.success('Google Drive connected successfully!');
          await loadAddonStates(); // Reload to show updated status
        } else {
          toast.error('Failed to connect Google Drive. Please ensure popups are allowed and try again.');
        }
      } else {
        // Disconnect Google Drive
        await googleDriveSimple.disconnect(user.id);
        toast.success('Google Drive disconnected');
        await loadAddonStates();
      }
    } catch (error) {
      console.error('Error toggling Google Drive:', error);
      
      // Check for specific error types
      if (error?.message?.includes('permission')) {
        toast.error('Permission denied. Please check database setup.');
      } else if (error?.message?.includes('CLIENT_ID')) {
        toast.error('Google OAuth client ID is missing.');
      } else {
        toast.error('An error occurred. Please check the console for details.');
      }
    } finally {
      setConnecting(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const googleDrive = addons.find(a => a.id === 'google-drive');

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Addons</h1>
        <p className="text-gray-600">Connect external services to enhance your workflow</p>
      </div>

      {/* Configuration Error Alert */}
      {configError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-4xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 mb-1">Configuration Required</h3>
              <p className="text-sm text-red-700">{configError}</p>
              <p className="text-sm text-red-700 mt-2">
                Check the console for more details or refer to the setup documentation.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 max-w-4xl">
        {googleDrive && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              <div>
                {googleDrive.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1">
                  {googleDrive.displayName}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {googleDrive.description}
                </p>
                
                {/* Status */}
                {googleDrive.enabled && (
                  <div className="flex items-center gap-2 text-green-600 mb-3">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                )}
                
                <button
                  onClick={handleGoogleDriveToggle}
                  disabled={connecting || !!configError}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    connecting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : configError
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : googleDrive.enabled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {connecting ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : configError ? (
                    'Unavailable'
                  ) : googleDrive.enabled ? (
                    'Disconnect'
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}