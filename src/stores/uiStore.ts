// src/stores/uiStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  // Sidebar state
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Theme state
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  initializeTheme: () => void;
}

const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Default to expanded (false)
      isSidebarCollapsed: false,
      
      // Default theme
      theme: 'light' as const,
      
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
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
      
      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to document - both data-theme and class for Tailwind
        if (theme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
          document.documentElement.classList.remove('dark');
        }
        
        // Emit custom event for theme change
        window.dispatchEvent(new CustomEvent('theme:change', { 
          detail: { theme } 
        }));
      },
      
      initializeTheme: () => {
        const storedTheme = get().theme;
        
        // Apply stored theme on initialization - both data-theme and class for Tailwind
        if (storedTheme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
          document.documentElement.classList.remove('dark');
        }
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