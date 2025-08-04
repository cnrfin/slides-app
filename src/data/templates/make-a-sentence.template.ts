// Template: Make a Sentence
// Vocabulary 'Make a Sentence' Exercise
// Slide Type: vocabulary

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const MakeaSentenceTemplate: SlideTemplate = {
  id: 'make-a-sentence',
  name: 'Make a Sentence',
  category: 'vocabulary',
  description: "Vocabulary 'Make a Sentence' Exercise",
  background: "#ffffff",
  elements: [
    {
          "type": "text",
          "x": 400,
          "y": 144,
          "width": 375,
          "height": 105.11999999999999,
          "visible": true,
          "content": {
                "text": "Use the vocabulary to make sentences about the picture on the left.\n\n"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#555555",
                "textAlign": "left",
                "fontStyle": "normal"
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
    },
    {
          "type": "image",
          "x": 0,
          "y": 0,
          "width": 361,
          "height": 600,
          "visible": true,
          "content": {
                "src": "data:image/svg+xml;base64,CiAgICAgICAgICA8c3ZnIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgICAgICAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOWZhZmIiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmYXk9IjgsNCIgcng9IjgiLz4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAwLCA5MCkiPgogICAgICAgICAgICAgIDwhLS0gSW1hZ2UgaWNvbiAtLT4KICAgICAgICAgICAgICA8cGF0aCBkPSJNLTM1LC0zNSBMMzUsLTM1IFE0MCwtMzUgNDAsLTMwIEw0MCwyMCBRNDAsMjUgMzUsMjUgTC0zNSwyNSBRLTQwLDI1IC00MCwyMCBMLTQwLC0zMCBRLTQwLC0zNSAtMzUsLTM1IFoiIAogICAgICAgICAgICAgICAgICAgIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzljYTNhZiIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgICAgICAgICAgICAgPCEtLSBNb3VudGFpbi9sYW5kc2NhcGUgaW5zaWRlIC0tPgogICAgICAgICAgICAgIDxwYXRoIGQ9Ik0tMzUsNSBMLTEwLC0xMCBMNSwwIEwyMCwtMTUgTDM1LDUgTDM1LDIwIEwtMzUsMjAgWiIgZmlsbD0iI2U1ZTdlYiIvPgogICAgICAgICAgICAgIDwhLS0gU3VuL2NpcmNsZSAtLT4KICAgICAgICAgICAgICA8Y2lyY2xlIGN4PSItMTgiIGN5PSItMTUiIHI9IjciIGZpbGw9IiNkMWQ1ZGIiLz4KICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8dGV4dCB4PSIxMDAiIHk9IjE0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgLWFwcGxlLXN5c3RlbSwgc2Fucy1zZXJpZiIgCiAgICAgICAgICAgICAgICAgIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSI1MDAiIGZpbGw9IiM2YjcyODAiPkRyb3AgaW1hZ2UgaGVyZTwvdGV4dD4KICAgICAgICAgICAgPHRleHQgeD0iMTAwIiB5PSIxNjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIHNhbnMtc2VyaWYiIAogICAgICAgICAgICAgICAgICBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIj5vciByZXNpemUgcGxhY2Vob2xkZXI8L3RleHQ+CiAgICAgICAgICA8L3N2Zz4KICAgICAgICA=",
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
          "height": 31.536,
          "visible": true,
          "content": {
                "text": "Make sentences"
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
          "y": 249,
          "width": 375,
          "height": 21.023999999999997,
          "visible": true,
          "content": {
                "text": "{{vocabulary[0]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "none"
          }
    },
    {
          "type": "text",
          "x": 400,
          "y": 282,
          "width": 375,
          "height": 17.52,
          "visible": true,
          "content": {
                "text": "{{vocabulary[0].example}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 20,
                "fontFamily": "Arial",
                "color": "#555555",
                "textAlign": "left",
                "fontStyle": "italic"
          }
    },
    {
          "type": "text",
          "x": 400,
          "y": 341,
          "width": 375,
          "height": 21.023999999999997,
          "visible": true,
          "content": {
                "text": "{{vocabulary[1]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "none"
          }
    },
    {
          "type": "text",
          "x": 400,
          "y": 397,
          "width": 375,
          "height": 21.023999999999997,
          "visible": true,
          "content": {
                "text": "{{vocabulary[2]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "none"
          }
    },
    {
          "type": "text",
          "x": 400,
          "y": 453,
          "width": 375,
          "height": 21.023999999999997,
          "visible": true,
          "content": {
                "text": "{{vocabulary[3]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "none"
          }
    }
  ],
  tags: ['vocabulary', 'dynamic']
}

// Data key mappings:
// Element lz430_Ts06O3TAvu6eh_i: vocabulary[0]
// Element moAtXb0abbbDQo1v_GIAh: vocabulary[0].example
// Element d5ZhWVocasBG9_jy0E0fk: vocabulary[1]
// Element Q0JYYYUvs4LNZRBCjLlZf: vocabulary[2]
// Element Zymw8uV-gqiD5CrFzGc9m: vocabulary[3]
// Element H37fZUjevJcbvH2UgSEgN: school
