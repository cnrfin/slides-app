import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react'
import useUIStore from '@/stores/uiStore'

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number // in milliseconds, 0 means no auto-dismiss
  onClose?: () => void
}

interface ToastState extends ToastProps {
  isVisible: boolean
}

const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)
  const { theme } = useUIStore()

  useEffect(() => {
    // Trigger animation on mount
    const showTimer = setTimeout(() => setIsVisible(true), 10)
    
    // Auto dismiss if duration is set
    let dismissTimer: NodeJS.Timeout | null = null
    if (duration > 0) {
      dismissTimer = setTimeout(() => {
        handleClose()
      }, duration)
    }

    return () => {
      clearTimeout(showTimer)
      if (dismissTimer) clearTimeout(dismissTimer)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.()
    }, 200) // Wait for animation to complete
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-app-green dark:text-dark-accent" strokeWidth={1.5} />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-app-red dark:text-app-red-400" strokeWidth={1.5} />
      case 'info':
        return <Info className="w-5 h-5 text-app-blue dark:text-app-blue-400" strokeWidth={1.5} />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-app-yellow-600 dark:text-app-yellow-500" strokeWidth={1.5} />
      case 'loading':
        return <Loader2 className="w-5 h-5 text-app-purple dark:text-app-purple-400 animate-spin" strokeWidth={1.5} />
    }
  }

  const getStyles = () => {
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm"
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-white dark:bg-dark-card border-app-green-200 dark:border-dark-accent/30`
      case 'error':
        return `${baseClasses} bg-white dark:bg-dark-card border-app-red-200 dark:border-app-red-900/30`
      case 'info':
        return `${baseClasses} bg-white dark:bg-dark-card border-app-blue-200 dark:border-app-blue-900/30`
      case 'warning':
        return `${baseClasses} bg-white dark:bg-dark-card border-app-yellow-200 dark:border-app-yellow-900/30`
      case 'loading':
        return `${baseClasses} bg-white dark:bg-dark-card border-app-purple-200 dark:border-app-purple-900/30`
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-app-black dark:text-dark-text'
      case 'error':
        return 'text-app-black dark:text-dark-text'
      case 'info':
        return 'text-app-black dark:text-dark-text'
      case 'warning':
        return 'text-app-black dark:text-dark-text'
      case 'loading':
        return 'text-app-black dark:text-dark-text'
    }
  }

  const getCloseButtonColor = () => {
    return 'text-app-gray dark:text-app-light-gray hover:text-app-black dark:hover:text-dark-text'
  }

  const getAccentBar = () => {
    switch (type) {
      case 'success':
        return 'bg-app-green dark:bg-dark-accent'
      case 'error':
        return 'bg-app-red dark:bg-app-red-400'
      case 'info':
        return 'bg-app-blue dark:bg-app-blue-400'
      case 'warning':
        return 'bg-app-yellow-600 dark:bg-app-yellow-500'
      case 'loading':
        return 'bg-app-purple dark:bg-app-purple-400'
    }
  }

  return (
    <div
      className={`
        ${getStyles()}
        transition-all duration-200 ease-out relative overflow-hidden
        ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'}
      `}
      style={{ minWidth: '320px', maxWidth: '500px' }}
    >
      {/* Accent bar on the left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getAccentBar()}`} />
      
      {/* Content */}
      <div className="ml-2 flex items-center gap-3 flex-1">
        {getIcon()}
        <span className={`flex-1 text-sm font-medium ${getTextColor()}`}>
          {message}
        </span>
      </div>
      
      {/* Close button */}
      {type !== 'loading' && (
        <button
          onClick={handleClose}
          className={`p-1.5 hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 rounded-md transition-colors ${getCloseButtonColor()}`}
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}

// Toast Container Component
const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastState[]>([])

  useEffect(() => {
    const handleShowToast = (event: CustomEvent<Omit<ToastProps, 'id'>>) => {
      const id = Date.now().toString()
      const newToast: ToastState = {
        ...event.detail,
        id,
        isVisible: true,
      }
      
      // If showing a non-loading toast, remove any existing loading toasts
      if (event.detail.type !== 'loading') {
        setToasts(prev => prev.filter(toast => toast.type !== 'loading').concat(newToast))
      } else {
        setToasts(prev => [...prev, newToast])
      }
    }
    
    const handleClearLoadingToasts = () => {
      setToasts(prev => prev.filter(toast => toast.type !== 'loading'))
    }

    window.addEventListener('showToast' as any, handleShowToast)
    window.addEventListener('clearLoadingToasts' as any, handleClearLoadingToasts)
    return () => {
      window.removeEventListener('showToast' as any, handleShowToast)
      window.removeEventListener('clearLoadingToasts' as any, handleClearLoadingToasts)
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  if (toasts.length === 0) return null

  return ReactDOM.createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  )
}

// Helper function to show toasts
export const showToast = (type: ToastType, message: string, duration?: number) => {
  const event = new CustomEvent('showToast', {
    detail: { type, message, duration }
  })
  window.dispatchEvent(event)
}

// Helper function to clear loading toasts
export const clearLoadingToasts = () => {
  const event = new CustomEvent('clearLoadingToasts')
  window.dispatchEvent(event)
}

export default ToastContainer
