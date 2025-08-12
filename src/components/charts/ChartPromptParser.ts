// src/components/charts/ChartPromptParser.ts

import type { ParsedChartData } from './ChartTypes'

export function parseChartPrompt(prompt: string): ParsedChartData | null {
  try {
    // Clean the prompt - remove brackets and other common formatting
    const cleanedPrompt = prompt
      .replace(/[\[\]{}]/g, '') // Remove brackets
      .replace(/Create a.*chart.*:/i, '') // Remove common prefixes
      .trim()

    // Array to store matches
    const matches: Array<[string, number]> = []
    
    // First, try to split by comma and parse each segment
    const segments = cleanedPrompt.split(',').map(s => s.trim())
    
    for (const segment of segments) {
      if (!segment) continue
      
      // Try different patterns for each segment
      let matched = false
      
      // Pattern 1: Simple "label: value" or "label = value"
      const simplePattern = /^([^:=]+)[:=]\s*\$?([\d,]+(?:\.\d+)?)\s*([kKmMbB])?$/i
      let match = segment.match(simplePattern)
      
      if (match) {
        const label = match[1].trim()
        let value = match[2].replace(/,/g, '')
        const suffix = match[3]?.toLowerCase()
        
        // Handle K, M, B suffixes
        let multiplier = 1
        if (suffix === 'k') multiplier = 1000
        else if (suffix === 'm') multiplier = 1000000
        else if (suffix === 'b') multiplier = 1000000000
        
        const numericValue = parseFloat(value) * multiplier
        
        if (!isNaN(numericValue)) {
          matches.push([label, numericValue])
          matched = true
        }
      }
      
      // Pattern 2: "label - value" format
      if (!matched) {
        const dashPattern = /^([^-]+)-\s*\$?([\d,]+(?:\.\d+)?)\s*([kKmMbB])?$/i
        match = segment.match(dashPattern)
        
        if (match) {
          const label = match[1].trim()
          let value = match[2].replace(/,/g, '')
          const suffix = match[3]?.toLowerCase()
          
          let multiplier = 1
          if (suffix === 'k') multiplier = 1000
          else if (suffix === 'm') multiplier = 1000000
          else if (suffix === 'b') multiplier = 1000000000
          
          const numericValue = parseFloat(value) * multiplier
          
          if (!isNaN(numericValue)) {
            matches.push([label, numericValue])
            matched = true
          }
        }
      }
      
      // Pattern 3: "label (value)" format
      if (!matched) {
        const parenPattern = /^([^(]+)\(\s*\$?([\d,]+(?:\.\d+)?)\s*([kKmMbB])?\s*\)$/i
        match = segment.match(parenPattern)
        
        if (match) {
          const label = match[1].trim()
          let value = match[2].replace(/,/g, '')
          const suffix = match[3]?.toLowerCase()
          
          let multiplier = 1
          if (suffix === 'k') multiplier = 1000
          else if (suffix === 'm') multiplier = 1000000
          else if (suffix === 'b') multiplier = 1000000000
          
          const numericValue = parseFloat(value) * multiplier
          
          if (!isNaN(numericValue)) {
            matches.push([label, numericValue])
            matched = true
          }
        }
      }
    }
    
    // If no matches from segment parsing, try full string patterns
    if (matches.length === 0) {
      // Try to match the entire string with various patterns
      const patterns = [
        // Pattern for continuous text with multiple key-value pairs
        /([a-zA-Z][a-zA-Z0-9\s]*?):\s*\$?([\d,]+(?:\.\d+)?)\s*([kKmMbB])?/g,
        // Month patterns
        /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember))\s*[:=\-]\s*\$?([\d,]+(?:\.\d+)?)\s*([kKmMbB])?/gi,
        // Quarter patterns
        /(Q[1-4])\s*[:=\-]\s*\$?([\d,]+(?:\.\d+)?)\s*([kKmMbB])?/gi,
        // Day patterns
        /(Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day))\s*[:=\-]\s*\$?([\d,]+(?:\.\d+)?)\s*([kKmMbB])?/gi,
      ]
      
      for (const pattern of patterns) {
        const found = [...cleanedPrompt.matchAll(pattern)]
        if (found.length > 0) {
          matches.push(...found.map(match => {
            const label = match[1].trim()
            let value = match[2].replace(/,/g, '')
            const suffix = match[3]?.toLowerCase()
            
            let multiplier = 1
            if (suffix === 'k') multiplier = 1000
            else if (suffix === 'm') multiplier = 1000000
            else if (suffix === 'b') multiplier = 1000000000
            
            const numericValue = parseFloat(value) * multiplier
            
            return [label, numericValue] as [string, number]
          }))
          
          if (matches.length > 0) break
        }
      }
    }
    
    // If still no matches, try to extract just numbers
    if (matches.length === 0) {
      const numberPattern = /\b(\d+(?:\.\d+)?)\b/g
      const numbers = [...cleanedPrompt.matchAll(numberPattern)]
      
      if (numbers.length > 0) {
        matches.push(...numbers.map((match, index) => [
          `Item ${index + 1}`,
          parseFloat(match[1])
        ] as [string, number]))
      }
    }
    
    // If no matches found, return null
    if (matches.length === 0) {
      console.error('No data parsed from prompt:', prompt)
      return null
    }
    
    // Remove any matches with invalid data
    const validMatches = matches.filter(([label, value]) => 
      label && label.length > 0 && !isNaN(value) && isFinite(value)
    )
    
    if (validMatches.length === 0) {
      console.error('No valid data found in matches:', matches)
      return null
    }
    
    return {
      labels: validMatches.map(m => m[0]),
      datasets: [{
        data: validMatches.map(m => m[1])
      }]
    }
  } catch (error) {
    console.error('Failed to parse chart prompt:', error)
    return null
  }
}

// Helper function to validate parsed data
export function validateChartData(data: ParsedChartData): boolean {
  if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
    console.error('Invalid data structure:', data)
    return false
  }
  
  const dataset = data.datasets[0]
  if (!dataset.data || dataset.data.length === 0) {
    console.error('No data points found:', dataset)
    return false
  }
  
  // Check if labels and data have the same length
  if (data.labels.length !== dataset.data.length) {
    console.error('Label/data length mismatch:', data.labels.length, 'vs', dataset.data.length)
    return false
  }
  
  // Check if all data points are valid numbers
  if (!dataset.data.every(value => typeof value === 'number' && !isNaN(value) && isFinite(value))) {
    console.error('Invalid data values:', dataset.data)
    return false
  }
  
  return true
}
