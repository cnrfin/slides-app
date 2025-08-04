// src/data/templates/titles.ts
import type { SlideTemplate } from '@/types/template.types'
import type { TextContent } from '@/types/slide.types'

export const titleTemplates: SlideTemplate[] = [
  {
    id: 'title-simple',
    name: 'Title',
    category: 'title',
    description: 'Title Page with Centered Text',
    background: '#ffffff',
    elements: [
      {
        type: 'text',
        x: 25,
        y: 280,
        width: 750,
        height: 40,
        visible: true,
        content: {
          text: '{{title}}',
          placeholder: 'Course Title'
        } as TextContent,
        style: {
          fontSize: 40,
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'center',
          fontWeight: '700',
          lineHeight: 1
        }
      },
      {
        type: 'text',
        x: 25,
        y: 344,
        width: 750,
        height: 28,
        visible: true,
        content: {
          text: '{{subtitle}}',
          placeholder: 'Lesson subtitle'
        } as TextContent,
        style: {
          fontSize: 28,
          fontFamily: 'Arial',
          color: '#000000',
          textAlign: 'center',
          fontWeight: '700',
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
    tags: ['title', 'dynamic']
  }
]
