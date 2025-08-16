// Shared fonts configuration used across the app
export interface Font {
  name: string
  family: string
  type: 'Sans Serif' | 'Serif' | 'Monospace' | 'Display'
  weights: string[] // Available font weights for this font
}

// Fonts sorted alphabetically
export const FONTS: Font[] = [
  { 
    name: 'Arial', 
    family: 'Arial, sans-serif', 
    type: 'Sans Serif',
    weights: ['300', '400', '500', '600', '700', '900'] // Extended weight support
  },
  { 
    name: 'Comic Sans MS', 
    family: 'Comic Sans MS, cursive', 
    type: 'Display',
    weights: ['400', '700'] // Regular and Bold
  },
  { 
    name: 'Courier New', 
    family: 'Courier New, monospace', 
    type: 'Monospace',
    weights: ['400', '700'] // Regular and Bold
  },
  { 
    name: 'Geneva', 
    family: 'Geneva, sans-serif', 
    type: 'Sans Serif',
    weights: ['300', '400', '500', '600', '700'] // Light to Bold
  },
  { 
    name: 'Georgia', 
    family: 'Georgia, serif', 
    type: 'Serif',
    weights: ['300', '400', '700'] // Light, Regular and Bold
  },
  { 
    name: 'Helvetica', 
    family: 'Helvetica, sans-serif', 
    type: 'Sans Serif',
    weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] // Full range
  },
  { 
    name: 'Impact', 
    family: 'Impact, sans-serif', 
    type: 'Display',
    weights: ['400'] // Only Regular (Impact is inherently bold)
  },
  { 
    name: 'Inter', 
    family: 'Inter, sans-serif', 
    type: 'Sans Serif',
    weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] // All weights
  },
  { 
    name: 'Merriweather', 
    family: 'Merriweather, serif', 
    type: 'Serif',
    weights: ['300', '400', '700', '900'] // Light, Regular, Bold, Black
  },
  { 
    name: 'Montserrat', 
    family: 'Montserrat, sans-serif', 
    type: 'Sans Serif',
    weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] // All weights
  },
  { 
    name: 'Open Sans', 
    family: 'Open Sans, sans-serif', 
    type: 'Sans Serif',
    weights: ['300', '400', '500', '600', '700', '800'] // Light to Extra Bold
  },
  { 
    name: 'Playfair Display', 
    family: 'Playfair Display, serif', 
    type: 'Serif',
    weights: ['400', '500', '600', '700', '800', '900'] // Regular to Black
  },
  { 
    name: 'Poppins', 
    family: 'Poppins, sans-serif', 
    type: 'Sans Serif',
    weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] // All weights
  },
  { 
    name: 'Roboto', 
    family: 'Roboto, sans-serif', 
    type: 'Sans Serif',
    weights: ['100', '300', '400', '500', '700', '900'] // Thin, Light, Regular, Medium, Bold, Black
  },
  { 
    name: 'Times New Roman', 
    family: 'Times New Roman, serif', 
    type: 'Serif',
    weights: ['400', '700'] // Regular and Bold
  },
  { 
    name: 'Trebuchet MS', 
    family: 'Trebuchet MS, sans-serif', 
    type: 'Sans Serif',
    weights: ['400', '700'] // Regular and Bold
  },
  { 
    name: 'Verdana', 
    family: 'Verdana, sans-serif', 
    type: 'Sans Serif',
    weights: ['400', '700'] // Regular and Bold
  },
]

// Helper function to get fonts by type
export const getFontsByType = (type: string) => {
  return FONTS.filter(font => font.type === type)
}

// Helper function to get the font display name from family value
export const getFontDisplayName = (fontFamily: string) => {
  const font = FONTS.find(f => f.family === fontFamily)
  return font?.name || fontFamily
}

// Helper function to get available weights for a font family
export const getAvailableWeights = (fontFamily: string): string[] => {
  const font = FONTS.find(f => f.family === fontFamily)
  return font?.weights || ['400', '700'] // Default to regular and bold
}

// Helper function to check if a weight is available for a font
export const isWeightAvailable = (fontFamily: string, weight: string): boolean => {
  const availableWeights = getAvailableWeights(fontFamily)
  return availableWeights.includes(weight)
}

// Get the closest available weight for a font
export const getClosestAvailableWeight = (fontFamily: string, desiredWeight: string): string => {
  const availableWeights = getAvailableWeights(fontFamily)
  
  // If the desired weight is available, return it
  if (availableWeights.includes(desiredWeight)) {
    return desiredWeight
  }
  
  // Convert to numbers for comparison
  const desired = parseInt(desiredWeight)
  const weights = availableWeights.map(w => parseInt(w))
  
  // Find the closest weight
  let closest = weights[0]
  let minDiff = Math.abs(desired - weights[0])
  
  for (const weight of weights) {
    const diff = Math.abs(desired - weight)
    if (diff < minDiff) {
      minDiff = diff
      closest = weight
    }
  }
  
  return closest.toString()
}
