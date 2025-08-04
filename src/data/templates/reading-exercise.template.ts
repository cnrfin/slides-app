// Template: Reading Exercise
// Reading Exercise with Passage and Questions
// Slide Type: reading

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const ReadingExerciseTemplate: SlideTemplate = {
  id: 'reading-exercise',
  name: 'Reading Exercise',
  category: 'reading',
  description: 'Reading Exercise with Passage and Questions',
  background: "#ffffff",
  elements: [
    {
          "type": "shape",
          "x": 0,
          "y": 0,
          "width": 800,
          "height": 84,
          "opacity": 0.45,
          "visible": true,
          "content": {
                "shape": "rectangle"
          },
          "style": {
                "backgroundColor": "#f6f6f6",
                "borderRadius": 0
          }
    },
    {
          "type": "text",
          "x": 25,
          "y": 24,
          "width": 419.5785092404084,
          "height": 44.63999999999999,
          "visible": true,
          "content": {
                "text": "{{title}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 40,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "fontWeight": "500"
          }
    },
    {
          "type": "text",
          "x": 25,
          "y": 98,
          "width": 750,
          "height": 80.352,
          "visible": true,
          "content": {
                "text": "Read the following passage out loud to your teacher, then answer the questions. \n"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#555555",
                "textAlign": "left",
                "fontStyle": "italic"
          }
    },
    {
          "type": "text",
          "x": 25,
          "y": 189,
          "width": 750,
          "height": 26.784,
          "content": {
                "text": "{{passage}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left"
          }
    },
    {
          "type": "text",
          "x": 29,
          "y": 463,
          "width": 746,
          "height": 28.799999999999997,
          "visible": true,
          "content": {
                "text": "{{question[0]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "bullet"
          }
    },
    {
          "type": "text",
          "x": 29,
          "y": 511,
          "width": 746,
          "height": 26.784,
          "visible": true,
          "content": {
                "text": "{{question[1]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "bullet"
          }
    },
    {
          "type": "text",
          "x": 25,
          "y": 575,
          "width": 375,
          "height": 19.2,
          "visible": true,
          "content": {
                "text": "{{source}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 16,
                "fontFamily": "Arial",
                "color": "#555",
                "textAlign": "left",
                "listStyle": "none",
                "fontStyle": "italic"
          }
    },
    {
          "type": "text",
          "x": 400,
          "y": 559,
          "width": 375,
          "height": 16,
          "visible": true,
          "content": {
                "text": "{{school}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 16,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "right",
                "fontWeight": "400",
                "lineHeight": 1,
                "letterSpacing": 1
          }
    }
  ],
  tags: ['reading', 'dynamic']
}

// Data key mappings:
// Element meXQahN0GjS6XNnhvIvwC: title
// Element k7h2EZc9lEee32AZonMWi: passage
// Element bW8n8LAr4KVMjwGOt3BGe: question[0]
// Element rE6VwrIkX6eRyEGVsp4Gd: question[1]
// Element CSdBueVgtdhxCFVp82wE8: source
// Element kT_wNPpK-q27jkgyQgFEi: school
