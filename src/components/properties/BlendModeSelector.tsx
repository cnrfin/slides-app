// src/components/properties/BlendModeSelector.tsx
import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import type { BlendMode } from '@/types/slide.types'

interface BlendModeSelectorProps {
  value: BlendMode | undefined
  onChange: (blendMode: BlendMode) => void
  className?: string
}

const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
]

export default function BlendModeSelector({ value = 'normal', onChange, className = '' }: BlendModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const selectedMode = BLEND_MODES.find(mode => mode.value === value) || BLEND_MODES[0]
  
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  return (
    <div className={`${className}`}>
      <div className="relative" ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 bg-white text-gray-800 text-sm rounded-lg border border-gray-200 appearance-none cursor-pointer hover:bg-gray-50 focus:outline-none focus:border-blue-500 flex items-center justify-between"
        >
          <span>{selectedMode.label}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div 
            className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto"
            style={{
              bottom: buttonRef.current && window.innerHeight - buttonRef.current.getBoundingClientRect().bottom < 320 
                ? '100%' 
                : 'auto',
              marginBottom: buttonRef.current && window.innerHeight - buttonRef.current.getBoundingClientRect().bottom < 320 
                ? '8px' 
                : '0'
            }}
          >
            {BLEND_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => {
                  onChange(mode.value)
                  setIsOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                  mode.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-800'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        )}
      </div>
      

    </div>
  )
}
