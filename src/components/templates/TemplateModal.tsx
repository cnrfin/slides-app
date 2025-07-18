// src/components/templates/TemplateModal.tsx
import { useState, useMemo } from 'react'
import Modal from '@/components/ui/Modal'
import TemplateGrid from './TemplateGrid'
import TemplateSidebar from './TemplateSidebar'
import { Search } from 'lucide-react'
import { templateGroups, searchTemplates } from '@/data/templates'
import type { SlideTemplate, TemplateCategory } from '@/types/template.types'

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: SlideTemplate) => void
}

export default function TemplateModal({ 
  isOpen, 
  onClose, 
  onSelectTemplate 
}: TemplateModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()
  
  // Get filtered templates based on category and search
  const filteredTemplates = useMemo(() => {
    let templates: SlideTemplate[] = []
    
    // Filter by category
    if (selectedCategory === 'all') {
      templates = templateGroups.flatMap(group => group.templates)
    } else {
      const group = templateGroups.find(g => g.category === selectedCategory)
      templates = group?.templates || []
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery).filter(t => 
        selectedCategory === 'all' || t.category === selectedCategory
      )
    }
    
    return templates
  }, [selectedCategory, searchQuery])
  
  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    templateGroups.forEach(group => {
      counts[group.category] = group.templates.length
    })
    return counts
  }, [])
  
  const handleSelectTemplate = (template: SlideTemplate) => {
    setSelectedTemplateId(template.id)
    onSelectTemplate(template)
    onClose()
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose a template"
      size="full"
    >
      <div className="flex h-[80vh]">
        {/* Sidebar */}
        <TemplateSidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
        />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2 
                  border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  text-sm
                "
              />
            </div>
          </div>
          
          {/* Template grid */}
          <div className="flex-1 overflow-y-auto">
            <TemplateGrid
              templates={filteredTemplates}
              onSelectTemplate={handleSelectTemplate}
              selectedTemplateId={selectedTemplateId}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
