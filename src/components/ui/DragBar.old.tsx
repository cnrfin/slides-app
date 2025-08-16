// src/components/ui/DragBar.tsx
import { useState, useRef, useEffect } from 'react'

interface DragBarProps {
  onDrag?: (deltaY: number) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  className?: string
}

export default function DragBar({ 
  onDrag, 
  onDragStart, 
  onDragEnd,
  className = '' 
}: DragBarProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startYRef.current
      onDrag?.(deltaY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      onDragEnd?.()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, onDrag, onDragEnd])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startYRef.current = e.clientY
    onDragStart?.()
  }

  return (
    <div 
      className={`drag-bar-container ${className}`}
      style={{
        height: '34px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        cursor: isDragging ? 'ns-resize' : 'grab',
        userSelect: 'none',
        transition: 'background-color 0.2s ease',
        position: 'relative',
        marginBottom: '12px'
      }}
      onMouseDown={handleMouseDown}
      ref={dragRef}
    >
      {/* Drag Handle - Rounded Vertical Rectangle */}
      <div
        style={{
          width: '4px',
          height: '20px',
          backgroundColor: isDragging ? '#6b7280' : '#9ca3af',
          borderRadius: '2px',
          transition: 'all 0.2s ease',
          transform: isDragging ? 'scaleY(1.1)' : 'scaleY(1)',
          pointerEvents: 'none'
        }}
      />
      
      {/* Optional additional handle indicators */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          gap: '3px',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width: '4px',
            height: '20px',
            backgroundColor: isDragging ? '#6b7280' : '#9ca3af',
            borderRadius: '2px',
            opacity: 0.4,
            transition: 'all 0.2s ease'
          }}
        />
        <div
          style={{
            width: '4px',
            height: '20px',
            backgroundColor: isDragging ? '#6b7280' : '#9ca3af',
            borderRadius: '2px',
            transition: 'all 0.2s ease'
          }}
        />
        <div
          style={{
            width: '4px',
            height: '20px',
            backgroundColor: isDragging ? '#6b7280' : '#9ca3af',
            borderRadius: '2px',
            opacity: 0.4,
            transition: 'all 0.2s ease'
          }}
        />
      </div>

      {/* Hover effect overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: isDragging ? 'rgba(107, 114, 128, 0.1)' : 'transparent',
          borderRadius: '8px',
          transition: 'background-color 0.2s ease',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}
