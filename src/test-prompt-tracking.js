// Test file for prompt history tracking
// 
// This file documents the prompt history tracking implementation:
//
// TRACKING FLOW:
// 1. User generates a lesson from either:
//    a. Dashboard AIPromptInput component
//    b. Canvas CollapsibleTextInput component
// 
// 2. Both components now use the shared generateLesson() service
// 
// 3. The generateLesson() service:
//    - Calls OpenAI API
//    - Gets the current user
//    - Tracks the generation in prompt_history table with:
//      * user_id
//      * student_profile_id (if selected)
//      * prompt_text
//      * genius_mode_used
//      * slides_generated (count)
//      * template_types_used (unique categories)
//      * template_order (template IDs in order)
//      * model_used
//      * generation_time_ms
//    - Also updates usage_tracking table
//
// DATABASE TABLES AFFECTED:
// - prompt_history: Stores all generation history
// - usage_tracking: Monthly usage statistics
//
// DEBUGGING:
// Check browser console for:
// - "📊 Tracking lesson generation:" - Shows tracking attempt
// - "✅ Successfully tracked prompt in prompt_history:" - Success
// - "❌ Error inserting into prompt_history:" - Database error
//
// COMMON ISSUES FIXED:
// 1. Dashboard and canvas were using different generation flows
// 2. Canvas was not using the shared service
// 3. No tracking was happening in either component
// 4. Database insert errors were silent
//
// VERIFICATION:
// After generating a lesson, check Supabase dashboard:
// 1. prompt_history table should have new row
// 2. usage_tracking table should be updated

export const PROMPT_TRACKING_FLOW = {
  components: {
    dashboard: 'AIPromptInput.tsx',
    canvas: 'CollapsibleTextInput.tsx'
  },
  service: 'lessonGeneration.ts',
  database: {
    trackingFunction: 'trackLessonGeneration()',
    tables: ['prompt_history', 'usage_tracking']
  },
  dataTracked: {
    user_id: 'User who generated the lesson',
    student_profile_id: 'Selected student profile (if any)',
    prompt_text: 'The actual prompt text',
    genius_mode_used: 'Whether genius mode was enabled',
    slides_generated: 'Number of slides generated',
    template_types_used: 'Array of unique template categories',
    template_order: 'Array of template IDs in order',
    model_used: 'OpenAI model used (gpt-5-mini)',
    generation_time_ms: 'Time taken to generate',
    created_at: 'Timestamp (auto-generated)'
  }
}
