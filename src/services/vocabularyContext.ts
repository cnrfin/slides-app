// src/services/vocabularyContext.ts
import { getStudentVocabularyHistory, getUserProfile, getCurrentMonthUsage } from '@/lib/database'
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans'
import type { 
  VocabularyContext, 
  PromptIntent, 
  VocabularySummary,
  SubscriptionPlan,
  VocabularyWord
} from '@/types/vocabulary-context.types'

/**
 * Analyzes prompt to determine vocabulary context needs
 */
export function analyzePromptIntent(prompt: string): PromptIntent {
  const promptLower = prompt.toLowerCase()
  
  // Pattern matching for different intents
  const patterns = {
    review: /\b(review|practice|reinforce|repeat|quiz|recall|revise|test|assess)\b/i,
    avoid: /\b(don't use|avoid|no previous|new vocab|introduce new|fresh|exclude|without)\b.*\b(vocabulary|words|vocab|learned|taught|previous)\b/i,
    buildOn: /\b(build on|expand|advance|continue|progress|extend|develop|enhance)\b/i,
    specific: /\b(focus on|about|topic:|regarding|concerning|related to)\s+(\w+)/i
  }
  
  // Check for review intent
  if (patterns.review.test(prompt)) {
    return { 
      type: 'review', 
      needsVocabularyContext: true,
      confidence: 0.9 
    }
  }
  
  // Check for avoiding previous vocabulary
  if (patterns.avoid.test(prompt)) {
    return { 
      type: 'new_topic', 
      needsVocabularyContext: true,
      confidence: 0.85 
    }
  }
  
  // Check for building on existing knowledge
  if (patterns.buildOn.test(prompt)) {
    return {
      type: 'build_on',
      needsVocabularyContext: true,
      confidence: 0.8
    }
  }
  
  // Check for specific topic
  const topicMatch = prompt.match(patterns.specific)
  if (topicMatch) {
    return {
      type: 'targeted',
      topic: topicMatch[2],
      needsVocabularyContext: true,
      confidence: 0.75
    }
  }
  
  // Default: general lesson
  return { 
    type: 'general', 
    needsVocabularyContext: false,
    confidence: 0.5 
  }
}

/**
 * Estimates proficiency level based on vocabulary count
 */
function estimateProficiencyLevel(wordCount: number): string {
  if (wordCount < 50) return 'A1'
  if (wordCount < 150) return 'A2'
  if (wordCount < 400) return 'B1'
  if (wordCount < 800) return 'B2'
  if (wordCount < 1500) return 'C1'
  return 'C2'
}

/**
 * Calculates learning velocity (words per week)
 */
function calculateLearningVelocity(vocabulary: VocabularyWord[]): number {
  if (vocabulary.length === 0) return 0
  
  // Get dates from last 4 weeks of vocabulary
  const fourWeeksAgo = new Date()
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
  
  const recentVocab = vocabulary.filter(v => {
    const vocabDate = new Date(v.created_at || v.learned_at || Date.now())
    return vocabDate > fourWeeksAgo
  })
  
  return Math.round(recentVocab.length / 4)
}

/**
 * Extracts categories from vocabulary
 */
function extractCategories(vocabulary: VocabularyWord[]): string[] {
  const categoryCounts = new Map<string, number>()
  
  vocabulary.forEach(v => {
    if (v.category) {
      categoryCounts.set(v.category, (categoryCounts.get(v.category) || 0) + 1)
    }
  })
  
  // Sort categories by count and return top 5
  return Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category]) => category)
}

/**
 * Filters vocabulary by topic relevance
 */
function filterByTopic(vocabulary: VocabularyWord[], topic: string): VocabularyWord[] {
  if (!topic) return vocabulary
  
  const topicLower = topic.toLowerCase()
  
  return vocabulary.filter(v => {
    const word = (v.word || '').toLowerCase()
    const category = (v.category || '').toLowerCase()
    const context = (v.context_sentence || '').toLowerCase()
    
    return word.includes(topicLower) || 
           category.includes(topicLower) || 
           context.includes(topicLower)
  })
}

/**
 * Creates a vocabulary summary
 */
function createVocabularySummary(vocabulary: VocabularyWord[]): VocabularySummary {
  return {
    totalWords: vocabulary.length,
    proficiencyLevel: estimateProficiencyLevel(vocabulary.length),
    strongCategories: extractCategories(vocabulary),
    recentWords: vocabulary.slice(0, 10).map(v => v.word),
    learningVelocity: calculateLearningVelocity(vocabulary)
  }
}

/**
 * Main function to build smart vocabulary context
 */
export async function buildSmartVocabularyContext(
  studentId: string,
  prompt: string,
  userPlan: SubscriptionPlan = 'free',
  isGeniusMode: boolean = false
): Promise<VocabularyContext> {
  console.log('🎯 Building smart vocabulary context:', {
    studentId,
    userPlan,
    isGeniusMode,
    promptLength: prompt.length
  })
  
  // Get plan limits
  const planLimits = SUBSCRIPTION_PLANS[userPlan]
  const maxWords = planLimits.vocabularyWordLimit
  
  // Fetch vocabulary history (get more than we'll use for better selection)
  const vocabulary = await getStudentVocabularyHistory(studentId, 200)
  
  console.log(`📚 Fetched ${vocabulary.length} vocabulary words from history`)
  
  // Create base context with summary
  const context: VocabularyContext = {
    summary: createVocabularySummary(vocabulary)
  }
  
  // If no vocabulary, return just summary
  if (vocabulary.length === 0) {
    console.log('No vocabulary history found, returning summary only')
    return context
  }
  
  // Analyze prompt intent
  const intent = analyzePromptIntent(prompt)
  
  console.log('🔍 Prompt intent analysis:', {
    type: intent.type,
    needsContext: intent.needsVocabularyContext,
    confidence: intent.confidence,
    topic: intent.topic
  })
  
  // Add relevant vocabulary based on intent and plan
  if (intent.needsVocabularyContext && maxWords > 0) {
    switch (intent.type) {
      case 'review':
        // Include recent vocabulary for review
        const reviewWords = vocabulary
          .slice(0, Math.min(maxWords, isGeniusMode ? maxWords * 2 : maxWords))
          .map(v => v.word)
        
        context.relevant = {
          words: reviewWords,
          purpose: 'review'
        }
        
        console.log(`✅ Added ${reviewWords.length} words for review`)
        break
        
      case 'new_topic':
        // Include categories to avoid (not full word list)
        const categories = extractCategories(vocabulary)
        
        context.relevant = {
          words: [], // Don't send words, just categories
          purpose: 'avoid',
          category: categories.join(', ')
        }
        
        console.log(`✅ Added ${categories.length} categories to avoid`)
        break
        
      case 'build_on':
        // Include foundation vocabulary
        const foundationWords = vocabulary
          .slice(0, Math.min(maxWords / 2, 20))
          .map(v => v.word)
        
        context.relevant = {
          words: foundationWords,
          purpose: 'build_on'
        }
        
        console.log(`✅ Added ${foundationWords.length} foundation words`)
        break
        
      case 'targeted':
        // Include topic-specific vocabulary
        const topicVocab = filterByTopic(vocabulary, intent.topic || '')
        const targetedWords = topicVocab
          .slice(0, Math.min(maxWords, 30))
          .map(v => v.word)
        
        context.relevant = {
          words: targetedWords,
          purpose: 'targeted',
          category: intent.topic
        }
        
        console.log(`✅ Added ${targetedWords.length} targeted words for topic: ${intent.topic}`)
        break
    }
  }
  
  // Add comprehensive context for genius mode (if plan allows)
  if (isGeniusMode && planLimits.geniusGenerations > 0) {
    const categories: Record<string, string[]> = {}
    
    // Group vocabulary by category
    vocabulary.forEach(v => {
      const cat = v.category || 'general'
      if (!categories[cat]) categories[cat] = []
      if (categories[cat].length < 10) {
        categories[cat].push(v.word)
      }
    })
    
    context.comprehensive = {
      recentWords: vocabulary.slice(0, 50).map(v => v.word),
      categories,
      learningPattern: {
        averagePerWeek: calculateLearningVelocity(vocabulary),
        lastActiveDate: vocabulary[0]?.created_at || new Date().toISOString(),
        totalLessons: Math.floor(vocabulary.length / 5) // Estimate
      }
    }
    
    console.log('✨ Added comprehensive context for genius mode')
  }
  
  return context
}

/**
 * Formats vocabulary context for the AI prompt
 */
export function formatVocabularyContext(context: VocabularyContext): string {
  let formatted = ''
  
  // Always include summary
  formatted += `\nStudent Vocabulary Profile:`
  formatted += `\n- Total words learned: ${context.summary.totalWords}`
  formatted += `\n- Proficiency level: ${context.summary.proficiencyLevel}`
  
  if (context.summary.strongCategories.length > 0) {
    formatted += `\n- Strong categories: ${context.summary.strongCategories.join(', ')}`
  }
  
  if (context.summary.recentWords.length > 0) {
    formatted += `\n- Recent vocabulary (last 10): ${context.summary.recentWords.join(', ')}`
  }
  
  if (context.summary.learningVelocity > 0) {
    formatted += `\n- Learning pace: ${context.summary.learningVelocity} words/week`
  }
  
  // Add relevant vocabulary if present
  if (context.relevant) {
    switch (context.relevant.purpose) {
      case 'review':
        formatted += `\n\nVocabulary to review (${context.relevant.words.length} words):`
        formatted += `\n${context.relevant.words.join(', ')}`
        formatted += `\n\nIMPORTANT: Focus on reviewing and reinforcing these previously learned words.`
        break
        
      case 'avoid':
        formatted += `\n\nIMPORTANT: Student has already learned vocabulary in these categories: ${context.relevant.category}`
        formatted += `\nPlease use completely NEW vocabulary not in these categories.`
        break
        
      case 'build_on':
        formatted += `\n\nFoundation vocabulary to build upon:`
        formatted += `\n${context.relevant.words.join(', ')}`
        formatted += `\nExpand on these concepts with more advanced vocabulary.`
        break
        
      case 'targeted':
        if (context.relevant.category) {
          formatted += `\n\nRelevant ${context.relevant.category} vocabulary already known:`
        } else {
          formatted += `\n\nRelevant vocabulary already known:`
        }
        formatted += `\n${context.relevant.words.join(', ')}`
        formatted += `\n\nConsider this existing knowledge when creating new content.`
        break
    }
  }
  
  // Add comprehensive context if present (genius mode)
  if (context.comprehensive) {
    formatted += `\n\nDetailed Learning Analysis:`
    formatted += `\n- Learning pattern: ${context.comprehensive.learningPattern.averagePerWeek} words/week`
    formatted += `\n- Total lessons completed: ${context.comprehensive.learningPattern.totalLessons}`
    formatted += `\n- Last active: ${new Date(context.comprehensive.learningPattern.lastActiveDate).toLocaleDateString()}`
    
    if (Object.keys(context.comprehensive.categories).length > 0) {
      formatted += `\n- Vocabulary by category:`
      Object.entries(context.comprehensive.categories).forEach(([cat, words]) => {
        formatted += `\n  • ${cat}: ${words.slice(0, 5).join(', ')}${words.length > 5 ? '...' : ''}`
      })
    }
  }
  
  return formatted
}

/**
 * Calculates token estimate for vocabulary context
 */
export function estimateContextTokens(context: VocabularyContext): number {
  // Rough estimation: 1 token per 4 characters
  const formatted = formatVocabularyContext(context)
  return Math.ceil(formatted.length / 4)
}

/**
 * Validates if generation is allowed based on usage limits
 */
export async function validateGenerationLimits(
  userId: string,
  userPlan: SubscriptionPlan,
  isGeniusMode: boolean
): Promise<{ allowed: boolean; reason?: string }> {
  const planLimits = SUBSCRIPTION_PLANS[userPlan]
  const currentUsage = await getCurrentMonthUsage(userId)
  
  const regularUsed = currentUsage.lessons_generated || 0
  const geniusUsed = currentUsage.genius_generations || 0
  
  if (isGeniusMode) {
    if (planLimits.geniusGenerations === 0) {
      return { 
        allowed: false, 
        reason: 'Genius mode is not available on the Free plan. Please upgrade to Pro or Max.' 
      }
    }
    if (planLimits.geniusGenerations > 0 && geniusUsed >= planLimits.geniusGenerations) {
      return { 
        allowed: false, 
        reason: `You've reached your monthly limit of ${planLimits.geniusGenerations} Genius generations. Please upgrade or wait for next month.` 
      }
    }
  } else {
    if (planLimits.monthlyGenerations > 0 && regularUsed >= planLimits.monthlyGenerations) {
      return { 
        allowed: false, 
        reason: `You've reached your monthly limit of ${planLimits.monthlyGenerations} generations. Please upgrade to continue.` 
      }
    }
  }
  
  return { allowed: true }
}
