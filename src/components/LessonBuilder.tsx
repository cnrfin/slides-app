// src/components/LessonBuilder.tsx
import { useState } from 'react'
import { Bot, Sparkles, Loader2, AlertCircle, Check, ChevronLeft, ChevronRight, X, Plus, Trash2 } from 'lucide-react'
import { openai } from '@/lib/openai'
import useSlideStore from '@/stores/slideStore'
import { nanoid } from 'nanoid'
import type { SlideTemplate } from '@/types/template.types'
import { populateTemplate } from '@/utils/template.utils'
import { useTemplates } from '@/hooks/useTemplates'

// Template data structure examples for OpenAI
const templateDataStructures = {
  'warm-up': {
    school: "string - School or institution name",
    question: ["array of 4 warm-up questions"]
  },
  'vocabulary': {
    school: "string - School or institution name", 
    vocabulary: [
      { word: "vocabulary word", meaning: "definition or translation" },
      "... exactly 5 items"
    ]
  },
  'conversation': {
    school: "string - School or institution name",
    question: ["array of 4 conversation questions"]
  },
  'reading': {
    school: "string - School or institution name",
    title: "string - Reading passage title",
    passage: "string - The main reading text (keep concise, 2-3 sentences)",
    question: ["array of 2 comprehension questions"],
    source: "string - Source citation (optional)"
  },
  'review': {
    school: "string - School or institution name",
    objective: ["array of 4 lesson objectives or key points"]
  },
  'title': {
    school: "string - School or institution name",
    title: "string - Lesson title",
    subtitle: "string - Lesson subtitle or description"
  },
  'end': {
    school: "string - School or institution name"
  },
  'objectives': {
    school: "string - School or institution name",
    objective: ["array of 4 lesson objectives"]
  }
}

// Special data structures for specific vocabulary templates
const specialTemplateStructures: Record<string, any> = {
  'synonyms-exercise': {
    school: "string - School or institution name",
    vocabulary: [
      { word: "word1", synonym: "primary synonym for word1", synonym2: "alternate synonym for word1" },
      { word: "word2", synonym: "primary synonym for word2" },
      { word: "word3", synonym: "primary synonym for word3", synonym2: "alternate synonym for word3" },
      { word: "word4", synonym: "primary synonym for word4", synonym2: "alternate synonym for word4" },
      { word: "word5", synonym: "primary synonym for word5" }
    ],
    // Note: The template shows 8 synonym slots but only references 5 vocabulary items.
    // Words 1, 3, and 4 appear twice with different synonyms (synonym and synonym2).
  },
  'gap-fill-exercise': {
    school: "string - School or institution name",
    vocabulary: [
      { word: "word1", gapfill: "sentence with _____ for word1" },
      { word: "word2", gapfill: "sentence with _____ for word2" },
      { word: "word3", gapfill: "sentence with _____ for word3" },
      { word: "word4", gapfill: "sentence with _____ for word4" },
      { word: "word5", gapfill: "sentence with _____ for word5" }
    ]
  },
  'vocabulary-6-items': {
    school: "string - School or institution name",
    title: "string - Vocabulary title",
    subtitle: "string - Vocabulary subtitle",
    vocabulary: [
      { word: "word1", meaning: "definition1" },
      { word: "word2", meaning: "definition2" },
      { word: "word3", meaning: "definition3" },
      { word: "word4", meaning: "definition4" },
      { word: "word5", meaning: "definition5" },
      { word: "word6", meaning: "definition6" }
    ]
  },
  'vocabulary': {
    school: "string - School or institution name",
    vocabulary: [
      { word: "vocabulary word 1", meaning: "definition or meaning 1" },
      { word: "vocabulary word 2", meaning: "definition or meaning 2" },
      { word: "vocabulary word 3", meaning: "definition or meaning 3" },
      { word: "vocabulary word 4", meaning: "definition or meaning 4" },
      { word: "vocabulary word 5", meaning: "definition or meaning 5" }
    ],
    "Note": "The standard vocabulary template uses {{vocabulary[i]}} for the word and {{vocabulary[i].meaning}} for the meaning."
  }
}

interface SelectedTemplate {
  template: SlideTemplate
  data?: any
}

export default function LessonBuilder() {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplate[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedData, setGeneratedData] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState<'select' | 'prompt' | 'review'>('select')
  const [useTestMode, setUseTestMode] = useState(false)
  
  const { templates } = useTemplates()
  const { addSlide } = useSlideStore()
  
  const handleAddTemplate = (template: SlideTemplate) => {
    setSelectedTemplates([...selectedTemplates, { template }])
  }
  
  const handleRemoveTemplate = (index: number) => {
    setSelectedTemplates(selectedTemplates.filter((_, i) => i !== index))
  }
  
  const generateSystemPrompt = () => {
    const templateInfo = selectedTemplates.map((item, index) => {
      const category = item.template.category as keyof typeof templateDataStructures
      // Check if it's a special template that needs a different structure
      const specialStructure = specialTemplateStructures[item.template.id]
      const structure = specialStructure || templateDataStructures[category] || {}
      
      return `
Slide ${index + 1}: ${item.template.name} (${category} type, template id: ${item.template.id})
Expected data structure:
${JSON.stringify(structure, null, 2)}
`
    }).join('\n')
    
    return `You are a language learning curriculum designer. Generate JSON data for a language lesson based on the user's prompt.

The lesson should have ${selectedTemplates.length} slides with the following templates:
${templateInfo}

Return a JSON object with the following structure:
{
  "lessonTitle": "Overall lesson title",
  "slides": [
    // Array of data objects, one for each slide template in order
  ]
}

Important guidelines:
- Each slide data object should match the expected structure for its template type
- For vocabulary slides, provide exactly 5 vocabulary items (or as many as specified)
- For synonyms-exercise: provide vocabulary as an array of 5 objects. Some words should have both 'synonym' and 'synonym2' properties to fill all 8 slots
- For gap-fill-exercise: provide vocabulary as an array of objects with 'word' and 'gapfill' properties
- For vocabulary-6-items: provide vocabulary as an array of 6 objects with 'word' and 'meaning' properties
- For standard vocabulary template: vocabulary should be an array of objects with 'word' and 'meaning' properties. The template will display the entire object when using {{vocabulary[i]}} so we need special handling
- For question arrays, provide exactly 4 questions unless otherwise specified
- For reading slides, provide exactly 2 comprehension questions
- Keep reading passages concise (2-3 sentences) to fit in the template
- Keep content appropriate for language learning
- Make content engaging and educational
- If a school name is needed, use "Language Learning Academy" as default
- Ensure all text is clear and concise
- For dates, use today's date or appropriate format

The user's language learning topic/prompt is below.`
  }
  
  // Generate test data for templates
  const generateTestData = () => {
    const testData: any = {
      lessonTitle: "Test Lesson: Spanish Colors",
      slides: []
    }
    
    selectedTemplates.forEach((item) => {
      const category = item.template.category as keyof typeof templateDataStructures
      const templateId = item.template.id // Declare templateId here for all cases
      
      switch (category) {
        case 'title':
          testData.slides.push({
            school: "Language Learning Academy",
            title: "Spanish Colors",
            subtitle: "Learn basic color vocabulary"
          })
          break
        case 'warm-up':
          testData.slides.push({
            school: "Language Learning Academy",
            question: [
              "What is your favorite color?",
              "What colors do you see in the classroom?",
              "Can you name any colors in Spanish?",
              "What color is the sky today?"
            ]
          })
          break
        case 'vocabulary':
          // Check if it's a special vocabulary template
          if (templateId === 'vocabulary') {
            // Standard vocabulary template from vocabulary.template.ts
            // Provide as objects like other templates
            testData.slides.push({
              school: "Language Learning Academy",
              vocabulary: [
                { word: "rojo", meaning: "red - the color of apples and fire" },
                { word: "azul", meaning: "blue - the color of the sky" },
                { word: "verde", meaning: "green - the color of grass" },
                { word: "amarillo", meaning: "yellow - the color of the sun" },
                { word: "negro", meaning: "black - the color of night" }
              ]
            })
          } else {
            // Other vocabulary templates with word/meaning objects
            testData.slides.push({
              school: "Language Learning Academy",
              vocabulary: [
                { word: "rojo", meaning: "red - the color of apples and fire" },
                { word: "azul", meaning: "blue - the color of the sky" },
                { word: "verde", meaning: "green - the color of grass" },
                { word: "amarillo", meaning: "yellow - the color of the sun" },
                { word: "negro", meaning: "black - the color of night" }
              ]
            })
          }
          break
        case 'conversation':
          testData.slides.push({
            school: "Language Learning Academy",
            question: [
              "¿De qué color es tu camisa?",
              "¿Cuál es tu color favorito?",
              "¿Te gusta el color azul?",
              "¿Qué colores hay en tu casa?"
            ]
          })
          break
        case 'review':
          testData.slides.push({
            school: "Language Learning Academy",
            objective: [
              "Learned 5 basic colors in Spanish",
              "Practiced pronunciation of color words",
              "Used colors in simple conversations",
              "Identified colors in everyday objects"
            ]
          })
          break
        case 'reading':
          testData.slides.push({
            school: "Language Learning Academy",
            title: "The Benefits of Regular Exercise",
            passage: "Regular exercise is essential for maintaining a healthy lifestyle. It helps improve cardiovascular health, builds strength, and boosts mental well-being. Just 30 minutes of daily activity can make a significant difference.",
            question: [
              "What are the main benefits of regular exercise mentioned in the passage?",
              "How much daily exercise is recommended?"
            ],
            source: "Health & Wellness Guide, 2024"
          })
          break
        case 'objectives':
          testData.slides.push({
            school: "Language Learning Academy",
            objective: [
              "Learn 5 basic colors in Spanish",
              "Practice pronunciation of color words",
              "Use colors in simple conversations",
              "Identify colors in everyday objects"
            ]
          })
          break
        case 'end':
          testData.slides.push({
            school: "Language Learning Academy"
          })
          break
        default:
          // Check if it's a special template
          if (templateId === 'synonyms-exercise') {
            testData.slides.push({
              school: "Language Learning Academy",
              vocabulary: [
                { word: "happy", synonym: "joyful", synonym2: "cheerful" },
                { word: "big", synonym: "large" },
                { word: "fast", synonym: "quick", synonym2: "rapid" },
                { word: "smart", synonym: "intelligent", synonym2: "clever" },
                { word: "beautiful", synonym: "pretty" }
              ]
            })
          } else if (templateId === 'gap-fill-exercise') {
            testData.slides.push({
              school: "Language Learning Academy",
              vocabulary: [
                { word: "rojo", gapfill: "The apple is _____ (red)" },
                { word: "azul", gapfill: "The sky is _____ (blue)" },
                { word: "verde", gapfill: "The grass is _____ (green)" },
                { word: "amarillo", gapfill: "The sun is _____ (yellow)" },
                { word: "negro", gapfill: "The night is _____ (black)" }
              ]
            })
          } else if (templateId === 'vocabulary-6-items') {
            testData.slides.push({
              school: "Language Learning Academy",
              title: "Spanish Colors",
              subtitle: "Learn basic color vocabulary",
              vocabulary: [
                { word: "rojo", meaning: "red - the color of apples" },
                { word: "azul", meaning: "blue - the color of the sky" },
                { word: "verde", meaning: "green - the color of grass" },
                { word: "amarillo", meaning: "yellow - the color of the sun" },
                { word: "negro", meaning: "black - the color of night" },
                { word: "blanco", meaning: "white - the color of snow" }
              ]
            })
          } else {
            testData.slides.push({
              school: "Language Learning Academy"
            })
          }
      }
    })
    
    return testData
  }
  
  const handleGenerateContent = async () => {
    if (!prompt.trim() || selectedTemplates.length === 0) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      if (useTestMode) {
        // Use test data instead of calling OpenAI
        setTimeout(() => {
          const data = generateTestData()
          setGeneratedData(data)
          
          // Map the generated data to each template
          if (data.slides && Array.isArray(data.slides)) {
            const updatedTemplates = selectedTemplates.map((item, index) => ({
              ...item,
              data: data.slides[index] || {}
            }))
            setSelectedTemplates(updatedTemplates)
            setCurrentStep('review')
          }
          setIsGenerating(false)
        }, 1500) // Simulate API delay
        return
      }
      
      // Check if OpenAI API key is configured
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file or enable test mode.')
      }
      
      const systemPrompt = generateSystemPrompt()
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using the more affordable model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
      
      const content = response.choices[0].message.content
      if (!content) throw new Error('No content generated')
      
      const data = JSON.parse(content)
      setGeneratedData(data)
      
      // Map the generated data to each template
      if (data.slides && Array.isArray(data.slides)) {
        const updatedTemplates = selectedTemplates.map((item, index) => ({
          ...item,
          data: data.slides[index] || {}
        }))
        setSelectedTemplates(updatedTemplates)
        setCurrentStep('review')
      }
    } catch (err) {
      console.error('Error generating content:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate content')
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleCreateSlides = () => {
    selectedTemplates.forEach(({ template, data }) => {
      if (!data) return
      
      // Special handling for synonyms-exercise to use alternate synonyms
      if (template.id === 'synonyms-exercise') {
        // Create modified elements that use synonym2 for duplicate references
        const modifiedElements = template.elements.map((el) => {
          if (el.type === 'text' && el.content && 'text' in el.content) {
            // Remap duplicate synonym references based on y-position to use synonym2
            if (el.y === 426 && el.content.text === '{{vocabulary[0].synonym}}') {
              return { ...el, content: { ...el.content, text: '{{vocabulary[0].synonym2}}' } }
            }
            if (el.y === 470 && el.content.text === '{{vocabulary[2].synonym}}') {
              return { ...el, content: { ...el.content, text: '{{vocabulary[2].synonym2}}' } }
            }
            if (el.y === 518 && el.content.text === '{{vocabulary[3].synonym}}') {
              return { ...el, content: { ...el.content, text: '{{vocabulary[3].synonym2}}' } }
            }
          }
          return el
        })
        
        // Create data keys mapping for modified elements
        const dataKeys: Record<string, string> = {}
        modifiedElements.forEach(el => {
          if (el.type === 'text' && el.content && 'text' in el.content) {
            const matches = el.content.text.matchAll(/\{\{([^}]+)\}\}/g)
            for (const match of matches) {
              if (el.id) {
                dataKeys[el.id] = match[1].trim()
              }
            }
          }
        })
        
        // Populate with modified elements
        const populatedElements = populateTemplate(modifiedElements, dataKeys, data)
        
        // Add the slide
        addSlide({
          id: nanoid(),
          name: template.name,
          category: template.category,
          description: template.description,
          background: template.background,
          elements: populatedElements,
          tags: ['ai-generated', ...(template.tags || [])]
        })
        return
      }
      
      // Create data keys mapping based on template elements
      const dataKeys: Record<string, string> = {}
      
      // Analyze template elements to find placeholders
      template.elements.forEach(el => {
        if (el.type === 'text' && el.content && 'text' in el.content) {
          const matches = el.content.text.matchAll(/\{\{([^}]+)\}\}/g)
          for (const match of matches) {
            if (el.id) {
              dataKeys[el.id] = match[1].trim()
            }
          }
        }
      })
      
      // Populate the template with data
      const populatedElements = populateTemplate(template.elements, dataKeys, data)
      
      // Add the slide
      addSlide({
        id: nanoid(),
        name: template.name,
        category: template.category,
        description: template.description,
        background: template.background,
        elements: populatedElements,
        tags: ['ai-generated', ...(template.tags || [])]
      })
    })
    
    // Reset and close
    setSelectedTemplates([])
    setPrompt('')
    setGeneratedData(null)
    setCurrentStep('select')
    setIsOpen(false)
  }
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-lg"
      >
        <Bot className="w-4 h-4" />
        AI Lesson Builder
      </button>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold">AI Lesson Builder</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-center gap-8">
            <div className={`flex items-center gap-2 ${currentStep === 'select' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'select' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Select Templates</span>
            </div>
            <div className="w-12 h-px bg-gray-300" />
            <div className={`flex items-center gap-2 ${currentStep === 'prompt' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'prompt' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Enter Prompt</span>
            </div>
            <div className="w-12 h-px bg-gray-300" />
            <div className={`flex items-center gap-2 ${currentStep === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'review' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Review & Create</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'select' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Selected Templates ({selectedTemplates.length})</h3>
                {selectedTemplates.length === 0 ? (
                  <p className="text-sm text-gray-500 mb-4">Choose templates below to build your lesson</p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {selectedTemplates.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <span className="text-sm font-medium">{item.template.name}</span>
                          <span className="text-xs text-gray-500 capitalize">({item.template.category})</span>
                        </div>
                        <button
                          onClick={() => handleRemoveTemplate(index)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Available Templates</h3>
                <div className="grid grid-cols-2 gap-3">
                  {templates.filter(t => t.category !== 'blank').map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleAddTemplate(template)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                    >
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{template.category}</p>
                      {template.description && (
                        <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 'prompt' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Describe Your Lesson</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tell the AI what kind of lesson you want to create. Be specific about the topic, language level, and any special requirements.
                </p>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: Create a beginner Spanish lesson about colors and basic greetings. Include vocabulary for 6 colors with engaging definitions, warm-up questions about favorite colors, and conversation practice..."
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-2">Example prompts:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPrompt('Create a beginner Spanish lesson about colors. Include vocabulary for basic colors with simple definitions.')}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      Spanish Colors
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrompt('Design an intermediate English lesson about daily routines. Focus on present simple tense and time expressions.')}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      Daily Routines
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrompt('Create a French lesson for beginners about greetings and introductions. Include formal and informal expressions.')}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      French Greetings
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="testMode"
                    checked={useTestMode}
                    onChange={(e) => setUseTestMode(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="testMode" className="text-sm text-gray-600 cursor-pointer">
                    Use test mode (no API key required)
                  </label>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Templates in Your Lesson:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  {selectedTemplates.map((item, index) => (
                    <li key={index}>
                      {index + 1}. {item.template.name} ({item.template.category})
                    </li>
                  ))}
                </ol>
              </div>
              
              {error && (
                <div className="bg-red-50 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error generating content</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Review Generated Content</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Check the AI-generated content below. You can create the slides or go back to regenerate.
                </p>
              </div>
              
              {generatedData && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Lesson Title: {generatedData.lessonTitle}</h4>
                  </div>
                  
                  {selectedTemplates.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Slide {index + 1}: {item.template.name}</h4>
                        <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                          {item.template.category}
                        </span>
                      </div>
                      <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                        {JSON.stringify(item.data || {}, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (currentStep === 'prompt') setCurrentStep('select')
              else if (currentStep === 'review') setCurrentStep('prompt')
            }}
            disabled={currentStep === 'select' || isGenerating}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            
            {currentStep === 'select' && (
              <button
                onClick={() => setCurrentStep('prompt')}
                disabled={selectedTemplates.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            
            {currentStep === 'prompt' && (
              <button
                onClick={handleGenerateContent}
                disabled={!prompt.trim() || isGenerating}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Content
                  </>
                )}
              </button>
            )}
            
            {currentStep === 'review' && (
              <button
                onClick={handleCreateSlides}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Create Slides
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
