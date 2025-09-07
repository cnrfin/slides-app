// src/components/auth/UserMenu.tsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ReactDOM from 'react-dom'
import useAuthStore from '@/stores/authStore'
import useSlideStore from '@/stores/slideStore'
import useLanguageStore from '@/stores/languageStore'
import useUIStore from '@/stores/uiStore'
import { LogOut, Save, Settings, CreditCard, History, Globe, Check, Moon, Sun } from 'lucide-react'
import RecentLessonsPopup from '@/components/lessons/RecentLessonsPopup'
import { SUPPORTED_LANGUAGES } from '@/i18n/config'

interface UserMenuProps {
  onClose?: () => void
}

// Inline Language Popup Component for debugging
function InlineLanguagePopup({ isOpen, onClose, anchorElement }: { 
  isOpen: boolean; 
  onClose: () => void; 
  anchorElement: HTMLElement | null;
}) {
  const { currentLanguage, setLanguage } = useLanguageStore();
  const popupRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        anchorElement && 
        !anchorElement.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, anchorElement, onClose]);
  
  if (!isOpen) return null;
  
  const rect = anchorElement?.getBoundingClientRect();
  const position = rect ? {
    top: rect.bottom + 8,
    left: rect.left
  } : { top: 100, left: 100 };
  
  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 99999,
      }}
    >
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Select Language
        </p>
      </div>
      
      <div className="py-1">
        {SUPPORTED_LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => {
              setLanguage(language.code);
              onClose();
            }}
            className={`
              w-full flex items-center justify-between px-3 py-2 
              text-sm hover:bg-gray-50 transition-colors
              ${currentLanguage === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">{language.name}</span>
            </div>
            {currentLanguage === language.code && (
              <Check className="w-4 h-4" strokeWidth={2} />
            )}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}

export default function UserMenu({ onClose }: UserMenuProps = {}) {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const { user, signOut } = useAuthStore()
  const { saveToDatabase, isSaving, presentation } = useSlideStore()
  const { currentLanguage } = useLanguageStore()
  const { theme, toggleTheme } = useUIStore()
  const menuRef = useRef<HTMLDivElement>(null)
  const languageButtonRef = useRef<HTMLButtonElement>(null)
  const [showRecentLessons, setShowRecentLessons] = useState(false)
  const [showLanguagePopup, setShowLanguagePopup] = useState(false) // Local state for language popup
  
  // Get current language display
  const currentLanguageDisplay = SUPPORTED_LANGUAGES.find(
    lang => lang.code === currentLanguage
  );

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
      alert(t('signOutError'))
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
          <div className="text-body-small font-medium text-gray-900 truncate">
            {user.display_name || t('user')}
          </div>
          <div className="text-caption text-gray-500 truncate">
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
              className="w-full flex items-center gap-3 px-4 py-2 text-menu text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? t('saving') : t('saveLesson')}
            </button>
          )}

          {/* Recent Lessons */}
          <button
            onClick={() => setShowRecentLessons(!showRecentLessons)}
            className="w-full flex items-center gap-3 px-4 py-2 text-menu text-gray-700 hover:bg-gray-50"
          >
            <History className="w-4 h-4" />
            {t('recentLessons')}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2 text-menu text-gray-700 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              <span>{theme === 'dark' ? t('darkMode', 'Dark Mode') : t('lightMode', 'Light Mode')}</span>
            </div>
            <div className="flex items-center">
              <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200 transition-colors duration-200 ease-in-out"
                style={{
                  backgroundColor: theme === 'dark' ? '#34968b' : '#e5e7eb'
                }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out"
                  style={{
                    transform: theme === 'dark' ? 'translateX(18px)' : 'translateX(2px)'
                  }}
                />
              </div>
            </div>
          </button>

          {/* Language Selector */}
          <button
            ref={languageButtonRef}
            onClick={() => {
              console.log('Language button clicked, opening popup');
              setShowLanguagePopup(true);
            }}
            className="w-full flex items-center justify-between px-4 py-2 text-menu text-gray-700 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4" />
              {t('language')}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{currentLanguageDisplay?.name}</span>
            </div>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              onClose?.()
              navigate('/dashboard/settings')
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-menu text-gray-700 hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            {t('settings')}
          </button>

          {/* Subscription */}
          <button
            onClick={() => {
              onClose?.()
              navigate('/dashboard/billing')
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-menu text-gray-700 hover:bg-gray-50"
          >
            <CreditCard className="w-4 h-4" />
            {t('subscription')}
          </button>
        </div>

        {/* Sign Out */}
        <div className="border-t border-gray-200 pt-2">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2 text-menu text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            {t('signOut')}
          </button>
        </div>
      </div>

      {/* Inline Language Popup */}
      <InlineLanguagePopup 
        isOpen={showLanguagePopup}
        onClose={() => setShowLanguagePopup(false)}
        anchorElement={languageButtonRef.current}
      />

      {/* Recent Lessons Popup */}
      <RecentLessonsPopup
        isOpen={showRecentLessons}
        onClose={() => setShowRecentLessons(false)}
        anchorElement={menuRef.current}
      />
    </>
  )
}
