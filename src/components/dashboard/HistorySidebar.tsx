// src/components/dashboard/HistorySidebar.tsx
import { useState, useEffect } from 'react'
import { History, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useAuthStore from '@/stores/authStore'
import { getPromptHistory, type PromptHistoryItem } from '@/lib/prompt-history'

export default function HistorySidebar() {
  const { t } = useTranslation('dashboard')
  const [isOpen, setIsOpen] = useState(false)
  const [prompts, setPrompts] = useState<PromptHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthStore()

  // Fetch prompt history when sidebar opens
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchPromptHistory()
    }
  }, [isOpen, user?.id])

  const fetchPromptHistory = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const result = await getPromptHistory(user.id, 50)
      if (result.success) {
        setPrompts(result.data)
      }
    } catch (error) {
      console.error('Error fetching prompt history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('history.justNow')
    if (diffMins < 60) return t('history.minutesAgo', { count: diffMins })
    if (diffHours < 24) return t('history.hoursAgo', { count: diffHours })
    if (diffDays < 7) return t('history.daysAgo', { count: diffDays })
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const handlePromptClick = (prompt: string) => {
    // You can add functionality here to use the selected prompt
    // For example, navigate to canvas with this prompt or copy to clipboard
    navigator.clipboard.writeText(prompt)
    
    // Show a brief notification (you might want to add a toast component)
    const notification = document.createElement('div')
    notification.className = 'fixed bottom-4 right-4 bg-gray-800 dark:bg-dark-card text-white dark:text-dark-text px-4 py-2 rounded-lg shadow-lg z-50 animate-in'
    notification.textContent = t('history.copiedToClipboard')
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 2000)
  }

  // Close sidebar when clicking escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <>
      {/* History Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-5 right-4 z-30 flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
        aria-label="View prompt history"
      >
        <History className="w-5 h-5" strokeWidth={1.5} />
        <span className="text-sm font-medium">{t('history.title')}</span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/50 z-40 animate-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* History Sidebar */}
      <aside
        className={`fixed right-0 top-0 h-screen w-64 bg-white dark:bg-dark-card shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-heading">{t('history.title')}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close history"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-600 dark:border-dark-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-8 px-4">
              <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('history.noPromptsYet')}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                {t('history.promptHistoryInfo')}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {prompts.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePromptClick(item.prompt)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-gray-700 group"
                >
                  <p className="text-sm text-gray-900 dark:text-gray-200 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-dark-accent transition-colors">
                    {item.prompt}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDate(item.created_at)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {prompts.length > 0 && (
          <div className="p-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {t('history.clickToCopy')}
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
