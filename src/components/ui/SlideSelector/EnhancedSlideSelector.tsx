import React, { useState, useEffect, useRef } from 'react'
import { X, Search, Settings2, Plus, Minus } from 'lucide-react'
import type { SlideTemplateInfo, SelectedSlideInstance, SlideStructurePreset } from './types'
import { nanoid } from 'nanoid'

interface EnhancedSlideSelectorProps {
  availableTemplates: SlideTemplateInfo[]
  onSelectionChange: (slides: SelectedSlideInstance[]) => void
  onClose: () => void
  disabled?: boolean
  initialSelection?: SelectedSlideInstance[]
}

export const EnhancedSlideSelector: React.FC<EnhancedSlideSelectorProps> = ({
  availableTemplates,
  onSelectionChange,
  onClose,
  disabled = false,
  initialSelection = []
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  // Initialize template counts from initial selection
  const getInitialCounts = () => {
    const counts: Record<string, number> = {}
    initialSelection.forEach(slide => {
      counts[slide.templateId] = (counts[slide.templateId] || 0) + 1
    })
    return counts
  }
  
  const [templateCounts, setTemplateCounts] = useState<Record<string, number>>(getInitialCounts())
  const [selectedSlides, setSelectedSlides] = useState<SelectedSlideInstance[]>(initialSelection)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const [savedTemplates, setSavedTemplates] = useState<SlideStructurePreset[]>([])
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [mobileView, setMobileView] = useState<'templates' | 'slides'>('templates')

  // Categories for the dropdown
  const categories = [
    'All',
    'Title',
    'Objectives', 
    'Warm-up',
    'Conversation',
    'Vocabulary',
    'Reading',
    'Grammar',
    'Review'
  ]

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    'title': { bg: '#f3e8ff', text: '#9333ea', border: '#e9d5ff' },
    'objectives': { bg: '#fef3c7', text: '#f59e0b', border: '#fde68a' },
    'warm-up': { bg: '#fed7aa', text: '#ea580c', border: '#ffedd5' },
    'vocabulary': { bg: '#dbeafe', text: '#3b82f6', border: '#bfdbfe' },
    'conversation': { bg: '#d1fae5', text: '#10b981', border: '#a7f3d0' },
    'reading': { bg: '#e0e7ff', text: '#6366f1', border: '#c7d2fe' },
    'grammar': { bg: '#fce7f3', text: '#ec4899', border: '#fbcfe8' },
    'review': { bg: '#fae8ff', text: '#d946ef', border: '#f5d0fe' },
    'end': { bg: '#fee2e2', text: '#ef4444', border: '#fecaca' },
    'content': { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' }
  }

  // Filter templates based on search and category
  const filteredTemplates = availableTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || 
                           template.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })



  const handleAddTemplate = (templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId)
    if (!template) return

    // Update counts
    setTemplateCounts(prev => ({
      ...prev,
      [templateId]: (prev[templateId] || 0) + 1
    }))

    // Add new slide instance
    const newSlide: SelectedSlideInstance = {
      instanceId: nanoid(),
      templateId: template.id,
      name: template.name,
      category: template.category,
      order: selectedSlides.length + 1
    }

    setSelectedSlides(prev => [...prev, newSlide])
  }

  const handleRemoveTemplate = (templateId: string) => {
    const currentCount = templateCounts[templateId] || 0
    if (currentCount === 0) return

    // Find the last instance of this template
    const lastInstanceIndex = selectedSlides
      .map((s, i) => ({ slide: s, index: i }))
      .reverse()
      .find(item => item.slide.templateId === templateId)?.index

    if (lastInstanceIndex !== undefined) {
      // Remove the instance and reorder
      const newSlides = selectedSlides.filter((_, index) => index !== lastInstanceIndex)
        .map((slide, index) => ({ ...slide, order: index + 1 }))

      setSelectedSlides(newSlides)

      // Update counts
      setTemplateCounts(prev => ({
        ...prev,
        [templateId]: Math.max(0, (prev[templateId] || 0) - 1)
      }))
    }
  }

  const handleRemoveSlideInstance = (instanceId: string) => {
    const slide = selectedSlides.find(s => s.instanceId === instanceId)
    if (!slide) return

    // Remove the instance and reorder
    const newSlides = selectedSlides
      .filter(s => s.instanceId !== instanceId)
      .map((slide, index) => ({ ...slide, order: index + 1 }))

    setSelectedSlides(newSlides)

    // Update counts
    setTemplateCounts(prev => ({
      ...prev,
      [slide.templateId]: Math.max(0, (prev[slide.templateId] || 0) - 1)
    }))
  }

  const handleDragStart = (e: React.DragEvent, instanceId: string) => {
    setDraggedItem(instanceId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, instanceId: string) => {
    e.preventDefault()
    if (draggedItem && draggedItem !== instanceId) {
      setDragOverItem(instanceId)
    }
  }

  const handleDrop = (e: React.DragEvent, targetInstanceId: string) => {
    e.preventDefault()
    if (!draggedItem) return

    if (draggedItem === targetInstanceId) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    const draggedIndex = selectedSlides.findIndex(s => s.instanceId === draggedItem)
    const targetIndex = selectedSlides.findIndex(s => s.instanceId === targetInstanceId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newSlides = [...selectedSlides]
    const [draggedSlide] = newSlides.splice(draggedIndex, 1)
    newSlides.splice(targetIndex, 0, draggedSlide)

    // Update order numbers
    const reorderedSlides = newSlides.map((slide, index) => ({
      ...slide,
      order: index + 1
    }))

    setSelectedSlides(reorderedSlides)
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const saveAsTemplate = () => {
    const templateName = prompt('Enter a name for this template:')
    if (!templateName) return

    const newTemplate: SlideStructurePreset = {
      id: nanoid(),
      name: templateName,
      description: `${selectedSlides.length} slides`,
      icon: null,
      slides: Object.entries(templateCounts)
        .filter(([_, count]) => count > 0)
        .map(([templateId, count]) => ({
          templateId,
          count
        }))
    }

    setSavedTemplates(prev => [...prev, newTemplate])
    localStorage.setItem('savedSlideTemplates', JSON.stringify([...savedTemplates, newTemplate]))
  }

  const totalSlides = selectedSlides.length

  return (
    <div className="flex flex-col h-full bg-white rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Select Slides</h3>
        <button
          onClick={() => {
            // Just close without updating parent
            onClose()
          }}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={18} className="sm:hidden" />
          <X size={20} className="hidden sm:block" />
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex gap-2 sm:gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search size={16} className="sm:hidden absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <Search size={18} className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center justify-center p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Filter by category"
            >
              <Settings2 size={16} className="sm:hidden text-gray-500" />
              <Settings2 size={18} className="hidden sm:block text-gray-500" />
            </button>

            {showCategoryDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category)
                      setShowCategoryDropdown(false)
                    }}
                    className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                      selectedCategory === category ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher - Only visible on small screens */}
      <div className="flex sm:hidden border-b border-gray-200">
        <button
          onClick={() => setMobileView('templates')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mobileView === 'templates' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setMobileView('slides')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            mobileView === 'slides' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500'
          }`}
        >
          Slides
          {totalSlides > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
              {totalSlides}
            </span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col sm:flex-row" style={{ minHeight: 0 }}>
        {/* Left Side - Template List */}
        <div className={`flex-1 overflow-y-auto border-b sm:border-b-0 sm:border-r border-gray-200 p-4 sm:p-6 scrollbar-hide ${
          mobileView === 'templates' ? 'block' : 'hidden sm:block'
        }`}>
          <div className="space-y-2 sm:space-y-3">
            {filteredTemplates.map(template => {
              const count = templateCounts[template.id] || 0
              
              return (
                <div
                  key={template.id}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    count > 0 
                      ? `border-blue-400 bg-blue-50` 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {template.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {template.description || `A ${template.category} template`}
                      </p>
                    </div>
                    
                    {/* Number Picker */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRemoveTemplate(template.id)}
                        disabled={count === 0}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all ${
                          count > 0
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            : 'bg-white text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        <Minus size={14} className="sm:hidden" />
                        <Minus size={16} className="hidden sm:block" strokeWidth={2} />
                      </button>
                      
                      <span className="w-6 sm:w-8 text-center text-base sm:text-lg font-semibold text-gray-900">
                        {count}
                      </span>
                      
                      <button
                        onClick={() => handleAddTemplate(template.id)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all"
                      >
                        <Plus size={14} className="sm:hidden" />
                        <Plus size={16} className="hidden sm:block" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Side - Selected Slides Preview */}
        <div className={`w-full sm:w-[400px] lg:w-[450px] bg-gray-50 flex flex-col ${
          mobileView === 'slides' ? 'block' : 'hidden sm:flex'
        }`} style={{ minHeight: 0 }}>
          <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">
                Slides ({totalSlides})
              </h4>
              {totalSlides > 0 && (
                <button
                  onClick={saveAsTemplate}
                  className="text-xs text-gray-500 hover:text-gray-700 italic"
                >
                  Save as template
                </button>
              )}
            </div>
          </div>

          {/* Selected Slides List - Fixed scrollable container */}
          <div 
            className="flex-1 overflow-y-auto px-4 sm:px-6 pt-2 pb-2 scrollbar-hide"
            style={{
              minHeight: 0
            }}
          >
            <div className="flex flex-col gap-3 pb-4">
              {selectedSlides.map((slide) => {
                const colors = categoryColors[slide.category] || categoryColors['content']
                const isDragging = draggedItem === slide.instanceId
                const isDragOver = dragOverItem === slide.instanceId

                return (
                  <div
                    key={slide.instanceId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, slide.instanceId)}
                    onDragOver={(e) => handleDragOver(e, slide.instanceId)}
                    onDrop={(e) => handleDrop(e, slide.instanceId)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center px-4 py-3 rounded-full transition-all cursor-move ${
                      isDragging ? 'opacity-50' : ''
                    } ${isDragOver ? 'scale-[1.02]' : ''}`}
                    style={{
                      backgroundColor: colors.bg,
                      minHeight: '56px'
                    }}
                  >
                    {/* Order Badge */}
                    <div 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: colors.text }}
                    >
                      {slide.order}
                    </div>

                    {/* Content */}
                    <div className="flex-1 ml-3 sm:ml-4 min-w-0">
                      <p className="text-sm sm:text-base font-medium truncate" style={{ color: colors.text }}>
                        {slide.name}
                      </p>
                      <p className="text-xs sm:text-sm opacity-75 truncate" style={{ color: colors.text }}>
                        {slide.category}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveSlideInstance(slide.instanceId)}
                      className="ml-2 p-1.5 sm:p-2 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors flex-shrink-0"
                      style={{ color: colors.text }}
                    >
                      <X size={18} className="sm:hidden" />
                      <X size={20} className="hidden sm:block" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
            <button
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Use Template
            </button>
            <button
              onClick={() => {
                // Only update parent when explicitly adding slides
                onSelectionChange(selectedSlides)
                onClose()
              }}
              disabled={totalSlides === 0}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add slides
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Custom scrollbar styles to match sidebar */
        .scrollbar-hide::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .scrollbar-hide::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-hide::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }
        
        .scrollbar-hide:hover::-webkit-scrollbar-thumb {
          background: #d1d5db;
        }
        
        /* For Firefox */
        .scrollbar-hide {
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }
      `}</style>
    </div>
  )
}
