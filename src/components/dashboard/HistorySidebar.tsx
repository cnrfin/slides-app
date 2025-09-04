// src/components/dashboard/HistorySidebar.tsx
import { useState, useEffect } from 'react'
import { History, X } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { getPromptHistory, type PromptHistoryItem } from '@/lib/prompt-history'

export default function HistorySidebar() {
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

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
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
    notification.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in'
    notification.textContent = 'Prompt copied to clipboard'
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
        className="fixed top-5 right-4 z-30 flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors group"
        aria-label="View prompt history"
      >
        <History className="w-5 h-5" strokeWidth={1.5} />
        <span className="text-sm font-medium">History</span>
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
        className={`fixed right-0 top-0 h-screen w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">History</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close history"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-8 px-4">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No prompts yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Your prompt history will appear here
              </p>
            </div>
          ) : (
            <div className="py-2">
              {prompts.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePromptClick(item.prompt)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 group"
                >
                  <p className="text-sm text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {item.prompt}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(item.created_at)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {prompts.length > 0 && (
          <div className="p-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Click a prompt to copy to clipboard
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
