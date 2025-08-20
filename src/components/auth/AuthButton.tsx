// src/components/auth/AuthButton.tsx
import { useState } from 'react'
import useAuthStore from '@/stores/authStore'
import useSlideStore from '@/stores/slideStore'
import AuthModal from './AuthModal'
import { User, LogOut, Save, Database } from 'lucide-react'

export default function AuthButton() {
  const { user, signOut, isLoading } = useAuthStore()
  const { saveToDatabase, isSaving, presentation } = useSlideStore()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error: any) {
      console.error('Sign out error:', error)
      alert('Failed to sign out')
    }
  }

  const handleSave = async () => {
    if (presentation) {
      await saveToDatabase()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <User className="w-4 h-4" />
          Sign In
        </button>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Save Button */}
      {presentation && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
          title="Save lesson to database"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      )}

      {/* User Menu */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2">
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.display_name || user.email}
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <User className="w-4 h-4 text-gray-600" />
          )}
          <span className="text-sm text-gray-700 max-w-[120px] truncate">
            {user.display_name || user.email}
          </span>
        </div>
        
        <button
          onClick={handleSignOut}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Subscription Badge */}
      <div className={`px-2 py-1 rounded text-xs font-medium ${
        user.subscription_tier === 'max' ? 'bg-purple-100 text-purple-700' :
        user.subscription_tier === 'pro' ? 'bg-blue-100 text-blue-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {user.subscription_tier.toUpperCase()}
      </div>
    </div>
  )
}
