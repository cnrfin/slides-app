// Shared types for the SlideSelector components

export interface SelectedSlideInstance {
  instanceId: string // Unique ID for this instance
  templateId: string
  name: string
  category: string
  order: number
}

export interface SlideTemplateInfo {
  id: string
  name: string
  category: string
}

export interface SlideStructurePreset {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  slides: Array<{
    templateId: string
    count: number
  }>
}
