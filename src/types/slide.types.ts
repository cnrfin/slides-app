// src/types/slide.types.ts

export interface Presentation {
  id: string
  title: string
  description?: string
  slides: string[] // Array of slide IDs
  createdAt: string
  updatedAt: string
  version: number
  settings?: PresentationSettings
}

export interface PresentationSettings {
  defaultTemplate?: string
  theme?: string
  language?: string
  gradeLevel?: string
}

export interface Slide {
  id: string
  presentationId: string
  elements: SlideElement[]
  background: string | SlideBackground
  order: number
  templateId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SlideBackground {
  type: 'color' | 'gradient' | 'image'
  value: string
  opacity?: number
}

export interface SlideElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  opacity?: number
  locked?: boolean
  visible?: boolean
  content: ElementContent
  style?: ElementStyle
  animations?: Animation[]
  interactions?: Interaction[]
  createdAt: string
  updatedAt: string
}

export type ElementType = 
  | 'text'
  | 'image'
  | 'shape'
  | 'video'
  | 'audio'
  | 'table'
  | 'chart'
  | 'exercise'
  | 'group'

export type ElementContent = 
  | TextContent
  | ImageContent
  | ShapeContent
  | VideoContent
  | AudioContent
  | TableContent
  | ChartContent
  | ExerciseContent
  | GroupContent

export interface TextContent {
  text: string
  placeholder?: string
  richText?: boolean
}

export interface ImageContent {
  src: string
  alt?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

export interface ShapeContent {
  shape: 'rectangle' | 'circle' | 'triangle' | 'star' | 'arrow'
  points?: number[] // For custom shapes
}

export interface VideoContent {
  src: string
  poster?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
}

export interface AudioContent {
  src: string
  autoplay?: boolean
  loop?: boolean
  showControls?: boolean
}

export interface TableContent {
  rows: number
  columns: number
  cells: TableCell[][]
  headerRow?: boolean
  headerColumn?: boolean
}

export interface TableCell {
  text: string
  image?: string
  audio?: string
  style?: CellStyle
}

export interface CellStyle {
  background?: string
  color?: string
  fontSize?: number
  fontWeight?: string
  textAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
}

export interface ChartContent {
  type: 'bar' | 'line' | 'pie' | 'donut'
  data: ChartData
  options?: ChartOptions
}

export interface ChartData {
  labels: string[]
  datasets: Dataset[]
}

export interface Dataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string
}

export interface ChartOptions {
  showLegend?: boolean
  showGrid?: boolean
  animated?: boolean
}

export interface ExerciseContent {
  type: ExerciseType
  config: ExerciseConfig
  validation?: ValidationRule[]
}

export type ExerciseType = 
  | 'fill-in-blank'
  | 'multiple-choice'
  | 'matching'
  | 'ordering'
  | 'vocabulary-table'
  | 'discussion-prompt'

export interface ExerciseConfig {
  // Specific to each exercise type
  [key: string]: any
}

export interface ValidationRule {
  type: 'required' | 'pattern' | 'custom'
  value?: any
  message?: string
}

export interface GroupContent {
  elementIds: string[]
}

export interface ElementStyle {
  // Text styles
  fontFamily?: string
  fontSize?: number
  fontWeight?: string
  fontStyle?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  lineHeight?: number
  letterSpacing?: number
  textDecoration?: string
  listStyle?: 'bullet' | 'none'
  
  // Colors
  color?: string
  backgroundColor?: string
  borderColor?: string
  
  // Gradient support
  gradientStart?: string
  gradientEnd?: string
  gradientAngle?: number
  gradientStartPosition?: number
  gradientEndPosition?: number
  
  // Border
  borderWidth?: number
  borderStyle?: string
  borderRadius?: number // 0-50px for shapes
  
  // Shadow
  shadow?: Shadow
  
  // Other
  padding?: number | { top: number; right: number; bottom: number; left: number }
  zIndex?: number
}

export interface Shadow {
  x: number
  y: number
  blur: number
  color: string
}

export interface Animation {
  type: AnimationType
  trigger: 'onEnter' | 'onClick' | 'onHover' | 'afterPrevious' | 'withPrevious'
  duration: number
  delay?: number
  easing?: string
  config?: AnimationConfig
}

export type AnimationType = 
  | 'fadeIn'
  | 'fadeOut'
  | 'slideIn'
  | 'slideOut'
  | 'zoomIn'
  | 'zoomOut'
  | 'rotate'
  | 'bounce'

export interface AnimationConfig {
  direction?: 'left' | 'right' | 'top' | 'bottom'
  angle?: number
  scale?: number
}

export interface Interaction {
  type: InteractionType
  action: InteractionAction
  config?: InteractionConfig
}

export type InteractionType = 
  | 'click'
  | 'hover'
  | 'drag'
  | 'drop'

export type InteractionAction = 
  | 'navigate'
  | 'playAudio'
  | 'showModal'
  | 'revealAnswer'
  | 'submitAnswer'

export interface InteractionConfig {
  target?: string
  value?: any
}

// Template types
export interface Template {
  id: string
  name: string
  category: TemplateCategory
  thumbnail: string
  elements: Partial<SlideElement>[]
  config?: TemplateConfig
}

export type TemplateCategory = 
  | 'vocabulary'
  | 'grammar'
  | 'discussion'
  | 'assessment'
  | 'presentation'
  | 'blank'

export interface TemplateConfig {
  gradeLevel?: string[]
  subject?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime?: number // in minutes
}