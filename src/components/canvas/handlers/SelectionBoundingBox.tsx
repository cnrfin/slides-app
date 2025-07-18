// src/components/canvas/handlers/SelectionBoundingBox.tsx
import React, { useRef, useState, useEffect } from 'react'
import { Rect, Group } from 'react-konva'
import Konva from 'konva'
import { CANVAS_COLORS, SNAP_SETTINGS } from '@/utils/canvas.constants'
import { calculateSnapPosition, calculateElementDragSnapPosition } from '@/utils/snap.utils'
import type { SnapGuide } from '@/utils/snap.utils'
import type { SlideElement } from '@/types/slide.types'

interface SelectionBoundingBoxProps {
  x: number
  y: number
  width: number
  height: number
  selectedElements: SlideElement[]
  otherElements: SlideElement[]
  visible: boolean
  onDragStart?: () => void
  onDrag?: (deltaX: number, deltaY: number) => void
  onDragEnd?: (deltaX: number, deltaY: number) => void
  onResizeStart?: () => void
  onResize?: (scaleX: number, scaleY: number, newX: number, newY: number) => void
  onResizeEnd?: () => void
  onSnapGuidesChange?: (guides: SnapGuide[]) => void
}

const HANDLE_SIZE = 8
const BORDER_COLOR = '#0c8ce9'
const HANDLE_COLOR = '#ffffff'
const HANDLE_STROKE = '#0c8ce9'
const MIN_SIZE = 20

const SelectionBoundingBox = React.memo(function SelectionBoundingBox({
  x,
  y,
  width,
  height,
  selectedElements,
  otherElements,
  visible,
  onDragStart,
  onDrag,
  onDragEnd,
  onResizeStart,
  onResize,
  onResizeEnd,
  onSnapGuidesChange
}: SelectionBoundingBoxProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null)
  
  const initialMousePos = useRef<{ x: number; y: number } | null>(null)
  const initialBounds = useRef<{ x: number; y: number; width: number; height: number } | null>(null)
  const accumulatedDelta = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const resizeData = useRef<{
    handle: string
    initialMouseX: number
    initialMouseY: number
    shiftPressed: boolean
    aspectRatio: number
  } | null>(null)

  // Track shift key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && resizeData.current) {
        resizeData.current.shiftPressed = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && resizeData.current) {
        resizeData.current.shiftPressed = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Handle dragging
  const handleDragStart = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    
    setIsDragging(true)
    initialBounds.current = { x, y, width, height }
    accumulatedDelta.current = { x: 0, y: 0 }
    
    const stage = e.target.getStage()
    if (stage) {
      const pos = stage.getPointerPosition()
      if (pos) {
        initialMousePos.current = { x: pos.x, y: pos.y }
      }
    }
    
    if (onDragStart) {
      onDragStart()
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && initialMousePos.current && initialBounds.current) {
      // Handle dragging
      // Get the stage and transform group to convert screen to stage coordinates
      const stage = Konva.stages[0]
      if (!stage) return
      
      const transform = stage.findOne('#transform-group') as Konva.Group
      if (!transform) return
      
      // Get current mouse position in stage coordinates
      const pos = stage.getPointerPosition()
      if (!pos) return
      
      // Convert to canvas coordinates
      const scale = transform.scaleX()
      const transformPos = transform.position()
      
      const canvasX = (pos.x - transformPos.x) / scale
      const canvasY = (pos.y - transformPos.y) / scale
      
      // Calculate initial canvas position
      const initialCanvasX = (initialMousePos.current.x - transformPos.x) / scale
      const initialCanvasY = (initialMousePos.current.y - transformPos.y) / scale
      
      // Calculate delta in canvas coordinates
      const deltaX = canvasX - initialCanvasX
      const deltaY = canvasY - initialCanvasY
      
      const currentX = initialBounds.current.x + deltaX
      const currentY = initialBounds.current.y + deltaY
      
      // Check margin snapping
      const marginSnapResult = calculateSnapPosition(
        currentX,
        currentY,
        width,
        height
      )
      
      // Check element-to-element snapping
      const elementSnapResult = calculateElementDragSnapPosition(
        { x: currentX, y: currentY, width, height, id: 'selection-box' },
        otherElements
      )
      
      // Determine final position
      let finalX = currentX
      let finalY = currentY
      const guides: SnapGuide[] = []
      
      if (elementSnapResult.snappedX || elementSnapResult.snappedY) {
        if (elementSnapResult.snappedX) finalX = elementSnapResult.x
        if (elementSnapResult.snappedY) finalY = elementSnapResult.y
        guides.push(...elementSnapResult.snapGuides)
      } else if (marginSnapResult.snappedX || marginSnapResult.snappedY) {
        if (marginSnapResult.snappedX) finalX = marginSnapResult.x
        if (marginSnapResult.snappedY) finalY = marginSnapResult.y
        guides.push(...marginSnapResult.snapGuides)
      }
      
      // Calculate actual delta
      const actualDeltaX = finalX - initialBounds.current.x
      const actualDeltaY = finalY - initialBounds.current.y
      
      // Store accumulated delta
      accumulatedDelta.current = { x: actualDeltaX, y: actualDeltaY }
      
      if (onDrag) {
        onDrag(actualDeltaX, actualDeltaY)
      }
      
      if (onSnapGuidesChange) {
        onSnapGuidesChange(guides)
      }
    } else if (isResizing && resizeData.current && initialBounds.current) {
      // Handle resizing
      const data = resizeData.current
      const initial = initialBounds.current
      const dx = e.clientX - data.initialMouseX
      const dy = e.clientY - data.initialMouseY
      
      let newX = initial.x
      let newY = initial.y
      let newWidth = initial.width
      let newHeight = initial.height
      
      // Calculate new dimensions based on handle
      if (data.shiftPressed) {
        // Proportional resize
        let scaleFactor = 1
        
        switch (data.handle) {
          case 'top-left':
            scaleFactor = Math.max(
              (initial.width - dx) / initial.width,
              (initial.height - dy) / initial.height
            )
            newWidth = Math.max(MIN_SIZE, initial.width * scaleFactor)
            newHeight = Math.max(MIN_SIZE, initial.height * scaleFactor)
            newX = initial.x + initial.width - newWidth
            newY = initial.y + initial.height - newHeight
            break
          case 'top':
            scaleFactor = (initial.height - dy) / initial.height
            newHeight = Math.max(MIN_SIZE, initial.height * scaleFactor)
            newWidth = Math.max(MIN_SIZE, initial.width * scaleFactor)
            newX = initial.x + (initial.width - newWidth) / 2
            newY = initial.y + initial.height - newHeight
            break
          case 'top-right':
            scaleFactor = Math.max(
              (initial.width + dx) / initial.width,
              (initial.height - dy) / initial.height
            )
            newWidth = Math.max(MIN_SIZE, initial.width * scaleFactor)
            newHeight = Math.max(MIN_SIZE, initial.height * scaleFactor)
            newY = initial.y + initial.height - newHeight
            break
          case 'right':
            scaleFactor = (initial.width + dx) / initial.width
            newWidth = Math.max(MIN_SIZE, initial.width * scaleFactor)
            newHeight = Math.max(MIN_SIZE, initial.height * scaleFactor)
            newY = initial.y + (initial.height - newHeight) / 2
            break
          case 'bottom-right':
            scaleFactor = Math.max(
              (initial.width + dx) / initial.width,
              (initial.height + dy) / initial.height
            )
            newWidth = Math.max(MIN_SIZE, initial.width * scaleFactor)
            newHeight = Math.max(MIN_SIZE, initial.height * scaleFactor)
            break
          case 'bottom':
            scaleFactor = (initial.height + dy) / initial.height
            newHeight = Math.max(MIN_SIZE, initial.height * scaleFactor)
            newWidth = Math.max(MIN_SIZE, initial.width * scaleFactor)
            newX = initial.x + (initial.width - newWidth) / 2
            break
          case 'bottom-left':
            scaleFactor = Math.max(
              (initial.width - dx) / initial.width,
              (initial.height + dy) / initial.height
            )
            newWidth = Math.max(MIN_SIZE, initial.width * scaleFactor)
            newHeight = Math.max(MIN_SIZE, initial.height * scaleFactor)
            newX = initial.x + initial.width - newWidth
            break
          case 'left':
            scaleFactor = (initial.width - dx) / initial.width
            newWidth = Math.max(MIN_SIZE, initial.width * scaleFactor)
            newHeight = Math.max(MIN_SIZE, initial.height * scaleFactor)
            newX = initial.x + initial.width - newWidth
            newY = initial.y + (initial.height - newHeight) / 2
            break
        }
      } else {
        // Free resize
        switch (data.handle) {
          case 'top-left':
            newX = initial.x + dx
            newY = initial.y + dy
            newWidth = initial.width - dx
            newHeight = initial.height - dy
            break
          case 'top':
            newY = initial.y + dy
            newHeight = initial.height - dy
            break
          case 'top-right':
            newY = initial.y + dy
            newWidth = initial.width + dx
            newHeight = initial.height - dy
            break
          case 'right':
            newWidth = initial.width + dx
            break
          case 'bottom-right':
            newWidth = initial.width + dx
            newHeight = initial.height + dy
            break
          case 'bottom':
            newHeight = initial.height + dy
            break
          case 'bottom-left':
            newX = initial.x + dx
            newWidth = initial.width - dx
            newHeight = initial.height + dy
            break
          case 'left':
            newX = initial.x + dx
            newWidth = initial.width - dx
            break
        }
        
        // Ensure minimum size
        if (newWidth < MIN_SIZE) {
          if (data.handle.includes('left')) {
            newX = initial.x + initial.width - MIN_SIZE
          }
          newWidth = MIN_SIZE
        }
        
        if (newHeight < MIN_SIZE) {
          if (data.handle.includes('top')) {
            newY = initial.y + initial.height - MIN_SIZE
          }
          newHeight = MIN_SIZE
        }
      }
      
      // Calculate scale factors
      const scaleX = newWidth / initial.width
      const scaleY = newHeight / initial.height
      
      if (onResize) {
        onResize(scaleX, scaleY, newX, newY)
      }
    }
  }

  // Handle resize
  const handleResizeMouseDown = (e: Konva.KonvaEventObject<MouseEvent>, handle: string) => {
    e.cancelBubble = true
    
    const stage = e.target.getStage()
    if (!stage) return
    
    setIsResizing(true)
    initialBounds.current = { x, y, width, height }
    resizeData.current = {
      handle,
      initialMouseX: e.evt.clientX,
      initialMouseY: e.evt.clientY,
      shiftPressed: e.evt.shiftKey,
      aspectRatio: width / height
    }
    
    // Set cursor
    const cursor = getCursorForHandle(handle)
    document.body.style.cursor = cursor
    
    if (onResizeStart) {
      onResizeStart()
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      
      if (onDragEnd && accumulatedDelta.current) {
        onDragEnd(accumulatedDelta.current.x, accumulatedDelta.current.y)
      }
      
      if (onSnapGuidesChange) {
        onSnapGuidesChange([])
      }
    }
    
    if (isResizing) {
      setIsResizing(false)
      resizeData.current = null
      document.body.style.cursor = ''
      
      if (onResizeEnd) {
        onResizeEnd()
      }
    }
  }

  // Set up global mouse listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing])

  const getCursorForHandle = (handle: string) => {
    switch (handle) {
      case 'top':
      case 'bottom':
        return 'ns-resize'
      case 'left':
      case 'right':
        return 'ew-resize'
      case 'top-left':
      case 'bottom-right':
        return 'nwse-resize'
      case 'top-right':
      case 'bottom-left':
        return 'nesw-resize'
      default:
        return 'default'
    }
  }

  if (!visible || selectedElements.length <= 1) return null

  const handles = [
    { name: 'top-left', x: 0, y: 0 },
    { name: 'top', x: width / 2, y: 0 },
    { name: 'top-right', x: width, y: 0 },
    { name: 'right', x: width, y: height / 2 },
    { name: 'bottom-right', x: width, y: height },
    { name: 'bottom', x: width / 2, y: height },
    { name: 'bottom-left', x: 0, y: height },
    { name: 'left', x: 0, y: height / 2 },
  ]

  return (
    <Group x={x} y={y}>
      {/* Bounding box border */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        stroke={BORDER_COLOR}
        strokeWidth={1}
        dash={[5, 5]}
        fill="transparent"
        onMouseDown={handleDragStart}
        draggable={false}
        onMouseEnter={() => {
          const container = document.querySelector('.konvajs-content')
          if (container instanceof HTMLElement && !isDragging) {
            container.style.cursor = 'move'
          }
        }}
        onMouseLeave={() => {
          const container = document.querySelector('.konvajs-content')
          if (container instanceof HTMLElement && !isDragging && !isResizing) {
            container.style.cursor = 'default'
          }
        }}
      />
      
      {/* Resize handles */}
      {handles.map(handle => (
        <Rect
          key={handle.name}
          x={handle.x - HANDLE_SIZE / 2}
          y={handle.y - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill={HANDLE_COLOR}
          stroke={HANDLE_STROKE}
          strokeWidth={1}
          onMouseDown={(e) => handleResizeMouseDown(e, handle.name)}
          onMouseEnter={() => {
            setHoveredHandle(handle.name)
            const container = document.querySelector('.konvajs-content')
            if (container instanceof HTMLElement) {
              container.style.cursor = getCursorForHandle(handle.name)
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

export default SelectionBoundingBox
