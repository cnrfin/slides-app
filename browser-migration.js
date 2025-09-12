// Browser Console Migration Script
// This script can be run directly in your browser console to set up the database tables
// Open your app, press F12, go to Console tab, and paste this entire script

async function runMigration() {
  console.log('🚀 Starting database migration...\n');
  
  try {
    // Import supabase from your app
    const { supabase } = await import('./src/lib/supabase');
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ You must be logged in to run this migration');
      return;
    }
    
    console.log('✅ Authenticated as:', user.email);
    console.log('\n📦 Creating database tables...\n');
    
    // SQL commands to create tables
    const migrations = [
      {
        name: 'Create student_lessons table',
        sql: `
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
          )
        `
      },
      {
        name: 'Enable RLS on student_lessons',
        sql: `ALTER TABLE student_lessons ENABLE ROW LEVEL SECURITY`
      },
      {
        name: 'Create RLS policy for student_lessons',
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can manage their students' lessons" 
          ON student_lessons
          FOR ALL USING (
            student_id IN (
              SELECT id FROM student_profiles 
              WHERE tutor_id = auth.uid()
            )
          )
        `
      },
      {
        name: 'Create indexes for student_lessons',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_student_lessons_student_id ON student_lessons(student_id);
          CREATE INDEX IF NOT EXISTS idx_student_lessons_lesson_id ON student_lessons(lesson_id);
          CREATE INDEX IF NOT EXISTS idx_student_lessons_assigned_at ON student_lessons(assigned_at DESC);
        `
      },
      {
        name: 'Create lesson_vocabulary table',
        sql: `
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
          )
        `
      },
      {
        name: 'Enable RLS on lesson_vocabulary',
        sql: `ALTER TABLE lesson_vocabulary ENABLE ROW LEVEL SECURITY`
      },
      {
        name: 'Create RLS policy for lesson_vocabulary',
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can manage their lesson vocabulary" 
          ON lesson_vocabulary
          FOR ALL USING (
            lesson_id IN (
              SELECT id FROM lessons 
              WHERE user_id = auth.uid()
            )
          )
        `
      },
      {
        name: 'Create indexes for lesson_vocabulary',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_lesson_vocabulary_lesson_id ON lesson_vocabulary(lesson_id);
          CREATE INDEX IF NOT EXISTS idx_lesson_vocabulary_word ON lesson_vocabulary(word);
        `
      },
      {
        name: 'Add columns to lessons table',
        sql: `
          ALTER TABLE lessons 
          ADD COLUMN IF NOT EXISTS student_profile_id UUID REFERENCES student_profiles(id),
          ADD COLUMN IF NOT EXISTS lesson_type TEXT,
          ADD COLUMN IF NOT EXISTS difficulty_level TEXT,
          ADD COLUMN IF NOT EXISTS objectives TEXT[],
          ADD COLUMN IF NOT EXISTS vocabulary_count INTEGER DEFAULT 0;
        `
      },
      {
        name: 'Create indexes for new lessons columns',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_lessons_student_profile_id ON lessons(student_profile_id);
          CREATE INDEX IF NOT EXISTS idx_lessons_lesson_type ON lessons(lesson_type);
        `
      },
      {
        name: 'Grant permissions',
        sql: `
          GRANT ALL ON student_lessons TO authenticated;
          GRANT ALL ON lesson_vocabulary TO authenticated;
          GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
        `
      }
    ];
    
    // Run each migration
    for (const migration of migrations) {
      console.log(`⏳ ${migration.name}...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: migration.sql
      }).single();
      
      // If exec_sql doesn't exist, try direct query (this won't work in browser but worth trying)
      if (error) {
        if (error.message.includes('exec_sql')) {
          console.log('   ⚠️ Cannot execute SQL directly from browser.');
          console.log('   Please run this SQL in Supabase Dashboard instead.');
          break;
        } else {
          console.error(`   ❌ Error: ${error.message}`);
        }
      } else {
        console.log(`   ✅ Success`);
      }
    }
    
    console.log('\n📋 Migration Summary:');
    console.log('Since direct SQL execution is not possible from the browser,');
    console.log('please copy the SQL from supabase/migrations/20250110_student_lessons.sql');
    console.log('and run it in your Supabase Dashboard SQL Editor.');
    console.log('\nSteps:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Click "SQL Editor" in the left sidebar');
    console.log('4. Click "New query"');
    console.log('5. Paste the SQL and click "Run"');
    
    // Test if tables exist
    console.log('\n🔍 Testing current state...');
    
    const { error: testError } = await supabase
      .from('student_lessons')
      .select('id')
      .limit(1);
    
    if (testError) {
      if (testError.code === '42P01') {
        console.log('❌ Tables have not been created yet.');
        console.log('   Please run the migration in Supabase Dashboard.');
      } else {
        console.log('⚠️ Unexpected error:', testError.message);
      }
    } else {
      console.log('✅ Tables appear to be set up correctly!');
      console.log('   You can now assign lessons to students.');
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

// Display instructions
console.log('%c📚 Database Migration Helper', 'font-size: 20px; font-weight: bold; color: #10b981;');
console.log('%cThis script will help you set up the required database tables.', 'font-size: 14px; color: #6b7280;');
console.log('%c\nTo run the migration, type: runMigration()', 'font-size: 14px; color: #3b82f6;');
console.log('%c\nAlternatively, copy the SQL from:', 'font-size: 14px; color: #6b7280;');
console.log('%csupabase/migrations/20250110_student_lessons.sql', 'font-size: 14px; color: #10b981; font-family: monospace;');
console.log('%cand run it in your Supabase Dashboard.', 'font-size: 14px; color: #6b7280;');

// Make the function available globally
window.runMigration = runMigration;
