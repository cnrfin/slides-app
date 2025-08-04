// Template: Read and Discuss
// Reading and Discussion Practise
// Slide Type: reading

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const ReadandDiscussTemplate: SlideTemplate = {
  id: 'read-and-discuss',
  name: 'Read and Discuss',
  category: 'reading',
  description: 'Reading and Discussion Practise',
  background: "#ffffff",
  elements: [
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
          "type": "image",
          "x": 0,
          "y": 0,
          "width": 361,
          "height": 600,
          "content": {
                "src": "data:image/svg+xml;base64,CiAgICAgICAgICA8c3ZnIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgICAgICAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOWZhZmIiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycyYXk9IjgsNCIgcng9IjgiLz4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAwLCA5MCkiPgogICAgICAgICAgICAgIDwhLS0gSW1hZ2UgaWNvbiAtLT4KICAgICAgICAgICAgICA8cGF0aCBkPSJNLTM1LC0zNSBMMzUsLTM1IFE0MCwtMzUgNDAsLTMwIEw0MCwyMCBRNDAsMjUgMzUsMjUgTC0zNSwyNSBRLTQwLDI1IC00MCwyMCBMLTQwLC0zMCBRLTQwLC0zNSAtMzUsLTM1IFoiIAogICAgICAgICAgICAgICAgICAgIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzljYTNhZiIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgICAgICAgICAgICAgPCEtLSBNb3VudGFpbi9sYW5kc2NhcGUgaW5zaWRlIC0tPgogICAgICAgICAgICAgIDxwYXRoIGQ9Ik0tMzUsNSBMLTEwLC0xMCBMNSwwIEwyMCwtMTUgTDM1LDUgTDM1LDIwIEwtMzUsMjAgWiIgZmlsbD0iI2U1ZTdlYiIvPgogICAgICAgICAgICAgIDwhLS0gU3VuL2NpcmNsZSAtLT4KICAgICAgICAgICAgICA8Y2lyY2xlIGN4PSItMTgiIGN5PSItMTUiIHI9IjciIGZpbGw9IiNkMWQ1ZGIiLz4KICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8dGV4dCB4PSIxMDAiIHk9IjE0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgLWFwcGxlLXN5c3RlbSwgc2Fucy1zZXJpZiIgCiAgICAgICAgICAgICAgICAgIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSI1MDAiIGZpbGw9IiM2YjcyODAiPkRyb3AgaW1hZ2UgaGVyZTwvdGV4dD4KICAgICAgICAgICAgPHRleHQgeD0iMTAwIiB5PSIxNjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIHNhbnMtc2VyaWYiIAogICAgICAgICAgICAgICAgICBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIj5vciByZXNpemUgcGxhY2Vob2xkZXI8L3RleHQ+CiAgICAgICAgICA8L3N2Zz4KICAgICAgICA=",
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
          "y": 75,
          "width": 375,
          "height": 43.199999999999996,
          "content": {
                "text": "Read and discuss"
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
          "y": 144,
          "width": 375,
          "height": 35.424,
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
          "x": 400,
          "y": 383,
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
          "y": 439,
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
          "y": 515,
          "width": 375,
          "height": 19.2,
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
    }
  ],
  tags: ['reading', 'dynamic']
}

// Data key mappings:
// Element JvY7ht3aQQvdTvxymktTv: passage
// Element 7Tb4F0xQHdobUCi_pf02G: question[0]
// Element D4jRIeQnAca9klPiBR7cM: question[1]
// Element euNkWY2pOHyRSLrc1RXHy: source
