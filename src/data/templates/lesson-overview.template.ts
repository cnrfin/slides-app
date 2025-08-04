// Template: Lesson Overview
// An Overview of the Lesson
// Slide Type: objectives

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const LessonOverviewTemplate: SlideTemplate = {
  id: 'lesson-overview',
  name: 'Lesson Overview',
  category: 'objectives',
  description: 'An Overview of the Lesson',
  background: "#ffffff",
  elements: [
    {
          "type": "shape",
          "x": 400,
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
          "y": 264,
          "width": 342.4791117672448,
          "height": 33.2,
          "visible": true,
          "content": {
                "text": "Lesson Overview"
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
          "type": "line",
          "x": 25,
          "y": 315,
          "width": 342.4791117672448,
          "height": 1,
          "visible": true,
          "content": {
                "points": [
                      0,
                      0,
                      342.4791117672448,
                      0
                ],
                "lineCap": "round"
          },
          "style": {
                "borderColor": "#000000",
                "borderWidth": 1.5
          }
    },
    {
          "type": "text",
          "x": 25,
          "y": 336,
          "width": 342.4791117672448,
          "height": 19.92,
          "visible": true,
          "content": {
                "text": "What we're learning today"
          },
          "style": {
                "fontSize": 24,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left",
                "lineHeight": 1,
                "letterSpacing": 0.5
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
  tags: ['objectives', 'dynamic']
}

// Data key mappings:
// Element JPgjgzJNBsOF8yniWJWHP: objective[0]
// Element Z6CLGbV-FHSYdaurGpk8Z: objective[1]
// Element Wfx0wOdm_QwP8pMtsAlpc: objective[2]
// Element wvXNbyyv-lVq8IIoiRTk9: objective[3]
// Element S6FtESQBzr_6snrH6T9og: school
