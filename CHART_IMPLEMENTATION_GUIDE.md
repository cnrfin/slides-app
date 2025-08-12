# Chart.js Implementation Guide for Figma Slides App

## Overview
This guide outlines the implementation of Chart.js for generating charts from user prompts that can be directly added to slides as images.

## 🔴 CRITICAL: Multi-Color Selection for Bar Charts

**IMPORTANT**: Bar charts do NOT automatically use multiple colors!

- **Default behavior**: Bar charts use a SINGLE color (blue) for ALL bars
- **To get different colors per bar**: You MUST select "Multi Color" from the dropdown
- **Only Pie/Doughnut charts** automatically default to multi-color

### Testing Multi-Color:
1. Create a bar chart with 7+ items
2. First test with "Blue" selected → All bars will be blue
3. Then test with "Multi Color" selected → Each bar gets a unique color

If you're seeing repeated colors (like blue appearing twice), check:
1. Is "Multi Color" selected in the dropdown?
2. Check console for `colorOption: 'multi'`
3. Verify `generateColorArray` is being called

## Installation

```bash
pnpm add chart.js
pnpm add -D @types/chart.js
```

## Architecture Overview

### User Flow
1. User clicks **Chart** button in sidebar (`src/components/sidebar/Sidebar.tsx`)
2. Modal opens with prompt input and options
3. User enters data/prompt and selects chart type + color
4. Chart generates and shows preview
5. User clicks "Add to Slide" → Chart added as image to canvas
6. No file saving or re-uploading required

### Key Components Structure

```
src/
├── components/
│   ├── sidebar/
│   │   ├── Sidebar.tsx (Chart button here)
│   │   └── popups/
│   │       └── ChartModal.tsx (NEW - Main chart modal)
│   ├── ui/
│   │   └── Modal.tsx (Existing modal component to use)
│   └── charts/
│       ├── ChartGenerator.tsx (NEW - Chart rendering component)
│       ├── ChartPromptParser.ts (NEW - Parse user prompts)
│       └── ChartTypes.ts (NEW - Type definitions)
├── utils/
│   └── chart-utils.ts (NEW - Chart utilities and color mapping)
└── stores/
    └── slideStore.ts (Existing - use addElement method)
```

## Implementation Details

### 1. Chart Button Handler in Sidebar

```typescript
// In src/components/sidebar/Sidebar.tsx
// Update the chart button onClick:

const [showChartModal, setShowChartModal] = useState(false)

const elementButtons = [
  // ... other buttons
  { 
    icon: BarChart3, 
    label: 'Chart', 
    onClick: () => setShowChartModal(true) // Open modal
  },
]

// Add ChartModal component at the bottom of JSX
<ChartModal 
  isOpen={showChartModal}
  onClose={() => setShowChartModal(false)}
  onAddToSlide={(imageDataUrl, width, height) => {
    // Add chart to current slide
    if (!currentSlide) return
    
    addElement(currentSlide.id, {
      type: 'image',
      x: 400 - width / 2,  // Center on canvas
      y: 300 - height / 2,
      width,
      height,
      content: {
        src: imageDataUrl,
        alt: 'Generated Chart',
      },
      style: {},
    })
  }}
/>
```

### 2. ChartModal Component Structure

```typescript
// src/components/sidebar/popups/ChartModal.tsx

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  onAddToSlide: (imageDataUrl: string, width: number, height: number) => void
}

export default function ChartModal({ isOpen, onClose, onAddToSlide }: ChartModalProps) {
  const [prompt, setPrompt] = useState('')
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [chartColor, setChartColor] = useState<ColorOption>('blue')
  const [preview, setPreview] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)
  
  // Auto-set color to multi for pie/doughnut charts
  useEffect(() => {
    if (chartType === 'pie' || chartType === 'doughnut') {
      setChartColor('multi')
    }
  }, [chartType])
  
  // Chart generation logic here...
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Chart" size="xl">
      {/* Implementation details below */}
    </Modal>
  )
}
```

### 3. Chart Types Definition

```typescript
// src/components/charts/ChartTypes.ts

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter'

export type ColorOption = 
  | 'blue' 
  | 'purple' 
  | 'green' 
  | 'red' 
  | 'yellow' 
  | 'gray'
  | 'gradient-blue'
  | 'gradient-purple'
  | 'multi'

export interface ParsedChartData {
  labels: string[]
  datasets: {
    label?: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }[]
}
```

### 4. Prompt Parser Implementation

```typescript
// src/components/charts/ChartPromptParser.ts

export function parseChartPrompt(prompt: string): ParsedChartData | null {
  try {
    // Example patterns to match:
    // "January: 12000, February: 15500, March: 14200"
    // "Q1: $45K, Q2: $52K, Q3: $48K, Q4: $61K"
    // "2021 - 150, 2022 - 180, 2023 - 210"
    
    // Extract key-value pairs using regex
    const patterns = [
      /(\w+(?:\s+\d{4})?)\s*[:=\-]\s*\$?([\d,]+(?:\.\d+)?)[kKmM]?/g,
      /(\w+)\s*\(\s*\$?([\d,]+(?:\.\d+)?)[kKmM]?\s*\)/g,
    ]
    
    let matches: Array<[string, number]> = []
    
    for (const pattern of patterns) {
      const found = [...prompt.matchAll(pattern)]
      if (found.length > 0) {
        matches = found.map(match => {
          const label = match[1].trim()
          let value = match[2].replace(/,/g, '')
          
          // Handle K, M suffixes
          if (prompt.includes('k') || prompt.includes('K')) {
            value = (parseFloat(value) * 1000).toString()
          } else if (prompt.includes('m') || prompt.includes('M')) {
            value = (parseFloat(value) * 1000000).toString()
          }
          
          return [label, parseFloat(value)]
        })
        break
      }
    }
    
    if (matches.length === 0) {
      return null
    }
    
    return {
      labels: matches.map(m => m[0]),
      datasets: [{
        data: matches.map(m => m[1])
      }]
    }
  } catch (error) {
    console.error('Failed to parse chart prompt:', error)
    return null
  }
}
```

### 5. Enhanced Color System with Random Color Generation

```typescript
// src/utils/chart-utils.ts

export function getChartColors(
  colorOption: ColorOption,
  dataLength: number = 1,
  chartType: ChartType
): {
  backgroundColor: string | string[]
  borderColor: string | string[]
} {
  const cssVar = (varName: string) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
    // Fallback to hardcoded values if CSS variables aren't loaded
    if (!value) {
      console.warn(`CSS variable ${varName} not found, using fallback`)
      const fallbacks: Record<string, string> = {
        '--color-blue': '#345fd8',
        '--color-purple': '#9771ff',
        '--color-green': '#54cb56',
        '--color-red': '#fe6d66',
        '--color-yellow': '#f0ba2c',
        '--color-gray': '#d0d0d0',
      }
      return fallbacks[varName] || '#000000'
    }
    return value
  }
  
  const colorMap = {
    blue: cssVar('--color-blue'),
    purple: cssVar('--color-purple'),
    green: cssVar('--color-green'),
    red: cssVar('--color-red'),
    yellow: cssVar('--color-yellow'),
    gray: cssVar('--color-gray'),
  }
  
  // Base colors for multi-color charts - MUST be in this exact order
  const baseColors = [
    colorMap.blue,    // #345fd8
    colorMap.purple,  // #9771ff
    colorMap.green,   // #54cb56
    colorMap.yellow,  // #f0ba2c
    colorMap.red,     // #fe6d66
  ]
  
  // Debug logging
  console.log('Chart color generation:', {
    colorOption,
    dataLength,
    chartType,
    baseColors,
  })
  
  // For pie and doughnut charts, always use multi-color
  if (chartType === 'pie' || chartType === 'doughnut') {
    const colors = generateColorArray(baseColors, dataLength)
    console.log('Generated colors for pie/doughnut:', colors)
    return {
      backgroundColor: colors,
      borderColor: '#ffffff' // White borders for pie/doughnut segments
    }
  }
  
  // IMPORTANT: For bar charts with 'multi' option
  if (colorOption === 'multi') {
    const colors = generateColorArray(baseColors, dataLength)
    console.log('Generated colors for multi-color chart:', colors)
    return {
      backgroundColor: colors,
      borderColor: colors
    }
  }
  
  switch (colorOption) {
    case 'gradient-blue':
      return {
        backgroundColor: createGradient('blue'),
        borderColor: colorMap.blue
      }
    
    case 'gradient-purple':
      return {
        backgroundColor: createGradient('purple'),
        borderColor: colorMap.purple
      }
    
    default:
      // Single color for all bars
      return {
        backgroundColor: colorMap[colorOption] || colorMap.blue,
        borderColor: colorMap[colorOption] || colorMap.blue
      }
  }
}

/**
 * Generate an array of colors for the given data length
 * CRITICAL: This function must NEVER return duplicate colors
 */
function generateColorArray(baseColors: string[], dataLength: number): string[] {
  // IMPORTANT: Never use modulo or cycling - always generate unique colors
  const colors: string[] = []
  
  // Pre-defined extended palette for items 6-15
  // These are carefully chosen to be visually distinct from base colors
  const extendedPalette = [
    '#FF6B6B', // Coral red (different from brand red #fe6d66)
    '#4ECDC4', // Teal (different from brand blue #345fd8)
    '#FFA07A', // Light salmon
    '#98D8C8', // Mint green (different from brand green #54cb56)
    '#FFDA77', // Pastel yellow (different from brand yellow #f0ba2c)
    '#B19CD9', // Soft purple (different from brand purple #9771ff)
    '#87CEEB', // Sky blue
    '#DDA0DD', // Plum
    '#F0E68C', // Khaki
    '#FFB6C1', // Light pink
  ]
  
  // Build the color array WITHOUT any duplicates
  for (let i = 0; i < dataLength; i++) {
    if (i < baseColors.length) {
      // Use base colors for first 5 items
      colors.push(baseColors[i])
    } else if (i < baseColors.length + extendedPalette.length) {
      // Use extended palette for items 6-15
      const paletteIndex = i - baseColors.length
      colors.push(extendedPalette[paletteIndex])
    } else {
      // Generate new distinct colors for items 16+
      colors.push(generateDistinctColor(i - baseColors.length - extendedPalette.length, colors))
    }
  }
  
  // Safety check: Ensure no duplicates (this should never happen with correct logic)
  const uniqueColors = [...new Set(colors)]
  if (uniqueColors.length !== colors.length) {
    console.error('WARNING: Duplicate colors detected in chart! This is a bug.')
    // Fallback: replace any duplicates with generated colors
    const seen = new Set<string>()
    for (let i = 0; i < colors.length; i++) {
      if (seen.has(colors[i])) {
        colors[i] = generateDistinctColor(i, Array.from(seen))
      }
      seen.add(colors[i])
    }
  }
  
  return colors
}

/**
 * Generate a color that's distinct from existing colors
 * Uses HSL with checks to ensure sufficient difference
 */
function generateDistinctColor(index: number, existingColors: string[]): string {
  const goldenRatio = 0.618033988749895
  let attempts = 0
  let color = ''
  
  // Try to generate a distinct color, with fallback
  while (attempts < 50) {
    // Use golden ratio for initial hue, then add offset based on attempts
    const hue = ((index * goldenRatio * 360) + (attempts * 30)) % 360
    
    // Vary saturation and lightness based on index and attempts
    const saturation = 60 + ((index + attempts) % 4) * 10
    const lightness = 45 + ((index + attempts * 2) % 5) * 8
    
    color = hslToHex(hue, saturation, lightness)
    
    // Check if this color is distinct enough from existing colors
    if (isColorDistinct(color, existingColors)) {
      break
    }
    
    attempts++
  }
  
  // Fallback: if we couldn't find a distinct color, 
  // return a grayscale that's definitely different
  if (attempts >= 50) {
    const grayValue = 30 + (index * 15) % 70
    color = hslToHex(0, 0, grayValue)
  }
  
  return color
}

/**
 * Check if a color is visually distinct from existing colors
 */
function isColorDistinct(newColor: string, existingColors: string[]): boolean {
  for (const existing of existingColors) {
    if (getColorDistance(newColor, existing) < 50) {
      return false
    }
  }
  return true
}

/**
 * Calculate color distance using RGB difference
 * Returns a value between 0-441 (max possible distance)
 */
function getColorDistance(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 0
  
  const rDiff = rgb1.r - rgb2.r
  const gDiff = rgb1.g - rgb2.g
  const bDiff = rgb1.b - rgb2.b
  
  // Simple Euclidean distance
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Convert HSL to Hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = s * Math.min(l, 1 - l) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function createGradient(baseColor: string): CanvasGradient | string {
  // This will be set when chart is rendered with canvas context
  // Return base color as fallback
  const cssVar = (varName: string) => 
    getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return cssVar(`--color-${baseColor}`)
}
```

### 6. Chart Generation Logic

```typescript
// Inside ChartModal component

const generateChart = async () => {
  if (!prompt.trim() || !canvasRef.current) return
  
  setIsGenerating(true)
  
  try {
    // Parse the prompt
    const chartData = parseChartPrompt(prompt)
    if (!chartData) {
      alert('Could not parse data from prompt. Please use format like: "January: 12000, February: 15500"')
      setIsGenerating(false)
      return
    }
    
    // Destroy previous chart if exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }
    
    // Get colors (pass data length for multi-color handling)
    const colors = getChartColors(chartColor, chartData.labels.length, chartType)
    
    // Configure chart
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    // Apply gradient if needed
    if (chartColor.includes('gradient')) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      const baseColor = chartColor.replace('gradient-', '')
      const cssVar = (varName: string) => 
        getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
      
      gradient.addColorStop(0, cssVar(`--color-${baseColor}-400`))
      gradient.addColorStop(1, cssVar(`--color-${baseColor}-600`))
      colors.backgroundColor = gradient
    }
    
    // IMPORTANT: Log what colors are being used
    console.log('Applying colors to chart:', {
      type: chartType,
      colorOption: chartColor,
      colorsGenerated: colors.backgroundColor,
      dataLength: chartData.labels.length
    })
    
    // Verify multi-color for bar charts
    if (chartType === 'bar' && chartColor !== 'multi' && chartData.labels.length > 1) {
      console.warn('⚠️ Bar chart with multiple items but single color selected. Consider using "Multi Color" option.')
    }
    
    // Create chart
    const config: ChartConfiguration = {
      type: chartType === 'area' ? 'line' : chartType,
      data: {
        labels: chartData.labels,
        datasets: [{
          ...chartData.datasets[0],
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderWidth: 2,
          fill: chartType === 'area' ? 'origin' : undefined,
          tension: chartType === 'line' || chartType === 'area' ? 0.4 : undefined,
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: chartType === 'pie' || chartType === 'doughnut' // Show legend for pie/doughnut
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
          }
        },
        scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        } : undefined
      }
    }
    
    chartInstanceRef.current = new Chart(ctx, config)
    
    // Wait for chart to render
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Generate preview
    const imageUrl = canvasRef.current.toDataURL('image/png')
    setPreview(imageUrl)
    
  } catch (error) {
    console.error('Chart generation failed:', error)
    alert('Failed to generate chart. Please check your data format.')
  } finally {
    setIsGenerating(false)
  }
}

const handleAddToSlide = () => {
  if (!preview || !canvasRef.current) return
  
  // Get canvas dimensions
  const width = canvasRef.current.width
  const height = canvasRef.current.height
  
  // Scale down to reasonable size for slide (max 400px wide)
  const maxWidth = 400
  const scale = width > maxWidth ? maxWidth / width : 1
  const finalWidth = width * scale
  const finalHeight = height * scale
  
  // Add to slide
  onAddToSlide(preview, finalWidth, finalHeight)
  
  // Close modal
  onClose()
}
```

### 7. Modal UI Layout

```typescript
// Inside ChartModal JSX

<Modal isOpen={isOpen} onClose={onClose} title="Create Chart" size="xl">
  <div className="p-6 space-y-6">
    {/* Step 1: Prompt Input */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        1. Write Prompt
      </label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Create a bar chart comparing monthly revenue for 2023: [January: $12000, February: $15500, March: $14200, April: $16800, May: $18000, June: $17500]."
        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
    
    {/* Step 2: Chart Options */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          2. Choose Chart type
        </label>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as ChartType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="area">Area Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="doughnut">Doughnut Chart</option>
          <option value="scatter">Scatter Plot</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <select
          value={chartColor}
          onChange={(e) => setChartColor(e.target.value as ColorOption)}
          disabled={chartType === 'pie' || chartType === 'doughnut'} // Disabled for pie/doughnut
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="blue">Blue</option>
          <option value="purple">Purple</option>
          <option value="green">Green</option>
          <option value="red">Red</option>
          <option value="yellow">Yellow</option>
          <option value="gray">Gray</option>
          <option value="gradient-blue">Gradient Blue</option>
          <option value="gradient-purple">Gradient Purple</option>
          <option value="multi">Multi Color</option>
        </select>
        {(chartType === 'pie' || chartType === 'doughnut') && (
          <p className="text-xs text-gray-500 mt-1">
            Pie and doughnut charts always use multiple colors
          </p>
        )}
      </div>
    </div>
    
    {/* Generate Button */}
    <button
      onClick={generateChart}
      disabled={!prompt.trim() || isGenerating}
      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isGenerating ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Generate Chart
        </>
      )}
    </button>
    
    {/* Chart Preview */}
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 min-h-[300px] flex items-center justify-center bg-gray-50">
      {preview ? (
        <div className="space-y-4">
          <img src={preview} alt="Chart preview" className="max-w-full h-auto" />
          <button
            onClick={handleAddToSlide}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            Add to Slide
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-2" />
          <p>Chart preview will appear here</p>
        </div>
      )}
    </div>
    
    {/* Hidden canvas for chart rendering */}
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{ display: 'none' }}
    />
  </div>
</Modal>
```

## Key Implementation Points

### 1. CRITICAL FIX: No Duplicate Colors in Charts

**The Problem**: When charts have more than 5 data points, colors could repeat (like blue appearing twice), making it impossible to distinguish between different segments.

**The Solution**: Three-tier color system:
1. **Items 1-5**: Your brand colors from CSS variables
2. **Items 6-15**: Pre-defined extended palette (10 carefully chosen distinct colors)
3. **Items 16+**: Dynamically generated colors with distance checking

**Key Features**:
- **Color Distance Algorithm**: Ensures minimum RGB distance of 50 between any two colors
- **No Similar Colors**: Each new color is checked against ALL existing colors
- **Extended Palette**: Hand-picked colors that are visually distinct from base colors:
  ```javascript
  '#FF6B6B', // Coral (distinct from brand red)
  '#4ECDC4', // Teal (distinct from brand blue)
  '#95E77E', // Light green (distinct from brand green)
  // ... etc
  ```
- **Fallback Strategy**: If a distinct color can't be generated, uses grayscale variations

### 2. Enhanced Color Handling for Chart Types
- **Pie & Doughnut Charts**: Automatically default to multi-color mode
- **Color dropdown disabled** for pie/doughnut charts with explanatory text
- **Smart color generation**: Uses base colors from CSS variables first
- **Random color generation**: When data exceeds 5 items, generates visually distinct colors using HSL and golden ratio
- **No repeating colors**: Ensures each data point has a unique color

### 3. Color Generation Algorithm Details
- **Three-tier system** prevents any color duplication:
  - Tier 1 (1-5): CSS variable colors
  - Tier 2 (6-15): Pre-defined extended palette
  - Tier 3 (16+): Dynamically generated with distance checking
- **Color Distance Checking**: RGB Euclidean distance must be > 50
- **Golden Ratio Distribution**: For generating initial hue values
- **HSL Color Space**: Better control over saturation (60-90%) and lightness (45-85%)
- **Collision Prevention**: Up to 50 attempts to find distinct color before grayscale fallback

### 4. Canvas Management
- Use a hidden canvas element for Chart.js rendering
- Set fixed dimensions (600x400) for consistent output
- Keep chart instance reference for cleanup

### 5. Data Parsing
- Support multiple formats: "Label: Value", "Label - Value", "Label (Value)"
- Handle currency symbols ($) and abbreviations (K, M)
- Validate parsed data before chart generation

### 6. Image Export
- Use `canvas.toDataURL('image/png')` for direct conversion
- Scale down large charts to max 400px width
- Maintain aspect ratio when resizing

### 7. Error Handling
- Validate prompt parsing
- Show user-friendly error messages
- Cleanup previous chart instances

### 8. Performance
- Destroy previous chart before creating new one
- Use refs to avoid re-renders
- Debounce chart generation if needed

## CRITICAL BUG FIX: Preventing Color Repetition

### The Bug
Colors were repeating in charts (e.g., blue appearing for both item 1 and item 7), making it impossible to distinguish between different data points.

### The Root Causes & Fixes

#### 1. **Multi-Color Option Not Being Applied**
- **Problem**: The 'multi' color option wasn't being selected or applied correctly
- **Fix**: Explicitly handle `colorOption === 'multi'` BEFORE the switch statement
- **Testing**: For bar charts, manually select "Multi Color" from the dropdown

#### 2. **CSS Variables Not Loading**
- **Problem**: CSS variables might return empty strings
- **Fix**: Added fallback hex values if CSS variables aren't loaded
- **Fallback colors**:
  - Blue: #345fd8
  - Purple: #9771ff
  - Green: #54cb56
  - Yellow: #f0ba2c
  - Red: #fe6d66

#### 3. **Color Array Generation**
- **Problem**: Using modulo or array cycling caused repetition
- **Fix**: Sequential color assignment without wrapping

### How to Test the Fix

#### Step 1: Create a Bar Chart
1. Open the chart modal
2. Enter this prompt: `"Jan: 30, Apr: 22, May: 12, Jul: 45, Aug: 50, Sep: 35, Dec: 12"`
3. Select **"Bar Chart"** as type
4. **IMPORTANT**: Select **"Multi Color"** from the color dropdown
5. Click Generate

#### Step 2: Check Console Logs
Open browser console (F12) and look for:
```javascript
Chart color generation: {
  colorOption: 'multi',  // MUST be 'multi' for bar charts
  dataLength: 7,
  chartType: 'bar',
  baseColors: ['#345fd8', '#9771ff', '#54cb56', '#f0ba2c', '#fe6d66']
}
Generated colors for multi-color chart: [
  '#345fd8',  // Jan - Blue
  '#9771ff',  // Apr - Purple
  '#54cb56',  // May - Green
  '#f0ba2c',  // Jul - Yellow
  '#fe6d66',  // Aug - Red
  '#FF6B6B',  // Sep - Coral (NOT blue again!)
  '#4ECDC4'   // Dec - Teal (NOT purple again!)
]
```

#### Step 3: Verify Visual Output
Expected colors in order:
1. Jan: Blue (#345fd8)
2. Apr: Purple (#9771ff)
3. May: Green (#54cb56)
4. Jul: Yellow (#f0ba2c)
5. Aug: Red (#fe6d66)
6. Sep: Coral (#FF6B6B) - **NOT blue**
7. Dec: Teal (#4ECDC4) - **NOT purple**

### Debugging Checklist
- [ ] Is "Multi Color" selected in the dropdown?
- [ ] Does console show `colorOption: 'multi'`?
- [ ] Are baseColors populated with hex values (not empty)?
- [ ] Does generateColorArray return 7 unique colors?
- [ ] Are there any console errors about duplicates?

## Testing Checklist

- [ ] Chart button opens modal
- [ ] Prompt parsing handles various formats
- [ ] All chart types render correctly
- [ ] Pie/doughnut charts default to multi-color
- [ ] Color dropdown disabled for pie/doughnut
- [ ] Colors apply from CSS variables (first 5)
- [ ] Random colors generate for 6+ data points
- [ ] Random colors are visually distinct
- [ ] Gradients render properly
- [ ] Chart exports as image successfully
- [ ] "Add to Slide" adds image to canvas
- [ ] Image can be moved/resized on canvas
- [ ] Modal closes after adding to slide
- [ ] Error messages display for invalid data
- [ ] Previous chart cleanup works

## Example Prompts to Support

```
"January: $12000, February: $15500, March: $14200"
"Q1 - 45K, Q2 - 52K, Q3 - 48K, Q4 - 61K"
"2021 (150), 2022 (180), 2023 (210)"
"Sales: 450, Marketing: 320, Development: 680, Support: 220"
"Mon: 23, Tue: 31, Wed: 28, Thu: 35, Fri: 42"

// Large dataset example (will use random colors after first 5)
"A: 10, B: 20, C: 15, D: 25, E: 30, F: 18, G: 22, H: 28, I: 35, J: 40"
```

## Color Behavior Summary

| Chart Type | Default Color | User Can Change? | Behavior with 6+ items |
|------------|--------------|------------------|------------------------|
| Bar | blue | Yes | Single color OR multi with distinct non-repeating colors |
| Line | blue | Yes | Single color |
| Area | blue | Yes | Single color with fill |
| Pie | multi | No (disabled) | First 5: brand colors, 6-15: extended palette, 16+: generated distinct |
| Doughnut | multi | No (disabled) | First 5: brand colors, 6-15: extended palette, 16+: generated distinct |
| Scatter | blue | Yes | Single color OR multi with distinct non-repeating colors |

## Future Enhancements

1. **AI-Powered Parsing**: Use OpenAI API to parse complex natural language
2. **Multi-Dataset Support**: Allow multiple data series in one chart
3. **Custom Color Palettes**: Let users create and save custom color schemes
4. **Chart Templates**: Pre-built chart templates for common use cases
5. **Data Import**: Support CSV/Excel file upload
6. **Animation**: Add animation options for presentations
7. **Chart Editing**: Allow editing chart data after creation

## Dependencies

```json
{
  "dependencies": {
    "chart.js": "^4.4.0"
  },
  "devDependencies": {
    "@types/chart.js": "^2.9.41"
  }
}
```

## File Structure Summary

```
New files to create:
- src/components/sidebar/popups/ChartModal.tsx
- src/components/charts/ChartGenerator.tsx
- src/components/charts/ChartPromptParser.ts
- src/components/charts/ChartTypes.ts
- src/utils/chart-utils.ts

Files to modify:
- src/components/sidebar/Sidebar.tsx (add modal state and component)
```

## Notes

- Chart.js is canvas-based, perfect for image export
- No need for additional conversion libraries
- Integrates seamlessly with existing `addElement` flow
- Uses same image handling as current placeholder images
- Maintains consistency with app's design system
- Smart color system prevents confusion with large datasets

## ⚠️ CRITICAL: Bar Charts Need "Multi Color" Selected!

### For Bar Charts to Have Different Colors:
1. **You MUST select "Multi Color"** from the color dropdown
2. Default is "Blue" which gives ALL bars the same color
3. Only Pie/Doughnut charts automatically use multi-color

### Quick Test:
```javascript
// In the chart generation code, verify this:
if (chartType === 'bar' && colorOption !== 'multi') {
  console.warn('Bar chart using single color! Select "Multi Color" for different colors per bar')
}
```

## ⚠️ IMPORTANT: Common Mistakes to Avoid

### DO NOT use modulo or cycling for colors:
```javascript
// ❌ WRONG - This causes colors to repeat!
const color = baseColors[index % baseColors.length]

// ✅ CORRECT - Use the generateColorArray function
const colors = generateColorArray(baseColors, dataLength)
const color = colors[index]
```

### DO NOT reuse the same color array:
```javascript
// ❌ WRONG - Using only 5 colors for 7 items
backgroundColor: [blue, purple, green, yellow, red, blue, purple] // Blue repeats!

// ✅ CORRECT - Generate unique colors for all items
backgroundColor: generateColorArray(baseColors, 7)
// Returns: [blue, purple, green, yellow, red, coral, teal]
```

### ALWAYS validate no duplicates:
```javascript
// Add this check in development
const hasDuplicates = colors.length !== new Set(colors).size
if (hasDuplicates) {
  console.error('Color array has duplicates!', colors)
}
```