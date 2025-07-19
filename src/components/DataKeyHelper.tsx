// src/components/DataKeyHelper.tsx
import { useState } from 'react'
import { Key, Copy, X } from 'lucide-react'
import { useCurrentSlide, useSelectedElements } from '@/stores/slideStore'

interface DataKeySuggestion {
  category: string
  keys: { key: string; description: string }[]
}

const dataKeySuggestions: Record<string, DataKeySuggestion[]> = {
  title: [
    {
      category: 'Basic',
      keys: [
        { key: 'title', description: 'Main title text' },
        { key: 'subtitle', description: 'Subtitle or tagline' },
        { key: 'author', description: 'Author or presenter name' },
        { key: 'date', description: 'Presentation date' },
        { key: 'topic', description: 'Topic or subject' },
      ]
    },
    {
      category: 'Course Info',
      keys: [
        { key: 'course.name', description: 'Course name' },
        { key: 'course.level', description: 'Course level (e.g., Beginner)' },
        { key: 'course.duration', description: 'Course duration' },
        { key: 'course.instructor', description: 'Instructor name' },
      ]
    }
  ],
  'warm-up': [
    {
      category: 'Content',
      keys: [
        { key: 'warmup', description: 'Warm-up activity text' },
        { key: 'objectives', description: 'Learning objectives' },
        { key: 'icebreaker', description: 'Ice breaker activity' },
        { key: 'discussion', description: 'Discussion prompt' },
      ]
    },
    {
      category: 'Activities',
      keys: [
        { key: 'activities[0]', description: 'First activity' },
        { key: 'activities[1]', description: 'Second activity' },
        { key: 'questions[0]', description: 'First question' },
        { key: 'questions[1]', description: 'Second question' },
      ]
    }
  ],
  vocabulary: [
    {
      category: 'Word Items',
      keys: [
        { key: 'vocabulary[0].word', description: 'First word' },
        { key: 'vocabulary[0].translation', description: 'First translation' },
        { key: 'vocabulary[0].pronunciation', description: 'First pronunciation' },
        { key: 'vocabulary[0].example', description: 'First example sentence' },
        { key: 'vocabulary[0].image', description: 'First word image URL' },
      ]
    },
    {
      category: 'Multiple Words',
      keys: [
        { key: 'vocabulary[1].word', description: 'Second word' },
        { key: 'vocabulary[2].word', description: 'Third word' },
        { key: 'vocabulary[3].word', description: 'Fourth word' },
        { key: 'vocabulary.length', description: 'Total number of words' },
      ]
    },
    {
      category: 'Metadata',
      keys: [
        { key: 'category', description: 'Vocabulary category' },
        { key: 'difficulty', description: 'Difficulty level' },
        { key: 'theme', description: 'Theme or topic' },
      ]
    }
  ],
  conversation: [
    {
      category: 'Dialogue',
      keys: [
        { key: 'dialogue[0].speaker', description: 'First speaker name' },
        { key: 'dialogue[0].text', description: 'First speaker text' },
        { key: 'dialogue[1].speaker', description: 'Second speaker name' },
        { key: 'dialogue[1].text', description: 'Second speaker text' },
      ]
    },
    {
      category: 'Context',
      keys: [
        { key: 'situation', description: 'Conversation situation' },
        { key: 'location', description: 'Where the conversation takes place' },
        { key: 'participants', description: 'Who is involved' },
        { key: 'purpose', description: 'Purpose of the conversation' },
      ]
    }
  ],
  reading: [
    {
      category: 'Reading Content',
      keys: [
        { key: 'title', description: 'Reading passage title' },
        { key: 'passage', description: 'Main reading text' },
        { key: 'source', description: 'Text source' },
        { key: 'difficulty', description: 'Reading level' },
      ]
    },
    {
      category: 'Comprehension',
      keys: [
        { key: 'questions[0].text', description: 'First question' },
        { key: 'questions[0].answer', description: 'First answer' },
        { key: 'questions[0].type', description: 'Question type' },
        { key: 'vocabulary[0]', description: 'First vocabulary word' },
      ]
    },
    {
      category: 'Sections',
      keys: [
        { key: 'paragraphs[0]', description: 'First paragraph' },
        { key: 'paragraphs[1]', description: 'Second paragraph' },
        { key: 'highlights[0]', description: 'First highlighted phrase' },
        { key: 'notes[0]', description: 'First note or annotation' },
      ]
    }
  ],
  review: [
    {
      category: 'Summary',
      keys: [
        { key: 'summary', description: 'Lesson summary' },
        { key: 'keyPoints[0]', description: 'First key point' },
        { key: 'keyPoints[1]', description: 'Second key point' },
        { key: 'keyPoints[2]', description: 'Third key point' },
      ]
    },
    {
      category: 'Performance',
      keys: [
        { key: 'score', description: 'Student score' },
        { key: 'correctAnswers', description: 'Number of correct answers' },
        { key: 'totalQuestions', description: 'Total questions' },
        { key: 'feedback', description: 'Performance feedback' },
      ]
    }
  ],
  end: [
    {
      category: 'Closing',
      keys: [
        { key: 'thankYou', description: 'Thank you message' },
        { key: 'nextSteps', description: 'What to do next' },
        { key: 'contact', description: 'Contact information' },
        { key: 'resources', description: 'Additional resources' },
      ]
    },
    {
      category: 'Links',
      keys: [
        { key: 'links[0].text', description: 'First link text' },
        { key: 'links[0].url', description: 'First link URL' },
        { key: 'social.email', description: 'Email address' },
        { key: 'social.website', description: 'Website URL' },
      ]
    }
  ],
  custom: [
    {
      category: 'Common',
      keys: [
        { key: 'title', description: 'Title text' },
        { key: 'description', description: 'Description text' },
        { key: 'content', description: 'Main content' },
        { key: 'image', description: 'Image URL' },
      ]
    },
    {
      category: 'Arrays',
      keys: [
        { key: 'items[0]', description: 'First item' },
        { key: 'items[1]', description: 'Second item' },
        { key: 'list[0].name', description: 'First item name' },
        { key: 'list[0].value', description: 'First item value' },
      ]
    }
  ]
}

export default function DataKeyHelper() {
  const [isOpen, setIsOpen] = useState(false)
  const currentSlide = useCurrentSlide()
  const selectedElements = useSelectedElements()
  const slideType = currentSlide?.slideType || 'custom'
  const currentDataKeys = currentSlide?.metadata?.dataKeys || {}
  
  const suggestions = dataKeySuggestions[slideType] || dataKeySuggestions.custom
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Visual feedback
    const button = document.activeElement as HTMLElement
    if (button) {
      const originalText = button.innerHTML
      button.innerHTML = '<svg class="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
      setTimeout(() => {
        button.innerHTML = originalText
      }, 1000)
    }
  }
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 z-40 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-lg"
        title="Show data key suggestions"
      >
        <Key className="w-4 h-4" />
        Data Keys
      </button>
    )
  }
  
  return (
    <div className="fixed top-20 right-4 z-40 bg-white rounded-lg shadow-xl p-4 w-96 max-h-[600px] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-600" />
          Data Key Suggestions
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Slide Type:</span>{' '}
          <span className="capitalize text-indigo-600">{slideType}</span>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {selectedElements.length} element{selectedElements.length !== 1 ? 's' : ''} selected
        </p>
      </div>
      
      {/* Current data keys for selected elements */}
      {selectedElements.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-xs font-medium text-blue-900 mb-2">Selected Elements:</h4>
          <div className="space-y-1">
            {selectedElements.map((element, idx) => {
              const dataKey = currentDataKeys[element.id]
              return (
                <div key={element.id} className="text-xs flex items-center gap-2">
                  <span className="text-blue-700">
                    {idx + 1}. {element.type}
                  </span>
                  {dataKey ? (
                    <code className="bg-white px-2 py-0.5 rounded text-blue-900 font-mono">
                      {dataKey}
                    </code>
                  ) : (
                    <span className="text-blue-600 italic">no data key</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto space-y-4">
        {suggestions.map((category, idx) => (
          <div key={idx}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{category.category}</h4>
            <div className="space-y-1">
              {category.keys.map((item, keyIdx) => (
                <div
                  key={keyIdx}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group"
                >
                  <div className="flex-1">
                    <code className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono">
                      {item.key}
                    </code>
                    <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.key)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded transition-all"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Tips:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Use dot notation for nested data: <code className="bg-gray-100 px-1">course.name</code></li>
          <li>• Access array items with brackets: <code className="bg-gray-100 px-1">items[0]</code></li>
          <li>• Combine both: <code className="bg-gray-100 px-1">vocabulary[0].word</code></li>
        </ul>
      </div>
    </div>
  )
}
