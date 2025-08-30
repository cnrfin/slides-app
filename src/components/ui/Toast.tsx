import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'loading'

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
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      case 'loading':
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'info':
        return 'text-blue-800'
      case 'loading':
        return 'text-blue-800'
    }
  }

  const getCloseButtonColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-700 hover:text-green-900'
      case 'error':
        return 'text-red-700 hover:text-red-900'
      case 'info':
        return 'text-blue-700 hover:text-blue-900'
      case 'loading':
        return 'text-blue-700 hover:text-blue-900'
    }
  }

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
        ${getBackgroundColor()}
        transition-all duration-200 ease-out
        ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'}
      `}
      style={{ minWidth: '300px', maxWidth: '500px' }}
    >
      {getIcon()}
      <span className={`flex-1 text-sm font-medium ${getTextColor()}`}>
        {message}
      </span>
      {type !== 'loading' && (
        <button
          onClick={handleClose}
          className="p-1 hover:bg-white/50 rounded transition-colors"
        >
          <X className={`w-4 h-4 ${getCloseButtonColor()}`} />
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
