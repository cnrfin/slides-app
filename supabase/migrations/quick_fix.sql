-- =============================================
-- QUICK FIX - Run this single query
-- This assumes student_lessons table exists but other things might be missing
-- =============================================

-- Create missing table
CREATE TABLE IF NOT EXISTS lesson_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  translation TEXT,
  category TEXT,
  difficulty_level TEXT,
  context_sentence TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, word)
);

-- Enable RLS
ALTER TABLE lesson_vocabulary ENABLE ROW LEVEL SECURITY;

-- Create policy (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Users can manage their lesson vocabulary" ON lesson_vocabulary;
CREATE POLICY "Users can manage their lesson vocabulary" ON lesson_vocabulary
  FOR ALL USING (lesson_id IN (SELECT id FROM lessons WHERE user_id = auth.uid()));

-- Add missing columns to lessons table (safe - only adds if not exists)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS student_profile_id UUID REFERENCES student_profiles(id);
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS lesson_type TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS difficulty_level TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS objectives TEXT[];
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS vocabulary_count INTEGER DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_lessons_student_id ON student_lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_student_lessons_lesson_id ON student_lessons(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_student_profile_id ON lessons(student_profile_id);

-- Grant permissions
GRANT ALL ON student_lessons TO authenticated;
GRANT ALL ON lesson_vocabulary TO authenticated;

-- Test the setup
SELECT 'Setup complete!' as status,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'student_lessons') as student_lessons_ready,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_vocabulary') as vocabulary_ready;
