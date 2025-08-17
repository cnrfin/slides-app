// Test file for PDF blend mode functionality
import { exportSlidesToPDF } from '@/utils/pdf-export'
import type { Slide, SlideElement } from '@/types/slide.types'

// Create test slides with various blend modes
export function createBlendModeTestSlides(): Slide[] {
  const slides: Slide[] = []
  
  // Slide 1: Test various blend modes
  slides.push({
    id: 'blend-test-1',
    presentationId: 'test-presentation',
    order: 0,
    background: '#2563eb', // Blue background
    elements: [
      // Base white rectangle (normal blend)
      {
        id: 'base-rect',
        type: 'shape',
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        content: {
          shape: 'rectangle'
        },
        style: {
          backgroundColor: '#ffffff',
          blendMode: 'normal'
        }
      } as SlideElement,
      
      // Overlay blend mode - red circle
      {
        id: 'overlay-circle',
        type: 'shape',
        x: 150,
        y: 150,
        width: 200,
        height: 200,
        content: {
          shape: 'circle'
        },
        style: {
          backgroundColor: '#ef4444',
          blendMode: 'overlay'
        },
        opacity: 0.8
      } as SlideElement,
      
      // Multiply blend mode - green rectangle
      {
        id: 'multiply-rect',
        type: 'shape',
        x: 300,
        y: 100,
        width: 150,
        height: 150,
        content: {
          shape: 'rectangle'
        },
        style: {
          backgroundColor: '#10b981',
          blendMode: 'multiply'
        }
      } as SlideElement,
      
      // Screen blend mode - yellow circle
      {
        id: 'screen-circle',
        type: 'shape',
        x: 400,
        y: 200,
        width: 150,
        height: 150,
        content: {
          shape: 'circle'
        },
        style: {
          backgroundColor: '#fbbf24',
          blendMode: 'screen'
        }
      } as SlideElement,
      
      // Text with difference blend mode
      {
        id: 'diff-text',
        type: 'text',
        x: 100,
        y: 400,
        width: 400,
        height: 100,
        content: {
          text: 'Difference Blend Mode Text'
        },
        style: {
          fontSize: 36,
          fontWeight: 'bold',
          color: '#ffffff',
          blendMode: 'difference'
        }
      } as SlideElement,
      
      // Labels
      {
        id: 'label-overlay',
        type: 'text',
        x: 150,
        y: 360,
        width: 100,
        height: 30,
        content: {
          text: 'Overlay'
        },
        style: {
          fontSize: 14,
          color: '#ffffff',
          textAlign: 'center'
        }
      } as SlideElement,
      
      {
        id: 'label-multiply',
        type: 'text',
        x: 325,
        y: 260,
        width: 100,
        height: 30,
        content: {
          text: 'Multiply'
        },
        style: {
          fontSize: 14,
          color: '#ffffff',
          textAlign: 'center'
        }
      } as SlideElement,
      
      {
        id: 'label-screen',
        type: 'text',
        x: 425,
        y: 360,
        width: 100,
        height: 30,
        content: {
          text: 'Screen'
        },
        style: {
          fontSize: 14,
          color: '#ffffff',
          textAlign: 'center'
        }
      } as SlideElement
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  // Slide 2: Test more blend modes with overlapping shapes
  slides.push({
    id: 'blend-test-2',
    presentationId: 'test-presentation',
    order: 1,
    background: '#1f2937', // Dark gray background
    elements: [
      // Base gradient rectangle
      {
        id: 'gradient-base',
        type: 'shape',
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        content: {
          shape: 'rectangle'
        },
        style: {
          gradientStart: '#8b5cf6',
          gradientEnd: '#ec4899',
          gradientAngle: 45,
          borderRadius: 20
        }
      } as SlideElement,
      
      // Color-dodge blend
      {
        id: 'color-dodge-circle',
        type: 'shape',
        x: 150,
        y: 150,
        width: 150,
        height: 150,
        content: {
          shape: 'circle'
        },
        style: {
          backgroundColor: '#fbbf24',
          blendMode: 'color-dodge'
        },
        opacity: 0.7
      } as SlideElement,
      
      // Hard-light blend
      {
        id: 'hard-light-rect',
        type: 'shape',
        x: 250,
        y: 200,
        width: 150,
        height: 150,
        content: {
          shape: 'rectangle'
        },
        style: {
          backgroundColor: '#10b981',
          blendMode: 'hard-light'
        },
        opacity: 0.8
      } as SlideElement,
      
      // Exclusion blend
      {
        id: 'exclusion-circle',
        type: 'shape',
        x: 350,
        y: 150,
        width: 150,
        height: 150,
        content: {
          shape: 'circle'
        },
        style: {
          backgroundColor: '#ffffff',
          blendMode: 'exclusion'
        },
        opacity: 0.6
      } as SlideElement,
      
      // Title with soft-light blend
      {
        id: 'title-text',
        type: 'text',
        x: 100,
        y: 50,
        width: 400,
        height: 50,
        content: {
          text: 'Blend Mode Gallery'
        },
        style: {
          fontSize: 32,
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          blendMode: 'soft-light'
        }
      } as SlideElement
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  return slides
}

// Test function to export with blend modes
export async function testBlendModePDFExport() {
  const slides = createBlendModeTestSlides()
  
  console.log('Testing PDF export with blend modes...')
  await exportSlidesToPDF({
    slides,
    fileName: 'test-blend-modes.pdf',
    onProgress: (progress) => {
      console.log(`Export progress: ${progress}%`)
    }
  })
  
  console.log('Blend mode PDF export test completed!')
  console.log('Check test-blend-modes.pdf to verify blend modes are rendered correctly')
}

// Instructions for testing:
// 1. Import and call testBlendModePDFExport() from your component
// 2. Check the exported PDF for:
//    - Overlay blend mode (red circle over white rectangle)
//    - Multiply blend mode (green rectangle)
//    - Screen blend mode (yellow circle)
//    - Difference blend mode (white text)
//    - Color-dodge, hard-light, exclusion, soft-light modes on second slide
// 3. Compare with canvas rendering to ensure consistency
