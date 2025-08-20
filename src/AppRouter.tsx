// src/AppRouter.tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from '@/stores/authStore'
import AuthGuard from '@/components/auth/AuthGuard'
import LoginPage from '@/components/auth/LoginPage'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardHome from '@/components/dashboard/DashboardHome'
import MinimalDashboardLayout from '@/components/dashboard/MinimalDashboardLayout'
import MinimalDashboardHome from '@/components/dashboard/MinimalDashboardHome'
import LessonsPage from '@/components/dashboard/LessonsPage'
import StudentsPage from '@/components/dashboard/StudentsPage'
import TutorialsPage from '@/components/dashboard/TutorialsPage'
import SettingsPage from '@/components/dashboard/SettingsPage'
import BillingPage from '@/components/dashboard/BillingPage'
import Canvas from './Canvas'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (!user) {
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
        path: 'students',
        element: <StudentsPage />
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
      }
    ]
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
  const { initialize } = useAuthStore()
  
  useEffect(() => {
    initialize()
  }, [initialize])
  
  return <RouterProvider router={router} />
}
