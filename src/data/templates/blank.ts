// src/data/templates/blank.ts
import type { SlideTemplate } from '@/types/template.types'

export const blankTemplates: SlideTemplate[] = [
  {
    id: 'blank-white',
    name: 'Blank',
    category: 'blank',
    description: 'Start with a blank slide',
    elements: [],
    background: '#ffffff',
    tags: ['empty', 'blank', 'clean']
  },
  {
    id: 'blank-light-gray',
    name: 'Blank (Light Gray)',
    category: 'blank',
    description: 'Blank slide with light gray background',
    elements: [],
    background: '#f9fafb',
    tags: ['empty', 'blank', 'gray']
  },
  {
    id: 'blank-dark',
    name: 'Blank (Dark)',
    category: 'blank',
    description: 'Blank slide with dark background',
    elements: [],
    background: '#1f2937',
    tags: ['empty', 'blank', 'dark']
  }
]
