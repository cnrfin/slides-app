// src/AppRouter.tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from '@/stores/authStore'
import { GoogleAuthProvider } from '@/providers/GoogleAuthProvider'
import AuthGuard from '@/components/auth/AuthGuard'
import LoginPage from '@/components/auth/LoginPage'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardHome from '@/components/dashboard/DashboardHome'
import MinimalDashboardLayout from '@/components/dashboard/MinimalDashboardLayout'
import MinimalDashboardHome from '@/components/dashboard/MinimalDashboardHome'
import LessonsPage from '@/components/dashboard/LessonsPage'
import CoursesPage from '@/components/dashboard/CoursesPage'
import StudentsPage from '@/components/dashboard/StudentsPage'
import AnalyticsPage from '@/components/dashboard/AnalyticsPage'
import TutorialsPage from '@/components/dashboard/TutorialsPage'
import SettingsPage from '@/components/dashboard/SettingsPage'
import BillingPage from '@/components/dashboard/BillingPage'
import AddonsPage from '@/components/dashboard/AddonsPage'
import GoogleDriveCallback from '@/components/auth/GoogleDriveCallback'
import AuthCallback from '@/components/auth/AuthCallback'
import Canvas from './Canvas'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isInitialized } = useAuthStore()
  
  // Wait for auth initialization before making any decisions
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Only redirect to login after we're sure there's no user
  if (isInitialized && !user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <MinimalDashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <MinimalDashboardHome />
      },
      {
        path: 'lessons',
        element: <LessonsPage />
      },
      {
        path: 'courses',
        element: <CoursesPage />
      },
      {
        path: 'students',
        element: <StudentsPage />
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />
      },
      {
        path: 'tutorials',
        element: <TutorialsPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
      {
        path: 'billing',
        element: <BillingPage />
      },
      {
        path: 'addons',
        element: <AddonsPage />
      }
    ]
  },
  {
    path: '/auth/google/callback',
    element: <GoogleDriveCallback />
  },
  {
    path: '/canvas',
    element: (
      <ProtectedRoute>
        <Canvas />
      </ProtectedRoute>
    )
  }
])

export default function AppRouter() {
  const { initialize, isInitialized } = useAuthStore()
  
  useEffect(() => {
    // Only initialize once
    if (!isInitialized) {
      console.log('🚀 Initializing auth store...')
      initialize()
    }
  }, [initialize, isInitialized])
  
  return (
    <GoogleAuthProvider>
      <RouterProvider router={router} />
    </GoogleAuthProvider>
  )
}
