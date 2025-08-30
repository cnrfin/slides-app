// src/components/ui/ExportDropdown.tsx
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import GoogleDriveIcon from '@/components/ui/GoogleDriveIcon'
import { useGoogleDriveStatus } from '@/hooks/useAddons'

interface ExportDropdownProps {
  onExportAll: () => void
  onExportCurrent: () => void
  onSaveToDrive?: () => void
  className?: string
}

export default function ExportDropdown({ 
  onExportAll, 
  onExportCurrent,
  onSaveToDrive,
  className = ''
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const { enabled: driveEnabled } = useGoogleDriveStatus()
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

  const handleSaveToDrive = async () => {
    setIsOpen(false)
    onSaveToDrive?.()
    
    // Show success feedback
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
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
          ${justSaved ? 'bg-green-500 hover:bg-green-600' : ''}
        `}
        style={{ transition: 'all 100ms ease-out' }}
        title="Export options"
      >
        {justSaved ? (
          <>
            <Check className="w-3 h-3" strokeWidth={2} />
            Saved
          </>
        ) : (
          <>
            Export
            <ChevronDown 
              className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              strokeWidth={2}
            />
          </>
        )}
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
            className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            style={{
              animation: 'exportDropdownFadeIn 150ms ease-out',
            }}
          >
            <button
              onClick={handleExportAll}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors group"
            >
              <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">Export all slides</div>
              <div className="text-xs text-gray-500 mt-0.5">Download as PDF</div>
            </button>

            <div className="h-px bg-gray-100 mx-2 my-1" />

            <button
              onClick={handleExportCurrent}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors group"
            >
              <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">Export current slide</div>
              <div className="text-xs text-gray-500 mt-0.5">Download as PDF</div>
            </button>

            {driveEnabled && (
              <>
                <div className="h-px bg-gray-100 mx-2 my-1" />
                
                <button
                  onClick={handleSaveToDrive}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <GoogleDriveIcon className="w-4 h-4" />
                    <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">
                      Export to Google Drive
                    </div>
                  </div>
                </button>
              </>
            )}

            {!driveEnabled && (
              <>
                <div className="h-px bg-gray-100 mx-2 my-1" />
                
                <a
                  href="/dashboard/addons"
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors group block"
                >
                  <div className="flex items-center gap-2">
                    <GoogleDriveIcon className="w-4 h-4 opacity-50" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        Enable Google Drive
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Connect in Addons settings
                      </div>
                    </div>
                  </div>
                </a>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}