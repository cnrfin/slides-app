// src/utils/toast.ts
import { showToast, clearLoadingToasts } from '@/components/ui/Toast'

interface ToastOptions {
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastHelpers {
  success: (message: string, optionsOrLoadingId?: string | ToastOptions) => void
  error: (message: string, optionsOrLoadingId?: string | ToastOptions) => void
  info: (message: string, optionsOrLoadingId?: string | ToastOptions) => void
  warning: (message: string, options?: ToastOptions) => void
  loading: (message: string, id?: string) => string
}

export const toast: ToastHelpers = {
  success: (message: string, optionsOrLoadingId?: string | ToastOptions) => {
    if (typeof optionsOrLoadingId === 'string') {
      clearLoadingToasts()
      showToast('success', message)
    } else {
      const options = optionsOrLoadingId || {}
      showToast('success', message, options.duration)
      // Note: action button is not yet supported in the current Toast component
      if (options.action) {
        console.log('Toast action requested but not yet implemented:', options.action)
      }
    }
  },
  
  error: (message: string, optionsOrLoadingId?: string | ToastOptions) => {
    if (typeof optionsOrLoadingId === 'string') {
      clearLoadingToasts()
      showToast('error', message)
    } else {
      const options = optionsOrLoadingId || {}
      showToast('error', message, options.duration)
      if (options.action) {
        console.log('Toast action requested but not yet implemented:', options.action)
      }
    }
  },
  
  info: (message: string, optionsOrLoadingId?: string | ToastOptions) => {
    if (typeof optionsOrLoadingId === 'string') {
      clearLoadingToasts()
      showToast('info', message)
    } else {
      const options = optionsOrLoadingId || {}
      showToast('info', message, options.duration)
      if (options.action) {
        console.log('Toast action requested but not yet implemented:', options.action)
      }
    }
  },
  
  warning: (message: string, options?: ToastOptions) => {
    // Use 'info' type for warnings as the current Toast component doesn't have a warning type
    showToast('info', message, options?.duration)
    if (options?.action) {
      console.log('Toast action requested but not yet implemented:', options.action)
    }
  },
  
  loading: (message: string, id?: string) => {
    // If updating an existing loading toast, clear it first
    if (id) {
      clearLoadingToasts()
    }
    showToast('loading', message, 0) // 0 duration means no auto-dismiss
    return id || Date.now().toString()
  }
}
