// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './AppRouter'
import { clearStaleSessionData } from './utils/session-utils'
import './styles/globals.css'
import './styles/text-editor.css'

// Clear any stale session data on app startup
clearStaleSessionData()

// Disable Konva warnings in development
if (import.meta.env.DEV) {
  // @ts-ignore
  window.Konva = { enableTrace: false }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
)
