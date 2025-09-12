-- Migration: Add vocabulary tracking table
-- Date: 2025-01-09
-- Description: Table to track vocabulary taught in each lesson

-- Table to track vocabulary taught in each lesson
CREATE TABLE IF NOT EXISTS lesson_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  translation TEXT,
  category TEXT, -- e.g., 'noun', 'verb', 'adjective'
  difficulty_level TEXT, -- e.g., 'beginner', 'intermediate', 'advanced'
  context_sentence TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, word)
);

-- Enable RLS
ALTER TABLE lesson_vocabulary ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their lesson vocabulary
CREATE POLICY "Users can manage their lesson vocabulary" ON lesson_vocabulary
  FOR ALL USING (
    lesson_id IN (
      SELECT id FROM lessons 
      WHERE user_id = auth.uid()
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_lesson_vocabulary_lesson_id ON lesson_vocabulary(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_vocabulary_word ON lesson_vocabulary(word);
CREATE INDEX IF NOT EXISTS idx_lesson_vocabulary_category ON lesson_vocabulary(category);
