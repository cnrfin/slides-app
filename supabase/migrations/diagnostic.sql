-- =============================================
-- DIAGNOSTIC QUERY - Run this to see exactly what's happening
-- =============================================

-- 1. Check all tables exist
WITH table_check AS (
  SELECT 
    'student_lessons' as table_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'student_lessons') as exists
  UNION ALL
  SELECT 
    'lesson_vocabulary',
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_vocabulary')
  UNION ALL
  SELECT 
    'lessons',
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons')
  UNION ALL
  SELECT 
    'student_profiles',
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'student_profiles')
)
SELECT * FROM table_check;

-- 2. Check columns in student_lessons
SELECT '--- Columns in student_lessons ---' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'student_lessons'
ORDER BY ordinal_position;

-- 3. Check foreign key constraints
SELECT '--- Foreign keys on student_lessons ---' as info;
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'student_lessons'
    AND tc.constraint_type = 'FOREIGN KEY';

-- 4. Check RLS policies
SELECT '--- RLS Policies on student_lessons ---' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'student_lessons';

-- 5. Test a simple query
SELECT '--- Test Query ---' as info;
DO $$
DECLARE
    result_count integer;
BEGIN
    -- Try to select from student_lessons
    SELECT COUNT(*) INTO result_count FROM student_lessons;
    RAISE NOTICE 'student_lessons has % rows', result_count;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error accessing student_lessons: %', SQLERRM;
END $$;

-- 6. Check if we can do the join that the app needs
SELECT '--- Test Join Query ---' as info;
SELECT 
    'Can query student_lessons with lessons join' as test,
    COUNT(*) as result_count
FROM student_lessons sl
LEFT JOIN lessons l ON sl.lesson_id = l.id
WHERE 1=1;  -- This will test if the join works at all

-- 7. Check your current user
SELECT '--- Current User Info ---' as info;
SELECT 
    current_user,
    auth.uid() as auth_uid,
    auth.role() as auth_role;
