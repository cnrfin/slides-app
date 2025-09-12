// src/types/vocabulary-context.types.ts

// Vocabulary context types
export interface VocabularyContext {
  summary: VocabularySummary
  relevant?: RelevantVocabulary
  comprehensive?: ComprehensiveContext
}

export interface VocabularySummary {
  totalWords: number
  proficiencyLevel: string // "A1", "A2", "B1", "B2", "C1", "C2"
  strongCategories: string[]
  recentWords: string[] // Last 5-10 words
  learningVelocity: number // Words per week
}

export interface RelevantVocabulary {
  words: string[]
  purpose: 'review' | 'avoid' | 'build_on' | 'targeted'
  category?: string
}

export interface ComprehensiveContext {
  recentWords: string[]
  categories: Record<string, string[]>
  learningPattern: {
    averagePerWeek: number
    lastActiveDate: string
    totalLessons: number
  }
}

export type SubscriptionPlan = 'free' | 'pro' | 'max'

export interface PlanLimits {
  plan: SubscriptionPlan
  monthlyGenerations: number
  geniusGenerations: number
  vocabularyWordLimit: number
}

export interface PromptIntent {
  type: 'review' | 'new_topic' | 'targeted' | 'build_on' | 'general'
  needsVocabularyContext: boolean
  confidence: number
  topic?: string
}

export interface VocabularyWord {
  word: string
  translation?: string | null
  category?: string | null
  difficulty_level?: string | null
  context_sentence?: string | null
  created_at?: string
  learned_at?: string
}