# Fix Instructions for "Policy Already Exists" Error

## The Issue
The error `policy "Users can manage their students' lessons" for table "student_lessons" already exists` means that your `student_lessons` table and its policy have already been partially created, but something is still missing or misconfigured.

## Solution Steps

### Step 1: Check What Already Exists
Run this query first in your Supabase SQL Editor to see what's already there:

```sql
-- Check what exists
SELECT 
  'student_lessons table' as item,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_lessons') as exists
UNION ALL
SELECT 
  'lesson_vocabulary table' as item,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_vocabulary') as exists;
```

### Step 2: Run the Minimal Fix
Since the main table and policy already exist, run the **minimal_fix.sql** file:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/minimal_fix.sql`
3. Run it

This script will:
- Skip creating the `student_lessons` table (it already exists)
- Add missing indexes
- Create the `lesson_vocabulary` table if needed
- Add missing columns to the `lessons` table
- Set up proper permissions

### Step 3: Verify Everything Works
After running the minimal fix, test with these queries:

```sql
-- Test if you can query student lessons
SELECT COUNT(*) FROM student_lessons;

-- Test the join (this is what your app uses)
SELECT 
  sl.*,
  l.id as lesson_id,
  l.title as lesson_title
FROM student_lessons sl
LEFT JOIN lessons l ON sl.lesson_id = l.id
LIMIT 1;
```

### Step 4: Clear Your Browser Cache
After the database is fixed:
1. Hard refresh your app: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser console errors
3. Try expanding a student row again

## If You Still Get Errors

### Option A: Drop and Recreate (Nuclear Option)
Only if the minimal fix doesn't work:

```sql
-- WARNING: This will delete all assignments!
DROP TABLE IF EXISTS student_lessons CASCADE;
DROP TABLE IF EXISTS lesson_vocabulary CASCADE;

-- Then run the original migration
-- Copy contents from 20250110_student_lessons_safe.sql
```

### Option B: Manual Test
Test if the table works by manually inserting a test assignment:

```sql
-- Get a student ID and lesson ID
SELECT id, name FROM student_profiles WHERE tutor_id = auth.uid() LIMIT 1;
SELECT id, title FROM lessons WHERE user_id = auth.uid() LIMIT 1;

-- Try to insert (replace the IDs with actual ones from above)
INSERT INTO student_lessons (student_id, lesson_id, progress)
VALUES ('your-student-id', 'your-lesson-id', 0)
ON CONFLICT (student_id, lesson_id) DO NOTHING;
```

## Expected Result
After fixing, when you:
1. Go to the Students page
2. Click the expand arrow next to a student
3. You should see either:
   - Their assigned lessons (if any)
   - "No lessons assigned yet" with buttons to assign or create

## Common Issues and Solutions

| Error | Solution |
|-------|----------|
| `relation "lessons" does not exist` | The foreign key reference is broken. Check that your `lessons` table exists |
| `permission denied for table student_lessons` | Run: `GRANT ALL ON student_lessons TO authenticated;` |
| `column "lessons" does not exist` | This is a naming issue in the query. The app is now fixed to handle both `lesson` and `lessons` |
| Still getting 400 errors | Check browser console for the exact error message and match it to the solutions above |

## Quick Test in Browser Console

After fixing the database, you can test directly in your browser console:

```javascript
// Open DevTools (F12) and run:
const { supabase } = await import('./src/lib/supabase');

// Test the query
const { data, error } = await supabase
  .from('student_lessons')
  .select('*, lessons(*)')
  .limit(1);

console.log('Result:', data, 'Error:', error);
```

If this returns data without errors, the database is fixed!
