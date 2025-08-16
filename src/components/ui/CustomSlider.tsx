// src/components/ui/CustomSlider.tsx
import React from 'react'

interface CustomSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export default function CustomSlider({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  className = ''
}: CustomSliderProps) {
  
  const percentage = ((value - min) / (max - min)) * 100
  
  return (
    <div className={`custom-slider-container flex items-center ${className}`}>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="custom-slider"
        style={{
          background: `linear-gradient(to right, #d1d5db 0%, #d1d5db ${percentage}%, #f9fafb ${percentage}%, #f9fafb 100%)`
        }}
      />
      
      <style jsx>{`
        .custom-slider-container {
          position: relative;
          width: 100%;
        }
        
        .custom-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 28px;
          border-radius: 6px;
          background: #f9fafb;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        /* Webkit browsers (Chrome, Safari, Edge) */
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 34px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          cursor: grab;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .custom-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(0.95);
        }
        
        /* Firefox */
        .custom-slider::-moz-range-thumb {
          width: 20px;
          height: 34px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          cursor: grab;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .custom-slider::-moz-range-thumb:active {
          cursor: grabbing;
          transform: scale(0.95);
        }
        
        /* Track styling for Firefox */
        .custom-slider::-moz-range-track {
          height: 28px;
          border-radius: 6px;
          background: transparent;
        }
        
        /* Focus styles */
        .custom-slider:focus {
          box-shadow: 0 0 0 2px rgba(229, 231, 235, 0.3);
        }
        
        .custom-slider:focus::-webkit-slider-thumb {
          border-color: #d1d5db;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        }
        
        .custom-slider:focus::-moz-range-thumb {
          border-color: #d1d5db;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  )
}
