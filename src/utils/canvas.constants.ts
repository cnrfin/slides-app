// src/utils/canvas.constants.ts
// Canvas constants for consistent usage across the app

export const CANVAS_DIMENSIONS = {
  WIDTH: 800,
  HEIGHT: 600,
  MARGIN_H: 25,
  MARGIN_V: 25,
} as const

export const ZOOM_LIMITS = {
  MIN: 0.33,
  MAX: 2.0,
  STEP: 0.1,
} as const

export const CANVAS_COLORS = {
  BACKGROUND: '#FFFFFF',
  BORDER: '#e5e7eb',
  SHADOW: 'rgba(0, 0, 0, 0.1)',
  SELECTION_FILL: 'rgba(59, 130, 246, 0.1)',
  SELECTION_STROKE: 'rgba(59, 130, 246, 0.5)',
  TRANSFORMER_STROKE: '#3b82f6',
  TRANSFORMER_ANCHOR: '#ffffff',
  MARGIN_LINE: '#ff6b6b',
  MARGIN_LINE_ALPHA: 0.3,
  EDGE_LINE: '#0ea5e9', // Cyan for edge snapping guides
  EDGE_LINE_ALPHA: 0.3,
  SNAP_GUIDE: '#ff6b6b',
  SNAP_GUIDE_ALPHA: 0.8,
  EDGE_SNAP_GUIDE: '#0ea5e9', // Cyan for edge snapping guides
  EDGE_SNAP_GUIDE_ALPHA: 0.8,
  ELEMENT_SNAP_GUIDE: '#9333ea', // Purple for element-to-element snapping
  ELEMENT_SNAP_GUIDE_ALPHA: 0.8,
  LOCKED_SELECTION: '#9333ea', // Purple border for locked selected elements
} as const

export const SNAP_SETTINGS = {
  THRESHOLD: 10, // Snap when within 10px of margin or center
  GUIDE_WIDTH: 1,
  SHOW_GUIDES: true,
} as const