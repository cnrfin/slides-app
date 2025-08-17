# Figma Slides App

A powerful slide creation and presentation app with AI-powered lesson building capabilities.

## Features

### AI-Powered Lesson Builder
The collapsible text input component now integrates with OpenAI's GPT-5 models to generate complete lessons:

- **Smart Prompt Input**: Write your lesson prompt in the expandable text input
- **Template Selection**: Choose from various slide templates (Title, Warm-up, Vocabulary, Reading, etc.)
- **Student Profiles**: Customize content for specific students with their language background
- **Lesson Context**: Build upon previous lessons for continuity
- **Genius Mode**: Toggle between GPT-5-mini and advanced reasoning mode
- **Confirmation Modal**: Review all parameters before generating content
- **Auto-populate Canvas**: Generated content automatically creates and populates slides

## Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd figma-slides-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your OpenAI API key to `.env`:
```
VITE_OPENAI_API_KEY=your_actual_openai_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

## Using the AI Lesson Builder

1. **Open the Text Input**: Click "Build a lesson" button at the bottom of the screen or press `Ctrl/Cmd + K`

2. **Add Slide Templates**:
   - Click the "+" button in the toolbar
   - Select "Add slides"
   - Choose templates in the order you want them
   - Click "Done" when finished

3. **Optional: Add Context**:
   - **Student Profile**: Select a student to tailor content to their language background
   - **Previous Lesson**: Reference a previous lesson for continuity
   - **Genius Mode**: Enable for more advanced reasoning capabilities

4. **Write Your Prompt**:
   - Describe the lesson you want to create
   - Be specific about topics, difficulty level, and any special requirements
   - Example: "Create a beginner Spanish lesson about colors with vocabulary, conversation practice, and a reading exercise"

5. **Generate Content**:
   - Click the submit button (arrow icon) or press `Ctrl + Enter`
   - Review the confirmation modal showing:
     - Your prompt
     - Selected templates
     - Student profile (if selected)
     - Previous lesson (if selected)
     - Model selection
   - Click "Generate" to proceed

6. **Result**:
   - The app will clear existing slides
   - New slides will be created with the selected templates
   - Each slide will be populated with AI-generated content
   - Content is automatically formatted and styled

## Supported Templates

- **Title**: Lesson title and subtitle
- **Warm-up Questions**: 4 engaging warm-up questions
- **Vocabulary**: 5-6 vocabulary items with definitions
- **Conversation Practice**: 4 conversation questions
- **Reading Exercise**: Short passage with comprehension questions
- **Review**: Key lesson objectives and takeaways
- **Special Exercises**:
  - Gap-fill exercises
  - Synonyms practice
  - Sentence construction
  - Useful phrases

## API Models

The app uses OpenAI's GPT-5 models:
- **Standard Mode**: `gpt-5-mini` - Fast, efficient generation
- **Genius Mode**: `gpt-5-mini` with advanced reasoning - Better for complex lessons

## Keyboard Shortcuts

- `Ctrl/Cmd + K`: Toggle text input expansion
- `Ctrl + Enter`: Submit prompt (when text input is focused)
- `Escape`: Collapse text input

## Error Handling

- **Missing API Key**: The app will prompt you to add your OpenAI API key to the `.env` file
- **Generation Errors**: Error messages are displayed in the confirmation modal
- **Network Issues**: The app will show appropriate error messages if the API is unreachable

## Data Structure

Generated content follows specific structures for each template type:

```javascript
// Example for vocabulary template
{
  school: "Language Learning Academy",
  vocabulary: [
    { word: "rojo", meaning: "red - the color of fire" },
    { word: "azul", meaning: "blue - the color of the sky" },
    // ... more items
  ]
}
```

## Development

### Project Structure
```
src/
├── components/
│   ├── ui/
│   │   └── CollapsibleTextInput.tsx  # Main AI input component
│   ├── LessonBuilder.tsx             # Legacy lesson builder
│   └── ...
├── lib/
│   └── openai.ts                     # OpenAI client configuration
├── stores/
│   └── slideStore.ts                 # Slide state management
└── types/
    └── template.types.ts             # Template type definitions
```

### Adding New Templates

1. Create template file in `src/data/templates/`
2. Add to template index in `src/data/templates/index.ts`
3. Add data structure to `templateDataStructures` in `CollapsibleTextInput.tsx`
4. Test generation with the new template

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Ensure `.env` file exists with `VITE_OPENAI_API_KEY`
   - Restart the development server after adding the key

2. **"Failed to generate content"**
   - Check your OpenAI API key is valid
   - Ensure you have API credits available
   - Check network connectivity

3. **Templates not appearing**
   - Refresh the page
   - Check console for any JavaScript errors
   - Ensure templates are properly imported

## License

[Your License Here]

## Contributing

[Contributing Guidelines]
