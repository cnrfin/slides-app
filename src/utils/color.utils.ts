// src/utils/color.utils.ts

/**
 * Convert hex color to RGBA with opacity
 * @param hex - Hex color string (e.g., '#ffffff')
 * @param opacity - Opacity value between 0 and 1
 * @returns RGBA string (e.g., 'rgba(255, 255, 255, 0.5)')
 */
export function hexToRgba(hex: string, opacity: number = 1): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '')
  
  // Parse hex values
  let r: number, g: number, b: number
  
  if (cleanHex.length === 3) {
    // Short form (e.g., 'fff')
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
  } else if (cleanHex.length === 6) {
    // Full form (e.g., 'ffffff')
    r = parseInt(cleanHex.substring(0, 2), 16)
    g = parseInt(cleanHex.substring(2, 4), 16)
    b = parseInt(cleanHex.substring(4, 6), 16)
  } else {
    // Invalid hex, return original with opacity
    return `rgba(0, 0, 0, ${opacity})`
  }
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Apply opacity to a color (hex or rgba)
 * @param color - Color string (hex or rgba)
 * @param opacity - Opacity value between 0 and 1
 * @returns Color with applied opacity
 */
export function applyOpacityToColor(color: string | undefined, opacity: number = 1): string | undefined {
  if (!color) return undefined
  
  // If it's already an rgba color, update the alpha value
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/)
    if (match) {
      return `rgba(${match[1]},${match[2]},${match[3]}, ${opacity})`
    }
  }
  
  // If it's an rgb color, add alpha
  if (color.startsWith('rgb')) {
    const match = color.match(/rgb\(([^,]+),([^,]+),([^)]+)\)/)
    if (match) {
      return `rgba(${match[1]},${match[2]},${match[3]}, ${opacity})`
    }
  }
  
  // If it's a hex color, convert to rgba
  if (color.startsWith('#')) {
    return hexToRgba(color, opacity)
  }
  
  // If it's a named color or other format, try to return it with opacity in case it works
  // This handles cases like 'transparent', 'red', 'blue', etc.
  return color
}
