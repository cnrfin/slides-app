// src/services/lessonGeneration.ts
import { openai } from '@/lib/openai'
import type { SlideTemplate } from '@/types/template.types'
import { getCurrentUser, trackLessonGeneration, getUserProfile, getCurrentMonthUsage } from '@/lib/database'
import type { FileUpload } from '@/utils/fileUtils'
import { buildSmartVocabularyContext, formatVocabularyContext, validateGenerationLimits } from './vocabularyContext'
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans'
import { supabase } from '@/lib/supabase'

export interface StudentProfile {
  id: string
  name: string
  target_language?: string
  native_language?: string
  level?: string
  goals?: string[]
  interests?: string
}

export interface Lesson {
  id: string
  title: string
  description: string
  vocabulary?: string[]
  grammarPoints?: string[]
  topics?: string[]
  date?: string
}

export interface SlideTemplateInfo {
  id: string
  name: string
  category: string
  order?: number
}

export interface GenerationRequest {
  prompt: string
  selectedTemplates: SlideTemplate[]
  selectedProfile?: StudentProfile | null
  selectedLesson?: Lesson | null
  isGeniusMode?: boolean
  uploadedFile?: FileUpload | null
  studentVocabularyHistory?: string[] | null // All vocabulary the student has learned
}

export interface GenerationResponse {
  lessonTitle: string
  slides: any[]
  vocabulary?: Array<{ word: string; meaning?: string; translation?: string }>
}

// Template data structure examples for OpenAI
const templateDataStructures: Record<string, any> = {
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
  }
}

const generateSystemPrompt = (selectedTemplates: SlideTemplate[], geniusMode: boolean) => {
  const templateInfo = selectedTemplates.map((template, index) => {
    const category = template.category
    // Check if it's a special template that needs a different structure
    const specialStructure = specialTemplateStructures[template.id]
    const structure = specialStructure || templateDataStructures[category] || {}
    
    return `
Slide ${index + 1}: ${template.name} (${category} type, template id: ${template.id})
Expected data structure:
${JSON.stringify(structure, null, 2)}
`
  }).join('\n')
  
  const basePrompt = `You are a language learning curriculum designer. Generate JSON data for a language lesson based on the user's prompt.

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
- For standard vocabulary template: vocabulary should be an array of objects with 'word' and 'meaning' properties
- For question arrays, provide exactly 4 questions unless otherwise specified
- For reading slides, provide exactly 2 comprehension questions
- Keep reading passages concise (2-3 sentences) to fit in the template
- Keep content appropriate for language learning
- Make content engaging and educational
- If a school name is needed, use "Language Learning Academy" as default
- Ensure all text is clear and concise

Vocabulary Management:
- Pay special attention to any instructions about vocabulary usage in the user's prompt and the student's vocabulary profile
- The student's vocabulary context will be provided - use it intelligently
- Consider the student's proficiency level and learning pace when selecting vocabulary`
  
  // Add advanced reasoning instructions for genius mode
  if (geniusMode) {
    return basePrompt + `

ADVANCED REASONING MODE ACTIVATED:
- Think step-by-step about the educational objectives
- Consider the pedagogical progression across slides
- Ensure vocabulary difficulty is appropriately scaffolded
- Create connections between different slide contents
- Include more sophisticated language patterns and structures
- Add cultural context where relevant
- Consider different learning styles (visual, auditory, kinesthetic)
- Make questions thought-provoking and discussion-worthy
- Ensure content builds upon previous concepts systematically
- Use more creative and engaging examples
- Consider real-world applications of the language concepts
- Leverage the comprehensive vocabulary analysis provided

The user's language learning topic/prompt is below.`
  }
  
  return basePrompt + `\n\nThe user's language learning topic/prompt is below.`
}

// Helper function to update genius usage
async function updateGeniusUsage(userId: string) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  try {
    // First, get current usage
    const { data: currentUsage } = await supabase
      .from('usage_tracking')
      .select('genius_generations')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single()
    
    const newCount = (currentUsage?.genius_generations || 0) + 1
    
    // Upsert the updated count
    const { error } = await supabase
      .from('usage_tracking')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        genius_generations: newCount
      }, {
        onConflict: 'user_id,month_year'
      })
    
    if (error) {
      console.error('Error updating genius usage:', error)
    } else {
      console.log(`✅ Updated genius usage to ${newCount} for month ${currentMonth}`)
    }
  } catch (error) {
    console.error('Failed to update genius usage:', error)
  }
}

export async function generateLesson(request: GenerationRequest): Promise<GenerationResponse> {
  const startTime = Date.now()
  
  // Check if OpenAI API key is configured
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.')
  }
  
  // Get user and check usage limits
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')
  
  // Get user's subscription plan (default to 'free' if not set)
  const profile = await getUserProfile(user.id)
  const userPlan = profile?.subscription_plan || 'free'
  
  console.log('🎯 User plan:', userPlan, 'Genius mode:', request.isGeniusMode)
  
  // Validate usage limits
  const validation = await validateGenerationLimits(user.id, userPlan, request.isGeniusMode || false)
  if (!validation.allowed) {
    throw new Error(validation.reason)
  }
  
  // Build smart vocabulary context
  let vocabularyContextString = ''
  if (request.selectedProfile?.id) {
    try {
      const vocabularyContext = await buildSmartVocabularyContext(
        request.selectedProfile.id,
        request.prompt,
        userPlan,
        request.isGeniusMode || false
      )
      
      vocabularyContextString = formatVocabularyContext(vocabularyContext)
      
      console.log(`📚 Smart vocabulary context built:`, {
        totalWords: vocabularyContext.summary.totalWords,
        contextType: vocabularyContext.relevant?.purpose || 'summary_only',
        wordsIncluded: vocabularyContext.relevant?.words.length || 0,
        plan: userPlan,
        isGenius: request.isGeniusMode
      })
    } catch (error) {
      console.error('Failed to build vocabulary context:', error)
      // Continue without vocabulary context rather than failing
    }
  }
  
  // Build the complete prompt with additional context
  let fullPrompt = request.prompt
  
  // Add uploaded file content if provided
  if (request.uploadedFile?.content) {
    fullPrompt += `\n\nSource Article Content:
"""\n${request.uploadedFile.content}\n"""

Please create lesson content based on the above article. Extract key vocabulary, themes, and concepts from the article to build educational slides that help students understand and engage with this material.`
  }
  
  // Add student profile context if selected
  if (request.selectedProfile) {
    fullPrompt += `\n\nStudent Profile:
- Name: ${request.selectedProfile.name}
- Target Language: ${request.selectedProfile.target_language || 'Not specified'}
- Native Language: ${request.selectedProfile.native_language || 'Not specified'}
- Level: ${request.selectedProfile.level || 'Not specified'}
- Goals: ${request.selectedProfile.goals?.join(', ') || 'Not specified'}
- Interests: ${request.selectedProfile.interests || 'Not specified'}`
    
    // Add smart vocabulary context
    fullPrompt += vocabularyContextString
    
    fullPrompt += `\n\nPlease tailor the content appropriately for this student's background and language learning needs.`
  }
  
  // Add lesson context if selected
  if (request.selectedLesson) {
    fullPrompt += `\n\nPrevious Lesson Context:
- Title: ${request.selectedLesson.title}
- Description: ${request.selectedLesson.description}
- Vocabulary covered: ${request.selectedLesson.vocabulary?.join(', ') || 'None'}
- Grammar points: ${request.selectedLesson.grammarPoints?.join(', ') || 'None'}
- Topics: ${request.selectedLesson.topics?.join(', ') || 'None'}
Please build upon or reference this previous lesson content where appropriate.`
  }
  
  const systemPrompt = generateSystemPrompt(request.selectedTemplates, request.isGeniusMode || false)
  
  // Use gpt-5-mini for both modes (genius mode uses different prompting strategy)
  const model = 'gpt-5-mini'
  
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: fullPrompt }
    ],
    temperature: 1, // GPT-5-mini only supports default temperature of 1
    response_format: { type: 'json_object' }
  })
  
  const content = response.choices[0].message.content
  if (!content) throw new Error('No content generated')
  
  const data = JSON.parse(content) as GenerationResponse
  
  // Extract vocabulary from the generated slides
  const extractedVocabulary: Array<{ word: string; meaning?: string; translation?: string }> = []
  
  // Look through all slides for vocabulary data
  if (data.slides && Array.isArray(data.slides)) {
    data.slides.forEach(slide => {
      // Check for vocabulary array in slide data
      if (slide.vocabulary && Array.isArray(slide.vocabulary)) {
        slide.vocabulary.forEach((item: any) => {
          if (typeof item === 'string') {
            // Simple string vocabulary
            extractedVocabulary.push({ word: item })
          } else if (item && typeof item === 'object') {
            // Object with word and meaning/translation
            extractedVocabulary.push({
              word: item.word || item.term || item.vocab || '',
              meaning: item.meaning || item.definition || item.translation || ''
            })
          }
        })
      }
      
      // Also check for words in other formats (e.g., in questions or passages)
      if (slide.words && Array.isArray(slide.words)) {
        slide.words.forEach((word: any) => {
          if (typeof word === 'string') {
            extractedVocabulary.push({ word })
          } else if (word && typeof word === 'object') {
            extractedVocabulary.push({
              word: word.word || word.term || '',
              meaning: word.meaning || word.definition || ''
            })
          }
        })
      }
    })
  }
  
  // Remove duplicates based on word
  const uniqueVocabulary = Array.from(
    new Map(extractedVocabulary.map(item => [item.word.toLowerCase(), item])).values()
  )
  
  // Add extracted vocabulary to the response
  data.vocabulary = uniqueVocabulary
  
  console.log(`📚 Extracted ${uniqueVocabulary.length} vocabulary words from generated content`)
  
  // Track the lesson generation in the database
  try {
    const generationTimeMs = Date.now() - startTime
    
    await trackLessonGeneration(user.id, {
      studentProfileId: request.selectedProfile?.id || null,
      promptText: request.prompt,
      geniusModeUsed: request.isGeniusMode || false,
      slidesGenerated: request.selectedTemplates.length,
      templateTypesUsed: [...new Set(request.selectedTemplates.map(t => t.category))], // Unique categories
      templateOrder: request.selectedTemplates.map(t => t.id), // Template IDs in order
      modelUsed: model,
      generationTimeMs,
    })
    console.log('✅ Tracked lesson generation in prompt_history')
    
    // Update genius usage tracking if genius mode was used
    if (request.isGeniusMode) {
      await updateGeniusUsage(user.id)
    }
  } catch (error) {
    console.error('Failed to track lesson generation:', error)
    // Don't throw - we still want to return the generated data even if tracking fails
  }
  
  return data as GenerationResponse
}
