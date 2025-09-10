// src/components/dashboard/SettingsPage.tsx
import { useState, useEffect } from 'react'
import useAuthStore from '@/stores/authStore'
import useUIStore from '@/stores/uiStore'
import { supabase } from '@/lib/supabase'
import ProfilePictureUpload from './ProfilePictureUpload'
import PasswordUpdateModal from './PasswordUpdateModal'
import { 
  Mail, 
  Globe, 
  Bell, 
  Check, 
  Trash2, 
  User,
  Shield,
  CreditCard,
  ChevronRight,
  LogOut,
  Calendar,
  Loader2,
  AlertCircle,
  Palette,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'

export default function SettingsPage() {
  const { user, signOut, refreshUserData } = useAuthStore()
  const { theme, setTheme, getEffectiveTheme } = useUIStore()
  const [activeSection, setActiveSection] = useState('account')
  const [loading, setLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  
  // Form states
  const [displayName, setDisplayName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [language, setLanguage] = useState('English')
  const [timezone, setTimezone] = useState('UTC-08:00')
  
  // Email notification preferences
  const [emailNotifications, setEmailNotifications] = useState({
    nothing: false,
    lessonsCreated: true,
    weeklyUpdates: false,
    productAnnouncements: true
  })
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '')
      // Parse first and last name from display_name if available
      const names = user.display_name?.split(' ') || []
      setFirstName(names[0] || '')
      setLastName(names.slice(1).join(' ') || '')
      setLanguage(user.native_language || 'English')
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return
    
    setLoading(true)
    setSaveError(null)
    setSaveSuccess(false)
    
    try {
      const fullName = `${firstName} ${lastName}`.trim()
      
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: fullName || displayName,
          native_language: language,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (error) throw error
      
      // Refresh user data in store
      await refreshUserData()
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    setSaveError(null)
    setSaveSuccess(false)
    
    try {
      // Here you would save notification preferences to Supabase
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      setSaveError('Failed to save notification preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
  }

  const handleDeleteAccount = async () => {
    // Implementation for account deletion
    console.log('Delete account - not implemented yet')
    setShowDeleteConfirm(false)
  }

  const handleManageSubscription = () => {
    // Navigate to billing page
    window.location.href = '/dashboard/billing'
  }

  const handleAvatarUpload = async (url: string) => {
    await refreshUserData()
  }

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  const getSubscriptionDetails = () => {
    const tier = user?.subscription_tier || 'free'
    const tierDisplay = tier.charAt(0).toUpperCase() + tier.slice(1)
    const status = user?.subscription_status || 'active'
    
    return {
      tier: tierDisplay,
      status,
      price: tier === 'free' ? 'Free' : tier === 'pro' ? '$29/month' : '$99/month',
      color: tier === 'free' ? 'bg-app-gray' : tier === 'pro' ? 'bg-app-purple' : 'bg-app-green'
    }
  }

  const subscription = getSubscriptionDetails()

  return (
    <div className="min-h-full p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-h1 text-app-black dark:text-dark-text">Settings</h1>
        <p className="text-body text-app-gray dark:text-app-light-gray mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { 
            label: 'Plan', 
            value: subscription.tier, 
            icon: <Shield size={16} strokeWidth={1.5} />,
            accent: subscription.color
          },
          { 
            label: 'Member Since', 
            value: 'Jan 2025', 
            icon: <Calendar size={16} strokeWidth={1.5} />
          },
          { 
            label: 'Language', 
            value: language, 
            icon: <Globe size={16} strokeWidth={1.5} />
          },
          { 
            label: 'Theme', 
            value: theme.charAt(0).toUpperCase() + theme.slice(1), 
            icon: theme === 'system' ? <Monitor size={16} strokeWidth={1.5} /> : (getEffectiveTheme() === 'dark' ? <Moon size={16} strokeWidth={1.5} /> : <Sun size={16} strokeWidth={1.5} />)
          }
        ].map((stat, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg p-4 hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-body-small text-app-gray dark:text-app-light-gray">
                {stat.label}
              </span>
              <span className="text-app-gray dark:text-app-light-gray">
                {stat.icon}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {stat.accent && (
                <span className={`w-2 h-2 rounded-full ${stat.accent} dark:opacity-80`} />
              )}
              <p className="text-h5 text-app-black dark:text-dark-text">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg overflow-hidden">
            <nav className="p-3">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1
                      transition-all group
                      ${isActive 
                        ? 'bg-app-secondary-bg-solid dark:bg-white/10 text-app-black dark:text-dark-text' 
                        : 'hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 text-app-gray dark:text-app-light-gray hover:text-app-black dark:hover:text-dark-text'
                      }
                    `}
                  >
                    <Icon 
                      size={18} 
                      strokeWidth={1.5}
                      className={isActive ? 'text-app-green-700 dark:text-dark-accent' : ''}
                    />
                    <span className="text-sm font-medium">{section.label}</span>
                    {isActive && (
                      <ChevronRight 
                        size={16} 
                        strokeWidth={1.5} 
                        className="ml-auto text-app-green-700 dark:text-dark-accent"
                      />
                    )}
                  </button>
                )
              })}
            </nav>
            
            <div className="border-t border-app-border dark:border-dark-border/20 p-3 mt-2">
              <button 
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-app-red-50 dark:hover:bg-app-red-900/20 transition-all group"
              >
                <LogOut size={18} strokeWidth={1.5} className="text-app-red dark:text-app-red-400" />
                <span className="text-sm font-medium text-app-red dark:text-app-red-400">
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Account Section */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="bg-white dark:bg-dark-card rounded-lg border border-app-border dark:border-dark-border/20 p-6">
                <ProfilePictureUpload 
                  onUploadComplete={handleAvatarUpload}
                  className="mb-6"
                />
              </div>

              {/* Account Information */}
              <div className="bg-white dark:bg-dark-card rounded-lg border border-app-border dark:border-dark-border/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-app-green-100 dark:bg-dark-accent/20 rounded-lg">
                    <User size={20} strokeWidth={1.5} className="text-app-green-700 dark:text-dark-accent" />
                  </div>
                  <div>
                    <h2 className="text-h5 text-app-black dark:text-dark-text">Personal Information</h2>
                    <p className="text-body-small text-app-gray dark:text-app-light-gray">
                      Update your personal details
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-app-black dark:text-dark-text mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-gray dark:text-app-light-gray" />
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full pl-10 pr-3 py-2 bg-app-secondary-bg-solid dark:bg-white/5 border border-app-border dark:border-dark-border/20 rounded-lg text-app-gray dark:text-app-light-gray"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-app-black dark:text-dark-text mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 bg-transparent dark:text-dark-text dark:placeholder-dark-border border border-app-border dark:border-dark-border/20 rounded-lg focus:outline-none focus:border-app-green-700 dark:focus:border-dark-accent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-app-black dark:text-dark-text mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 bg-transparent dark:text-dark-text dark:placeholder-dark-border border border-app-border dark:border-dark-border/20 rounded-lg focus:outline-none focus:border-app-green-700 dark:focus:border-dark-accent transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-4 py-2 bg-app-green dark:bg-dark-accent text-white rounded-lg hover:bg-app-green-700 dark:hover:bg-dark-accent/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>

                  {saveSuccess && (
                    <div className="flex items-center gap-2 text-app-green-700 dark:text-dark-accent">
                      <Check size={16} strokeWidth={1.5} />
                      <span className="text-sm">Profile updated successfully!</span>
                    </div>
                  )}

                  {saveError && (
                    <div className="flex items-center gap-2 text-app-red dark:text-app-red-400">
                      <AlertCircle size={16} strokeWidth={1.5} />
                      <span className="text-sm">{saveError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <div className="space-y-6">
              {/* Theme Settings */}
              <div className="bg-white dark:bg-dark-card rounded-lg border border-app-border dark:border-dark-border/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-app-purple-100 dark:bg-app-purple-500/20 rounded-lg">
                    <Palette size={20} strokeWidth={1.5} className="text-app-purple-600 dark:text-app-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-h5 text-app-black dark:text-dark-text">Appearance</h2>
                    <p className="text-body-small text-app-gray dark:text-app-light-gray">
                      Customize how the app looks
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-app-black dark:text-dark-text mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light' as const, label: 'Light', icon: Sun },
                        { value: 'dark' as const, label: 'Dark', icon: Moon },
                        { value: 'system' as const, label: 'System', icon: Monitor }
                      ].map((option) => {
                        const Icon = option.icon
                        const isSelected = theme === option.value
                        
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleThemeChange(option.value)}
                            className={`
                              p-3 rounded-lg border transition-all
                              ${isSelected 
                                ? 'border-app-green-700 dark:border-dark-accent bg-app-green-50 dark:bg-dark-accent/10' 
                                : 'border-app-border dark:border-dark-border/20 hover:bg-app-secondary-bg-solid dark:hover:bg-white/5'
                              }
                            `}
                          >
                            <Icon 
                              size={20} 
                              strokeWidth={1.5} 
                              className={`mx-auto mb-1 ${
                                isSelected 
                                  ? 'text-app-green-700 dark:text-dark-accent' 
                                  : 'text-app-gray dark:text-app-light-gray'
                              }`}
                            />
                            <span className={`text-sm ${
                              isSelected 
                                ? 'text-app-green-700 dark:text-dark-accent font-medium' 
                                : 'text-app-gray dark:text-app-light-gray'
                            }`}>
                              {option.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Language & Region */}
              <div className="bg-white dark:bg-dark-card rounded-lg border border-app-border dark:border-dark-border/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-app-blue-100 dark:bg-app-blue-500/20 rounded-lg">
                    <Globe size={20} strokeWidth={1.5} className="text-app-blue-600 dark:text-app-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-h5 text-app-black dark:text-dark-text">Language & Region</h2>
                    <p className="text-body-small text-app-gray dark:text-app-light-gray">
                      Set your language and regional preferences
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-app-black dark:text-dark-text mb-1">
                      Display Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-transparent dark:text-dark-text border border-app-border dark:border-dark-border/20 rounded-lg focus:outline-none focus:border-app-green-700 dark:focus:border-dark-accent transition-colors"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Español</option>
                      <option value="French">Français</option>
                      <option value="German">Deutsch</option>
                      <option value="Japanese">日本語</option>
                      <option value="Chinese">中文</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-app-black dark:text-dark-text mb-1">
                      Time Zone
                    </label>
                    <select 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 bg-transparent dark:text-dark-text border border-app-border dark:border-dark-border/20 rounded-lg focus:outline-none focus:border-app-green-700 dark:focus:border-dark-accent transition-colors"
                    >
                      <option value="UTC-08:00">UTC-08:00 Pacific Time</option>
                      <option value="UTC-05:00">UTC-05:00 Eastern Time</option>
                      <option value="UTC+00:00">UTC+00:00 London</option>
                      <option value="UTC+01:00">UTC+01:00 Paris</option>
                      <option value="UTC+09:00">UTC+09:00 Tokyo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="bg-white dark:bg-dark-card rounded-lg border border-app-border dark:border-dark-border/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-app-purple-100 dark:bg-app-purple-500/20 rounded-lg">
                  <Bell size={20} strokeWidth={1.5} className="text-app-purple-600 dark:text-app-purple-400" />
                </div>
                <div>
                  <h2 className="text-h5 text-app-black dark:text-dark-text">Email Notifications</h2>
                  <p className="text-body-small text-app-gray dark:text-app-light-gray">
                    Choose what emails you want to receive
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="notifications"
                    checked={emailNotifications.nothing}
                    onChange={() => setEmailNotifications({
                      nothing: true,
                      lessonsCreated: false,
                      weeklyUpdates: false,
                      productAnnouncements: false
                    })}
                    className="mt-1 accent-app-green-700 dark:accent-dark-accent"
                  />
                  <div>
                    <div className="text-body font-medium text-app-black dark:text-dark-text">
                      Turn off all emails
                    </div>
                    <div className="text-body-small text-app-gray dark:text-app-light-gray">
                      Opt out of all email communications
                    </div>
                  </div>
                </label>

                <div className="space-y-3 pl-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications.lessonsCreated}
                      onChange={(e) => setEmailNotifications({
                        ...emailNotifications,
                        nothing: false,
                        lessonsCreated: e.target.checked
                      })}
                      disabled={emailNotifications.nothing}
                      className="mt-1 accent-app-green-700 dark:accent-dark-accent disabled:opacity-50"
                    />
                    <div>
                      <div className="text-body font-medium text-app-black dark:text-dark-text">
                        Lesson Creation Updates
                      </div>
                      <div className="text-body-small text-app-gray dark:text-app-light-gray">
                        Get notified when your lessons are ready
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications.weeklyUpdates}
                      onChange={(e) => setEmailNotifications({
                        ...emailNotifications,
                        nothing: false,
                        weeklyUpdates: e.target.checked
                      })}
                      disabled={emailNotifications.nothing}
                      className="mt-1 accent-app-green-700 dark:accent-dark-accent disabled:opacity-50"
                    />
                    <div>
                      <div className="text-body font-medium text-app-black dark:text-dark-text">
                        Weekly Progress Reports
                      </div>
                      <div className="text-body-small text-app-gray dark:text-app-light-gray">
                        Receive weekly summaries of your teaching activity
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications.productAnnouncements}
                      onChange={(e) => setEmailNotifications({
                        ...emailNotifications,
                        nothing: false,
                        productAnnouncements: e.target.checked
                      })}
                      disabled={emailNotifications.nothing}
                      className="mt-1 accent-app-green-700 dark:accent-dark-accent disabled:opacity-50"
                    />
                    <div>
                      <div className="text-body font-medium text-app-black dark:text-dark-text">
                        Product Announcements
                      </div>
                      <div className="text-body-small text-app-gray dark:text-app-light-gray">
                        Stay updated with new features and improvements
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="mt-6 px-4 py-2 bg-app-green dark:bg-dark-accent text-white rounded-lg hover:bg-app-green-700 dark:hover:bg-dark-accent/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </button>

              {saveSuccess && (
                <div className="mt-4 flex items-center gap-2 text-app-green-700 dark:text-dark-accent">
                  <Check size={16} strokeWidth={1.5} />
                  <span className="text-sm">Settings saved successfully!</span>
                </div>
              )}
            </div>
          )}

          {/* Subscription Section */}
          {activeSection === 'subscription' && (
            <div className="bg-white dark:bg-dark-card rounded-lg border border-app-border dark:border-dark-border/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-app-orange-100 dark:bg-app-orange-500/20 rounded-lg">
                  <CreditCard size={20} strokeWidth={1.5} className="text-app-orange-600 dark:text-app-orange-400" />
                </div>
                <div>
                  <h2 className="text-h5 text-app-black dark:text-dark-text">Subscription</h2>
                  <p className="text-body-small text-app-gray dark:text-app-light-gray">
                    Manage your subscription and billing
                  </p>
                </div>
              </div>
              
              <div className="bg-app-secondary-bg-solid dark:bg-white/5 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body-small text-app-gray dark:text-app-light-gray">
                    Current Plan
                  </span>
                  <span className={`px-2 py-1 ${subscription.color} text-white rounded-full text-caption font-medium`}>
                    {subscription.tier}
                  </span>
                </div>
                <p className="text-h2 text-app-black dark:text-dark-text">{subscription.price}</p>
                {subscription.tier !== 'Free' && (
                  <p className="text-body-small text-app-gray dark:text-app-light-gray mt-1">
                    Next billing date: Feb 1, 2025
                  </p>
                )}
              </div>
              
              <button
                onClick={handleManageSubscription}
                className="w-full px-4 py-2 bg-app-black dark:bg-white text-white dark:text-app-black rounded-lg hover:bg-app-gray-900 dark:hover:bg-gray-100 transition-all"
              >
                Manage Subscription
              </button>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              {/* Password Change */}
              <div className="bg-white dark:bg-dark-card rounded-lg border border-app-border dark:border-dark-border/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-app-green-100 dark:bg-dark-accent/20 rounded-lg">
                    <Shield size={20} strokeWidth={1.5} className="text-app-green-700 dark:text-dark-accent" />
                  </div>
                  <div>
                    <h2 className="text-h5 text-app-black dark:text-dark-text">Security Settings</h2>
                    <p className="text-body-small text-app-gray dark:text-app-light-gray">
                      Manage your account security
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-app-black dark:bg-white text-white dark:text-app-black rounded-lg hover:bg-app-gray-900 dark:hover:bg-gray-100 transition-all"
                >
                  Change Password
                </button>
              </div>

              {/* Danger Zone */}
              <div className="bg-white dark:bg-dark-card rounded-lg border border-app-red-200 dark:border-app-red-900/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-app-red-100 dark:bg-app-red-900/20 rounded-lg">
                    <Trash2 size={20} strokeWidth={1.5} className="text-app-red dark:text-app-red-400" />
                  </div>
                  <div>
                    <h2 className="text-h5 text-app-red-900 dark:text-app-red-400">Danger Zone</h2>
                    <p className="text-body-small text-app-gray dark:text-app-light-gray">
                      Irreversible and destructive actions
                    </p>
                  </div>
                </div>
                
                <p className="text-body text-app-gray dark:text-app-light-gray mb-4">
                  Once you delete your account, there is no going back. All your data will be permanently removed.
                </p>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-app-red dark:bg-app-red-600 text-white rounded-lg hover:bg-app-red-700 dark:hover:bg-app-red-700 transition-all"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Update Modal */}
      <PasswordUpdateModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-dark-card rounded-lg p-6 max-w-md animate-popup-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-app-red-100 dark:bg-app-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 size={20} strokeWidth={1.5} className="text-app-red dark:text-app-red-400" />
              </div>
              <h3 className="text-h5 text-app-black dark:text-dark-text">Delete Account?</h3>
            </div>
            
            <p className="text-body text-app-gray dark:text-app-light-gray mb-6">
              This action cannot be undone. All your data including lessons, students, and settings will be permanently deleted.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg text-app-gray dark:text-app-light-gray hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-app-red dark:bg-app-red-600 text-white rounded-lg hover:bg-app-red-700 dark:hover:bg-app-red-700 transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}