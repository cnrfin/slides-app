// src/components/dashboard/TutorialsPage.tsx
import { useState } from 'react'
import { 
  PlayCircle, 
  ExternalLink, 
  Clock, 
  Filter,
  Search,
  BookOpen,
  Video,
  ChevronRight,
  Star,
  TrendingUp,
  Award,
  Users,
  Calendar
} from 'lucide-react'

interface Tutorial {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  videoUrl: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  views?: number
  featured?: boolean
  isNew?: boolean
}

export default function TutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Getting Started with AI Lesson Generation',
      description: 'Learn the basics of creating engaging language lessons using AI assistance',
      duration: '5:42',
      thumbnail: '/tutorial-thumb-1.jpg',
      videoUrl: '#',
      category: 'getting-started',
      difficulty: 'beginner',
      views: 1250,
      featured: true,
      isNew: true
    },
    {
      id: '2',
      title: 'Advanced Lesson Customization Techniques',
      description: 'Master advanced features for creating personalized lesson content',
      duration: '8:15',
      thumbnail: '/tutorial-thumb-2.jpg',
      videoUrl: '#',
      category: 'advanced',
      difficulty: 'advanced',
      views: 850,
      featured: true
    },
    {
      id: '3',
      title: 'Managing Student Profiles Effectively',
      description: 'Organize and track your students progress with powerful profile features',
      duration: '4:30',
      thumbnail: '/tutorial-thumb-3.jpg',
      videoUrl: '#',
      category: 'students',
      difficulty: 'intermediate',
      views: 620
    },
    {
      id: '4',
      title: 'Creating Interactive Language Activities',
      description: 'Design engaging activities that make language learning fun and effective',
      duration: '6:20',
      thumbnail: '/tutorial-thumb-4.jpg',
      videoUrl: '#',
      category: 'activities',
      difficulty: 'intermediate',
      views: 980,
      isNew: true
    },
    {
      id: '5',
      title: 'Exporting and Sharing Your Lessons',
      description: 'Learn how to export lessons to PDF and share with your students',
      duration: '3:15',
      thumbnail: '/tutorial-thumb-5.jpg',
      videoUrl: '#',
      category: 'export',
      difficulty: 'beginner',
      views: 1500
    },
    {
      id: '6',
      title: 'Using Templates for Faster Lesson Creation',
      description: 'Speed up your workflow with pre-designed lesson templates',
      duration: '4:45',
      thumbnail: '/tutorial-thumb-6.jpg',
      videoUrl: '#',
      category: 'templates',
      difficulty: 'beginner',
      views: 1100
    },
    {
      id: '7',
      title: 'Grammar Focus: Building Grammar Lessons',
      description: 'Create comprehensive grammar lessons with visual explanations',
      duration: '7:30',
      thumbnail: '/tutorial-thumb-7.jpg',
      videoUrl: '#',
      category: 'grammar',
      difficulty: 'intermediate',
      views: 750
    },
    {
      id: '8',
      title: 'Vocabulary Builder: Word Lists and Flashcards',
      description: 'Design effective vocabulary lessons with interactive elements',
      duration: '5:10',
      thumbnail: '/tutorial-thumb-8.jpg',
      videoUrl: '#',
      category: 'vocabulary',
      difficulty: 'beginner',
      views: 1320
    }
  ]

  const categories = [
    { id: 'all', label: 'All Tutorials', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'getting-started', label: 'Getting Started', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
    { id: 'activities', label: 'Activities', icon: <Star className="w-4 h-4" /> },
    { id: 'advanced', label: 'Advanced', icon: <Award className="w-4 h-4" /> }
  ]

  const difficulties = [
    { id: 'all', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-700' },
    { id: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-700' }
  ]

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'beginner': 'bg-green-100 text-green-700',
      'intermediate': 'bg-yellow-100 text-yellow-700',
      'advanced': 'bg-red-100 text-red-700'
    }
    return colors[difficulty] || 'bg-gray-100 text-gray-700'
  }

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tutorial.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesDifficulty && matchesSearch
  })

  const featuredTutorials = tutorials.filter(t => t.featured)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Tutorials</h1>
            <p className="text-gray-600 mt-1">Learn how to make the most of all features</p>
          </div>
          
          <a
            href="https://www.youtube.com/@YourChannel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            <span>View YouTube Channel</span>
          </a>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {difficulties.map(diff => (
                <option key={diff.id} value={diff.id}>{diff.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Featured Tutorials */}
      {selectedCategory === 'all' && !searchQuery && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredTutorials.map((tutorial) => (
              <FeaturedTutorialCard key={tutorial.id} tutorial={tutorial} />
            ))}
          </div>
        </div>
      )}

      {/* All Tutorials Grid */}
      <div>
        {selectedCategory === 'all' && !searchQuery && (
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Tutorials</h2>
        )}
        
        {filteredTutorials.length === 0 ? (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tutorials found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface TutorialCardProps {
  tutorial: Tutorial
}

function TutorialCard({ tutorial }: TutorialCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href={tutorial.videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="aspect-video relative bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`
            w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg
            transition-transform ${isHovered ? 'scale-110' : ''}
          `}>
            <PlayCircle className="w-7 h-7 text-purple-600" />
          </div>
        </div>
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
          {tutorial.duration}
        </div>

        {/* New Badge */}
        {tutorial.isNew && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded">
            NEW
          </div>
        )}

        {/* Difficulty Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(tutorial.difficulty)}`}>
          {tutorial.difficulty.charAt(0).toUpperCase() + tutorial.difficulty.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors mb-2">
          {tutorial.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {tutorial.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{tutorial.duration}</span>
            </div>
            {tutorial.views && (
              <div className="flex items-center gap-1">
                <PlayCircle className="w-3 h-3" />
                <span>{tutorial.views.toLocaleString()} views</span>
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
        </div>
      </div>
    </a>
  )
}

function FeaturedTutorialCard({ tutorial }: TutorialCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href={tutorial.videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 overflow-hidden hover:shadow-lg transition-all group flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="w-1/3 relative bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`
            w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg
            transition-transform ${isHovered ? 'scale-110' : ''}
          `}>
            <PlayCircle className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
          {tutorial.duration}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-xs font-medium text-purple-600">FEATURED</span>
            {tutorial.isNew && (
              <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded">
                NEW
              </span>
            )}
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(tutorial.difficulty)}`}>
            {tutorial.difficulty.charAt(0).toUpperCase() + tutorial.difficulty.slice(1)}
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
          {tutorial.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {tutorial.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{tutorial.duration}</span>
            </div>
            {tutorial.views && (
              <div className="flex items-center gap-1">
                <PlayCircle className="w-3 h-3" />
                <span>{tutorial.views.toLocaleString()} views</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-purple-600">
            <span className="text-sm font-medium">Watch now</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </a>
  )
}
