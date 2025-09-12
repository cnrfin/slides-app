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

-- Enable RLS
ALTER TABLE student_lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Users can manage their students' lessons
CREATE POLICY "Users can manage their students' lessons" ON student_lessons
  FOR ALL USING (
    student_id IN (
      SELECT id FROM student_profiles 
      WHERE tutor_id = auth.uid()
    )
  );

-- Create indexes for performance
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

-- Enable RLS
ALTER TABLE lesson_vocabulary ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Users can manage their lesson vocabulary
CREATE POLICY "Users can manage their lesson vocabulary" ON lesson_vocabulary
  FOR ALL USING (
    lesson_id IN (
      SELECT id FROM lessons 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_vocabulary_lesson_id ON lesson_vocabulary(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_vocabulary_word ON lesson_vocabulary(word);

-- =============================================
-- UPDATE LESSONS TABLE
-- =============================================

-- Add columns to lessons table if they don't exist
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS student_profile_id UUID REFERENCES student_profiles(id),
ADD COLUMN IF NOT EXISTS lesson_type TEXT,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT,
ADD COLUMN IF NOT EXISTS objectives TEXT[],
ADD COLUMN IF NOT EXISTS vocabulary_count INTEGER DEFAULT 0;

-- Add indexes for new columns
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

-- Create trigger for student_lessons table
DROP TRIGGER IF EXISTS update_student_lessons_updated_at ON student_lessons;
CREATE TRIGGER update_student_lessons_updated_at
  BEFORE UPDATE ON student_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- You can uncomment this section to create sample data for testing
/*
-- Sample student-lesson association
INSERT INTO student_lessons (student_id, lesson_id, progress, notes)
SELECT 
  sp.id,
  l.id,
  0,
  'Initial assignment'
FROM student_profiles sp
CROSS JOIN lessons l
WHERE sp.tutor_id = auth.uid()
  AND l.user_id = auth.uid()
LIMIT 1
ON CONFLICT (student_id, lesson_id) DO NOTHING;
*/

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant necessary permissions to authenticated users
GRANT ALL ON student_lessons TO authenticated;
GRANT ALL ON lesson_vocabulary TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
