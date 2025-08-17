// Test file for PDF export rendering fixes
// Tests: Blurb tails, image corner radius, shape corner radius
import { exportSlidesToPDF } from '@/utils/pdf-export'
import type { Slide, SlideElement } from '@/types/slide.types'

// Create test slides with elements that demonstrate the fixes
export function createTestSlidesForRenderFixes(): Slide[] {
  const slides: Slide[] = []
  
  // Slide 1: Test blurb elements with different tail positions
  slides.push({
    id: 'slide-blurb-test',
    presentationId: 'test-presentation',
    order: 0,
    background: '#f5f5f5',
    elements: [
      {
        id: 'blurb-bottom-left',
        type: 'blurb',
        x: 50,
        y: 50,
        width: 200,
        height: 100,
        content: {
          text: 'Bottom-left tail',
          tailPosition: 'bottom-left'
        },
        style: {
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          fontSize: 14,
          borderRadius: 25
        }
      } as SlideElement,
      {
        id: 'blurb-bottom-center',
        type: 'blurb',
        x: 300,
        y: 50,
        width: 200,
        height: 100,
        content: {
          text: 'Bottom-center tail',
          tailPosition: 'bottom-center'
        },
        style: {
          backgroundColor: '#10b981',
          color: '#ffffff',
          fontSize: 14,
          borderRadius: 25
        }
      } as SlideElement,
      {
        id: 'blurb-bottom-right',
        type: 'blurb',
        x: 550,
        y: 50,
        width: 200,
        height: 100,
        content: {
          text: 'Bottom-right tail',
          tailPosition: 'bottom-right'
        },
        style: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          fontSize: 14,
          borderRadius: 25
        }
      } as SlideElement,
      {
        id: 'blurb-top-left',
        type: 'blurb',
        x: 50,
        y: 200,
        width: 200,
        height: 100,
        content: {
          text: 'Top-left tail',
          tailPosition: 'top-left'
        },
        style: {
          backgroundColor: '#f59e0b',
          color: '#ffffff',
          fontSize: 14,
          borderRadius: 25
        }
      } as SlideElement,
      {
        id: 'blurb-left-center',
        type: 'blurb',
        x: 300,
        y: 200,
        width: 200,
        height: 100,
        content: {
          text: 'Left-center tail',
          tailPosition: 'left-center'
        },
        style: {
          backgroundColor: '#8b5cf6',
          color: '#ffffff',
          fontSize: 14,
          borderRadius: 25
        }
      } as SlideElement,
      {
        id: 'blurb-right-center',
        type: 'blurb',
        x: 550,
        y: 200,
        width: 200,
        height: 100,
        content: {
          text: 'Right-center tail',
          tailPosition: 'right-center'
        },
        style: {
          backgroundColor: '#ec4899',
          color: '#ffffff',
          fontSize: 14,
          borderRadius: 25
        }
      } as SlideElement,
      {
        id: 'title',
        type: 'text',
        x: 250,
        y: 350,
        width: 350,
        height: 50,
        content: {
          text: 'Blurb Elements - All Tail Positions'
        },
        style: {
          fontSize: 20,
          textAlign: 'center',
          color: '#333333',
          fontWeight: 'bold'
        }
      } as SlideElement
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  // Slide 2: Test image corner radius (including perfect circles)
  slides.push({
    id: 'slide-image-radius',
    presentationId: 'test-presentation',
    order: 1,
    background: '#ffffff',
    elements: [
      {
        id: 'image-no-radius',
        type: 'image',
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        content: {
          src: 'https://via.placeholder.com/300x300/3b82f6/ffffff?text=No+Radius',
          objectFit: 'cover',
          offsetX: 0.5,
          offsetY: 0.5,
          scale: 1
        },
        style: {
          borderRadius: 0
        }
      } as SlideElement,
      {
        id: 'image-25-radius',
        type: 'image',
        x: 250,
        y: 50,
        width: 150,
        height: 150,
        content: {
          src: 'https://via.placeholder.com/300x300/10b981/ffffff?text=25%25+Radius',
          objectFit: 'cover',
          offsetX: 0.5,
          offsetY: 0.5,
          scale: 1
        },
        style: {
          borderRadius: 25
        }
      } as SlideElement,
      {
        id: 'image-50-radius',
        type: 'image',
        x: 450,
        y: 50,
        width: 150,
        height: 150,
        content: {
          src: 'https://via.placeholder.com/300x300/ef4444/ffffff?text=50%25+Radius',
          objectFit: 'cover',
          offsetX: 0.5,
          offsetY: 0.5,
          scale: 1
        },
        style: {
          borderRadius: 50
        }
      } as SlideElement,
      {
        id: 'image-100-radius',
        type: 'image',
        x: 650,
        y: 50,
        width: 150,
        height: 150,
        content: {
          src: 'https://via.placeholder.com/300x300/f59e0b/ffffff?text=Circle',
          objectFit: 'cover',
          offsetX: 0.5,
          offsetY: 0.5,
          scale: 1
        },
        style: {
          borderRadius: 100
        }
      } as SlideElement,
      {
        id: 'image-rectangle-100',
        type: 'image',
        x: 200,
        y: 250,
        width: 400,
        height: 150,
        content: {
          src: 'https://via.placeholder.com/600x300/8b5cf6/ffffff?text=100%25+Radius+Rectangle',
          objectFit: 'cover',
          offsetX: 0.5,
          offsetY: 0.5,
          scale: 1
        },
        style: {
          borderRadius: 100
        }
      } as SlideElement,
      {
        id: 'title-images',
        type: 'text',
        x: 250,
        y: 450,
        width: 350,
        height: 50,
        content: {
          text: 'Images with Corner Radius (0%, 25%, 50%, 100%)'
        },
        style: {
          fontSize: 18,
          textAlign: 'center',
          color: '#333333',
          fontWeight: 'bold'
        }
      } as SlideElement
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  // Slide 3: Test shape corner radius (especially 100% for perfect circles)
  slides.push({
    id: 'slide-shape-radius',
    presentationId: 'test-presentation',
    order: 2,
    background: '#f0f0f0',
    elements: [
      {
        id: 'shape-no-radius',
        type: 'shape',
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        content: {
          shape: 'rectangle'
        },
        style: {
          backgroundColor: '#3b82f6',
          borderRadius: 0
        }
      } as SlideElement,
      {
        id: 'shape-25-radius',
        type: 'shape',
        x: 250,
        y: 50,
        width: 150,
        height: 150,
        content: {
          shape: 'rectangle'
        },
        style: {
          backgroundColor: '#10b981',
          borderRadius: 25
        }
      } as SlideElement,
      {
        id: 'shape-50-radius',
        type: 'shape',
        x: 450,
        y: 50,
        width: 150,
        height: 150,
        content: {
          shape: 'rectangle'
        },
        style: {
          backgroundColor: '#ef4444',
          borderRadius: 50
        }
      } as SlideElement,
      {
        id: 'shape-100-radius-square',
        type: 'shape',
        x: 650,
        y: 50,
        width: 150,
        height: 150,
        content: {
          shape: 'rectangle'
        },
        style: {
          backgroundColor: '#f59e0b',
          borderRadius: 100
        }
      } as SlideElement,
      {
        id: 'shape-100-radius-wide',
        type: 'shape',
        x: 100,
        y: 250,
        width: 300,
        height: 150,
        content: {
          shape: 'rectangle'
        },
        style: {
          backgroundColor: '#8b5cf6',
          borderRadius: 100
        }
      } as SlideElement,
      {
        id: 'shape-100-radius-tall',
        type: 'shape',
        x: 450,
        y: 250,
        width: 150,
        height: 200,
        content: {
          shape: 'rectangle'
        },
        style: {
          backgroundColor: '#ec4899',
          borderRadius: 100
        }
      } as SlideElement,
      {
        id: 'shape-with-border',
        type: 'shape',
        x: 650,
        y: 250,
        width: 120,
        height: 120,
        content: {
          shape: 'rectangle'
        },
        style: {
          backgroundColor: '#ffffff',
          borderColor: '#3b82f6',
          borderWidth: 4,
          borderRadius: 100
        }
      } as SlideElement,
      {
        id: 'title-shapes',
        type: 'text',
        x: 250,
        y: 480,
        width: 350,
        height: 50,
        content: {
          text: 'Shapes with Corner Radius (100% = Perfect Circle/Ellipse)'
        },
        style: {
          fontSize: 18,
          textAlign: 'center',
          color: '#333333',
          fontWeight: 'bold'
        }
      } as SlideElement
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  // Slide 4: Combined test with all fixes
  slides.push({
    id: 'slide-combined',
    presentationId: 'test-presentation',
    order: 3,
    background: '#ffffff',
    elements: [
      {
        id: 'combined-blurb',
        type: 'blurb',
        x: 50,
        y: 50,
        width: 250,
        height: 120,
        content: {
          text: 'This blurb has a tail and rounded corners!',
          tailPosition: 'bottom-left'
        },
        style: {
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          fontSize: 16,
          borderRadius: 30,
          textAlign: 'center'
        }
      } as SlideElement,
      {
        id: 'combined-image',
        type: 'image',
        x: 350,
        y: 50,
        width: 120,
        height: 120,
        content: {
          src: 'https://via.placeholder.com/240x240/10b981/ffffff?text=Round',
          objectFit: 'cover',
          offsetX: 0.5,
          offsetY: 0.5,
          scale: 1.2
        },
        style: {
          borderRadius: 100
        }
      } as SlideElement,
      {
        id: 'combined-shape',
        type: 'shape',
        x: 520,
        y: 50,
        width: 120,
        height: 120,
        content: {
          shape: 'rectangle'
        },
        style: {
          gradientStart: '#ef4444',
          gradientEnd: '#f59e0b',
          gradientAngle: 45,
          borderRadius: 100
        },
        opacity: 0.8
      } as SlideElement,
      {
        id: 'combined-blurb-2',
        type: 'blurb',
        x: 150,
        y: 220,
        width: 200,
        height: 100,
        content: {
          text: 'Multi-line text\nin a blurb\nwith alignment',
          tailPosition: 'top-center'
        },
        style: {
          backgroundColor: '#8b5cf6',
          color: '#ffffff',
          fontSize: 14,
          borderRadius: 40,
          textAlign: 'right'
        }
      } as SlideElement,
      {
        id: 'combined-shape-ellipse',
        type: 'shape',
        x: 400,
        y: 220,
        width: 250,
        height: 100,
        content: {
          shape: 'rectangle'
        },
        style: {
          backgroundColor: '#ec4899',
          borderColor: '#831843',
          borderWidth: 3,
          borderRadius: 100,
          fillOpacity: 0.5,
          borderOpacity: 1
        }
      } as SlideElement,
      {
        id: 'title-combined',
        type: 'text',
        x: 200,
        y: 380,
        width: 400,
        height: 50,
        content: {
          text: 'Combined Test: All Fixes Working Together'
        },
        style: {
          fontSize: 20,
          textAlign: 'center',
          color: '#333333',
          fontWeight: 'bold'
        }
      } as SlideElement
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  return slides
}

// Test function to export slides with render fixes
export async function testPDFRenderFixes() {
  const slides = createTestSlidesForRenderFixes()
  
  console.log('Testing PDF export with render fixes...')
  console.log('- Blurb tails in all positions')
  console.log('- Image corner radius (including 100% for circles)')
  console.log('- Shape corner radius (100% creates perfect circles/ellipses)')
  
  await exportSlidesToPDF({
    slides,
    fileName: 'test-render-fixes.pdf',
    quality: 0.95,
    onProgress: (progress) => {
      console.log(`Export progress: ${progress.toFixed(1)}%`)
    }
  })
  
  console.log('PDF render fixes test completed!')
  console.log('Please check test-render-fixes.pdf for:')
  console.log('1. Blurb elements should show triangular tails in correct positions')
  console.log('2. Images should have rounded corners (100% = perfect circle)')
  console.log('3. Shapes with 100% radius should be perfect circles/ellipses')
}

// Instructions for testing:
// 1. Import and call testPDFRenderFixes() from your component
// 2. Check the exported PDF (test-render-fixes.pdf) for:
//    - Blurb tails rendering correctly in all positions
//    - Images with corner radius:
//      * 100% radius on square image = PERFECT CIRCLE (not rounded square)
//      * 100% radius on rectangular image = PERFECT ELLIPSE
//      * Lower radius values = rounded corners
//    - Shapes with 100% border radius:
//      * Square shape = PERFECT CIRCLE
//      * Rectangular shape = PERFECT ELLIPSE
//    - Text alignment within blurbs
//    - Combined elements working together
//
// IMPORTANT: Images with 100% radius should be geometrically perfect circles/ellipses,
// not just heavily rounded rectangles. This is the key fix!
