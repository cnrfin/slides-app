// Template: Lesson Review
// A Review of the Lesson
// Slide Type: end

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const LessonReviewTemplate: SlideTemplate = {
  id: 'lesson-review',
  name: 'Lesson Review',
  category: 'review',
  description: 'A Review of the Lesson',
  background: "#ffffff",
  elements: [
    {
          "type": "shape",
          "x": 0,
          "y": 0,
          "width": 400,
          "height": 600,
          "opacity": 1,
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
          "y": 159,
          "width": 342.4791117672448,
          "height": 29.2,
          "visible": true,
          "content": {
                "text": "Nice Work!"
          },
          "style": {
                "fontSize": 40,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "lineHeight": 1,
                "fontWeight": "500"
          }
    },
    {
          "type": "text",
          "x": 25,
          "y": 231,
          "width": 342.4791117672448,
          "height": 63.072,
          "visible": true,
          "content": {
                "text": "Let's review what we learned in today's lesson:\n"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "lineHeight": 1.2,
                "letterSpacing": 0
          }
    },
    {
          "type": "text",
          "x": 464,
          "y": 153,
          "width": 311,
          "height": 23.903999999999996,
          "visible": true,
          "content": {
                "text": "{{objective[0]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "bullet",
                "lineHeight": 1.2
          }
    },
    {
          "type": "text",
          "x": 464,
          "y": 237,
          "width": 311,
          "height": 28.799999999999997,
          "visible": true,
          "content": {
                "text": "{{objective[1]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "bullet",
                "lineHeight": 1.2
          }
    },
    {
          "type": "text",
          "x": 464,
          "y": 321,
          "width": 311,
          "height": 28.799999999999997,
          "visible": true,
          "content": {
                "text": "{{objective[2]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "bullet",
                "lineHeight": 1.2
          }
    },
    {
          "type": "text",
          "x": 464,
          "y": 405,
          "width": 311,
          "height": 28.799999999999997,
          "visible": true,
          "content": {
                "text": "{{objective[3]}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "listStyle": "bullet",
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
// Element JPgjgzJNBsOF8yniWJWHP: objective[0]
// Element Z6CLGbV-FHSYdaurGpk8Z: objective[1]
// Element Wfx0wOdm_QwP8pMtsAlpc: objective[2]
// Element wvXNbyyv-lVq8IIoiRTk9: objective[3]
// Element S6FtESQBzr_6snrH6T9og: school
