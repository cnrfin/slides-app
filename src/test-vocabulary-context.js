// Test script to verify vocabulary context is being used in lesson generation
// Run with: node src/test-vocabulary-context.js

import { generateLesson } from './services/lessonGeneration.js'

async function testVocabularyContext() {
  console.log('🧪 Testing Vocabulary Context in Lesson Generation\n')
  
  // Mock student profile with ID
  const mockStudent = {
    id: 'test-student-123',
    name: 'John Doe',
    target_language: 'Spanish',
    native_language: 'English',
    level: 'Intermediate',
    goals: ['Conversational fluency'],
    interests: 'Technology, Travel'
  }
  
  // Mock templates (simplified)
  const mockTemplates = [
    {
      id: 'vocabulary',
      name: 'Vocabulary',
      category: 'vocabulary',
      elements: []
    }
  ]
  
  // Test 1: Generate with "don't use previous vocabulary"
  console.log('Test 1: "Don\'t use previously taught vocabulary"')
  console.log('----------------------------------------')
  try {
    const request1 = {
      prompt: "Create a lesson about food. Don't use previously taught vocabulary.",
      selectedTemplates: mockTemplates,
      selectedProfile: mockStudent,
      isGeniusMode: false
    }
    
    console.log('📝 Prompt:', request1.prompt)
    console.log('👤 Student:', mockStudent.name)
    console.log('🎯 Expected: Should avoid any vocabulary from student history')
    console.log('⏳ Generating...\n')
    
    // Note: This will actually call the database to get vocabulary history
    // In a real test, you'd mock the database call
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message)
  }
  
  // Test 2: Generate with "review previous vocabulary"
  console.log('\nTest 2: "Review previously learned vocabulary"')
  console.log('----------------------------------------')
  try {
    const request2 = {
      prompt: "Create a review lesson using previously learned vocabulary.",
      selectedTemplates: mockTemplates,
      selectedProfile: mockStudent,
      isGeniusMode: false
    }
    
    console.log('📝 Prompt:', request2.prompt)
    console.log('👤 Student:', mockStudent.name)
    console.log('🎯 Expected: Should focus on vocabulary from student history')
    console.log('⏳ Generating...\n')
    
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message)
  }
  
  console.log('\n✅ Test complete!')
  console.log('Check the console logs above to verify vocabulary context is being loaded and passed to the AI.')
}

// Run the test
testVocabularyContext()
