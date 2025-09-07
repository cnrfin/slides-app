// Test component to debug dark mode nav active state
import React from 'react';

export default function NavItemDarkModeTest() {
  return (
    <div className="p-6 space-y-4 bg-gray-100 dark:bg-gray-900">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Nav Item Dark Mode Test
      </h2>
      
      {/* Test 1: Using arbitrary values */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Test 1: Arbitrary Values (Should Work)
        </h3>
        <div className="space-y-2">
          <div className="px-3 py-3 rounded-lg bg-app-green-100 text-app-green dark:bg-[#34968b] dark:text-white font-medium">
            Active with arbitrary value: dark:bg-[#34968b]
          </div>
        </div>
      </div>

      {/* Test 2: Using standard Tailwind colors */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Test 2: Standard Tailwind Colors (Should Work)
        </h3>
        <div className="space-y-2">
          <div className="px-3 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-teal-600 dark:text-white font-medium">
            Active with standard colors: dark:bg-teal-600
          </div>
        </div>
      </div>

      {/* Test 3: Direct background without dark prefix */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Test 3: Direct Classes (Should Always Show)
        </h3>
        <div className="space-y-2">
          <div className="px-3 py-3 rounded-lg bg-teal-600 text-white font-medium">
            Direct teal-600 (no dark prefix)
          </div>
        </div>
      </div>

      {/* Test 4: Using inline styles as fallback */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Test 4: Inline Styles (Should Work)
        </h3>
        <div className="space-y-2">
          <div 
            className="px-3 py-3 rounded-lg font-medium"
            style={{
              backgroundColor: document.documentElement.classList.contains('dark') || 
                               document.documentElement.getAttribute('data-theme') === 'dark' 
                               ? '#34968b' : '#cde8e4',
              color: document.documentElement.classList.contains('dark') || 
                     document.documentElement.getAttribute('data-theme') === 'dark' 
                     ? '#ffffff' : '#017c6e'
            }}
          >
            Active with inline styles
          </div>
        </div>
      </div>

      {/* Test 5: Testing the actual classes from sidebar */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Test 5: Exact Classes from Sidebar
        </h3>
        <div className="space-y-2">
          <div className="relative flex items-center justify-between px-3 py-3 rounded-lg text-menu transition-colors bg-app-green-100 text-app-green dark:bg-[#34968b] dark:text-white font-medium">
            Exact active state classes
          </div>
          <div className="relative flex items-center justify-between px-3 py-3 rounded-lg text-menu transition-colors text-app-black dark:text-dark-text font-normal hover:bg-white/50 dark:hover:bg-white/10">
            Exact inactive state classes
          </div>
        </div>
      </div>

      {/* Dark mode status */}
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Dark Mode Status
        </h3>
        <div className="space-y-1 text-xs font-mono">
          <div>
            HTML class: <span className="text-blue-600 dark:text-blue-400">
              {typeof document !== 'undefined' ? document.documentElement.className : 'N/A'}
            </span>
          </div>
          <div>
            data-theme: <span className="text-blue-600 dark:text-blue-400">
              {typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') || 'none' : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
