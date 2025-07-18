// Simple test file to verify text measurement without wrapping
const Konva = require('konva');

// Test text
const testText = "This is a very long sentence that should not wrap but instead expand horizontally";

// Create text node with wrap='none'
const text = new Konva.Text({
  text: testText,
  fontSize: 24,
  fontFamily: 'Arial',
  padding: 10,
  wrap: 'none',  // This is the key setting
  lineHeight: 1.2
});

console.log('Text dimensions with wrap="none":');
console.log('Width:', text.width());
console.log('Height:', text.height());

// Compare with wrap='word'
const textWrapped = new Konva.Text({
  text: testText,
  fontSize: 24,
  fontFamily: 'Arial',
  padding: 10,
  wrap: 'word',
  width: 200,  // Fixed width for wrapping
  lineHeight: 1.2
});

console.log('\nText dimensions with wrap="word" and width=200:');
console.log('Width:', textWrapped.width());
console.log('Height:', textWrapped.height());

// Clean up
text.destroy();
textWrapped.destroy();