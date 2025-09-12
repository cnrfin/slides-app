-- Migration: Add Vocabulary Tracking Table
-- Purpose: Track vocabulary taught in each lesson for better AI context

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

-- Add function to get vocabulary for a student's completed lessons
CREATE OR REPLACE FUNCTION get_student_vocabulary_history(p_student_id UUID, p_limit INT DEFAULT 100)
RETURNS TABLE (
  word TEXT,
  translation TEXT,
  category TEXT,
  difficulty_level TEXT,
  context_sentence TEXT,
  lesson_id UUID,
  learned_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (lv.word)
    lv.word,
    lv.translation,
    lv.category,
    lv.difficulty_level,
    lv.context_sentence,
    lv.lesson_id,
    sl.completed_at as learned_at
  FROM lesson_vocabulary lv
  JOIN student_lessons sl ON sl.lesson_id = lv.lesson_id
  WHERE sl.student_id = p_student_id
    AND sl.completed_at IS NOT NULL
  ORDER BY lv.word, sl.completed_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;