// Test file for PDF export functionality
import { exportSlidesToPDF } from '@/utils/pdf-export'
import type { Slide, SlideElement } from '@/types/slide.types'

// Create test slides with various elements to test all fixes
export function createTestSlides(): Slide[] {
  const slides: Slide[] = []
  
  // Slide 1: Test text alignment
  slides.push({
    id: 'slide-1',
    presentationId: 'test-presentation',
    order: 0,
    background: '#f0f0f0',
    elements: [
      {
        id: 'text-left',
        type: 'text',
        x: 50,
        y: 50,
        width: 300,
        height: 100,
        content: {
          text: 'This is left-aligned text that should wrap properly when it gets too long for the container width.'
        },
        style: {
          fontSize: 16,
          textAlign: 'left',
          color: '#000000'
        }
      } as SlideElement,
      {
        id: 'text-center',
        type: 'text',
        x: 50,
        y: 180,
        width: 300,
        height: 100,
        content: {
          text: 'This is center-aligned text that should wrap properly when it gets too long for the container width.'
        },
        style: {
          fontSize: 16,
          textAlign: 'center',
          color: '#0000ff'
        }
      } as SlideElement,
      {
        id: 'text-right',
        type: 'text',
        x: 50,
        y: 310,
        width: 300,
        height: 100,
        content: {
          text: 'This is right-aligned text that should wrap properly when it gets too long for the container width.'
        },
        style: {
          fontSize: 16,
          textAlign: 'right',
          color: '#ff0000'
        }
      } as SlideElement,
      {
        id: 'text-justify',
        type: 'text',
        x: 400,
        y: 50,
        width: 300,
        height: 200,
        content: {
          text: 'This is justified text that should spread evenly across the width of the container. Each line except the last one should have equal spacing between words to fill the entire width.'
        },
        style: {
          fontSize: 16,
          textAlign: 'justify',
          color: '#008000'
        }
      } as SlideElement
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  // Slide 2: Test image clipping with cover mode
  slides.push({
    id: 'slide-2',
    presentationId: 'test-presentation',
    order: 1,
    background: '#ffffff',
    elements: [
      {
        id: 'image-cover-1',
        type: 'image',
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        content: {
          src: 'https://via.placeholder.com/400x600', // Tall image
          objectFit: 'cover',
          offsetX: 0.5,
          offsetY: 0.5,
          scale: 1
        },
        style: {}
      } as SlideElement,
      {
        id: 'image-cover-2',
        type: 'image',
        x: 300,
        y: 50,
        width: 200,
        height: 200,
        content: {
          src: 'https://via.placeholder.com/600x400', // Wide image
          objectFit: 'cover',
          offsetX: 0.2, // Shifted left
          offsetY: 0.8, // Shifted down
          scale: 1.5 // Zoomed in
        },
        style: {}
      } as SlideElement,
      {
        id: 'text-label',
        type: 'text',
        x: 50,
        y: 280,
        width: 450,
        height: 50,
        content: {
          text: 'Images above should be clipped (cover mode) with proper offset and scale'
        },
        style: {
          fontSize: 14,
          textAlign: 'center',
          color: '#666666'
        }
      } as SlideElement
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  // Slide 3: Test gradients and opacity
  slides.push({
    id: 'slide-3',
    presentationId: 'test-presentation',
    order: 2,
    background: '#e0e0e0',
    elements: [
      {
        id: 'shape-gradient',
        type: 'shape',
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        content: {
          shape: 'rectangle'
        },
        style: {
          gradientStart: '#ff0000',
          gradientEnd: '#0000ff',
          gradientAngle: 45,
          borderRadius: 20
        },
        opacity: 0.7
      } as SlideElement,
      {
        id: 'text-gradient',
        type: 'text',
        x: 300,
        y: 50,
        width: 300,
        height: 100,
        content: {
          text: 'Gradient Text with 50% Opacity'
        },
        style: {
          fontSize: 24,
          gradientStart: '#00ff00',
          gradientEnd: '#ff00ff',
          gradientAngle: 90
        },
        opacity: 0.5
      } as SlideElement,
      {
        id: 'icon-opacity',
        type: 'icon',
        x: 350,
        y: 200,
        width: 100,
        height: 100,
        content: {
          iconId: 'star',
          iconType: 'lucide'
        },
        style: {
          color: '#ffa500'
        },
        opacity: 0.3
      } as SlideElement
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  return slides
}

// Test function to export with correct slide order
export async function testPDFExport() {
  const slides = createTestSlides()
  
  // Test 1: Export with explicit slide order
  console.log('Testing PDF export with explicit slide order...')
  await exportSlidesToPDF({
    slides,
    slideOrder: ['slide-1', 'slide-2', 'slide-3'], // Explicit order
    fileName: 'test-slides-ordered.pdf',
    onProgress: (progress) => {
      console.log(`Export progress: ${progress}%`)
    }
  })
  
  // Test 2: Export with slides in reverse order to test ordering
  console.log('Testing PDF export with reversed slide order...')
  await exportSlidesToPDF({
    slides,
    slideOrder: ['slide-3', 'slide-2', 'slide-1'], // Reversed order
    fileName: 'test-slides-reversed.pdf',
    onProgress: (progress) => {
      console.log(`Export progress: ${progress}%`)
    }
  })
  
  // Test 3: Export without explicit order (should use order property)
  console.log('Testing PDF export with default order...')
  await exportSlidesToPDF({
    slides,
    fileName: 'test-slides-default.pdf',
    onProgress: (progress) => {
      console.log(`Export progress: ${progress}%`)
    }
  })
  
  console.log('PDF export tests completed!')
}

// Instructions for testing:
// 1. Import and call testPDFExport() from your component
// 2. Check the exported PDFs for:
//    - Correct slide order (should match the slideOrder array)
//    - Text alignment (left, center, right, justify)
//    - Image clipping with cover mode
//    - Gradients and opacity rendering
