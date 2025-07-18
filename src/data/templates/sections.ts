// src/data/templates/sections.ts
import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const sectionTemplates: SlideTemplate[] = [
  {
    id: 'section-divider',
    name: 'Section Divider',
    category: 'section',
    description: 'Chapter or section break',
    background: '#2563eb',
    elements: [
      {
        type: 'text',
        x: 100,
        y: 250,
        width: 600,
        height: 80,
        content: {
          text: 'Section Title',
          placeholder: 'Click to edit section'
        } as TextContent,
        style: {
          fontSize: 56,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: '#ffffff',
          textAlign: 'center'
        }
      },
      {
        type: 'shape',
        x: 300,
        y: 350,
        width: 200,
        height: 4,
        content: {
          shape: 'rectangle'
        } as ShapeContent,
        style: {
          backgroundColor: '#60a5fa'
        }
      }
    ],
    tags: ['section', 'divider', 'chapter', 'break']
  },
  {
    id: 'list-bullets',
    name: 'Bullet List',
    category: 'list',
    description: 'Key points with bullets',
    background: '#ffffff',
    elements: [
      {
        type: 'text',
        x: 60,
        y: 60,
        width: 680,
        height: 50,
        content: {
          text: 'Key Points',
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
        x: 60,
        y: 150,
        width: 680,
        height: 350,
        content: {
          text: '• First important point to remember\n\n• Second key concept to understand\n\n• Third essential element to consider\n\n• Fourth crucial aspect to explore',
          placeholder: 'Click to edit list'
        } as TextContent,
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#374151',
          textAlign: 'left',
          lineHeight: 1.8
        }
      }
    ],
    tags: ['list', 'bullets', 'points', 'content']
  },
  {
    id: 'list-numbered',
    name: 'Numbered List',
    category: 'list',
    description: 'Steps or ordered items',
    background: '#ffffff',
    elements: [
      {
        type: 'text',
        x: 60,
        y: 60,
        width: 680,
        height: 50,
        content: {
          text: 'Steps to Success',
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
        x: 60,
        y: 150,
        width: 680,
        height: 350,
        content: {
          text: '1. Start with the basics and build a foundation\n\n2. Practice regularly to improve your skills\n\n3. Apply what you learn in real situations\n\n4. Review and reflect on your progress',
          placeholder: 'Click to edit list'
        } as TextContent,
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#374151',
          textAlign: 'left',
          lineHeight: 1.8
        }
      }
    ],
    tags: ['list', 'numbered', 'steps', 'ordered']
  }
]
