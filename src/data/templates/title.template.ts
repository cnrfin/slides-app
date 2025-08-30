// Template: Title
// Title Page with Centered Text
// Slide Type: objectives

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const TitleTemplate: SlideTemplate = {
  id: 'title',
  name: 'Title',
  category: 'title',
  description: 'A title page of the lesson',
  background: "#ffffff",
  elements: [
    {
          "type": "text",
          "x": 25,
          "y": 280,
          "width": 750,
          "height": 40,
          "visible": true,
          "content": {
                "text": "{{title}}",
                "placeholder": "Course Title"
          },
          "style": {
                "fontSize": 40,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "center",
                "fontWeight": "700",
                "lineHeight": 1
          }
    },
    {
          "type": "text",
          "x": 25,
          "y": 344,
          "width": 750,
          "height": 28,
          "visible": true,
          "content": {
                "text": "{{subtitle}}",
                "placeholder": "Lesson subtitle"
          },
          "style": {
                "fontSize": 28,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "center",
                "fontWeight": "700",
                "lineHeight": 1
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
  tags: ['objectives', 'dynamic']
}

// Data key mappings:
// Element NRGlDnnKm-mfPlg1xE0Ef: title
// Element AaLfr3dEtQweIC1boXehF: subtitle
// Element mVR0qCxr5EXsX3u8jwvmc: school
