-- Vocabulary Tables Migration
-- Run this migration in your Supabase SQL editor

-- 1. Create student_lessons table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- Enable RLS for student_lessons
ALTER TABLE student_lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policy for student_lessons
CREATE POLICY "Users can manage their students' lessons" ON student_lessons
  FOR ALL USING (
    student_id IN (
      SELECT id FROM student_profiles 
      WHERE tutor_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_lessons_student_id ON student_lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_student_lessons_lesson_id ON student_lessons(lesson_id);

-- 2. Create lesson_vocabulary table if it doesn't exist
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

-- Enable RLS for lesson_vocabulary
ALTER TABLE lesson_vocabulary ENABLE ROW LEVEL SECURITY;

-- RLS Policy for lesson_vocabulary
CREATE POLICY "Users can manage their lesson vocabulary" ON lesson_vocabulary
  FOR ALL USING (
    lesson_id IN (
      SELECT id FROM lessons 
      WHERE user_id = auth.uid()
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_lesson_vocabulary_lesson_id ON lesson_vocabulary(lesson_id);

-- 3. Add vocabulary-related columns to lessons table if they don't exist
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS student_profile_id UUID REFERENCES student_profiles(id),
ADD COLUMN IF NOT EXISTS lesson_type TEXT,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT,
ADD COLUMN IF NOT EXISTS objectives TEXT[],
ADD COLUMN IF NOT EXISTS vocabulary_count INTEGER DEFAULT 0;

-- Add index for student profile
CREATE INDEX IF NOT EXISTS idx_lessons_student_profile_id ON lessons(student_profile_id);

-- 4. Add metadata column to slides table if it doesn't exist (for storing template info)
ALTER TABLE slides
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 5. Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_student_lessons_updated_at ON student_lessons;
CREATE TRIGGER update_student_lessons_updated_at 
  BEFORE UPDATE ON student_lessons 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Grant necessary permissions
GRANT ALL ON student_lessons TO authenticated;
GRANT ALL ON lesson_vocabulary TO authenticated;

-- 8. Verify tables were created successfully
SELECT 
  'student_lessons' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'student_lessons') as column_count
FROM student_lessons
UNION ALL
SELECT 
  'lesson_vocabulary' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'lesson_vocabulary') as column_count
FROM lesson_vocabulary;
