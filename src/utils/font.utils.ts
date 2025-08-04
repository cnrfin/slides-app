// src/utils/font.utils.ts

// Font weight mapping for font loading
const FONT_WEIGHT_MAP: Record<string, string> = {
  '100': '100',
  '200': '200',
  '300': '300',
  '400': 'normal',
  '500': '500',
  '600': '600',
  '700': 'bold',
  '800': '800',
  '900': '900',
  'normal': 'normal',
  'bold': 'bold'
}

// Cache for loaded fonts
const loadedFonts = new Set<string>()

/**
 * Load a font using the Font Loading API
 * @param fontFamily - The font family name
 * @param fontWeight - The font weight (optional)
 * @returns Promise that resolves when font is loaded
 */
export async function loadFont(fontFamily: string, fontWeight: string = '400'): Promise<void> {
  const cacheKey = `${fontFamily}-${fontWeight}`
  
  // Skip if already loaded
  if (loadedFonts.has(cacheKey)) {
    return Promise.resolve()
  }
  
  try {
    // Check if fonts API is available
    if ('fonts' in document) {
      const weight = FONT_WEIGHT_MAP[fontWeight] || fontWeight
      await document.fonts.load(`${weight} 16px "${fontFamily}"`)
      loadedFonts.add(cacheKey)
    } else {
      // Fallback: Create a temporary element to force font loading
      const testElement = document.createElement('span')
      testElement.style.fontFamily = `"${fontFamily}"`
      testElement.style.fontWeight = fontWeight
      testElement.style.position = 'absolute'
      testElement.style.left = '-9999px'
      testElement.style.visibility = 'hidden'
      testElement.textContent = 'Font Loading Test'
      
      document.body.appendChild(testElement)
      
      // Give browser time to load font
      await new Promise(resolve => setTimeout(resolve, 100))
      
      document.body.removeChild(testElement)
      loadedFonts.add(cacheKey)
    }
  } catch (error) {
    console.warn(`Failed to load font: ${fontFamily} ${fontWeight}`, error)
  }
}

/**
 * Preload commonly used fonts
 */
export async function preloadCommonFonts(): Promise<void> {
  const commonFonts = [
    { family: 'Inter', weights: ['400', '500', '600', '700'] },
    { family: 'Roboto', weights: ['400', '500', '700'] },
    { family: 'Open Sans', weights: ['400', '600', '700'] },
    { family: 'Arial', weights: ['normal', 'bold'] },
    { family: 'Helvetica', weights: ['normal', 'bold'] }
  ]
  
  const loadPromises: Promise<void>[] = []
  
  for (const font of commonFonts) {
    for (const weight of font.weights) {
      loadPromises.push(loadFont(font.family, weight))
    }
  }
  
  await Promise.all(loadPromises)
}

/**
 * Check if a font is available in the system
 * @param fontFamily - The font family to check
 * @returns boolean indicating if font is available
 */
export function isFontAvailable(fontFamily: string): boolean {
  // Create a test canvas to check font availability
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  
  if (!context) return false
  
  const testText = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const fontSize = 72
  const baseFont = 'monospace'
  
  // Measure text with base font
  context.font = `${fontSize}px ${baseFont}`
  const baseWidth = context.measureText(testText).width
  
  // Measure text with target font
  context.font = `${fontSize}px "${fontFamily}", ${baseFont}`
  const testWidth = context.measureText(testText).width
  
  // If widths are different, the font is available
  return baseWidth !== testWidth
}

/**
 * Get list of available system fonts from our font list
 */
export function getAvailableSystemFonts(fontList: Array<{name: string, value: string}>): Array<{name: string, value: string}> {
  return fontList.filter(font => {
    // Always include web fonts we're loading
    const webFonts = ['Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins', 
                      'Playfair Display', 'Lato', 'Raleway', 'Merriweather', 'Source Sans Pro']
    
    return webFonts.includes(font.value) || isFontAvailable(font.value)
  })
}
