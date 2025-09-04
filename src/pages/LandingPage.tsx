// src/pages/LandingPage.tsx
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Users, Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white px-6 py-4" 
        style={{ 
          borderBottom: '1px solid var(--border-gray, #d9d9d9)',
          height: '60px'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
          <img
            src="/src/images/LOGO.svg"
            alt="TutorSlides"
            className="h-6"
          />
          
          <nav className="flex items-center gap-8">
            <Link 
              to="/about" 
              className="text-app-gray-600 hover:text-app-black transition-colors"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'var(--text-body-sm)',
              }}
            >
              About
            </Link>
            <Link 
              to="/pricing" 
              className="text-app-gray-600 hover:text-app-black transition-colors"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'var(--text-body-sm)',
              }}
            >
              Pricing
            </Link>
            <Link 
              to="/blog" 
              className="text-app-gray-600 hover:text-app-black transition-colors"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'var(--text-body-sm)',
              }}
            >
              Blog
            </Link>
            <Link 
              to="/login" 
              className="px-4 py-2 bg-app-green hover:bg-app-green-700 text-white rounded-lg transition-colors"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'var(--text-body-sm)',
                fontWeight: '500',
              }}
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 
              className="mb-6"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '3rem',
                fontWeight: 'var(--font-light)',
                lineHeight: 'var(--leading-heading)',
                letterSpacing: 'var(--tracking-heading)',
                color: 'var(--color-black)',
              }}
            >
              Create Beautiful Lessons in Minutes
            </h1>
            <p 
              className="mb-8 text-app-gray-600 max-w-2xl mx-auto"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'var(--text-body-lg)',
                lineHeight: 'var(--leading-body)',
              }}
            >
              Teachers helping teachers build their businesses and identity. 
              Transform your teaching materials into engaging, professional presentations with AI-powered tools.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                to="/dashboard" 
                className="px-6 py-3 bg-app-green hover:bg-app-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                style={{
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: 'var(--text-body)',
                  fontWeight: '500',
                }}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/tutorials" 
                className="px-6 py-3 border border-gray-300 text-app-black hover:bg-gray-50 rounded-lg transition-colors"
                style={{
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: 'var(--text-body)',
                  fontWeight: '500',
                }}
              >
                Watch Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 
              className="text-center mb-12"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-h2)',
                fontWeight: 'var(--font-light)',
                lineHeight: 'var(--leading-heading)',
                letterSpacing: 'var(--tracking-heading)',
              }}
            >
              Everything You Need to Create Amazing Lessons
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-app-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-app-green" />
                </div>
                <h3 
                  className="mb-3"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-h4)',
                    fontWeight: 'var(--font-light)',
                  }}
                >
                  AI-Powered Creation
                </h3>
                <p 
                  className="text-app-gray-600"
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: 'var(--text-body-sm)',
                    lineHeight: 'var(--leading-body)',
                  }}
                >
                  Generate complete lesson slides with AI assistance. Just describe your topic and let our AI do the work.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-app-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-app-green" />
                </div>
                <h3 
                  className="mb-3"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-h4)',
                    fontWeight: 'var(--font-light)',
                  }}
                >
                  Professional Templates
                </h3>
                <p 
                  className="text-app-gray-600"
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: 'var(--text-body-sm)',
                    lineHeight: 'var(--leading-body)',
                  }}
                >
                  Choose from a variety of beautifully designed templates tailored for educational content.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-app-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-app-green" />
                </div>
                <h3 
                  className="mb-3"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-h4)',
                    fontWeight: 'var(--font-light)',
                  }}
                >
                  Collaborate & Share
                </h3>
                <p 
                  className="text-app-gray-600"
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: 'var(--text-body-sm)',
                    lineHeight: 'var(--leading-body)',
                  }}
                >
                  Share your lessons with students and colleagues. Export to PDF or present directly from the platform.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}