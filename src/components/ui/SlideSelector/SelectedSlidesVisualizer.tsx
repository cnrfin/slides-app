import React, { useState, useRef, useEffect } from 'react'
import { X, GripVertical, Copy, ChevronLeft, ChevronRight } from 'lucide-react'

import type { SelectedSlideInstance } from './types'

interface SelectedSlidesVisualizerProps {
  slides: SelectedSlideInstance[]
  onRemove: (instanceId: string) => void
  onDuplicate: (instanceId: string) => void
  onReorder: (slides: SelectedSlideInstance[]) => void
  disabled?: boolean
}

export const SelectedSlidesVisualizer: React.FC<SelectedSlidesVisualizerProps> = ({
  slides,
  onRemove,
  onDuplicate,
  onReorder,
  disabled = false
}) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    'title': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'warm-up': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'vocabulary': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'conversation': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'reading': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'review': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    'end': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'objectives': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'content': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  }

  // Check scroll position
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        setShowLeftScroll(scrollLeft > 0)
        setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }

    checkScroll()
    const container = scrollContainerRef.current
    container?.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)

    return () => {
      container?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [slides])

  const handleDragStart = (e: React.DragEvent, instanceId: string) => {
    if (disabled) return
    setDraggedItem(instanceId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, instanceId: string) => {
    if (disabled) return
    e.preventDefault()
    if (draggedItem && draggedItem !== instanceId) {
      setDragOverItem(instanceId)
    }
  }

  const handleDrop = (e: React.DragEvent, targetInstanceId: string) => {
    if (disabled || !draggedItem) return
    e.preventDefault()

    if (draggedItem === targetInstanceId) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    const draggedIndex = slides.findIndex(s => s.instanceId === draggedItem)
    const targetIndex = slides.findIndex(s => s.instanceId === targetInstanceId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newSlides = [...slides]
    const [draggedSlide] = newSlides.splice(draggedIndex, 1)
    newSlides.splice(targetIndex, 0, draggedSlide)

    // Update order numbers
    const reorderedSlides = newSlides.map((slide, index) => ({
      ...slide,
      order: index + 1
    }))

    onReorder(reorderedSlides)
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400 text-sm">
        No slides selected yet. Add slides from the templates above.
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {showLeftScroll && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          style={{ marginLeft: '-12px' }}
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
      )}
      {showRightScroll && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          style={{ marginRight: '-12px' }}
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      )}

      {/* Slides container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slides.map((slide, index) => {
          const colors = categoryColors[slide.category] || categoryColors['content']
          const isDragging = draggedItem === slide.instanceId
          const isDragOver = dragOverItem === slide.instanceId

          return (
            <div
              key={slide.instanceId}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, slide.instanceId)}
              onDragOver={(e) => handleDragOver(e, slide.instanceId)}
              onDrop={(e) => handleDrop(e, slide.instanceId)}
              onDragEnd={handleDragEnd}
              className={`group relative flex-shrink-0 w-32 p-3 rounded-lg border-2 transition-all cursor-move ${
                isDragging ? 'opacity-50' : ''
              } ${
                isDragOver ? 'scale-105 shadow-lg' : ''
              } ${
                disabled ? 'cursor-not-allowed opacity-50' : ''
              } ${colors.bg} ${colors.border}`}
              style={{
                transform: isDragOver ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.2s'
              }}
            >
              {/* Drag handle */}
              {!disabled && (
                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={14} className="text-gray-400" />
                </div>
              )}

              {/* Order number */}
              <div className={`absolute -top-2 -left-2 w-5 h-5 ${colors.bg} ${colors.text} border-2 border-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm`}>
                {slide.order}
              </div>

              {/* Actions */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onDuplicate(slide.instanceId)}
                  disabled={disabled}
                  className="p-1 bg-white rounded hover:bg-gray-100 transition-colors"
                  title="Duplicate"
                >
                  <Copy size={12} className="text-gray-600" />
                </button>
                <button
                  onClick={() => onRemove(slide.instanceId)}
                  disabled={disabled}
                  className="p-1 bg-white rounded hover:bg-red-100 transition-colors"
                  title="Remove"
                >
                  <X size={12} className="text-red-600" />
                </button>
              </div>

              {/* Content */}
              <div className="mt-2">
                <p className={`text-xs font-medium ${colors.text} truncate`}>
                  {slide.name}
                </p>
                <p className={`text-xs ${colors.text} opacity-75 mt-0.5`}>
                  {slide.category}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
