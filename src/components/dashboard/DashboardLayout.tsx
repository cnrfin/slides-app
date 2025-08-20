// src/components/dashboard/DashboardLayout.tsx
import { useState, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import { 
  Home, 
  BookOpen, 
  Users, 
  PlayCircle, 
  Settings, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react'

export default function DashboardLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error: any) {
      console.error('Sign out error:', error)
    }
  }

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/dashboard/lessons', icon: BookOpen, label: 'Lessons' },
    { path: '/dashboard/students', icon: Users, label: 'Students' },
    { path: '/dashboard/tutorials', icon: PlayCircle, label: 'Tutorials' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
    { path: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-semibold text-gray-800">Figma Slides</h1>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isSidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Menu */}
        <div className="border-t border-gray-200 p-4">
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`
                w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors
                ${isSidebarCollapsed ? 'justify-center' : ''}
              `}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user?.display_name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </div>
                </div>
              )}
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                
                {/* Menu */}
                <div className={`
                  absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50
                  ${isSidebarCollapsed ? 'left-0' : 'right-0 left-0'}
                `}>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
