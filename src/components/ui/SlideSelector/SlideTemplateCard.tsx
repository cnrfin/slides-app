import React from 'react'
import { Plus, Minus } from 'lucide-react'
import type { SlideTemplateInfo } from './types'

interface SlideTemplateCardProps {
  template: SlideTemplateInfo
  count: number
  onAdd: () => void
  onRemove: () => void
  disabled?: boolean
}

export const SlideTemplateCard: React.FC<SlideTemplateCardProps> = ({
  template,
  count,
  onAdd,
  onRemove,
  disabled = false
}) => {
  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    'title': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'warm-up': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'vocabulary': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'conversation': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'reading': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'review': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    'end': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'objectives': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'content': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  }

  const colors = categoryColors[template.category] || categoryColors['content']

  return (
    <div 
      className={`relative p-3 rounded-lg border transition-all ${
        count > 0 ? `${colors.bg} ${colors.border} border-2` : 'bg-white border-gray-200 hover:bg-gray-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Badge showing count */}
      {count > 0 && (
        <div className={`absolute -top-2 -right-2 w-6 h-6 ${colors.bg} ${colors.text} border-2 border-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm`}>
          {count}
        </div>
      )}
      
      <div className="mb-2">
        <h4 className={`text-sm font-medium ${count > 0 ? colors.text : 'text-gray-700'}`}>
          {template.name}
        </h4>
        <p className={`text-xs ${count > 0 ? colors.text : 'text-gray-500'} mt-0.5`}>
          {template.category}
        </p>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={onRemove}
          disabled={disabled || count === 0}
          className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
            count > 0 && !disabled
              ? 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Minus size={12} />
        </button>
        <span className="px-2 text-sm font-medium text-gray-700 min-w-[24px] text-center">
          {count}
        </span>
        <button
          onClick={onAdd}
          disabled={disabled}
          className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
            !disabled
              ? `${colors.bg} ${colors.text} ${colors.border} border hover:opacity-80`
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  )
}
