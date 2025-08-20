// src/components/dashboard/SettingsPage.tsx
import { useState } from 'react'
import useAuthStore from '@/stores/authStore'
import { Mail, Globe, Bell, Check, Trash2, Copy } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [emailNotifications, setEmailNotifications] = useState({
    nothing: false,
    pptAndSlide: true,
    weeklyUpdates: false
  })
  const [language, setLanguage] = useState('English')
  const [showSaveMessage, setShowSaveMessage] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl">
        {/* Account Information */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Copy className="w-4 h-4 text-gray-600" />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Language Settings */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Language Settings</h2>
          
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="English">English</option>
              <option value="Spanish">Español</option>
              <option value="French">Français</option>
              <option value="German">Deutsch</option>
              <option value="Japanese">日本語</option>
            </select>
          </div>
        </section>

        {/* Email Notifications */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h2>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="notifications"
                checked={emailNotifications.nothing}
                onChange={() => setEmailNotifications({
                  nothing: true,
                  pptAndSlide: false,
                  weeklyUpdates: false
                })}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">Nothing</div>
                <div className="text-sm text-gray-600">Opt out of all email notifications</div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications.pptAndSlide}
                onChange={(e) => setEmailNotifications({
                  ...emailNotifications,
                  nothing: false,
                  pptAndSlide: e.target.checked
                })}
                disabled={emailNotifications.nothing}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">PPT and Slide created update</div>
                <div className="text-sm text-gray-600">
                  Receive updates about PPT and slide created update
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
                <div className="font-medium text-gray-900">Weekly product updates</div>
                <div className="text-sm text-gray-600">
                  Receive updates about weekly product updates
                </div>
              </div>
            </label>
          </div>

          <button
            onClick={handleSaveChanges}
            className="mt-6 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Save changes
          </button>

          {showSaveMessage && (
            <div className="mt-4 flex items-center gap-2 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm">Settings saved successfully!</span>
            </div>
          )}
        </section>

        {/* Manage Subscription */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Manage Subscription</h2>
          <p className="text-gray-600 mb-4">
            View and manage your subscription details and billing information.
          </p>
          
          <button
            onClick={handleManageSubscription}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Manage Subscription
          </button>
        </section>

        {/* Delete Account */}
        <section className="bg-white rounded-lg border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Delete Account</h2>
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
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
          <div className="bg-white rounded-lg p-6 max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Account?</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All your data will be permanently deleted.
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
