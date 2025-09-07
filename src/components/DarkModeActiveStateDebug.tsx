// Debug component to identify dark mode issues
import React, { useEffect, useState } from 'react';
import useUIStore from '@/stores/uiStore';

export default function DarkModeActiveStateDebug() {
  const { theme } = useUIStore();
  const [isActive, setIsActive] = useState(true);
  const [documentInfo, setDocumentInfo] = useState({
    classes: '',
    dataTheme: '',
    computedStyles: null as any
  });

  useEffect(() => {
    const updateInfo = () => {
      const html = document.documentElement;
      setDocumentInfo({
        classes: html.className,
        dataTheme: html.getAttribute('data-theme') || 'none',
        computedStyles: null
      });

      // Get computed styles for test element
      const testEl = document.getElementById('test-active-element');
      if (testEl) {
        const styles = window.getComputedStyle(testEl);
        setDocumentInfo(prev => ({
          ...prev,
          computedStyles: {
            backgroundColor: styles.backgroundColor,
            color: styles.color
          }
        }));
      }
    };

    updateInfo();
    
    // Listen for changes
    const observer = new MutationObserver(updateInfo);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class', 'data-theme'] 
    });

    // Also update when theme changes
    window.addEventListener('theme:change', updateInfo);

    return () => {
      observer.disconnect();
      window.removeEventListener('theme:change', updateInfo);
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50 p-4 bg-white dark:bg-gray-800 border-2 border-red-500 rounded-lg shadow-2xl max-w-md">
      <h3 className="font-bold mb-3 text-red-600">Dark Mode Active State Debug</h3>
      
      {/* Document State */}
      <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
        <div><strong>Theme (store):</strong> {theme}</div>
        <div><strong>HTML class:</strong> {documentInfo.classes || 'none'}</div>
        <div><strong>data-theme:</strong> {documentInfo.dataTheme}</div>
      </div>

      {/* Test Active States */}
      <div className="space-y-2 mb-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Toggle Active State (currently: {isActive ? 'ACTIVE' : 'INACTIVE'})
        </button>

        <div className="space-y-2">
          {/* Test 1: Your exact classes */}
          <div 
            id="test-active-element"
            className={
              isActive 
                ? 'px-3 py-2 rounded bg-app-green-100 text-app-green dark:bg-[#34968b] dark:text-white font-medium'
                : 'px-3 py-2 rounded text-app-black dark:text-dark-text font-normal'
            }
          >
            1. Exact Classes (arbitrary value)
          </div>

          {/* Test 2: Using !important */}
          <div 
            className={
              isActive 
                ? 'px-3 py-2 rounded bg-app-green-100 text-app-green font-medium'
                : 'px-3 py-2 rounded text-app-black font-normal'
            }
            style={isActive && theme === 'dark' ? {
              backgroundColor: '#34968b !important',
              color: 'white !important'
            } as any : {}}
          >
            2. With !important inline styles
          </div>

          {/* Test 3: Direct style attribute */}
          <div 
            className="px-3 py-2 rounded font-medium"
            style={{
              backgroundColor: isActive ? (theme === 'dark' ? '#34968b' : '#cde8e4') : 'transparent',
              color: isActive ? (theme === 'dark' ? 'white' : '#017c6e') : (theme === 'dark' ? '#dddcd9' : '#191818')
            }}
          >
            3. Direct inline styles
          </div>

          {/* Test 4: Standard Tailwind colors */}
          <div 
            className={
              isActive 
                ? 'px-3 py-2 rounded bg-green-100 text-green-700 dark:bg-teal-600 dark:text-white font-medium'
                : 'px-3 py-2 rounded text-gray-900 dark:text-gray-100 font-normal'
            }
          >
            4. Standard Tailwind colors
          </div>
        </div>
      </div>

      {/* Computed Styles */}
      {documentInfo.computedStyles && (
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-xs">
          <div className="font-semibold mb-1">Computed Styles (Test 1):</div>
          <div>BG: {documentInfo.computedStyles.backgroundColor}</div>
          <div>Color: {documentInfo.computedStyles.color}</div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
        <p className="font-semibold">Check:</p>
        <ol className="list-decimal list-inside space-y-1 mt-1">
          <li>Which test shows correct colors in dark mode?</li>
          <li>Does toggling active state work?</li>
          <li>Are computed styles showing the teal color (#34968b)?</li>
        </ol>
      </div>
    </div>
  );
}
