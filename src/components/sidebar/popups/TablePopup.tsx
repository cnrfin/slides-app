import { useState, useRef, useEffect } from 'react'
import useSlideStore from '@/stores/slideStore'
import type { TableContent } from '@/types/slide.types'

interface TablePopupProps {
  isOpen: boolean
  onClose: () => void
  anchorElement: HTMLElement | null
}

export default function TablePopup({ isOpen, onClose, anchorElement }: TablePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const [selectedSize, setSelectedSize] = useState<{ rows: number; cols: number } | null>(null)
  
  const { slides, currentSlideId, addElement } = useSlideStore()
  const currentSlide = slides.find(s => s.id === currentSlideId)
  
  // Maximum grid size shown
  const MAX_ROWS = 8
  const MAX_COLS = 8
  
  // Calculate popup position
  useEffect(() => {
    if (isOpen && anchorElement) {
      const calculatePosition = () => {
        const rect = anchorElement.getBoundingClientRect()
        const popupWidth = 240 // Fixed width from style
        const popupHeight = 260 // Reduced height since quick buttons removed
        
        // Position to the right of the button
        let left = rect.right + 8
        let top = rect.top
        
        // Check if popup would go off screen
        if (left + popupWidth > window.innerWidth) {
          left = rect.left - popupWidth - 8
        }
        
        // Ensure popup doesn't go below viewport
        if (top + popupHeight > window.innerHeight) {
          top = window.innerHeight - popupHeight - 8
        }
        
        setPosition({ top, left })
      }
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(calculatePosition, 0)
      return () => clearTimeout(timer)
    } else if (!isOpen) {
      // Reset position when closing
      setPosition(null)
      setHoveredCell(null)
      setSelectedSize(null)
    }
  }, [isOpen, anchorElement])
  
  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
          anchorElement && !anchorElement.contains(event.target as Node)) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, anchorElement])
  
  const handleAddTable = (rows: number, cols: number) => {
    if (!currentSlide) return
    
    // Calculate table dimensions
    const cellWidth = 100
    const cellHeight = 40
    const tableWidth = Math.min(cols * cellWidth, 800) // Max width 800px
    const tableHeight = Math.min(rows * cellHeight, 600) // Max height 600px
    
    // Calculate actual cell dimensions within the table
    const actualCellWidth = tableWidth / cols
    const actualCellHeight = tableHeight / rows
    
    // Position table in center of canvas
    const tableX = 400 - tableWidth / 2
    const tableY = 300 - tableHeight / 2
    
    // Create cells data structure
    const cells: TableContent['cells'] = []
    for (let r = 0; r < rows; r++) {
      const row = []
      for (let c = 0; c < cols; c++) {
        row.push({
          text: '',
          style: {
            fontSize: 14,
            color: '#000000',
            textAlign: 'center' as const,
            verticalAlign: 'middle' as const,
          }
        })
      }
      cells.push(row)
    }
    
    // Initialize column widths and row heights
    const columnWidths = Array(cols).fill(actualCellWidth)
    const rowHeights = Array(rows).fill(actualCellHeight)
    
    const tableContent: TableContent = {
      rows,
      columns: cols,
      cells,
      headerRow: false,
      headerColumn: false,
      columnWidths,
      rowHeights
    }
    
    // Add the table element
    addElement(currentSlide.id, {
      type: 'table',
      x: tableX,
      y: tableY,
      width: tableWidth,
      height: tableHeight,
      content: tableContent,
      style: {
        borderColor: '#d1d5db',
        borderWidth: 1,
        backgroundColor: '#ffffff',
      },
    })
    
    onClose()
  }
  
  const handleCellHover = (row: number, col: number) => {
    setHoveredCell({ row, col })
    setSelectedSize({ rows: row + 1, cols: col + 1 })
  }
  
  const handleCellClick = (row: number, col: number) => {
    handleAddTable(row + 1, col + 1)
  }
  
  if (!isOpen || !position) return null
  
  return (
    <div 
      ref={popupRef}
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 z-50 animate-popup-in overflow-hidden"
      style={{ top: position.top, left: position.left, width: '240px' }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Insert Table</h3>
          {selectedSize && (
            <span className="text-xs text-gray-500">
              {selectedSize.cols} × {selectedSize.rows}
            </span>
          )}
        </div>
        
        {/* Grid Selector */}
        <div className="relative">
          <div 
            className="grid p-2 bg-gray-50 rounded-lg"
            style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 22px)',
              gridTemplateRows: 'repeat(8, 22px)',
              gap: '2px'
            }}
            onMouseLeave={() => {
              setHoveredCell(null)
              setSelectedSize(null)
            }}
          >
            {Array.from({ length: MAX_ROWS }, (_, row) => (
              Array.from({ length: MAX_COLS }, (_, col) => (
                <button
                  key={`${row}-${col}`}
                  className={`
                    w-5 h-5 rounded border transition-all duration-150
                    ${hoveredCell && row <= hoveredCell.row && col <= hoveredCell.col
                      ? 'bg-blue-500 border-blue-600'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                    }
                  `}
                  onMouseEnter={() => handleCellHover(row, col)}
                  onClick={() => handleCellClick(row, col)}
                  aria-label={`Select ${col + 1} × ${row + 1} table`}
                />
              ))
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
