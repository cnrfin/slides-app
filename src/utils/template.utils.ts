// src/utils/template.utils.ts
import type { SlideElement, TextContent } from '@/types/slide.types'
import { nanoid } from 'nanoid'
import { measureWrappedText } from './text.utils'

/**
 * Parse a data key path and get value from data object
 * Supports dot notation and array access
 * Examples: "title", "vocabulary[0].word", "metadata.author"
 * 
 * Special handling for vocabulary template:
 * If path is "vocabulary[index]" and the value is an object with a 'word' property,
 * return the word value instead of the entire object
 */
export function getValueFromDataPath(data: any, path: string): any {
  if (!data || !path) return null
  
  // Handle array notation (e.g., vocabulary[0] -> vocabulary.0)
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1')
  
  // Split path and traverse
  const parts = normalizedPath.split('.')
  let current = data
  
  for (const part of parts) {
    if (current === null || current === undefined) return null
    current = current[part]
  }
  
  // Special handling for vocabulary items
  // If we're accessing vocabulary[index] (not vocabulary[index].something)
  // and the result is an object with a 'word' property, return just the word
  if (path.match(/^vocabulary\[\d+\]$/) && current && typeof current === 'object' && 'word' in current) {
    return current.word
  }
  
  return current
}

/**
 * Replace placeholders in text with actual data
 * Looks for {{dataKey}} patterns and replaces them
 */
export function replacePlaceholders(text: string, data: any): string {
  if (!text || !data) return text
  
  return text.replace(/\{\{([^}]+)\}\}/g, (match, dataKey) => {
    const value = getValueFromDataPath(data, dataKey.trim())
    return value !== null && value !== undefined ? String(value) : match
  })
}

/**
 * Populate a template with data
 * Creates new elements with data filled in
 */
export function populateTemplate(
  templateElements: Partial<SlideElement>[],
  dataKeys: Record<string, string>,
  data: any
): SlideElement[] {
  return templateElements.map(templateEl => {
    const elementId = nanoid()
    const dataKey = dataKeys[templateEl.id || ''] || ''
    
    // Start with template element
    const element: SlideElement = {
      id: elementId,
      type: templateEl.type || 'text',
      x: templateEl.x || 0,
      y: templateEl.y || 0,
      width: templateEl.width || 100,
      height: templateEl.height || 50,
      rotation: templateEl.rotation,
      opacity: templateEl.opacity,
      locked: templateEl.locked,
      visible: templateEl.visible !== false,
      content: templateEl.content || { text: '' },
      style: templateEl.style,
      animations: templateEl.animations,
      interactions: templateEl.interactions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // If element has a data key and it's a text element, populate it
    if (dataKey && element.type === 'text') {
      const textContent = element.content as TextContent
      const value = getValueFromDataPath(data, dataKey)
      
      if (value !== null && value !== undefined) {
        // Replace content with data value
        textContent.text = String(value)
        
        // Recalculate HEIGHT ONLY for new text, keeping the original width
        let textToMeasure = textContent.text
        if (element.style?.listStyle === 'bullet') {
          const lines = textToMeasure.split('\n')
          textToMeasure = lines.map(line => line.trim() ? `• ${line}` : line).join('\n')
        }
        
        const dimensions = measureWrappedText({
          text: textToMeasure,
          fontSize: element.style?.fontSize || 16,
          fontFamily: element.style?.fontFamily || 'Arial',
          fontWeight: element.style?.fontWeight,
          lineHeight: element.style?.lineHeight || 1.2,
          letterSpacing: element.style?.letterSpacing || 0,
          width: element.width, // Use the template's width constraint
          padding: 0,
          wrap: 'word'
        })
        
        // Only update height, keep original width
        element.height = dimensions.height
      }
    }
    
    // Also check for placeholder patterns in text content
    if (element.type === 'text') {
      const textContent = element.content as TextContent
      const replacedText = replacePlaceholders(textContent.text, data)
      
      if (replacedText !== textContent.text) {
        textContent.text = replacedText
        
        // Recalculate HEIGHT ONLY, keeping the original width
        let textToMeasure = replacedText
        if (element.style?.listStyle === 'bullet') {
          const lines = textToMeasure.split('\n')
          textToMeasure = lines.map(line => line.trim() ? `• ${line}` : line).join('\n')
        }
        
        const dimensions = measureWrappedText({
          text: textToMeasure,
          fontSize: element.style?.fontSize || 16,
          fontFamily: element.style?.fontFamily || 'Arial',
          fontWeight: element.style?.fontWeight,
          lineHeight: element.style?.lineHeight || 1.2,
          letterSpacing: element.style?.letterSpacing || 0,
          width: element.width, // Use the template's width constraint
          padding: 0,
          wrap: 'word'
        })
        
        // Only update height, keep original width
        element.height = dimensions.height
      }
    }
    
    return element
  })
}

/**
 * Generate TypeScript code for a template
 */
export function generateTemplateCode(
  name: string,
  description: string,
  slideType: string,
  background: string | any,
  elements: SlideElement[],
  dataKeys: Record<string, string>
): string {
  const templateCode = `// Template: ${name}
// ${description}
// Slide Type: ${slideType}

import type { SlideTemplate } from '@/types/template.types'
import type { TextContent, ShapeContent } from '@/types/slide.types'

export const ${name.replace(/\s+/g, '')}Template: SlideTemplate = {
  id: '${name.toLowerCase().replace(/\s+/g, '-')}',
  name: '${name}',
  category: '${slideType === 'vocabulary' || slideType === 'exercise' ? 'exercise' : slideType === 'title' || slideType === 'end' ? 'title' : 'content'}',
  description: '${description}',
  background: ${JSON.stringify(background)},
  elements: [
${elements.map(el => {
  const dataKey = dataKeys[el.id]
  const elementObj: any = {
    type: el.type,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
  }
  
  if (el.rotation) elementObj.rotation = el.rotation
  if (el.opacity !== undefined) elementObj.opacity = el.opacity
  if (el.locked) elementObj.locked = el.locked
  if (el.visible !== undefined) elementObj.visible = el.visible
  
  // Handle content based on type
  if (el.type === 'text') {
    const textContent = el.content as any
    if (dataKey) {
      elementObj.content = {
        text: `{{${dataKey}}}`,
        placeholder: textContent.placeholder || 'Dynamic content'
      }
    } else {
      elementObj.content = el.content
    }
  } else {
    elementObj.content = el.content
  }
  
  if (el.style) elementObj.style = el.style
  if (el.animations) elementObj.animations = el.animations
  if (el.interactions) elementObj.interactions = el.interactions
  
  return `    ${JSON.stringify(elementObj, null, 6).split('\n').join('\n    ')}`
}).join(',\n')}
  ],
  tags: ['${slideType}'${dataKeys && Object.keys(dataKeys).length > 0 ? ", 'dynamic'" : ''}]
}

// Data key mappings:
${Object.entries(dataKeys).map(([elementId, dataKey]) => `// Element ${elementId}: ${dataKey}`).join('\n')}
`
  
  return templateCode
}

/**
 * Save template to localStorage
 */
export function saveTemplateToStorage(template: any): void {
  const savedTemplates = JSON.parse(localStorage.getItem('customTemplates') || '[]')
  savedTemplates.push(template)
  localStorage.setItem('customTemplates', JSON.stringify(savedTemplates))
}

/**
 * Load templates from localStorage
 */
export function loadTemplatesFromStorage(): any[] {
  return JSON.parse(localStorage.getItem('customTemplates') || '[]')
}

/**
 * Export template as JSON file
 */
export function exportTemplateAsJSON(template: any, filename: string): void {
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
