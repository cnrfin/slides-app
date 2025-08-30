// src/components/dashboard/AddonsPageSecure.tsx
// Secure implementation of the Addons page using Google Identity Services

import { useState, useEffect } from 'react';
import { Package, Check, ExternalLink, AlertCircle } from 'lucide-react';
import GoogleDriveIcon from '@/components/ui/GoogleDriveIcon';
import useAuthStore from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { googleDriveSecureService } from '@/services/googleDriveSecure';
import { toast } from '@/utils/toast';

interface Addon {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  status?: 'connected' | 'disconnected' | 'pending';
}

export default function AddonsPageSecure() {
  const { user } = useAuthStore();
  const [addons, setAddons] = useState<Addon[]>([
    {
      id: 'google-drive',
      name: 'google_drive',
      displayName: 'Google Drive',
      description: 'Save your presentations directly to Google Drive',
      icon: <GoogleDriveIcon className="w-5 h-5" />,
      enabled: false,
      status: 'disconnected'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadAddonStates();
  }, [user]);

  const loadAddonStates = async () => {
    if (!user) return;
    
    try {
      // Check connection status
      const isConnected = await googleDriveSecureService.isConnected();
      
      // Load addon states from database
      const { data } = await supabase
        .from('user_addons')
        .select('*')
        .eq('user_id', user.id);

      if (data) {
        setAddons(current => 
          current.map(addon => {
            const userAddon = data.find(ua => ua.addon_name === addon.name);
            return {
              ...addon,
              enabled: userAddon?.enabled || false,
              status: addon.name === 'google_drive' 
                ? (isConnected ? 'connected' : 'disconnected')
                : addon.status
            };
          })
        );
      } else {
        // Update status based on connection check
        setAddons(current =>
          current.map(addon =>
            addon.name === 'google_drive'
              ? { ...addon, status: isConnected ? 'connected' : 'disconnected' }
              : addon
          )
        );
      }
    } catch (error) {
      console.error('Error loading addons:', error);
      toast.error('Failed to load addon states');
    } finally {
      setLoading(false);
    }
  };

  const toggleAddon = async (addon: Addon) => {
    if (!user) {
      toast.error('Please log in to manage addons');
      return;
    }

    if (addon.name === 'google_drive') {
      if (addon.status === 'connected') {
        // Disconnect
        try {
          setConnecting(true);
          await googleDriveSecureService.disconnect();
          
          setAddons(current =>
            current.map(a =>
              a.id === addon.id 
                ? { ...a, enabled: false, status: 'disconnected' } 
                : a
            )
          );
          
          toast.success('Google Drive disconnected');
        } catch (error) {
          console.error('Error disconnecting Google Drive:', error);
          toast.error('Failed to disconnect Google Drive');
        } finally {
          setConnecting(false);
        }
      } else {
        // Connect
        try {
          setConnecting(true);
          const connected = await googleDriveSecureService.connect();
          
          if (connected) {
            setAddons(current =>
              current.map(a =>
                a.id === addon.id 
                  ? { ...a, enabled: true, status: 'connected' } 
                  : a
              )
            );
            
            toast.success('Google Drive connected successfully!');
          } else {
            toast.error('Failed to connect Google Drive');
          }
        } catch (error) {
          console.error('Error connecting Google Drive:', error);
          toast.error('Failed to connect Google Drive. Please try again.');
        } finally {
          setConnecting(false);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Addons</h1>
        <p className="text-gray-600">Connect external services to enhance your workflow</p>
      </div>

      {/* Info Alert */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3 max-w-3xl">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Secure Connection</p>
          <p>This addon uses Google's secure OAuth 2.0 authentication. Your credentials are never stored in our app.</p>
        </div>
      </div>
      
      <div className="grid gap-4 max-w-3xl">
        {addons.map(addon => (
          <div
            key={addon.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className={`p-3 rounded-lg ${
                  addon.status === 'connected' 
                    ? 'bg-gradient-to-br from-green-50 to-green-100' 
                    : 'bg-gradient-to-br from-blue-50 to-blue-100'
                }`}>
                  {addon.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-1">
                    {addon.displayName}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {addon.description}
                  </p>
                  {addon.status === 'connected' && (
                    <div className="flex items-center gap-2 mt-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Connected</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => toggleAddon(addon)}
                disabled={connecting}
                className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                  connecting 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : addon.status === 'connected'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {connecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Processing...
                  </>
                ) : addon.status === 'connected' ? (
                  'Disconnect'
                ) : (
                  <>
                    Connect
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg max-w-3xl">
        <h3 className="font-medium text-sm text-gray-700 mb-3">Google Drive Features</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Export presentations directly to your Google Drive</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Automatic organization in "Figma Slides Exports" folder</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Secure OAuth 2.0 authentication</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>No passwords stored - uses Google's secure token system</span>
          </li>
        </ul>
      </div>

      {/* Privacy Notice */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg max-w-3xl">
        <h3 className="font-medium text-sm text-gray-700 mb-2">Privacy & Security</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Your Google credentials are never stored in our application</li>
          <li>• We only request permission to create and manage files we create</li>
          <li>• You can revoke access at any time from your Google Account settings</li>
          <li>• All data transmission is encrypted using industry-standard protocols</li>
        </ul>
      </div>
    </div>
  );
}