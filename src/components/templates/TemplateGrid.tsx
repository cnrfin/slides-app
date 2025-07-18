// src/components/templates/TemplateGrid.tsx
import TemplateCard from './TemplateCard'
import type { SlideTemplate } from '@/types/template.types'

interface TemplateGridProps {
  templates: SlideTemplate[]
  onSelectTemplate: (template: SlideTemplate) => void
  selectedTemplateId?: string
}

export default function TemplateGrid({ 
  templates, 
  onSelectTemplate, 
  selectedTemplateId 
}: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>No templates found</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          onClick={onSelectTemplate}
          isSelected={template.id === selectedTemplateId}
        />
      ))}
    </div>
  )
}
