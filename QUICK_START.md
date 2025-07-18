# Quick Start Guide

## 🚀 Installation Steps

1. **Install Dependencies**
   
   For Windows:
   ```cmd
   install-dependencies.bat
   ```
   
   Or manually:
   ```bash
   pnpm install
   ```

2. **Configure Environment**
   - Rename `.env.local` and add your API keys:
     - Get Supabase credentials from https://supabase.com
     - Get OpenAI API key from https://platform.openai.com

3. **Start Development**
   ```bash
   pnpm dev
   ```
   
   Open http://localhost:5173 in your browser

## 📁 Key Files Created

### Core Application Files
- `src/App.tsx` - Main application component
- `src/main.tsx` - Application entry point
- `src/styles/globals.css` - Global styles with Tailwind

### State Management
- `src/stores/slideStore.ts` - Zustand store for slide management
- `src/types/slide.types.ts` - TypeScript type definitions

### Canvas Components
- `src/components/canvas/SlideCanvas.tsx` - Konva.js canvas implementation
- `src/components/templates/VocabularyTable.tsx` - Example template

### Configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.app.json` - TypeScript configuration
- `.prettierrc` - Code formatting rules
- `.eslintrc.json` - Linting rules

### Backend Integration
- `src/lib/supabase.ts` - Supabase client setup
- `src/lib/openai.ts` - OpenAI client setup

## 🎯 Next Steps

1. **Set up Supabase Project**
   - Create a new project at https://supabase.com
   - Copy your project URL and anon key to `.env.local`

2. **Get OpenAI API Key**
   - Sign up at https://platform.openai.com
   - Generate an API key and add to `.env.local`

3. **Install VSCode Extensions**
   - ES7+ React snippets
   - Tailwind CSS IntelliSense
   - Prettier
   - ESLint

4. **Start Building**
   - The app is now ready for development
   - Canvas with drag & drop is working
   - Add more templates and features as needed

## 🐛 Troubleshooting

If you encounter any issues:

1. **Dependencies not installing:**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

2. **Port already in use:**
   Change the port in `vite.config.ts`

3. **TypeScript errors:**
   Restart VSCode or run:
   ```bash
   pnpm tsc --noEmit
   ```

## 📚 Resources

- [Konva.js Documentation](https://konvajs.org/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)