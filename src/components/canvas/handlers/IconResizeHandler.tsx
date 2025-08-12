// src/components/canvas/handlers/IconResizeHandler.tsx
import React, { useRef, useState, useEffect } from 'react'
import { Group, Rect, Circle } from 'react-konva'
import Konva from 'konva'
import useSlideStore, { useCurrentSlide } from '@/stores/slideStore'
import { CANVAS_COLORS } from '@/utils/canvas.constants'
import { getIconBounds } from '@/utils/icon.utils'
import type { SlideElement, IconContent } from '@/types/slide.types'

interface IconResizeHandlerProps {
  element: SlideElement
  isSelected: boolean
  isHovered?: boolean
  onUpdate?: () => void
}

const HANDLE_SIZE = 8
const HANDLE_COLOR = '#ffffff'
const HANDLE_STROKE = '#3b82f6'
const MIN_SIZE = 20

const IconResizeHandler = React.memo(function IconResizeHandler({
  element,
  isSelected,
  isHovered = false,
  onUpdate
}: IconResizeHandlerProps) {
  const currentSlide = useCurrentSlide()
  const { updateElement, batchUpdateElements } = useSlideStore()
  
  // Get the actual icon bounds
  const iconContent = element.content as IconContent
  const iconBounds = getIconBounds(iconContent.iconId)
  
  // Calculate the actual icon position and size based on bounds
  // Icons are drawn in a 24x24 viewBox, and bounds define the actual icon area
  const boundsScaleX = iconBounds.width / 24
  const boundsScaleY = iconBounds.height / 24
  const boundsOffsetX = iconBounds.x / 24
  const boundsOffsetY = iconBounds.y / 24
  
  const iconActualX = element.x + (element.width * boundsOffsetX)
  const iconActualY = element.y + (element.height * boundsOffsetY)
  const iconActualWidth = element.width * boundsScaleX
  const iconActualHeight = element.height * boundsScaleY
  
  const [isResizing, setIsResizing] = useState(false)
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null)
  
  const initialState = useRef<{
    width: number
    height: number
    x: number
    y: number
    elementX: number
    elementY: number
    elementWidth: number
    elementHeight: number
    mouseX: number
    mouseY: number
    handle: string
  } | null>(null)

  // Handle mouse move for resizing
  useEffect(() => {
    if (!isResizing || !initialState.current || !currentSlide) return

    const handleMouseMove = (e: MouseEvent) => {
      const { handle, mouseX, mouseY, width, height, x, y, elementX, elementY, elementWidth, elementHeight } = initialState.current!
      
      const deltaX = e.clientX - mouseX
      const deltaY = e.clientY - mouseY
      
      let newX = x
      let newY = y
      let newWidth = width
      let newHeight = height
      
      // Maintain aspect ratio for icons
      const aspectRatio = width / height
      
      switch (handle) {
        case 'top-left':
          // When dragging top-left, we're changing both position and size
          const tlDelta = Math.min(deltaX / aspectRatio, deltaY)
          newWidth = Math.max(MIN_SIZE, width - tlDelta * aspectRatio)
          newHeight = Math.max(MIN_SIZE, height - tlDelta)
          newX = x + (width - newWidth)
          newY = y + (height - newHeight)
          break
          
        case 'top-right':
          // When dragging top-right
          const trDelta = Math.max(deltaX / aspectRatio, -deltaY)
          newWidth = Math.max(MIN_SIZE, width + trDelta * aspectRatio)
          newHeight = Math.max(MIN_SIZE, height + trDelta)
          newY = y + (height - newHeight)
          break
          
        case 'bottom-right':
          // When dragging bottom-right
          const brDelta = Math.max(deltaX / aspectRatio, deltaY)
          newWidth = Math.max(MIN_SIZE, width + brDelta * aspectRatio)
          newHeight = Math.max(MIN_SIZE, height + brDelta)
          break
          
        case 'bottom-left':
          // When dragging bottom-left
          const blDelta = Math.max(-deltaX / aspectRatio, deltaY)
          newWidth = Math.max(MIN_SIZE, width + blDelta * aspectRatio)
          newHeight = Math.max(MIN_SIZE, height + blDelta)
          newX = x + (width - newWidth)
          break
      }
      
      // Calculate the scale factor
      const scaleFactor = newWidth / width
      
      // Calculate new element dimensions (including padding)
      const newElementWidth = elementWidth * scaleFactor
      const newElementHeight = elementHeight * scaleFactor
      
      // Calculate new element position to maintain the icon's visual position
      const newElementX = newX - (newElementWidth * boundsOffsetX)
      const newElementY = newY - (newElementHeight * boundsOffsetY)
      
      // Update the element with full bounds
      updateElement(currentSlide.id, element.id, {
        x: newElementX,
        y: newElementY,
        width: newElementWidth,
        height: newElementHeight
      })
      
      if (onUpdate) onUpdate()
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      initialState.current = null
      document.body.style.cursor = ''
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, currentSlide, element.id, updateElement, onUpdate])

  const handleResizeStart = (e: Konva.KonvaEventObject<MouseEvent>, handle: string) => {
    e.cancelBubble = true
    setIsResizing(true)
    
    initialState.current = {
      width: iconActualWidth,
      height: iconActualHeight,
      x: iconActualX,
      y: iconActualY,
      elementX: element.x,
      elementY: element.y,
      elementWidth: element.width,
      elementHeight: element.height,
      mouseX: e.evt.clientX,
      mouseY: e.evt.clientY,
      handle
    }
    
    // Set appropriate cursor
    const cursors: Record<string, string> = {
      'top-left': 'nwse-resize',
      'top-right': 'nesw-resize',
      'bottom-right': 'nwse-resize',
      'bottom-left': 'nesw-resize'
    }
    document.body.style.cursor = cursors[handle] || 'default'
  }

  // Show hover border even when not selected
  if (!isSelected && !isHovered) return null
  if (element.locked && !isHovered) return null

  const handles = [
    { name: 'top-left', x: 0, y: 0 },
    { name: 'top-right', x: iconActualWidth, y: 0 },
    { name: 'bottom-right', x: iconActualWidth, y: iconActualHeight },
    { name: 'bottom-left', x: 0, y: iconActualHeight },
  ]

  return (
    <Group x={iconActualX} y={iconActualY} rotation={element.rotation || 0}>
      {/* Hover or Selection border - fits to actual icon bounds */}
      <Rect
        x={0}
        y={0}
        width={iconActualWidth}
        height={iconActualHeight}
        stroke={isHovered && !isSelected ? '#9ca3af' : HANDLE_STROKE}
        strokeWidth={isHovered && !isSelected ? 1 : 2}
        fill="transparent"
        listening={false}
      />
      
      {/* Resize handles - corner only for icons to maintain aspect ratio, only show when selected */}
      {isSelected && !element.locked && handles.map(handle => (
        <Circle
          key={handle.name}
          x={handle.x}
          y={handle.y}
          radius={HANDLE_SIZE / 2}
          fill={hoveredHandle === handle.name ? HANDLE_STROKE : HANDLE_COLOR}
          stroke={HANDLE_STROKE}
          strokeWidth={1}
          onMouseDown={(e) => handleResizeStart(e, handle.name)}
          onMouseEnter={() => {
            setHoveredHandle(handle.name)
            const cursors: Record<string, string> = {
              'top-left': 'nwse-resize',
              'top-right': 'nesw-resize',
              'bottom-right': 'nwse-resize',
              'bottom-left': 'nesw-resize'
            }
            const container = document.querySelector('.konvajs-content')
            if (container instanceof HTMLElement) {
              container.style.cursor = cursors[handle.name] || 'default'
            }
          }}
          onMouseLeave={() => {
            setHoveredHandle(null)
            const container = document.querySelector('.konvajs-content')
            if (container instanceof HTMLElement && !isResizing) {
              container.style.cursor = 'default'
            }
          }}
        />
      ))}
    </Group>
  )
})

export default IconResizeHandler
