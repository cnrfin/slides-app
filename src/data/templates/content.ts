// src/data/templates/content.ts
import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const contentTemplates: SlideTemplate[] = [
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
