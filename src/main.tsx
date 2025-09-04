// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './AppRouter.tsx'
import './index.css'
import './i18n/config' // Initialize i18n

// Run Google OAuth setup check in development
if (import.meta.env.DEV) {
  import('./utils/checkGoogleSetup').then(module => {
    // Check will run automatically
  }).catch(error => {
    console.error('Failed to load setup checker:', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)