// src/data/templates/index.ts
import { BlankTemplate } from './blank.template'
import { ConversationQuestionsTemplate } from './conversation-questions.template'
import { EndingTemplate } from './ending.template'
import { GapFillExerciseTemplate } from './gap-fill-exercise.template'
import { LessonOverviewTemplate } from './lesson-overview.template'
import { LessonReviewTemplate } from './lesson-review.template'
import { MakeaSentenceTemplate } from './make-a-sentence.template'
import { ReadandDiscussTemplate } from './read-and-discuss.template'
import { ReadingExerciseTemplate } from './reading-exercise.template'
import { SynonymsExerciseTemplate } from './synonyms-exercise.template'
import { TitleTemplate } from './title.template'
import { UsefulPhrasesTemplate } from './useful-phrases.template'
import { VocabularyTemplate } from './vocabulary.template'
import { WarmUpQuestionsTemplate } from './warm-up-questions.template'
import type { SlideTemplate, TemplateGroup } from '@/types/template.types'

// Combine all templates
export const allTemplates: SlideTemplate[] = [
  BlankTemplate,
  ConversationQuestionsTemplate,
  EndingTemplate,
  GapFillExerciseTemplate,
  LessonOverviewTemplate,
  LessonReviewTemplate,
  MakeaSentenceTemplate,
  ReadandDiscussTemplate,
  ReadingExerciseTemplate,
  SynonymsExerciseTemplate,
  TitleTemplate,
  UsefulPhrasesTemplate,
  VocabularyTemplate,
  WarmUpQuestionsTemplate
]

// Group templates by category
export const templateGroups: TemplateGroup[] = [
  {
    category: 'blank',
    name: 'Blank',
    templates: [BlankTemplate]
  },
  {
    category: 'title',
    name: 'Title',
    templates: [TitleTemplate]
  },
  {
    category: 'warm-up',
    name: 'Warm Up',
    templates: [WarmUpQuestionsTemplate]
  },
  {
    category: 'objectives',
    name: 'Objectives',
    templates: [LessonOverviewTemplate]
  },
  {
    category: 'content',
    name: 'Content',
    templates: []
  },
  {
    category: 'vocabulary',
    name: 'Vocabulary',
    templates: [VocabularyTemplate, GapFillExerciseTemplate, SynonymsExerciseTemplate, MakeaSentenceTemplate, UsefulPhrasesTemplate]
  },
  {
    category: 'conversation',
    name: 'Conversation',
    templates: [ConversationQuestionsTemplate]
  },
  {
    category: 'reading',
    name: 'Reading',
    templates: [ReadandDiscussTemplate, ReadingExerciseTemplate]
  },
  {
    category: 'exercise',
    name: 'Exercise',
    templates: []
  },
  {
    category: 'review',
    name: 'Review',
    templates: [LessonReviewTemplate]
  },
  {
    category: 'end',
    name: 'End',
    templates: [EndingTemplate]
  }
]

// Get template by ID
export const getTemplateById = (id: string): SlideTemplate | undefined => {
  return allTemplates.find(t => t.id === id)
}

// Get templates by category
export const getTemplatesByCategory = (category: string): SlideTemplate[] => {
  return allTemplates.filter(t => t.category === category)
}

// Search templates
export const searchTemplates = (query: string): SlideTemplate[] => {
  const lowerQuery = query.toLowerCase()
  return allTemplates.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description?.toLowerCase().includes(lowerQuery) ||
    t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}
