// src/components/properties/CircularTailSelector.tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import type { BlurbContent } from '@/types/slide.types'

interface CircularTailSelectorProps {
  value: BlurbContent['tailPosition']
  onChange: (position: BlurbContent['tailPosition']) => void
  className?: string
}

// Map tail positions to angles (in degrees)
const POSITION_ANGLES: Record<BlurbContent['tailPosition'], number> = {
  'top-center': 0,
  'top-right': 45,
  'right-center': 90,
  'bottom-right': 135,
  'bottom-center': 180,
  'bottom-left': 225,
  'left-center': 270,
  'top-left': 315,
}

// Reverse mapping for angle to position
const ANGLE_POSITIONS = Object.entries(POSITION_ANGLES).reduce((acc, [pos, angle]) => {
  acc[angle] = pos as BlurbContent['tailPosition']
  return acc
}, {} as Record<number, BlurbContent['tailPosition']>)

export default function CircularTailSelector({ value, onChange, className = '' }: CircularTailSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [currentAngle, setCurrentAngle] = useState(POSITION_ANGLES[value || 'bottom-center'])
  
  // Update angle when value changes externally
  useEffect(() => {
    setCurrentAngle(POSITION_ANGLES[value || 'bottom-center'])
  }, [value])
  
  // Calculate angle from mouse/touch position
  const calculateAngle = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return currentAngle
    
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const dx = clientX - centerX
    const dy = clientY - centerY
    
    // Calculate angle in degrees (0° is top, clockwise)
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI)
    if (angle < 0) angle += 360
    
    return angle
  }, [currentAngle])
  
  // Snap to nearest position
  const snapToPosition = useCallback((angle: number) => {
    const positions = Object.values(POSITION_ANGLES)
    let minDiff = 360
    let closestAngle = 0
    
    for (const pos of positions) {
      const diff = Math.min(
        Math.abs(angle - pos),
        Math.abs(angle - pos + 360),
        Math.abs(angle - pos - 360)
      )
      if (diff < minDiff) {
        minDiff = diff
        closestAngle = pos
      }
    }
    
    return closestAngle
  }, [])
  
  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const angle = calculateAngle(clientX, clientY)
    const snappedAngle = snapToPosition(angle)
    setCurrentAngle(snappedAngle)
    
    const position = ANGLE_POSITIONS[snappedAngle]
    if (position && position !== value) {
      onChange(position)
    }
  }, [calculateAngle, snapToPosition, value, onChange])
  
  // Handle drag move
  useEffect(() => {
    if (!isDragging) return
    
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      
      const angle = calculateAngle(clientX, clientY)
      const snappedAngle = snapToPosition(angle)
      setCurrentAngle(snappedAngle)
      
      const position = ANGLE_POSITIONS[snappedAngle]
      if (position && position !== value) {
        onChange(position)
      }
    }
    
    const handleEnd = () => {
      setIsDragging(false)
    }
    
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove)
    document.addEventListener('touchend', handleEnd)
    
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, calculateAngle, snapToPosition, value, onChange])
  
  // Handle clicking on the dial track
  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    
    // Check if click is on the track (not in the center hole)
    const distance = Math.sqrt(dx * dx + dy * dy)
    const innerRadius = 24 // Inner hole radius (adjusted for smaller size)
    const outerRadius = 45 // Outer track radius (adjusted for smaller size)
    
    if (distance >= innerRadius && distance <= outerRadius) {
      const angle = calculateAngle(e.clientX, e.clientY)
      const snappedAngle = snapToPosition(angle)
      setCurrentAngle(snappedAngle)
      
      const position = ANGLE_POSITIONS[snappedAngle]
      if (position && position !== value) {
        onChange(position)
      }
    }
  }, [calculateAngle, snapToPosition, value, onChange])
  
  return (
    <div className={`relative ${className}`}>
      {/* Simple dial - 25% smaller (84px instead of 112px) */}
      <div 
        ref={containerRef}
        className="relative mx-auto cursor-pointer"
        style={{ width: '84px', height: '84px' }}
        onClick={handleTrackClick}
      >
        {/* Dial track - donut shape */}
        <svg 
          viewBox="0 0 84 84" 
          className="absolute inset-0 w-full h-full"
        >
          {/* Outer ring */}
          <circle
            cx="42"
            cy="42"
            r="33"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="18"
          />
          
          {/* Small notches for each position */}
          {Object.values(POSITION_ANGLES).map((angle) => {
            const radian = (angle - 90) * (Math.PI / 180)
            const x1 = 42 + 31 * Math.cos(radian)
            const y1 = 42 + 31 * Math.sin(radian)
            const x2 = 42 + 35 * Math.cos(radian)
            const y2 = 42 + 35 * Math.sin(radian)
            
            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9ca3af"
                strokeWidth="1.5"
              />
            )
          })}
        </svg>
        
        {/* Draggable handle */}
        <div
          className={`absolute w-4 h-4 bg-gray-700 rounded-full shadow-md cursor-grab transform -translate-x-1/2 -translate-y-1/2 transition-shadow ${
            isDragging ? 'cursor-grabbing shadow-lg' : 'hover:shadow-lg'
          }`}
          style={{
            left: `${42 + 33 * Math.cos((currentAngle - 90) * Math.PI / 180)}px`,
            top: `${42 + 33 * Math.sin((currentAngle - 90) * Math.PI / 180)}px`,
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        />
      </div>
    </div>
  )
}