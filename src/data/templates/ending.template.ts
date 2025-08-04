// Template: Ending
// End Page with Farewell Message
// Slide Type: end

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const EndingTemplate: SlideTemplate = {
  id: 'ending',
  name: 'Ending',
  category: 'end',
  description: 'End Page with Farewell Message',
  background: "#ffffff",
  elements: [
    {
          "type": "text",
          "x": 25,
          "y": 280,
          "width": 750,
          "height": 48,
          "visible": true,
          "content": {
                "text": "See you next lesson!"
          },
          "style": {
                "fontSize": 40,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "fontWeight": "700",
                "lineHeight": 1.2
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
  tags: ['end', 'dynamic']
}

// Data key mappings:
// Element ckGn-RQaoQPE1ubo-YHCK: school
