// src/components/properties/EffectsControls.tsx
import React, { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { CustomSlider, ColorOpacityControl } from '@/components/ui'
import type { ElementStyle, DropShadow } from '@/types/slide.types'

interface EffectsControlsProps {
  style: ElementStyle
  onChange: (updates: Partial<ElementStyle>) => void
  showBlur?: boolean
  showDropShadow?: boolean
}

export default function EffectsControls({ 
  style, 
  onChange,
  showBlur = true,
  showDropShadow = true
}: EffectsControlsProps) {
  // Local state for drop shadow
  const [dropShadowEnabled, setDropShadowEnabled] = useState(style.dropShadow?.enabled || false)
  const [dropShadow, setDropShadow] = useState<DropShadow>({
    enabled: false,
    offsetX: 0,
    offsetY: 4,
    blur: 8,
    spread: 0,
    color: '#000000',
    opacity: 0.25,
    ...style.dropShadow
  })
  
  // Local state for blur
  const [blurValue, setBlurValue] = useState(style.blur || 0)
  
  // Update local state when style changes
  useEffect(() => {
    if (style.dropShadow) {
      setDropShadow(style.dropShadow)
      setDropShadowEnabled(style.dropShadow.enabled)
    }
    setBlurValue(style.blur || 0)
  }, [style.dropShadow, style.blur])
  
  const handleDropShadowToggle = () => {
    const newEnabled = !dropShadowEnabled
    setDropShadowEnabled(newEnabled)
    const updatedShadow = { ...dropShadow, enabled: newEnabled }
    setDropShadow(updatedShadow)
    onChange({ dropShadow: updatedShadow })
  }
  
  const handleDropShadowChange = (field: keyof DropShadow, value: any) => {
    const updatedShadow = { ...dropShadow, [field]: value }
    setDropShadow(updatedShadow)
    onChange({ dropShadow: updatedShadow })
  }
  
  const handleBlurChange = (value: number) => {
    setBlurValue(value)
    onChange({ blur: value })
  }
  
  const hexToRgba = (hex: string, opacity: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      const r = parseInt(result[1], 16)
      const g = parseInt(result[2], 16)
      const b = parseInt(result[3], 16)
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    return hex
  }
  
  return (
    <div className="space-y-4">
      {/* Blur Effect */}
      {showBlur && (
        <div className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-600">Blur</label>
            <div className="relative">
              <input
                type="number"
                value={blurValue}
                onChange={(e) => handleBlurChange(Math.max(0, Math.min(20, parseFloat(e.target.value) || 0)))}
                className="w-[4.5rem] pl-3 pr-8 py-1 text-sm text-right bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="20"
                step="0.5"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">px</span>
            </div>
          </div>
          <CustomSlider
            value={blurValue}
            onChange={handleBlurChange}
            min={0}
            max={20}
            step={0.5}
            className="w-full"
          />
        </div>
      )}
      
      {/* Drop Shadow Effect */}
      {showDropShadow && (
        <div className="pb-3">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs text-gray-600">Drop Shadow</label>
            <button
              onClick={handleDropShadowToggle}
              className={`p-1.5 rounded transition-colors ${
                dropShadowEnabled
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={dropShadowEnabled ? 'Disable shadow' : 'Enable shadow'}
            >
              {dropShadowEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
          
          {dropShadowEnabled && (
            <div className="space-y-3 pl-2">
              {/* Offset X */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Offset X</label>
                <div className="flex items-center gap-2">
                  <CustomSlider
                    value={dropShadow.offsetX}
                    onChange={(value) => handleDropShadowChange('offsetX', value)}
                    min={-20}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={dropShadow.offsetX}
                    onChange={(e) => handleDropShadowChange('offsetX', parseFloat(e.target.value) || 0)}
                    className="w-14 px-2 py-1 text-xs text-center bg-gray-50 border border-gray-200 rounded"
                    min="-20"
                    max="20"
                  />
                </div>
              </div>
              
              {/* Offset Y */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Offset Y</label>
                <div className="flex items-center gap-2">
                  <CustomSlider
                    value={dropShadow.offsetY}
                    onChange={(value) => handleDropShadowChange('offsetY', value)}
                    min={-20}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={dropShadow.offsetY}
                    onChange={(e) => handleDropShadowChange('offsetY', parseFloat(e.target.value) || 0)}
                    className="w-14 px-2 py-1 text-xs text-center bg-gray-50 border border-gray-200 rounded"
                    min="-20"
                    max="20"
                  />
                </div>
              </div>
              
              {/* Blur */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Blur</label>
                <div className="flex items-center gap-2">
                  <CustomSlider
                    value={dropShadow.blur}
                    onChange={(value) => handleDropShadowChange('blur', value)}
                    min={0}
                    max={40}
                    step={1}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={dropShadow.blur}
                    onChange={(e) => handleDropShadowChange('blur', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-14 px-2 py-1 text-xs text-center bg-gray-50 border border-gray-200 rounded"
                    min="0"
                    max="40"
                  />
                </div>
              </div>
              
              {/* Spread */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Spread</label>
                <div className="flex items-center gap-2">
                  <CustomSlider
                    value={dropShadow.spread || 0}
                    onChange={(value) => handleDropShadowChange('spread', value)}
                    min={-10}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={dropShadow.spread || 0}
                    onChange={(e) => handleDropShadowChange('spread', parseFloat(e.target.value) || 0)}
                    className="w-14 px-2 py-1 text-xs text-center bg-gray-50 border border-gray-200 rounded"
                    min="-10"
                    max="10"
                  />
                </div>
              </div>
              
              {/* Shadow Color */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Shadow Color</label>
                <ColorOpacityControl
                  style={{ color: dropShadow.color }}
                  opacity={dropShadow.opacity || 0.25}
                  colorType="text"
                  onChange={(updates) => {
                    if (updates.color) {
                      handleDropShadowChange('color', updates.color)
                    }
                  }}
                  onOpacityChange={(opacity) => handleDropShadowChange('opacity', opacity)}
                  disableGradient={true}
                />
              </div>
              
              {/* Shadow Preview */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-2">Preview</div>
                <div className="flex items-center justify-center p-4 bg-white rounded">
                  <div
                    className="w-16 h-16 bg-blue-500 rounded"
                    style={{
                      boxShadow: `${dropShadow.offsetX}px ${dropShadow.offsetY}px ${dropShadow.blur}px ${dropShadow.spread || 0}px ${hexToRgba(dropShadow.color, dropShadow.opacity || 0.25)}`
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
