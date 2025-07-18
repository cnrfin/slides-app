// src/components/templates/TemplateCard.tsx
import type { SlideTemplate } from '@/types/template.types'
import { Plus } from 'lucide-react'

interface TemplateCardProps {
  template: SlideTemplate
  onClick: (template: SlideTemplate) => void
  isSelected?: boolean
}

export default function TemplateCard({ template, onClick, isSelected = false }: TemplateCardProps) {
  // Create a mini preview of the template
  const renderPreview = () => {
    // Simple preview rendering based on template background and element count
    const hasElements = template.elements.length > 0
    const bgColor = template.background || '#ffffff'
    
    return (
      <div 
        className="absolute inset-0 rounded overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        {/* Simple element representation */}
        {hasElements && (
          <div className="p-2 scale-75 origin-top-left">
            {template.elements.slice(0, 3).map((element, index) => {
              if (element.type === 'text') {
                return (
                  <div
                    key={index}
                    className="bg-gray-300 rounded mb-1"
                    style={{
                      width: `${Math.min((element.width || 100) * 0.15, 80)}px`,
                      height: `${Math.min((element.height || 20) * 0.15, 15)}px`,
                      marginLeft: `${(element.x || 0) * 0.1}px`,
                      marginTop: `${(element.y || 0) * 0.05}px`
                    }}
                  />
                )
              } else if (element.type === 'shape') {
                return (
                  <div
                    key={index}
                    className="rounded"
                    style={{
                      backgroundColor: element.style?.backgroundColor || '#e5e7eb',
                      width: `${Math.min((element.width || 100) * 0.15, 60)}px`,
                      height: `${Math.min((element.height || 100) * 0.15, 60)}px`,
                      marginLeft: `${(element.x || 0) * 0.1}px`,
                      marginTop: `${(element.y || 0) * 0.05}px`,
                      borderRadius: element.style?.borderRadius ? `${element.style.borderRadius * 0.5}px` : '2px'
                    }}
                  />
                )
              }
              return null
            })}
          </div>
        )}
        
        {/* Show "Blank" text for blank templates */}
        {!hasElements && template.category === 'blank' && (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
            Blank
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div
      onClick={() => onClick(template)}
      className={`
        relative group cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}
      `}
    >
      {/* Template preview */}
      <div className="relative aspect-[4/3] bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        {renderPreview()}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        </div>
      </div>
      
      {/* Template name */}
      <p className="mt-2 text-sm text-gray-700 text-center font-medium">
        {template.name}
      </p>
      
      {/* Template description */}
      {template.description && (
        <p className="text-xs text-gray-500 text-center mt-0.5">
          {template.description}
        </p>
      )}
    </div>
  )
}
