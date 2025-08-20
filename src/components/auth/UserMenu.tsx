// src/components/auth/UserMenu.tsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import useSlideStore from '@/stores/slideStore'
import { LogOut, Save, Settings, CreditCard, History } from 'lucide-react'
import RecentLessonsPopup from '@/components/lessons/RecentLessonsPopup'

interface UserMenuProps {
  onClose?: () => void
}

export default function UserMenu({ onClose }: UserMenuProps = {}) {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { saveToDatabase, isSaving, presentation } = useSlideStore()
  const menuRef = useRef<HTMLDivElement>(null)
  const [showRecentLessons, setShowRecentLessons] = useState(false)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Don't close if clicking on Recent Lessons popup
        const recentLessonsPopup = document.querySelector('[data-recent-lessons-popup]')
        if (recentLessonsPopup && recentLessonsPopup.contains(event.target as Node)) {
          return
        }
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose?.()
    } catch (error: any) {
      console.error('Sign out error:', error)
      alert('Failed to sign out')
    }
  }

  const handleSave = async () => {
    if (presentation) {
      await saveToDatabase()
      onClose?.()
    }
  }

  if (!user) return null

  return (
    <>
      <div ref={menuRef} className="w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-900 truncate">
          {user.display_name || 'User'}
        </div>
        <div className="text-sm text-gray-500 truncate">
          {user.email}
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {/* Save Lesson */}
        {presentation && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Lesson'}
          </button>
        )}

        {/* Recent Lessons */}
        <button
          onClick={() => setShowRecentLessons(!showRecentLessons)}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <History className="w-4 h-4" />
          Recent Lessons
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            onClose?.()
            navigate('/dashboard/settings')
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>

        {/* Subscription */}
        <button
          onClick={() => {
            onClose?.()
            navigate('/dashboard/billing')
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <CreditCard className="w-4 h-4" />
          Subscription
        </button>
      </div>

      {/* Sign Out */}
      <div className="border-t border-gray-200 pt-2">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>

    {/* Recent Lessons Popup */}
    <RecentLessonsPopup
      isOpen={showRecentLessons}
      onClose={() => setShowRecentLessons(false)}
      anchorElement={menuRef.current}
    />
  </>
  )
}
