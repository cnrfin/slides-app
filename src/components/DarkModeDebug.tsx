// Dark Mode Debug Component
import React, { useEffect, useState } from 'react';
import useUIStore from '@/stores/uiStore';

export default function DarkModeDebug() {
  const { theme } = useUIStore();
  const [documentClasses, setDocumentClasses] = useState('');
  const [dataTheme, setDataTheme] = useState('');

  useEffect(() => {
    const updateDebugInfo = () => {
      setDocumentClasses(document.documentElement.className);
      setDataTheme(document.documentElement.getAttribute('data-theme') || 'none');
    };

    updateDebugInfo();
    
    // Listen for changes
    const observer = new MutationObserver(updateDebugInfo);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class', 'data-theme'] 
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-w-sm">
      <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100">Dark Mode Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-semibold text-gray-700 dark:text-gray-300">Store theme:</span>{' '}
          <span className="font-mono text-blue-600 dark:text-blue-400">{theme}</span>
        </div>
        
        <div>
          <span className="font-semibold text-gray-700 dark:text-gray-300">HTML classes:</span>{' '}
          <span className="font-mono text-blue-600 dark:text-blue-400">
            {documentClasses || 'none'}
          </span>
        </div>
        
        <div>
          <span className="font-semibold text-gray-700 dark:text-gray-300">data-theme:</span>{' '}
          <span className="font-mono text-blue-600 dark:text-blue-400">{dataTheme}</span>
        </div>
        
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Test Colors:</div>
          
          <div className="space-y-1">
            <div className="p-2 bg-app-green-100 text-app-green dark:bg-dark-accent-500 dark:text-white rounded">
              Active Nav Item Test
            </div>
            
            <div className="p-2 bg-dark-accent-500 text-white rounded">
              Direct dark-accent-500
            </div>
            
            <div className="p-2 bg-dark-accent text-white rounded">
              Direct dark-accent
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
