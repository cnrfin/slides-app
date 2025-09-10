// src/components/dashboard/Sidebar.tsx
import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '@/stores/authStore'
import useLanguageStore from '@/stores/languageStore'
import useUIStore from '@/stores/uiStore'
import { SUPPORTED_LANGUAGES } from '@/i18n/config'
import { useAddons } from '@/hooks/useAddons'
import { MobileLanguagePanel } from '@/components/language'

import {
  Menu,
  PanelLeft,
  PanelLeftClose,
  Home,
  BookOpen,
  Users,
  Settings,
  CreditCard,
  LogOut,
  X,
  Package,
  Languages,
  GraduationCap,
  Sparkles,
  ChevronDown,
  FolderOpen,
  BarChart3,
  Check,
  Plus,
  CirclePlus,
  Moon,
  Sun
} from 'lucide-react'

interface NavItem {
  path: string
  labelKey: string
  icon: React.ReactNode
}

interface SidebarProps {}

// Pulse animation component that persists across route changes
function PulseAnimation({ isAnimating }: { isAnimating: boolean }) {
  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ 
            boxShadow: 'inset 0 0 0 1px rgba(20 184 166, 1)',
            opacity: 1
          }}
          animate={{ 
            boxShadow: 'inset 0 0 0 1px rgba(20 184 166, 0)',
            opacity: 0
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.6,
            ease: 'easeOut'
          }}
        />
      )}
    </AnimatePresence>
  )
}

// Language Popup Component
function LanguagePopup({ isOpen, onClose, anchorElement, userMenuElement, onCloseAll }: { 
  isOpen: boolean; 
  onClose: () => void; 
  anchorElement: HTMLElement | null;
  userMenuElement: HTMLElement | null;
  onCloseAll?: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const { currentLanguage, setLanguage } = useLanguageStore();
  const popupRef = useRef<HTMLDivElement>(null);
  const isSelectingLanguage = useRef(false);
  
  // Click-outside detection for language popup
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is inside the language popup
      if (popupRef.current && popupRef.current.contains(target)) {
        return;
      }
      
      // Check if click is on the language button that opened this popup
      if (anchorElement && anchorElement.contains(target)) {
        return;
      }
      
      // Check if we clicked inside the user menu dropdown
      if (userMenuElement && userMenuElement.contains(target)) {
        return;
      }
      
      // Clicked outside everything - close both popups
      if (onCloseAll) {
        onCloseAll();
      } else {
        onClose();
      }
    };
    
    // Small delay to avoid immediate closure when opening
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, anchorElement, userMenuElement, onClose, onCloseAll]);
  
  if (!isOpen) return null;
  
  const getPosition = () => {
    if (userMenuElement) {
      const menuRect = userMenuElement.getBoundingClientRect();
      return {
        top: menuRect.top,
        left: menuRect.right + -4
      };
    }
    
    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.right + 8
      };
    }
    
    return { top: 300, left: 300 };
  };
  
  const position = getPosition();
  
  if (position.left + 200 > window.innerWidth) {
    position.left = Math.max(10, position.left - 416);
  }
  
  if (position.top + 300 > window.innerHeight) {
    position.top = window.innerHeight - 310;
  }
  if (position.top < 10) {
    position.top = 10;
  }
  
  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      data-language-popup
      className="fixed bg-white dark:bg-dark-card rounded-lg shadow-popup border border-app-border dark:border-dark-border/20 py-2 min-w-[200px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 99999,
      }}
    >
      <div className="px-3 py-2 border-b border-app-border/10 dark:border-dark-border/20">
        <p className="text-xs font-medium text-app-gray dark:text-app-light-gray uppercase tracking-wider">
          {t('selectLanguage')}
        </p>
      </div>
      
      <div className="py-1">
        {SUPPORTED_LANGUAGES.map((language) => (
          <button
            key={language.code}
            onMouseDown={() => {
              // Set flag to prevent popup from closing during selection
              isSelectingLanguage.current = true;
            }}
            onClick={() => {
              console.log('Language selected:', language.code);
              setLanguage(language.code);
              // Close both menus when language is selected
              if (onCloseAll) {
                onCloseAll();
              } else {
                onClose();
              }
            }}
            className={`
              w-full flex items-center justify-between px-3 py-2 
              text-sm hover:bg-app-secondary-bg dark:hover:bg-white/10 transition-colors
              ${currentLanguage === language.code ? 'bg-app-green-100 dark:bg-app-green-700/20 text-app-green-700 dark:text-app-green-300' : 'text-gray-700 dark:text-dark-text'}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="font-normal">{tCommon(`languages.${language.code}` as const)}</span>
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

export default function Sidebar({}: SidebarProps = {}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isHoveringCollapseBtn, setIsHoveringCollapseBtn] = useState(false)
  
  // Use the UI store for persisted collapse state and theme
  const { isSidebarCollapsed: isCollapsed, toggleSidebar, theme, setTheme, toggleTheme, getEffectiveTheme } = useUIStore()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLanguagePopupOpen, setIsLanguagePopupOpen] = useState(false)
  const [isMobileLanguagePanelOpen, setIsMobileLanguagePanelOpen] = useState(false)
  const [animatingPaths, setAnimatingPaths] = useState<Set<string>>(new Set())
  const [profileImageError, setProfileImageError] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const { t: tCommon } = useTranslation('common')
  const { user, signOut } = useAuthStore()
  const { currentLanguage } = useLanguageStore()
  const { addons, refresh: refreshAddons } = useAddons()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userMenuDropdownRef = useRef<HTMLDivElement>(null)
  const languageButtonRef = useRef<HTMLButtonElement>(null)
  const mobileLanguageButtonRef = useRef<HTMLButtonElement>(null)

  // Listen for addon changes
  useEffect(() => {
    const handleAddonChange = () => {
      refreshAddons()
    }
    window.addEventListener('addons:updated', handleAddonChange)
    return () => {
      window.removeEventListener('addons:updated', handleAddonChange)
    }
  }, [refreshAddons])

  // Available addons list
  const AVAILABLE_ADDONS = ['google_drive']

  // Calculate number of uninstalled addons
  const installedAddonNames = addons.filter(a => a.enabled).map(a => a.addon_name)
  const uninstalledAddonsCount = AVAILABLE_ADDONS.filter(
    addonName => !installedAddonNames.includes(addonName)
  ).length

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      labelKey: 'home',
      icon: <Home className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/lessons',
      labelKey: 'lessons',
      icon: <BookOpen className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/students',
      labelKey: 'students',
      icon: <Users className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/analytics',
      labelKey: 'analytics',
      icon: <BarChart3 className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/addons',
      labelKey: 'addons',
      icon: <Package className="w-5 h-5" strokeWidth={1.5} />
    }
  ]

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  // Click-outside detection for user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside user menu
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        // Don't close if clicking on Language popup
        const languagePopup = document.querySelector('[data-language-popup]');
        if (languagePopup && languagePopup.contains(target)) {
          return;
        }
        
        // Close both menus
        setIsUserMenuOpen(false);
        setIsLanguagePopupOpen(false);
      }
      
      // Check mobile sidebar separately
      const sidebar = document.getElementById('mobile-sidebar');
      if (sidebar && !sidebar.contains(target)) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen || isUserMenuOpen) {
      // Add a small delay to avoid interfering with click events
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      }
    }
  }, [isMobileOpen, isUserMenuOpen])


  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const getUserInitials = () => {
    if (user?.display_name) {
      const names = user.display_name.split(' ')
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  const getUserPlan = () => {
    if (!user) return t('freePlan')
    return user.subscription_tier === 'max' ? t('maxPlan') :
           user.subscription_tier === 'pro' ? t('proPlan') : 
           t('freePlan')
  }

  // Profile Picture Component with fallback to initials
  const ProfileAvatar = ({ 
    size = 'small', 
    className = '',
    variant = 'default' 
  }: { 
    size?: 'small' | 'medium' | 'large',
    className?: string,
    variant?: 'default' | 'gradient'
  }) => {
    const sizeClasses = {
      small: 'w-8 h-8 text-xs',
      medium: 'w-10 h-10 text-sm',
      large: 'w-12 h-12 text-base'
    }

    const shouldShowImage = user?.avatar_url && !profileImageError

    if (shouldShowImage) {
      return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
          <img
            src={user.avatar_url}
            alt={user.display_name || user.email || 'User avatar'}
            className="w-full h-full object-cover"
            onError={() => setProfileImageError(true)}
          />
        </div>
      )
    }

    // Fallback to initials with consistent purple gradient
    const bgClass = 'bg-gradient-to-br from-purple-500 to-purple-600'
    const textClass = 'text-white'

    return (
      <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 ${bgClass} ${className}`}>
        <span className={`${textClass} font-medium`}>
          {getUserInitials()}
        </span>
      </div>
    )
  }

  // Reset image error when user changes
  useEffect(() => {
    setProfileImageError(false)
    // Debug: Log user avatar URL
    if (user) {
      console.log('Dashboard Sidebar - User avatar URL:', user?.avatar_url);
      console.log('Dashboard Sidebar - Full user object:', user);
    }
  }, [user?.avatar_url, user])

  const handleNavClick = (path: string) => {
    if (isActiveRoute(path)) return
    
    // Add path to animating set
    setAnimatingPaths(prev => new Set([...prev, path]))
    
    // Navigate immediately
    navigate(path)
    
    // Remove from animating set after animation completes
    setTimeout(() => {
      setAnimatingPaths(prev => {
        const newSet = new Set(prev)
        newSet.delete(path)
        return newSet
      })
    }, 400)
  }

  // Keyboard shortcut for Create button
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault()
        // TODO: Open create modal
        console.log('Create modal triggered')
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Navigation Item Component with Framer Motion
  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const isActive = isActiveRoute(item.path)
    const isAnimating = animatingPaths.has(item.path)
    
    return (
      <motion.div
        className="relative">
        <Link
          to={item.path}
          onClick={(e) => {
            e.preventDefault()
            handleNavClick(item.path)
          }}
          className={[
            'relative flex items-center justify-between px-3 py-3 rounded-lg text-menu transition-colors',
            isActive 
              ? 'nav-active font-medium'
              : 'text-app-black dark:text-dark-text font-normal hover:bg-white/50 dark:hover:bg-white/10 active:bg-white dark:active:bg-white/20',
            isCollapsed ? 'justify-center' : ''
          ].join(' ')}
          title={isCollapsed ? t(item.labelKey) : undefined}
        >
          <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
            <span className="flex-shrink-0">
              {React.cloneElement(item.icon as React.ReactElement, {
                strokeWidth: isActive ? 2 : 1.5
              })}
            </span>
            {!isCollapsed && (
              <span className="text-menu">{t(item.labelKey)}</span>
            )}
          </div>
          {!isCollapsed && item.path === '/dashboard/addons' && uninstalledAddonsCount > 0 && (
            <span className="bg-app-green dark:bg-dark-accent text-white dark:text-dark-accent-50 text-xs font-medium px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {uninstalledAddonsCount}
            </span>
          )}
          <PulseAnimation isAnimating={isAnimating} />
        </Link>
      </motion.div>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow lg:hidden"
      >
        {isMobileOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <PanelLeft className="w-5 h-5" strokeWidth={1.5} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40 lg:hidden" />
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex fixed left-0 top-0 h-screen flex-col z-30 transition-all duration-300 bg-transparent dark:bg-transparent`}
        style={{ 
          width: isCollapsed ? '60px' : '300px'
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pt-4 px-2">
          {!isCollapsed && (
            <div className="px-2">
              {/* Logo placeholder - 16px height */}
              <div className="h-4 flex items-center">
              <span className="text-lg font-semibold text-gray-800 dark:text-dark-heading">TutorSlides</span>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            onMouseEnter={() => setIsHoveringCollapseBtn(true)}
            onMouseLeave={() => setIsHoveringCollapseBtn(false)}
            className={`p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors ${isCollapsed ? 'mx-auto' : ''} dark:text-gray-300`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeft className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              isHoveringCollapseBtn ? (
                <PanelLeftClose className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <PanelLeft className="w-5 h-5" strokeWidth={1.5} />
              )
            )}
          </button>
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 pt-4 px-2 overflow-y-auto">
          {/* Sidebar Items Container */}
          <div className="flex flex-col gap-1">
            {/* Create Button */}
            <button
              onClick={() => console.log('Create clicked')}
              className={`
                flex items-center justify-center rounded-lg font-medium 
                py-2 ${isCollapsed ? 'px-2' : 'px-4'} 
                ${isCollapsed ? '' : 'border border-app-border dark:border-dark-border/20 dark:hover:border-dark-card/0'} 
                hover:bg-app-light-bg dark:hover:bg-white/10 dark:bg-white/5 transition-all mb-2
                dark:text-dark-text
              `}
              style={{
                borderColor: isCollapsed ? 'transparent' : undefined
              }}
              title={isCollapsed ? 'Create (Ctrl+Space)' : undefined}
            >
              {isCollapsed ? (
                <CirclePlus className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span>{t('create')}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <span className="text-caption font-normal text-app-light-gray bg-app-pill-bg dark:bg-dark-card px-1.5 py-0.5 rounded">
                      Ctrl
                    </span>
                    <span className="text-caption font-normal text-app-light-gray bg-app-pill-bg dark:bg-dark-card px-1.5 py-0.5 rounded">
                      Space
                    </span>
                  </div>
                </>
              )}
            </button>

            {/* Navigation Items */}
            {navItems.map((item) => (
              <NavItemComponent key={item.path} item={item} />
            ))}
          </div>
        </div>

        {/* Sidebar Footer - User Profile Section */}
        <div className="p-2" ref={userMenuRef}>
          <div className="relative">
            <button
              onClick={() => {
                console.log('User menu clicked, toggling from', isUserMenuOpen, 'to', !isUserMenuOpen);
                setIsUserMenuOpen(!isUserMenuOpen);
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''} ${
                isUserMenuOpen 
                  ? 'bg-white/50 dark:bg-white/10' 
                  : 'hover:bg-white/50 active:bg-white/50 dark:hover:bg-white/10 dark:active:bg-white/20' 
              }`}
              title={isCollapsed ? getUserPlan() : undefined}
            >
              <ProfileAvatar size="small" />
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <div className="text-body-small font-medium text-app-black dark:text-dark-text truncate">
                      {user?.display_name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-caption text-app-light-gray dark:text-app-light-gray truncate">
                      {user?.email || 'email@example.com'}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-app-light-gray dark:text-app-light-gray transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* User Dropdown Menu with Animation */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div 
                  ref={userMenuDropdownRef}
                  className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-dark-card rounded-lg shadow-popup border border-app-border dark:border-dark-border/10 overflow-hidden z-[60]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  style={{ minWidth: isCollapsed ? '250px' : 'auto' }}
                >
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-app-border/10 dark:border-dark-border/20">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar size="medium" variant="gradient" />
                      <div className="flex-1 overflow-hidden">
                        <div className="text-body-small font-medium text-app-black dark:text-dark-heading mb-1 truncate">
                          {user?.display_name || 'Display Name'}
                        </div>
                        <div className="text-caption font-normal text-app-blue-700 dark:text-app-blue-300 bg-app-blue-100 dark:bg-app-blue-900/30 px-1.5 py-0.5 rounded w-fit truncate">
                          {getUserPlan()}
                        </div>
                      </div>
                    </div>
                    <div className="text-caption text-app-gray dark:text-app-light-gray truncate mt-2">
                      {user?.email || 'email@example.com'}
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="p-1">
                    <Link
                      to="/dashboard/settings"
                      className="flex items-center gap-3 px-3 py-2 text-menu text-app-black dark:text-dark-text hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 transition-colors rounded"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" strokeWidth={1.5} />
                      {t('settings')}
                    </Link>
                    
                    <button 
                      ref={languageButtonRef}
                      onClick={(e) => {
                        console.log('Language button clicked, current state:', isLanguagePopupOpen);
                        e.stopPropagation();
                        setIsLanguagePopupOpen(!isLanguagePopupOpen);
                      }}
                      className="w-full flex items-center font-normal justify-between px-3 py-2 text-menu text-app-black dark:text-dark-text hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 transition-colors rounded"
                    >
                      <span className="flex items-center gap-3">
                        <Languages className="w-4 h-4" strokeWidth={1.5} />
                        {t('language')}
                      </span>
                      <div className="flex items-center gap-2">
                      <span className="text-xs text-app-gray dark:text-app-light-gray">{tCommon(`languages.${currentLanguage}` as const)}</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        // When using the toggle, switch between light and dark only
                        // System theme can only be set from settings page
                        const effectiveTheme = getEffectiveTheme();
                        setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
                        // Don't close the menu when toggling theme
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-menu font-normal text-app-black dark:text-dark-text hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 transition-colors rounded"
                    >
                      <span className="flex items-center gap-3">
                        {getEffectiveTheme() === 'dark' ? (
                          <Sun className="w-4 h-4" strokeWidth={1.5} />
                        ) : (
                          <Moon className="w-4 h-4" strokeWidth={1.5} />
                        )}
                        <span>{getEffectiveTheme() === 'dark' ? t('lightMode', 'Light Mode') : t('darkMode', 'Dark Mode')}</span>
                      </span>
                      <div className="flex items-center">
                        <div 
                          className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer"
                          style={{
                            backgroundColor: getEffectiveTheme() === 'dark' ? '#34968b' : '#e5e7eb'
                          }}
                        >
                          <span
                            className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out"
                            style={{
                              transform: getEffectiveTheme() === 'dark' ? 'translateX(18px)' : 'translateX(2px)'
                            }}
                          />
                        </div>
                      </div>
                    </button>
                    
                    <Link
                      to="/dashboard/billing"
                      className="flex items-center gap-3 px-3 py-2 text-menu text-app-black dark:text-dark-text hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 transition-colors rounded"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                      {t('upgradePlan')}
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-app-border/10 dark:border-dark-border/20 p-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 text-menu text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={1.5} />
                      {t('logOut')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar - Full Screen */}
      <aside
        id="mobile-sidebar"
        className={`lg:hidden fixed inset-0 w-full h-full bg-app-secondary-bg/100 dark:bg-dark-bg z-50 transform transition-transform duration-300 flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-border">
          <span className="text-xl font-semibold text-gray-800 dark:text-dark-heading">TutorSlides</span>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 dark:text-gray-300"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Mobile Navigation - Scrollable area that takes remaining space */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Create Button - Mobile */}
          <button
            onClick={() => console.log('Create clicked')}
            className="w-full flex items-center justify-center rounded-lg font-medium py-2 px-4 border border-gray-300 dark:border-dark-border hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-white/10 transition-all mb-4 dark:text-dark-text"
          >
            <span>{t('create')}</span>
          </button>

          {/* Navigation Items */}
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = isActiveRoute(item.path);
              const isAnimating = animatingPaths.has(item.path);
              
              return (
                <motion.div key={item.path} className="relative">
                  <Link
                    to={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.path);
                      setIsMobileOpen(false); // Close mobile menu after navigation
                    }}
                    className={`
                      relative flex items-center justify-between px-3 py-3 rounded-lg text-menu transition-colors
                      ${isActive ? 'nav-active font-medium' : 'text-app-black dark:text-dark-text font-normal hover:bg-white/50 dark:hover:bg-white/10 active:bg-white dark:active:bg-white/20'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0">
                        {React.cloneElement(item.icon as React.ReactElement, {
                          strokeWidth: isActive ? 2 : 1.5
                        })}
                      </span>
                      <span className="text-menu">{t(item.labelKey)}</span>
                    </div>
                    {item.path === '/dashboard/addons' && uninstalledAddonsCount > 0 && (
                      <span className="bg-app-green text-white text-xs font-medium px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {uninstalledAddonsCount}
                      </span>
                    )}
                    <PulseAnimation isAnimating={isAnimating} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section - Mobile (Footer - always at bottom) */}
        <div className="p-4 border-t border-gray-100 dark:border-dark-border">
          <div className="px-3 py-2">
            <div className="flex items-center gap-3">
              <ProfileAvatar size="small" />
              <div className="flex-1 overflow-hidden">
                <div className="text-body-small font-medium text-gray-900 dark:text-gray-200 truncate">
                  {user?.display_name || user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-caption text-gray-500 dark:text-gray-400 truncate">
                  {getUserPlan()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu Options */}
          <div className="mt-2 space-y-1">
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 text-menu text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              <Settings className="w-4 h-4" strokeWidth={1.5} />
              {t('settings')}
            </Link>
            
            <button
              ref={mobileLanguageButtonRef}
              onClick={() => {
                setIsMobileLanguagePanelOpen(true);
                setIsMobileOpen(false); // Close the mobile sidebar when opening language panel
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-menu text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-3">
                <Languages className="w-4 h-4" strokeWidth={1.5} />
                {t('language')}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">{tCommon(`languages.${currentLanguage}` as const)}</span>
              </div>
            </button>
            
            <button
              onClick={() => {
                // When using the toggle, switch between light and dark only
                // System theme can only be set from settings page
                const effectiveTheme = getEffectiveTheme();
                setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
                // Don't close mobile menu when toggling theme
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-menu text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-3">
                {getEffectiveTheme() === 'dark' ? (
                  <Sun className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Moon className="w-4 h-4" strokeWidth={1.5} />
                )}
                <span>{getEffectiveTheme() === 'dark' ? t('lightMode', 'Light Mode') : t('darkMode', 'Dark Mode')}</span>
              </span>
              <div className="flex items-center">
                <div 
                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer"
                  style={{
                    backgroundColor: getEffectiveTheme() === 'dark' ? '#34968b' : '#e5e7eb'
                  }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out"
                    style={{
                      transform: getEffectiveTheme() === 'dark' ? 'translateX(18px)' : 'translateX(2px)'
                    }}
                  />
                </div>
              </div>
            </button>
            
            <Link
              to="/dashboard/billing"
              className="flex items-center gap-3 px-3 py-2 text-menu text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              {t('upgradePlan')}
            </Link>
            
            <button
              onClick={() => {
                handleSignOut();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-menu text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              {t('logOut')}
            </button>
          </div>
        </div>
      </aside>

      {/* Language Popup */}
      <LanguagePopup 
        isOpen={isLanguagePopupOpen}
        onClose={() => setIsLanguagePopupOpen(false)}
        anchorElement={languageButtonRef.current || mobileLanguageButtonRef.current}
        userMenuElement={userMenuDropdownRef.current}
        onCloseAll={() => {
          setIsLanguagePopupOpen(false);
          setIsUserMenuOpen(false);
        }}
      />
      
      {/* Mobile Language Panel */}
      <MobileLanguagePanel
        isOpen={isMobileLanguagePanelOpen}
        onClose={() => setIsMobileLanguagePanelOpen(false)}
      />
    </>
  )
}