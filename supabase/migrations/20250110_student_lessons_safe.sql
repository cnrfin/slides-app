-- =============================================
-- SAFE MIGRATION SCRIPT - Checks for existing objects
-- =============================================

-- =============================================
-- STUDENT-LESSON ASSOCIATIONS
-- =============================================

-- Table to link students with their assigned lessons
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

-- Enable RLS (safe to run multiple times)
ALTER TABLE student_lessons ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Users can manage their students' lessons" ON student_lessons;

-- RLS Policy - Users can manage their students' lessons
CREATE POLICY "Users can manage their students' lessons" ON student_lessons
  FOR ALL USING (
    student_id IN (
      SELECT id FROM student_profiles 
      WHERE tutor_id = auth.uid()
    )
  );

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_student_lessons_student_id ON student_lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_student_lessons_lesson_id ON student_lessons(lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_lessons_assigned_at ON student_lessons(assigned_at DESC);

-- =============================================
-- VOCABULARY TRACKING
-- =============================================

-- Table to track vocabulary taught in each lesson
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

-- Enable RLS (safe to run multiple times)
ALTER TABLE lesson_vocabulary ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Users can manage their lesson vocabulary" ON lesson_vocabulary;

-- RLS Policy - Users can manage their lesson vocabulary
CREATE POLICY "Users can manage their lesson vocabulary" ON lesson_vocabulary
  FOR ALL USING (
    lesson_id IN (
      SELECT id FROM lessons 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_lesson_vocabulary_lesson_id ON lesson_vocabulary(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_vocabulary_word ON lesson_vocabulary(word);

-- =============================================
-- UPDATE LESSONS TABLE
-- =============================================

-- Add columns to lessons table if they don't exist
DO $$ 
BEGIN
  -- Add student_profile_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'lessons' 
                 AND column_name = 'student_profile_id') THEN
    ALTER TABLE lessons ADD COLUMN student_profile_id UUID REFERENCES student_profiles(id);
  END IF;
  
  -- Add lesson_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'lessons' 
                 AND column_name = 'lesson_type') THEN
    ALTER TABLE lessons ADD COLUMN lesson_type TEXT;
  END IF;
  
  -- Add difficulty_level if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'lessons' 
                 AND column_name = 'difficulty_level') THEN
    ALTER TABLE lessons ADD COLUMN difficulty_level TEXT;
  END IF;
  
  -- Add objectives if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'lessons' 
                 AND column_name = 'objectives') THEN
    ALTER TABLE lessons ADD COLUMN objectives TEXT[];
  END IF;
  
  -- Add vocabulary_count if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'lessons' 
                 AND column_name = 'vocabulary_count') THEN
    ALTER TABLE lessons ADD COLUMN vocabulary_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add indexes for new columns if they don't exist
CREATE INDEX IF NOT EXISTS idx_lessons_student_profile_id ON lessons(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_lessons_lesson_type ON lessons(lesson_type);

-- =============================================
-- UPDATE TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for student_lessons table (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS update_student_lessons_updated_at ON student_lessons;
CREATE TRIGGER update_student_lessons_updated_at
  BEFORE UPDATE ON student_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant necessary permissions to authenticated users
GRANT ALL ON student_lessons TO authenticated;
GRANT ALL ON lesson_vocabulary TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- VERIFICATION
-- =============================================

-- Check if tables were created successfully
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'student_lessons') THEN
    RAISE NOTICE '✅ student_lessons table exists';
  ELSE
    RAISE WARNING '❌ student_lessons table was not created';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'lesson_vocabulary') THEN
    RAISE NOTICE '✅ lesson_vocabulary table exists';
  ELSE
    RAISE WARNING '❌ lesson_vocabulary table was not created';
  END IF;
END $$;
