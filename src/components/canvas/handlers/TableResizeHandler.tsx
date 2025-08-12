// src/components/canvas/handlers/TableResizeHandler.tsx
import { useState, useCallback, useRef, useEffect } from 'react'
import { Group, Rect, Circle } from 'react-konva'
import Konva from 'konva'
import type { SlideElement, TableContent } from '@/types/slide.types'
import { CANVAS_COLORS } from '@/utils/canvas.constants'

interface TableResizeHandlerProps {
  x: number
  y: number
  width: number
  height: number
  elementId: string
  tableContent: TableContent
  otherElements: SlideElement[]
  visible: boolean
  onResize: (newProps: { width?: number; height?: number; x?: number; y?: number }) => void
  onResizeEnd: () => void
  onColumnResize?: (columnIndex: number, newWidth: number) => void
  onRowResize?: (rowIndex: number, newHeight: number) => void
}

export default function TableResizeHandler({
  x,
  y,
  width,
  height,
  elementId,
  tableContent,
  otherElements,
  visible,
  onResize,
  onResizeEnd,
  onColumnResize,
  onRowResize
}: TableResizeHandlerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<'column' | 'row' | null>(null)
  const [dragIndex, setDragIndex] = useState<number>(-1)
  const startPosRef = useRef({ x: 0, y: 0 })
  const startSizeRef = useRef({ width: 0, height: 0 })
  
  const cellWidth = width / tableContent.columns
  const cellHeight = height / tableContent.rows
  
  // Column resize handles
  const columnHandles = Array.from({ length: tableContent.columns - 1 }, (_, i) => ({
    x: x + (i + 1) * cellWidth,
    y: y,
    height: height,
    index: i
  }))
  
  // Row resize handles
  const rowHandles = Array.from({ length: tableContent.rows - 1 }, (_, i) => ({
    x: x,
    y: y + (i + 1) * cellHeight,
    width: width,
    index: i
  }))
  
  const handleColumnDragStart = useCallback((e: Konva.KonvaEventObject<DragEvent>, index: number) => {
    setIsDragging(true)
    setDragType('column')
    setDragIndex(index)
    startPosRef.current = { x: e.target.x(), y: e.target.y() }
    startSizeRef.current = { width, height }
  }, [width, height])
  
  const handleRowDragStart = useCallback((e: Konva.KonvaEventObject<DragEvent>, index: number) => {
    setIsDragging(true)
    setDragType('row')
    setDragIndex(index)
    startPosRef.current = { x: e.target.x(), y: e.target.y() }
    startSizeRef.current = { width, height }
  }, [width, height])
  
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setDragType(null)
    setDragIndex(-1)
    onResizeEnd()
  }, [onResizeEnd])
  
  if (!visible) return null
  
  return (
    <Group>
      {/* Column resize handles */}
      {columnHandles.map((handle, i) => (
        <Group key={`col-${i}`}>
          {/* Invisible hit area */}
          <Rect
            x={handle.x - 3}
            y={handle.y}
            width={6}
            height={handle.height}
            fill="transparent"
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container()
              if (container) {
                container.style.cursor = 'col-resize'
              }
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container()
              if (container && !isDragging) {
                container.style.cursor = 'default'
              }
            }}
            draggable
            onDragStart={(e) => handleColumnDragStart(e, i)}
            onDragMove={(e) => {
              const deltaX = e.target.x() - (handle.x - 3)
              // Update column width
              if (onColumnResize) {
                onColumnResize(i, cellWidth + deltaX)
              }
            }}
            onDragEnd={handleDragEnd}
            dragBoundFunc={(pos) => ({
              x: Math.max(x + cellWidth * 0.5, Math.min(x + width - cellWidth * 0.5, pos.x)),
              y: handle.y
            })}
          />
          {/* Visual indicator on hover */}
          <Rect
            x={handle.x - 1}
            y={handle.y}
            width={2}
            height={handle.height}
            fill="#3b82f6"
            opacity={0}
            listening={false}
          />
        </Group>
      ))}
      
      {/* Row resize handles */}
      {rowHandles.map((handle, i) => (
        <Group key={`row-${i}`}>
          {/* Invisible hit area */}
          <Rect
            x={handle.x}
            y={handle.y - 3}
            width={handle.width}
            height={6}
            fill="transparent"
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container()
              if (container) {
                container.style.cursor = 'row-resize'
              }
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container()
              if (container && !isDragging) {
                container.style.cursor = 'default'
              }
            }}
            draggable
            onDragStart={(e) => handleRowDragStart(e, i)}
            onDragMove={(e) => {
              const deltaY = e.target.y() - (handle.y - 3)
              // Update row height
              if (onRowResize) {
                onRowResize(i, cellHeight + deltaY)
              }
            }}
            onDragEnd={handleDragEnd}
            dragBoundFunc={(pos) => ({
              x: handle.x,
              y: Math.max(y + cellHeight * 0.5, Math.min(y + height - cellHeight * 0.5, pos.y))
            })}
          />
          {/* Visual indicator on hover */}
          <Rect
            x={handle.x}
            y={handle.y - 1}
            width={handle.width}
            height={2}
            fill="#3b82f6"
            opacity={0}
            listening={false}
          />
        </Group>
      ))}
      
      {/* Corner resize handles for overall table size */}
      <Circle
        x={x + width}
        y={y + height}
        radius={4}
        fill="#3b82f6"
        stroke="#ffffff"
        strokeWidth={1}
        draggable
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container()
          if (container) {
            container.style.cursor = 'nwse-resize'
          }
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container()
          if (container) {
            container.style.cursor = 'default'
          }
        }}
        onDragMove={(e) => {
          const newWidth = Math.max(100, e.target.x() - x)
          const newHeight = Math.max(60, e.target.y() - y)
          onResize({ width: newWidth, height: newHeight })
        }}
        onDragEnd={handleDragEnd}
        dragBoundFunc={(pos) => ({
          x: Math.max(x + 100, pos.x),
          y: Math.max(y + 60, pos.y)
        })}
      />
    </Group>
  )
}
