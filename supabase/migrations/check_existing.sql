-- =============================================
-- CHECK EXISTING TABLES AND POLICIES
-- Run this first to see what already exists
-- =============================================

-- Check if student_lessons table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'student_lessons'
) AS student_lessons_exists;

-- Check if lesson_vocabulary table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'lesson_vocabulary'
) AS lesson_vocabulary_exists;

-- Check existing columns in lessons table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'lessons'
AND column_name IN ('student_profile_id', 'lesson_type', 'difficulty_level', 'objectives', 'vocabulary_count')
ORDER BY column_name;

-- Check existing policies on student_lessons
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'student_lessons';

-- Check existing policies on lesson_vocabulary
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'lesson_vocabulary';

-- Check existing indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('student_lessons', 'lesson_vocabulary', 'lessons')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
