// src/components/ui/TabGroup.tsx
import React from 'react'

interface Tab {
  id: string
  label: string
  onClick?: () => void
}

interface TabGroupProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

/**
 * Reusable tab group component with consistent styling
 * Used across the app for Default/Custom, Elements/Slides, Round/Square selections
 */
export function TabGroup({ tabs, activeTab, onTabChange, className = '' }: TabGroupProps) {
  return (
    <div 
      className={`flex gap-1 p-1 ${className}`} 
      style={{ backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            onTabChange(tab.id)
            tab.onClick?.()
          }}
          className={`flex-1 px-3 py-1.5 text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          style={{ borderRadius: '0.375rem' }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// Export default for backward compatibility
export default TabGroup
