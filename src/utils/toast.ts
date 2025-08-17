// src/utils/toast.ts
import { showToast, clearLoadingToasts } from '@/components/ui/Toast'

interface ToastHelpers {
  success: (message: string, loadingId?: string) => void
  error: (message: string, loadingId?: string) => void
  info: (message: string, loadingId?: string) => void
  loading: (message: string, id?: string) => string
}

export const toast: ToastHelpers = {
  success: (message: string, loadingId?: string) => {
    if (loadingId) {
      clearLoadingToasts()
    }
    showToast('success', message)
  },
  
  error: (message: string, loadingId?: string) => {
    if (loadingId) {
      clearLoadingToasts()
    }
    showToast('error', message)
  },
  
  info: (message: string, loadingId?: string) => {
    if (loadingId) {
      clearLoadingToasts()
    }
    showToast('info', message)
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
