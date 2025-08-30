// src/components/ui/TutorSlidesLogo.tsx
import React from 'react'

interface TutorSlidesLogoProps {
  className?: string
  variant?: 'full' | 'icon' // 'full' includes text, 'icon' is just the icon
  color?: 'default' | 'white' | 'purple'
}

export default function TutorSlidesLogo({ 
  className = '', 
  variant = 'full',
  color = 'default' 
}: TutorSlidesLogoProps) {
  
  const getColors = () => {
    switch (color) {
      case 'white':
        return {
          icon: '#ffffff',
          iconAccent: '#e9d5ff',
          text: '#ffffff'
        }
      case 'purple':
        return {
          icon: '#8B5CF6',
          iconAccent: '#ffffff',
          text: '#8B5CF6'
        }
      default:
        return {
          icon: '#8B5CF6',
          iconAccent: '#ffffff',
          text: '#1F2937'
        }
    }
  }

  const colors = getColors()

  if (variant === 'icon') {
    return (
      <svg 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Outer frame representing a slide */}
        <rect 
          x="3" 
          y="6" 
          width="26" 
          height="20" 
          rx="3" 
          fill={colors.icon}
        />
        
        {/* Inner content area */}
        <rect 
          x="6" 
          y="9" 
          width="20" 
          height="14" 
          rx="1.5" 
          fill={colors.iconAccent}
        />
        
        {/* Presentation elements */}
        <rect 
          x="8" 
          y="11" 
          width="12" 
          height="2" 
          rx="1" 
          fill={colors.icon}
          opacity="0.7"
        />
        <rect 
          x="8" 
          y="15" 
          width="16" 
          height="2" 
          rx="1" 
          fill={colors.icon}
          opacity="0.5"
        />
        <rect 
          x="8" 
          y="19" 
          width="10" 
          height="2" 
          rx="1" 
          fill={colors.icon}
          opacity="0.3"
        />
        
        {/* Tutor/education symbol - graduation cap */}
        <g transform="translate(21, 17)">
          <path 
            d="M0 3L4 1L8 3L4 5L0 3Z" 
            fill={colors.icon}
          />
          <path 
            d="M1.5 3V5.5L4 6.5L6.5 5.5V3" 
            stroke={colors.icon}
            strokeWidth="1"
            fill="none"
          />
        </g>
      </svg>
    )
  }

  return (
    <svg 
      viewBox="0 0 180 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Icon part */}
      <g>
        {/* Outer frame representing a slide */}
        <rect 
          x="3" 
          y="6" 
          width="26" 
          height="20" 
          rx="3" 
          fill={colors.icon}
        />
        
        {/* Inner content area */}
        <rect 
          x="6" 
          y="9" 
          width="20" 
          height="14" 
          rx="1.5" 
          fill={colors.iconAccent}
        />
        
        {/* Presentation elements */}
        <rect 
          x="8" 
          y="11" 
          width="12" 
          height="2" 
          rx="1" 
          fill={colors.icon}
          opacity="0.7"
        />
        <rect 
          x="8" 
          y="15" 
          width="16" 
          height="2" 
          rx="1" 
          fill={colors.icon}
          opacity="0.5"
        />
        <rect 
          x="8" 
          y="19" 
          width="10" 
          height="2" 
          rx="1" 
          fill={colors.icon}
          opacity="0.3"
        />
        
        {/* Tutor/education symbol - graduation cap */}
        <g transform="translate(21, 17)">
          <path 
            d="M0 3L4 1L8 3L4 5L0 3Z" 
            fill={colors.icon}
          />
          <path 
            d="M1.5 3V5.5L4 6.5L6.5 5.5V3" 
            stroke={colors.icon}
            strokeWidth="1"
            fill="none"
          />
        </g>
      </g>

      {/* Text part - TutorSlides */}
      <text 
        x="36" 
        y="22" 
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
        fontSize="19" 
        fontWeight="600" 
        fill={colors.text}
      >
        TutorSlides
      </text>
    </svg>
  )
}

// Export icon-only version as a separate component for convenience
export function TutorSlidesIcon({ className, color = 'default' }: Omit<TutorSlidesLogoProps, 'variant'>) {
  return <TutorSlidesLogo className={className} variant="icon" color={color} />
}