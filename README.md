# Figma Slides-Like Language Learning Application

## 🚨 IMPORTANT: Instructions for AI Agents

**ALWAYS read project files from the file system directory, NOT from project knowledge or cached documents.** The file system contains the most up-to-date code. Use the following commands:
- `Filesystem:read_file` - Read a single file
- `Filesystem:read_multiple_files` - Read multiple files at once
- `Filesystem:list_directory` - List directory contents
- `Filesystem:directory_tree` - Get directory structure

Project root: `C:\Users\cnrfi\figma-slides-app\`

## Project Overview

A high-performance, Figma-style slide editor built with React 18+ and TypeScript, optimized for creating educational language learning content. The application features a canvas-based editor with real-time editing, zoom/pan controls, and auto-sizing text elements.

## Technology Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 7.0.4
- **Canvas Rendering**: Konva.js 9.3.22 with react-konva 18.2.10
- **State Management**: Zustand 5.0.6 with Immer middleware
- **Styling**: Tailwind CSS 3.4.0
- **Icons**: Lucide React
- **Utilities**: 
  - date-fns for date formatting
  - lodash-es for utility functions
  - nanoid/uuid for ID generation
  - react-window for virtualization

## Directory Structure

```
figma-slides-app/
├── src/
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── SlideCanvas.tsx      # Main canvas component with zoom/pan
│   │   │   ├── ElementRenderer.tsx   # Renders individual slide elements
│   │   │   └── InlineTextEditor.tsx  # Inline text editing overlay
│   │   └── templates/
│   │       └── VocabularyTable.tsx   # Template component example
│   ├── stores/
│   │   └── slideStore.ts            # Zustand store for slide state
│   ├── hooks/
│   │   └── useKeyboardShortcuts.ts  # Keyboard shortcut handling
│   ├── types/
│   │   └── slide.types.ts           # TypeScript type definitions
│   ├── utils/
│   │   ├── canvas.constants.ts      # Canvas constants (dimensions, colors)
│   │   └── text.utils.ts            # Text measurement utilities
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client setup
│   │   └── openai.ts               # OpenAI client setup
│   ├── styles/
│   │   └── globals.css             # Global styles with Tailwind
│   ├── App.tsx                     # Main application component
│   ├── main.tsx                    # Application entry point
│   └── vite-env.d.ts              # Vite environment types
├── public/                         # Static assets
├── .env                           # Environment variables
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind configuration
└── README.md                     # This file
```

## Key Components

### Canvas System (`SlideCanvas.tsx`)
- **Infinite canvas** with pan (Space + drag) and zoom (scroll wheel)
- **Stage transformation** for smooth scaling and positioning
- **Selection system** with multi-select support (Ctrl/Cmd + click)
- **Edit mode indicators** for user feedback
- Handles all canvas interactions and coordinates element rendering

### Element Rendering (`ElementRenderer.tsx`)
- Renders different element types (text, shapes, images)
- **Auto-sizing text** without width/height constraints
- **Boundary visualization** for elements outside the slide
- Selection and hover state visualization
- Custom hit detection for accurate text selection

### Text Editing (`InlineTextEditor.tsx`)
- **Inline editing** with auto-expanding textarea
- **Auto-sizing** based on content (infinite horizontal/vertical expansion)
- Maintains zoom scale during editing
- Click-outside detection for saving changes
- Extra padding to prevent text cutoff

### State Management (`slideStore.ts`)
- **Zustand store** with Immer for immutable updates
- Manages presentations, slides, and elements
- Selection state and undo/redo support (placeholder)
- Performance optimizations with selectors
- Batch update operations

## Recent Updates (January 2025)

### Template System Improvements
- **Renamed Template Types**:
  - "Introduction" → "Warm Up"
  - "Exercise" → "Reading" 
  - "Conversation Example" → "Conversation"
- **Template Categories**: Now match slide types directly (Title, Warm Up, Vocabulary, Conversation, Reading, Review, End)
- **Vocabulary Template**: Added "Vocabulary - 6 items" template with two-column layout for vocabulary words and meanings
- **Template Demo**: Enhanced with multiple example datasets (Spanish Colors, French Numbers, German Greetings)

### Image Handling
- **Image Replacement**: Drag and drop an image onto an existing image element to replace it
  - Visual feedback with green highlight when hovering over target image
  - Preserves all properties of the original image (size, position, opacity, etc.)
  - Dynamic overlay messages: "Drop images here" or "Replace image"

### Responsive Layout
- **Figma-like Layout**: Sidebars now overlay the canvas and maintain fixed positions
  - Canvas uses full viewport space behind UI panels
  - Sidebars float over content when viewport shrinks
  - Professional responsive behavior matching design tools
- **Canvas Improvements**:
  - Full viewport canvas interaction area
  - Properly centered slide on initial load
  - Reset view button (Home icon) and keyboard shortcut
  - Zoom indicator moved to bottom center

## Current Implementation Status

### ✅ Completed Features
- Canvas rendering with Konva.js
- Zoom and pan controls
- Text element creation and editing
- Auto-sizing text elements (infinite expansion)
- **NEW: Image drag-and-drop support:**
  - Drag image files directly onto the canvas
  - Automatic scaling for large images (max 400px)
  - Images positioned at drop location
  - Visual indicator while dragging over canvas
- **NEW: Element layer ordering (z-index) with:**
  - Bring to Front - moves element to top layer
  - Send to Back - moves element to bottom layer
  - Bring Forward - moves element up one layer
  - Send Backward - moves element down one layer
  - Intuitive arrow key shortcuts (Alt + Up/Down)
  - Visual toolbar buttons when element selected
  - Also supports bracket shortcuts for compatibility
- **NEW: Undo/Redo functionality with:**
  - Full history tracking for all actions
  - Toolbar buttons with disabled states
  - Standard keyboard shortcuts (Ctrl+Z for undo, Ctrl+Y for redo)
  - Maximum 50 history states
  - Works for: adding/deleting elements, moving, resizing, text editing, layer ordering
- **NEW: Figma-like text resize with:**
  - Hover state showing blue border
  - Selected state with left/right resize handles only  
  - Text wrapping as width is adjusted
  - Automatic height calculation based on wrapped text
  - Tight text fit with no padding
  - Clean transitions between states
- **NEW: Text Properties Panel with:**
  - Font family selector (Inter, Arial, Helvetica, etc.)
  - Font weight selector (Thin to Black)
  - Font size dropdown (8px to 96px, including 40px)
  - Line height control (percentage based)
  - Letter spacing control (kerning)
  - Bold, italic, underline, and bullet point buttons (bullet points now functional!)
  - Text alignment (left, center, right, justify)
  - Color picker with flat color support
  - Gradient color support with:
    - Interactive gradient stops with drag-to-adjust positions
    - Angle control with visual dial
    - Color flip button
    - Real-time preview
    - Optimized performance with throttled updates
  - Opacity slider (0-100%) with improved visual design:
    - Visible gray track (#e5e7eb) with 4px height
    - White thumb handle (16px) with gray border
    - Hover and active states for better interaction feedback
    - Precise percentage input field (replaces dropdown)
    - Real-time value synchronization
    - Cross-browser compatible (Chrome, Firefox, Safari, Edge)
  - **Lock/unlock toggle button:**
    - Prevents element movement and resizing when locked
    - Shows purple selection border for locked elements
    - "Not-allowed" cursor appears when hovering over locked elements
    - Locked elements are excluded from multi-selection rectangles
    - When multiple elements are selected, lock/unlock affects all selected elements
    - Shows count indicator when locking/unlocking multiple elements
  - Dark theme matching Figma's design
  - Real-time text re-measurement on property changes
- Shape creation (rectangles and circles)
- Shape properties panel with:
  - Fill color picker
  - Gradient support with interactive stops
  - Corner radius control (0-50px) with improved slider design
  - Opacity control with improved visual design:
    - Visible gray track (#e5e7eb) with 4px height
    - White thumb handle (16px) with gray border
    - Hover and active states for better interaction feedback
    - Precise percentage input field (replaces dropdown)
    - Real-time value synchronization
    - Cross-browser compatible
  - **Lock/unlock toggle button:**
    - Prevents element movement and resizing when locked
    - Shows purple selection border for locked elements
    - "Not-allowed" cursor appears when hovering over locked elements
- **Image support with:**
  - Same resizing capabilities as shapes (8-point resize handles)
  - Proportional resize with Shift key
  - **Drag-and-drop image replacement**
  - Image properties panel:
    - Opacity control (0-100%)
    - Corner radius (0-50px)
    - Lock/unlock toggle
  - Automatic image scaling on import (max 400px)
  - Loading state with placeholder
  - Full layer ordering support
- Shape resizing with:
  - 8-point resize handles (corners and sides)
  - Proportional resize when holding Shift key
  - Snap-to-margin while resizing
  - Snap-to-element while resizing (match dimensions of other elements)
  - Visual feedback during resize
- **Element selection and multi-selection:**
  - Click and drag to create selection rectangle
  - All elements within rectangle become selected
  - Selection bounding box appears around multiple selected elements
  - Drag selection box to move all elements together
  - Resize selection box to scale all elements proportionally
  - Ctrl/Cmd + click for individual multi-selection
- **Element duplication:**
  - Alt + drag any element to create a duplicate
  - Duplicate inherits all properties from original
  - Works with text, shapes, and images
  - Snapping guides work during duplication
- Keyboard shortcuts (Delete, Escape, Ctrl+A, **Home for reset view**)
- Slide management (add, delete, duplicate)
- Slide thumbnails with navigation
- Template system with modal selection
- Pre-made templates (Title, Content, Exercise layouts)
- **NEW: Template Designer with:**
  - Visual template creation within the app
  - Slide type selection (Title, Introduction, Vocabulary, etc.)
  - Dynamic data key mapping for elements
  - Save templates to localStorage
  - Export as TypeScript or JSON
  - **Minimize/Maximize feature** for easy canvas access
  - **Non-blocking interface** - select and edit elements while designer is open
  - **Smart keyboard handling** - Space key works in input fields
  - **Data Key Helper** showing:
    - Context-aware suggestions based on slide type
    - Current data keys for selected elements
    - Copy-to-clipboard functionality
    - Common patterns and examples

### 🚧 In Progress
- ~~Element resizing~~ ✅ Text and shape resizing implemented
- ~~Properties panel functionality~~ ✅ Text and shape properties panels implemented
- ~~Gradient color support for text~~ ✅ Gradient support implemented
- ~~Undo/redo implementation~~ ✅ Full undo/redo with history tracking
- Element rotation
- Properties panel for images and other elements
- More template categories (charts, comparisons)
- Template search and filtering

### 📋 Not Yet Implemented
- Supabase integration for persistence
- OpenAI integration for content generation
- Real-time collaboration
- Video and audio support
- Export functionality
- Advanced templates (vocabulary tables, exercises)

## Summary

The Figma-like editing implementation includes:

### ✅ **Text Element Behavior**
1. **Hover State**: Blue border appears when hovering over text
2. **Selected State**: Blue border + left/right resize handles (no corner handles)
3. **Edit Mode**: Double-click to edit with minimal border
4. **Tight Text Fit**: No padding, text fits exactly within bounds
5. **Smooth Transitions**: Clean interaction between states

### ✅ **Shape Element Behavior**
1. **Hover State**: Gray border appears when hovering
2. **Selected State**: Blue border + 8-point resize handles
3. **Resize Modes**: 
   - Free resize using any handle
   - Proportional resize when holding Shift key
   - Snap-to-margin guides during resize (all edges snap independently)
4. **Fill Options**: Solid colors or gradients with angle control
5. **Shape Types**: Rectangles and circles supported
6. **Corner Radius**: 0-50px for rectangles only (circles always round)

### ✅ **Resize Functionality** 
**Text Elements:**
- **Side Handles Only**: Left and right handles for width adjustment
- **Auto Text Wrapping**: Text wraps automatically as width changes
- **Dynamic Height**: Height adjusts automatically based on wrapped content
- **Minimum Constraints**: 50px minimum width

**Shape Elements:**
- **8-Point Handles**: Resize from corners and sides
- **Proportional Resize**: Hold Shift key to maintain aspect ratio
- **Minimum Size**: 20px minimum width/height
- **Visual Feedback**: Handles highlight on hover
- **Anchor Point**: Shapes resize from the opposite edge/corner of the dragged handle
- **Snap to Margins**: Automatic alignment to slide edges while resizing
- **Snap to Elements**: Automatically match dimensions and align with other elements

### ✅ **Visual Design**
- **Border Color**: #0c8ce9 (Figma blue)
- **Handle Size**: 
  - Text: 8x8px handles on left/right sides only
  - Shapes: 8x8px handles on all 8 points
- **Border Behavior**: 
  - Text: Border hides when dragging for cleaner interaction
  - Shapes: Border remains visible during drag
- **No Padding**: Text elements have 0 padding for exact fit
- **Default Text**: Simple "Text" instead of longer placeholders
- **Default Font Size**: 16px (matching Figma)
- **Gradient Support**: Both text and shapes support linear gradients

### ✅ **User Experience**
- **Cursor Changes**: Text cursor on hover, resize cursor on handles
- **No Diagonal Resize**: Removed font size scaling to match Figma
- **Transparent Editor**: Inline editor has transparent background
- **Smart Selection**: Selects all only for placeholder text
- **Bullet Points**: Toggle bullets for text elements (adds • to each line)
  - Automatically strips bullets when editing
  - Re-adds bullets when saving
  - Properly measures text with bullets for accurate dimensions

## Template System

The application includes a comprehensive template system for creating language learning slides:

### Template Categories
- **Blank**: Basic empty slides
- **Title**: Title page templates
- **Warm Up**: Warm-up activity slides (icebreakers, discussions)
- **Vocabulary**: Vocabulary teaching slides with word/meaning layouts
- **Conversation**: Dialogue and conversation practice slides
- **Reading**: Reading comprehension slides with passages and questions
- **Review**: Summary and review slides
- **End**: Closing slides

### Available Templates
- **Blank Template**: Simple white background slide
- **Vocabulary - 6 items**: Two-column layout for 6 vocabulary words with meanings
  - Dynamic placeholders: `{{title}}`, `{{subtitle}}`, `{{vocabulary[0].word}}`, etc.
  - Supports data population from JSON

### Template Designer Features
- Visual template creation within the app
- Dynamic data key mapping
- Export templates as TypeScript or JSON
- Minimize/maximize for easy canvas access
- Data Key Helper with context-aware suggestions

## Usage Guide

### Text Editing and Resizing
1. **Create Text**: Click "Add Text" button - creates text element with "Text" placeholder
2. **Hover**: Shows blue border around text element
3. **Select**: Click to select - shows blue border + left/right resize handles
4. **Edit Text**: Double-click to enter edit mode with minimal border
5. **Resize Text**: Drag left/right handles to adjust width (text wraps automatically)
6. **Exit Edit Mode**: Press Escape or click outside the text editor

### Shape Creation and Editing
1. **Create Shape**: Click "Add Rectangle" or "Add Circle" button
2. **Hover**: Shows gray border around shape
3. **Select**: Click to select - shows blue border + 8 resize handles
4. **Resize Shape**: 
   - Drag any handle to resize freely
   - Hold Shift while dragging for proportional resize
5. **Properties**: Select shape to see properties panel with color/gradient options

### Working with Images
1. **Add Images**: Simply drag and drop image files onto the canvas
2. **Replace Images**: Drag a new image onto an existing image element
   - Green highlight shows when hovering over replaceable image
   - Original image properties are preserved
3. **Multiple Images**: Drop multiple files at once - they'll be offset slightly
4. **Select**: Click to select - shows blue border + 8 resize handles
5. **Resize**: Same as shapes - drag handles, hold Shift for proportional
6. **Properties**: 
   - Adjust opacity (0-100%)
   - Set corner radius for rounded corners
   - Lock/unlock to prevent accidental edits
7. **Layer Order**: Use Alt + Arrow keys to change z-index

### Canvas Navigation
- **Pan**: Hold Space + drag mouse
- **Zoom**: Scroll wheel (33% - 200%)
- **Reset View**: 
  - Click Home button in toolbar
  - Press Home key
  - Returns to 100% zoom and centers the slide
- **Undo/Redo**:
  - **Undo**: Ctrl/Cmd + Z - undo last action
  - **Redo**: Ctrl/Cmd + Y - redo last undone action (following Figma's pattern)
  - Toolbar buttons show enabled/disabled states
  - Tracks up to 50 history states
- **Layer Ordering**:
  - **Bring Forward**: Alt + ↑ (Up Arrow) - moves element up one layer
  - **Send Backward**: Alt + ↓ (Down Arrow) - moves element down one layer
  - **Bring to Front**: Alt + Shift + ↑ - moves element to top layer
  - **Send to Back**: Alt + Shift + ↓ - moves element to bottom layer
  - Also supports Ctrl/Cmd + ]/[ shortcuts for compatibility with other design tools
  - Layer controls appear in toolbar when single element is selected
- **Multi-Selection**:
  - **Rectangle Selection**: Click and drag on empty canvas to select multiple elements
  - **Add to Selection**: Ctrl/Cmd + click individual elements
  - **Select All**: Ctrl/Cmd + A
  - **Clear Selection**: Escape key or click empty area
- **Duplication**:
  - **Alt + Drag**: Hold Alt while dragging any element to create a duplicate
  - Works with all element types (text, shapes, images)
  - Duplicates inherit all properties from the original
- **Multi-Element Operations**:
  - **Selection Box**: When multiple elements are selected, a bounding box appears
  - **Move Together**: Drag the selection box to move all selected elements as a group
  - **Resize Together**: Resize the selection box to scale all selected elements proportionally
  - **Proportional Resize**: Hold Shift while resizing to maintain aspect ratio
  - **Delete Multiple**: Select multiple elements + Delete key
  - **Snapping**: Selection box snaps to guides, all elements follow
- **Smart Alignment**:
  - Elements automatically snap to each other when dragging
  - Purple guides show element alignment
  - Red guides show margin alignment
  - **Precise Positioning with Arrow Keys**:
    - Use arrow keys to move selected elements by 4px increments
    - Up/Down/Left/Right arrows move elements in the corresponding direction
    - Works with multiple selected elements (moves them all together)
    - Respects locked elements (locked elements won't move)
    - Allows for precise spacing control between elements
    - Combined with element snapping, makes it easy to create evenly spaced layouts

## Important Implementation Details

### Text Element Behavior
- Text elements support dynamic resizing with automatic text wrapping:
  - **Left/Right handles**: Adjust width with automatic text wrapping
  - **Auto-height**: Height automatically adjusts based on wrapped text content
- Uses `wrap="word"` for proper text wrapping within width constraints
- Measures text using Konva.Text nodes for accuracy
- Stores measured dimensions in element data
- No padding for tight text fit (matching Figma)
- Inline editor has transparent background and minimal border

### Canvas Coordinate System
- Canvas dimensions: 800x600 (defined in `canvas.constants.ts`)
- Elements can be positioned outside canvas boundaries
- Zoom range: 33% to 200%
- Stage automatically centers on mount

### Snap Behavior
- **Element-to-Element Snapping**:
  - **While Dragging**: Elements snap to other elements' edges and centers
  - **While Resizing**: Elements snap to match dimensions and align with other elements
  - Purple guides show element-to-element alignment
  - Works for all element types (text, shapes)
- **Margin Snapping**:
  - Elements snap to slide margins (25px from edges)
  - Center alignment guides for horizontal and vertical centering
  - Red guides show margin/center alignment
- **Visual Guides**:
  - **Purple lines**: Element-to-element alignment
  - **Red lines**: Margin and center alignment
  - Guides appear when within snap distance (10px)
- **Smart Priority**: Element snapping takes priority over margin snapping

### Performance Optimizations
- React.memo on ElementRenderer
- Selective Zustand subscriptions
- Konva performance flags (`perfectDrawEnabled: false`)
- Planned: Virtual scrolling for slide thumbnails
- Planned: Web Workers for heavy computations

## Development Commands

```bash
# Install dependencies (including react-colorful for color picker)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_APP_URL=http://localhost:5173
```

## Known Issues & Solutions

1. **Text Cutoff**: Fixed by adding 5px extra padding in height calculations
2. **Zoom Text Scaling**: Fixed by removing width/height constraints on Text nodes
3. **Selection Box**: Currently disabled resize/rotate on transformer

## Future Architecture Decisions

Based on the research document, the following are planned:
- Implement virtual scrolling with react-window for slide list
- Add Web Workers for template processing
- Implement proper undo/redo with command pattern
- Add real-time collaboration with Supabase channels
- Optimize bundle size with code splitting

## Contributing

When making changes:
1. Always read current files from the file system
2. Update this README with significant changes
3. Follow the established patterns for state management and rendering
4. Test zoom/pan behavior after canvas changes
5. Ensure text editing maintains auto-sizing behavior

Last Updated: January 2025 - Template system updates, image replacement, and Figma-like responsive layout