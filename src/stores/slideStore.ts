// src/stores/slideStore.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Slide, SlideElement, Presentation } from '@/types/slide.types'
import type { SlideTemplate } from '@/types/template.types'
import { measureAutoText } from '@/utils/text.utils'
import { debounce } from 'lodash-es'

interface SlideStore {
  // State
  presentation: Presentation | null
  slides: Slide[]
  currentSlideId: string | null
  selectedSlideId: string | null // For slide selection
  selectedElementIds: string[]
  showOutsideElements: boolean
  clipboard: SlideElement[] | null // For copy/paste functionality
  lastSaved: string | null // ISO string of last save time
  canvasContainer: HTMLElement | null // Reference to canvas container for color picker
  
  // Actions
  createPresentation: (title: string) => void
  updatePresentationTitle: (title: string) => void
  addSlide: (template?: SlideTemplate) => string
  deleteSlide: (slideId: string) => void
  deleteSelectedSlide: () => void
  duplicateSlide: (slideId: string) => string
  duplicateSelectedSlide: () => void
  
  setCurrentSlide: (slideId: string) => void
  selectSlide: (slideId: string | null) => void
  updateSlide: (slideId: string, updates: Partial<Slide>) => void
  
  addElement: (slideId: string, element: Omit<SlideElement, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateElement: (slideId: string, elementId: string, updates: Partial<SlideElement>) => void
  deleteElement: (slideId: string, elementId: string) => void
  
  // Element ordering actions
  bringToFront: (slideId: string, elementId: string) => void
  sendToBack: (slideId: string, elementId: string) => void
  bringForward: (slideId: string, elementId: string) => void
  sendBackward: (slideId: string, elementId: string) => void
  
  selectElement: (elementId: string, multi?: boolean) => void
  selectMultipleElements: (elementIds: string[]) => void
  clearSelection: () => void
  
  // Batch operations for performance
  batchUpdateElements: (slideId: string, updates: Record<string, Partial<SlideElement>>) => void
  
  // View settings
  toggleOutsideElements: () => void
  
  // Canvas reference
  setCanvasContainer: (container: HTMLElement | null) => void
  
  // Copy/Paste operations
  copyElements: () => void
  pasteElements: () => void
  canPaste: boolean
  
  // Undo/Redo support
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  
  // Internal helper
  debouncedSaveHistory: () => void
}

// History management
const MAX_HISTORY = 50

interface HistoryState {
  presentation: Presentation | null
  slides: Slide[]
  currentSlideId: string | null
  selectedSlideId: string | null
  selectedElementIds: string[]
}

interface HistoryManager {
  history: HistoryState[]
  currentIndex: number
}

const historyManager: HistoryManager = {
  history: [],
  currentIndex: -1
}

// Helper to create a deep copy of the current state
function createStateSnapshot(state: any): HistoryState {
  return {
    presentation: state.presentation ? JSON.parse(JSON.stringify(state.presentation)) : null,
    slides: JSON.parse(JSON.stringify(state.slides)),
    currentSlideId: state.currentSlideId,
    selectedSlideId: state.selectedSlideId,
    selectedElementIds: [...state.selectedElementIds]
  }
}

// Helper to save state to history
function saveToHistory(state: any) {
  // Remove any states after currentIndex (when we're in the middle of history)
  historyManager.history = historyManager.history.slice(0, historyManager.currentIndex + 1)
  
  // Add new state
  const snapshot = createStateSnapshot(state)
  historyManager.history.push(snapshot)
  
  // Limit history size
  if (historyManager.history.length > MAX_HISTORY) {
    historyManager.history.shift()
  } else {
    historyManager.currentIndex++
  }
}

// Helper to restore state from history
function restoreFromHistory(state: any, historyState: HistoryState) {
  state.presentation = historyState.presentation ? JSON.parse(JSON.stringify(historyState.presentation)) : null
  state.slides = JSON.parse(JSON.stringify(historyState.slides))
  state.currentSlideId = historyState.currentSlideId
  state.selectedSlideId = historyState.selectedSlideId
  state.selectedElementIds = [...historyState.selectedElementIds]
}

// Create debounced save history function
const debouncedHistorySave = debounce((get: any, set: any) => {
  const state = get()
  saveToHistory(state)
  set((s: any) => {
    s.canUndo = historyManager.currentIndex > 0
    s.canRedo = historyManager.currentIndex < historyManager.history.length - 1
    s.lastSaved = new Date().toISOString()
  })
}, 500)

const useSlideStore = create<SlideStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      presentation: null,
      slides: [],
      currentSlideId: null,
      selectedSlideId: null,
      selectedElementIds: [],
      showOutsideElements: true,
      clipboard: null,
      canvasContainer: null,
      canPaste: false,
      canUndo: historyManager.currentIndex > 0,
      canRedo: historyManager.currentIndex < historyManager.history.length - 1,
      lastSaved: new Date().toISOString(),
      
      debouncedSaveHistory: () => debouncedHistorySave(get, set),

      setCanvasContainer: (container) => set((state) => {
        state.canvasContainer = container
      }),

      createPresentation: (title) => set((state) => {
        const presentationId = nanoid()
        const firstSlideId = nanoid()
        
        state.presentation = {
          id: presentationId,
          title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          slides: [firstSlideId],
          version: 1,
        }
        
        state.slides = [{
          id: firstSlideId,
          presentationId,
          elements: [],
          background: '#ffffff',
          order: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }]
        
        state.currentSlideId = firstSlideId
        state.selectedSlideId = firstSlideId
        
        // Update last saved time
        state.lastSaved = new Date().toISOString()
        
        // Save initial state to history
        saveToHistory(state)
        state.canUndo = historyManager.currentIndex > 0
        state.canRedo = historyManager.currentIndex < historyManager.history.length - 1
      }),

      updatePresentationTitle: (title) => set((state) => {
        if (state.presentation) {
          state.presentation.title = title
          state.presentation.updatedAt = new Date().toISOString()
          state.lastSaved = new Date().toISOString()
        }
      }),

      addSlide: (template) => {
        const slideId = nanoid()
        
        set((state) => {
          // Create slide elements from template
          const elements: SlideElement[] = []
          
          if (template && template.elements.length > 0) {
            // Generate elements from template
            template.elements.forEach(templateElement => {
              // Use template dimensions if provided, otherwise measure text for auto-sizing
              let width = templateElement.width || 100
              let height = templateElement.height || 50
              
              // Only auto-measure text if dimensions aren't explicitly set in the template
              if (templateElement.type === 'text' && templateElement.content && (!templateElement.width || !templateElement.height)) {
                const textContent = templateElement.content as any
                // Add bullets to text if enabled
                let textToMeasure = textContent.text || ''
                if (templateElement.style?.listStyle === 'bullet') {
                  const lines = textToMeasure.split('\n')
                  textToMeasure = lines.map(line => line.trim() ? `• ${line}` : line).join('\n')
                }
                const dimensions = measureAutoText({
                  text: textToMeasure,
                  fontSize: templateElement.style?.fontSize || 16,
                  fontFamily: templateElement.style?.fontFamily || 'Arial',
                  lineHeight: templateElement.style?.lineHeight || 1.2,
                  padding: 0 // No padding for tight fit
                })
                // Only override if template didn't specify dimensions
                if (!templateElement.width) width = dimensions.width
                if (!templateElement.height) height = dimensions.height
              }
              
              const newElement: SlideElement = {
                id: nanoid(),
                type: templateElement.type || 'text',
                x: templateElement.x || 0,
                y: templateElement.y || 0,
                width,
                height,
                rotation: templateElement.rotation,
                opacity: templateElement.opacity,
                locked: templateElement.locked,
                visible: templateElement.visible !== false,
                content: templateElement.content || { text: '' },
                style: templateElement.style,
                animations: templateElement.animations,
                interactions: templateElement.interactions,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              
              elements.push(newElement)
            })
          }
          
          const newSlide: Slide = {
            id: slideId,
            presentationId: state.presentation?.id || '',
            elements,
            background: template?.background || '#ffffff',
            order: state.slides.length,
            templateId: template?.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          state.slides.push(newSlide)
          state.currentSlideId = slideId
          state.selectedSlideId = slideId
          
          if (state.presentation) {
            state.presentation.slides.push(slideId)
            state.presentation.updatedAt = new Date().toISOString()
          }
        })
        
        // Save to history after adding slide
        const state = get()
        saveToHistory(state)
        set(s => {
          s.canUndo = historyManager.currentIndex > 0
          s.canRedo = historyManager.currentIndex < historyManager.history.length - 1
          s.lastSaved = new Date().toISOString()
        })
        
        return slideId
      },

      deleteSlide: (slideId) => {
        set((state) => {
          const index = state.slides.findIndex(s => s.id === slideId)
          if (index === -1 || state.slides.length === 1) return
          
          state.slides.splice(index, 1)
          
          if (state.presentation) {
            state.presentation.slides = state.presentation.slides.filter(id => id !== slideId)
            state.presentation.updatedAt = new Date().toISOString()
          }
          
          // Update current slide if needed
          if (state.currentSlideId === slideId) {
            const newIndex = Math.max(0, index - 1)
            state.currentSlideId = state.slides[newIndex]?.id || null
          }
          
          // Handle selected slide deletion
          if (state.selectedSlideId === slideId) {
            // Select the slide that takes the deleted slide's position
            // This allows consecutive deletion by pressing backspace repeatedly
            if (state.slides.length > 0) {
              // If we deleted the last slide, select the new last slide
              const newIndex = Math.min(index, state.slides.length - 1)
              state.selectedSlideId = state.slides[newIndex]?.id || null
            } else {
              state.selectedSlideId = null
            }
          }
          
          // Update last saved time
          state.lastSaved = new Date().toISOString()
        })
        
        // Save to history
        const state = get()
        saveToHistory(state)
        set(s => {
          s.canUndo = historyManager.currentIndex > 0
          s.canRedo = historyManager.currentIndex < historyManager.history.length - 1
          s.lastSaved = new Date().toISOString()
        })
      },

      duplicateSlide: (slideId) => {
        const newSlideId = nanoid()
        
        set((state) => {
          const slide = state.slides.find(s => s.id === slideId)
          if (!slide) return
          
          const newSlide: Slide = {
            ...slide,
            id: newSlideId,
            elements: slide.elements.map(el => ({
              ...el,
              id: nanoid(),
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          const index = state.slides.findIndex(s => s.id === slideId)
          state.slides.splice(index + 1, 0, newSlide)
          
          if (state.presentation) {
            const slideIndex = state.presentation.slides.indexOf(slideId)
            state.presentation.slides.splice(slideIndex + 1, 0, newSlideId)
            state.presentation.updatedAt = new Date().toISOString()
          }
          
          state.currentSlideId = newSlideId
          state.selectedSlideId = newSlideId
        })
        
        // Save to history
        const state = get()
        saveToHistory(state)
        set(s => {
          s.canUndo = historyManager.currentIndex > 0
          s.canRedo = historyManager.currentIndex < historyManager.history.length - 1
        })
        
        return newSlideId
      },

      setCurrentSlide: (slideId) => set((state) => {
        if (state.slides.some(s => s.id === slideId)) {
          state.currentSlideId = slideId
          state.selectedElementIds = []
        }
      }),

      selectSlide: (slideId) => set((state) => {
        state.selectedSlideId = slideId
        // Clear element selection when selecting a slide
        if (slideId) {
          state.selectedElementIds = []
        }
      }),

      deleteSelectedSlide: () => {
        const state = get()
        if (state.selectedSlideId && state.slides.length > 1) {
          get().deleteSlide(state.selectedSlideId)
        }
      },

      duplicateSelectedSlide: () => {
        const state = get()
        if (state.selectedSlideId) {
          get().duplicateSlide(state.selectedSlideId)
        }
      },

      updateSlide: (slideId, updates) => set((state) => {
        const slide = state.slides.find(s => s.id === slideId)
        if (!slide) return
        
        Object.assign(slide, updates, {
          updatedAt: new Date().toISOString(),
        })
      }),

      addElement: (slideId, element) => {
        const elementId = nanoid()
        
        set((state) => {
          const slide = state.slides.find(s => s.id === slideId)
          if (!slide) return
          
          const newElement: SlideElement = {
            ...element,
            id: elementId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          slide.elements.push(newElement)
          slide.updatedAt = new Date().toISOString()
        })
        
        // Save to history after adding element
        const state = get()
        saveToHistory(state)
        set(s => {
          s.canUndo = historyManager.currentIndex > 0
          s.canRedo = historyManager.currentIndex < historyManager.history.length - 1
          s.lastSaved = new Date().toISOString()
        })
        
        return elementId
      },

      updateElement: (slideId, elementId, updates) => {
        set((state) => {
          const slide = state.slides.find(s => s.id === slideId)
          if (!slide) return
          
          const element = slide.elements.find(el => el.id === elementId)
          if (!element) return
          
          Object.assign(element, updates, {
            updatedAt: new Date().toISOString(),
          })
          
          slide.updatedAt = new Date().toISOString()
        })
        
        // Debounce history saving for continuous updates (like dragging)
        get().debouncedSaveHistory()
      },

      deleteElement: (slideId, elementId) => {
        set((state) => {
          const slide = state.slides.find(s => s.id === slideId)
          if (!slide) return
          
          slide.elements = slide.elements.filter(el => el.id !== elementId)
          slide.updatedAt = new Date().toISOString()
          
          state.selectedElementIds = state.selectedElementIds.filter(id => id !== elementId)
        })
        
        // Save to history after deleting element
        const state = get()
        saveToHistory(state)
        set(s => {
          s.canUndo = historyManager.currentIndex > 0
          s.canRedo = historyManager.currentIndex < historyManager.history.length - 1
          s.lastSaved = new Date().toISOString()
        })
      },

      bringToFront: (slideId, elementId) => {
        set((state) => {
          const slide = state.slides.find(s => s.id === slideId)
          if (!slide) return
          
          const elementIndex = slide.elements.findIndex(el => el.id === elementId)
          if (elementIndex === -1 || elementIndex === slide.elements.length - 1) return
          
          // Remove element and add to end
          const [element] = slide.elements.splice(elementIndex, 1)
          slide.elements.push(element)
          slide.updatedAt = new Date().toISOString()
        })
        
        // Save to history
        const state = get()
        saveToHistory(state)
        set(s => {
          s.canUndo = historyManager.currentIndex > 0
          s.canRedo = historyManager.currentIndex < historyManager.history.length - 1
          s.lastSaved = new Date().toISOString()
        })
      },

      sendToBack: (slideId, elementId) => {
        set((state) => {
          const slide = state.slides.find(s => s.id === slideId)
          if (!slide) return
          
          const elementIndex = slide.elements.findIndex(el => el.id === elementId)
          if (elementIndex === -1 || elementIndex === 0) return
          
          // Remove element and add to beginning
          const [element] = slide.elements.splice(elementIndex, 1)
          slide.elements.unshift(element)
          slide.updatedAt = new Date().toISOString()
        })
        
        // Save to history
        const state = get()
        saveToHistory(state)
        set(s => {
          s.canUndo = historyManager.currentIndex > 0
          s.canRedo = historyManager.currentIndex < historyManager.history.length - 1
          s.lastSaved = new Date().toISOString()
        })
      },

      bringForward: (slideId, elementId) => {
        set((state) => {
          const slide = state.slides.find(s => s.id === slideId)
          if (!slide) return
          
          const elementIndex = slide.elements.findIndex(el => el.id === elementId)
          if (elementIndex === -1 || elementIndex === slide.elements.length - 1) return
          
          // Swap with next element
          const temp = slide.elements[elementIndex]
          slide.elements[elementIndex] = slide.elements[elementIndex + 1]
          slide.elements[elementIndex + 1] = temp
          slide.updatedAt = new Date().toISOString()
        })
        
        // Save to history
        const state = get()
        saveToHistory(state)
        set(s => {
          s.canUndo = historyManager.currentIndex > 0
          s.canRedo = historyManager.currentIndex < historyManager.history.length - 1
          s.lastSaved = new Date().toISOString()
        })
      },

      sendBackward: (slideId, elementId) => {
        set((state) => {
          const slide = state.slides.find(s => s.id === slideId)
          if (!slide) return
          
          const elementIndex = slide.elements.findIndex(el => el.id === elementId)
          if (elementIndex === -1 || elementIndex === 0) return
          
          // Swap with previous element
          const temp = slide.elements[elementIndex]
          slide.elements[elementIndex] = slide.elements[elementIndex - 1]
          slide.elements[elementIndex - 1] = temp
          slide.updatedAt = new Date().toISOString()
        })
        
        // Save to history
        const state = get()
        saveToHistory(state)
        set(s => {
          s.canUndo = historyManager.currentIndex > 0
          s.canRedo = historyManager.currentIndex < historyManager.history.length - 1
          s.lastSaved = new Date().toISOString()
        })
      },

      selectElement: (elementId, multi = false) => set((state) => {
        if (multi) {
          if (state.selectedElementIds.includes(elementId)) {
            state.selectedElementIds = state.selectedElementIds.filter(id => id !== elementId)
          } else {
            state.selectedElementIds.push(elementId)
          }
        } else {
          state.selectedElementIds = [elementId]
        }
      }),

      selectMultipleElements: (elementIds) => set((state) => {
        state.selectedElementIds = elementIds
      }),

      clearSelection: () => set((state) => {
        state.selectedElementIds = []
        state.selectedSlideId = null
      }),

      toggleOutsideElements: () => set((state) => {
        state.showOutsideElements = !state.showOutsideElements
      }),

      copyElements: () => {
        const state = get()
        if (state.selectedElementIds.length === 0 || !state.currentSlideId) return
        
        const currentSlide = state.slides.find(s => s.id === state.currentSlideId)
        if (!currentSlide) return
        
        // Get selected elements
        const selectedElements = currentSlide.elements.filter(el => 
          state.selectedElementIds.includes(el.id)
        )
        
        // Deep copy the elements to clipboard
        const copiedElements = selectedElements.map(el => ({
          ...JSON.parse(JSON.stringify(el)),
          id: '' // Clear ID so it gets new one on paste
        }))
        
        set(state => {
          state.clipboard = copiedElements
          state.canPaste = copiedElements.length > 0
        })
      },

      pasteElements: () => {
        const state = get()
        if (!state.clipboard || state.clipboard.length === 0 || !state.currentSlideId) return
        
        const currentSlide = state.slides.find(s => s.id === state.currentSlideId)
        if (!currentSlide) return
        
        const pastedElementIds: string[] = []
        
        set((draft) => {
          const slide = draft.slides.find(s => s.id === draft.currentSlideId)
          if (!slide) return
          
          // Paste each element from clipboard
          state.clipboard!.forEach((element) => {
            const newId = nanoid()
            pastedElementIds.push(newId)
            
            const newElement: SlideElement = {
              ...element,
              id: newId,
              // Keep exact same position as original
              x: element.x,
              y: element.y,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            
            slide.elements.push(newElement)
          })
          
          slide.updatedAt = new Date().toISOString()
          
          // Select the pasted elements
          draft.selectedElementIds = pastedElementIds
        })
        
        // Save to history after paste
        saveToHistory(get())
        set(s => {
          s.canUndo = historyManager.currentIndex > 0
          s.canRedo = historyManager.currentIndex < historyManager.history.length - 1
          s.lastSaved = new Date().toISOString()
        })
      },

      batchUpdateElements: (slideId, updates) => {
        set((state) => {
          const slide = state.slides.find(s => s.id === slideId)
          if (!slide) return
          
          const now = new Date().toISOString()
          
          slide.elements.forEach(element => {
            const elementUpdates = updates[element.id]
            if (elementUpdates) {
              Object.assign(element, elementUpdates, { updatedAt: now })
            }
          })
          
          slide.updatedAt = now
        })
        
        // Debounce history saving for batch updates
        get().debouncedSaveHistory()
      },

      undo: () => set((state) => {
        if (historyManager.currentIndex > 0) {
          historyManager.currentIndex--
          const previousState = historyManager.history[historyManager.currentIndex]
          restoreFromHistory(state, previousState)
          state.canUndo = historyManager.currentIndex > 0
          state.canRedo = true
        }
      }),

      redo: () => set((state) => {
        if (historyManager.currentIndex < historyManager.history.length - 1) {
          historyManager.currentIndex++
          const nextState = historyManager.history[historyManager.currentIndex]
          restoreFromHistory(state, nextState)
          state.canUndo = true
          state.canRedo = historyManager.currentIndex < historyManager.history.length - 1
        }
      }),
    }))
  )
)

// Selectors for performance
export const useCurrentSlide = () => {
  const currentSlideId = useSlideStore(state => state.currentSlideId)
  const slide = useSlideStore(state => 
    state.slides.find(s => s.id === currentSlideId)
  )
  return slide
}

export const useSlideElements = (slideId: string) => {
  return useSlideStore(state => 
    state.slides.find(s => s.id === slideId)?.elements || []
  )
}

export const useSelectedElements = () => {
  const selectedIds = useSlideStore(state => state.selectedElementIds)
  const currentSlide = useCurrentSlide()
  
  if (!currentSlide) return []
  
  return currentSlide.elements.filter(el => selectedIds.includes(el.id))
}

export default useSlideStore
