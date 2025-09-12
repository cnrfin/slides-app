// src/config/subscription-plans.ts

import type { PlanLimits } from '@/types/vocabulary-context.types'

export const SUBSCRIPTION_PLANS: Record<string, PlanLimits> = {
  free: {
    plan: 'free',
    monthlyGenerations: 5,
    geniusGenerations: 0,
    vocabularyWordLimit: 10
  },
  pro: {
    plan: 'pro',
    monthlyGenerations: 100,
    geniusGenerations: 50,
    vocabularyWordLimit: 50
  },
  max: {
    plan: 'max',
    monthlyGenerations: -1, // Unlimited
    geniusGenerations: 100,
    vocabularyWordLimit: 100
  }
}

export const DEFAULT_PLAN = 'free'

// Helper functions for plan management
export function getPlanLimits(plan: string = DEFAULT_PLAN): PlanLimits {
  return SUBSCRIPTION_PLANS[plan] || SUBSCRIPTION_PLANS[DEFAULT_PLAN]
}

export function isGenerationAllowed(
  plan: string,
  currentUsage: number,
  isGeniusMode: boolean = false
): { allowed: boolean; reason?: string } {
  const limits = getPlanLimits(plan)
  
  if (isGeniusMode) {
    if (limits.geniusGenerations === 0) {
      return { 
        allowed: false, 
        reason: 'Genius mode is not available on the Free plan. Please upgrade to Pro or Max.' 
      }
    }
    if (limits.geniusGenerations > 0 && currentUsage >= limits.geniusGenerations) {
      return { 
        allowed: false, 
        reason: `You've reached your monthly limit of ${limits.geniusGenerations} Genius generations.` 
      }
    }
  } else {
    if (limits.monthlyGenerations > 0 && currentUsage >= limits.monthlyGenerations) {
      return { 
        allowed: false, 
        reason: `You've reached your monthly limit of ${limits.monthlyGenerations} generations.` 
      }
    }
  }
  
  return { allowed: true }
}

export function getRemainingGenerations(
  plan: string,
  regularUsed: number,
  geniusUsed: number
): { regular: number | 'unlimited'; genius: number } {
  const limits = getPlanLimits(plan)
  
  return {
    regular: limits.monthlyGenerations === -1 
      ? 'unlimited' 
      : Math.max(0, limits.monthlyGenerations - regularUsed),
    genius: Math.max(0, limits.geniusGenerations - geniusUsed)
  }
}