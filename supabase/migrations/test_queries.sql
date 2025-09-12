-- =============================================
-- TEST QUERIES - Run these to verify everything works
-- =============================================

-- 1. Test if student_lessons table is accessible
SELECT 'Testing student_lessons table access...' as test;
SELECT COUNT(*) as total_assignments FROM student_lessons;

-- 2. Test joining student_lessons with lessons
SELECT 'Testing join with lessons table...' as test;
SELECT 
  sl.id,
  sl.student_id,
  sl.lesson_id,
  sl.assigned_at,
  sl.progress,
  l.title as lesson_title,
  l.description as lesson_description
FROM student_lessons sl
LEFT JOIN lessons l ON sl.lesson_id = l.id
LIMIT 5;

-- 3. Test the RLS policy (this should only show lessons for students you own)
SELECT 'Testing RLS policy...' as test;
SELECT 
  sp.name as student_name,
  COUNT(sl.id) as assigned_lessons
FROM student_profiles sp
LEFT JOIN student_lessons sl ON sp.id = sl.student_id
WHERE sp.tutor_id = auth.uid()
GROUP BY sp.id, sp.name;

-- 4. Test if lesson_vocabulary table exists and is accessible
SELECT 'Testing lesson_vocabulary table...' as test;
SELECT COUNT(*) as total_vocabulary FROM lesson_vocabulary;

-- 5. Check if the lessons table has the new columns
SELECT 'Checking lessons table columns...' as test;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'lessons'
  AND column_name IN ('student_profile_id', 'lesson_type', 'difficulty_level', 'objectives', 'vocabulary_count')
ORDER BY column_name;

-- 6. Final summary
SELECT 'SUMMARY' as status;
SELECT 
  'Tables Ready' as status,
  (SELECT COUNT(*) FROM student_profiles WHERE tutor_id = auth.uid()) as your_students,
  (SELECT COUNT(*) FROM lessons WHERE user_id = auth.uid()) as your_lessons,
  (SELECT COUNT(*) FROM student_lessons WHERE student_id IN (SELECT id FROM student_profiles WHERE tutor_id = auth.uid())) as assignments;
