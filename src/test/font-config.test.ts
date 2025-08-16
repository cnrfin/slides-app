// Test file to verify font configuration
import { FONTS } from '@/utils/fonts.config'

// Test that FONTS array is properly exported
console.log('Font Configuration Test')
console.log('======================')
console.log(`Total fonts: ${FONTS.length}`)
console.log('\nFonts by type:')

// Group fonts by type
const fontsByType = FONTS.reduce((acc, font) => {
  if (!acc[font.type]) {
    acc[font.type] = []
  }
  acc[font.type].push(font)
  return acc
}, {} as Record<string, typeof FONTS>)

Object.entries(fontsByType).forEach(([type, fonts]) => {
  console.log(`\n${type}: (${fonts.length} fonts)`)
  fonts.forEach(font => {
    console.log(`  - ${font.name}: ${font.family}`)
  })
})

// Test that fonts have the expected structure
const firstFont = FONTS[0]
console.log('\nFirst font structure:')
console.log(`  name: ${firstFont.name}`)
console.log(`  family: ${firstFont.family}`)
console.log(`  type: ${firstFont.type}`)

// Verify all fonts have required properties
const validFonts = FONTS.every(font => 
  font.name && 
  font.family && 
  font.type
)

console.log(`\nAll fonts valid: ${validFonts}`)

export default {
  message: 'Font configuration test successful',
  totalFonts: FONTS.length,
  fontsByType
}
