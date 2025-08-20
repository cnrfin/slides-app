// src/components/dashboard/Sidebar.tsx
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import {
  ChevronRight,
  ChevronLeft,
  Home,
  BookOpen,
  Users,
  Video,
  Settings,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  X
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
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Home',
      icon: <Home className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/lessons',
      label: 'My Lessons',
      icon: <BookOpen className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/students',
      label: 'Students',
      icon: <Users className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/tutorials',
      label: 'Tutorials',
      icon: <Video className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/canvas',
      label: 'New Canvas',
      icon: <FileText className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" strokeWidth={1.5} />
    },
    {
      path: '/dashboard/billing',
      label: 'Billing',
      icon: <CreditCard className="w-5 h-5" strokeWidth={1.5} />
    }
  ]

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar')
      if (sidebar && !sidebar.contains(event.target as Node)) {
        setIsMobileOpen(false)
      }
    }

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileOpen])

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

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow lg:hidden"
      >
        {isMobileOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
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
        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-600" strokeWidth={1.5} />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-600" strokeWidth={1.5} />
          )}
        </button>

        {/* User Profile */}
        <div className={`p-4 border-b border-gray-100 ${isCollapsed ? 'px-3' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {getUserInitials()}
              </span>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="font-medium text-gray-900 truncate">
                  {user?.display_name || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email}
                </div>
              </div>
            )}
          </div>
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

        {/* Sign Out */}
        <div className="p-2 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        id="mobile-sidebar"
        className={`lg:hidden fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* User Profile */}
        <div className="p-4 border-b border-gray-100 mt-14">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {getUserInitials()}
              </span>
            </div>
            <div className="overflow-hidden">
              <div className="font-medium text-gray-900 truncate">
                {user?.display_name || 'User'}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email}
              </div>
            </div>
          </div>
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

        {/* Sign Out */}
        <div className="p-2 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
