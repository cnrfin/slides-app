// src/utils/fileUtils.ts
import * as pdfjsLib from 'pdfjs-dist';

// Try multiple methods to configure the worker
// Method 1: Local file from public folder (requires copying the worker file)
// Method 2: Import using Vite (fallback)
try {
  // First try to use the local worker file
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
} catch (error) {
  console.warn('Could not set worker from public folder, using fallback method');
  // Fallback: Try to import the worker using Vite's import system
  // This requires the worker file to be available at build time
  try {
    // @ts-ignore - Vite will handle this import
    import('pdfjs-dist/build/pdf.worker.min.mjs?url').then((module) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = module.default;
    });
  } catch (importError) {
    console.error('Failed to load PDF.js worker:', importError);
  }
}

export interface FileUpload {
  id: string
  name: string
  type: 'txt' | 'html' | 'pdf'
  size: number
  content?: string
  error?: string
}

export const SUPPORTED_FILE_TYPES = {
  'text/plain': 'txt',
  'text/html': 'html',
  'application/pdf': 'pdf',
} as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function getFileType(mimeType: string): 'txt' | 'html' | 'pdf' | null {
  const type = SUPPORTED_FILE_TYPES[mimeType as keyof typeof SUPPORTED_FILE_TYPES]
  return type as 'txt' | 'html' | 'pdf' | null
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export async function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      resolve(content)
    }
    reader.onerror = () => reject(new Error('Failed to read text file'))
    reader.readAsText(file)
  })
}

export async function parseHTMLFile(file: File): Promise<string> {
  const htmlContent = await parseTextFile(file)
  
  // Create a temporary DOM element to extract text from HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  
  // Remove script and style elements
  const scripts = doc.querySelectorAll('script, style')
  scripts.forEach(el => el.remove())
  
  // Get the text content
  const textContent = doc.body?.textContent || ''
  
  // Clean up whitespace
  return textContent.replace(/\s+/g, ' ').trim()
}

export async function parsePDFFile(file: File): Promise<string> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      // Use standard fonts to avoid font loading issues
      useSystemFonts: true,
      // Disable range requests since we're loading from memory
      disableRange: true,
      disableStream: true,
    })
    
    const pdf = await loadingTask.promise
    
    let fullText = ''
    const numPages = pdf.numPages
    
    console.log(`Processing PDF with ${numPages} pages...`)
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      // Combine text items into a single string with proper spacing
      const pageText = textContent.items
        .map((item: any) => {
          // Type guard to check if item has string content
          if ('str' in item && typeof item.str === 'string') {
            return item.str
          }
          return ''
        })
        .filter((text: string) => text.length > 0)
        .join(' ')
      
      if (pageText.trim()) {
        fullText += pageText + '\n\n'
      }
    }
    
    // Clean up whitespace and return
    const cleanedText = fullText
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n\n')  // Normalize line breaks
      .trim()
    
    if (!cleanedText) {
      throw new Error('No text content could be extracted from the PDF')
    }
    
    console.log(`Successfully extracted ${cleanedText.length} characters from PDF`)
    return cleanedText
  } catch (error) {
    console.error('Error parsing PDF:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('password')) {
        throw new Error('This PDF is password-protected and cannot be read.')
      } else if (error.message.includes('Invalid')) {
        throw new Error('This PDF file appears to be corrupted or invalid.')
      } else if (error.message.includes('No text')) {
        throw new Error('No text could be extracted. The PDF may contain only images or scanned content.')
      }
    }
    
    throw new Error('Failed to parse PDF file. The file may be corrupted, password-protected, or contain only images without text.')
  }
}

export async function parseFile(file: File): Promise<FileUpload> {
  const fileType = getFileType(file.type)
  
  if (!fileType) {
    throw new Error(`Unsupported file type: ${file.type}. Please upload a .txt, .html, or .pdf file.`)
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`)
  }
  
  const fileUpload: FileUpload = {
    id: Date.now().toString(),
    name: file.name,
    type: fileType,
    size: file.size,
  }
  
  try {
    let content = ''
    
    switch (fileType) {
      case 'txt':
        content = await parseTextFile(file)
        break
      case 'html':
        content = await parseHTMLFile(file)
        break
      case 'pdf':
        content = await parsePDFFile(file)
        break
    }
    
    if (!content || content.trim().length === 0) {
      throw new Error('File appears to be empty or could not be read')
    }
    
    fileUpload.content = content
  } catch (error) {
    fileUpload.error = error instanceof Error ? error.message : 'Failed to parse file'
    throw error
  }
  
  return fileUpload
}
