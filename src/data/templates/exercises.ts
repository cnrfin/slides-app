// src/data/templates/exercises.ts
import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent, TableContent } from '@/types/slide.types'

export const exerciseTemplates: SlideTemplate[] = [
  {
    id: 'exercise-vocabulary-grid',
    name: 'Vocabulary Grid',
    category: 'exercise',
    description: '3x4 grid for vocabulary items',
    background: '#ffffff',
    elements: [
      {
        type: 'text',
        x: 40,
        y: 30,
        width: 720,
        height: 50,
        content: {
          text: 'Vocabulary Practice',
          placeholder: 'Click to edit title'
        } as TextContent,
        style: {
          fontSize: 32,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: '#1f2937',
          textAlign: 'center'
        }
      },
      // Create a 3x4 grid of vocabulary cards
      ...Array.from({ length: 12 }).flatMap((_, index) => {
        const row = Math.floor(index / 4)
        const col = index % 4
        const x = 60 + col * 180
        const y = 100 + row * 160
        
        return [
          {
            type: 'shape' as const,
            x,
            y,
            width: 160,
            height: 140,
            content: {
              shape: 'rectangle' as const
            } as ShapeContent,
            style: {
              backgroundColor: '#f9fafb',
              borderColor: '#e5e7eb',
              borderWidth: 2,
              borderRadius: 8
            }
          },
          {
            type: 'shape' as const,
            x: x + 30,
            y: y + 20,
            width: 100,
            height: 60,
            content: {
              shape: 'rectangle' as const
            } as ShapeContent,
            style: {
              backgroundColor: '#e5e7eb',
              borderRadius: 4
            }
          },
          {
            type: 'text' as const,
            x: x + 30,
            y: y + 90,
            width: 100,
            height: 25,
            content: {
              text: `Word ${index + 1}`,
              placeholder: 'Word'
            } as TextContent,
            style: {
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial',
              color: '#1f2937',
              textAlign: 'center'
            }
          },
          {
            type: 'text' as const,
            x: x + 30,
            y: y + 115,
            width: 100,
            height: 20,
            content: {
              text: 'Translation',
              placeholder: 'Translation'
            } as TextContent,
            style: {
              fontSize: 14,
              fontFamily: 'Arial',
              color: '#6b7280',
              textAlign: 'center'
            }
          }
        ]
      })
    ],
    tags: ['exercise', 'vocabulary', 'grid', 'language']
  },
  {
    id: 'exercise-fill-blanks',
    name: 'Fill in the Blanks',
    category: 'exercise',
    description: 'Complete the sentences',
    background: '#ffffff',
    elements: [
      {
        type: 'text',
        x: 60,
        y: 40,
        width: 680,
        height: 50,
        content: {
          text: 'Fill in the Blanks',
          placeholder: 'Click to edit title'
        } as TextContent,
        style: {
          fontSize: 36,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: '#1f2937',
          textAlign: 'center'
        }
      },
      {
        type: 'text',
        x: 60,
        y: 120,
        width: 680,
        height: 30,
        content: {
          text: 'Complete the sentences with the correct words:',
          placeholder: 'Instructions'
        } as TextContent,
        style: {
          fontSize: 18,
          fontFamily: 'Arial',
          color: '#6b7280',
          textAlign: 'left'
        }
      },
      // Sentence 1
      {
        type: 'text',
        x: 60,
        y: 180,
        width: 40,
        height: 30,
        content: {
          text: '1.',
          placeholder: '1.'
        } as TextContent,
        style: {
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: '#374151',
          textAlign: 'left'
        }
      },
      {
        type: 'text',
        x: 110,
        y: 180,
        width: 200,
        height: 30,
        content: {
          text: 'The weather is',
          placeholder: 'Text before blank'
        } as TextContent,
        style: {
          fontSize: 18,
          fontFamily: 'Arial',
          color: '#374151',
          textAlign: 'left'
        }
      },
      {
        type: 'shape',
        x: 320,
        y: 180,
        width: 150,
        height: 30,
        content: {
          shape: 'rectangle'
        } as ShapeContent,
        style: {
          backgroundColor: '#f3f4f6',
          borderColor: '#d1d5db',
          borderWidth: 2,
          borderRadius: 4
        }
      },
      {
        type: 'text',
        x: 480,
        y: 180,
        width: 200,
        height: 30,
        content: {
          text: 'today.',
          placeholder: 'Text after blank'
        } as TextContent,
        style: {
          fontSize: 18,
          fontFamily: 'Arial',
          color: '#374151',
          textAlign: 'left'
        }
      },
      // Sentence 2
      {
        type: 'text',
        x: 60,
        y: 240,
        width: 40,
        height: 30,
        content: {
          text: '2.',
          placeholder: '2.'
        } as TextContent,
        style: {
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: '#374151',
          textAlign: 'left'
        }
      },
      {
        type: 'text',
        x: 110,
        y: 240,
        width: 100,
        height: 30,
        content: {
          text: 'She',
          placeholder: 'Text before blank'
        } as TextContent,
        style: {
          fontSize: 18,
          fontFamily: 'Arial',
          color: '#374151',
          textAlign: 'left'
        }
      },
      {
        type: 'shape',
        x: 150,
        y: 240,
        width: 150,
        height: 30,
        content: {
          shape: 'rectangle'
        } as ShapeContent,
        style: {
          backgroundColor: '#f3f4f6',
          borderColor: '#d1d5db',
          borderWidth: 2,
          borderRadius: 4
        }
      },
      {
        type: 'text',
        x: 310,
        y: 240,
        width: 300,
        height: 30,
        content: {
          text: 'to school every day.',
          placeholder: 'Text after blank'
        } as TextContent,
        style: {
          fontSize: 18,
          fontFamily: 'Arial',
          color: '#374151',
          textAlign: 'left'
        }
      }
    ],
    tags: ['exercise', 'fill-in', 'blanks', 'practice']
  },
  {
    id: 'exercise-matching',
    name: 'Matching Exercise',
    category: 'exercise',
    description: 'Match items from two columns',
    background: '#ffffff',
    elements: [
      {
        type: 'text',
        x: 60,
        y: 40,
        width: 680,
        height: 50,
        content: {
          text: 'Matching Exercise',
          placeholder: 'Click to edit title'
        } as TextContent,
        style: {
          fontSize: 36,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: '#1f2937',
          textAlign: 'center'
        }
      },
      {
        type: 'text',
        x: 60,
        y: 110,
        width: 680,
        height: 25,
        content: {
          text: 'Draw lines to match the items:',
          placeholder: 'Instructions'
        } as TextContent,
        style: {
          fontSize: 18,
          fontFamily: 'Arial',
          color: '#6b7280',
          textAlign: 'center'
        }
      },
      // Left column
      {
        type: 'text',
        x: 120,
        y: 160,
        width: 200,
        height: 30,
        content: {
          text: 'Column A',
          placeholder: 'Column title'
        } as TextContent,
        style: {
          fontSize: 20,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: '#374151',
          textAlign: 'center'
        }
      },
      // Right column
      {
        type: 'text',
        x: 480,
        y: 160,
        width: 200,
        height: 30,
        content: {
          text: 'Column B',
          placeholder: 'Column title'
        } as TextContent,
        style: {
          fontSize: 20,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: '#374151',
          textAlign: 'center'
        }
      },
      // Items - Left
      ...Array.from({ length: 4 }).map((_, i) => ({
        type: 'shape' as const,
        x: 100,
        y: 210 + i * 70,
        width: 240,
        height: 50,
        content: {
          shape: 'rectangle' as const
        } as ShapeContent,
        style: {
          backgroundColor: '#e0e7ff',
          borderRadius: 8
        }
      })),
      ...Array.from({ length: 4 }).map((_, i) => ({
        type: 'text' as const,
        x: 100,
        y: 225 + i * 70,
        width: 240,
        height: 20,
        content: {
          text: `Item ${i + 1}`,
          placeholder: 'Item'
        } as TextContent,
        style: {
          fontSize: 16,
          fontFamily: 'Arial',
          color: '#1f2937',
          textAlign: 'center'
        }
      })),
      // Items - Right
      ...Array.from({ length: 4 }).map((_, i) => ({
        type: 'shape' as const,
        x: 460,
        y: 210 + i * 70,
        width: 240,
        height: 50,
        content: {
          shape: 'rectangle' as const
        } as ShapeContent,
        style: {
          backgroundColor: '#fef3c7',
          borderRadius: 8
        }
      })),
      ...Array.from({ length: 4 }).map((_, i) => ({
        type: 'text' as const,
        x: 460,
        y: 225 + i * 70,
        width: 240,
        height: 20,
        content: {
          text: `Match ${i + 1}`,
          placeholder: 'Match'
        } as TextContent,
        style: {
          fontSize: 16,
          fontFamily: 'Arial',
          color: '#1f2937',
          textAlign: 'center'
        }
      }))
    ],
    tags: ['exercise', 'matching', 'interactive', 'practice']
  }
]
