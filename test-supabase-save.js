// test-supabase-save.js
// Run this file with: node test-supabase-save.js

import { supabase } from './src/lib/supabase.js'

async function testMultiElementSave() {
  console.log('🧪 Testing multi-element slide save...\n')
  
  try {
    // 1. Test authentication
    console.log('1. Testing authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      console.log('Please ensure you are logged in')
      return
    }
    
    console.log('✅ Authenticated as:', user.email)
    
    // 2. Create a test lesson
    console.log('\n2. Creating test lesson...')
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        user_id: user.id,
        title: 'Test Multi-Element Slide',
        description: 'Testing multiple elements on a single slide',
        slide_order: [],
        version: 1
      })
      .select()
      .single()
    
    if (lessonError) {
      console.error('❌ Failed to create lesson:', lessonError)
      return
    }
    
    console.log('✅ Created lesson:', lesson.id)
    
    // 3. Create a slide
    console.log('\n3. Creating test slide...')
    const { data: slide, error: slideError } = await supabase
      .from('slides')
      .insert({
        lesson_id: lesson.id,
        slide_order: 0,
        slide_type: 'content',
        background: '#ffffff'
      })
      .select()
      .single()
    
    if (slideError) {
      console.error('❌ Failed to create slide:', slideError)
      return
    }
    
    console.log('✅ Created slide:', slide.id)
    
    // 4. Create multiple elements
    console.log('\n4. Creating multiple elements...')
    const elements = [
      {
        slide_id: slide.id,
        element_type: 'text',
        position_x: 100,
        position_y: 100,
        width: 200,
        height: 50,
        z_index: 0,
        content: { text: 'First element' },
        style: {},
        visible: true
      },
      {
        slide_id: slide.id,
        element_type: 'text',
        position_x: 100,
        position_y: 200,
        width: 200,
        height: 50,
        z_index: 1,
        content: { text: 'Second element' },
        style: {},
        visible: true
      },
      {
        slide_id: slide.id,
        element_type: 'shape',
        position_x: 350,
        position_y: 150,
        width: 100,
        height: 100,
        z_index: 2,
        content: { shape: 'rectangle' },
        style: { backgroundColor: '#ff0000' },
        visible: true
      }
    ]
    
    // Try batch insert
    console.log('  Attempting batch insert of', elements.length, 'elements...')
    const { data: insertedElements, error: elementsError } = await supabase
      .from('slide_elements')
      .insert(elements)
      .select()
    
    if (elementsError) {
      console.error('❌ Failed to insert elements:', elementsError)
      console.error('  Error details:', JSON.stringify(elementsError, null, 2))
      
      // Try inserting one by one
      console.log('\n  Trying individual inserts...')
      for (let i = 0; i < elements.length; i++) {
        const { data: singleElement, error: singleError } = await supabase
          .from('slide_elements')
          .insert(elements[i])
          .select()
          .single()
        
        if (singleError) {
          console.error(`  ❌ Failed element ${i + 1}:`, singleError.message)
        } else {
          console.log(`  ✅ Inserted element ${i + 1}:`, singleElement.id)
        }
      }
      return
    }
    
    console.log('✅ Successfully inserted', insertedElements.length, 'elements')
    insertedElements.forEach((el, i) => {
      console.log(`  Element ${i + 1}: ${el.id} (${el.element_type})`)
    })
    
    // 5. Verify the save
    console.log('\n5. Verifying saved data...')
    const { data: verifySlide, error: verifyError } = await supabase
      .from('slides')
      .select(`
        *,
        slide_elements (*)
      `)
      .eq('id', slide.id)
      .single()
    
    if (verifyError) {
      console.error('❌ Failed to verify:', verifyError)
      return
    }
    
    console.log('✅ Verification successful!')
    console.log('  Slide has', verifySlide.slide_elements.length, 'elements')
    
    // 6. Clean up
    console.log('\n6. Cleaning up test data...')
    await supabase.from('lessons').delete().eq('id', lesson.id)
    console.log('✅ Test data cleaned up')
    
    console.log('\n🎉 All tests passed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testMultiElementSave()
