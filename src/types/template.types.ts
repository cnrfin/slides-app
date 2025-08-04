// src/types/template.types.ts
import type { SlideElement } from './slide.types'

export interface SlideTemplate {
  id: string
  name: string
  category: TemplateCategory
  thumbnail?: string
  description?: string
  elements: Partial<SlideElement>[]
  background?: string
  tags?: string[]
}

export type TemplateCategory = 
  | 'blank'
  | 'title'
  | 'warm-up'
  | 'vocabulary'
  | 'conversation'
  | 'reading'
  | 'review'
  | 'end'
  | 'objectives'
  | 'content'
  | 'all'

export interface TemplateGroup {
  category: TemplateCategory
  name: string
  icon?: string
  templates: SlideTemplate[]
}
