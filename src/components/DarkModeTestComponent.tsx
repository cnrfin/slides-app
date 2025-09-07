// Example component demonstrating proper dark mode usage with Tailwind
import React from 'react';

export default function DarkModeTestComponent() {
  return (
    <div className="p-6 space-y-4">
      {/* Example 1: Text colors */}
      <div className="p-4 border rounded-lg border-gray-200 dark:border-dark-border">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-heading mb-2">
          Dark Mode Text Example
        </h2>
        <p className="text-gray-600 dark:text-dark-text">
          This text changes color in dark mode using Tailwind utilities.
        </p>
      </div>

      {/* Example 2: Background colors */}
      <div className="p-4 bg-white dark:bg-dark-card rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-heading">
          Card with Dark Mode Background
        </h3>
        <p className="text-gray-600 dark:text-dark-text mt-2">
          This card has a white background in light mode and dark background in dark mode.
        </p>
      </div>

      {/* Example 3: Using app colors with dark mode */}
      <div className="p-4 bg-app-white dark:bg-dark-card border border-app-border dark:border-dark-border rounded-lg">
        <span className="text-lg font-semibold text-app-black dark:text-dark-heading">
          TutorSlides Component
        </span>
        <p className="text-app-gray dark:text-dark-text mt-2">
          Using app-specific colors with dark mode variants.
        </p>
      </div>

      {/* Example 4: Button with dark mode */}
      <button className="px-4 py-2 bg-app-green text-white rounded-lg hover:bg-app-green-700 dark:bg-dark-accent dark:hover:bg-app-green-600 transition-colors">
        Dark Mode Button
      </button>

      {/* Example 5: Input field with dark mode */}
      <input
        type="text"
        placeholder="Type something..."
        className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-input border border-gray-200 dark:border-dark-border rounded-lg text-gray-800 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-app-green dark:focus:ring-dark-accent"
      />

      {/* Example 6: Complex component with multiple dark mode classes */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-card dark:to-dark-bg rounded-xl border border-gray-200 dark:border-dark-border">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-heading mb-4">
          Complete Dark Mode Example
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-app-green dark:bg-dark-accent rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-dark-heading">
                Feature Title
              </h4>
              <p className="text-sm text-gray-600 dark:text-dark-text">
                This demonstrates multiple dark mode utilities working together.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Guide */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
          How to Use Dark Mode Classes
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <li>• Use <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">dark:</code> prefix for dark mode styles</li>
          <li>• Text: <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">text-gray-800 dark:text-dark-heading</code></li>
          <li>• Background: <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">bg-white dark:bg-dark-card</code></li>
          <li>• Border: <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">border-gray-200 dark:border-dark-border</code></li>
          <li>• Custom colors are defined in tailwind.config.js under <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">colors.dark</code></li>
        </ul>
      </div>
    </div>
  );
}
