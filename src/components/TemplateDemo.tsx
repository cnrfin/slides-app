// src/components/TemplateDemo.tsx
import { useState } from 'react'
import { Play, FileText, Languages, X } from 'lucide-react'
import useSlideStore from '@/stores/slideStore'
import type { SlideTemplate } from '@/types/template.types'
import { vocabularySixItemsTemplate } from '@/data/templates/vocabulary'
import { nanoid } from 'nanoid'

// Example data for different vocabulary themes
const vocabularyExamples = {
  spanishColors: {
    title: "Spanish Colors",
    subtitle: "Learn basic color vocabulary in Spanish",
    vocabulary: [
      { word: "rojo", meaning: "red - the color of passion and energy" },
      { word: "azul", meaning: "blue - the color of the sky and ocean" },
      { word: "verde", meaning: "green - the color of nature and growth" },
      { word: "amarillo", meaning: "yellow - the color of the sun and happiness" },
      { word: "negro", meaning: "black - the color of night and elegance" },
      { word: "blanco", meaning: "white - the color of purity and peace" }
    ]
  },
  frenchNumbers: {
    title: "French Numbers 1-6",
    subtitle: "Master counting in French",
    vocabulary: [
      { word: "un", meaning: "one (1) - the first number" },
      { word: "deux", meaning: "two (2) - a pair" },
      { word: "trois", meaning: "three (3) - a trio" },
      { word: "quatre", meaning: "four (4) - a quartet" },
      { word: "cinq", meaning: "five (5) - a handful" },
      { word: "six", meaning: "six (6) - half a dozen" }
    ]
  },
  germanGreetings: {
    title: "German Greetings",
    subtitle: "Essential phrases for daily conversations",
    vocabulary: [
      { word: "Hallo", meaning: "Hello - informal greeting" },
      { word: "Guten Morgen", meaning: "Good morning - morning greeting" },
      { word: "Guten Tag", meaning: "Good day - formal daytime greeting" },
      { word: "Auf Wiedersehen", meaning: "Goodbye - formal farewell" },
      { word: "Danke", meaning: "Thank you - expressing gratitude" },
      { word: "Bitte", meaning: "Please / You're welcome - polite expression" }
    ]
  }
}

export default function TemplateDemo() {
  const [showDemo, setShowDemo] = useState(false)
  const [selectedExample, setSelectedExample] = useState<keyof typeof vocabularyExamples>('spanishColors')
  const { addSlide, currentSlideId } = useSlideStore()
  
  const selectedData = vocabularyExamples[selectedExample]
  
  const handleAddBlankTemplate = () => {
    if (!currentSlideId) return
    
    // Add the vocabulary template with placeholders
    addSlide(vocabularySixItemsTemplate)
    
    alert('Blank vocabulary template added! You can now use the Template Designer to map data keys.')
  }
  
  const handlePopulateTemplate = () => {
    if (!currentSlideId) return
    
    // Create a deep copy of the template elements
    const elements = vocabularySixItemsTemplate.elements.map(el => ({ 
      ...el,
      id: nanoid(),
      content: { ...el.content }
    }))
    
    // Populate the elements with selected data
    const populatedElements = elements.map(element => {
      if (element.type === 'text' && element.content && 'text' in element.content) {
        let text = element.content.text
        
        // Replace placeholders with actual data
        text = text.replace('{{title}}', selectedData.title)
        text = text.replace('{{subtitle}}', selectedData.subtitle)
        
        // Replace vocabulary items
        selectedData.vocabulary.forEach((item, index) => {
          text = text.replace(`{{vocabulary[${index}].word}}`, item.word)
          text = text.replace(`{{vocabulary[${index}].meaning}}`, item.meaning)
        })
        
        return {
          ...element,
          content: { ...element.content, text }
        }
      }
      
      return element
    })
    
    // Add new slide with populated elements
    addSlide({
      id: nanoid(),
      name: `${selectedData.title} - Vocabulary`,
      category: 'vocabulary',
      description: 'Populated vocabulary slide',
      background: vocabularySixItemsTemplate.background,
      elements: populatedElements,
      tags: ['vocabulary', 'populated', selectedExample]
    })
    
    alert(`Vocabulary template populated with ${selectedData.title} data!`)
  }
  
  if (!showDemo) {
    return (
      <button
        onClick={() => setShowDemo(true)}
        className="fixed bottom-4 left-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-lg"
      >
        <Play className="w-4 h-4" />
        Demo: Populate Template
      </button>
    )
  }
  
  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-xl p-4 w-96 max-h-[500px] overflow-y-auto">
      <h3 className="font-semibold mb-3 pr-8">Vocabulary Template Demo</h3>
      
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Example Data (from OpenAI):</h4>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{JSON.stringify(selectedData, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Select Example Data:</h4>
          <div className="space-y-2">
            {Object.entries(vocabularyExamples).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSelectedExample(key as keyof typeof vocabularyExamples)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedExample === key
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  <span>{data.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Template Placeholders:</h4>
          <ul className="text-xs space-y-1 text-gray-600">
            <li><code className="bg-gray-100 px-1 rounded">{'{{title}}'}</code> → Main title</li>
            <li><code className="bg-gray-100 px-1 rounded">{'{{subtitle}}'}</code> → Subtitle/description</li>
            <li><code className="bg-gray-100 px-1 rounded">{'{{vocabulary[0].word}}'}</code> → First word</li>
            <li><code className="bg-gray-100 px-1 rounded">{'{{vocabulary[0].meaning}}'}</code> → First meaning</li>
            <li className="text-gray-500">... and so on for indices 1-5</li>
          </ul>
        </div>
        
        <div className="space-y-2 pt-2 border-t">
          <button
            onClick={handleAddBlankTemplate}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Add Blank Template
          </button>
          
          <button
            onClick={handlePopulateTemplate}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Populate with {selectedData.title}
          </button>
        </div>
        
        <button
          onClick={() => setShowDemo(false)}
          className="absolute top-2 right-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
