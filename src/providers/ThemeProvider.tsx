// src/providers/ThemeProvider.tsx
import { useEffect } from 'react';
import useUIStore from '@/stores/uiStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { initializeTheme } = useUIStore();

  useEffect(() => {
    // Initialize theme on mount
    initializeTheme();
  }, [initializeTheme]);

  return <>{children}</>;
}
