// src/components/dashboard/SettingsPage.tsx
import { useState } from 'react'
import useAuthStore from '@/stores/authStore'
import { 
  Mail, 
  Globe, 
  Bell, 
  Check, 
  Trash2, 
  Copy, 
  User,
  Shield,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Settings,
  LogOut,
  Calendar
} from 'lucide-react'

interface SettingSection {
  title: string
  description?: string
  icon: React.ReactNode
  color: string
}

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [emailNotifications, setEmailNotifications] = useState({
    nothing: false,
    lessonsCreated: true,
    weeklyUpdates: false,
    productAnnouncements: true
  })
  const [language, setLanguage] = useState('English')
  const [showSaveMessage, setShowSaveMessage] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const handleSaveChanges = () => {
    // Save settings to backend
    setShowSaveMessage(true)
    setTimeout(() => setShowSaveMessage(false), 3000)
  }

  const handleDeleteAccount = () => {
    // Implement account deletion
    console.log('Delete account')
    setShowDeleteConfirm(false)
  }

  const handleManageSubscription = () => {
    // Navigate to subscription management
    console.log('Manage subscription')
  }

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email)
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    }
  }

  const sections: SettingSection[] = [
    {
      title: 'Account',
      description: 'Manage your personal information',
      icon: <User className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Preferences',
      description: 'Language and display settings',
      icon: <Globe className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      title: 'Notifications',
      description: 'Email and notification preferences',
      icon: <Bell className="w-5 h-5" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Subscription',
      description: 'Billing and plan information',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Plan', value: 'Pro', icon: <Shield className="w-4 h-4" /> },
          { label: 'Member Since', value: 'Jan 2025', icon: <Calendar className="w-4 h-4" /> },
          { label: 'Language', value: language, icon: <Globe className="w-4 h-4" /> },
          { label: 'Email Verified', value: 'Yes', icon: <Check className="w-4 h-4" /> }
        ].map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{stat.label}</span>
              <span className="text-gray-400">{stat.icon}</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-4">SETTINGS</h3>
            <nav className="space-y-1">
              {sections.map((section, index) => (
                <button
                  key={index}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${section.color} bg-opacity-10 rounded-lg`}>
                      <div className={`${section.color} bg-clip-text text-transparent`}>
                        {section.icon}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{section.title}</p>
                      {section.description && (
                        <p className="text-xs text-gray-500">{section.description}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <HelpCircle className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-700">Help & Support</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-left">
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-600">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500 bg-opacity-10 rounded-lg">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
                <p className="text-sm text-gray-600">Update your personal details</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {copiedEmail ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.display_name || 'Connor'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Language Settings */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500 bg-opacity-10 rounded-lg">
                <Globe className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Language & Region</h2>
                <p className="text-sm text-gray-600">Set your language and regional preferences</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>UTC-08:00 Pacific Time</option>
                  <option>UTC-05:00 Eastern Time</option>
                  <option>UTC+00:00 London</option>
                  <option>UTC+01:00 Paris</option>
                  <option>UTC+09:00 Tokyo</option>
                </select>
              </div>
            </div>
          </section>

          {/* Email Notifications */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500 bg-opacity-10 rounded-lg">
                <Bell className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
                <p className="text-sm text-gray-600">Choose what emails you want to receive</p>
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
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">Turn off all emails</div>
                  <div className="text-sm text-gray-600">Opt out of all email communications</div>
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
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Lesson Creation Updates</div>
                    <div className="text-sm text-gray-600">
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
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Weekly Progress Reports</div>
                    <div className="text-sm text-gray-600">
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
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Product Announcements</div>
                    <div className="text-sm text-gray-600">
                      Stay updated with new features and improvements
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleSaveChanges}
              className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Save Changes
            </button>

            {showSaveMessage && (
              <div className="mt-4 flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm">Settings saved successfully!</span>
              </div>
            )}
          </section>

          {/* Manage Subscription */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500 bg-opacity-10 rounded-lg">
                <CreditCard className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
                <p className="text-sm text-gray-600">
                  Manage your subscription and billing
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current Plan</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Pro
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">$29/month</p>
              <p className="text-sm text-gray-600 mt-1">Next billing date: Feb 1, 2025</p>
            </div>
            
            <button
              onClick={handleManageSubscription}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Manage Subscription
            </button>
          </section>

          {/* Danger Zone */}
          <section className="bg-white rounded-xl border border-red-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500 bg-opacity-10 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
                <p className="text-sm text-gray-600">
                  Irreversible and destructive actions
                </p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. All your data will be permanently removed.
            </p>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </section>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Account?</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All your data including lessons, students, and settings will be permanently deleted.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
