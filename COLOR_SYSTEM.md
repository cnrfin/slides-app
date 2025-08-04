# Color System Documentation

## Overview
This project uses a comprehensive color system with CSS custom properties (variables) and Tailwind CSS integration. Each color has multiple shades for various UI states and effects.

## Color Palette

### Base Colors
- **Black (Font)**: `#000000`
- **White (Background/Card)**: `#fafafa`
- **Light Gray (Secondary Background)**: `#f2f2f2`
- **Gray**: `#d0d0d0`
- **Dark Gray**: `#7f7f7f`
- **Green**: `#54cb56`
- **Purple (Main Accent)**: `#9771ff`
- **Yellow**: `#f0ba2c`
- **Red**: `#fe6d66`
- **Blue**: `#345fd8`

## Usage

### CSS Variables
Use CSS custom properties in your stylesheets:
```css
.element {
  color: var(--color-purple);
  background-color: var(--color-white);
  border-color: var(--color-gray-300);
}

/* Hover states */
.element:hover {
  background-color: var(--color-purple-100);
  border-color: var(--color-purple-400);
}
```

### Tailwind Classes
Use the Tailwind utility classes with the `app-` prefix:
```jsx
<div className="bg-app-white text-app-black border-app-gray-300">
  <button className="bg-app-purple text-app-white hover:bg-app-purple-600">
    Click me
  </button>
</div>
```

### Color Shades
Each color has shades from 50 (lightest) to 950 (darkest):
- **50-200**: Light backgrounds, hover states
- **300-400**: Borders, secondary elements
- **500**: Default/base color
- **600-700**: Hover states for primary elements
- **800-950**: Dark variants, text on light backgrounds

### Special Colors
- `app-white-pure`: Pure white (#ffffff) for maximum contrast
- CSS variables also available without Tailwind prefix: `var(--color-purple-500)`

## Examples

### Buttons
```jsx
// Primary button
<button className="bg-app-purple text-app-white hover:bg-app-purple-600 active:bg-app-purple-700">
  Primary
</button>

// Secondary button
<button className="bg-app-gray-100 text-app-black hover:bg-app-gray-200 border border-app-gray-300">
  Secondary
</button>

// Danger button
<button className="bg-app-red text-app-white hover:bg-app-red-600">
  Delete
</button>
```

### Cards
```jsx
<div className="bg-app-white border border-app-light-gray-300 hover:border-app-gray-400">
  <h3 className="text-app-black">Card Title</h3>
  <p className="text-app-dark-gray">Card content</p>
</div>
```

### Status Indicators
```jsx
// Success
<span className="bg-app-green-100 text-app-green-800 border border-app-green-200">
  Success
</span>

// Warning
<span className="bg-app-yellow-100 text-app-yellow-800 border border-app-yellow-200">
  Warning
</span>

// Error
<span className="bg-app-red-100 text-app-red-800 border border-app-red-200">
  Error
</span>
```
