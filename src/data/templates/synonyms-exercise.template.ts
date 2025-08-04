// Template: Synonyms Exercise
// Vocabulary 'Match the Synonyms' Exercise
// Slide Type: vocabulary

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const SynonymsExerciseTemplate: SlideTemplate = {
  id: 'synonyms-exercise',
  name: 'Synonyms Exercise',
  category: 'vocabulary',
  description: "Vocabulary 'Match the Synonyms' Exercise",
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
          "height": 63.84000000000001,
          "content": {
                "text": "Match the Synonyms"
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
          "height": 38.30400000000001,
          "content": {
                "text": "Match the vocabulary with the words with similar meanings"
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
          "x": 365,
          "y": 186,
          "width": 410,
          "height": 35.424,
          "content": {
                "text": "{{vocabulary[1].synonym}}",
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
    },
    {
          "type": "text",
          "x": 365,
          "y": 234,
          "width": 410,
          "height": 35.424,
          "content": {
                "text": "{{vocabulary[2].synonym}}",
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
          "y": 282,
          "width": 410,
          "height": 35.424,
          "content": {
                "text": "{{vocabulary[0].synonym}}",
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
          "y": 330,
          "width": 410,
          "height": 35.424,
          "content": {
                "text": "{{vocabulary[3].synonym}}",
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
          "y": 378,
          "width": 410,
          "height": 35.424,
          "content": {
                "text": "{{vocabulary[4].synonym}}",
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
          "y": 426,
          "width": 410,
          "height": 35.424,
          "content": {
                "text": "{{vocabulary[0].synonym}}",
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
          "y": 470,
          "width": 410,
          "height": 35.424,
          "content": {
                "text": "{{vocabulary[2].synonym}}",
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
          "y": 518,
          "width": 410,
          "height": 35.424,
          "content": {
                "text": "{{vocabulary[3].synonym}}",
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
// Element 0cCZDqc8Lo9nAqKbADsmE: school
// Element H6PMHV_YhQ9aLqzDLYVz5: vocabulary[0]
// Element 9wgCTgjj9DO-_lHZ8ObWO: vocabulary[1]
// Element UqfnssmzRMRxKrqA-Ku_h: vocabulary[2]
// Element HbWagswSJ8g_OlpYKoqce: vocabulary[3]
// Element DeTShJF6tL8cQW1-7dy_R: vocabulary[4]
// Element PAaX_PrY26UhocIiZwd-7: vocabulary[0].synonym
// Element 0ta-hbrKuov7xRTppPMe3: vocabulary[0].synonym
// Element UjhCNc_6pL6QTLy3as5cp: vocabulary[1].synonym
// Element A2lCqWOpaRcqXa8xH8D1b: vocabulary[2].synonym
// Element c4EbQnJKTMnPUw3DpYT7Q: vocabulary[2].synonym
// Element 9oH6LU20i-Sv-2supRr7o: vocabulary[3].synonym
// Element Ad1Qh19kaGk5JCc362uZR: vocabulary[3].synonym
// Element 2sAC7O4Oo3aPzqyF4Mw_u: vocabulary[4].synonym
