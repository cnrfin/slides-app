// src/data/templates/index.ts
import { blankTemplates } from './blank'
import { vocabularyTemplates } from './vocabulary'
import type { SlideTemplate, TemplateGroup } from '@/types/template.types'

// Combine all templates
export const allTemplates: SlideTemplate[] = [
  ...blankTemplates,
  ...vocabularyTemplates
]

// Group templates by category
export const templateGroups: TemplateGroup[] = [
  {
    category: 'blank',
    name: 'Blank',
    templates: blankTemplates
  },
  {
    category: 'title',
    name: 'Title',
    templates: []
  },
  {
    category: 'warm-up',
    name: 'Warm Up',
    templates: []
  },
  {
    category: 'vocabulary',
    name: 'Vocabulary',
    templates: vocabularyTemplates
  },
  {
    category: 'conversation',
    name: 'Conversation',
    templates: []
  },
  {
    category: 'reading',
    name: 'Reading',
    templates: []
  },
  {
    category: 'review',
    name: 'Review',
    templates: []
  },
  {
    category: 'end',
    name: 'End',
    templates: []
  }
]

// Get template by ID
export const getTemplateById = (id: string): SlideTemplate | undefined => {
  return allTemplates.find(t => t.id === id)
}

// Get templates by category
export const getTemplatesByCategory = (category: string): SlideTemplate[] => {
  return allTemplates.filter(t => t.category === category)
}

// Search templates
export const searchTemplates = (query: string): SlideTemplate[] => {
  const lowerQuery = query.toLowerCase()
  return allTemplates.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description?.toLowerCase().includes(lowerQuery) ||
    t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}
