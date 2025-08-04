// src/data/templates/content.ts
import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent, LineContent } from '@/types/slide.types'

export const contentTemplates: SlideTemplate[] = [
  {
    id: 'objectives',
    name: 'Objectives',
    category: 'content',
    description: 'Objectives Page with 4 Goals',
    background: '#ffffff',
    elements: [
      {
        type: 'shape',
        x: 411,
        y: 0,
        width: 389,
        height: 600,
        opacity: 1,
        locked: true,
        content: {
          shape: 'rectangle'
        } as ShapeContent,
        style: {
          backgroundColor: '#f6f6f6',
          borderRadius: 0
        }
      },
      {
        type: 'text',
        x: 25,
        y: 264,
        width: 342.4791117672448,
        height: 40,
        content: {
          text: 'Lesson Objectives'
        } as TextContent,
        style: {
          fontSize: 40,
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'left',
          lineHeight: 1,
          fontWeight: '500'
        }
      },
      {
        type: 'line',
        x: 25,
        y: 315,
        width: 342.4791117672448,
        height: 1,
        content: {
          points: [0, 0, 342.4791117672448, 0],
          lineCap: 'round'
        } as LineContent,
        style: {
          borderColor: '#000000',
          borderWidth: 1.5
        }
      },
      {
        type: 'text',
        x: 25,
        y: 336,
        width: 342.4791117672448,
        height: 19.92,
        content: {
          text: "What we're learning today"
        } as TextContent,
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'left',
          lineHeight: 1,
          letterSpacing: 0.5
        }
      },
      {
        type: 'text',
        x: 464,
        y: 153,
        width: 311,
        height: 24,
        content: {
          text: '{{objective[0]}}',
          placeholder: 'Dynamic content'
        } as TextContent,
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'left',
          listStyle: 'bullet',
          lineHeight: 1
        }
      },
      {
        type: 'text',
        x: 464,
        y: 237,
        width: 311,
        height: 24,
        content: {
          text: '{{objective[1]}}',
          placeholder: 'Dynamic content'
        } as TextContent,
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'left',
          listStyle: 'bullet',
          lineHeight: 1
        }
      },
      {
        type: 'text',
        x: 464,
        y: 321,
        width: 311,
        height: 24,
        content: {
          text: '{{objective[2]}}',
          placeholder: 'Dynamic content'
        } as TextContent,
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'left',
          listStyle: 'bullet',
          lineHeight: 1
        }
      },
      {
        type: 'text',
        x: 464,
        y: 405,
        width: 311,
        height: 24,
        content: {
          text: '{{objective[3]}}',
          placeholder: 'Dynamic content'
        } as TextContent,
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'left',
          listStyle: 'bullet',
          lineHeight: 1
        }
      },
      {
        type: 'text',
        x: 400,
        y: 559,
        width: 375,
        height: 16,
        visible: true,
        content: {
          text: '{{school}}',
          placeholder: 'Dynamic content'
        } as TextContent,
        style: {
          fontSize: 16,
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'right',
          fontWeight: '400',
          lineHeight: 1,
          letterSpacing: 1
        }
      }
    ],
    tags: ['objectives', 'dynamic']
  },
  {
    id: 'content-two-column',
    name: 'Two Column',
    category: 'content',
    description: 'Text and image side by side',
    background: '#ffffff',
    elements: [
      {
        type: 'text',
        x: 40,
        y: 40,
        width: 720,
        height: 50,
        content: {
          text: 'Section Title',
          placeholder: 'Click to edit title'
        } as TextContent,
        style: {
          fontSize: 36,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: '#1f2937',
          textAlign: 'left'
        }
      },
      {
        type: 'text',
        x: 40,
        y: 120,
        width: 340,
        height: 400,
        content: {
          text: 'Add your content here. This is a great layout for combining text with visual elements.\n\nYou can use this for:\n• Key concepts\n• Explanations\n• Examples\n• Instructions',
          placeholder: 'Click to edit content'
        } as TextContent,
        style: {
          fontSize: 18,
          fontFamily: 'Arial',
          color: '#374151',
          textAlign: 'left',
          lineHeight: 1.6
        }
      },
      {
        type: 'shape',
        x: 420,
        y: 120,
        width: 340,
        height: 400,
        content: {
          shape: 'rectangle'
        } as ShapeContent,
        style: {
          backgroundColor: '#e5e7eb',
          borderRadius: 8
        }
      },
      {
        type: 'text',
        x: 420,
        y: 280,
        width: 340,
        height: 80,
        content: {
          text: 'Image Placeholder',
          placeholder: 'Add image'
        } as TextContent,
        style: {
          fontSize: 18,
          fontFamily: 'Arial',
          color: '#9ca3af',
          textAlign: 'center'
        }
      }
    ],
    tags: ['content', 'two-column', 'text', 'image']
  },
  {
    id: 'content-text-focus',
    name: 'Text Focus',
    category: 'content',
    description: 'Large text area with title',
    background: '#ffffff',
    elements: [
      {
        type: 'text',
        x: 60,
        y: 60,
        width: 680,
        height: 60,
        content: {
          text: 'Main Topic',
          placeholder: 'Click to edit title'
        } as TextContent,
        style: {
          fontSize: 42,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: '#1f2937',
          textAlign: 'left'
        }
      },
      {
        type: 'shape',
        x: 60,
        y: 140,
        width: 100,
        height: 4,
        content: {
          shape: 'rectangle'
        } as ShapeContent,
        style: {
          backgroundColor: '#3b82f6'
        }
      },
      {
        type: 'text',
        x: 60,
        y: 180,
        width: 680,
        height: 340,
        content: {
          text: 'Your main content goes here. This template is perfect for text-heavy slides where you need to explain concepts in detail.\n\nUse clear paragraphs and structure your content logically to maintain readability.',
          placeholder: 'Click to edit content'
        } as TextContent,
        style: {
          fontSize: 20,
          fontFamily: 'Arial',
          color: '#374151',
          textAlign: 'left',
          lineHeight: 1.8
        }
      }
    ],
    tags: ['content', 'text', 'paragraph', 'explanation']
  },
  {
    id: 'content-quote',
    name: 'Quote',
    category: 'content',
    description: 'Highlight an important quote',
    background: '#f3f4f6',
    elements: [
      {
        type: 'text',
        x: 100,
        y: 200,
        width: 600,
        height: 120,
        content: {
          text: '"Add your inspiring quote here that captures the essence of your message"',
          placeholder: 'Click to edit quote'
        } as TextContent,
        style: {
          fontSize: 32,
          fontFamily: 'Georgia',
          fontStyle: 'italic',
          color: '#1f2937',
          textAlign: 'center',
          lineHeight: 1.4
        }
      },
      {
        type: 'text',
        x: 200,
        y: 360,
        width: 400,
        height: 40,
        content: {
          text: '— Author Name',
          placeholder: 'Click to edit author'
        } as TextContent,
        style: {
          fontSize: 20,
          fontFamily: 'Arial',
          color: '#6b7280',
          textAlign: 'center'
        }
      }
    ],
    tags: ['content', 'quote', 'testimonial', 'inspiration']
  }
]
