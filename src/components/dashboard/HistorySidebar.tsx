// src/components/dashboard/HistorySidebar.tsx
import { useState, useEffect } from 'react'
import { History, X, Copy, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useAuthStore from '@/stores/authStore'
import { getPromptHistory, type PromptHistoryItem } from '@/lib/prompt-history'
import { toast } from '@/utils/toast'

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
      toast.error(t('history.fetchError'))
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
    navigator.clipboard.writeText(prompt)
    toast.success(t('history.copiedToClipboard'))
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
      {/* History Button - Updated styling */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-30 flex items-center gap-2 px-3 py-2 bg-transparent rounded-lg hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all group"
        aria-label="View prompt history"
      >
        <History className="w-5 h-5 text-app-black dark:text-dark-text transition-colors" strokeWidth={1.5} />
        <span className="text-sm font-medium text-app-black dark:text-dark-text group-hover:text-app-black dark:group-hover:text-dark-text transition-colors">
          {t('history.title')}
        </span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-black/50 dark:bg-black/70 z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* History Sidebar - Updated styling */}
      <aside
        className={`fixed right-0 top-0 h-screen w-80 bg-white dark:bg-dark-card shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header - Updated styling */}
        <div className="flex items-center justify-between p-4 border-b border-app-border dark:border-dark-border/20">
          <h2 className="text-lg font-semibold text-app-black dark:text-dark-heading" style={{ fontFamily: 'Inter, sans-serif' }}>
            {t('history.title')}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 rounded-lg transition-all"
            aria-label="Close history"
          >
            <X className="w-5 h-5 text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content - Updated styling */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-app-purple dark:border-dark-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-app-secondary-bg-solid dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
              </div>
              <p className="text-app-black dark:text-dark-text font-medium mb-1">
                {t('history.noPromptsYet')}
              </p>
              <p className="text-app-gray dark:text-app-light-gray text-sm">
                {t('history.promptHistoryInfo')}
              </p>
            </div>
          ) : (
            <div className="py-1">
              {prompts.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handlePromptClick(item.prompt)}
                  className="w-full text-left px-4 py-3 hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all border-b border-app-border/10 dark:border-dark-border/10 last:border-b-0 group relative"
                >
                  {/* Copy indicator on hover */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy className="w-4 h-4 text-app-purple dark:text-dark-accent" strokeWidth={1.5} />
                  </div>
                  
                  <p className="text-sm text-app-black dark:text-dark-text line-clamp-2 pr-8 group-hover:text-app-purple-600 dark:group-hover:text-dark-accent transition-colors">
                    {item.prompt}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Clock className="w-3 h-3 text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
                    <p className="text-xs text-app-gray dark:text-app-light-gray">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </button>
              ))}
              
              {/* Load more indicator if we have max results */}
              {prompts.length >= 50 && (
                <div className="p-4 text-center">
                  <p className="text-xs text-app-gray dark:text-app-light-gray">
                    {t('history.showingRecent', { count: 50 })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Updated styling */}
        {prompts.length > 0 && (
          <div className="p-4 border-t border-app-border/10 dark:border-dark-border/10 bg-app-secondary-bg-solid/50 dark:bg-white/[0.02]">
            <div className="flex items-center justify-center gap-2">
              <Copy className="w-3.5 h-3.5 text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
              <p className="text-xs text-app-gray dark:text-app-light-gray">
                {t('history.clickToCopy')}
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
