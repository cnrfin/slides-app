// Template: Useful Phrases
// Introduction of Useful Phrases
// Slide Type: vocabulary

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const UsefulPhrasesTemplate: SlideTemplate = {
  id: 'useful-phrases',
  name: 'Useful Phrases',
  category: 'vocabulary',
  description: 'Introduction of Useful Phrases',
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
          "height": 35.04,
          "visible": true,
          "content": {
                "text": "Useful Phrases"
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
          "y": 112,
          "width": 750,
          "height": 21.023999999999997,
          "visible": true,
          "content": {
                "text": "Review the following phrases with your teacher"
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
          "y": 258,
          "width": 255.8778609451747,
          "height": 38.4,
          "visible": true,
          "content": {
                "text": "{{phrase[1]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 32,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "bullet",
                "fontWeight": "500"
          }
    },
    {
          "type": "text",
          "x": 25,
          "y": 186,
          "width": 253.8778609451747,
          "height": 38.4,
          "visible": true,
          "content": {
                "text": "{{phrase[0]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 32,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "bullet",
                "fontWeight": "500"
          }
    },
    {
          "type": "text",
          "x": 27,
          "y": 330,
          "width": 255.8778609451747,
          "height": 38.4,
          "visible": true,
          "content": {
                "text": "{{phrase[2]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 32,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "bullet",
                "fontWeight": "500"
          }
    },
    {
          "type": "text",
          "x": 27,
          "y": 402,
          "width": 255.8778609451747,
          "height": 38.4,
          "visible": true,
          "content": {
                "text": "{{phrase[3]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 32,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "bullet",
                "fontWeight": "500"
          }
    },
    {
          "type": "text",
          "x": 27,
          "y": 474,
          "width": 253.8778609451747,
          "height": 38.4,
          "visible": true,
          "content": {
                "text": "{{phrase[4]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 32,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "bullet",
                "fontWeight": "500"
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
  tags: ['vocabulary', 'dynamic']
}

// Data key mappings:
// Element SubUkAIjqhbKR1XMNmcc8: school
// Element ABFB0luYD_M7FAy4OCDsP: phrase[0]
// Element 8UU0odA4_hJPx-hvI9QOB: phrase[1]
// Element geyYHyTP_QrUSkxmKNWtQ: phrase[2]
// Element tu1q2p9KM2-yZPnwlX-q-: phrase[3]
// Element IB6WZk-kAwtMGhKfduJ31: phrase[4]
