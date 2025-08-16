// Test alphabetical ordering of fonts
import { FONTS } from '@/utils/fonts.config'

console.log('Font Order Test')
console.log('===============')

// Check if fonts are alphabetically ordered
const fontNames = FONTS.map(f => f.name)
const sortedFontNames = [...fontNames].sort()

const isAlphabetical = fontNames.every((name, index) => name === sortedFontNames[index])

console.log('Current font order:')
fontNames.forEach((name, index) => {
  console.log(`${index + 1}. ${name}`)
})

console.log(`\nFonts are alphabetically ordered: ${isAlphabetical ? '✅' : '❌'}`)

if (!isAlphabetical) {
  console.log('\nExpected order:')
  sortedFontNames.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`)
  })
}

// Show weight availability for each font
console.log('\n\nWeight Availability:')
console.log('====================')

FONTS.forEach(font => {
  console.log(`\n${font.name}:`)
  console.log(`  Weights: ${font.weights.join(', ')}`)
  console.log(`  Total: ${font.weights.length} weights`)
})

export default {
  isAlphabetical,
  totalFonts: FONTS.length
}
