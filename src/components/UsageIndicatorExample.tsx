// Example: How to integrate UsageIndicator into your generation UI
// This shows how to add the usage indicator to your lesson generation page

import React, { useState, useEffect } from 'react'
import { UsageIndicator, UsageIndicatorMini } from '@/components/UsageIndicator'
import { validateGenerationLimits } from '@/services/vocabularyContext'
import { getUserProfile, getCurrentUser } from '@/lib/database'

// Example 1: In the header/navbar
export function AppHeader() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])
  
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Language Learning App</h1>
      {user && (
        <div className="flex items-center gap-4">
          <UsageIndicatorMini userId={user.id} />
          <UserMenu />
        </div>
      )}
    </header>
  )
}

// Example 2: In the generation page
export function LessonGenerationPage() {
  const [user, setUser] = useState(null)
  const [userPlan, setUserPlan] = useState('free')
  const [isGeniusMode, setIsGeniusMode] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [generationError, setGenerationError] = useState(null)
  
  useEffect(() => {
    async function loadUserData() {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        const profile = await getUserProfile(currentUser.id)
        setUserPlan(profile?.subscription_plan || 'free')
      }
    }
    loadUserData()
  }, [])
  
  const handleGenerate = async () => {
    if (!user) return
    
    // Check limits before generation
    const validation = await validateGenerationLimits(
      user.id, 
      userPlan, 
      isGeniusMode
    )
    
    if (!validation.allowed) {
      setGenerationError(validation.reason)
      setShowUpgradeModal(true)
      return
    }
    
    // Proceed with generation
    try {
      await generateLesson({
        // ... your generation params
        isGeniusMode
      })
    } catch (error) {
      setGenerationError(error.message)
    }
  }
  
  return (
    <div className="p-6">
      {/* Usage indicator at the top */}
      {user && (
        <UsageIndicator 
          userId={user.id} 
          onUpgradeClick={() => setShowUpgradeModal(true)}
          className="mb-4"
        />
      )}
      
      {/* Generation form */}
      <div className="space-y-4">
        {/* Genius mode toggle (disabled for free users) */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="genius-mode"
            checked={isGeniusMode}
            onChange={(e) => setIsGeniusMode(e.target.checked)}
            disabled={userPlan === 'free'}
            className="rounded"
          />
          <label htmlFor="genius-mode" className="text-sm">
            ✨ Genius Mode
            {userPlan === 'free' && (
              <span className="ml-2 text-xs text-app-gray">
                (Upgrade to Pro to unlock)
              </span>
            )}
          </label>
        </div>
        
        {/* Generate button */}
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-app-green dark:bg-dark-accent text-white rounded-lg"
        >
          Generate Lesson
        </button>
      </div>
      
      {/* Error display */}
      {generationError && (
        <div className="mt-4 p-3 bg-app-red/10 border border-app-red/30 rounded-lg">
          <p className="text-sm text-app-red">{generationError}</p>
        </div>
      )}
      
      {/* Upgrade modal */}
      {showUpgradeModal && (
        <UpgradeModal 
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={userPlan}
        />
      )}
    </div>
  )
}

// Example 3: Upgrade modal
export function UpgradeModal({ onClose, currentPlan }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-card rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-bold mb-4">Upgrade Your Plan</h2>
        
        <div className="space-y-4">
          {/* Free plan (current) */}
          <div className={`p-4 border rounded-lg ${currentPlan === 'free' ? 'border-app-green' : 'border-app-border'}`}>
            <h3 className="font-medium">Free</h3>
            <ul className="text-sm text-app-gray mt-2">
              <li>✓ 5 generations/month</li>
              <li>✗ No Genius mode</li>
              <li>✓ Basic vocabulary context (10 words)</li>
            </ul>
          </div>
          
          {/* Pro plan */}
          <div className={`p-4 border rounded-lg ${currentPlan === 'pro' ? 'border-app-green' : 'border-app-border'}`}>
            <h3 className="font-medium">Pro - $X/month</h3>
            <ul className="text-sm text-app-gray mt-2">
              <li>✓ 100 generations/month</li>
              <li>✓ 50 Genius generations</li>
              <li>✓ Smart vocabulary context (50 words)</li>
            </ul>
            {currentPlan === 'free' && (
              <button className="mt-3 w-full px-3 py-2 bg-app-green text-white rounded-lg">
                Upgrade to Pro
              </button>
            )}
          </div>
          
          {/* Max plan */}
          <div className={`p-4 border rounded-lg ${currentPlan === 'max' ? 'border-app-green' : 'border-app-border'}`}>
            <h3 className="font-medium">Max - $Y/month</h3>
            <ul className="text-sm text-app-gray mt-2">
              <li>✓ Unlimited generations</li>
              <li>✓ 100 Genius generations</li>
              <li>✓ Full vocabulary context (100 words)</li>
            </ul>
            {currentPlan !== 'max' && (
              <button className="mt-3 w-full px-3 py-2 bg-app-purple-600 text-white rounded-lg">
                Upgrade to Max
              </button>
            )}
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full px-3 py-2 border border-app-border rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  )
}
