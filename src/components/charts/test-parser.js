// Test file for chart prompt parsing
// Run this in your browser console to test

import { parseChartPrompt, validateChartData } from './ChartPromptParser'

// Test cases
const testPrompts = [
  "soda: 64, beer: 20, water: 12, coffee: 4",
  "January: 12000, February: 15500, March: 14200",
  "Q1: 45K, Q2: 52K, Q3: 48K, Q4: 61K",
  "Sales: 450, Marketing: 320, Development: 680",
  "Mon: 23, Tue: 31, Wed: 28, Thu: 35, Fri: 42",
  "apple: 100, banana: 75, orange: 50, grape: 25",
  "Product A: $1200, Product B: $800, Product C: $1500",
  "2021 - 150, 2022 - 180, 2023 - 210",
  "red: 30, blue: 45, green: 25"
]

console.log('Testing Chart Prompt Parser\n' + '='.repeat(50))

testPrompts.forEach((prompt, index) => {
  console.log(`\nTest ${index + 1}: "${prompt}"`)
  const result = parseChartPrompt(prompt)
  
  if (result) {
    const isValid = validateChartData(result)
    console.log('✅ Parsed successfully')
    console.log('  Labels:', result.labels)
    console.log('  Data:', result.datasets[0].data)
    console.log('  Valid:', isValid ? '✓' : '✗')
  } else {
    console.log('❌ Failed to parse')
  }
})

// Specific test for the user's input
console.log('\n' + '='.repeat(50))
console.log('USER\'S SPECIFIC TEST:')
const userPrompt = "soda: 64, beer: 20, water: 12, coffee: 4"
console.log(`Input: "${userPrompt}"`)

const userResult = parseChartPrompt(userPrompt)
if (userResult) {
  console.log('✅ SUCCESS! Parsed data:')
  console.log(JSON.stringify(userResult, null, 2))
  console.log('Validation:', validateChartData(userResult) ? 'PASSED ✓' : 'FAILED ✗')
} else {
  console.log('❌ FAILED to parse')
}
