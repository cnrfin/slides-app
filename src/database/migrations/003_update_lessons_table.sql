-- Migration: Update lessons table with student context
-- Date: 2025-01-09
-- Description: Add student profile association and metadata to lessons table

-- Add student context to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS student_profile_id UUID REFERENCES student_profiles(id),
ADD COLUMN IF NOT EXISTS lesson_type TEXT, -- e.g., 'vocabulary', 'grammar', 'conversation'
ADD COLUMN IF NOT EXISTS difficulty_level TEXT,
ADD COLUMN IF NOT EXISTS objectives TEXT[],
ADD COLUMN IF NOT EXISTS vocabulary_count INTEGER DEFAULT 0;

-- Add index for student profile
CREATE INDEX IF NOT EXISTS idx_lessons_student_profile_id ON lessons(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_lessons_lesson_type ON lessons(lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty_level ON lessons(difficulty_level);

-- Add comment for documentation
COMMENT ON COLUMN lessons.student_profile_id IS 'Links lesson to a specific student profile for personalized learning';
COMMENT ON COLUMN lessons.lesson_type IS 'Type of lesson: vocabulary, grammar, conversation, etc.';
COMMENT ON COLUMN lessons.difficulty_level IS 'Difficulty level of the lesson';
COMMENT ON COLUMN lessons.objectives IS 'Learning objectives for this lesson';
COMMENT ON COLUMN lessons.vocabulary_count IS 'Count of vocabulary items in this lesson';
