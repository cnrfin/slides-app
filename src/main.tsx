// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import './styles/text-editor.css'

// Disable Konva warnings in development
if (import.meta.env.DEV) {
  // @ts-ignore
  window.Konva = { enableTrace: false }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)