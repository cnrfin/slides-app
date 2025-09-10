// src/stores/uiStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  // Sidebar state
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Theme state
  theme: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  initializeTheme: () => void;
  getEffectiveTheme: () => 'light' | 'dark';
}

const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Default to expanded (false)
      isSidebarCollapsed: false,
      
      // Default theme
      theme: 'system' as const,
      
      toggleSidebar: () => {
        const newState = !get().isSidebarCollapsed;
        set({ isSidebarCollapsed: newState });
        
        // Emit custom event for layout adjustment
        window.dispatchEvent(new CustomEvent('sidebar:toggle', { 
          detail: { isCollapsed: newState } 
        }));
      },
      
      setSidebarCollapsed: (collapsed) => {
        set({ isSidebarCollapsed: collapsed });
        
        // Emit custom event for layout adjustment
        window.dispatchEvent(new CustomEvent('sidebar:toggle', { 
          detail: { isCollapsed: collapsed } 
        }));
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        // Cycle through: light -> dark -> system -> light
        let newTheme: 'light' | 'dark' | 'system';
        if (currentTheme === 'light') {
          newTheme = 'dark';
        } else if (currentTheme === 'dark') {
          newTheme = 'system';
        } else {
          newTheme = 'light';
        }
        get().setTheme(newTheme);
      },
      
      setTheme: (theme) => {
        set({ theme });
        
        // Determine effective theme
        let effectiveTheme: 'light' | 'dark';
        if (theme === 'system') {
          effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
          effectiveTheme = theme;
        }
        
        // Apply theme to document - both data-theme and class for Tailwind
        if (effectiveTheme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
          document.documentElement.classList.remove('dark');
        }
        
        // Also save to localStorage for backward compatibility
        localStorage.setItem('theme', theme);
        
        // Emit custom event for theme change
        window.dispatchEvent(new CustomEvent('theme:change', { 
          detail: { theme, effectiveTheme } 
        }));
      },
      
      initializeTheme: () => {
        // Check for theme in localStorage first (for backward compatibility)
        const localStorageTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
        if (localStorageTheme) {
          // Use the theme from localStorage if it exists
          get().setTheme(localStorageTheme);
        } else {
          // Otherwise use the stored theme from zustand
          const storedTheme = get().theme;
          get().setTheme(storedTheme);
        }
        
        // Listen for system theme changes when using 'system' theme
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
          if (get().theme === 'system') {
            get().setTheme('system'); // Re-apply system theme
          }
        });
      },
      
      getEffectiveTheme: () => {
        const theme = get().theme;
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
      },
    }),
    {
      name: 'ui-storage', // unique name for localStorage key
      // Only persist the UI state, not functions
      partialize: (state) => ({ 
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme 
      }),
    }
  )
);

export default useUIStore;