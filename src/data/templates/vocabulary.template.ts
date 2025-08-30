// Template: Vocabulary
// Introduction of 5 Vocabulary
// Slide Type: vocabulary

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const VocabularyTemplate: SlideTemplate = {
  id: 'vocabulary',
  name: 'Vocabulary',
  category: 'vocabulary',
  description: '5 vocabulary words with meanings',
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
          "width": 375,
          "height": 48,
          "content": {
                "text": "Today's Vocabulary"
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
          "height": 28.799999999999997,
          "content": {
                "text": "Review the following vocabulary and their meanings"
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
          "type": "line",
          "x": 23,
          "y": 160,
          "width": 751.8095214651892,
          "height": 1,
          "opacity": 0.25,
          "locked": true,
          "content": {
                "points": [
                      751.8095214651892,
                      0,
                      0,
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
          "type": "line",
          "x": 23,
          "y": 232,
          "width": 751.8095214651892,
          "height": 1,
          "opacity": 0.25,
          "locked": true,
          "content": {
                "points": [
                      751.8095214651892,
                      0,
                      0,
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
          "type": "line",
          "x": 23,
          "y": 304,
          "width": 751.8095214651892,
          "height": 1,
          "opacity": 0.25,
          "locked": true,
          "content": {
                "points": [
                      751.8095214651892,
                      0,
                      0,
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
          "type": "line",
          "x": 23,
          "y": 376,
          "width": 751.8095214651892,
          "height": 1,
          "opacity": 0.25,
          "locked": true,
          "content": {
                "points": [
                      751.8095214651892,
                      0,
                      0,
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
          "type": "line",
          "x": 23,
          "y": 448,
          "width": 751.8095214651892,
          "height": 1,
          "opacity": 0.25,
          "locked": true,
          "content": {
                "points": [
                      751.8095214651892,
                      0,
                      0,
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
          "type": "line",
          "x": 23,
          "y": 520,
          "width": 751.8095214651892,
          "height": 1,
          "opacity": 0.25,
          "locked": true,
          "content": {
                "points": [
                      751.8095214651892,
                      0,
                      0,
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
          "type": "line",
          "x": 352.8726472382907,
          "y": 159.2577996656248,
          "width": 1,
          "height": 360.00272531132896,
          "opacity": 0.25,
          "locked": true,
          "content": {
                "points": [
                      0,
                      0,
                      0,
                      360.00272531132896
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
          "x": 23,
          "y": 254,
          "width": 311.299791352169,
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
          "x": 25,
          "y": 182,
          "width": 309.299791352169,
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
          "x": 23,
          "y": 326,
          "width": 309.299791352169,
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
          "x": 23,
          "y": 398,
          "width": 311.299791352169,
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
          "x": 23,
          "y": 470,
          "width": 309.299791352169,
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
          "x": 371,
          "y": 172,
          "width": 404,
          "height": 24.720000000000002,
          "content": {
                "text": "{{vocabulary[0].meaning}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 20,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left"
          }
    },
    {
          "type": "text",
          "x": 371,
          "y": 245,
          "width": 404,
          "height": 24.720000000000002,
          "content": {
                "text": "{{vocabulary[1].meaning}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 20,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left"
          }
    },
    {
          "type": "text",
          "x": 371,
          "y": 317,
          "width": 404,
          "height": 24.720000000000002,
          "content": {
                "text": "{{vocabulary[2].meaning}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 20,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left"
          }
    },
    {
          "type": "text",
          "x": 371,
          "y": 389,
          "width": 404,
          "height": 24.720000000000002,
          "content": {
                "text": "{{vocabulary[3].meaning}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 20,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left"
          }
    },
    {
          "type": "text",
          "x": 371,
          "y": 461,
          "width": 404,
          "height": 24.720000000000002,
          "content": {
                "text": "{{vocabulary[4].meaning}}",
                "placeholder": "Dynamic content"
          },
          "style": {
                "fontSize": 20,
                "fontFamily": "Arial",
                "color": "#000000",
                "textAlign": "left"
          }
    }
  ],
  tags: ['vocabulary', 'dynamic']
}

// Data key mappings:
// Element tedtwkbt1T_vyLRh95aHm: school
// Element v3lzF06H2kUF3cs8JI8LV: vocabulary[0]
// Element wLGCdwvXS1cL0tya2-iF6: vocabulary[1]
// Element we2SVkb5y_beCzUtbsjQK: vocabulary[2]
// Element S2RGOiIZCWq0ZJMtA5z9M: vocabulary[3]
// Element TF9jGRNuChuxMyWExys89: vocabulary[4]
// Element xkWkpMUt603GqlJYDItWb: vocabulary[0].meaning
// Element m9ARi9Ws0vqYu0badid6N: vocabulary[1].meaning
// Element 29-cF8WAbgcMHMhrbRjkM: vocabulary[2].meaning
// Element jH0T5EZLcm9ya7aYqVtsm: vocabulary[3].meaning
// Element Q4QY8Qx2fmNJ-xw8NGhKN: vocabulary[4].meaning
