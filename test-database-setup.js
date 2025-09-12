// Quick test script to verify database tables are set up correctly
// Run this in your browser console while on the app

async function testDatabaseSetup() {
  console.log('🔍 Testing database setup...\n');
  
  try {
    // Import supabase from your app
    const { supabase } = await import('./src/lib/supabase');
    
    // Test 1: Check if student_lessons table exists
    console.log('1️⃣ Checking student_lessons table...');
    const { data: slData, error: slError } = await supabase
      .from('student_lessons')
      .select('id')
      .limit(1);
    
    if (slError) {
      if (slError.code === '42P01') {
        console.error('❌ student_lessons table does not exist!');
        console.log('   Run the migration in supabase/migrations/20250110_student_lessons.sql');
      } else {
        console.error('⚠️ Error accessing student_lessons:', slError.message);
      }
    } else {
      console.log('✅ student_lessons table exists');
    }
    
    // Test 2: Check if lesson_vocabulary table exists
    console.log('\n2️⃣ Checking lesson_vocabulary table...');
    const { data: lvData, error: lvError } = await supabase
      .from('lesson_vocabulary')
      .select('id')
      .limit(1);
    
    if (lvError) {
      if (lvError.code === '42P01') {
        console.error('❌ lesson_vocabulary table does not exist!');
      } else {
        console.error('⚠️ Error accessing lesson_vocabulary:', lvError.message);
      }
    } else {
      console.log('✅ lesson_vocabulary table exists');
    }
    
    // Test 3: Check if lessons table has new columns
    console.log('\n3️⃣ Checking lessons table columns...');
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('id, student_profile_id, lesson_type, difficulty_level, vocabulary_count')
      .limit(1);
    
    if (lessonError) {
      console.error('⚠️ Error checking lessons columns:', lessonError.message);
      console.log('   Some columns might be missing');
    } else {
      console.log('✅ lessons table has required columns');
    }
    
    // Test 4: Check authentication
    console.log('\n4️⃣ Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Not authenticated');
    } else {
      console.log('✅ Authenticated as:', user.email);
      
      // Test 5: Try to fetch student lessons for a test student
      console.log('\n5️⃣ Testing student lessons query...');
      const { data: students, error: studentsError } = await supabase
        .from('student_profiles')
        .select('id, name')
        .eq('tutor_id', user.id)
        .limit(1);
      
      if (students && students.length > 0) {
        const testStudent = students[0];
        console.log(`   Testing with student: ${testStudent.name}`);
        
        const { data: studentLessons, error: slQueryError } = await supabase
          .from('student_lessons')
          .select(`
            *,
            lessons (
              id,
              title,
              description
            )
          `)
          .eq('student_id', testStudent.id);
        
        if (slQueryError) {
          console.error('❌ Error fetching student lessons:', slQueryError.message);
        } else {
          console.log(`✅ Successfully fetched ${studentLessons?.length || 0} lessons for student`);
        }
      } else {
        console.log('ℹ️ No students found to test with');
      }
    }
    
    console.log('\n📊 Database setup test complete!');
    console.log('If you see any ❌ errors above, please run the migration.');
    
  } catch (error) {
    console.error('Fatal error during test:', error);
  }
}

// Run the test
testDatabaseSetup();
