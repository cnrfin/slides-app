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
  slideType?: SlideType
  notes?: string
  metadata?: SlideMetadata
  createdAt: string
  updatedAt: string
}

export type SlideType = 
  | 'title'
  | 'warm-up'
  | 'vocabulary'
  | 'conversation'
  | 'reading'
  | 'review'
  | 'end'
  | 'objectives'

export interface SlideMetadata {
  dataKeys?: Record<string, string> // Maps element IDs to data keys for template population
  templateName?: string
  templateDescription?: string
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
  metadata?: ElementMetadata // Add metadata for element relationships
  createdAt: string
  updatedAt: string
}

export interface ElementMetadata {
  tableId?: string // ID of parent table if this is a cell text element
  cellRow?: number // Row index in table
  cellCol?: number // Column index in table
  [key: string]: any // Allow other metadata
}

export type ElementType = 
  | 'text'
  | 'image'
  | 'shape'
  | 'blurb'
  | 'line'
  | 'icon'
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
  | BlurbContent
  | LineContent
  | IconContent
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
  isPlaceholder?: boolean // Flag to indicate this is a placeholder image
  // For object-fit: cover positioning
  offsetX?: number // Horizontal offset of the image within the frame (0-1, 0.5 = centered)
  offsetY?: number // Vertical offset of the image within the frame (0-1, 0.5 = centered)
  scale?: number // Scale factor for the image (1 = fit to cover, >1 = zoomed in)
}

export interface ShapeContent {
  shape: 'rectangle' | 'circle' | 'triangle' | 'star' | 'arrow' | 'svg'
  svgPath?: string // SVG path data for svg shapes
  svgId?: string // Reference to SVG shape library
  aspectRatio?: number // Optional aspect ratio to maintain
  viewBox?: string // Custom viewBox for tight bounds
  points?: number[] // For custom shapes
}

export interface BlurbContent {
  text: string
  tailPosition?: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right' | 'left-center' | 'right-center'
  placeholder?: string
}

export interface LineContent {
  points: [number, number, number, number] // [x1, y1, x2, y2]
  lineCap?: 'butt' | 'round' | 'square'
}

export interface IconContent {
  iconId: string // ID of the icon (e.g., 'check', 'star', 'heart')
  iconType?: 'lucide' | 'custom' // Type of icon library
  svgPath?: string // Optional custom SVG path for custom icons
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
  columnWidths?: number[] // Store column widths
  rowHeights?: number[] // Store row heights
}

export interface TableCell {
  text: string
  dataKey?: string // For template support
  image?: string
  audio?: string
  style?: CellStyle
  width?: number // Cell-specific width override
  height?: number // Cell-specific height override
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
  
  // Blend mode
  blendMode?: BlendMode
  
  // Other
  padding?: number | { top: number; right: number; bottom: number; left: number }
  zIndex?: number
  
  // Icon specific
  strokeWidth?: number
}

export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'

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
