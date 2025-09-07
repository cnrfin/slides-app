// Dark Accent Color Palette Preview Component
import React from 'react';

export default function DarkAccentColorPalette() {
  const accentShades = [
    { name: '50', class: 'bg-dark-accent-50', hex: '#e6f7f5', textColor: 'text-gray-800' },
    { name: '100', class: 'bg-dark-accent-100', hex: '#c0ebe7', textColor: 'text-gray-800' },
    { name: '200', class: 'bg-dark-accent-200', hex: '#96dfd8', textColor: 'text-gray-800' },
    { name: '300', class: 'bg-dark-accent-300', hex: '#6cd3c9', textColor: 'text-gray-800' },
    { name: '400', class: 'bg-dark-accent-400', hex: '#4dc7bb', textColor: 'text-gray-800' },
    { name: '500', class: 'bg-dark-accent-500 bg-dark-accent', hex: '#34968b', textColor: 'text-white', isDefault: true },
    { name: '600', class: 'bg-dark-accent-600', hex: '#2b7d74', textColor: 'text-white' },
    { name: '700', class: 'bg-dark-accent-700', hex: '#23655e', textColor: 'text-white' },
    { name: '800', class: 'bg-dark-accent-800', hex: '#1b4d47', textColor: 'text-white' },
    { name: '900', class: 'bg-dark-accent-900', hex: '#143531', textColor: 'text-white' },
    { name: '950', class: 'bg-dark-accent-950', hex: '#0a1f1d', textColor: 'text-white' },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-heading mb-2">
          Dark Accent Color Palette
        </h1>
        <p className="text-gray-600 dark:text-dark-text">
          Teal accent colors optimized for dark mode interfaces
        </p>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {accentShades.map((shade) => (
          <div
            key={shade.name}
            className="bg-white dark:bg-dark-card rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-dark-border"
          >
            <div className={`${shade.class} h-32 relative`}>
              {shade.isDefault && (
                <span className="absolute top-2 right-2 px-2 py-1 bg-white/90 dark:bg-black/50 text-xs font-semibold rounded">
                  DEFAULT
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-dark-heading">
                    dark-accent-{shade.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {shade.hex}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-heading">
          Usage Examples
        </h2>

        {/* Buttons */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-heading mb-4">
            Buttons
          </h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-dark-accent-500 hover:bg-dark-accent-600 text-white rounded-lg transition-colors">
              Primary Action
            </button>
            <button className="px-4 py-2 bg-dark-accent-600 hover:bg-dark-accent-700 text-white rounded-lg transition-colors">
              Darker Variant
            </button>
            <button className="px-4 py-2 bg-dark-accent-100 hover:bg-dark-accent-200 text-dark-accent-700 rounded-lg transition-colors">
              Light Variant
            </button>
            <button className="px-4 py-2 border-2 border-dark-accent-500 text-dark-accent-600 dark:text-dark-accent-400 hover:bg-dark-accent-50 dark:hover:bg-dark-accent-950 rounded-lg transition-colors">
              Outlined
            </button>
          </div>
        </div>

        {/* Text Colors */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-heading mb-4">
            Text Colors
          </h3>
          <div className="space-y-2">
            <p className="text-dark-accent-600 dark:text-dark-accent-400">
              This text uses accent-600 in light mode and accent-400 in dark mode
            </p>
            <p className="text-dark-accent-700 dark:text-dark-accent-300">
              This text uses accent-700 in light mode and accent-300 in dark mode
            </p>
            <p className="text-dark-accent-500">
              This text uses the default accent-500 in both modes
            </p>
          </div>
        </div>

        {/* Backgrounds */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-heading mb-4">
            Background Colors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-dark-accent-50 dark:bg-dark-accent-950 rounded-lg">
              <p className="text-dark-accent-700 dark:text-dark-accent-300 font-medium">
                Subtle Background
              </p>
              <p className="text-dark-accent-600 dark:text-dark-accent-400 text-sm mt-1">
                accent-50 / accent-950
              </p>
            </div>
            <div className="p-4 bg-dark-accent-100 dark:bg-dark-accent-900 rounded-lg">
              <p className="text-dark-accent-700 dark:text-dark-accent-300 font-medium">
                Light Background
              </p>
              <p className="text-dark-accent-600 dark:text-dark-accent-400 text-sm mt-1">
                accent-100 / accent-900
              </p>
            </div>
            <div className="p-4 bg-dark-accent-500 text-white rounded-lg">
              <p className="font-medium">
                Strong Background
              </p>
              <p className="text-sm mt-1 opacity-90">
                accent-500 (default)
              </p>
            </div>
          </div>
        </div>

        {/* Gradient */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-heading mb-4">
            Gradients
          </h3>
          <div className="h-24 bg-gradient-to-r from-dark-accent-300 via-dark-accent-500 to-dark-accent-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              Accent Gradient (300 → 500 → 700)
            </span>
          </div>
          <div className="h-24 bg-gradient-to-r from-dark-accent-50 to-dark-accent-200 rounded-lg flex items-center justify-center mt-4">
            <span className="text-dark-accent-700 font-semibold text-lg">
              Light Gradient (50 → 200)
            </span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-heading mb-4">
            Status Indicators
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-dark-accent-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 dark:text-dark-text">Active / Online</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-dark-accent-300 rounded-full"></div>
              <span className="text-gray-700 dark:text-dark-text">Ready</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-dark-accent-700 rounded-full"></div>
              <span className="text-gray-700 dark:text-dark-text">Processing</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-heading mb-4">
            Badges & Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-dark-accent-100 text-dark-accent-700 dark:bg-dark-accent-900 dark:text-dark-accent-300 rounded-full text-sm font-medium">
              New Feature
            </span>
            <span className="px-3 py-1 bg-dark-accent-500 text-white rounded-full text-sm font-medium">
              Premium
            </span>
            <span className="px-3 py-1 border border-dark-accent-500 text-dark-accent-600 dark:text-dark-accent-400 rounded-full text-sm font-medium">
              Beta
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-dark-accent-400 to-dark-accent-600 text-white rounded-full text-sm font-medium">
              Pro
            </span>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-gray-900 text-gray-100 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Usage in Code
        </h3>
        <pre className="text-sm overflow-x-auto">
          <code>{`// Background colors
className="bg-dark-accent-500"          // Default teal
className="bg-dark-accent-100"          // Light teal
className="bg-dark-accent-900"          // Dark teal

// Text colors
className="text-dark-accent-600"        // Dark teal text
className="text-dark-accent-400"        // Medium teal text

// Hover states
className="hover:bg-dark-accent-600"    // Darker on hover
className="hover:text-dark-accent-500"  // Teal text on hover

// Dark mode specific
className="dark:bg-dark-accent-950"     // Very dark in dark mode
className="dark:text-dark-accent-300"   // Light teal text in dark mode

// Borders
className="border-dark-accent-500"      // Teal border
className="focus:ring-dark-accent-400"  // Teal focus ring

// Gradients
className="bg-gradient-to-r from-dark-accent-400 to-dark-accent-600"`}</code>
        </pre>
      </div>
    </div>
  );
}
