// src/components/canvas/handlers/ShapeResizeHandler.tsx
import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Rect, Group } from 'react-konva'
import Konva from 'konva'
import { CANVAS_DIMENSIONS, CANVAS_COLORS, SNAP_SETTINGS } from '@/utils/canvas.constants'
import { calculateShapeResizeSnapPosition, calculateElementToElementSnapPosition } from '@/utils/snap.utils'
import type { SnapGuide } from '@/utils/snap.utils'
import type { SlideElement } from '@/types/slide.types'

interface ShapeResizeHandlerProps {
  x: number
  y: number
  width: number
  height: number
  elementId: string
  elementType?: 'shape' | 'image' | 'blurb' | 'table' | 'icon'
  aspectRatio?: number // Fixed aspect ratio for certain shapes
  otherElements?: SlideElement[]
  visible: boolean
  onResize: (newProps: {
    x?: number
    y?: number
    width?: number
    height?: number
  }) => void
  onResizeStart?: () => void
  onResizeEnd?: () => void
}

const HANDLE_SIZE = 8
const BORDER_COLOR = '#0c8ce9'
const HANDLE_COLOR = '#ffffff'
const HANDLE_STROKE = '#0c8ce9'
const DEFAULT_MIN_SIZE = 20
const BLURB_MIN_WIDTH = 150
const BLURB_MIN_HEIGHT = 50

const ShapeResizeHandler = React.memo(function ShapeResizeHandler({
  x,
  y,
  width,
  height,
  elementId,
  elementType = 'shape',
  aspectRatio,
  otherElements = [],
  visible,
  onResize,
  onResizeStart,
  onResizeEnd
}: ShapeResizeHandlerProps) {
  // Set minimum size based on element type
  const MIN_WIDTH = elementType === 'blurb' ? BLURB_MIN_WIDTH : DEFAULT_MIN_SIZE
  const MIN_HEIGHT = elementType === 'blurb' ? BLURB_MIN_HEIGHT : DEFAULT_MIN_SIZE
  const [isResizing, setIsResizing] = useState(false)
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null)
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([])
  const initialMousePos = useRef<{ x: number; y: number } | null>(null)
  const initialProps = useRef<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const resizeData = useRef<{
    handle: string
    shiftPressed: boolean
    aspectRatio: number
  } | null>(null)
  const lastUpdateTime = useRef<number>(0)
  const animationFrameId = useRef<number | null>(null)

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

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>, handle: string) => {
    e.cancelBubble = true
    
    const stage = e.target.getStage()
    if (!stage) return
    
    const pos = stage.getPointerPosition()
    if (!pos) return
    
    setIsResizing(true)
    
    // Store initial values
    initialMousePos.current = { x: e.evt.clientX, y: e.evt.clientY }
    initialProps.current = { x, y, width, height }
    resizeData.current = {
      handle,
      shiftPressed: e.evt.shiftKey,
      aspectRatio: aspectRatio || (width / height)
    }
    
    // Set cursor based on handle
    const cursor = getCursorForHandle(handle)
    document.body.style.cursor = cursor
    
    // Call resize start callback
    if (onResizeStart) {
      onResizeStart()
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizeData.current || !initialMousePos.current || !initialProps.current) return
    
    // Throttle updates to 60fps
    const now = Date.now()
    if (now - lastUpdateTime.current < 16) return
    lastUpdateTime.current = now
    
    const data = resizeData.current
    const initial = initialProps.current
    const dx = e.clientX - initialMousePos.current.x
    const dy = e.clientY - initialMousePos.current.y
    
    let newX = initial.x
    let newY = initial.y
    let newWidth = initial.width
    let newHeight = initial.height
    
    // Only maintain aspect ratio when shift is pressed
    // Exception: arrows and certain decorative shapes always maintain ratio
    const alwaysMaintainRatio = aspectRatio !== undefined && (
      elementType === 'arrow' || // This would need to be passed in
      // For now, check if aspectRatio is one of the arrow ratios
      aspectRatio === 0.6 || aspectRatio === 1.67 ||
      // Or one of the decorative shapes that should keep ratio
      aspectRatio === 1.08 || aspectRatio === 1.25 || aspectRatio === 0.75
    )
    const maintainAspectRatio = alwaysMaintainRatio || data.shiftPressed
    
    // Handle resize based on which handle is being dragged
    switch (data.handle) {
      case 'top-left':
        if (maintainAspectRatio) {
          // Proportional resize from opposite corner
          const scaleFactor = Math.max(
            (initial.width - dx) / initial.width,
            (initial.height - dy) / initial.height
          )
          newWidth = Math.max(MIN_WIDTH, initial.width * scaleFactor)
          newHeight = Math.max(MIN_HEIGHT, initial.height * scaleFactor)
          newX = initial.x + initial.width - newWidth
          newY = initial.y + initial.height - newHeight
        } else {
          newWidth = Math.max(MIN_WIDTH, initial.width - dx)
          newHeight = Math.max(MIN_HEIGHT, initial.height - dy)
          newX = initial.x + dx
          newY = initial.y + dy
          // Constrain position if size hits minimum
          if (newWidth === MIN_WIDTH) newX = initial.x + initial.width - MIN_WIDTH
          if (newHeight === MIN_HEIGHT) newY = initial.y + initial.height - MIN_HEIGHT
        }
        break
        
      case 'top':
        newHeight = Math.max(MIN_HEIGHT, initial.height - dy)
        newY = initial.y + dy
        if (newHeight === MIN_HEIGHT) newY = initial.y + initial.height - MIN_HEIGHT
        if (maintainAspectRatio) {
          // Maintain aspect ratio
          newWidth = Math.max(MIN_WIDTH, newHeight * data.aspectRatio)
          newX = initial.x + (initial.width - newWidth) / 2
        }
        break
        
      case 'top-right':
        if (maintainAspectRatio) {
          // Proportional resize
          const scaleFactor = Math.max(
            (initial.width + dx) / initial.width,
            (initial.height - dy) / initial.height
          )
          newWidth = Math.max(MIN_WIDTH, initial.width * scaleFactor)
          newHeight = Math.max(MIN_HEIGHT, initial.height * scaleFactor)
          newY = initial.y + initial.height - newHeight
        } else {
          newWidth = Math.max(MIN_WIDTH, initial.width + dx)
          newHeight = Math.max(MIN_HEIGHT, initial.height - dy)
          newY = initial.y + dy
          if (newHeight === MIN_HEIGHT) newY = initial.y + initial.height - MIN_HEIGHT
        }
        break
        
      case 'right':
        newWidth = Math.max(MIN_WIDTH, initial.width + dx)
        if (maintainAspectRatio) {
          // Maintain aspect ratio
          newHeight = Math.max(MIN_HEIGHT, newWidth / data.aspectRatio)
          newY = initial.y + (initial.height - newHeight) / 2
        }
        break
        
      case 'bottom-right':
        if (maintainAspectRatio) {
          // Proportional resize
          const scaleFactor = Math.max(
            (initial.width + dx) / initial.width,
            (initial.height + dy) / initial.height
          )
          newWidth = Math.max(MIN_WIDTH, initial.width * scaleFactor)
          newHeight = Math.max(MIN_HEIGHT, initial.height * scaleFactor)
        } else {
          newWidth = Math.max(MIN_WIDTH, initial.width + dx)
          newHeight = Math.max(MIN_HEIGHT, initial.height + dy)
        }
        break
        
      case 'bottom':
        newHeight = Math.max(MIN_HEIGHT, initial.height + dy)
        if (maintainAspectRatio) {
          // Maintain aspect ratio
          newWidth = Math.max(MIN_WIDTH, newHeight * data.aspectRatio)
          newX = initial.x + (initial.width - newWidth) / 2
        }
        break
        
      case 'bottom-left':
        if (maintainAspectRatio) {
          // Proportional resize
          const scaleFactor = Math.max(
            (initial.width - dx) / initial.width,
            (initial.height + dy) / initial.height
          )
          newWidth = Math.max(MIN_WIDTH, initial.width * scaleFactor)
          newHeight = Math.max(MIN_HEIGHT, initial.height * scaleFactor)
          newX = initial.x + initial.width - newWidth
        } else {
          newWidth = Math.max(MIN_WIDTH, initial.width - dx)
          newHeight = Math.max(MIN_HEIGHT, initial.height + dy)
          newX = initial.x + dx
          if (newWidth === MIN_WIDTH) newX = initial.x + initial.width - MIN_WIDTH
        }
        break
        
      case 'left':
        newWidth = Math.max(MIN_WIDTH, initial.width - dx)
        newX = initial.x + dx
        if (newWidth === MIN_WIDTH) newX = initial.x + initial.width - MIN_WIDTH
        if (maintainAspectRatio) {
          // Maintain aspect ratio
          newHeight = Math.max(MIN_HEIGHT, newWidth / data.aspectRatio)
          newY = initial.y + (initial.height - newHeight) / 2
        }
        break
    }

    
    // Apply snapping to margins
    const marginSnapResult = calculateShapeResizeSnapPosition(
      newX,
      newY,
      newWidth,
      newHeight,
      data.handle
    )
    
    // Apply element-to-element snapping
    const elementSnapResult = calculateElementToElementSnapPosition(
      { x: newX, y: newY, width: newWidth, height: newHeight, id: elementId },
      otherElements,
      data.handle
    )
    
    // Combine snap results - element snapping takes priority
    const guides: SnapGuide[] = []
    
    if (elementSnapResult.snappedX || elementSnapResult.snappedY) {
      // Use element snap results
      newX = elementSnapResult.x
      newY = elementSnapResult.y
      newWidth = elementSnapResult.width
      newHeight = elementSnapResult.height
      guides.push(...elementSnapResult.snapGuides)
    } else if (marginSnapResult.snappedX || marginSnapResult.snappedY) {
      // Fall back to margin snap results
      newX = marginSnapResult.x
      newY = marginSnapResult.y
      newWidth = marginSnapResult.width
      newHeight = marginSnapResult.height
      guides.push(...marginSnapResult.snapGuides)
    }
    
    setSnapGuides(guides)
    
    // Round to nearest pixel
    newX = Math.round(newX)
    newY = Math.round(newY)
    newWidth = Math.round(newWidth)
    newHeight = Math.round(newHeight)
    
    onResize({ x: newX, y: newY, width: newWidth, height: newHeight })
  }

  const handleMouseUp = () => {
    if (!isResizing) return
    
    setIsResizing(false)
    initialMousePos.current = null
    initialProps.current = null
    resizeData.current = null
    document.body.style.cursor = ''
    setSnapGuides([]) // Clear snap guides
    
    // Cancel any pending animation frame
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }
    
    if (onResizeEnd) {
      onResizeEnd()
    }
  }

  // Set up global mouse listeners for resize
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing])

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

  if (!visible) return null

  const handles = useMemo(() => [
    { name: 'top-left', x: 0, y: 0 },
    { name: 'top', x: width / 2, y: 0 },
    { name: 'top-right', x: width, y: 0 },
    { name: 'right', x: width, y: height / 2 },
    { name: 'bottom-right', x: width, y: height },
    { name: 'bottom', x: width / 2, y: height },
    { name: 'bottom-left', x: 0, y: height },
    { name: 'left', x: 0, y: height / 2 },
  ], [width, height])

  return (
    <Group x={x} y={y}>
      {/* Border */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        stroke={BORDER_COLOR}
        strokeWidth={1}
        listening={false}
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
          onMouseDown={(e) => handleMouseDown(e, handle.name)}
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
      
      {/* Snap guides */}
      {SNAP_SETTINGS.SHOW_GUIDES && snapGuides.map((guide, index) => (
        <Rect
          key={`snap-guide-${index}`}
          x={guide.type === 'vertical' ? guide.position - x : guide.start - x}
          y={guide.type === 'horizontal' ? guide.position - y : guide.start - y}
          width={guide.type === 'vertical' ? SNAP_SETTINGS.GUIDE_WIDTH : guide.end - guide.start}
          height={guide.type === 'horizontal' ? SNAP_SETTINGS.GUIDE_WIDTH : guide.end - guide.start}
          fill={guide.elementId ? CANVAS_COLORS.ELEMENT_SNAP_GUIDE : CANVAS_COLORS.SNAP_GUIDE}
          opacity={guide.elementId ? CANVAS_COLORS.ELEMENT_SNAP_GUIDE_ALPHA : CANVAS_COLORS.SNAP_GUIDE_ALPHA}
          listening={false}
        />
      ))}
    </Group>
  )
})

export default ShapeResizeHandler
