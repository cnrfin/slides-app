// src/components/ui/ExportDropdown.tsx
import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface ExportDropdownProps {
  onExportAll: () => void
  onExportCurrent: () => void
  className?: string
}

export default function ExportDropdown({ 
  onExportAll, 
  onExportCurrent,
  className = ''
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleExportAll = () => {
    setIsOpen(false)
    onExportAll()
  }

  const handleExportCurrent = () => {
    setIsOpen(false)
    onExportCurrent()
  }

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseDown={(e) => { 
          if (!isOpen) {
            e.currentTarget.style.transform = 'scale(0.95)'; 
          }
        }}
        onMouseUp={(e) => { 
          e.currentTarget.style.transform = 'scale(1)'; 
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.transform = 'scale(1)'; 
        }}
        className={`
          px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
          text-sm font-medium flex items-center gap-1
          ${isOpen ? 'bg-blue-600' : ''}
        `}
        style={{ transition: 'all 100ms ease-out' }}
        title="Export options"
      >
        Export
        <ChevronDown 
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          strokeWidth={2}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <style>
            {`
              @keyframes exportDropdownFadeIn {
                from {
                  opacity: 0;
                  transform: translateY(-4px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
          <div
            ref={dropdownRef}
            className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            style={{
              animation: 'exportDropdownFadeIn 150ms ease-out',
            }}
          >
            <button
              onClick={handleExportAll}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors group"
            >
              <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">Export all</div>
              <div className="text-xs text-gray-500 mt-0.5">Downloads all slides as a PDF</div>
            </button>

            <div className="h-px bg-gray-100 mx-2 my-1" />

            <button
              onClick={handleExportCurrent}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors group"
            >
              <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">Export current</div>
              <div className="text-xs text-gray-500 mt-0.5">Downloads the current slide as a PDF</div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
