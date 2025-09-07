// src/stores/authStore.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { onAuthStateChange, getInitialSession, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } from '@/lib/auth'
import { getCurrentMonthUsage, getUserStudentProfiles } from '@/lib/database'
import { supabase } from '@/lib/supabase'

interface AuthUser {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  subscription_tier: 'free' | 'pro' | 'max'
  subscription_status: 'active' | 'cancelled' | 'expired'
  teaching_languages: string[]
  native_language?: string
  currency: string
  hourly_rate?: number
  avg_lesson_prep_time_minutes: number
}

interface StudentProfile {
  id: string
  name: string
  target_language: string
  native_language?: string
  level: 'beginner_a1' | 'high_beginner_a2' | 'intermediate_b1' | 'high_intermediate_b2' | 'advanced_c1'
  goals: string[]
  interests?: string
  notes?: string
}

interface UsageData {
  lessons_generated: number
  pdf_exports: number
  storage_used_mb: number
  student_profiles_count: number
}

interface AuthStore {
  // State
  user: AuthUser | null
  studentProfiles: StudentProfile[]
  currentMonthUsage: UsageData | null
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>
  signOut: () => Promise<void>
  loadStudentProfiles: () => Promise<void>
  loadUsageData: () => Promise<void>
  refreshUserData: () => Promise<void>
  
  // Internal
  setUser: (user: AuthUser | null) => void
  initialize: () => Promise<void>
}

const useAuthStore = create<AuthStore>()(
  immer((set, get) => ({
    // Initial state
    user: null,
    studentProfiles: [],
    currentMonthUsage: null,
    isLoading: true,  // Start with loading true
    isInitialized: false,
    
    initialize: async () => {
      if (get().isInitialized) return
      
      console.log('🔐 Initializing auth store...')
      
      set(state => {
        state.isInitialized = true
        // Keep loading true until we get auth state
      })
      
      // First, check for existing session
      console.log('🔍 Checking for existing session...')
      try {
        const { user: initialUser, profile: initialProfile } = await getInitialSession()
        
        if (initialUser && initialProfile) {
          console.log('✅ Found existing session, restoring user...')
          const authUser: AuthUser = {
            id: initialProfile.id,
            email: initialProfile.email,
            display_name: initialProfile.display_name,
            avatar_url: initialProfile.avatar_url,
            subscription_tier: initialProfile.subscription_tier,
            subscription_status: initialProfile.subscription_status,
            teaching_languages: initialProfile.teaching_languages || [],
            native_language: initialProfile.native_language,
            currency: initialProfile.currency,
            hourly_rate: initialProfile.hourly_rate,
            avg_lesson_prep_time_minutes: initialProfile.avg_lesson_prep_time_minutes,
          }
          
          set(state => {
            state.user = authUser
            state.isLoading = false
          })
          
          // Load additional user data
          get().loadStudentProfiles()
          get().loadUsageData()
        } else {
          console.log('❌ No existing session found')
          set(state => {
            state.isLoading = false
          })
        }
      } catch (error) {
        console.error('Error checking initial session:', error)
        set(state => {
          state.isLoading = false
        })
      }
      
      // Set up auth state listener for future changes
      console.log('👂 Setting up auth state change listener...')
      const { data: { subscription } } = onAuthStateChange((user, profile) => {
        console.log('🔄 Auth state changed:', { user: !!user, profile: !!profile })
        
        // Make the entire handler non-blocking by wrapping in setTimeout
        // This ensures nothing blocks the Supabase auth state change callback
        setTimeout(() => {
          if (user && profile) {
            console.log('✅ User authenticated, updating profile...')
            const authUser: AuthUser = {
              id: profile.id,
              email: profile.email,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
              subscription_tier: profile.subscription_tier,
              subscription_status: profile.subscription_status,
              teaching_languages: profile.teaching_languages || [],
              native_language: profile.native_language,
              currency: profile.currency,
              hourly_rate: profile.hourly_rate,
              avg_lesson_prep_time_minutes: profile.avg_lesson_prep_time_minutes,
            }
            
            set(state => {
              state.user = authUser
              state.isLoading = false
            })
            
            // Load additional user data - these are non-blocking
            get().loadStudentProfiles()
            get().loadUsageData()
          } else {
            console.log('❌ User signed out')
            set(state => {
              state.user = null
              state.studentProfiles = []
              state.currentMonthUsage = null
              state.isLoading = false
            })
          }
        }, 0)
      })
      
      // Clean up subscription when store is destroyed
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          subscription?.unsubscribe()
        })
      }
    },
    
    setUser: (user) => set(state => {
      state.user = user
    }),
    
    signInWithGoogle: async () => {
      set(state => { state.isLoading = true })
      try {
        await signInWithGoogle()
        // Auth state change will handle the rest
      } catch (error) {
        set(state => { state.isLoading = false })
        throw error
      }
    },
    
    signInWithEmail: async (email, password) => {
      set(state => { state.isLoading = true })
      try {
        await signInWithEmail(email, password)
        // Auth state change will handle the rest
      } catch (error) {
        set(state => { state.isLoading = false })
        throw error
      }
    },
    
    signUpWithEmail: async (email, password, displayName) => {
      set(state => { state.isLoading = true })
      try {
        await signUpWithEmail(email, password, displayName)
        // Auth state change will handle the rest
      } catch (error) {
        set(state => { state.isLoading = false })
        throw error
      }
    },
    
    signOut: async () => {
      set(state => { state.isLoading = true })
      try {
        await signOut()
        // Auth state change will handle the rest
      } catch (error) {
        set(state => { state.isLoading = false })
        throw error
      }
    },
    
    loadStudentProfiles: async () => {
      const user = get().user
      if (!user) return
      
      try {
        const profiles = await getUserStudentProfiles(user.id)
        set(state => {
          state.studentProfiles = profiles
        })
      } catch (error) {
        console.error('Error loading student profiles:', error)
      }
    },
    
    loadUsageData: async () => {
      const user = get().user
      if (!user) return
      
      try {
        const usage = await getCurrentMonthUsage(user.id)
        set(state => {
          state.currentMonthUsage = usage
        })
      } catch (error) {
        console.error('Error loading usage data:', error)
        // Don't fail completely - just use default values
        set(state => {
          state.currentMonthUsage = {
            lessons_generated: 0,
            pdf_exports: 0,
            storage_used_mb: 0,
            student_profiles_count: 0
          }
        })
      }
    },
    
    refreshUserData: async () => {
    const user = get().user
    if (!user) return
    
    try {
        // Refresh profile from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (!error && profile) {
        console.log('Refreshed profile data:', profile)
        console.log('Refreshed avatar URL:', profile.avatar_url)
        
        // Update the user object with fresh data
        const updatedUser: AuthUser = {
          id: profile.id,
          email: profile.email,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          subscription_tier: profile.subscription_tier,
          subscription_status: profile.subscription_status,
          teaching_languages: profile.teaching_languages || [],
          native_language: profile.native_language,
          currency: profile.currency,
          hourly_rate: profile.hourly_rate,
          avg_lesson_prep_time_minutes: profile.avg_lesson_prep_time_minutes,
        }
        
        set(state => {
          state.user = updatedUser
        })
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
    
    // Also refresh other data
    await Promise.all([
      get().loadStudentProfiles(),
      get().loadUsageData()
    ])
  }
  }))
)

export default useAuthStore
