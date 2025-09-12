import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for development
})

interface StudentProfile {
  name: string
  target_language: string
  native_language?: string | null
  level: string
  goals: string[]
  interests?: string | null
}

interface VocabularyItem {
  word: string
  translation?: string
  category?: string
  difficulty_level?: string
}

export async function generateLessonWithContext(
  prompt: string,
  studentProfile: StudentProfile,
  vocabularyHistory: VocabularyItem[],
  geniusMode: boolean = false
) {
  // Build context from student profile and vocabulary history
  const contextPrompt = `
You are an expert language tutor creating a personalized lesson.

Student Profile:
- Name: ${studentProfile.name}
- Target Language: ${studentProfile.target_language}
- Native Language: ${studentProfile.native_language || 'Unknown'}
- Level: ${studentProfile.level}
- Goals: ${studentProfile.goals.join(', ')}
- Interests: ${studentProfile.interests || 'Not specified'}

${vocabularyHistory.length > 0 ? `Previously Learned Vocabulary (last ${Math.min(50, vocabularyHistory.length)} words):
${vocabularyHistory.slice(0, 50).map(v => `- ${v.word}${v.translation ? `: ${v.translation}` : ''}`).join('\n')}

Instructions:
- Build upon previously learned vocabulary when appropriate
- Introduce new vocabulary that complements what the student already knows
- Ensure difficulty matches the student's level
- Incorporate the student's interests where possible` : 'This is the student\'s first lesson, so introduce foundational vocabulary.'}

User Request: ${prompt}

Create a comprehensive lesson plan that includes:
1. Clear learning objectives
2. Vocabulary introduction with translations
3. Grammar points if applicable
4. Practice exercises
5. Interactive activities
6. Review section

Format the response in a structured way that can be easily parsed into slides.`
  
  try {
    const response = await openai.chat.completions.create({
      model: geniusMode ? 'gpt-4' : 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert language tutor specializing in creating engaging, personalized lessons. You understand different learning styles and can adapt content to match student interests and goals.'
        },
        {
          role: 'user',
          content: contextPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
    
    return response.choices[0].message.content
  } catch (error) {
    console.error('Error generating lesson with context:', error)
    throw error
  }
}

export async function enhancePromptWithStudentContext(
  originalPrompt: string,
  studentProfile?: StudentProfile
): string {
  if (!studentProfile) return originalPrompt
  
  return `Create a lesson for ${studentProfile.name} who is learning ${studentProfile.target_language} at ${studentProfile.level} level.
Their goals are: ${studentProfile.goals.join(', ')}.
${studentProfile.interests ? `They are interested in: ${studentProfile.interests}.` : ''}

Original request: ${originalPrompt}`
}