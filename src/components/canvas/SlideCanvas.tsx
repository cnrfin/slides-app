// src/components/canvas/SlideCanvas.tsx
import { useRef, useCallback, useState, useEffect, useMemo } from 'react'
import { Stage, Layer, Rect, Group, Transformer } from 'react-konva'
import Konva from 'konva'
import useSlideStore, { useCurrentSlide, useSelectedElements } from '@/stores/slideStore'
import ElementRenderer from './ElementRenderer'
import InlineTextEditor from './InlineTextEditor'
import TextResizeHandler from './handlers/TextResizeHandler'
import ShapeResizeHandler from './handlers/ShapeResizeHandler'
import { CANVAS_DIMENSIONS, ZOOM_LIMITS, CANVAS_COLORS, SNAP_SETTINGS } from '@/utils/canvas.constants'
import { measureWrappedText } from '@/utils/text.utils'
import { calculateSnapPosition, calculateElementDragSnapPosition, getVisibleMarginGuides, type SnapGuide, type MarginGuide } from '@/utils/snap.utils'
import { getElementsInSelectionRect, calculateBoundingBox } from '@/utils/selection.utils'
import SelectionBoundingBox from './handlers/SelectionBoundingBox'
import type { SlideElement, TextContent } from '@/types/slide.types'

// Canvas constants
const { WIDTH: CANVAS_WIDTH, HEIGHT: CANVAS_HEIGHT } = CANVAS_DIMENSIONS
const { MIN: MIN_ZOOM, MAX: MAX_ZOOM, STEP: ZOOM_STEP } = ZOOM_LIMITS

interface SlideCanvasProps {
  containerWidth?: number
  containerHeight?: number
}

export default function SlideCanvas({ 
  containerWidth, 
  containerHeight 
}: SlideCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const layerRef = useRef<Konva.Layer>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const selectionRectRef = useRef<Konva.Rect>(null)
  
  // Canvas state
  const [canvasSize, setCanvasSize] = useState({ 
    width: containerWidth || window.innerWidth, 
    height: containerHeight || window.innerHeight 
  })
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [stageScale, setStageScale] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isAltPressed, setIsAltPressed] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionRect, setSelectionRect] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null)
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null) // Track dragging element
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]) // Snap guides to show
  const [marginGuides, setMarginGuides] = useState<MarginGuide[]>([]) // Margin guides to show
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [dragOverImageId, setDragOverImageId] = useState<string | null>(null)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [duplicatedElementId, setDuplicatedElementId] = useState<string | null>(null)
  
  // Text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [editingTextPosition, setEditingTextPosition] = useState({ x: 0, y: 0 })
  
  // Store
  const currentSlide = useCurrentSlide()
  const selectedElements = useSelectedElements()
  const { updateElement, selectElement, selectMultipleElements, clearSelection, batchUpdateElements, addElement } = useSlideStore()
  
  // Update canvas size when props change
  useEffect(() => {
    if (containerWidth && containerHeight) {
      setCanvasSize({
        width: containerWidth,
        height: containerHeight
      })
    }
  }, [containerWidth, containerHeight])
  
  // Handle reset view event
  useEffect(() => {
    const handleResetView = () => {
      setStageScale(1)
      setStagePos({ x: 0, y: 0 })
      
      // Emit zoom change event
      const event = new CustomEvent('canvas:zoom-change', { detail: { zoom: 1 } })
      window.dispatchEvent(event)
    }
    
    window.addEventListener('canvas:reset-view', handleResetView)
    return () => window.removeEventListener('canvas:reset-view', handleResetView)
  }, [])
  
  // Handle keyboard events for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle space key if we're in text editing mode or if an input is focused
      const activeElement = document.activeElement
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      )
      
      if (e.code === 'Space' && !e.repeat && !isInputFocused) {
        e.preventDefault()
        setIsSpacePressed(true)
      }
      if (e.key === 'Alt' && !e.repeat) {
        e.preventDefault()
        setIsAltPressed(true)
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsSpacePressed(false)
        setIsPanning(false)
      }
      if (e.key === 'Alt') {
        e.preventDefault()
        setIsAltPressed(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  
  // Calculate initial position to center the canvas
  const initialPosition = useMemo(() => {
    const x = (canvasSize.width - CANVAS_WIDTH) / 2
    const y = (canvasSize.height - CANVAS_HEIGHT) / 2
    return { x, y } // Remove Math.max to allow negative values for proper centering
  }, [canvasSize])
  
  // Set initial stage position on mount to center the slide
  useEffect(() => {
    if (stagePos.x === 0 && stagePos.y === 0) {
      // Only set initial position if not already positioned
      setStagePos({ x: 0, y: 0 })
      
      // Emit initial zoom
      const event = new CustomEvent('canvas:zoom-change', { detail: { zoom: 1 } })
      window.dispatchEvent(event)
    }
  }, [])
  
  // Handle image file processing
  const processImageFile = useCallback((file: File): Promise<{ src: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File is not an image'))
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        
        // Create image to get dimensions
        const img = new Image()
        img.onload = () => {
          // Scale down if image is too large
          let width = img.width
          let height = img.height
          const maxSize = 400
          
          if (width > maxSize || height > maxSize) {
            const scale = Math.min(maxSize / width, maxSize / height)
            width *= scale
            height *= scale
          }
          
          resolve({ src, width, height })
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = src
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }, [])
  
  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check if dragging files
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true)
      
      if (!currentSlide) return
      
      // Get drop position relative to the stage
      const stage = stageRef.current
      if (!stage) return
      
      const stageBox = stage.container().getBoundingClientRect()
      const dropX = e.clientX - stageBox.left
      const dropY = e.clientY - stageBox.top
      
      // Convert to canvas coordinates
      const canvasX = (dropX - stagePos.x - initialPosition.x) / stageScale
      const canvasY = (dropY - stagePos.y - initialPosition.y) / stageScale
      
      // Check if hovering over an existing image element
      const hoveredImage = currentSlide.elements.find(element => {
        if (element.type !== 'image') return false
        
        return (
          canvasX >= element.x &&
          canvasX <= element.x + element.width &&
          canvasY >= element.y &&
          canvasY <= element.y + element.height
        )
      })
      
      setDragOverImageId(hoveredImage?.id || null)
    }
  }, [currentSlide, stagePos, stageScale, initialPosition])
  
  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    setDragOverImageId(null)
  }, [])
  
  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
    setDragOverImageId(null)
    
    if (!currentSlide) return
    
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) return
    
    // Get drop position relative to the stage
    const stage = stageRef.current
    if (!stage) return
    
    const stageBox = stage.container().getBoundingClientRect()
    const dropX = e.clientX - stageBox.left
    const dropY = e.clientY - stageBox.top
    
    // Convert to canvas coordinates
    const canvasX = (dropX - stagePos.x - initialPosition.x) / stageScale
    const canvasY = (dropY - stagePos.y - initialPosition.y) / stageScale
    
    // Check if dropping on an existing image element
    const targetElement = currentSlide.elements.find(element => {
      if (element.type !== 'image') return false
      
      // Check if drop position is within the element bounds
      return (
        canvasX >= element.x &&
        canvasX <= element.x + element.width &&
        canvasY >= element.y &&
        canvasY <= element.y + element.height
      )
    })
    
    // If dropping on an existing image, replace it
    if (targetElement && imageFiles.length === 1) {
      try {
        const { src } = await processImageFile(imageFiles[0])
        
        // Update the existing image element
        updateElement(currentSlide.id, targetElement.id, {
          content: {
            src,
            alt: imageFiles[0].name,
            objectFit: targetElement.content?.objectFit || 'contain'
          }
        })
        
        // Select the updated element
        selectElement(targetElement.id)
        
        return // Exit early, we've handled the drop
      } catch (error) {
        console.error('Failed to process image:', error)
      }
    }
    
    // Otherwise, proceed with normal behavior (add new images)
    for (let i = 0; i < imageFiles.length; i++) {
      try {
        const { src, width, height } = await processImageFile(imageFiles[i])
        
        // Add image element with offset for multiple images
        const offsetX = i * 20
        const offsetY = i * 20
        
        addElement(currentSlide.id, {
          type: 'image',
          x: canvasX - width / 2 + offsetX, // Center on drop point
          y: canvasY - height / 2 + offsetY,
          width,
          height,
          content: {
            src,
            alt: imageFiles[i].name,
            objectFit: 'contain'
          },
          style: {
            borderRadius: 0
          }
        })
      } catch (error) {
        console.error('Failed to process image:', error)
      }
    }
  }, [currentSlide, stagePos, stageScale, initialPosition, processImageFile, addElement, updateElement, selectElement])
  
  // Cursor style
  const getCursor = () => {
    if (editingTextId) return 'default' // Keep default cursor while editing
    if (isPanning) return 'grabbing'
    if (isSpacePressed) return 'grab'
    if (isAltPressed && hoveredElementId) return 'copy' // Show copy cursor when hovering over elements with Alt
    return 'default'
  }
  
  // Handle stage mouse down
  const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // If space is pressed, start panning
    if (isSpacePressed) {
      setIsPanning(true)
      const stage = e.target.getStage()
      if (stage) {
        const pos = stage.getPointerPosition()
        if (pos) {
          lastMousePosRef.current = { x: pos.x, y: pos.y }
        }
      }
      return
    }
    
    // If clicked on empty area, start selection rectangle
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'slide-background'
    if (clickedOnEmpty) {
      clearSelection()
      const stage = e.target.getStage()
      if (!stage) return
      
      const pos = stage.getPointerPosition()
      if (!pos) return
      
      // Convert to relative position within the transform group
      const transform = stage.findOne('#transform-group') as Konva.Group
      if (!transform) return
      
      const relativePos = transform.getRelativePointerPosition()
      setSelectionRect({ x: relativePos.x, y: relativePos.y, width: 0, height: 0 })
      setIsSelecting(true)
    }
  }, [isSpacePressed, clearSelection])
  
  // Handle stage mouse move
  const handleStageMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return
    
    // Handle panning
    if (isPanning && isSpacePressed) {
      const pos = stage.getPointerPosition()
      if (!pos) return
      
      // Get the difference from the last position
      const dx = pos.x - lastMousePosRef.current.x
      const dy = pos.y - lastMousePosRef.current.y
      
      setStagePos(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }))
      
      lastMousePosRef.current = { x: pos.x, y: pos.y }
    }
    
    // Handle selection rectangle
    if (isSelecting) {
      const transform = stage.findOne('#transform-group') as Konva.Group
      if (!transform) return
      
      const relativePos = transform.getRelativePointerPosition()
      setSelectionRect(prev => ({
        ...prev,
        width: relativePos.x - prev.x,
        height: relativePos.y - prev.y
      }))
    }
  }, [isPanning, isSpacePressed, isSelecting, stageScale])
  
  // Handle stage mouse up
  const handleStageMouseUp = useCallback(() => {
    setIsPanning(false)
    
    // If we were selecting, find all elements within the selection rect
    if (isSelecting && currentSlide) {
      const elementsInSelection = getElementsInSelectionRect(
        currentSlide.elements,
        selectionRect
      )
      
      if (elementsInSelection.length > 0) {
        selectMultipleElements(elementsInSelection.map(el => el.id))
      }
    }
    
    setIsSelecting(false)
    setSelectionRect({ x: 0, y: 0, width: 0, height: 0 })
  }, [isSelecting, currentSlide, selectionRect, selectMultipleElements])
  
  // Handle wheel for zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    
    const stage = e.target.getStage()
    if (!stage) return
    
    const oldScale = stageScale
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale
    }
    
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, oldScale + direction * ZOOM_STEP))
    
    setStageScale(newScale)
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    })
    
    // Emit zoom change event
    const event = new CustomEvent('canvas:zoom-change', { detail: { zoom: newScale } })
    window.dispatchEvent(event)
  }, [stageScale, stagePos])
  
  // Handle element selection
  const handleElementSelect = useCallback((e: Konva.KonvaEventObject<MouseEvent>, elementId: string) => {
    e.cancelBubble = true
    
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey
    selectElement(elementId, metaPressed)
  }, [selectElement])
  
  // Handle text double click
  const handleTextDoubleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>, element: SlideElement) => {
    if (element.type !== 'text') return
    
    e.cancelBubble = true
    const stage = e.target.getStage()
    if (!stage) return
    
    // Calculate the position considering the current transform
    const x = (element.x * stageScale) + stagePos.x + initialPosition.x
    const y = (element.y * stageScale) + stagePos.y + initialPosition.y
    
    setEditingTextId(element.id)
    setEditingTextPosition({ x, y })
  }, [stageScale, stagePos, initialPosition])
  
  // Handle text edit complete
  const handleTextEditComplete = useCallback((newText: string, newHeight?: number, isTyping: boolean = false) => {
    if (!currentSlide || !editingTextId) return
    
    const element = currentSlide.elements.find(el => el.id === editingTextId)
    if (!element || element.type !== 'text') return
    
    const textContent: TextContent = {
      text: newText
    }
    
    // Update element with new text and height if provided
    const updates: Partial<SlideElement> = {
      content: textContent
    }
    
    if (newHeight !== undefined) {
      updates.height = newHeight
    }
    
    updateElement(currentSlide.id, editingTextId, updates)
    
    // Only exit edit mode if not typing (final save)
    if (!isTyping) {
      setEditingTextId(null)
    }
  }, [currentSlide, editingTextId, updateElement])
  
  // Handle text edit cancel
  const handleTextEditCancel = useCallback(() => {
    setEditingTextId(null)
  }, [])
  
  // Handle element drag start
  const handleElementDragStart = useCallback((e: Konva.KonvaEventObject<DragEvent>, elementId: string) => {
    // Only allow dragging if it's the only selected element
    if (selectedElements.length > 1) {
      e.target.stopDrag()
      return
    }
    
    // Check if Alt key is pressed for duplication
    const isAltPressed = e.evt.altKey
    
    if (isAltPressed && currentSlide) {
      // Find the element to duplicate
      const elementToDuplicate = currentSlide.elements.find(el => el.id === elementId)
      if (!elementToDuplicate) return
      
      // Create a duplicate element with a new ID
      const newElementId = addElement(currentSlide.id, {
        type: elementToDuplicate.type,
        x: elementToDuplicate.x,
        y: elementToDuplicate.y,
        width: elementToDuplicate.width,
        height: elementToDuplicate.height,
        rotation: elementToDuplicate.rotation,
        opacity: elementToDuplicate.opacity,
        locked: elementToDuplicate.locked,
        visible: elementToDuplicate.visible,
        content: JSON.parse(JSON.stringify(elementToDuplicate.content)), // Deep copy content
        style: elementToDuplicate.style ? JSON.parse(JSON.stringify(elementToDuplicate.style)) : undefined,
        animations: elementToDuplicate.animations,
        interactions: elementToDuplicate.interactions,
      })
      
      // Select the new element
      selectElement(newElementId)
      
      // Set state to track we're duplicating
      setIsDuplicating(true)
      setDuplicatedElementId(newElementId)
      
      // Stop the drag on the original element
      e.target.stopDrag()
      
      // Start dragging the new element instead
      setTimeout(() => {
        const newNode = layerRef.current?.findOne(`#element-${newElementId}`)
        if (newNode) {
          newNode.startDrag()
        }
      }, 0)
      
      return
    }
    
    setDraggingElementId(elementId)
    
    // If the dragged element is not selected, select only it
    const isSelected = selectedElements.some(el => el.id === elementId)
    if (!isSelected) {
      selectElement(elementId)
    }
  }, [selectedElements, selectElement, currentSlide, addElement])

  // Handle element drag
  const handleElementDrag = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target
    const elementId = isDuplicating && duplicatedElementId ? duplicatedElementId : draggingElementId
    const element = currentSlide?.elements.find(el => el.id === elementId)
    if (!element) return
    
    const currentX = node.x()
    const currentY = node.y()
    
    // Calculate visible margin guides
    const visibleMargins = getVisibleMarginGuides(
      currentX,
      currentY,
      element.width,
      element.height
    )
    setMarginGuides(visibleMargins)
    
    // Calculate margin snap position
    const marginSnapResult = calculateSnapPosition(
      currentX,
      currentY,
      element.width,
      element.height
    )
    
    // Calculate element-to-element snap position
    const elementSnapResult = calculateElementDragSnapPosition(
      { x: currentX, y: currentY, width: element.width, height: element.height, id: element.id },
      currentSlide?.elements || []
    )
    
    // Combine results - element snapping takes priority
    let finalX = currentX
    let finalY = currentY
    const guides: SnapGuide[] = []
    
    // Apply element snapping if available
    if (elementSnapResult.snappedX || elementSnapResult.snappedY) {
      if (elementSnapResult.snappedX) finalX = elementSnapResult.x
      if (elementSnapResult.snappedY) finalY = elementSnapResult.y
      guides.push(...elementSnapResult.snapGuides)
    }
    
    // Apply margin snapping for axes that didn't snap to elements
    if (!elementSnapResult.snappedX && marginSnapResult.snappedX) {
      finalX = marginSnapResult.x
      const marginXGuide = marginSnapResult.snapGuides.find(g => g.type === 'vertical')
      if (marginXGuide) guides.push(marginXGuide)
    }
    
    if (!elementSnapResult.snappedY && marginSnapResult.snappedY) {
      finalY = marginSnapResult.y
      const marginYGuide = marginSnapResult.snapGuides.find(g => g.type === 'horizontal')
      if (marginYGuide) guides.push(marginYGuide)
    }
    
    // Apply final position
    node.x(finalX)
    node.y(finalY)
    setSnapGuides(guides)
  }, [currentSlide, draggingElementId, isDuplicating, duplicatedElementId])
  
  // Handle element drag end
  const handleElementDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>, elementId: string) => {
    if (!currentSlide) return
    
    const node = e.target
    const newX = Math.round(node.x())
    const newY = Math.round(node.y())
    
    // Update element position
    updateElement(currentSlide.id, elementId, { x: newX, y: newY })
    
    // Clear dragging state and guides
    setDraggingElementId(null)
    setSnapGuides([])
    setMarginGuides([])
    
    // Clear duplication state if we were duplicating
    if (isDuplicating) {
      setIsDuplicating(false)
      setDuplicatedElementId(null)
    }
  }, [currentSlide, updateElement, isDuplicating])
  
  // Handle element hover
  const handleElementMouseEnter = useCallback((elementId: string) => {
    setHoveredElementId(elementId)
  }, [])
  
  const handleElementMouseLeave = useCallback((elementId: string) => {
    if (hoveredElementId === elementId) {
      setHoveredElementId(null)
    }
  }, [hoveredElementId])
  
  // Handle text resize
  const handleTextResize = useCallback((elementId: string, newProps: {
    width?: number
    height?: number
    fontSize?: number
    x?: number
    y?: number
  }) => {
    if (!currentSlide) return
    
    const element = currentSlide.elements.find(el => el.id === elementId)
    if (!element || element.type !== 'text') return
    
    // Calculate visible margin guides during resize
    const x = newProps.x !== undefined ? newProps.x : element.x
    const width = newProps.width !== undefined ? newProps.width : element.width
    const visibleMargins = getVisibleMarginGuides(
      x,
      element.y,
      width,
      element.height
    )
    setMarginGuides(visibleMargins)
    
    const textContent = element.content as TextContent
    const currentFontSize = newProps.fontSize || element.style?.fontSize || 16
    
    // Always recalculate height when width or font size changes
    if (newProps.width !== undefined || newProps.fontSize !== undefined) {
      // Add bullets to text if enabled
      let textToMeasure = textContent.text || ' '
      if (element.style?.listStyle === 'bullet') {
        const lines = textToMeasure.split('\n')
        textToMeasure = lines.map(line => line.trim() ? `• ${line}` : line).join('\n')
      }
      
      const measured = measureWrappedText({
        text: textToMeasure,
        fontSize: currentFontSize,
        fontFamily: element.style?.fontFamily || 'Arial',
        width: newProps.width || element.width,
        lineHeight: element.style?.lineHeight || 1.2,
        padding: 0, // No padding for tight fit
        wrap: 'word'
      })
      
      const updates: Partial<SlideElement> = {
        ...newProps,
        height: measured.height
      }
      
      if (newProps.fontSize) {
        updates.style = {
          ...element.style,
          fontSize: newProps.fontSize
        }
      }
      
      updateElement(currentSlide.id, elementId, updates)
    } else {
      // For position-only changes
      updateElement(currentSlide.id, elementId, newProps)
    }
  }, [currentSlide, updateElement])
  
  // Handle text resize end
  const handleTextResizeEnd = useCallback(() => {
    // Clear margin guides when resize ends
    setMarginGuides([])
  }, [])
  
  // Update transformer when selection changes or editing state changes
  useEffect(() => {
    if (!transformerRef.current || !layerRef.current) return
    
    const transformer = transformerRef.current
    const layer = layerRef.current
    
    // Hide transformer when editing text or no selection
    if (selectedElements.length === 0 || editingTextId) {
      transformer.nodes([])
    } else {
      // Only show transformer for non-text elements
      const nonTextSelectedElements = selectedElements.filter(el => el.type !== 'text')
      
      if (nonTextSelectedElements.length === 0) {
        transformer.nodes([])
      } else {
        // Disable resize and rotate for all elements
        transformer.setAttrs({
          resizeEnabled: false,
          rotateEnabled: false
        })
        
        const selectedNodes = nonTextSelectedElements
          .map(el => layer.findOne(`#element-${el.id}`))
          .filter(Boolean) as Konva.Node[]
        
        transformer.nodes(selectedNodes)
      }
    }
    
    transformer.getLayer()?.batchDraw()
  }, [selectedElements, editingTextId])
  
  // Calculate selection bounding box (exclude locked elements)
  const selectionBoundingBox = useMemo(() => {
    const unlockedElements = selectedElements.filter(el => !el.locked)
    if (unlockedElements.length <= 1) return null
    return calculateBoundingBox(unlockedElements)
  }, [selectedElements])
  
  // Handle selection bounding box drag
  const handleSelectionDrag = useCallback((deltaX: number, deltaY: number) => {
    if (!currentSlide || selectedElements.length <= 1) return
    
    // Move only unlocked selected elements by the delta
    selectedElements.filter(el => !el.locked).forEach(element => {
      const elNode = stageRef.current?.findOne(`#element-${element.id}`)
      if (elNode) {
        elNode.x(element.x + deltaX)
        elNode.y(element.y + deltaY)
      }
    })
  }, [selectedElements, currentSlide])
  
  const handleSelectionDragEnd = useCallback((deltaX: number, deltaY: number) => {
    if (!currentSlide || selectedElements.length <= 1) return
    
    // Update only unlocked selected elements with their new positions
    const updates: Record<string, Partial<SlideElement>> = {}
    selectedElements.filter(el => !el.locked).forEach(element => {
      updates[element.id] = {
        x: Math.round(element.x + deltaX),
        y: Math.round(element.y + deltaY)
      }
    })
    
    batchUpdateElements(currentSlide.id, updates)
  }, [selectedElements, currentSlide, batchUpdateElements])
  
  // Handle selection bounding box resize
  const handleSelectionResize = useCallback((scaleX: number, scaleY: number, newX: number, newY: number) => {
    if (!currentSlide || !selectionBoundingBox || selectedElements.length <= 1) return
    
    // Calculate how each unlocked element should be transformed
    selectedElements.filter(el => !el.locked).forEach(element => {
      const elNode = stageRef.current?.findOne(`#element-${element.id}`)
      if (elNode) {
        // Calculate element's relative position within the original bounding box
        const relativeX = (element.x - selectionBoundingBox.x) / selectionBoundingBox.width
        const relativeY = (element.y - selectionBoundingBox.y) / selectionBoundingBox.height
        
        // Calculate new position and size
        const newElementX = newX + relativeX * (selectionBoundingBox.width * scaleX)
        const newElementY = newY + relativeY * (selectionBoundingBox.height * scaleY)
        const newElementWidth = element.width * scaleX
        const newElementHeight = element.height * scaleY
        
        // Update node position and size
        elNode.x(newElementX)
        elNode.y(newElementY)
        elNode.width(newElementWidth)
        elNode.height(newElementHeight)
        
        // For text elements, we also need to scale the font size
        if (element.type === 'text' && elNode.fontSize) {
          const currentFontSize = element.style?.fontSize || 16
          const newFontSize = Math.round(currentFontSize * Math.min(scaleX, scaleY))
          elNode.fontSize(newFontSize)
        }
      }
    })
  }, [selectedElements, selectionBoundingBox, currentSlide])
  
  const handleSelectionResizeEnd = useCallback(() => {
    if (!currentSlide || !selectionBoundingBox || selectedElements.length <= 1) return
    
    // Update only unlocked selected elements with their new dimensions
    const updates: Record<string, Partial<SlideElement>> = {}
    selectedElements.filter(el => !el.locked).forEach(element => {
      const elNode = stageRef.current?.findOne(`#element-${element.id}`)
      if (elNode) {
        const update: Partial<SlideElement> = {
          x: Math.round(elNode.x()),
          y: Math.round(elNode.y()),
          width: Math.round(elNode.width()),
          height: Math.round(elNode.height())
        }
        
        // For text elements, also update font size
        if (element.type === 'text' && elNode.fontSize) {
          update.style = {
            ...element.style,
            fontSize: Math.round(elNode.fontSize())
          }
        }
        
        updates[element.id] = update
      }
    })
    
    batchUpdateElements(currentSlide.id, updates)
  }, [selectedElements, selectionBoundingBox, currentSlide, batchUpdateElements])
  
  // Render element using ElementRenderer component
  const renderElement = useCallback((element: SlideElement) => {
    const isSelected = selectedElements.some(el => el.id === element.id)
    const isEditing = editingTextId === element.id
    const isHovered = hoveredElementId === element.id
    const isDragTarget = dragOverImageId === element.id
    const isMultiSelect = selectedElements.length > 1
    const dataKey = currentSlide?.metadata?.dataKeys?.[element.id]
    const showTemplateIndicators = currentSlide?.metadata?.templateName !== undefined
    
    return (
      <ElementRenderer
        key={element.id}
        element={element}
        isSelected={isSelected}
        isEditing={isEditing}
        isHovered={isHovered}
        isDragTarget={isDragTarget}
        dataKey={dataKey}
        showTemplateIndicators={showTemplateIndicators}
        onSelect={handleElementSelect}
        onDragStart={handleElementDragStart}
        onDrag={handleElementDrag}
        onDragEnd={handleElementDragEnd}
        onDoubleClick={handleTextDoubleClick}
        onMouseEnter={handleElementMouseEnter}
        onMouseLeave={handleElementMouseLeave}
        draggable={!isMultiSelect} // Disable individual dragging when multiple selected
      />
    )
  }, [selectedElements, editingTextId, hoveredElementId, dragOverImageId, currentSlide, handleElementSelect, handleElementDragStart, handleElementDrag, handleElementDragEnd, handleTextDoubleClick, handleElementMouseEnter, handleElementMouseLeave])
  
  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">No slide selected</p>
      </div>
    )
  }
  
  return (
    <div 
      className="relative w-full h-full bg-gray-100"
      style={{ cursor: getCursor() }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay indicator */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-blue-500 bg-opacity-10 border-2 border-dashed border-blue-500 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-lg px-6 py-4 shadow-lg">
            {dragOverImageId ? (
              <>
                <p className="text-lg font-medium text-gray-800">Replace image</p>
                <p className="text-sm text-gray-600 mt-1">Drop to replace the existing image</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-800">Drop images here</p>
                <p className="text-sm text-gray-600 mt-1">Images will be added to your slide</p>
              </>
            )}
          </div>
        </div>
      )}
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onWheel={handleWheel}
      >
        <Layer ref={layerRef}>
          <Group
            id="transform-group"
            x={stagePos.x + initialPosition.x}
            y={stagePos.y + initialPosition.y}
            scaleX={stageScale}
            scaleY={stageScale}
          >
            {/* Slide background */}
            <Rect
              name="slide-background"
              x={0}
              y={0}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              fill={CANVAS_COLORS.BACKGROUND}
              stroke={CANVAS_COLORS.BORDER}
              strokeWidth={1}
              shadowColor={CANVAS_COLORS.SHADOW}
              shadowBlur={10}
              shadowOffsetY={2}
            />
            
            {/* Render elements */}
            {currentSlide.elements.map(renderElement)}
            
            {/* Margin guides - only visible when dragging */}
            {marginGuides.map((guide, index) => (
              <Rect
                key={`margin-guide-${index}`}
                x={guide.type === 'vertical' ? guide.position : 0}
                y={guide.type === 'horizontal' ? guide.position : 0}
                width={guide.type === 'vertical' ? 1 : CANVAS_WIDTH}
                height={guide.type === 'horizontal' ? 1 : CANVAS_HEIGHT}
                fill={guide.isEdge ? CANVAS_COLORS.EDGE_LINE : CANVAS_COLORS.MARGIN_LINE}
                opacity={guide.isEdge ? CANVAS_COLORS.EDGE_LINE_ALPHA : CANVAS_COLORS.MARGIN_LINE_ALPHA}
                dash={guide.isCenter ? [5, 5] : undefined}
                listening={false}
              />
            ))}
            
            {/* Selection bounding box for multi-selection (only for unlocked elements) */}
            {selectionBoundingBox && selectedElements.filter(el => !el.locked).length > 1 && (
              <SelectionBoundingBox
                x={selectionBoundingBox.x}
                y={selectionBoundingBox.y}
                width={selectionBoundingBox.width}
                height={selectionBoundingBox.height}
                selectedElements={selectedElements.filter(el => !el.locked)}
                otherElements={currentSlide.elements.filter(el => !selectedElements.some(sel => sel.id === el.id))}
                visible={true}
                onDragStart={() => setSnapGuides([])}
                onDrag={handleSelectionDrag}
                onDragEnd={handleSelectionDragEnd}
                onResizeStart={() => setSnapGuides([])}
                onResize={handleSelectionResize}
                onResizeEnd={handleSelectionResizeEnd}
                onSnapGuidesChange={setSnapGuides}
              />
            )}
            
            {/* Text resize handlers - only show when single element selected and not locked */}
            {selectedElements.length === 1 && selectedElements
              .filter(el => el.type === 'text' && !editingTextId && draggingElementId !== el.id && !el.locked)
              .map(element => (
                <TextResizeHandler
                  key={`resize-${element.id}`}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  fontSize={element.style?.fontSize || 16}
                  elementId={element.id}
                  otherElements={currentSlide.elements}
                  visible={true}
                  onResize={(newProps) => handleTextResize(element.id, newProps)}
                  onResizeEnd={handleTextResizeEnd}
                />
              ))
            }
            
            {/* Shape and Image resize handlers - only show when single element selected and not locked */}
            {selectedElements.length === 1 && selectedElements
              .filter(el => (el.type === 'shape' || el.type === 'image') && draggingElementId !== el.id && !el.locked)
              .map(element => (
                <ShapeResizeHandler
                  key={`resize-${element.id}`}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  elementId={element.id}
                  otherElements={currentSlide.elements}
                  visible={true}
                  onResize={(newProps) => {
                    if (!currentSlide) return
                    
                    // Calculate visible margin guides during resize
                    const x = newProps.x !== undefined ? newProps.x : element.x
                    const y = newProps.y !== undefined ? newProps.y : element.y
                    const width = newProps.width !== undefined ? newProps.width : element.width
                    const height = newProps.height !== undefined ? newProps.height : element.height
                    
                    const visibleMargins = getVisibleMarginGuides(
                      x,
                      y,
                      width,
                      height
                    )
                    setMarginGuides(visibleMargins)
                    
                    updateElement(currentSlide.id, element.id, newProps)
                  }}
                  onResizeStart={() => {
                    // Clear any existing snap guides when starting resize
                    setSnapGuides([])
                  }}
                  onResizeEnd={() => {
                    setMarginGuides([])
                    setSnapGuides([])
                  }}
                />
              ))
            }
            
            {/* Snap guides */}
            {SNAP_SETTINGS.SHOW_GUIDES && snapGuides.map((guide, index) => {
              // Check if this guide position corresponds to an edge
              const isEdgeGuide = guide.type === 'vertical' 
                ? (guide.position === 0 || guide.position === CANVAS_WIDTH)
                : (guide.position === 0 || guide.position === CANVAS_HEIGHT)
              
              return (
                <Rect
                  key={`snap-guide-${index}`}
                  x={guide.type === 'vertical' ? guide.position : guide.start}
                  y={guide.type === 'horizontal' ? guide.position : guide.start}
                  width={guide.type === 'vertical' ? SNAP_SETTINGS.GUIDE_WIDTH : guide.end - guide.start}
                  height={guide.type === 'horizontal' ? SNAP_SETTINGS.GUIDE_WIDTH : guide.end - guide.start}
                  fill={guide.elementId ? CANVAS_COLORS.ELEMENT_SNAP_GUIDE : (isEdgeGuide ? CANVAS_COLORS.EDGE_SNAP_GUIDE : CANVAS_COLORS.SNAP_GUIDE)}
                  opacity={guide.elementId ? CANVAS_COLORS.ELEMENT_SNAP_GUIDE_ALPHA : (isEdgeGuide ? CANVAS_COLORS.EDGE_SNAP_GUIDE_ALPHA : CANVAS_COLORS.SNAP_GUIDE_ALPHA)}
                  listening={false}
                />
              )
            })}
            
            {/* Selection rectangle */}
            {isSelecting && (
              <Rect
                ref={selectionRectRef}
                x={Math.min(selectionRect.x, selectionRect.x + selectionRect.width)}
                y={Math.min(selectionRect.y, selectionRect.y + selectionRect.height)}
                width={Math.abs(selectionRect.width)}
                height={Math.abs(selectionRect.height)}
                fill={CANVAS_COLORS.SELECTION_FILL}
                stroke={CANVAS_COLORS.SELECTION_STROKE}
                strokeWidth={1}
                dash={[5, 5]}
                listening={false}
              />
            )}
            
            {/* Transformer - no resize or rotation */}
            <Transformer
              ref={transformerRef}
              resizeEnabled={false}
              rotateEnabled={false}
              borderStroke={CANVAS_COLORS.TRANSFORMER_STROKE}
              borderStrokeWidth={2}
              borderDash={[4, 4]}
            />
          </Group>
        </Layer>
      </Stage>
      
      {/* Text Editor Overlay */}
      {editingTextId && currentSlide && (() => {
        const element = currentSlide.elements.find(el => el.id === editingTextId)
        if (!element || element.type !== 'text') return null
        const textContent = element.content as TextContent
        
        // Recalculate position if element height changed
        const x = (element.x * stageScale) + stagePos.x + initialPosition.x
        const y = (element.y * stageScale) + stagePos.y + initialPosition.y
        
        return (
          <InlineTextEditor
            text={textContent.text}
            x={x}
            y={y}
            width={element.width * stageScale}
            height={element.height * stageScale}
            fontSize={(element.style?.fontSize || 16) * stageScale}
            fontFamily={element.style?.fontFamily || 'Arial'}
            fontWeight={element.style?.fontWeight || '400'}
            fontStyle={element.style?.fontStyle || 'normal'}
            letterSpacing={(element.style?.letterSpacing || 0) * stageScale}
            lineHeight={element.style?.lineHeight || 1.2}
            textDecoration={element.style?.textDecoration || 'none'}
            listStyle={element.style?.listStyle || 'none'}
            color={element.style?.color || '#000000'}
            gradientStart={element.style?.gradientStart}
            gradientEnd={element.style?.gradientEnd}
            gradientAngle={element.style?.gradientAngle}
            textAlign={element.style?.textAlign}
            onTextChange={handleTextEditComplete}
            onEditEnd={handleTextEditCancel}
            scale={stageScale}
          />
        )
      })()}
      

      
      {/* Edit mode indicator */}
      {editingTextId && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white rounded-lg px-3 py-1 text-sm">
          Text Edit Mode - Zoom/Pan Disabled
        </div>
      )}
      
      {/* Pan mode indicator */}
      {isSpacePressed && !editingTextId && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white rounded-lg px-3 py-1 text-sm">
          Pan Mode (Hold Space + Drag)
        </div>
      )}
      
      {/* Duplicate mode indicator */}
      {isAltPressed && !editingTextId && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white rounded-lg px-3 py-1 text-sm">
          Duplicate Mode (Alt + Drag to copy)
        </div>
      )}
    </div>
  )
}