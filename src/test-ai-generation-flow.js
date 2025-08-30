// Test file for AI lesson generation flow
// 
// This file documents the expected flow for AI lesson generation from the dashboard:
//
// 1. User enters a prompt in the dashboard home AIPromptInput
// 2. User selects slide templates they want to generate
// 3. Optionally selects a student profile and/or previous lesson
// 4. Clicks "Generate" button
// 
// Expected behavior:
// - A loading toast appears saying "Generating lesson..."
// - The AI prompt input becomes disabled during generation
// - The OpenAI API is called with the prompt and selected data
// - On success, user is redirected to /canvas with the generated data
// - The canvas applies the generated slides automatically
// - A success toast appears confirming the number of slides generated
// 
// On error:
// - The loading toast is cleared
// - An error toast appears with the error message
// - The form remains on the dashboard and is re-enabled
//
// Key components involved:
// - /src/components/dashboard/AIPromptInput.tsx - Dashboard AI input
// - /src/services/lessonGeneration.ts - Shared OpenAI API service
// - /src/Canvas.tsx - Canvas component that receives and applies generated data
// - /src/components/ui/CollapsibleTextInput.tsx - Canvas AI input (uses same service)
// - /src/components/ui/Toast.tsx - Toast notification system
//
// Both dashboard and canvas now use the same generateLesson() service,
// ensuring consistent behavior across the application.

export const TEST_FLOW = {
  dashboardToCanvas: {
    steps: [
      "User enters prompt in dashboard",
      "User selects slides",
      "Click Generate",
      "Loading toast appears",
      "API call happens",
      "Navigate to canvas with data",
      "Canvas applies slides",
      "Success toast shown"
    ],
    expectedState: {
      beforeGeneration: {
        location: "/dashboard",
        inputEnabled: true,
        toasts: []
      },
      duringGeneration: {
        location: "/dashboard",
        inputEnabled: false,
        toasts: ["Generating lesson..."]
      },
      afterSuccess: {
        location: "/canvas",
        inputEnabled: true,
        toasts: ["Successfully generated X slides!"],
        canvasHasSlides: true
      }
    }
  },
  canvasDirectGeneration: {
    steps: [
      "User enters prompt in canvas CollapsibleTextInput",
      "User selects slides",
      "Click Generate",
      "Loading toast appears",
      "API call happens",
      "Slides are replaced in canvas",
      "Success toast shown"
    ],
    expectedState: {
      beforeGeneration: {
        location: "/canvas",
        inputExpanded: true,
        toasts: []
      },
      duringGeneration: {
        location: "/canvas",
        inputDisabled: true,
        toasts: ["Generating lesson..."]
      },
      afterSuccess: {
        location: "/canvas",
        inputCollapsed: true,
        toasts: ["Successfully generated X slides!"],
        canvasHasNewSlides: true
      }
    }
  }
}
