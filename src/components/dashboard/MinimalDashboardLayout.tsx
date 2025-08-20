// src/components/dashboard/MinimalDashboardLayout.tsx
import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import HistorySidebar from './HistorySidebar'

export default function MinimalDashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Load sidebar state from localStorage, default to collapsed
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved !== null ? JSON.parse(saved) : true
  })
  
  const location = useLocation()

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }
  
  // Only show history button on the dashboard home page
  const showHistorySidebar = location.pathname === '/dashboard'

  return (
    <div className="min-h-screen bg-white">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={handleToggleSidebar}
      />
      
      {/* History Sidebar - only on dashboard home */}
      {showHistorySidebar && <HistorySidebar />}
      
      {/* Main Content Area - uses padding-left instead of margin-left */}
      <div 
        className={`min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        <Outlet />
      </div>
    </div>
  )
}
