// src/components/dashboard/Sidebar.tsx
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'

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
  BarChart3
} from 'lucide-react'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
}

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}



export default function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isHoveringToggleButton, setIsHoveringToggleButton] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const userMenuRef = useRef<HTMLDivElement>(null)

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Home',
      icon: <Home className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/lessons',
      label: 'Lessons',
      icon: <BookOpen className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/courses',
      label: 'Courses',
      icon: <FolderOpen className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/students',
      label: 'Students',
      icon: <Users className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/addons',
      label: 'Addons',
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
    // This would typically come from user data
    return 'Max plan'
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow lg:hidden"
      >
        {isMobileOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <PanelLeft className="w-5 h-5" strokeWidth={1.5} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Header with Logo and Toggle */}
        <div className={`h-16 flex items-center border-b border-gray-100 ${isCollapsed ? 'px-3 justify-center' : 'px-4 gap-3'}`}>
          {/* Toggle Button - shows collapse icon on hover when expanded */}
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
            onMouseEnter={() => setIsHoveringToggleButton(true)}
            onMouseLeave={() => setIsHoveringToggleButton(false)}
          >
            {!isCollapsed && isHoveringToggleButton ? (
              <PanelLeftClose className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
            ) : (
              <PanelLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
            )}
          </button>

          {/* App Name - hidden when collapsed */}
          {!isCollapsed && (
            <div className="flex items-center overflow-hidden">
              <span className="text-xl font-semibold text-gray-800">TutorSlides</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1 ${
                isActiveRoute(item.path)
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-50'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile Section - Now at the bottom */}
        <div className="p-2 border-t border-gray-100" ref={userMenuRef}>
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">
                  {getUserInitials()}
                </span>
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {user?.display_name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {getUserPlan()}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className={`absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden dropdown-animation z-[60] ${
                isCollapsed ? 'left-0 min-w-[240px]' : 'left-0 right-0'
              }`}>
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">
                        {getUserInitials()}
                      </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {user?.display_name || 'Display Name'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {getUserPlan()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 truncate">
                    {user?.email || 'email@example.com'}
                  </div>
                </div>

                {/* Menu Options */}
                <div className="py-1">
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" strokeWidth={1.5} />
                    Settings
                  </Link>
                  
                  <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <span className="flex items-center gap-3">
                      <Languages className="w-4 h-4" strokeWidth={1.5} />
                      Language
                    </span>
                    <ChevronDown className="w-4 h-4 rotate-[-90deg]" strokeWidth={1.5} />
                  </button>
                  
                  <Link
                    to="/dashboard/tutorials"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <GraduationCap className="w-4 h-4" strokeWidth={1.5} />
                    Tutorials
                  </Link>
                  
                  <Link
                    to="/dashboard/billing"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                    Upgrade plan
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        id="mobile-sidebar"
        className={`lg:hidden fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with App Name */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 mt-14">
          <span className="text-xl font-semibold text-gray-800">TutorSlides</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1 ${
                isActiveRoute(item.path)
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile Section - Mobile */}
        <div className="p-2 border-t border-gray-100">
          <div className="px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {user?.display_name || user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {getUserPlan()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu Options */}
          <div className="mt-2 space-y-1">
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" strokeWidth={1.5} />
              Settings
            </Link>
            
            <Link
              to="/dashboard/billing"
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              Upgrade plan
            </Link>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}