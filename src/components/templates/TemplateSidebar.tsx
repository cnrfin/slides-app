// src/components/templates/TemplateSidebar.tsx
import { Layout, Type, FileText, Brain, BarChart3, Grid3x3, Target } from 'lucide-react'
import type { TemplateCategory } from '@/types/template.types'

interface TemplateSidebarProps {
  selectedCategory: TemplateCategory | 'all'
  onSelectCategory: (category: TemplateCategory | 'all') => void
  categoryCounts?: Record<string, number>
}

const categoryIcons: Record<string, React.ReactNode> = {
  all: <Layout className="w-4 h-4" />,
  blank: <FileText className="w-4 h-4" />,
  title: <Type className="w-4 h-4" />,
  'warm-up': <Brain className="w-4 h-4" />,
  objectives: <Target className="w-4 h-4" />,
  vocabulary: <Type className="w-4 h-4" />,
  conversation: <FileText className="w-4 h-4" />,
  reading: <FileText className="w-4 h-4" />,
  review: <Grid3x3 className="w-4 h-4" />,
  end: <FileText className="w-4 h-4" />
}

const categories = [
  { id: 'all', name: 'All Templates' },
  { id: 'blank', name: 'Blank' },
  { id: 'title', name: 'Title' },
  { id: 'warm-up', name: 'Warm Up' },
  { id: 'objectives', name: 'Objectives' },
  { id: 'vocabulary', name: 'Vocabulary' },
  { id: 'conversation', name: 'Conversation' },
  { id: 'reading', name: 'Reading' },
  { id: 'review', name: 'Review' },
  { id: 'end', name: 'End' }
]

export default function TemplateSidebar({ 
  selectedCategory, 
  onSelectCategory,
  categoryCounts = {}
}: TemplateSidebarProps) {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        Categories
      </h3>
      
      <nav className="space-y-1">
        {categories.map(category => {
          const count = category.id === 'all' 
            ? Object.values(categoryCounts).reduce((sum, n) => sum + n, 0)
            : categoryCounts[category.id] || 0
            
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id as TemplateCategory | 'all')}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg
                transition-colors duration-150
                ${selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {categoryIcons[category.id] || <Layout className="w-4 h-4" />}
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              {count > 0 && (
                <span className="text-xs text-gray-500">{count}</span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
