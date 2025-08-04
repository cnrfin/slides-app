// Template: Conversation Questions
// 4 Conversation Questions with Image
// Slide Type: conversation

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const ConversationQuestionsTemplate: SlideTemplate = {
  id: 'conversation-questions',
  name: 'Conversation Questions',
  category: 'conversation',
  description: '4 Conversation Questions with Image',
  background: "#ffffff",
  elements: [
    {
          "type": "image",
          "x": 0,
          "y": -3,
          "width": 361,
          "height": 600,
          "content": {
                "src": "data:image/svg+xml;base64,CiAgICAgICAgICA8c3ZnIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgICAgICAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOWZhZmIiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI4LDQiIHJ4PSI4Ii8+CiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMCwgOTApIj4KICAgICAgICAgICAgICA8IS0tIEltYWdlIGljb24gLS0+CiAgICAgICAgICAgICAgPHBhdGggZD0iTS0zNSwtMzUgTDM1LC0zNSBRNDAsLTM1IDQwLC0zMCBMNDAsMjAgUTQwLDI1IDM1LDI1IEwtMzUsMjUgUS00MCwyNSAtNDAsMjAgTC00MCwtMzAgUS00MCwtMzUgLTM1LC0zNSBaIiAKICAgICAgICAgICAgICAgICAgICBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMyIvPgogICAgICAgICAgICAgIDwhLS0gTW91bnRhaW4vbGFuZHNjYXBlIGluc2lkZSAtLT4KICAgICAgICAgICAgICA8cGF0aCBkPSJNLTM1LDUgTC0xMCwtMTAgTDUsMCBMMjAsLTE1IEwzNSw1IEwzNSwyMCBMLTM1LDIwIFoiIGZpbGw9IiNlNWU3ZWIiLz4KICAgICAgICAgICAgICA8IS0tIFN1bi9jaXJjbGUgLS0+CiAgICAgICAgICAgICAgPGNpcmNsZSBjeD0iLTE4IiBjeT0iLTE1IiByPSI3IiBmaWxsPSIjZDFkNWRiIi8+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPHRleHQgeD0iMTAwIiB5PSIxNDUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIHNhbnMtc2VyaWYiIAogICAgICAgICAgICAgICAgICBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iNTAwIiBmaWxsPSIjNmI3MjgwIj5Ecm9wIGltYWdlIGhlcmU8L3RleHQ+CiAgICAgICAgICAgIDx0ZXh0IHg9IjEwMCIgeT0iMTY1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBzYW5zLXNlcmlmIiAKICAgICAgICAgICAgICAgICAgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiI+b3IgcmVzaXplIHBsYWNlaG9sZGVyPC90ZXh0PgogICAgICAgICAgPC9zdmc+CiAgICAgICAg",
                "alt": "Placeholder image",
                "isPlaceholder": true,
                "objectFit": "cover",
                "offsetX": 0.5,
                "offsetY": 0.5,
                "scale": 1
          },
          "style": {}
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
    },
    {
          "type": "text",
          "x": 400,
          "y": 75,
          "width": 375,
          "height": 57.45600000000001,
          "content": {
                "text": "How about you?"
          },
          "style": {
                "fontSize": 36,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "fontWeight": "500"
          }
    },
    {
          "type": "text",
          "x": 400,
          "y": 160,
          "width": 375,
          "height": 26.784,
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
          "x": 400,
          "y": 244,
          "width": 375,
          "height": 26.784,
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
          "x": 400,
          "y": 324,
          "width": 375,
          "height": 26.784,
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
          "x": 400,
          "y": 408,
          "width": 375,
          "height": 26.784,
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
    }
  ],
  tags: ['conversation', 'dynamic']
}

// Data key mappings:
// Element 7Tb4F0xQHdobUCi_pf02G: question[0]
// Element D4jRIeQnAca9klPiBR7cM: question[1]
// Element XoXtbtlYeFaZmXCSTgmxI: question[2]
// Element uI-4BRF7uAbO7D-NDw_Am: question[3]
// Element ftdwgGHRtyTZ6YH3m_-ET: school
