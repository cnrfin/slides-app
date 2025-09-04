// src/components/dashboard/Sidebar.tsx
import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '@/stores/authStore'
import useLanguageStore from '@/stores/languageStore'
import { SUPPORTED_LANGUAGES } from '@/i18n/config'
import { useAddons } from '@/hooks/useAddons'

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
  CirclePlus
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

// Language Popup Component (unchanged)
function LanguagePopup({ isOpen, onClose, anchorElement, userMenuElement }: { 
  isOpen: boolean; 
  onClose: () => void; 
  anchorElement: HTMLElement | null;
  userMenuElement: HTMLElement | null;
}) {
  const { t } = useTranslation('dashboard');
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
  
  const getPosition = () => {
    if (userMenuElement) {
      const menuRect = userMenuElement.getBoundingClientRect();
      return {
        top: menuRect.top,
        left: menuRect.right + 8
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
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 99999,
      }}
    >
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {t('selectLanguage')}
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
              <span className="text-lg">{language.flag}</span>
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

export default function Sidebar({}: SidebarProps = {}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHoveringCollapseBtn, setIsHoveringCollapseBtn] = useState(false)

  // Emit sidebar collapse state changes
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    // Emit custom event for layout adjustment
    window.dispatchEvent(new CustomEvent('sidebar:toggle', { 
      detail: { isCollapsed: newState } 
    }))
  }
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLanguagePopupOpen, setIsLanguagePopupOpen] = useState(false)
  const [animatingPaths, setAnimatingPaths] = useState<Set<string>>(new Set())
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const { user, signOut } = useAuthStore()
  const { currentLanguage } = useLanguageStore()
  const { addons, refresh: refreshAddons } = useAddons()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userMenuDropdownRef = useRef<HTMLDivElement>(null)
  const languageButtonRef = useRef<HTMLButtonElement>(null)

  // Get current language display
  const currentLanguageDisplay = SUPPORTED_LANGUAGES.find(
    lang => lang.code === currentLanguage
  );

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
      path: '/dashboard/courses',
      labelKey: 'courses',
      icon: <FolderOpen className="w-5 h-5" strokeWidth={1.5} />
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      
      const sidebar = document.getElementById('mobile-sidebar')
      if (sidebar && !sidebar.contains(event.target as Node)) {
        setIsMobileOpen(false)
      }
    }

    if (isMobileOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
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
          className={`
          relative flex items-center justify-between px-3 py-3 rounded-lg text-menu transition-colors
          ${isActive ? 'bg-app-green-100 text-app-green font-medium' : 'text-app-black font-normal hover:bg-white/50 active:bg-white'}
          ${isCollapsed ? 'justify-center' : ''}
          `}
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
            <span className="bg-app-green text-white text-xs font-medium px-2 py-0.5 rounded-full min-w-[20px] text-center">
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
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex fixed left-0 top-0 h-screen flex-col z-30 transition-all duration-300 bg-transparent`}
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
                <span className="text-lg font-semibold text-gray-800">TutorSlides</span>
              </div>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            onMouseEnter={() => setIsHoveringCollapseBtn(true)}
            onMouseLeave={() => setIsHoveringCollapseBtn(false)}
            className={`p-2 rounded-lg hover:bg-white/30 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
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
                ${isCollapsed ? '' : 'border'} 
                hover:bg-app-light-bg transition-colors mb-2
              `}
              style={{
                borderColor: isCollapsed ? 'transparent' : '#7e757233'
              }}
              title={isCollapsed ? 'Create (Ctrl+Space)' : undefined}
            >
              {isCollapsed ? (
                <CirclePlus className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span>Create</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <span className="text-caption font-normal text-app-light-gray bg-app-pill-bg px-1.5 py-0.5 rounded">
                      Ctrl
                    </span>
                    <span className="text-caption font-normal text-app-light-gray bg-app-pill-bg px-1.5 py-0.5 rounded">
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
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? getUserPlan() : undefined}
            >
              <div className="w-8 h-8 rounded-full bg-app-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-app-green-700 text-xs font-medium">
                  {getUserInitials()}
                </span>
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <div className="text-body-small font-medium text-gray-900 truncate">
                      {user?.display_name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-caption text-gray-500 truncate">
                      {getUserPlan()}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* User Dropdown Menu with Animation */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div 
                  ref={userMenuDropdownRef}
                  className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-[60]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  style={{ minWidth: isCollapsed ? '250px' : 'auto' }}
                >
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-app-purple-500 to-app-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {getUserInitials()}
                        </span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-body-small font-medium text-gray-900 truncate">
                          {user?.display_name || 'Display Name'}
                        </div>
                        <div className="text-caption text-gray-500 truncate">
                          {getUserPlan()}
                        </div>
                      </div>
                    </div>
                    <div className="text-caption text-gray-500 truncate mt-2">
                      {user?.email || 'email@example.com'}
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="p-1">
                    <Link
                      to="/dashboard/settings"
                      className="flex items-center gap-3 px-3 py-2 text-menu text-gray-700 hover:bg-gray-50 transition-colors rounded"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" strokeWidth={1.5} />
                      {t('settings')}
                    </Link>
                    
                    <button 
                      ref={languageButtonRef}
                      onClick={() => {
                        setIsLanguagePopupOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-menu text-gray-700 hover:bg-gray-50 transition-colors rounded"
                    >
                      <span className="flex items-center gap-3">
                        <Languages className="w-4 h-4" strokeWidth={1.5} />
                        {t('language')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{currentLanguageDisplay?.flag}</span>
                        <span className="text-xs text-gray-500">{currentLanguageDisplay?.name}</span>
                      </div>
                    </button>
                    
                    <Link
                      to="/dashboard/tutorials"
                      className="flex items-center gap-3 px-3 py-2 text-menu text-gray-700 hover:bg-gray-50 transition-colors rounded"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <GraduationCap className="w-4 h-4" strokeWidth={1.5} />
                      {t('tutorials')}
                    </Link>
                    
                    <Link
                      to="/dashboard/billing"
                      className="flex items-center gap-3 px-3 py-2 text-menu text-gray-700 hover:bg-gray-50 transition-colors rounded"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                      {t('upgradePlan')}
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-gray-100 p-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 text-menu text-red-600 hover:bg-red-50 transition-colors rounded"
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
        className={`lg:hidden fixed inset-0 w-full h-full bg-transparent z-50 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="text-xl font-semibold text-gray-800">TutorSlides</span>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-50"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Create Button - Mobile */}
          <button
            onClick={() => console.log('Create clicked')}
            className="w-full flex items-center justify-center rounded-lg font-medium py-2 px-4 border hover:bg-gray-50 transition-colors mb-4"
            style={{ borderColor: '#7e757233' }}
          >
            <span>Create</span>
          </button>

          {/* Navigation Items */}
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavItemComponent key={item.path} item={item} />
            ))}
          </div>
        </nav>

        {/* User Profile Section - Mobile */}
        <div className="p-4">
          <div className="px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-app-purple-500 to-app-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-body-small font-medium text-gray-900 truncate">
                  {user?.display_name || user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-caption text-gray-500 truncate">
                  {getUserPlan()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu Options */}
          <div className="mt-2 space-y-1">
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 text-menu text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" strokeWidth={1.5} />
              {t('settings')}
            </Link>
            
            <button
              onClick={() => {
                setIsLanguagePopupOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-menu text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-3">
                <Languages className="w-4 h-4" strokeWidth={1.5} />
                {t('language')}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{currentLanguageDisplay?.flag}</span>
                <span className="text-xs text-gray-500">{currentLanguageDisplay?.name}</span>
              </div>
            </button>
            
            <Link
              to="/dashboard/billing"
              className="flex items-center gap-3 px-3 py-2 text-menu text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              {t('upgradePlan')}
            </Link>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-menu text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        anchorElement={languageButtonRef.current}
        userMenuElement={userMenuDropdownRef.current}
      />
    </>
  )
}