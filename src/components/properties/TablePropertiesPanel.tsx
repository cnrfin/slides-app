// src/components/properties/TablePropertiesPanel.tsx
import { useState, useEffect } from 'react'
import { Lock, Unlock } from 'lucide-react'
import useSlideStore, { useCurrentSlide, useSelectedElements } from '@/stores/slideStore'
import type { SlideElement, TableContent } from '@/types/slide.types'
import { CustomSlider } from '@/components/ui'

export default function TablePropertiesPanel() {
  const currentSlide = useCurrentSlide()
  const selectedElements = useSelectedElements()
  const { updateElement } = useSlideStore()
  
  // Get selected table elements
  const selectedTables = selectedElements.filter(el => el.type === 'table')
  const isMultiple = selectedTables.length > 1
  const firstTable = selectedTables[0]
  
  // Local state for properties
  const [opacity, setOpacity] = useState(100)
  const [isLocked, setIsLocked] = useState(false)
  
  // Initialize state from first selected table
  useEffect(() => {
    if (firstTable) {
      setOpacity(Math.round((firstTable.opacity ?? 1) * 100))
      setIsLocked(firstTable.locked || false)
    }
  }, [firstTable])
  
  // Handle opacity change
  const handleOpacityChange = (value: number) => {
    setOpacity(value)
    
    if (!currentSlide) return
    
    selectedTables.forEach(table => {
      updateElement(currentSlide.id, table.id, {
        opacity: value / 100
      })
    })
  }
  
  // Toggle lock
  const toggleLock = () => {
    if (!currentSlide) return
    
    const newLocked = !isLocked
    setIsLocked(newLocked)
    
    selectedTables.forEach(table => {
      updateElement(currentSlide.id, table.id, {
        locked: newLocked
      })
    })
  }
  
  if (selectedTables.length === 0) return null
  
  return (
    <div className="space-y-4">
      
      {/* Opacity */}
      <div className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-600">Opacity</label>
          <div className="relative">
            <input
              type="number"
              value={opacity}
              onChange={(e) => {
                const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                handleOpacityChange(value)
              }}
              className="w-[4.5rem] pl-3 pr-8 py-1 text-sm text-right bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">%</span>
          </div>
        </div>
        <CustomSlider
          value={opacity}
          onChange={handleOpacityChange}
          min={0}
          max={100}
          className="w-full"
        />
      </div>
      
      {/* Actions */}
      <div>
        <button
          onClick={toggleLock}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            isLocked
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isLocked ? (
            <>
              <Lock className="w-4 h-4" />
              Locked {isMultiple && `(${selectedTables.length})`}
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Unlocked {isMultiple && `(${selectedTables.length})`}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
