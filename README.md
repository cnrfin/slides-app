# Figma Slides App

A powerful slide creation and presentation app with AI-powered lesson building capabilities and seamless Google integration.

## ✨ New Features

### Google One Tap Authentication
- **Quick Sign-In**: Sign in with just one tap using your Google account
- **Automatic Prompts**: Smart prompts for returning users
- **Seamless Integration**: Works with existing Supabase authentication
- **Secure Sessions**: Managed by Supabase with Google OAuth 2.0
- See [GOOGLE_ONE_TAP_QUICK_START.md](./GOOGLE_ONE_TAP_QUICK_START.md) for setup details

## Core Features

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
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:

#### Required Environment Variables:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration (Required for AI features)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Google OAuth (Required for Google authentication)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Optional
VITE_GOOGLE_API_KEY=your_google_api_key_here  # Only for public Drive access
```

#### Getting Your API Keys:

**Supabase:**
1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to Settings → API
3. Copy your Project URL and anon public key

**OpenAI:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Create a new secret key

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Drive API and Google Identity
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URIs: `http://localhost:5173/auth/google/callback`
6. Copy Client ID and Client Secret

5. Start the development server:
```bash
npm run dev
# or
pnpm dev
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
