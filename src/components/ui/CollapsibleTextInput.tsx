import React, { useState, useRef, useEffect, useCallback } from 'react'

interface CollapsibleTextInputProps {
  placeholder?: string
  onSubmit?: (text: string) => void
  onHeightChange?: (totalHeight: number) => void // New callback for height changes
  minHeight?: number
  maxHeight?: number
  defaultHeight?: number
  canvasWidth?: number
  canvasMargin?: number
}

const CollapsibleTextInput: React.FC<CollapsibleTextInputProps> = ({
  placeholder = "Add a prompt...",
  onSubmit,
  onHeightChange,
  minHeight = 0,
  maxHeight = 400,
  defaultHeight = 0,
  canvasWidth = 800,
  canvasMargin = 16
}) => {
  const [contentHeight, setContentHeight] = useState(defaultHeight)
  const [isDragging, setIsDragging] = useState(false)
  const [text, setText] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dragStartY = useRef(0)
  const dragStartHeight = useRef(0)

  // Notify parent of height changes
  useEffect(() => {
    if (onHeightChange) {
      // Total height includes drag handle (32px) + content height
      const totalHeight = 32 + contentHeight
      onHeightChange(totalHeight)
    }
  }, [contentHeight, onHeightChange])

  // Handle mouse down on drag handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartY.current = e.clientY
    dragStartHeight.current = contentHeight
    document.body.style.cursor = 'ns-resize'
    document.body.style.userSelect = 'none'
  }, [contentHeight])

  // Handle mouse move during drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      // Invert the delta to make dragging up expand the container
      const deltaY = dragStartY.current - e.clientY
      const newHeight = Math.max(minHeight, Math.min(maxHeight, dragStartHeight.current + deltaY))
      setContentHeight(newHeight)
    }

    const handleMouseUp = () => {
      if (!isDragging) return
      
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      
      // Auto-collapse if dragged to near minimum height
      if (contentHeight < 20) {
        setIsAnimating(true)
        setContentHeight(0)
        setTimeout(() => setIsAnimating(false), 200)
      }
      // Auto-expand if dragged above threshold
      else if (contentHeight > 20 && contentHeight < 100) {
        setIsAnimating(true)
        setContentHeight(200)
        setTimeout(() => {
          setIsAnimating(false)
          if (textareaRef.current) {
            textareaRef.current.focus()
          }
        }, 200)
      }
      // Focus textarea if expanded
      else if (contentHeight > 0 && textareaRef.current) {
        textareaRef.current.focus()
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, contentHeight, minHeight, maxHeight])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && onSubmit && text.trim()) {
      e.preventDefault()
      onSubmit(text)
      setText('') // Clear after submit
    }
    // ESC to collapse
    else if (e.key === 'Escape' && isExpanded) {
      e.preventDefault()
      setIsAnimating(true)
      setContentHeight(0)
      setTimeout(() => setIsAnimating(false), 200)
    }
  }

  const isExpanded = contentHeight > 0

  // Handle clicking on drag handle when collapsed to expand
  const handleDragHandleClick = useCallback(() => {
    if (!isExpanded && !isDragging) {
      setIsAnimating(true)
      setContentHeight(200)
      setTimeout(() => {
        setIsAnimating(false)
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 200)
    }
  }, [isExpanded, isDragging])

  // Add Cmd/Ctrl + K shortcut to toggle expansion
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!isExpanded) {
          handleDragHandleClick()
        } else {
          setIsAnimating(true)
          setContentHeight(0)
          setTimeout(() => setIsAnimating(false), 200)
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isExpanded, handleDragHandleClick])

  const handleGenerate = useCallback(() => {
    if (onSubmit && text.trim()) {
      onSubmit(text)
      setText('')
    }
  }, [text, onSubmit])

  return (
    <div
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50"
      style={{ 
        width: `${canvasWidth}px`,
        marginBottom: `${canvasMargin}px`,
      }}
    >
      {/* Drag Handle - Always visible, no background */}
      <div
        className="h-8 flex items-center justify-center cursor-ns-resize"
        onMouseDown={handleMouseDown}
        onClick={handleDragHandleClick}
      >
        <div className={`w-10 h-1 rounded-full transition-colors ${
          isExpanded ? 'bg-gray-400' : 'bg-gray-500'
        }`} />
      </div>
      
      {/* Content Container - Height controlled by drag */}
      <div
        className={`bg-white/90 backdrop-blur-sm shadow-lg overflow-hidden ${
          isAnimating ? 'transition-all duration-200 ease-out' : ''
        }`}
        style={{ 
          height: `${contentHeight}px`,
          borderRadius: '16px',
          boxShadow: contentHeight > 0 ? '0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)' : 'none'
        }}
      >
        {isExpanded && (
          <div className="h-full px-5 pt-4 pb-14 flex flex-col relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full h-full resize-none outline-none text-[15px] text-gray-700 placeholder-gray-400 leading-relaxed bg-transparent"
              style={{ 
                minHeight: `${Math.max(50, contentHeight - 70)}px`
              }}
            />
            
            {/* Bottom Toolbar - Only Generate button */}
            <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-end px-4 border-t border-gray-100 bg-white/50">
              <button 
                className="px-4 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleGenerate}
                disabled={!text.trim()}
                tabIndex={-1}
              >
                Generate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CollapsibleTextInput
