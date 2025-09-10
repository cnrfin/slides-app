// src/components/dashboard/AnalyticsPage.tsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Info,
  BarChart3,
  PieChart,
  Download,
  Filter
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
  bgColor: string
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

    // Get dark mode status
    const isDarkMode = document.documentElement.classList.contains('dark')
    const textColor = isDarkMode ? '#e5e7eb' : '#374151'
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'

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
              borderColor: isDarkMode ? '#5EEAD4' : '#059669',
              backgroundColor: isDarkMode ? 'rgba(94, 234, 212, 0.1)' : 'rgba(5, 150, 105, 0.1)',
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
                backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: true,
                  color: gridColor
                },
                ticks: {
                  color: textColor
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: textColor
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
              backgroundColor: isDarkMode ? [
                '#5EEAD4',
                '#60A5FA',
                '#A78BFA',
                '#FB923C',
                '#F87171'
              ] : [
                '#059669',
                '#2563EB',
                '#7C3AED',
                '#EA580C',
                '#DC2626'
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
                  },
                  color: textColor
                }
              },
              tooltip: {
                backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8
              }
            }
          }
        })
      }
    }

    // Activity Chart
    if (activityChartRef.current) {
      const ctx = activityChartRef.current.getContext('2d')
      if (ctx) {
        chartInstances.current.activity = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Daily Activity',
              data: analyticsData.weeklyLessons,
              backgroundColor: analyticsData.weeklyLessons.map(value => {
                const intensity = value / Math.max(...analyticsData.weeklyLessons)
                return isDarkMode 
                  ? `rgba(94, 234, 212, ${0.3 + intensity * 0.7})`
                  : `rgba(5, 150, 105, ${0.3 + intensity * 0.7})`
              }),
              borderColor: isDarkMode ? '#5EEAD4' : '#059669',
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
                backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(0, 0, 0, 0.8)',
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
                  color: gridColor
                },
                ticks: {
                  color: textColor
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: textColor
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
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-8 h-8 border-2 border-app-green-700 dark:border-dark-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-app-gray dark:text-app-light-gray">Loading analytics...</p>
        </motion.div>
      </div>
    )
  }

  const statCards: StatCard[] = [
    {
      title: 'Time Saved',
      value: formatTime(analyticsData.timeSavedMinutes),
      subtitle: 'This month',
      icon: <Clock size={20} strokeWidth={1.5} />,
      trend: 12,
      trendLabel: 'vs last month',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Money Saved',
      value: formatCurrency(analyticsData.moneySaved),
      subtitle: 'Based on your hourly rate',
      icon: <DollarSign size={20} strokeWidth={1.5} />,
      trend: 18,
      trendLabel: 'vs last month',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Login Streak',
      value: analyticsData.loginStreak,
      subtitle: 'Days in a row',
      icon: <Zap size={20} strokeWidth={1.5} />,
      trend: 0,
      trendLabel: 'Keep it up!',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    },
    {
      title: 'Lessons Created',
      value: analyticsData.totalLessonsCreated,
      subtitle: 'Total this month',
      icon: <BookOpen size={20} strokeWidth={1.5} />,
      trend: 23,
      trendLabel: 'vs last month',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ]

  const additionalStats = [
    {
      label: 'Total Students',
      value: analyticsData.totalStudents,
      icon: <Users size={16} strokeWidth={1.5} />
    },
    {
      label: 'PDF Exports',
      value: analyticsData.totalPdfExports,
      icon: <FileDown size={16} strokeWidth={1.5} />
    },
    {
      label: 'Courses Created',
      value: analyticsData.totalCourses,
      icon: <Target size={16} strokeWidth={1.5} />
    },
    {
      label: 'Completion Rate',
      value: `${analyticsData.completionRate}%`,
      icon: <Award size={16} strokeWidth={1.5} />
    }
  ]

  return (
    <motion.div 
      className="p-2 sm:p-8 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-normal text-app-black dark:text-dark-text">Analytics</h1>
          <motion.button
            className="px-4 py-2 bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all flex items-center gap-2"
            whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 17 } }}
            whileTap={{ scale: 0.98 }}
          >
            <Download size={16} className="text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
            <span className="text-sm text-app-gray dark:text-app-light-gray">Export</span>
          </motion.button>
        </div>
        <p className="text-app-gray dark:text-app-light-gray">Track your progress and see how much time and money you've saved</p>
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-app-gray dark:text-app-light-gray">View period:</span>
        <div className="inline-flex rounded-lg border border-app-border dark:border-dark-border/20 bg-white dark:bg-dark-card">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-all first:rounded-l-lg last:rounded-r-lg ${
                selectedPeriod === period
                  ? 'bg-app-green-700 dark:bg-dark-accent text-white'
                  : 'text-app-gray dark:text-app-light-gray hover:bg-app-secondary-bg-solid dark:hover:bg-white/5'
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
          <motion.div
            key={index}
            className="bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-dark transition-shadow duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
              {stat.trend !== undefined && stat.trend !== 0 && (
                <motion.div 
                  className={`flex items-center gap-1 text-sm ${
                    stat.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {stat.trend > 0 ? (
                    <ChevronUp size={16} strokeWidth={2} />
                  ) : (
                    <ChevronDown size={16} strokeWidth={2} />
                  )}
                  <span className="font-medium">{Math.abs(stat.trend)}%</span>
                </motion.div>
              )}
            </div>
            <h3 className="text-2xl font-semibold text-app-black dark:text-dark-text mb-1">{stat.value}</h3>
            <p className="text-sm text-app-gray dark:text-app-light-gray">{stat.subtitle}</p>
            {stat.trendLabel && (
              <p className="text-xs text-app-gray dark:text-app-light-gray mt-2">{stat.trendLabel}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Lessons Created Chart */}
        <motion.div 
          className="bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-app-black dark:text-dark-text">Lesson Creation Trend</h3>
            <BarChart3 size={20} className="text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
          </div>
          <div className="h-64">
            <canvas ref={lessonsChartRef}></canvas>
          </div>
        </motion.div>

        {/* Languages Distribution */}
        <motion.div 
          className="bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-app-black dark:text-dark-text">Languages Taught</h3>
            <PieChart size={20} className="text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
          </div>
          <div className="h-64">
            <canvas ref={languagesChartRef}></canvas>
          </div>
        </motion.div>
      </div>

      {/* Activity Heatmap */}
      <motion.div 
        className="bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-app-black dark:text-dark-text">Weekly Activity</h3>
          <Activity size={20} className="text-app-gray dark:text-app-light-gray" strokeWidth={1.5} />
        </div>
        <div className="h-48">
          <canvas ref={activityChartRef}></canvas>
        </div>
      </motion.div>

      {/* Additional Stats */}
      <motion.div 
        className="bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <h3 className="text-lg font-medium text-app-black dark:text-dark-text mb-4">Additional Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {additionalStats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.05 }}
            >
              <div className="flex items-center justify-center gap-2 text-app-gray dark:text-app-light-gray mb-2">
                {stat.icon}
                <span className="text-sm">{stat.label}</span>
              </div>
              <p className="text-2xl font-semibold text-app-black dark:text-dark-text">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Insights Section */}
      <motion.div 
        className="mt-8 bg-gradient-to-r from-app-green-50 to-green-100 dark:from-dark-accent/10 dark:to-dark-accent/20 border border-app-green-200 dark:border-dark-accent/30 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.3 }}
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-app-green-700 dark:bg-dark-accent bg-opacity-10 dark:bg-opacity-20 rounded-lg">
            <TrendingUp size={24} className="text-app-green-700 dark:text-dark-accent" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-app-black dark:text-dark-text mb-2">Your Progress Summary</h3>
            <p className="text-app-gray dark:text-app-light-gray mb-3">
              Great job! You've saved <strong className="text-app-black dark:text-dark-text">{formatTime(analyticsData.timeSavedMinutes)}</strong> of preparation time 
              this month, equivalent to <strong className="text-app-black dark:text-dark-text">{formatCurrency(analyticsData.moneySaved)}</strong> based on your hourly rate. 
              Your {analyticsData.loginStreak}-day login streak shows consistent dedication!
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                <span className="text-app-gray dark:text-app-light-gray">
                  <strong className="text-app-black dark:text-dark-text">{analyticsData.totalLessonsCreated}</strong> lessons created
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                <span className="text-app-gray dark:text-app-light-gray">
                  <strong className="text-app-black dark:text-dark-text">{analyticsData.totalStudents}</strong> students managed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                <span className="text-app-gray dark:text-app-light-gray">
                  <strong className="text-app-black dark:text-dark-text">{analyticsData.completionRate}%</strong> completion rate
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
