// src/components/TemplateDesigner.tsx
import { useState, useEffect } from 'react'
import { X, Save, Download, Code, Wand2, FileJson, Minimize2, Maximize2 } from 'lucide-react'
import useSlideStore, { useCurrentSlide, useSelectedElements } from '@/stores/slideStore'
import type { SlideType, SlideElement } from '@/types/slide.types'
import type { SlideTemplate } from '@/types/template.types'
import { generateTemplateCode, saveTemplateToStorage, exportTemplateAsJSON } from '@/utils/template.utils'

interface TemplateDesignerProps {
  isOpen: boolean
  onClose: () => void
}

export default function TemplateDesigner({ isOpen, onClose }: TemplateDesignerProps) {
  const currentSlide = useCurrentSlide()
  const selectedElements = useSelectedElements()
  const updateSlide = useSlideStore(state => state.updateSlide)
  const updateElement = useSlideStore(state => state.updateElement)
  
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [slideType, setSlideType] = useState<SlideType>('custom')
  const [dataKeys, setDataKeys] = useState<Record<string, string>>({})
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  
  // Initialize state when slide changes
  useEffect(() => {
    if (currentSlide) {
      setSlideType(currentSlide.slideType || 'custom')
      setDataKeys(currentSlide.metadata?.dataKeys || {})
      setTemplateName(currentSlide.metadata?.templateName || '')
      setTemplateDescription(currentSlide.metadata?.templateDescription || '')
    }
  }, [currentSlide])
  
  // Update selected element when selection changes
  useEffect(() => {
    if (selectedElements.length === 1) {
      setSelectedElementId(selectedElements[0].id)
    } else {
      setSelectedElementId(null)
    }
  }, [selectedElements])
  
  if (!isOpen || !currentSlide) return null
  
  const handleSlideTypeChange = (type: SlideType) => {
    setSlideType(type)
    updateSlide(currentSlide.id, {
      slideType: type,
      metadata: {
        ...currentSlide.metadata,
        dataKeys,
        templateName,
        templateDescription,
      }
    })
  }
  
  const handleDataKeyChange = (elementId: string, dataKey: string) => {
    const newDataKeys = { ...dataKeys }
    if (dataKey.trim() === '') {
      delete newDataKeys[elementId]
    } else {
      newDataKeys[elementId] = dataKey
    }
    setDataKeys(newDataKeys)
    
    updateSlide(currentSlide.id, {
      metadata: {
        ...currentSlide.metadata,
        dataKeys: newDataKeys,
        templateName,
        templateDescription,
      }
    })
  }
  
  const saveAsTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name')
      return
    }
    
    // Create template from current slide
    const template: SlideTemplate = {
      id: `template-${Date.now()}`,
      name: templateName,
      category: 'custom',
      description: templateDescription,
      background: currentSlide.background,
      elements: currentSlide.elements.map(el => ({
        type: el.type,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation,
        opacity: el.opacity,
        locked: el.locked,
        visible: el.visible,
        content: el.content,
        style: el.style,
        animations: el.animations,
        interactions: el.interactions,
      })),
      tags: [slideType]
    }
    
    // Save to localStorage for now
    saveTemplateToStorage(template)
    
    alert(`Template "${templateName}" saved to localStorage!`)
  }
  
  const exportAsTypeScript = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name')
      return
    }
    
    // Generate TypeScript code for the template
    const templateCode = generateTemplateCode(
      templateName,
      templateDescription,
      slideType,
      currentSlide.background,
      currentSlide.elements,
      dataKeys
    )
    
    // Download as TypeScript file
    const blob = new Blob([templateCode], { type: 'text/typescript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}.template.ts`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const exportAsJSON = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name')
      return
    }
    
    const template: SlideTemplate = {
      id: `template-${Date.now()}`,
      name: templateName,
      category: 'custom',
      description: templateDescription,
      background: currentSlide.background,
      elements: currentSlide.elements.map(el => ({
        type: el.type,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation,
        opacity: el.opacity,
        locked: el.locked,
        visible: el.visible,
        content: el.content,
        style: el.style,
        animations: el.animations,
        interactions: el.interactions,
      })),
      tags: [slideType]
    }
    
    const filename = `${templateName.toLowerCase().replace(/\s+/g, '-')}.template.json`
    exportTemplateAsJSON({ ...template, dataKeys }, filename)
  }
  
  const slideTypeOptions: { value: SlideType; label: string }[] = [
    { value: 'title', label: 'Title Page' },
    { value: 'warm-up', label: 'Warm Up' },
    { value: 'vocabulary', label: 'Vocabulary' },
    { value: 'conversation', label: 'Conversation' },
    { value: 'reading', label: 'Reading' },
    { value: 'review', label: 'Review' },
    { value: 'end', label: 'End Page' },
    { value: 'custom', label: 'Custom' },
  ]
  
  return (
    <div className="fixed inset-y-0 right-0 z-40 flex items-start justify-end pointer-events-none">
      {isMinimized ? (
        // Minimized state - small floating button
        <button
          onClick={() => setIsMinimized(false)}
          className="pointer-events-auto m-4 p-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2"
          title="Expand Template Designer"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="text-sm font-medium">Template Designer</span>
        </button>
      ) : (
        // Expanded state - full panel
        <div className="pointer-events-auto bg-white rounded-l-lg shadow-xl w-96 max-h-[90vh] overflow-hidden m-4">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              Template Designer
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Template Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Vocabulary Grid"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Description
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Brief description of the template..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            {/* Slide Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Slide Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {slideTypeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSlideTypeChange(option.value)}
                    className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                      slideType === option.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Data Key Mapping */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Dynamic Data Mapping
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Select an element and assign a data key for dynamic content population.
                <span className="block mt-1 text-purple-600">💡 Tip: Minimize this panel to easily select elements on the canvas.</span>
              </p>
              
              {selectedElementId && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <label className="text-xs font-medium text-purple-700 mb-1 block">
                    Data key for selected element:
                  </label>
                  <input
                    type="text"
                    value={dataKeys[selectedElementId] || ''}
                    onChange={(e) => handleDataKeyChange(selectedElementId, e.target.value)}
                    placeholder="e.g., title, vocabulary[0].word"
                    className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-purple-600 mt-1">
                    Use dot notation for nested data: vocabulary[0].translation
                  </p>
                </div>
              )}
              
              {!selectedElementId && (
                <p className="text-xs text-gray-500 italic">
                  Select an element on the canvas to assign a data key
                </p>
              )}
              
              {/* Show existing mappings */}
              {Object.keys(dataKeys).length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-gray-600">Current mappings:</p>
                  {Object.entries(dataKeys).map(([elementId, dataKey]) => {
                    const element = currentSlide?.elements.find(el => el.id === elementId)
                    const elementType = element?.type || 'unknown'
                    return (
                      <div key={elementId} className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="text-gray-400">{elementType}:</span>
                        <code className="bg-gray-100 px-1 py-0.5 rounded">{dataKey}</code>
                        <button
                          onClick={() => handleDataKeyChange(elementId, '')}
                          className="text-red-500 hover:text-red-700 ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-2">
          <button
            onClick={saveAsTemplate}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          
          <button
            onClick={exportAsTypeScript}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            title="Export as TypeScript"
          >
            <Code className="w-4 h-4" />
            TS
          </button>
          
          <button
            onClick={exportAsJSON}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            title="Export as JSON"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>
      )}
    </div>
  )
}
