// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react'
import useSlideStore from '@/stores/slideStore'

export function useKeyboardShortcuts() {
  const { 
    currentSlideId, 
    selectedElementIds, 
    deleteElement, 
    slides,
    clearSelection,
    undo,
    redo,
    canUndo,
    canRedo,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    batchUpdateElements
  } = useSlideStore()
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      // Reset canvas view (Home key)
      if (e.key === 'Home') {
        e.preventDefault()
        const event = new CustomEvent('canvas:reset-view')
        window.dispatchEvent(event)
      }
      
      // Delete selected elements
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementIds.length > 0 && currentSlideId) {
          e.preventDefault()
          const currentSlide = slides.find(s => s.id === currentSlideId)
          if (currentSlide) {
            selectedElementIds.forEach(elementId => {
              deleteElement(currentSlideId, elementId)
            })
          }
        }
      }
      
      // Select all (Ctrl/Cmd + A)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        const currentSlide = slides.find(s => s.id === currentSlideId)
        if (currentSlide) {
          // Select all elements in current slide
          const allElementIds = currentSlide.elements.map(el => el.id)
          allElementIds.forEach((id, index) => {
            useSlideStore.getState().selectElement(id, index > 0)
          })
        }
      }
      
      // Clear selection (Escape)
      if (e.key === 'Escape') {
        clearSelection()
      }
      
      // Undo (Ctrl/Cmd + Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault()
        undo()
      }
      
      // Redo (Ctrl/Cmd + Y is primary, but also support Ctrl/Cmd + Shift + Z for compatibility)
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        if (canRedo) {
          e.preventDefault()
          redo()
        }
      }
      
      // Arrow key movement for selected elements (4px increments)
      if (selectedElementIds.length > 0 && currentSlideId && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const currentSlide = slides.find(s => s.id === currentSlideId)
        if (currentSlide) {
          let moved = false
          const updates: Record<string, Partial<any>> = {}
          
          // Get selected elements that are not locked
          const movableElements = currentSlide.elements.filter(
            el => selectedElementIds.includes(el.id) && !el.locked
          )
          
          if (movableElements.length > 0) {
            movableElements.forEach(element => {
              switch (e.key) {
                case 'ArrowUp':
                  updates[element.id] = { y: element.y - 4 }
                  moved = true
                  break
                case 'ArrowDown':
                  updates[element.id] = { y: element.y + 4 }
                  moved = true
                  break
                case 'ArrowLeft':
                  updates[element.id] = { x: element.x - 4 }
                  moved = true
                  break
                case 'ArrowRight':
                  updates[element.id] = { x: element.x + 4 }
                  moved = true
                  break
              }
            })
            
            if (moved) {
              e.preventDefault()
              batchUpdateElements(currentSlideId, updates)
            }
          }
        }
      }
      
      // Layer ordering shortcuts (only work with single selection)
      if (selectedElementIds.length === 1 && currentSlideId) {
        const elementId = selectedElementIds[0]
        
        // More intuitive arrow key shortcuts
        // Bring to Front (Alt + Shift + Up Arrow)
        if (e.altKey && e.shiftKey && e.key === 'ArrowUp') {
          e.preventDefault()
          bringToFront(currentSlideId, elementId)
        }
        
        // Send to Back (Alt + Shift + Down Arrow)
        if (e.altKey && e.shiftKey && e.key === 'ArrowDown') {
          e.preventDefault()
          sendToBack(currentSlideId, elementId)
        }
        
        // Bring Forward (Alt + Up Arrow)
        if (e.altKey && !e.shiftKey && e.key === 'ArrowUp') {
          e.preventDefault()
          bringForward(currentSlideId, elementId)
        }
        
        // Send Backward (Alt + Down Arrow)
        if (e.altKey && !e.shiftKey && e.key === 'ArrowDown') {
          e.preventDefault()
          sendBackward(currentSlideId, elementId)
        }
        
        // Also support bracket shortcuts for compatibility with other design tools
        // Bring to Front (Ctrl/Cmd + Shift + ])
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === ']') {
          e.preventDefault()
          bringToFront(currentSlideId, elementId)
        }
        
        // Send to Back (Ctrl/Cmd + Shift + [)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '[') {
          e.preventDefault()
          sendToBack(currentSlideId, elementId)
        }
        
        // Bring Forward (Ctrl/Cmd + ])
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === ']') {
          e.preventDefault()
          bringForward(currentSlideId, elementId)
        }
        
        // Send Backward (Ctrl/Cmd + [)
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === '[') {
          e.preventDefault()
          sendBackward(currentSlideId, elementId)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlideId, selectedElementIds, deleteElement, slides, clearSelection, undo, redo, canUndo, canRedo, bringToFront, sendToBack, bringForward, sendBackward, batchUpdateElements])
}

export default useKeyboardShortcuts