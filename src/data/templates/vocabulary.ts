// src/data/templates/vocabulary.ts
import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const vocabularySixItemsTemplate: SlideTemplate = {
  id: 'vocabulary-6-items',
  name: 'Vocabulary - 6 items',
  category: 'vocabulary',
  description: 'Display 6 vocabulary words with their meanings in a two-column layout',
  background: "#ffffff",
  elements: [
    {
      "type": "text",
      "x": 25,
      "y": 25,
      "width": 203.85307885473327,
      "height": 40,
      "opacity": 1,
      "content": {
        "text": "{{title}}",
        "placeholder": "Dynamic content"
      },
      "style": {
        "fontSize": 40,
        "fontFamily": "Arial",
        "color": "#000000",
        "textAlign": "center",
        "lineHeight": 1,
        "fontWeight": "500"
      }
    },
    {
      "type": "text",
      "x": 25,
      "y": 115,
      "width": 735.8142823594735,
      "height": 28.799999999999997,
      "content": {
        "text": "{{subtitle}}",
        "placeholder": "Dynamic content"
      },
      "style": {
        "fontSize": 24,
        "fontFamily": "Arial",
        "color": "#000000",
        "textAlign": "left",
        "fontStyle": "italic"
      }
    },
    {
      "type": "text",
      "x": 25,
      "y": 189,
      "width": 301.4262239041745,
      "height": 28.799999999999997,
      "content": {
        "text": "{{vocabulary[0].word}}",
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
      "y": 254,
      "width": 301.4262239041745,
      "height": 28.799999999999997,
      "content": {
        "text": "{{vocabulary[1].word}}",
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
      "y": 319,
      "width": 301.4262239041745,
      "height": 28.799999999999997,
      "content": {
        "text": "{{vocabulary[2].word}}",
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
      "y": 384,
      "width": 301.4262239041745,
      "height": 28.799999999999997,
      "content": {
        "text": "{{vocabulary[3].word}}",
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
      "y": 449,
      "width": 301.4262239041745,
      "height": 28.799999999999997,
      "content": {
        "text": "{{vocabulary[4].word}}",
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
      "y": 514,
      "width": 301.4262239041745,
      "height": 28.799999999999997,
      "content": {
        "text": "{{vocabulary[5].word}}",
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
      "y": 189,
      "width": 410,
      "height": 28.799999999999997,
      "content": {
        "text": "{{vocabulary[0].meaning}}",
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
      "y": 254,
      "width": 410,
      "height": 21.023999999999997,
      "content": {
        "text": "{{vocabulary[1].meaning}}",
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
      "y": 319,
      "width": 410,
      "height": 21.023999999999997,
      "content": {
        "text": "{{vocabulary[2].meaning}}",
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
      "y": 384,
      "width": 410,
      "height": 21.023999999999997,
      "content": {
        "text": "{{vocabulary[3].meaning}}",
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
      "y": 449,
      "width": 410,
      "height": 21.023999999999997,
      "content": {
        "text": "{{vocabulary[4].meaning}}",
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
      "y": 514,
      "width": 395.81428235947345,
      "height": 21.023999999999997,
      "content": {
        "text": "{{vocabulary[5].meaning}}",
        "placeholder": "Dynamic content"
      },
      "style": {
        "fontSize": 24,
        "fontFamily": "Arial",
        "color": "#000000",
        "textAlign": "left"
      }
    }
  ],
  tags: ['vocabulary', 'dynamic', '6-items', 'two-column']
}

export const vocabularyTemplates = [vocabularySixItemsTemplate]
