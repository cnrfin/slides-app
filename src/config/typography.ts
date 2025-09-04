// src/config/typography.ts

/**
 * Global Typography Configuration
 * 
 * This file defines the typography system for the app UI (not canvas elements).
 * - Headings use Martina Plantijn Light
 * - Body text uses Inter
 * 
 * To change font sizes globally, edit the CSS variables in /src/styles/globals.css
 */

export const typography = {
  // Font families
  fonts: {
    heading: "'Martina Plantijn', 'Georgia', serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  
  // Font sizes in pixels (for reference - actual values in CSS)
  sizes: {
    h1: 40,  // Main page titles
    h2: 32,  // Section headers
    h3: 24,  // Subsection headers
    h4: 20,  // Card titles
    h5: 18,  // Small headers
    h6: 16,  // Tiny headers
    bodyLarge: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
    micro: 10,
  },
  
  // CSS class names to use in components
  classes: {
    // Headings (Martina Plantijn)
    h1: 'text-h1',
    h2: 'text-h2',
    h3: 'text-h3',
    h4: 'text-h4',
    h5: 'text-h5',
    h6: 'text-h6',
    
    // Body text (Inter)
    bodyLarge: 'text-body-large',
    body: 'text-body',
    bodySmall: 'text-body-small',
    caption: 'text-caption',
    micro: 'text-micro',
    
    // UI elements (Inter)
    button: 'text-button',
    label: 'text-label',
    menu: 'text-menu',
  },
  
  // Line heights
  lineHeights: {
    heading: 1.2,
    body: 1.6,
    relaxed: 1.75,
  },
  
  // Font weights
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
}

// Helper function to get typography class
export const getTypographyClass = (variant: keyof typeof typography.classes): string => {
  return typography.classes[variant]
}

// Example usage in components:
// import { typography, getTypographyClass } from '@/config/typography'
// 
// <h1 className={getTypographyClass('h1')}>Dashboard</h1>
// <p className={getTypographyClass('body')}>Welcome back!</p>
// <button className={getTypographyClass('button')}>Click me</button>
