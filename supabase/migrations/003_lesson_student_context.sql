-- Migration: Update Lessons Table with Student Context
-- Purpose: Add fields to track student-specific lesson metadata

-- Add student context columns to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS student_profile_id UUID REFERENCES student_profiles(id),
ADD COLUMN IF NOT EXISTS lesson_type TEXT, -- e.g., 'vocabulary', 'grammar', 'conversation'
ADD COLUMN IF NOT EXISTS difficulty_level TEXT, -- e.g., 'beginner', 'intermediate', 'advanced'
ADD COLUMN IF NOT EXISTS objectives TEXT[], -- Array of lesson objectives
ADD COLUMN IF NOT EXISTS vocabulary_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_student_profile_id ON lessons(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_lessons_lesson_type ON lessons(lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty_level ON lessons(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_lessons_tags ON lessons USING GIN(tags);

-- Add function to get lessons with vocabulary count
CREATE OR REPLACE FUNCTION get_lesson_with_vocabulary_count(p_lesson_id UUID)
RETURNS TABLE (
  lesson_id UUID,
  title TEXT,
  description TEXT,
  lesson_type TEXT,
  difficulty_level TEXT,
  actual_vocabulary_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id as lesson_id,
    l.title,
    l.description,
    l.lesson_type,
    l.difficulty_level,
    COUNT(DISTINCT lv.word) as actual_vocabulary_count
  FROM lessons l
  LEFT JOIN lesson_vocabulary lv ON lv.lesson_id = l.id
  WHERE l.id = p_lesson_id
  GROUP BY l.id, l.title, l.description, l.lesson_type, l.difficulty_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update vocabulary count trigger
CREATE OR REPLACE FUNCTION update_lesson_vocabulary_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    UPDATE lessons
    SET vocabulary_count = (
      SELECT COUNT(DISTINCT word)
      FROM lesson_vocabulary
      WHERE lesson_id = COALESCE(NEW.lesson_id, OLD.lesson_id)
    )
    WHERE id = COALESCE(NEW.lesson_id, OLD.lesson_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update vocabulary count
DROP TRIGGER IF EXISTS update_vocabulary_count_trigger ON lesson_vocabulary;
CREATE TRIGGER update_vocabulary_count_trigger
AFTER INSERT OR DELETE ON lesson_vocabulary
FOR EACH ROW EXECUTE FUNCTION update_lesson_vocabulary_count();