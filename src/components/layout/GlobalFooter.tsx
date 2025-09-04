// src/components/layout/GlobalFooter.tsx
import { Link, useLocation } from 'react-router-dom'
import { Twitter, Instagram } from 'lucide-react'

export default function GlobalFooter() {
  const location = useLocation()
  
  // Don't show footer on certain pages if needed
  const isCanvasPage = location.pathname === '/canvas'
  
  // Hide footer on canvas page to avoid interference with canvas controls
  if (isCanvasPage) {
    return null
  }
  
  return (
    <footer className="w-full px-2 pb-2">
      {/* Container - No background or border */}
      <div className="max-w-7xl mx-auto">
        {/* First Row - Logo */}
        <div className="mb-6">
          <img
            src="/src/images/LOGO.svg"
            alt="TutorSlides"
            className="h-10"
            style={{ height: '40px' }}
          />
        </div>
        
        {/* Second Row - 3 Columns evenly spread with max-width */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* First Column - Tagline and Social Links */}
          <div className="flex flex-col" style={{ gap: '0.5rem', maxWidth: '200px' }}>
            <p 
              className="text-app-gray-600"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'var(--text-body-sm)',
                lineHeight: 'var(--leading-body)',
                letterSpacing: 'var(--tracking-body)',
              }}
            >
              Teachers helping teachers build their businesses and identity
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title="Follow us on Twitter"
                aria-label="Twitter"
              >
                <Twitter 
                  className="text-app-gray-600 hover:text-app-black" 
                  size={14}
                  strokeWidth={0}
                  fill="currentColor"
                />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title="Follow us on Instagram"
                aria-label="Instagram"
              >
                <Instagram 
                  className="text-app-gray-600 hover:text-app-black" 
                  size={14}
                  strokeWidth={0}
                  fill="currentColor"
                />
              </a>
            </div>
          </div>
          
          {/* Second Column - Navigation Links */}
          <div className="flex flex-col gap-3" style={{ maxWidth: '200px' }}>
            <Link
              to="/about"
              className="text-app-gray-600 hover:text-app-black transition-colors"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'var(--text-body-sm)',
                lineHeight: 'var(--leading-body)',
              }}
            >
              About Us
            </Link>
            <Link
              to="/pricing"
              className="text-app-gray-600 hover:text-app-black transition-colors"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'var(--text-body-sm)',
                lineHeight: 'var(--leading-body)',
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
                lineHeight: 'var(--leading-body)',
              }}
            >
              Blog
            </Link>
            <Link
              to="/vision"
              className="text-app-gray-600 hover:text-app-black transition-colors"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'var(--text-body-sm)',
                lineHeight: 'var(--leading-body)',
              }}
            >
              Our Vision
            </Link>
          </div>
          
          {/* Third Column - Support Links and Button */}
          <div className="flex flex-col gap-3" style={{ maxWidth: '200px' }}>
            <Link
              to="/getting-started"
              className="text-app-gray-600 hover:text-app-black transition-colors"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'var(--text-body-sm)',
                lineHeight: 'var(--leading-body)',
              }}
            >
              Getting Started
            </Link>
            <Link
              to="/terms"
              className="text-app-gray-600 hover:text-app-black transition-colors"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'var(--text-body-sm)',
                lineHeight: 'var(--leading-body)',
              }}
            >
              Terms of Service
            </Link>
            
            {/* Contact Support Button */}
            <button
              onClick={() => {
                // You can implement a support modal or redirect to support page
                window.location.href = 'mailto:support@tutorslides.com'
              }}
              className="mt-2 px-4 py-2 bg-app-green hover:bg-app-green-700 text-white rounded-lg transition-colors w-fit"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 'var(--text-body-sm)',
                fontWeight: '500',
              }}
            >
              Contact Support
            </button>
          </div>
        </div>
        
        {/* Optional Copyright Row */}
        <div className="mt-12 pt-8">
          <p 
            className="text-center text-app-gray-500"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: 'var(--text-caption)',
            }}
          >
            © {new Date().getFullYear()} TutorSlides. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}