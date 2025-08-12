// src/utils/chart-utils.ts

import type { ChartColorConfig, ColorOption, ChartType } from '@/components/charts/ChartTypes'

export function getChartColors(
  colorOption: ColorOption,
  dataLength: number = 1,
  chartType?: ChartType
): ChartColorConfig {
  const getCSSVar = (varName: string): string => {
    const computedStyle = getComputedStyle(document.documentElement)
    const value = computedStyle.getPropertyValue(varName).trim()
    if (!value) {
      // Fallback values
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
  
  // Extended color palette with 12 distinct colors for better variety
  const multiColorPalette = [
    getCSSVar('--color-blue'),    // #345fd8
    getCSSVar('--color-purple'),  // #9771ff 
    getCSSVar('--color-green'),   // #54cb56
    getCSSVar('--color-yellow'),  // #f0ba2c
    getCSSVar('--color-red'),     // #fe6d66
    '#06b6d4',                     // Cyan
    '#ec4899',                     // Pink
    '#84cc16',                     // Lime
    '#f97316',                     // Orange
    '#6366f1',                     // Indigo
    '#14b8a6',                     // Teal
    '#a855f7',                     // Violet
  ]
  
  // Single color map
  const colorMap: Record<string, string> = {
    blue: getCSSVar('--color-blue'),
    purple: getCSSVar('--color-purple'),
    green: getCSSVar('--color-green'),
    red: getCSSVar('--color-red'),
    yellow: getCSSVar('--color-yellow'),
    gray: getCSSVar('--color-gray'),
  }
  
  // Handle multi-color option
  if (colorOption === 'multi') {
    // Take as many colors as needed from the palette
    const colors = multiColorPalette.slice(0, Math.min(dataLength, multiColorPalette.length))
    
    // If we need more colors than available, generate additional distinct colors
    if (dataLength > multiColorPalette.length) {
      for (let i = multiColorPalette.length; i < dataLength; i++) {
        colors.push(generateDistinctColor(i, colors))
      }
    }
    
    return {
      backgroundColor: colors,
      borderColor: chartType === 'pie' || chartType === 'doughnut' ? '#ffffff' : colors
    }
  }
  
  // Handle gradient options
  switch (colorOption) {
    case 'gradient-blue':
      return {
        backgroundColor: colorMap.blue, // Will be replaced with gradient in component
        borderColor: chartType === 'pie' || chartType === 'doughnut' ? '#ffffff' : colorMap.blue
      }
    
    case 'gradient-purple':
      return {
        backgroundColor: colorMap.purple, // Will be replaced with gradient in component
        borderColor: chartType === 'pie' || chartType === 'doughnut' ? '#ffffff' : colorMap.purple
      }
    
    default:
      // Single color option
      const singleColor = colorMap[colorOption] || colorMap.blue
      return {
        backgroundColor: singleColor,
        borderColor: chartType === 'pie' || chartType === 'doughnut' ? '#ffffff' : singleColor
      }
  }
}

// Create gradient helper function
export function createChartGradient(
  ctx: CanvasRenderingContext2D, 
  colorOption: 'gradient-blue' | 'gradient-purple'
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  
  const getCSSVar = (varName: string): string => {
    const computedStyle = getComputedStyle(document.documentElement)
    return computedStyle.getPropertyValue(varName).trim()
  }
  
  if (colorOption === 'gradient-blue') {
    const lightBlue = getCSSVar('--color-blue-400') || '#60a5fa'
    const darkBlue = getCSSVar('--color-blue-600') || '#2563eb'
    gradient.addColorStop(0, lightBlue)
    gradient.addColorStop(1, darkBlue)
  } else if (colorOption === 'gradient-purple') {
    const lightPurple = getCSSVar('--color-purple-400') || '#a78bfa'
    const darkPurple = getCSSVar('--color-purple-600') || '#7c3aed'
    gradient.addColorStop(0, lightPurple)
    gradient.addColorStop(1, darkPurple)
  }
  
  return gradient
}

// Generate a distinct color for additional data points
function generateDistinctColor(index: number, existingColors: string[]): string {
  const goldenRatio = 0.618033988749895
  let attempts = 0
  let color = ''
  
  while (attempts < 50) {
    // Use golden ratio for hue distribution
    const hue = ((index * goldenRatio * 360) + (attempts * 30)) % 360
    const saturation = 60 + ((index + attempts) % 4) * 10
    const lightness = 45 + ((index + attempts * 2) % 5) * 8
    
    color = hslToHex(hue, saturation, lightness)
    
    // Check if this color is distinct enough
    if (isColorDistinct(color, existingColors)) {
      break
    }
    
    attempts++
  }
  
  // Fallback to grayscale if we couldn't find a distinct color
  if (attempts >= 50) {
    const grayValue = 30 + (index * 15) % 70
    color = hslToHex(0, 0, grayValue)
  }
  
  return color
}

// Check if a color is visually distinct from existing colors
function isColorDistinct(newColor: string, existingColors: string[]): boolean {
  for (const existing of existingColors) {
    if (getColorDistance(newColor, existing) < 50) {
      return false
    }
  }
  return true
}

// Calculate color distance using RGB difference
function getColorDistance(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 0
  
  const rDiff = rgb1.r - rgb2.r
  const gDiff = rgb1.g - rgb2.g
  const bDiff = rgb1.b - rgb2.b
  
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
}

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Convert HSL to Hex color
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

// Format number for display (e.g., 1000 -> 1K, 1000000 -> 1M)
export function formatChartNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

// Get chart recommendations based on data
export function getChartRecommendation(labels: string[], dataPoints: number[]): ChartType {
  // If we have more than 7 data points, line or area charts work better
  if (dataPoints.length > 7) {
    return 'line'
  }
  
  // If labels are time-based (months, years, dates), suggest line or area
  const timePatterns = [
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    /^q[1-4]/i,
    /^\d{4}$/,
    /^(mon|tue|wed|thu|fri|sat|sun)/i
  ]
  
  const hasTimeLabels = labels.some(label => 
    timePatterns.some(pattern => pattern.test(label))
  )
  
  if (hasTimeLabels) {
    return 'line'
  }
  
  // For categorical data with few points, bar chart is good
  if (dataPoints.length <= 5) {
    return 'bar'
  }
  
  // Default to bar chart
  return 'bar'
}

// Validate if data is suitable for pie/doughnut charts
export function isValidForCircularChart(dataPoints: number[]): boolean {
  // Pie and doughnut charts work best with positive values
  return dataPoints.every(value => value >= 0)
}

// Get default chart options based on type
export function getDefaultChartOptions(type?: ChartType) {
  const baseOptions = {
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        }
      }
    }
  }
  
  // Add scale options for cartesian charts
  if (type && type !== 'pie' && type !== 'doughnut') {
    return {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      }
    }
  }
  
  return baseOptions
}
