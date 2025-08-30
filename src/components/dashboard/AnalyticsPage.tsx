// src/components/dashboard/AnalyticsPage.tsx
import { useState, useEffect, useRef } from 'react'
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  BookOpen,
  Users,
  FileDown,
  Calendar,
  Award,
  Activity,
  Target,
  Zap,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import Chart from 'chart.js/auto'

interface AnalyticsData {
  totalLessonsCreated: number
  totalStudents: number
  totalPdfExports: number
  timeSavedMinutes: number
  moneySaved: number
  loginStreak: number
  lastLoginDate: string
  weeklyLessons: number[]
  monthlyProgress: number[]
  topLanguages: { language: string; count: number }[]
  averageLessonDuration: number
  completionRate: number
  totalCourses: number
}

interface StatCard {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
  color: string
}

export default function AnalyticsPage() {
  const { user, currentMonthUsage } = useAuthStore()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  
  // Chart refs
  const lessonsChartRef = useRef<HTMLCanvasElement>(null)
  const languagesChartRef = useRef<HTMLCanvasElement>(null)
  const activityChartRef = useRef<HTMLCanvasElement>(null)
  const chartInstances = useRef<{ [key: string]: Chart }>({})

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
    }
  }, [user, selectedPeriod])

  useEffect(() => {
    if (analyticsData && !isLoading) {
      createCharts()
    }
    
    return () => {
      // Cleanup charts on unmount
      Object.values(chartInstances.current).forEach(chart => chart.destroy())
    }
  }, [analyticsData, isLoading])

  const fetchAnalyticsData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // In a real app, these would be database queries
      // For demo, we'll use mock data with some calculations
      
      const avgLessonPrepTime = user.avg_lesson_prep_time_minutes || 45
      const hourlyRate = user.hourly_rate || 50
      
      // Calculate time saved (assuming AI saves 70% of prep time)
      const lessonsCreated = currentMonthUsage?.lessons_generated || 0
      const timeSavedPerLesson = avgLessonPrepTime * 0.7
      const totalTimeSaved = lessonsCreated * timeSavedPerLesson
      
      // Calculate money saved
      const moneySaved = (totalTimeSaved / 60) * hourlyRate
      
      // Mock data for demonstration
      const data: AnalyticsData = {
        totalLessonsCreated: currentMonthUsage?.lessons_generated || 47,
        totalStudents: currentMonthUsage?.student_profiles_count || 23,
        totalPdfExports: currentMonthUsage?.pdf_exports || 85,
        timeSavedMinutes: totalTimeSaved || 1575, // 47 lessons * 31.5 minutes saved per lesson
        moneySaved: moneySaved || 1312.50, // Based on hourly rate
        loginStreak: calculateLoginStreak(),
        lastLoginDate: new Date().toISOString(),
        weeklyLessons: generateWeeklyData(),
        monthlyProgress: generateMonthlyData(),
        topLanguages: [
          { language: 'English', count: 28 },
          { language: 'Spanish', count: 15 },
          { language: 'French', count: 8 },
          { language: 'German', count: 5 },
          { language: 'Italian', count: 3 }
        ],
        averageLessonDuration: 45,
        completionRate: 78,
        totalCourses: 12
      }
      
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Use fallback data
      setAnalyticsData(getMockAnalyticsData())
    } finally {
      setIsLoading(false)
    }
  }

  const calculateLoginStreak = () => {
    // Mock calculation - in reality, track daily logins in database
    return Math.floor(Math.random() * 10) + 5
  }

  const generateWeeklyData = () => {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 8) + 2)
  }

  const generateMonthlyData = () => {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 50) + 10)
  }

  const getMockAnalyticsData = (): AnalyticsData => ({
    totalLessonsCreated: 47,
    totalStudents: 23,
    totalPdfExports: 85,
    timeSavedMinutes: 1575,
    moneySaved: 1312.50,
    loginStreak: 7,
    lastLoginDate: new Date().toISOString(),
    weeklyLessons: [3, 5, 4, 7, 6, 8, 5],
    monthlyProgress: [25, 30, 28, 35, 42, 38, 45, 43, 48, 52, 47, 51],
    topLanguages: [
      { language: 'English', count: 28 },
      { language: 'Spanish', count: 15 },
      { language: 'French', count: 8 },
      { language: 'German', count: 5 },
      { language: 'Italian', count: 3 }
    ],
    averageLessonDuration: 45,
    completionRate: 78,
    totalCourses: 12
  })

  const createCharts = () => {
    if (!analyticsData) return

    // Destroy existing charts before creating new ones
    Object.values(chartInstances.current).forEach(chart => chart.destroy())
    chartInstances.current = {}

    // Lessons Created Chart
    if (lessonsChartRef.current) {
      const ctx = lessonsChartRef.current.getContext('2d')
      if (ctx) {
        chartInstances.current.lessons = new Chart(ctx, {
          type: 'line',
          data: {
            labels: selectedPeriod === 'week' 
              ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
              : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
              label: 'Lessons Created',
              data: selectedPeriod === 'week' ? analyticsData.weeklyLessons : analyticsData.monthlyProgress,
              borderColor: 'rgb(147, 51, 234)',
              backgroundColor: 'rgba(147, 51, 234, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        })
      }
    }

    // Languages Chart
    if (languagesChartRef.current) {
      const ctx = languagesChartRef.current.getContext('2d')
      if (ctx) {
        chartInstances.current.languages = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: analyticsData.topLanguages.map(l => l.language),
            datasets: [{
              data: analyticsData.topLanguages.map(l => l.count),
              backgroundColor: [
                'rgb(147, 51, 234)',
                'rgb(59, 130, 246)',
                'rgb(16, 185, 129)',
                'rgb(251, 146, 60)',
                'rgb(244, 63, 94)'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  padding: 15,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8
              }
            }
          }
        })
      }
    }

    // Activity Heatmap Chart
    if (activityChartRef.current) {
      const ctx = activityChartRef.current.getContext('2d')
      if (ctx) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
        
        // Generate mock heatmap data
        const heatmapData: any[] = []
        days.forEach((day, dayIndex) => {
          hours.forEach((hour, hourIndex) => {
            const value = Math.random() * 10
            if (value > 3) {
              heatmapData.push({
                x: hourIndex,
                y: dayIndex,
                v: Math.floor(value)
              })
            }
          })
        })

        chartInstances.current.activity = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Daily Activity',
              data: analyticsData.weeklyLessons,
              backgroundColor: analyticsData.weeklyLessons.map(value => {
                const intensity = value / Math.max(...analyticsData.weeklyLessons)
                return `rgba(147, 51, 234, ${0.3 + intensity * 0.7})`
              }),
              borderColor: 'rgb(147, 51, 234)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                  label: (context: any) => {
                    return `Activity: ${context.parsed.y} lessons`
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        })
      }
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD'
    }).format(amount)
  }

  if (isLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const statCards: StatCard[] = [
    {
      title: 'Time Saved',
      value: formatTime(analyticsData.timeSavedMinutes),
      subtitle: 'This month',
      icon: <Clock className="w-5 h-5" />,
      trend: 12,
      trendLabel: 'vs last month',
      color: 'bg-blue-500'
    },
    {
      title: 'Money Saved',
      value: formatCurrency(analyticsData.moneySaved),
      subtitle: 'Based on your hourly rate',
      icon: <DollarSign className="w-5 h-5" />,
      trend: 18,
      trendLabel: 'vs last month',
      color: 'bg-green-500'
    },
    {
      title: 'Login Streak',
      value: analyticsData.loginStreak,
      subtitle: 'Days in a row',
      icon: <Zap className="w-5 h-5" />,
      trend: 0,
      trendLabel: 'Keep it up!',
      color: 'bg-orange-500'
    },
    {
      title: 'Lessons Created',
      value: analyticsData.totalLessonsCreated,
      subtitle: 'Total this month',
      icon: <BookOpen className="w-5 h-5" />,
      trend: 23,
      trendLabel: 'vs last month',
      color: 'bg-purple-500'
    }
  ]

  const additionalStats = [
    {
      label: 'Total Students',
      value: analyticsData.totalStudents,
      icon: <Users className="w-4 h-4" />
    },
    {
      label: 'PDF Exports',
      value: analyticsData.totalPdfExports,
      icon: <FileDown className="w-4 h-4" />
    },
    {
      label: 'Courses Created',
      value: analyticsData.totalCourses,
      icon: <Target className="w-4 h-4" />
    },
    {
      label: 'Completion Rate',
      value: `${analyticsData.completionRate}%`,
      icon: <Award className="w-4 h-4" />
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your progress and see how much time and money you've saved</p>
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-gray-600">View period:</span>
        <div className="inline-flex rounded-lg border border-gray-300 bg-white">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors first:rounded-l-lg last:rounded-r-lg ${
                selectedPeriod === period
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 ${stat.color} bg-opacity-10 rounded-lg`}>
                <div className={`${stat.color} bg-clip-text text-transparent`}>
                  {stat.icon}
                </div>
              </div>
              {stat.trend !== undefined && stat.trend !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend > 0 ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(stat.trend)}%</span>
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.subtitle}</p>
            {stat.trendLabel && (
              <p className="text-xs text-gray-400 mt-2">{stat.trendLabel}</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Lessons Created Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Lesson Creation Trend</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <canvas ref={lessonsChartRef}></canvas>
          </div>
        </div>

        {/* Languages Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Languages Taught</h3>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <canvas ref={languagesChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-48">
          <canvas ref={activityChartRef}></canvas>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {additionalStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                {stat.icon}
                <span className="text-sm">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-purple-600 bg-opacity-10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Progress Summary</h3>
            <p className="text-gray-700 mb-3">
              Great job! You've saved <strong>{formatTime(analyticsData.timeSavedMinutes)}</strong> of preparation time 
              this month, equivalent to <strong>{formatCurrency(analyticsData.moneySaved)}</strong> based on your hourly rate. 
              Your {analyticsData.loginStreak}-day login streak shows consistent dedication!
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">
                  <strong className="text-gray-900">{analyticsData.totalLessonsCreated}</strong> lessons created
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">
                  <strong className="text-gray-900">{analyticsData.totalStudents}</strong> students managed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">
                  <strong className="text-gray-900">{analyticsData.completionRate}%</strong> completion rate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
