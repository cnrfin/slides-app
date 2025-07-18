// src/components/canvas/InlineTextEditor.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { measureWrappedText } from '@/utils/text.utils'

interface InlineTextEditorProps {
  text: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontFamily: string
  fontWeight?: string
  fontStyle?: string
  letterSpacing?: number
  lineHeight?: number
  textDecoration?: string
  listStyle?: 'bullet' | 'none'
  color: string
  gradientStart?: string
  gradientEnd?: string
  gradientAngle?: number
  textAlign?: 'left' | 'center' | 'right'
  onTextChange: (newText: string, newHeight?: number, isTyping?: boolean) => void
  onEditEnd: () => void
  scale?: number
}

export default function InlineTextEditor({
  text,
  x,
  y,
  width,
  height,
  fontSize,
  fontFamily,
  fontWeight = '400',
  fontStyle = 'normal',
  letterSpacing = 0,
  lineHeight = 1.2,
  textDecoration = 'none',
  listStyle = 'none',
  color,
  gradientStart,
  gradientEnd,
  gradientAngle = 0,
  textAlign = 'left',
  onTextChange,
  onEditEnd,
  scale = 1
}: InlineTextEditorProps) {
  // Strip bullets from text for editing
  const stripBullets = (text: string) => {
    if (listStyle === 'bullet') {
      return text.split('\n').map(line => {
        // Remove bullet character and following space
        return line.replace(/^•\s*/, '')
      }).join('\n')
    }
    return text
  }
  
  const [value, setValue] = useState(stripBullets(text))
  const [currentHeight, setCurrentHeight] = useState(height)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isUpdatingRef = useRef(false)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      // Select all text only if it's placeholder text
      if (text === 'Text' || text === 'Type here' || text === 'Your Title Here' || text === 'Your subtitle or description') {
        textareaRef.current.select()
      } else {
        // Place cursor at end
        textareaRef.current.setSelectionRange(text.length, text.length)
      }
      // Initial height adjustment
      adjustHeight()
    }
  }, [])

  // Adjust height based on content
  const adjustHeight = useCallback(() => {
    if (textareaRef.current && !isUpdatingRef.current) {
      // Add bullets back when measuring if enabled
      let textToMeasure = textareaRef.current.value || ' '
      if (listStyle === 'bullet') {
        const lines = textToMeasure.split('\n')
        textToMeasure = lines.map(line => line.trim() ? `• ${line}` : line).join('\n')
      }
      
      // Measure the text with Konva to get accurate height
      const measured = measureWrappedText({
        text: textToMeasure,
        fontSize,
        fontFamily,
        width: width,
        lineHeight: lineHeight,
        letterSpacing: letterSpacing,
        padding: 0,
        wrap: 'word'
      })
      
      // Update height if it changed
      if (measured.height !== currentHeight) {
        setCurrentHeight(measured.height)
        // Update the element's height in real-time
        isUpdatingRef.current = true
        onTextChange(textareaRef.current.value, measured.height, true) // true = isTyping
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 0)
      }
    }
  }, [fontSize, fontFamily, width, currentHeight, lineHeight, letterSpacing, listStyle, onTextChange])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape cancels
    if (e.key === 'Escape') {
      e.preventDefault()
      onEditEnd()
    }
    // Stop propagation to prevent canvas shortcuts
    e.stopPropagation()
  }

  const handleSave = () => {
    const finalText = value || ''
    
    // Add bullets back when measuring if enabled
    let textToMeasure = finalText
    if (listStyle === 'bullet') {
      const lines = textToMeasure.split('\n')
      textToMeasure = lines.map(line => line.trim() ? `• ${line}` : line).join('\n')
    }
    
    // Measure the final text dimensions
    const measured = measureWrappedText({
      text: textToMeasure,
      fontSize,
      fontFamily,
      width: width,
      lineHeight: lineHeight,
      letterSpacing: letterSpacing,
      padding: 0,
      wrap: 'word'
    })
    
    // Save with final height (pass the original text without bullets, they'll be added in the renderer)
    onTextChange(finalText, measured.height, false) // false = not typing (final save)
  }

  const handleOutsideClick = (e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      handleSave()
    }
  }

  useEffect(() => {
    // Add click listener to detect clicks outside
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [value, fontSize, fontFamily, width])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (newValue !== value) {
      setValue(newValue)
      // Adjust height as user types
      requestAnimationFrame(adjustHeight)
    }
  }

  // Update height when props change
  useEffect(() => {
    adjustHeight()
  }, [adjustHeight])

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: `${x - 1}px`, // Adjust for border
          top: `${y - 1}px`, // Adjust for border  
          width: `${width + 2}px`, // Add 2px to account for border
          height: `${currentHeight + 2}px`, // Dynamic height
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily,
          fontWeight: fontWeight,
          fontStyle: fontStyle,
          letterSpacing: `${letterSpacing}px`,
          textDecoration: textDecoration,
          color: gradientStart && gradientEnd ? 'transparent' : color,
          textAlign: textAlign,
          padding: '0',
          margin: '0',
          border: '1px solid #0c8ce9',
          borderRadius: '0',
          background: gradientStart && gradientEnd ? 
            `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})` : 'transparent',
          backgroundClip: gradientStart && gradientEnd ? 'text' : undefined,
          WebkitBackgroundClip: gradientStart && gradientEnd ? 'text' : undefined,
          WebkitTextFillColor: gradientStart && gradientEnd ? 'transparent' : undefined,
          outline: 'none',
          resize: 'none',
          overflow: 'hidden', // No scrollbar
          lineHeight: lineHeight.toString(),
          boxShadow: 'none',
          pointerEvents: 'auto',
          zIndex: 1000,
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
          boxSizing: 'border-box',
          transition: 'none',
        }}
        placeholder=""
      />
    </div>
  )
}
