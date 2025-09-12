-- =============================================
-- MINIMAL FIX - Only add what's missing
-- Run this if you're getting policy already exists errors
-- =============================================

-- 1. First, let's check what exists
SELECT 'Checking student_lessons table...' as status;
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'student_lessons'
) AS table_exists;

-- 2. If the table exists but you're getting errors, let's ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_student_lessons_student_id ON student_lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_student_lessons_lesson_id ON student_lessons(lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_lessons_assigned_at ON student_lessons(assigned_at DESC);

-- 3. Create lesson_vocabulary table if it doesn't exist
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

-- 4. Enable RLS on lesson_vocabulary
ALTER TABLE lesson_vocabulary ENABLE ROW LEVEL SECURITY;

-- 5. Create policy for lesson_vocabulary (drop first if exists)
DROP POLICY IF EXISTS "Users can manage their lesson vocabulary" ON lesson_vocabulary;
CREATE POLICY "Users can manage their lesson vocabulary" ON lesson_vocabulary
  FOR ALL USING (
    lesson_id IN (
      SELECT id FROM lessons 
      WHERE user_id = auth.uid()
    )
  );

-- 6. Add missing columns to lessons table
DO $$ 
BEGIN
  -- Add columns only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'lessons' 
                 AND column_name = 'student_profile_id') THEN
    ALTER TABLE lessons ADD COLUMN student_profile_id UUID REFERENCES student_profiles(id);
    RAISE NOTICE 'Added student_profile_id column to lessons table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'lessons' 
                 AND column_name = 'lesson_type') THEN
    ALTER TABLE lessons ADD COLUMN lesson_type TEXT;
    RAISE NOTICE 'Added lesson_type column to lessons table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'lessons' 
                 AND column_name = 'difficulty_level') THEN
    ALTER TABLE lessons ADD COLUMN difficulty_level TEXT;
    RAISE NOTICE 'Added difficulty_level column to lessons table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'lessons' 
                 AND column_name = 'objectives') THEN
    ALTER TABLE lessons ADD COLUMN objectives TEXT[];
    RAISE NOTICE 'Added objectives column to lessons table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'lessons' 
                 AND column_name = 'vocabulary_count') THEN
    ALTER TABLE lessons ADD COLUMN vocabulary_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added vocabulary_count column to lessons table';
  END IF;
END $$;

-- 7. Create indexes for lessons table
CREATE INDEX IF NOT EXISTS idx_lessons_student_profile_id ON lessons(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_lessons_lesson_type ON lessons(lesson_type);

-- 8. Grant permissions
GRANT ALL ON student_lessons TO authenticated;
GRANT ALL ON lesson_vocabulary TO authenticated;

-- 9. Final verification
SELECT 
  'student_lessons' as table_name,
  COUNT(*) as row_count,
  'Ready' as status
FROM student_lessons
UNION ALL
SELECT 
  'lesson_vocabulary' as table_name,
  COUNT(*) as row_count,
  'Ready' as status
FROM lesson_vocabulary;
