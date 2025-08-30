import React from 'react'
import { Sparkles, BookOpen, MessageSquare, Target, PenTool } from 'lucide-react'
import type { SlideStructurePreset } from './types'

interface PresetStructuresProps {
  onSelectPreset: (preset: SlideStructurePreset) => void
  disabled?: boolean
}

export const PresetStructures: React.FC<PresetStructuresProps> = ({
  onSelectPreset,
  disabled = false
}) => {
  const presets: SlideStructurePreset[] = [
    {
      id: 'basic-lesson',
      name: 'Basic Lesson',
      description: 'Title, objectives, vocabulary, practice, review',
      icon: <BookOpen size={18} />,
      slides: [
        { templateId: 'title-slide', count: 1 },
        { templateId: 'objectives', count: 1 },
        { templateId: 'vocabulary-intro', count: 2 },
        { templateId: 'fill-in-blanks', count: 1 },
        { templateId: 'review-exercise', count: 1 }
      ]
    },
    {
      id: 'conversation-focus',
      name: 'Conversation Focus',
      description: 'Warm-up, dialogue, role-play, discussion',
      icon: <MessageSquare size={18} />,
      slides: [
        { templateId: 'warm-up-questions', count: 1 },
        { templateId: 'conversation-practice', count: 2 },
        { templateId: 'dialogue-completion', count: 1 },
        { templateId: 'discussion-topics', count: 1 }
      ]
    },
    {
      id: 'vocabulary-intensive',
      name: 'Vocabulary Intensive',
      description: 'Multiple vocabulary activities and exercises',
      icon: <Target size={18} />,
      slides: [
        { templateId: 'vocabulary-intro', count: 3 },
        { templateId: 'synonyms-exercise', count: 1 },
        { templateId: 'vocabulary-matching', count: 1 },
        { templateId: 'fill-in-blanks', count: 2 }
      ]
    },
    {
      id: 'reading-comprehension',
      name: 'Reading & Comprehension',
      description: 'Reading passage with comprehension activities',
      icon: <PenTool size={18} />,
      slides: [
        { templateId: 'reading-passage', count: 1 },
        { templateId: 'comprehension-questions', count: 2 },
        { templateId: 'vocabulary-from-text', count: 1 },
        { templateId: 'discussion-topics', count: 1 }
      ]
    },
    {
      id: 'quick-review',
      name: 'Quick Review',
      description: 'Short review session with key points',
      icon: <Sparkles size={18} />,
      slides: [
        { templateId: 'review-exercise', count: 2 },
        { templateId: 'qa-slide', count: 1 },
        { templateId: 'homework', count: 1 }
      ]
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {presets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelectPreset(preset)}
          disabled={disabled}
          className={`p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="p-1.5 bg-gray-100 rounded group-hover:bg-blue-100 transition-colors">
              <div className="text-gray-600 group-hover:text-blue-600">
                {preset.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                {preset.name}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {preset.description}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {preset.slides.map((slide, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    {slide.count}x
                  </span>
                ))}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
