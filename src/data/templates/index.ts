// src/data/templates/index.ts
import { blankTemplates } from './blank'
import { titleTemplates } from './titles'
import { contentTemplates } from './content'
import { exerciseTemplates } from './exercises'
import { sectionTemplates } from './sections'
import type { SlideTemplate, TemplateGroup } from '@/types/template.types'

// Combine all templates
export const allTemplates: SlideTemplate[] = [
  ...blankTemplates,
  ...titleTemplates,
  ...contentTemplates,
  ...exerciseTemplates,
  ...sectionTemplates
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
    name: 'Title Slides',
    templates: titleTemplates
  },
  {
    category: 'content',
    name: 'Content Layouts',
    templates: contentTemplates
  },
  {
    category: 'section',
    name: 'Sections',
    templates: sectionTemplates.filter(t => t.category === 'section')
  },
  {
    category: 'list',
    name: 'Lists',
    templates: sectionTemplates.filter(t => t.category === 'list')
  },
  {
    category: 'exercise',
    name: 'Exercises',
    templates: exerciseTemplates
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
