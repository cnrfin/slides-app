// src/data/templates/titles.ts
import type { SlideTemplate } from '@/types/template.types'
import type { TextContent } from '@/types/slide.types'

export const titleTemplates: SlideTemplate[] = [
  {
    id: 'title-center',
    name: 'Title Slide (Center)',
    category: 'title',
    description: 'Centered title and subtitle',
    background: '#ffffff',
    elements: [
      {
        type: 'text',
        x: 200,
        y: 200,
        width: 400,
        height: 80,
        content: {
          text: 'Your Title Here',
          placeholder: 'Click to edit title'
        } as TextContent,
        style: {
          fontSize: 48,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: '#1f2937',
          textAlign: 'center'
        }
      },
      {
        type: 'text',
        x: 200,
        y: 300,
        width: 400,
        height: 50,
        content: {
          text: 'Your subtitle or author name',
          placeholder: 'Click to edit subtitle'
        } as TextContent,
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#6b7280',
          textAlign: 'center'
        }
      }
    ],
    tags: ['title', 'presentation', 'intro']
  },
  {
    id: 'title-left',
    name: 'Title Slide (Left)',
    category: 'title',
    description: 'Left-aligned title with accent',
    background: '#ffffff',
    elements: [
      {
        type: 'shape',
        x: 0,
        y: 0,
        width: 5,
        height: 600,
        content: {
          shape: 'rectangle'
        },
        style: {
          backgroundColor: '#3b82f6'
        }
      },
      {
        type: 'text',
        x: 60,
        y: 200,
        width: 500,
        height: 80,
        content: {
          text: 'Your Title Here',
          placeholder: 'Click to edit title'
        } as TextContent,
        style: {
          fontSize: 48,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: '#1f2937',
          textAlign: 'left'
        }
      },
      {
        type: 'text',
        x: 60,
        y: 300,
        width: 500,
        height: 50,
        content: {
          text: 'Your subtitle or description',
          placeholder: 'Click to edit subtitle'
        } as TextContent,
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#6b7280',
          textAlign: 'left'
        }
      },
      {
        type: 'text',
        x: 60,
        y: 480,
        width: 300,
        height: 30,
        content: {
          text: 'Author Name | Date',
          placeholder: 'Click to edit author'
        } as TextContent,
        style: {
          fontSize: 16,
          fontFamily: 'Arial',
          color: '#9ca3af',
          textAlign: 'left'
        }
      }
    ],
    tags: ['title', 'presentation', 'intro', 'modern']
  },
  {
    id: 'title-bold',
    name: 'Bold Title',
    category: 'title',
    description: 'Bold title with colored background',
    background: '#2563eb',
    elements: [
      {
        type: 'text',
        x: 100,
        y: 220,
        width: 600,
        height: 100,
        content: {
          text: 'BOLD TITLE',
          placeholder: 'Click to edit title'
        } as TextContent,
        style: {
          fontSize: 72,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: '#ffffff',
          textAlign: 'center',
          letterSpacing: 2
        }
      },
      {
        type: 'text',
        x: 200,
        y: 340,
        width: 400,
        height: 40,
        content: {
          text: 'Impactful subtitle here',
          placeholder: 'Click to edit subtitle'
        } as TextContent,
        style: {
          fontSize: 20,
          fontFamily: 'Arial',
          color: '#e0e7ff',
          textAlign: 'center'
        }
      }
    ],
    tags: ['title', 'bold', 'impact', 'colorful']
  }
]
