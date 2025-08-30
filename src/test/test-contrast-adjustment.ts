/**
 * Test file for automatic text contrast adjustment feature
 * Run this to verify the implementation is working correctly
 */

import { getLuminance, getOptimalTextColor, getContrastRatio, isLightColor } from '@/utils/contrast.utils'
import { rectanglesOverlap, getOverlapArea } from '@/utils/overlap.utils'

// Test contrast utilities
export function testContrastUtils() {
  console.log('Testing Contrast Utilities...')
  
  // Test luminance calculation
  console.log('Luminance of #ffffff (white):', getLuminance('#ffffff')) // Should be ~1
  console.log('Luminance of #000000 (black):', getLuminance('#000000')) // Should be 0
  console.log('Luminance of #808080 (gray):', getLuminance('#808080'))  // Should be ~0.5
  
  // Test light/dark detection
  console.log('Is #ffffff light?', isLightColor('#ffffff')) // Should be true
  console.log('Is #000000 light?', isLightColor('#000000')) // Should be false
  console.log('Is #3b82f6 light?', isLightColor('#3b82f6')) // Should be false (blue)
  
  // Test optimal text color
  console.log('Optimal text for white bg:', getOptimalTextColor('#ffffff')) // Should be dark
  console.log('Optimal text for black bg:', getOptimalTextColor('#000000')) // Should be white
  console.log('Optimal text for blue bg:', getOptimalTextColor('#3b82f6'))  // Should be white
  
  // Test contrast ratio
  console.log('Contrast ratio white/black:', getContrastRatio('#ffffff', '#000000')) // Should be 21
  console.log('Contrast ratio white/gray:', getContrastRatio('#ffffff', '#808080'))
  
  console.log('✅ Contrast utilities test complete\n')
}

// Test overlap detection
export function testOverlapDetection() {
  console.log('Testing Overlap Detection...')
  
  const rect1 = { x: 10, y: 10, width: 100, height: 100 }
  const rect2 = { x: 50, y: 50, width: 100, height: 100 }
  const rect3 = { x: 200, y: 200, width: 100, height: 100 }
  
  // Test overlap detection
  console.log('Rect1 overlaps Rect2?', rectanglesOverlap(rect1, rect2)) // Should be true
  console.log('Rect1 overlaps Rect3?', rectanglesOverlap(rect1, rect3)) // Should be false
  
  // Test overlap area calculation
  console.log('Overlap area Rect1/Rect2:', getOverlapArea(rect1, rect2)) // Should be 3600
  console.log('Overlap area Rect1/Rect3:', getOverlapArea(rect1, rect3)) // Should be 0
  
  console.log('✅ Overlap detection test complete\n')
}

// Test store integration
export async function testStoreIntegration() {
  console.log('Testing Store Integration...')
  
  // This would need to be run in the actual app context
  // Just logging the test structure here
  console.log('Test cases for store:')
  console.log('1. Create slide with dark shape and text')
  console.log('2. Apply dark color scheme - verify text becomes white')
  console.log('3. Apply light color scheme - verify text becomes dark')
  console.log('4. Manually set text color - verify it stays when colors change')
  console.log('5. Test with blurb elements')
  console.log('6. Test with table cells')
  
  console.log('✅ Store integration test structure defined\n')
}

// Run all tests
export function runAllTests() {
  console.log('=== Running Automatic Text Contrast Tests ===\n')
  testContrastUtils()
  testOverlapDetection()
  testStoreIntegration()
  console.log('=== All tests complete ===')
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testContrast = {
    runAllTests,
    testContrastUtils,
    testOverlapDetection,
    testStoreIntegration,
    // Direct access to utilities for manual testing
    getLuminance,
    getOptimalTextColor,
    getContrastRatio,
    isLightColor
  }
  
  console.log('Text contrast test utilities loaded. Run `testContrast.runAllTests()` in console to test.')
}
