// src/components/canvas/handlers/TextResizeHandler.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Group, Rect } from 'react-konva'
import Konva from 'konva'
import { calculateResizeSnapPosition, calculateElementToElementSnapPosition } from '@/utils/snap.utils'
import { CANVAS_COLORS, SNAP_SETTINGS } from '@/utils/canvas.constants'
import type { SlideElement } from '@/types/slide.types'

interface TextResizeHandlerProps {
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  elementId: string
  otherElements?: SlideElement[]
  visible?: boolean
  onResize: (newProps: {
    width?: number
    height?: number
    fontSize?: number
    x?: number
    y?: number
  }) => void
  onResizeEnd: () => void
}

type ResizeDirection = 'left' | 'right'

const HANDLE_SIZE = 8 // Square handles
const MIN_WIDTH = 50
const MIN_HEIGHT = 30

export default function TextResizeHandler({
  x,
  y,
  width,
  height,
  fontSize,
  elementId,
  otherElements = [],
  visible = true,
  onResize,
  onResizeEnd
}: TextResizeHandlerProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null)
  const [snapGuide, setSnapGuide] = useState<{ type: 'vertical' | 'horizontal'; position: number } | null>(null)
  
  // Store initial values when resize starts
  const initialPropsRef = useRef({ x, y, width, height, fontSize })
  const initialMouseRef = useRef({ x: 0, y: 0 })

  // Update stored props when they change (for dynamic height updates)
  useEffect(() => {
    if (!isResizing) {
      initialPropsRef.current = { x, y, width, height, fontSize }
    }
  }, [x, y, width, height, fontSize, isResizing])

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>, direction: ResizeDirection) => {
    e.cancelBubble = true
    
    const stage = e.target.getStage()
    if (!stage) return
    
    // Get the transform group to calculate relative position
    const transformGroup = stage.findOne('#transform-group') as Konva.Group
    if (!transformGroup) return
    
    const pos = transformGroup.getRelativePointerPosition()
    if (!pos) return
    
    setIsResizing(true)
    setResizeDirection(direction)
    initialMouseRef.current = { x: pos.x, y: pos.y }
    initialPropsRef.current = { x, y, width, height, fontSize }
  }, [x, y, width, height, fontSize])

  // Handle mouse move and mouse up
  useEffect(() => {
    if (!isResizing || !resizeDirection) return
    
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      // Get the stage from any Konva node
      const stage = Konva.stages[0]
      if (!stage) return
      
      const transformGroup = stage.findOne('#transform-group') as Konva.Group
      if (!transformGroup) return
      
      const pos = transformGroup.getRelativePointerPosition()
      if (!pos) return
      
      const deltaX = pos.x - initialMouseRef.current.x
      const initial = initialPropsRef.current
      
      let newProps: any = {}
      
      switch (resizeDirection) {
        case 'right': {
          const proposedWidth = Math.max(MIN_WIDTH, initial.width + deltaX)
          
          // Check margin snapping
          const marginSnapResult = calculateResizeSnapPosition(initial.x, proposedWidth, 'right')
          
          // Check element-to-element snapping
          const elementSnapResult = calculateElementToElementSnapPosition(
            { x: initial.x, y: initial.y, width: proposedWidth, height: initial.height, id: elementId },
            otherElements,
            'right'
          )
          
          // Use element snap if available, otherwise margin snap
          if (elementSnapResult.snappedX) {
            newProps.width = elementSnapResult.width
            if (elementSnapResult.snapGuides.length > 0) {
              setSnapGuide(elementSnapResult.snapGuides[0])
            } else {
              setSnapGuide(null)
            }
          } else if (marginSnapResult.snapped) {
            newProps.width = marginSnapResult.width
            if (marginSnapResult.snapGuide) {
              setSnapGuide(marginSnapResult.snapGuide)
            } else {
              setSnapGuide(null)
            }
          } else {
            newProps.width = proposedWidth
            setSnapGuide(null)
          }
          break
        }
          
        case 'left': {
          const proposedWidth = Math.max(MIN_WIDTH, initial.width - deltaX)
          const proposedX = initial.x + (initial.width - proposedWidth)
          
          // Check margin snapping
          const marginSnapResult = calculateResizeSnapPosition(proposedX, proposedWidth, 'left')
          
          // Check element-to-element snapping
          const elementSnapResult = calculateElementToElementSnapPosition(
            { x: proposedX, y: initial.y, width: proposedWidth, height: initial.height, id: elementId },
            otherElements,
            'left'
          )
          
          // Use element snap if available, otherwise margin snap
          if (elementSnapResult.snappedX) {
            newProps.width = elementSnapResult.width
            newProps.x = elementSnapResult.x
            if (elementSnapResult.snapGuides.length > 0) {
              setSnapGuide(elementSnapResult.snapGuides[0])
            } else {
              setSnapGuide(null)
            }
          } else if (marginSnapResult.snapped) {
            newProps.width = marginSnapResult.width
            newProps.x = marginSnapResult.x
            if (marginSnapResult.snapGuide) {
              setSnapGuide(marginSnapResult.snapGuide)
            } else {
              setSnapGuide(null)
            }
          } else {
            newProps.width = proposedWidth
            newProps.x = proposedX
            setSnapGuide(null)
          }
          break
        }
      }
      
      onResize(newProps)
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeDirection(null)
      setSnapGuide(null)
      onResizeEnd()
    }
    
    // Add global event listeners
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeDirection, onResize, onResizeEnd])

  if (!visible) return null

  return (
    <Group>
      {/* Selection border */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="#0c8ce9"
        strokeWidth={1}
        fill="transparent"
        listening={false}
      />
      
      {/* Left resize handle - square shape */}
      <Rect
        x={x - HANDLE_SIZE / 2}
        y={y + height / 2 - HANDLE_SIZE / 2}
        width={HANDLE_SIZE}
        height={HANDLE_SIZE}
        fill="#0c8ce9"
        cornerRadius={1}
        onMouseDown={(e) => handleMouseDown(e, 'left')}
        onMouseEnter={() => {
          const container = document.querySelector('.konvajs-content')
          if (container instanceof HTMLElement) {
            container.style.cursor = 'ew-resize'
          }
        }}
        onMouseLeave={() => {
          if (!isResizing) {
            const container = document.querySelector('.konvajs-content')
            if (container instanceof HTMLElement) {
              container.style.cursor = 'default'
            }
          }
        }}
      />
      
      {/* Right resize handle - square shape */}
      <Rect
        x={x + width - HANDLE_SIZE / 2}
        y={y + height / 2 - HANDLE_SIZE / 2}
        width={HANDLE_SIZE}
        height={HANDLE_SIZE}
        fill="#0c8ce9"
        cornerRadius={1}
        onMouseDown={(e) => handleMouseDown(e, 'right')}
        onMouseEnter={() => {
          const container = document.querySelector('.konvajs-content')
          if (container instanceof HTMLElement) {
            container.style.cursor = 'ew-resize'
          }
        }}
        onMouseLeave={() => {
          if (!isResizing) {
            const container = document.querySelector('.konvajs-content')
            if (container instanceof HTMLElement) {
              container.style.cursor = 'default'
            }
          }
        }}
      />
      
      {/* Snap guide */}
      {SNAP_SETTINGS.SHOW_GUIDES && snapGuide && (
        <Rect
          x={snapGuide.type === 'vertical' ? snapGuide.position : 0}
          y={snapGuide.type === 'horizontal' ? snapGuide.position : 0}
          width={snapGuide.type === 'vertical' ? SNAP_SETTINGS.GUIDE_WIDTH : 1000}
          height={snapGuide.type === 'horizontal' ? SNAP_SETTINGS.GUIDE_WIDTH : 1000}
          fill={snapGuide.elementId ? CANVAS_COLORS.ELEMENT_SNAP_GUIDE : CANVAS_COLORS.SNAP_GUIDE}
          opacity={snapGuide.elementId ? CANVAS_COLORS.ELEMENT_SNAP_GUIDE_ALPHA : CANVAS_COLORS.SNAP_GUIDE_ALPHA}
          listening={false}
        />
      )}
    </Group>
  )
}
