// SVG Shape Library
// All shapes use a normalized viewBox of 0 0 100 100 for easy scaling

export interface SVGShapeDefinition {
  id: string
  name: string
  path: string
  aspectRatio?: number // Width/Height ratio - if not set, shape can be freely resized
  viewBox?: string // Custom viewBox for better fitting
  strokeWidth?: number // For line-based shapes
  category: 'waves' | 'blobs' | 'decorative' | 'arrows'
}

export const SVG_SHAPES: SVGShapeDefinition[] = [
  // Waves - edge-snapping designs with smooth, organic curves
  {
    id: 'wave-bottom',
    name: 'Bottom Wave',
    path: 'M0,100 L0,80 Q25,65 50,75 T100,80 L100,100 Z',
    viewBox: '0 65 100 35',
    category: 'waves'
  },
  {
    id: 'wave-top', 
    name: 'Top Wave',
    path: 'M0,0 L0,20 Q25,35 50,25 T100,20 L100,0 Z',
    viewBox: '0 0 100 35',
    category: 'waves'
  },
  {
    id: 'wave-bottom-gentle',
    name: 'Gentle Bottom Wave',
    path: 'M0,100 L0,85 C0,85 20,75 50,78 C80,81 100,85 100,85 L100,100 Z',
    viewBox: '0 75 100 25',
    category: 'waves'
  },
  {
    id: 'wave-top-gentle',
    name: 'Gentle Top Wave',
    path: 'M0,0 L0,15 C0,15 20,25 50,22 C80,19 100,15 100,15 L100,0 Z',
    viewBox: '0 0 100 25',
    category: 'waves'
  },
  {
    id: 'wave-left',
    name: 'Left Wave',
    path: 'M13.88 0L13.31 4.17C12.75 8.33 11.63 16.67 12.06 25C12.5 33.33 14.5 41.67 15.79 50C17.09 58.33 17.66 66.67 16.69 75C15.71 83.33 13.16 91.67 11.9 95.83L10.63 100L0 100L0 95.83C0 91.67 0 83.33 0 75C0 66.67 0 58.33 0 50C0 41.67 0 33.33 0 25C0 16.67 0 8.33 0 4.17L0 0Z',
    viewBox: '0 0 18 100',
    category: 'waves'
  },
  {
    id: 'wave-right',
    name: 'Right Wave',
    path: 'M74.22 100L74.78 95.83C75.32 91.67 76.42 83.33 78.27 75C80.12 66.67 82.71 58.33 84.67 50C86.64 41.67 87.96 33.33 87.29 25C86.63 16.67 84.01 8.33 82.7 4.17L81.38 0L100 0L100 4.17C100 8.33 100 16.67 100 25C100 33.33 100 41.67 100 50C100 58.33 100 66.67 100 75C100 83.33 100 91.67 100 95.83L100 100Z',
    viewBox: '74 0 26 100',
    category: 'waves'
  },
  {
    id: 'wave-corner',
    name: 'Corner Wave',
    path: 'M0 60Q0 40 20 40L40 40Q60 40 60 20L60 0L100 0L100 100L0 100Z',
    viewBox: '0 0 100 100',
    category: 'waves'
  },
  
  // Blobs - no aspect ratio for free resizing, with tight viewBoxes
  {
    id: 'blob-bubble',
    name: 'Bubble Blob',
    path: 'M50,15 C65,15 80,25 85,40 C90,55 85,70 75,80 C65,90 50,95 35,90 C20,85 10,70 10,50 C10,30 25,15 50,15 Z',
    viewBox: '10 15 80 80',
    category: 'blobs'
  },
  {
    id: 'blob-egg',
    name: 'Egg Blob',
    path: 'M30,50 C30,30 40,15 60,15 C80,15 95,30 95,50 C95,70 80,85 60,85 C40,85 30,70 30,50 Z',
    viewBox: '30 15 65 70',
    category: 'blobs'
  },
  {
    id: 'blob-thought',
    name: 'Thought Cloud',
    path: 'M25,45 C20,35 25,25 35,25 C40,20 50,18 58,22 C63,15 73,15 78,22 C85,23 90,30 88,38 C92,43 90,52 83,55 C80,60 70,62 63,58 C58,63 48,63 43,58 C35,60 27,55 25,45 Z M20,75 C20,73 22,71 24,71 C26,71 28,73 28,75 C28,77 26,79 24,79 C22,79 20,77 20,75 Z M15,85 C15,82 17,80 20,80 C23,80 25,82 25,85 C25,88 23,90 20,90 C17,90 15,88 15,85 Z',
    viewBox: '15 15 75 75',
    category: 'blobs'
  },
  {
    id: 'blob-organic',
    name: 'Organic Blob',
    path: 'M20,30 C15,20 25,10 40,15 C55,20 70,15 80,25 C90,35 92,50 85,65 C78,80 60,85 45,80 C30,75 15,70 10,55 C5,40 10,25 20,30 Z',
    viewBox: '5 10 87 75',
    category: 'blobs'
  },
  {
    id: 'blob-fluid',
    name: 'Fluid Blob',
    path: 'M35,20 C50,10 70,12 82,25 C94,38 90,55 78,68 C66,81 48,83 33,75 C18,67 8,50 12,35 C16,20 25,15 35,20 Z',
    viewBox: '8 10 86 73',
    category: 'blobs'
  },
  
  // Decorative - most shapes have no aspect ratio for free resizing
  {
    id: 'corner-curve',
    name: 'Corner Curve',
    path: 'M0,0 Q100,0 100,100 L0,100 Z',
    viewBox: '0 0 100 100',
    category: 'decorative'
  },
  {
    id: 'ribbon-banner',
    name: 'Ribbon Banner',
    path: 'M10,40 L0,30 L0,70 L10,60 L90,60 L100,70 L100,30 L90,40 Z',
    viewBox: '0 30 100 40',
    category: 'decorative'
  },
  {
    id: 'badge-star',
    name: 'Star Badge',
    path: 'M50,10 L60,35 L85,35 L65,50 L75,75 L50,60 L25,75 L35,50 L15,35 L40,35 Z',
    aspectRatio: 1.08, // Keep aspect ratio for star badge
    viewBox: '15 10 70 65',
    category: 'decorative'
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    path: 'M25,10 L75,10 L100,50 L75,90 L25,90 L0,50 Z',
    aspectRatio: 1.25, // Keep aspect ratio for hexagon
    viewBox: '0 10 100 80',
    category: 'decorative'
  },
  {
    id: 'shield',
    name: 'Shield',
    path: 'M50,10 L80,20 L80,50 C80,70 65,85 50,90 C35,85 20,70 20,50 L20,20 Z',
    aspectRatio: 0.75, // Keep aspect ratio for shield
    viewBox: '20 10 60 80',
    category: 'decorative'
  },
  
  // Arrows - keep aspect ratio for arrows
  {
    id: 'arrow-up',
    name: 'Arrow Up',
    path: 'M50,0 L20,40 L35,40 L35,100 L65,100 L65,40 L80,40 Z',
    aspectRatio: 0.6, // Keep aspect ratio for arrows
    viewBox: '20 0 60 100',
    category: 'arrows'
  },
  {
    id: 'arrow-down',
    name: 'Arrow Down',
    path: 'M50,100 L20,60 L35,60 L35,0 L65,0 L65,60 L80,60 Z',
    aspectRatio: 0.6, // Keep aspect ratio for arrows
    viewBox: '20 0 60 100',
    category: 'arrows'
  },
  {
    id: 'arrow-left',
    name: 'Arrow Left',
    path: 'M0,50 L40,20 L40,35 L100,35 L100,65 L40,65 L40,80 Z',
    aspectRatio: 1.67, // Keep aspect ratio for arrows
    viewBox: '0 20 100 60',
    category: 'arrows'
  },
  {
    id: 'arrow-right',
    name: 'Arrow Right',
    path: 'M100,50 L60,20 L60,35 L0,35 L0,65 L60,65 L60,80 Z',
    aspectRatio: 1.67, // Keep aspect ratio for arrows
    viewBox: '0 20 100 60',
    category: 'arrows'
  }
]

// Helper function to get shapes by category
export function getShapesByCategory(category: SVGShapeDefinition['category']): SVGShapeDefinition[] {
  return SVG_SHAPES.filter(shape => shape.category === category)
}

// Helper function to get shape by ID
export function getShapeById(id: string): SVGShapeDefinition | undefined {
  return SVG_SHAPES.find(shape => shape.id === id)
}

// Helper function to create an icon preview of the shape
export function createShapeIcon(path: string, size: number = 20): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="${path}" fill="currentColor"/>
  </svg>`
}
