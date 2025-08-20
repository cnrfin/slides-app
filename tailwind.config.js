/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Black (Font color)
        'app-black': {
          DEFAULT: '#000000',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        // White (Background/Card)
        'app-white': {
          DEFAULT: '#fafafa',
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
        // Light Gray (Secondary Background)
        'app-light-gray': {
          DEFAULT: '#f2f2f2',
          50: '#fafafa',
          100: '#f7f7f7',
          200: '#f5f5f5',
          300: '#f2f2f2',
          400: '#eeeeee',
          500: '#e8e8e8',
          600: '#e0e0e0',
          700: '#d6d6d6',
          800: '#cccccc',
          900: '#bfbfbf',
        },
        // Gray
        'app-gray': {
          DEFAULT: '#d0d0d0',
          50: '#f6f6f6',
          100: '#eeeeee',
          200: '#e5e5e5',
          300: '#d9d9d9',
          400: '#d0d0d0',
          500: '#c4c4c4',
          600: '#b8b8b8',
          700: '#a8a8a8',
          800: '#999999',
          900: '#8a8a8a',
        },
        // Dark Gray
        'app-dark-gray': {
          DEFAULT: '#7f7f7f',
          50: '#e8e8e8',
          100: '#d1d1d1',
          200: '#bababa',
          300: '#a3a3a3',
          400: '#8c8c8c',
          500: '#7f7f7f',
          600: '#6b6b6b',
          700: '#575757',
          800: '#434343',
          900: '#2f2f2f',
        },
        // Green
        'app-green': {
          DEFAULT: '#54cb56',
          50: '#f0fbf0',
          100: '#dcf5dd',
          200: '#baeabb',
          300: '#97df99',
          400: '#75d477',
          500: '#54cb56',
          600: '#3fb842',
          700: '#339936',
          800: '#287a2a',
          900: '#1f5b21',
          950: '#0f2e10',
        },
        // Purple (Main Accent)
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
        // Yellow
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
        // Red
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
        // Blue
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