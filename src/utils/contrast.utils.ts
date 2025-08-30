/**
 * Contrast utilities for automatic text color adjustment
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance using WCAG formula
 * Returns value between 0 (darkest) and 1 (lightest)
 */
export function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  // Convert RGB to sRGB
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  // Apply gamma correction
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Returns value between 1 and 21 (higher is better contrast)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine if a color is light or dark
 */
export function isLightColor(color: string): boolean {
  return getLuminance(color) > 0.5;
}

/**
 * Get optimal text color (black or white) for a given background
 */
export function getOptimalTextColor(backgroundColor: string): string {
  // For light backgrounds, use dark text
  // For dark backgrounds, use light text
  return isLightColor(backgroundColor) ? '#1f2937' : '#ffffff';
}

/**
 * Calculate effective color when element has opacity
 */
export function getEffectiveColor(
  foregroundColor: string, 
  backgroundColor: string, 
  opacity: number
): string {
  const fg = hexToRgb(foregroundColor);
  const bg = hexToRgb(backgroundColor);
  
  if (!fg || !bg) return foregroundColor;
  
  // Blend colors based on opacity
  const r = Math.round(fg.r * opacity + bg.r * (1 - opacity));
  const g = Math.round(fg.g * opacity + bg.g * (1 - opacity));
  const b = Math.round(fg.b * opacity + bg.b * (1 - opacity));
  
  // Convert back to hex
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}

/**
 * Handle gradient backgrounds by calculating average luminance
 */
export function getGradientLuminance(
  gradientStart: string, 
  gradientEnd: string,
  startPosition: number = 0,
  endPosition: number = 100
): number {
  const startLum = getLuminance(gradientStart);
  const endLum = getLuminance(gradientEnd);
  
  // Weight by position percentages
  const startWeight = (100 - startPosition) / 100;
  const endWeight = endPosition / 100;
  
  return (startLum * startWeight + endLum * endWeight) / (startWeight + endWeight);
}
