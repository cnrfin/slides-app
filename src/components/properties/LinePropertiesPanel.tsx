// src/components/properties/LinePropertiesPanel.tsx
import { useState, useEffect } from 'react'
import { 
  Lock,
  Unlock
} from 'lucide-react'
import useSlideStore from '@/stores/slideStore'
import { useSelectedElements, useCurrentSlide } from '@/stores/slideStore'
import type { ElementStyle, LineContent } from '@/types/slide.types'
import { ColorOpacityControl, CustomSlider, TabGroup } from '@/components/ui'

interface LinePropertiesPanelProps {
  className?: string
}

export default function LinePropertiesPanel({ className = '' }: LinePropertiesPanelProps) {
  const selectedElements = useSelectedElements()
  const currentSlide = useCurrentSlide()
  const updateElement = useSlideStore((state) => state.updateElement)
  
  // Get all selected line elements
  const lineElements = selectedElements.filter(el => el.type === 'line')
  const firstLineElement = lineElements[0]
  const lineContent = firstLineElement?.content as LineContent | undefined
  const style = firstLineElement?.style || {}
  
  const [opacityValue, setOpacityValue] = useState(Math.round((firstLineElement?.opacity || 1) * 100))
  
  // Update opacity value when element changes
  useEffect(() => {
    setOpacityValue(Math.round((firstLineElement?.opacity || 1) * 100))
  }, [firstLineElement?.id, firstLineElement?.opacity])
  
  // If no line elements are selected, return null
  if (lineElements.length === 0 || !currentSlide || !lineContent) {
    return null
  }
  
  const updateStyle = (updates: Partial<ElementStyle>) => {
    // Update all selected line elements
    lineElements.forEach(element => {
      const newStyle = { ...element.style, ...updates }
      updateElement(currentSlide.id, element.id, { style: newStyle })
    })
  }
  
  const updateContent = (updates: Partial<LineContent>) => {
    // Update all selected line elements
    lineElements.forEach(element => {
      const elementContent = element.content as LineContent
      const newContent = { ...elementContent, ...updates }
      updateElement(currentSlide.id, element.id, { content: newContent })
    })
  }
  
  const handleOpacityChange = (opacity: number) => {
    setOpacityValue(Math.round(opacity * 100))
    // Update all selected line elements
    lineElements.forEach(element => {
      updateElement(currentSlide.id, element.id, { opacity })
    })
  }
  
  return (
    <div className={`space-y-1 ${className}`}>
      {/* Stroke with integrated Opacity */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">Stroke</label>
        <ColorOpacityControl
          style={style}
          opacity={firstLineElement?.opacity || 1}
          colorType="stroke"
          onChange={updateStyle}
          onOpacityChange={handleOpacityChange}
          disableGradient={true}
        />
      </div>
      
      {/* Thickness */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">Thickness</label>
        <div className="flex items-center gap-3">
          <CustomSlider
            value={style.borderWidth || 2}
            onChange={(value) => updateStyle({ borderWidth: value })}
            min={1}
            max={20}
            className="flex-1"
          />
          <div className="relative">
            <input
              type="number"
              value={style.borderWidth || 2}
              onChange={(e) => updateStyle({ borderWidth: Math.max(1, Math.min(20, Number(e.target.value))) })}
              className="w-[4.5rem] pl-3 pr-8 py-1 bg-gray-50 text-gray-800 text-sm rounded border border-gray-200 appearance-none focus:outline-none focus:border-blue-500 text-right"
              min="1"
              max="20"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">px</span>
          </div>
        </div>
      </div>
      
      {/* End Points Style */}
      <div className="pb-3">
        <label className="text-xs text-gray-600 block mb-2">End Points</label>
        <TabGroup
          tabs={[
            { id: 'butt', label: 'Square', onClick: () => updateContent({ lineCap: 'butt' }) },
            { id: 'round', label: 'Round', onClick: () => updateContent({ lineCap: 'round' }) }
          ]}
          activeTab={lineContent.lineCap || 'round'}
          onTabChange={() => {}}
        />
      </div>
      
      {/* Actions */}
      <div>
        <button
          onClick={() => {
            const newLocked = !firstLineElement.locked
            lineElements.forEach(el => {
              updateElement(currentSlide.id, el.id, { locked: newLocked })
            })
          }}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            firstLineElement.locked
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {firstLineElement.locked ? (
            <>
              <Lock className="w-4 h-4" />
              Locked {lineElements.length > 1 && `(${lineElements.length})`}
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Unlocked {lineElements.length > 1 && `(${lineElements.length})`}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
