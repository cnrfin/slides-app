/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-app-green',
    'hover:bg-app-green-700',
    'hover:bg-app-green-800',
    'bg-app-primary-bg',
    'border-app-border',
    // Dark mode accent colors for nav items
    'dark:bg-dark-accent',
    'dark:bg-dark-accent-500',
    'dark:bg-dark-accent-600',
    'dark:bg-dark-accent-700',
    'dark:text-white',
    'dark:text-dark-accent-50',
    'dark:text-dark-accent-100',
    'dark:text-dark-accent-300',
    'bg-dark-accent',
    'bg-dark-accent-500',
    'bg-dark-accent-600',
    // New dark mode background colors
    'dark:bg-dark-graybg',
    'dark:bg-dark-lightgraybg',
    'bg-dark-graybg',
    'bg-dark-lightgraybg',
  ],
  theme: {
    extend: {
      colors: {
        // Black (Primary text and buttons)
        'app-black': {
          DEFAULT: '#191818',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#191818',
          950: '#0f0e0e',
        },
        // White (Text/cards)
        'app-white': {
          DEFAULT: '#ffffff',
          pure: '#ffffff',
          50: '#ffffff',
          100: '#fefefe',
          200: '#fdfdfd',
          300: '#fcfcfc',
          400: '#fbfbfb',
          500: '#fafafa',
          600: '#f5f5f5',
          700: '#f0f0f0',
          800: '#e8e8e8',
          900: '#e0e0e0',
        },

       
    
        'app-pill-bg': {
          DEFAULT: '#f0eeeb'
        },
        // Global border color
        'app-border': {
          DEFAULT: '#7e757233'
        },
        // Light Background (30% opacity white for cards/components)
        'app-light-bg': {
          DEFAULT: 'rgb(255 255 255 / 30%)',
          solid: '#ffffff4d', // Approximate solid color equivalent
        },
        // Secondary Background (70% opacity beige for cards)
        'app-secondary-bg': {
          DEFAULT: 'rgb(246 245 244 / 70%)',
          solid: '#f6f5f4b3', // Approximate solid color equivalent
        },
        // Gray (Subtitle text)
        'app-gray': {
          DEFAULT: '#62615f',
          50: '#f6f6f6',
          100: '#eeeeee',
          200: '#e5e5e5',
          300: '#d9d9d9',
          400: '#b8b7b6',
          500: '#949391', // Light gray for other text
          600: '#62615f', // Gray text for subtitles
          700: '#4a4948',
          800: '#333231',
          900: '#1f1e1d',
        },
        // Light Gray (Other text)
        'app-light-gray': {
          DEFAULT: '#949391',
          50: '#fafafa',
          100: '#f7f7f7',
          200: '#f5f5f5',
          300: '#e8e8e7',
          400: '#d0cfce',
          500: '#b8b7b6',
          600: '#949391',
          700: '#7a7977',
          800: '#62615f',
          900: '#4a4948',
        },
        // Green (Primary green for buttons and main actions)
        'app-green': {
          DEFAULT: '#017c6e',
          50: '#f0fdfa',
          100: '#cde8e4', // Light green for badges
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#017c6e', // Primary green
          700: '#116759', // Green text for badges
          800: '#0f4a42',
          900: '#0d3530',
          950: '#042f2e',
        },
        // Purple (Main Accent) - Keeping original
        'app-purple': {
          DEFAULT: '#9771ff',
          50: '#f5f3ff',
          100: '#ede8ff',
          200: '#ddd4ff',
          300: '#c4b0ff',
          400: '#a888ff',
          500: '#9771ff',
          600: '#7c4fff',
          700: '#6939eb',
          800: '#5730c7',
          900: '#472aa3',
          950: '#2d1971',
        },
        // Yellow - Keeping original
        'app-yellow': {
          DEFAULT: '#f0ba2c',
          50: '#fefaec',
          100: '#fdf2ca',
          200: '#fbe798',
          300: '#f7d55c',
          400: '#f4c744',
          500: '#f0ba2c',
          600: '#e09a14',
          700: '#bb7714',
          800: '#975b17',
          900: '#7b4a17',
          950: '#462608',
        },
        // Red - Keeping original
        'app-red': {
          DEFAULT: '#fe6d66',
          50: '#fff0ef',
          100: '#ffdddb',
          200: '#ffc1bd',
          300: '#ff998f',
          400: '#ff8078',
          500: '#fe6d66',
          600: '#fc3b31',
          700: '#e72218',
          800: '#c01c15',
          900: '#9e1d18',
          950: '#560907',
        },
        // Blue - Keeping original
        'app-blue': {
          DEFAULT: '#345fd8',
          50: '#f0f5ff',
          100: '#e0eaff',
          200: '#bad4ff',
          300: '#85b3ff',
          400: '#4d8fff',
          500: '#345fd8',
          600: '#2448d1',
          700: '#1936b8',
          800: '#182e96',
          900: '#192b78',
          950: '#121c49',
        },
        
        // DARK MODE COLORS - Direct hex values, no CSS variables
        // These are specifically for dark mode usage with dark: prefix
        'dark': {
          'text': '#dddcd9',      // Light text for dark mode
          'heading': '#f0efed',   // Light heading for dark mode
          'bg': '#191818',        // Dark background
          'card': '#242323',      // Slightly lighter for cards
          'cardl': '#62615f1a',
          'border': '#62615f',    // Dark mode border
          'accent': '#34968b',    // Teal accent for dark mode (DEFAULT)
          'input': '#2a2928',     // Input background in dark mode
          'graybg': 'rgba(98, 97, 95, 0.1)',     // Gray background with 10% opacity
          'lightgraybg': 'rgba(74, 73, 72, 0.4)', // Light gray background with 40% opacity
          
          // Dark Accent Color Shades (Teal) - Full palette
          'accent-50': '#e6f7f5',   // Lightest teal - almost white with teal tint
          'accent-100': '#c0ebe7',   // Very light teal
          'accent-200': '#96dfd8',   // Light teal
          'accent-300': '#6cd3c9',   // Light-medium teal
          'accent-400': '#4dc7bb',   // Medium-light teal
          'accent-500': '#34968b',   // DEFAULT - Base teal accent
          'accent-600': '#2b7d74',   // Medium-dark teal
          'accent-700': '#23655e',   // Dark teal
          'accent-800': '#1b4d47',   // Darker teal
          'accent-900': '#143531',   // Very dark teal
          'accent-950': '#0a1f1d',   // Darkest teal - almost black
        },
        
        // Keep the original primary and gray colors for backward compatibility
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          750: '#293548',
        },
      },
      
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in-95': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'popup-in': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95) translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1) translateY(0)'
          },
        },
        'in': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(4px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'slide-in-from-bottom': {
          '0%': { 
            transform: 'translateY(8px)'
          },
          '100%': { 
            transform: 'translateY(0)'
          },
        },
        'shine': {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(200%)',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-delay-1': 'fade-in 0.3s ease-out 0.15s both',
        'fade-in-delay-2': 'fade-in 0.3s ease-out 0.3s both',
        'zoom-in-95': 'zoom-in-95 0.2s ease-out',
        'popup-in': 'popup-in 0.2s ease-out',
        'in': 'in 0.2s ease-out',
        'shine': 'shine 0.5s ease-in-out 0.6s',
      },
    },
  },
  plugins: [],
}
