# Database Setup Instructions

## Fixing the Student Lessons Feature

The error you're experiencing is because the required database tables haven't been created yet. Follow these steps to fix the issue:

## Option 1: Using Supabase Dashboard (Recommended)

1. **Login to your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy the entire contents of `supabase/migrations/20250110_student_lessons.sql`
   - Paste it into the SQL editor
   - Click "Run" or press Ctrl+Enter

4. **Verify the Tables Were Created**
   - Go to "Table Editor" in the left sidebar
   - You should now see:
     - `student_lessons` table
     - `lesson_vocabulary` table
     - Updated `lessons` table with new columns

## Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# From your project root
cd C:\Users\cnrfi\figma-slides-app

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## Option 3: Manual SQL Execution

If the above options don't work, you can manually run these SQL commands in order:

```sql
-- 1. Create student_lessons table
CREATE TABLE student_lessons (
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

-- 2. Enable RLS
ALTER TABLE student_lessons ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policy
CREATE POLICY "Users can manage their students' lessons" ON student_lessons
  FOR ALL USING (
    student_id IN (
      SELECT id FROM student_profiles 
      WHERE tutor_id = auth.uid()
    )
  );

-- 4. Create indexes
CREATE INDEX idx_student_lessons_student_id ON student_lessons(student_id);
CREATE INDEX idx_student_lessons_lesson_id ON student_lessons(lesson_id);
```

## Verification Steps

After running the migration, verify everything works:

1. **Refresh your application**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

2. **Check the Students Page**
   - Navigate to the Students page
   - Try expanding a student row
   - The "Loading lessons..." message should appear briefly
   - You should now be able to assign lessons

3. **Test Functionality**
   - Try assigning a lesson to a student
   - Create a new lesson for a student
   - Unassign a lesson

## Troubleshooting

If you still see errors after running the migration:

1. **Check RLS Policies**
   - In Supabase Dashboard, go to Authentication > Policies
   - Ensure the policy for `student_lessons` is enabled

2. **Check Foreign Keys**
   - Ensure both `student_profiles` and `lessons` tables exist
   - Verify the user has students and lessons created

3. **Clear Browser Cache**
   - Sometimes cached data can cause issues
   - Clear your browser's cache and cookies for your app

4. **Check Console Logs**
   - Open browser DevTools (F12)
   - Look for any specific error messages
   - The console will now show more helpful messages about what's wrong

## What This Migration Does

The migration creates:

1. **student_lessons table**: Links students to their assigned lessons
   - Tracks assignment date
   - Tracks progress (0-100%)
   - Tracks completion status
   - Prevents duplicate assignments

2. **lesson_vocabulary table**: Stores vocabulary for each lesson
   - Links words to lessons
   - Stores translations
   - Tracks difficulty levels
   - Prevents duplicate words per lesson

3. **Updates to lessons table**: Adds new columns
   - Links lessons to specific students
   - Adds lesson type and difficulty
   - Tracks vocabulary count

## Need Help?

If you continue to experience issues:

1. Check the Supabase logs for detailed error messages
2. Verify your database connection in `.env` file
3. Ensure your Supabase project is running and accessible
4. Check that your API keys are correct

The error should be resolved once the database tables are created successfully!
