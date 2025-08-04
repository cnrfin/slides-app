// Template: Warm Up Questions
// 4 Warm-Up Conversation Questions
// Slide Type: warm-up

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const WarmUpQuestionsTemplate: SlideTemplate = {
  id: 'warm-up-questions',
  name: 'Warm Up Questions',
  category: 'warm-up',
  description: '4 Warm-Up Conversation Questions',
  background: "#ffffff",
  elements: [
    {
          "type": "shape",
          "x": 0,
          "y": 0,
          "width": 800,
          "height": 84,
          "opacity": 0.45,
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
          "width": 314.9926099869753,
          "height": 35.04,
          "content": {
                "text": "Warm up!"
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
          "y": 126,
          "width": 656.0895405305531,
          "height": 21.024000000000004,
          "content": {
                "text": "Let's begin by answering the following questions"
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
          "y": 205,
          "width": 750,
          "height": 21.024000000000004,
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
          "x": 25,
          "y": 269,
          "width": 750,
          "height": 21.024000000000004,
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
          "y": 333,
          "width": 750,
          "height": 21.024000000000004,
          "content": {
                "text": "{{question[2]}}",
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
          "y": 397,
          "width": 750,
          "height": 21.024000000000004,
          "content": {
                "text": "{{question[3]}}",
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
  tags: ['warm-up', 'dynamic']
}

// Data key mappings:
// Element SJw583ZipL4r--C2kPWRG: question[0]
// Element LhaWwZIUIl3oYJgQtS-c2: question[1]
// Element _Hih2xAit1Om6GlXWhiWL: question[2]
// Element wHC5xuMmEREue9f-5ZRJg: question[3]
// Element 81PJer_zlxJZqjxIM2MaW: school
