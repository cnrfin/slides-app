// src/components/dashboard/MinimalDashboardLayout.tsx
import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import HistorySidebar from './HistorySidebar'
import ToastContainer from '@/components/ui/Toast'
import useUIStore from '@/stores/uiStore'

export default function MinimalDashboardLayout() {
  const location = useLocation()
  const { isSidebarCollapsed } = useUIStore()
  const [sidebarWidth, setSidebarWidth] = useState(() => isSidebarCollapsed ? 60 : 300)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)
  
  // Only show history button on the dashboard home page
  const showHistorySidebar = location.pathname === '/dashboard'

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarWidth(event.detail.isCollapsed ? 60 : 300)
    }
    
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    window.addEventListener('sidebar:toggle' as any, handleSidebarToggle)
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('sidebar:toggle' as any, handleSidebarToggle)
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  // Update sidebar width when the store changes (e.g., from another tab)
  useEffect(() => {
    setSidebarWidth(isSidebarCollapsed ? 60 : 300)
  }, [isSidebarCollapsed])

  return (
    <div className="h-screen flex overflow-hidden bg-app-secondary-bg dark:bg-dark-bg">
      {/* Dashboard Content - Full height */}
      <Sidebar />
      
      {/* History Sidebar - only on dashboard home */}
      {showHistorySidebar && <HistorySidebar />}
      
      {/* Main Content Area - adjusts based on sidebar width */}
      <div 
        className="flex-1 p-2 overflow-hidden transition-all duration-300"
        style={{ 
          paddingLeft: isDesktop ? `${sidebarWidth}px` : '8px' 
        }}
      >
        {/* Content Wrapper */}
        <div 
          className="p-0.5 bg-white dark:bg-dark-bg rounded-lg overflow-hidden h-full page-bg"
          style={{ border: '1px solid rgba(126, 117, 114, 0.2)' }}
        >
          {/* Content Container */}
          <div className="p-6 overflow-y-auto overflow-x-auto h-full">
            <Outlet />
          </div>
        </div>
      </div>
      
      {/* Toast Container - Available for all dashboard pages */}
      <ToastContainer />
    </div>
  )
}