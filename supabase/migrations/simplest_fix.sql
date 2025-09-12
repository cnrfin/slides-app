-- =============================================
-- SIMPLEST POSSIBLE FIX
-- Run this to add only what's absolutely necessary
-- =============================================

-- Just add the missing columns to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS lesson_type TEXT,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT,
ADD COLUMN IF NOT EXISTS vocabulary_count INTEGER DEFAULT 0;

-- Grant permissions (in case they're missing)
GRANT SELECT, INSERT, UPDATE, DELETE ON student_lessons TO authenticated;
GRANT SELECT ON lessons TO authenticated;
GRANT SELECT ON student_profiles TO authenticated;

-- That's it! Test if it works now
SELECT 'Minimal fix applied' as status;
