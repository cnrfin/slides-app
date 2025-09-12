// src/components/UsageIndicator.tsx
import { useEffect, useState } from 'react'
import { getCurrentMonthUsage, getUserProfile } from '@/lib/database'
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans'
import { AlertCircle, Zap, Crown } from 'lucide-react'

interface UsageIndicatorProps {
  userId: string
  onUpgradeClick?: () => void
  className?: string
}

export function UsageIndicator({ userId, onUpgradeClick, className = '' }: UsageIndicatorProps) {
  const [usage, setUsage] = useState<any>(null)
  const [plan, setPlan] = useState<string>('free')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadUsage() {
      try {
        setLoading(true)
        const [profile, monthUsage] = await Promise.all([
          getUserProfile(userId),
          getCurrentMonthUsage(userId)
        ])
        
        setPlan(profile?.subscription_plan || 'free')
        setUsage(monthUsage)
      } catch (error) {
        console.error('Failed to load usage:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      loadUsage()
    }
  }, [userId])
  
  if (loading || !usage) {
    return (
      <div className={`flex items-center gap-4 p-3 bg-white dark:bg-dark-card rounded-lg border border-app-border dark:border-dark-border/20 ${className}`}>
        <div className="text-sm text-app-gray dark:text-app-light-gray animate-pulse">
          Loading usage...
        </div>
      </div>
    )
  }
  
  const limits = SUBSCRIPTION_PLANS[plan]
  const regularUsed = usage.lessons_generated || 0
  const geniusUsed = usage.genius_generations || 0
  
  const regularRemaining = limits.monthlyGenerations === -1 
    ? 'Unlimited' 
    : Math.max(0, limits.monthlyGenerations - regularUsed)
    
  const geniusRemaining = Math.max(0, limits.geniusGenerations - geniusUsed)
  
  const isNearLimit = typeof regularRemaining === 'number' && regularRemaining <= 2
  const isAtLimit = regularRemaining === 0
  
  return (
    <div className={`flex items-center gap-4 p-3 bg-white dark:bg-dark-card rounded-lg border border-app-border dark:border-dark-border/20 ${className}`}>
      <div className="flex items-center gap-2">
        <Zap 
          size={16} 
          className={`${isAtLimit ? 'text-app-red' : isNearLimit ? 'text-app-yellow-600' : 'text-app-gray'} dark:text-app-light-gray`} 
        />
        <span className="text-sm text-app-gray dark:text-app-light-gray">
          Generations: <span className={`font-medium ${isAtLimit ? 'text-app-red' : isNearLimit ? 'text-app-yellow-600' : ''}`}>
            {regularRemaining}
          </span>
          {typeof regularRemaining === 'number' && ` / ${limits.monthlyGenerations}`}
        </span>
      </div>
      
      {limits.geniusGenerations > 0 && (
        <div className="flex items-center gap-2">
          <Crown size={16} className="text-app-purple-600 dark:text-dark-accent" />
          <span className="text-sm text-app-gray dark:text-app-light-gray">
            Genius: <span className="font-medium">{geniusRemaining} / {limits.geniusGenerations}</span>
          </span>
        </div>
      )}
      
      {(isAtLimit || (plan === 'free' && regularUsed >= 3)) && (
        <button 
          onClick={onUpgradeClick}
          className="ml-auto text-xs text-app-green-700 dark:text-dark-accent hover:underline font-medium"
        >
          Upgrade for more
        </button>
      )}
    </div>
  )
}

// Mini version for header/navbar
export function UsageIndicatorMini({ userId }: { userId: string }) {
  const [usage, setUsage] = useState<any>(null)
  const [plan, setPlan] = useState<string>('free')
  
  useEffect(() => {
    async function loadUsage() {
      try {
        const [profile, monthUsage] = await Promise.all([
          getUserProfile(userId),
          getCurrentMonthUsage(userId)
        ])
        
        setPlan(profile?.subscription_plan || 'free')
        setUsage(monthUsage)
      } catch (error) {
        console.error('Failed to load usage:', error)
      }
    }
    
    if (userId) {
      loadUsage()
    }
  }, [userId])
  
  if (!usage) return null
  
  const limits = SUBSCRIPTION_PLANS[plan]
  const regularUsed = usage.lessons_generated || 0
  const regularRemaining = limits.monthlyGenerations === -1 
    ? '∞' 
    : Math.max(0, limits.monthlyGenerations - regularUsed)
  
  const isNearLimit = typeof regularRemaining === 'number' && regularRemaining <= 2
  const isAtLimit = regularRemaining === 0
  
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-app-secondary-bg-solid dark:bg-white/5 rounded-md">
      <Zap 
        size={14} 
        className={`${isAtLimit ? 'text-app-red' : isNearLimit ? 'text-app-yellow-600' : 'text-app-gray'} dark:text-app-light-gray`} 
      />
      <span className={`text-xs font-medium ${isAtLimit ? 'text-app-red' : isNearLimit ? 'text-app-yellow-600' : 'text-app-gray dark:text-app-light-gray'}`}>
        {regularRemaining}
      </span>
    </div>
  )
}
