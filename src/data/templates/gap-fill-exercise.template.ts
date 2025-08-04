// Template: Gap Fill Exercise
// Vocabulary 'Fill in the Gaps' Exercise
// Slide Type: vocabulary

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const GapFillExerciseTemplate: SlideTemplate = {
  id: 'gap-fill-exercise',
  name: 'Gap Fill Exercise',
  category: 'vocabulary',
  description: "Vocabulary 'Fill in the Gaps' Exercise",
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
          "width": 419.5785092404084,
          "height": 49.440000000000005,
          "content": {
                "text": "Fill in the Gaps"
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
          "height": 29.663999999999998,
          "content": {
                "text": "Fill in the sentences with the correct form of the vocabulary"
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
          "type": "shape",
          "x": 25,
          "y": 174,
          "width": 305,
          "height": 384,
          "content": {
                "shape": "rectangle"
          },
          "style": {
                "backgroundColor": "#f6f6f6",
                "borderRadius": 4
          }
    },
    {
          "type": "text",
          "x": 47,
          "y": 280,
          "width": 255.8778609451747,
          "height": 28.799999999999997,
          "content": {
                "text": "{{vocabulary[1]}}",
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
          "x": 49,
          "y": 208,
          "width": 253.8778609451747,
          "height": 28.799999999999997,
          "content": {
                "text": "{{vocabulary[0]}}",
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
          "x": 47,
          "y": 352,
          "width": 255.8778609451747,
          "height": 28.799999999999997,
          "content": {
                "text": "{{vocabulary[2]}}",
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
          "x": 47,
          "y": 424,
          "width": 255.8778609451747,
          "height": 28.799999999999997,
          "content": {
                "text": "{{vocabulary[3]}}",
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
          "x": 47,
          "y": 496,
          "width": 253.8778609451747,
          "height": 28.799999999999997,
          "content": {
                "text": "{{vocabulary[4]}}",
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
          "x": 363,
          "y": 280,
          "width": 410,
          "height": 28.799999999999997,
          "content": {
                "text": "{{vocabulary[1].gapfill}}",
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
          "x": 365,
          "y": 208,
          "width": 410,
          "height": 28.799999999999997,
          "content": {
                "text": "{{vocabulary[4].gapfill}}",
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
          "x": 363,
          "y": 352,
          "width": 410,
          "height": 28.799999999999997,
          "content": {
                "text": "{{vocabulary[2].gapfill}}",
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
          "x": 363,
          "y": 424,
          "width": 410,
          "height": 28.799999999999997,
          "content": {
                "text": "{{vocabulary[0].gapfill}}",
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
          "x": 363,
          "y": 496,
          "width": 410,
          "height": 28.799999999999997,
          "content": {
                "text": "{{vocabulary[3].gapfill}}",
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
// Element 0cCZDqc8Lo9nAqKbADsmE: school
// Element H6PMHV_YhQ9aLqzDLYVz5: vocabulary[0]
// Element UjhCNc_6pL6QTLy3as5cp: vocabulary[4].gapfill
// Element 9wgCTgjj9DO-_lHZ8ObWO: vocabulary[1]
// Element ztssm65OjTVYRvycomixJ: vocabulary[1].gapfill
// Element UqfnssmzRMRxKrqA-Ku_h: vocabulary[2]
// Element vQCqUPlLStc3oXlp66FiI: vocabulary[2].gapfill
// Element HbWagswSJ8g_OlpYKoqce: vocabulary[3]
// Element U0yj0lOelKp9cBsV6TJ2Y: vocabulary[0].gapfill
// Element DeTShJF6tL8cQW1-7dy_R: vocabulary[4]
// Element gCmG79juYiWf57jMvHh4m: vocabulary[3].gapfill
