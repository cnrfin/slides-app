// src/components/dashboard/AddonsPageSimple.tsx
// Simplified version using Google Identity Services (no logout issues!)

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  AlertCircle, 
  Plus, 
  Link2, 
  Unlink,
  Upload,
  Calendar,
  ExternalLink,
  Shield,
  Sparkles,
  ChevronRight
} from 'lucide-react';
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
  features?: string[];
  category?: string;
}

// Custom placeholder addon icons
const SlackIcon = () => (
  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  </div>
);

const CalendarIcon = () => (
  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
    <Calendar className="w-7 h-7 text-white" strokeWidth={1.5} />
  </div>
);

export default function AddonsPageSimple() {
  const { user } = useAuthStore();
  const [addons, setAddons] = useState<Addon[]>([
    {
      id: 'google-drive',
      name: 'google_drive',
      displayName: 'Google Drive',
      description: 'Save your presentations directly to Google Drive',
      icon: <GoogleDriveIcon className="w-12 h-12" />,
      enabled: false,
      features: ['Auto-sync lessons', 'Cloud backup', 'Share with students'],
      category: 'storage'
    },
    {
      id: 'slack',
      name: 'slack',
      displayName: 'Slack',
      description: 'Get notifications and share lessons in Slack',
      icon: <SlackIcon />,
      enabled: false,
      features: ['Real-time notifications', 'Team collaboration', 'Direct sharing'],
      category: 'communication'
    },
    {
      id: 'google-calendar',
      name: 'google_calendar',
      displayName: 'Google Calendar',
      description: 'Schedule lessons and sync with your calendar',
      icon: <CalendarIcon />,
      enabled: false,
      features: ['Auto-scheduling', 'Student reminders', 'Time tracking'],
      category: 'scheduling'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
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

    setConnecting('google-drive');

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
      setConnecting(null);
    }
  };

  const handleComingSoon = (addonName: string) => {
    toast.info(`${addonName} integration coming soon!`);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-8 h-8 border-2 border-app-green-700 dark:border-dark-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-app-gray dark:text-app-light-gray">Loading addons...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-2 sm:p-8 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-normal text-app-black dark:text-dark-text mb-2">Addons</h1>
        <p className="text-app-gray dark:text-app-light-gray">Connect external services to enhance your workflow</p>
      </div>

      {/* Configuration Error Alert */}
      <AnimatePresence>
        {configError && (
          <motion.div 
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-4xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" strokeWidth={1.5} />
              <div>
                <h3 className="font-medium text-red-900 dark:text-red-300 mb-1">Configuration Required</h3>
                <p className="text-sm text-red-700 dark:text-red-400">{configError}</p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                  Check the console for more details or refer to the setup documentation.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Addons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {addons.map((addon, index) => (
          <motion.div 
            key={addon.id}
            className="bg-white dark:bg-dark-card rounded-lg border border-app-border dark:border-dark-border/20 p-6 hover:shadow-lg dark:hover:shadow-dark transition-shadow duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div>
                {addon.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg text-app-black dark:text-dark-text mb-1">
                  {addon.displayName}
                </h3>
                <p className="text-sm text-app-gray dark:text-app-light-gray">
                  {addon.description}
                </p>
              </div>
            </div>
            
            {/* Features */}
            {addon.features && (
              <div className="mb-4 space-y-1">
                {addon.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-app-gray dark:text-app-light-gray">
                    <Sparkles size={12} className="text-app-green-700 dark:text-dark-accent" strokeWidth={2} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Status */}
            <AnimatePresence mode="wait">
              {addon.enabled && (
                <motion.div 
                  className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check size={16} strokeWidth={2} />
                  <span className="text-sm font-medium">Connected</span>
                  {addon.connectedAt && (
                    <span className="text-xs text-app-gray dark:text-app-light-gray">
                      • {formatDate(addon.connectedAt)}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats */}
            {addon.stats && addon.enabled && (
              <div className="mb-3 p-3 bg-app-secondary-bg-solid dark:bg-white/5 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-app-gray dark:text-app-light-gray">Total uploads</span>
                  <span className="font-medium text-app-black dark:text-dark-text">{addon.stats.totalUploads || 0}</span>
                </div>
                {addon.stats.lastUpload && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-app-gray dark:text-app-light-gray">Last upload</span>
                    <span className="font-medium text-app-black dark:text-dark-text">{formatDate(addon.stats.lastUpload)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Action Button */}
            <div className="flex gap-2">
              {addon.id === 'google-drive' ? (
                <motion.button
                  onClick={handleGoogleDriveToggle}
                  disabled={connecting === 'google-drive' || !!configError}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium text-sm flex items-center justify-center gap-2 ${
                    connecting === 'google-drive'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : configError
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : addon.enabled
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                      : 'bg-app-green-700 dark:bg-dark-accent text-white hover:bg-app-green-800 dark:hover:bg-dark-accent/80'
                  }`}
                  whileHover={!connecting && !configError ? { scale: 1.02 } : {}}
                  whileTap={!connecting && !configError ? { scale: 0.98 } : {}}
                >
                  {connecting === 'google-drive' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : configError ? (
                    'Unavailable'
                  ) : addon.enabled ? (
                    <>
                      <Unlink size={16} strokeWidth={1.5} />
                      <span>Disconnect</span>
                    </>
                  ) : (
                    <>
                      <Link2 size={16} strokeWidth={1.5} />
                      <span>Connect</span>
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => handleComingSoon(addon.displayName)}
                  className="flex-1 px-4 py-2 bg-app-secondary-bg-solid dark:bg-white/5 text-app-gray dark:text-app-light-gray rounded-lg hover:bg-app-secondary-bg-solid/80 dark:hover:bg-white/10 transition-all font-medium text-sm flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus size={16} strokeWidth={1.5} />
                  <span>Coming Soon</span>
                </motion.button>
              )}

            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Info Section */}
      <motion.div 
        className="bg-gradient-to-r from-app-green-50 to-green-100 dark:from-dark-accent/10 dark:to-dark-accent/20 border border-app-green-200 dark:border-dark-accent/30 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-app-green-700 dark:bg-dark-accent bg-opacity-10 dark:bg-opacity-20 rounded-lg">
            <Shield size={24} className="text-app-green-700 dark:text-dark-accent" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-app-black dark:text-dark-text mb-2">Your Data is Secure</h3>
            <p className="text-sm text-app-gray dark:text-app-light-gray mb-3">
              All integrations use OAuth 2.0 for secure authentication. We never store your passwords and you can disconnect services at any time. Your data remains private and encrypted.
            </p>
            <motion.button 
              className="text-sm text-app-green-700 dark:text-dark-accent font-medium flex items-center gap-1 hover:gap-2 transition-all"
              whileHover={{ x: 5 }}
            >
              Learn more about security
              <ChevronRight size={16} strokeWidth={1.5} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
