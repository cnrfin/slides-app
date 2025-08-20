// src/components/dashboard/TutorialsPage.tsx
import { useState } from 'react'
import { PlayCircle, ExternalLink, Clock } from 'lucide-react'

interface Tutorial {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  videoUrl: string
  category: string
}

export default function TutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Convert your PDF to a PowerPoint using AI in 2 minutes',
      description: 'Learn how to quickly convert PDF documents to PowerPoint presentations using AI tools',
      duration: '3:21',
      thumbnail: '/tutorial-thumb-1.jpg',
      videoUrl: '#',
      category: 'conversion'
    },
    {
      id: '2',
      title: 'Learn How AI Helps You Create Professional Presentations in Seconds!',
      description: 'Discover how AI can help you create stunning presentations quickly',
      duration: '1:13',
      thumbnail: '/tutorial-thumb-2.jpg',
      videoUrl: '#',
      category: 'ai'
    },
    {
      id: '3',
      title: 'PDF to PPT Converter AI: Convert PDF to PowerPoint Using AI in 2 Minutes',
      description: 'Step-by-step guide to converting PDF files to PowerPoint presentations',
      duration: '2:55',
      thumbnail: '/tutorial-thumb-3.jpg',
      videoUrl: '#',
      category: 'conversion'
    },
    {
      id: '4',
      title: 'Easily Convert Google Slides to PowerPoint Web - Here\'s How!',
      description: 'Learn how to export Google Slides presentations to PowerPoint format',
      duration: '2:08',
      thumbnail: '/tutorial-thumb-4.jpg',
      videoUrl: '#',
      category: 'conversion'
    },
    {
      id: '5',
      title: 'Convert your Docx to a PowerPoint using AI in 2 minutes',
      description: 'Quick tutorial on converting Word documents to PowerPoint presentations',
      duration: '0:43',
      thumbnail: '/tutorial-thumb-5.jpg',
      videoUrl: '#',
      category: 'conversion'
    },
    {
      id: '6',
      title: 'How to Extract and Insert Images from PDF Files into Google Slides Using Magic Slides',
      description: 'Learn to extract images from PDFs and add them to your presentations',
      duration: '2:29',
      thumbnail: '/tutorial-thumb-6.jpg',
      videoUrl: '#',
      category: 'tips'
    }
  ]

  const categories = [
    { id: 'all', label: 'All Tutorials' },
    { id: 'ai', label: 'AI Features' },
    { id: 'conversion', label: 'File Conversion' },
    { id: 'tips', label: 'Tips & Tricks' }
  ]

  const filteredTutorials = selectedCategory === 'all' 
    ? tutorials 
    : tutorials.filter(t => t.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Video Tutorials</h1>
            <p className="mt-1 text-gray-600">Learn how to use all the features</p>
          </div>
          
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">View Channel</span>
          </a>
        </div>

        {/* Category Filter */}
        <div className="mt-6 flex gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tutorials Grid */}
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tutorial) => (
            <TutorialCard key={tutorial.id} tutorial={tutorial} />
          ))}
        </div>
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
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="aspect-video relative bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`
            w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg
            transition-transform ${isHovered ? 'scale-110' : ''}
          `}>
            <PlayCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
          {tutorial.duration}
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-white bg-opacity-90 text-xs font-medium rounded capitalize">
          {tutorial.category.replace('-', ' ')}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {tutorial.title}
        </h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {tutorial.description}
        </p>
        
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{tutorial.duration}</span>
        </div>
      </div>
    </a>
  )
}
