// Quick test to verify text rendering
import Konva from 'konva';

// Create stage
const stage = new Konva.Stage({
  container: 'container',
  width: 800,
  height: 600
});

const layer = new Konva.Layer();
stage.add(layer);

// Test 1: Text with padding (check for background)
const text1 = new Konva.Text({
  x: 50,
  y: 50,
  text: 'This is a test with padding',
  fontSize: 24,
  fontFamily: 'Arial',
  fill: '#000000',
  padding: 10,
  wrap: 'none'
});

// Test 2: Text with background explicitly set
const text2 = new Konva.Text({
  x: 50,
  y: 150,
  text: 'This has explicit background',
  fontSize: 24,
  fontFamily: 'Arial',
  fill: '#000000',
  padding: 10,
  wrap: 'none',
  // Try to set background
  // Note: Konva.Text doesn't have a background property
});

// Add selection rectangle
const selectionRect = new Konva.Rect({
  x: text1.x(),
  y: text1.y(),
  width: text1.width(),
  height: text1.height(),
  stroke: '#3b82f6',
  strokeWidth: 2,
  fill: 'transparent' // This should be transparent
});

layer.add(text1);
layer.add(text2);
layer.add(selectionRect);
layer.draw();

console.log('Text1 width:', text1.width());
console.log('Text1 height:', text1.height());
console.log('Text natural width (no constraints)');
