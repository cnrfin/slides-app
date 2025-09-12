// src/utils/vocabulary-extractor.ts
import type { Slide, SlideElement, TableContent } from '@/types/slide.types'

export interface ExtractedVocabulary {
  word: string
  translation?: string
  category?: string
  difficulty_level?: string
  context_sentence?: string
}

/**
 * Extracts vocabulary from an array of slides
 * Enhanced to handle AI-generated slide structures
 */
export function extractVocabularyFromSlides(slides: Slide[]): string[] {
  const vocabularySet = new Set<string>()
  
  slides.forEach(slide => {
    // Check slide metadata for vocabulary indicators
    const isVocabularySlide = 
      slide.slideType === 'vocabulary' ||
      slide.metadata?.templateName?.toLowerCase().includes('vocabulary') ||
      slide.metadata?.templateName?.toLowerCase().includes('vocab') ||
      slide.metadata?.category === 'vocabulary' ||
      slide.metadata?.isVocabulary === true
    
    if (isVocabularySlide) {
      // Extract from all elements in vocabulary slides
      slide.elements.forEach(element => {
        const words = extractVocabularyFromElement(element, true)
        words.forEach(word => vocabularySet.add(word))
      })
    } else {
      // For non-vocabulary slides, still check for vocabulary in tables and marked elements
      slide.elements.forEach(element => {
        if (element.type === 'table' || element.metadata?.isVocabulary) {
          const words = extractVocabularyFromElement(element, false)
          words.forEach(word => vocabularySet.add(word))
        }
      })
    }
  })
  
  return Array.from(vocabularySet)
}

/**
 * Extracts vocabulary from a single slide element
 * Enhanced to handle various content structures
 */
function extractVocabularyFromElement(element: SlideElement, isVocabularySlide: boolean): string[] {
  const words: string[] = []
  
  if (element.type === 'table' && element.content) {
    const tableContent = element.content as TableContent
    
    // Handle both cells array and rows array structures
    const cells = tableContent.cells || tableContent.rows || []
    
    if (Array.isArray(cells)) {
      cells.forEach((row, rowIndex) => {
        if (Array.isArray(row)) {
          // Skip header row if it contains common headers
          if (rowIndex === 0) {
            const firstCell = row[0]?.text || row[0]?.content || row[0]
            if (typeof firstCell === 'string' && 
                (firstCell.toLowerCase().includes('word') || 
                 firstCell.toLowerCase().includes('vocabulary') ||
                 firstCell.toLowerCase().includes('spanish') ||
                 firstCell.toLowerCase().includes('english') ||
                 firstCell.toLowerCase().includes('french'))) {
              return // Skip header row
            }
          }
          
          // Extract vocabulary from first column (usually the word)
          const wordCell = row[0]
          if (wordCell) {
            const word = extractTextFromCell(wordCell)
            if (word && isValidVocabularyWord(word)) {
              words.push(word)
            }
          }
        }
      })
    }
  } else if (element.type === 'text' && element.content) {
    const textContent = element.content as any
    const text = textContent.text || textContent.content || ''
    
    if (isVocabularySlide) {
      // For vocabulary slides, extract more aggressively
      const extractedWords = extractVocabularyFromText(text)
      words.push(...extractedWords)
    } else if (element.metadata?.isVocabulary) {
      // For marked vocabulary text
      const extractedWords = extractVocabularyFromText(text)
      words.push(...extractedWords)
    }
  }
  
  return words
}

/**
 * Extracts text from a table cell that might have various structures
 */
function extractTextFromCell(cell: any): string {
  if (!cell) return ''
  
  // Handle different cell structures
  if (typeof cell === 'string') {
    return cell.trim()
  }
  if (cell.text) {
    return cell.text.trim()
  }
  if (cell.content) {
    if (typeof cell.content === 'string') {
      return cell.content.trim()
    }
    if (cell.content.text) {
      return cell.content.text.trim()
    }
  }
  if (cell.value) {
    return cell.value.trim()
  }
  
  return ''
}

/**
 * Extracts vocabulary from text content
 */
function extractVocabularyFromText(text: string): string[] {
  const words: string[] = []
  
  if (!text) return words
  
  // Pattern 1: Words in quotes
  const quotedWords = text.match(/"([^"]+)"|'([^']+)'/g)
  if (quotedWords) {
    quotedWords.forEach(match => {
      const word = match.replace(/["']/g, '').trim()
      if (isValidVocabularyWord(word)) {
        words.push(word)
      }
    })
  }
  
  // Pattern 2: Bold or emphasized words (markdown style)
  const boldWords = text.match(/\*\*([^*]+)\*\*|\*([^*]+)\*/g)
  if (boldWords) {
    boldWords.forEach(match => {
      const word = match.replace(/\*/g, '').trim()
      if (isValidVocabularyWord(word)) {
        words.push(word)
      }
    })
  }
  
  // Pattern 3: Words followed by translations (word - translation or word: translation)
  const translationPairs = text.match(/([A-Za-zÀ-ÿĀ-žА-я]+)\s*[-–—:]\s*([A-Za-zÀ-ÿĀ-žА-я\s]+)/g)
  if (translationPairs) {
    translationPairs.forEach(pair => {
      const [word] = pair.split(/\s*[-–—:]\s*/)
      if (word && isValidVocabularyWord(word)) {
        words.push(word.trim())
      }
    })
  }
  
  // Pattern 4: Bullet points or numbered lists (likely vocabulary items)
  const listItems = text.match(/^[\s]*[•\-\*\d+\.]\s*(.+)$/gm)
  if (listItems) {
    listItems.forEach(item => {
      const cleanItem = item.replace(/^[\s]*[•\-\*\d+\.]\s*/, '').trim()
      // Extract first word or phrase before any separator
      const word = cleanItem.split(/[-–—:,]/)[0].trim()
      if (word && isValidVocabularyWord(word)) {
        words.push(word)
      }
    })
  }
  
  return words
}

/**
 * Checks if a word is valid vocabulary (not a common word or instruction)
 */
function isValidVocabularyWord(word: string): boolean {
  if (!word || word.length < 2) return false
  
  // List of common words and UI text to exclude
  const excludeWords = [
    // Common English words
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'can', 'shall', 'what',
    'which', 'who', 'when', 'where', 'why', 'how', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their',
    // UI/Instruction words
    'word', 'words', 'vocabulary', 'vocab', 'translation', 'meaning',
    'example', 'sentence', 'practice', 'exercise', 'lesson', 'spanish',
    'english', 'french', 'german', 'italian', 'portuguese', 'chinese',
    'japanese', 'korean', 'russian', 'arabic', 'language', 'translate',
    'match', 'fill', 'complete', 'choose', 'select', 'write', 'read',
    'listen', 'speak', 'answer', 'question', 'correct', 'incorrect',
    'title', 'subtitle', 'header', 'click', 'drag', 'drop', 'type'
  ]
  
  const lowerWord = word.toLowerCase()
  
  // Check if it's an excluded word
  if (excludeWords.includes(lowerWord)) return false
  
  // Check if it's just numbers or special characters
  if (!/[a-zA-ZÀ-ÿĀ-žА-я]/.test(word)) return false
  
  // Check if it's too long (probably a sentence)
  if (word.split(/\s+/).length > 3) return false
  
  return true
}

/**
 * Extracts detailed vocabulary information from slides
 * Returns vocabulary with translations when available
 */
export function extractDetailedVocabularyFromSlides(slides: Slide[]): ExtractedVocabulary[] {
  const vocabulary: ExtractedVocabulary[] = []
  const seenWords = new Set<string>()
  
  slides.forEach(slide => {
    const isVocabularySlide = 
      slide.slideType === 'vocabulary' ||
      slide.metadata?.templateName?.toLowerCase().includes('vocabulary') ||
      slide.metadata?.templateName?.toLowerCase().includes('vocab') ||
      slide.metadata?.category === 'vocabulary'
    
    if (isVocabularySlide) {
      slide.elements.forEach(element => {
        if (element.type === 'table' && element.content) {
          const tableContent = element.content as TableContent
          const cells = tableContent.cells || tableContent.rows || []
          
          if (Array.isArray(cells)) {
            cells.forEach((row, rowIndex) => {
              if (Array.isArray(row) && row.length >= 2) {
                // Skip header row
                if (rowIndex === 0) {
                  const firstCell = extractTextFromCell(row[0])
                  if (firstCell.toLowerCase().includes('word') || 
                      firstCell.toLowerCase().includes('vocabulary')) {
                    return
                  }
                }
                
                const word = extractTextFromCell(row[0])
                const translation = extractTextFromCell(row[1])
                
                if (word && isValidVocabularyWord(word) && !seenWords.has(word.toLowerCase())) {
                  seenWords.add(word.toLowerCase())
                  
                  // Try to extract additional info from other columns
                  const contextSentence = row[2] ? extractTextFromCell(row[2]) : undefined
                  
                  vocabulary.push({
                    word,
                    translation: translation || undefined,
                    category: slide.metadata?.vocabularyCategory,
                    difficulty_level: slide.metadata?.difficultyLevel,
                    context_sentence: contextSentence
                  })
                }
              }
            })
          }
        }
      })
    }
  })
  
  return vocabulary
}
