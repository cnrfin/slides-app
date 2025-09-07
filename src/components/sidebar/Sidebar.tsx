// src/components/sidebar/Sidebar.tsx
import { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'
import { 
  Plus,
  Copy,
  Trash2,
  Type,
  Square,
  Circle,
  MessageSquare,
  Minus,
  Image,
  BarChart3,
  Table,
  Sparkles,
  ChevronDown,
  Settings,
  Languages,
  GraduationCap,
  LogOut,
  Save,
  History,
  Check
} from 'lucide-react'
import useSlideStore from '@/stores/slideStore'
import useAuthStore from '@/stores/authStore'
import useLanguageStore from '@/stores/languageStore'
import { SUPPORTED_LANGUAGES } from '@/i18n/config'
import SlidePreview from '@/components/previews/SlidePreview'
import { formatDistanceToNow } from 'date-fns'
import type { TextContent, ShapeContent, BlurbContent } from '@/types/slide.types'
import { measureAutoText } from '@/utils/text.utils'
import { getShapeById } from '@/utils/svg-shapes'
import ShapePopup from './popups/ShapePopup'
import IconsPopup from './popups/IconsPopup'
import ChartModal from './popups/ChartModal'
import TablePopup from './popups/TablePopup'
import { TabGroup } from '@/components/ui'
import { useNavigate, Link } from 'react-router-dom'
import RecentLessonsPopup from '@/components/lessons/RecentLessonsPopup'

interface SidebarProps {
  onAddSlide: () => void
  onApplyTemplateToSlide: (slideId: string) => void
}

// Language Popup Component
function LanguagePopup({ isOpen, onClose, anchorElement, userMenuElement }: { 
  isOpen: boolean; 
  onClose: () => void; 
  anchorElement: HTMLElement | null;
  userMenuElement: HTMLElement | null;  // Add reference to user menu
}) {
  const { t } = useTranslation('dashboard');
  const { currentLanguage, setLanguage } = useLanguageStore();
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Click-outside detection for language popup
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is inside the language popup
      if (popupRef.current && popupRef.current.contains(target)) {
        return;
      }
      
      // Check if click is on the language button that opened this popup
      if (anchorElement && anchorElement.contains(target)) {
        return;
      }
      
      // Check if click is inside the user menu dropdown
      if (userMenuElement && userMenuElement.contains(target)) {
        return;
      }
      
      // Clicked outside everything - close the popup
      onClose();
    };
    
    // Small delay to avoid immediate closure when opening
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, anchorElement, userMenuElement, onClose]);
  
  if (!isOpen) return null;
  
  // Calculate position based on user menu dropdown
  const getPosition = () => {
    // Try to use the user menu element first for consistent positioning
    if (userMenuElement) {
      const menuRect = userMenuElement.getBoundingClientRect();
      return {
        top: menuRect.top,  // Align with top of user menu
        left: menuRect.right + 8  // Position to the right of user menu
      };
    }
    
    // Fallback to anchor element if no user menu
    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.right + 8
      };
    }
    
    // Default position
    return { top: 300, left: 300 };
  };
  
  const position = getPosition();
  
  // Adjust position if it would go off screen
  if (position.left + 200 > window.innerWidth) {
    position.left = Math.max(10, position.left - 416); // Position to the left with some padding
  }
  
  // Ensure popup doesn't go off the top or bottom of screen
  if (position.top + 300 > window.innerHeight) {
    position.top = window.innerHeight - 310;
  }
  if (position.top < 10) {
    position.top = 10;
  }
  
  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      data-language-popup
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 99999,
      }}

    >
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {t('selectLanguage')}
        </p>
      </div>
      
      <div className="py-1">
        {SUPPORTED_LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => {
              console.log('Language selected:', language.code);
              setLanguage(language.code);
              onClose(); // This will trigger closing both menus
            }}
            className={`
              w-full flex items-center justify-between px-3 py-2 
              text-sm hover:bg-gray-50 transition-colors
              ${currentLanguage === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
            </div>
            {currentLanguage === language.code && (
              <Check className="w-4 h-4" strokeWidth={2} />
            )}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}

export default function Sidebar({ onAddSlide, onApplyTemplateToSlide }: SidebarProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const { currentLanguage } = useLanguageStore()
  const [activeTab, setActiveTab] = useState<'elements' | 'slides'>('slides')
  const [activeLineTool, setActiveLineTool] = useState(false)
  const [showShapePopup, setShowShapePopup] = useState(false)
  const [showIconsPopup, setShowIconsPopup] = useState(false)
  const [showChartModal, setShowChartModal] = useState(false)
  const [showTablePopup, setShowTablePopup] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [showRecentLessons, setShowRecentLessons] = useState(false)
  const [showLanguagePopup, setShowLanguagePopup] = useState(false)
  const shapeButtonRef = useRef<HTMLButtonElement>(null)
  const iconsButtonRef = useRef<HTMLButtonElement>(null)
  const tableButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userMenuDropdownRef = useRef<HTMLDivElement>(null)  // Add ref for dropdown menu
  const languageButtonRef = useRef<HTMLButtonElement>(null)
  
  // Get current language display
  const currentLanguageDisplay = SUPPORTED_LANGUAGES.find(
    lang => lang.code === currentLanguage
  );
  
  const {
    slides,
    currentSlideId,
    selectedSlideId,
    setCurrentSlide,
    selectSlide,
    duplicateSlide,
    deleteSlide,
    addElement,
    addSlide,
    presentation,
    lastSaved,
    updatePresentationTitle,
    saveToDatabase,
    isSaving
  } = useSlideStore()
  
  const { user, signOut } = useAuthStore()
  const [avatarError, setAvatarError] = useState(false)
  
  // Debug: Log user avatar URL
  useEffect(() => {
    if (user) {
      console.log('Canvas Sidebar - User avatar URL:', user.avatar_url);
      console.log('Canvas Sidebar - Full user object:', user);
    }
  }, [user])
  
  const currentSlideIndex = slides.findIndex(s => s.id === currentSlideId)
  const currentSlide = slides.find(s => s.id === currentSlideId)

  // Listen for line mode exit to deactivate line tool
  useEffect(() => {
    const handleExitLineMode = () => {
      setActiveLineTool(false)
    }

    const handleEscapePressed = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeLineTool) {
        setActiveLineTool(false)
      }
    }

    window.addEventListener('canvas:exit-line-mode', handleExitLineMode)
    window.addEventListener('keydown', handleEscapePressed)
    
    return () => {
      window.removeEventListener('canvas:exit-line-mode', handleExitLineMode)
      window.removeEventListener('keydown', handleEscapePressed)
    }
  }, [activeLineTool])
  
  const handleAddText = () => {
    if (!currentSlide) return
    
    const text = 'Type here'
    const fontSize = 16
    const fontFamily = 'Arial'
    
    const dimensions = measureAutoText({
      text,
      fontSize,
      fontFamily,
      lineHeight: 1.2,
      padding: 0
    })
    
    const textContent: TextContent = {
      text,
    }
    
    addElement(currentSlide.id, {
      type: 'text',
      x: 400 - dimensions.width / 2,
      y: 300 - dimensions.height / 2,
      width: dimensions.width,
      height: dimensions.height,
      content: textContent,
      style: {
        fontSize,
        fontFamily,
        color: '#000000',
        textAlign: 'left',
      },
    })
  }
  
  const handleAddShape = (shape: 'rectangle' | 'circle') => {
    if (!currentSlide) return
    
    const shapeContent: ShapeContent = {
      shape: shape,
    }
    
    addElement(currentSlide.id, {
      type: 'shape',
      x: 350,
      y: 250,
      width: 100,
      height: 100,
      content: shapeContent,
      style: {
        backgroundColor: shape === 'rectangle' ? '#3b82f6' : '#10b981',
        borderRadius: shape === 'rectangle' ? 8 : undefined,
      },
    })
  }
  
  const handleAddBlurb = () => {
    if (!currentSlide) return
    
    const blurbContent: BlurbContent = {
      text: 'Type here',
      tailPosition: 'bottom-left',
    }
    
    addElement(currentSlide.id, {
      type: 'blurb',
      x: 325,
      y: 262.5,
      width: 150,
      height: 75,
      content: blurbContent,
      style: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Arial',
        borderRadius: 25,
      },
    })
  }
  
  const handleAddLine = () => {
    // Set line tool as active
    setActiveLineTool(true)
    // Emit event to start line drawing mode
    const event = new CustomEvent('canvas:start-line-mode')
    window.dispatchEvent(event)
  }
  
  const handleAddImage = () => {
    if (!currentSlide) return
    
    // Add a placeholder image element
    addElement(currentSlide.id, {
      type: 'image',
      x: 350,
      y: 250,
      width: 100,
      height: 100,
      content: {
        src: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#f9fafb" stroke="#e5e7eb" stroke-width="2" stroke-dasharray="8,4" rx="8"/>
            <g transform="translate(100, 90)">
              <path d="M-35,-35 L35,-35 Q40,-35 40,-30 L40,20 Q40,25 35,25 L-35,25 Q-40,25 -40,20 L-40,-30 Q-40,-35 -35,-35 Z" 
                    fill="none" stroke="#9ca3af" stroke-width="3"/>
              <path d="M-35,5 L-10,-10 L5,0 L20,-15 L35,5 L35,20 L-35,20 Z" fill="#e5e7eb"/>
              <circle cx="-18" cy="-15" r="7" fill="#d1d5db"/>
            </g>
            <text x="100" y="145" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" 
                  font-size="16" font-weight="500" fill="#6b7280">Drop image here</text>
            <text x="100" y="165" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" 
                  font-size="14" fill="#9ca3af">or resize placeholder</text>
          </svg>
        `),
        alt: 'Placeholder image',
        isPlaceholder: true,
        objectFit: 'cover',
        offsetX: 0.5,
        offsetY: 0.5,
        scale: 1
      },
      style: {},
    })
  }
  
  const formatSavedTime = () => {
    if (!lastSaved) return 'saved just now'
    try {
      return `saved ${formatDistanceToNow(new Date(lastSaved), { addSuffix: true })}`
    } catch {
      return 'saved recently'
    }
  }
  
  const elementButtons = [
    { icon: Type, label: 'Text', onClick: handleAddText },
    { icon: MessageSquare, label: 'Speech', onClick: handleAddBlurb },
    { icon: Square, label: 'Shapes', onClick: () => setShowShapePopup(!showShapePopup) },
    { icon: Sparkles, label: 'Icons', onClick: () => setShowIconsPopup(!showIconsPopup) },
    { icon: Minus, label: 'Line', onClick: handleAddLine },
    { icon: Image, label: 'Image', onClick: handleAddImage },
    { icon: BarChart3, label: 'Chart', onClick: () => setShowChartModal(true) },
    { icon: Table, label: 'Table', onClick: () => setShowTablePopup(!showTablePopup) },
  ]
  
  // Click-outside detection for user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking inside user menu area
      if (userMenuRef.current && userMenuRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking on Recent Lessons popup
      const recentLessonsPopup = document.querySelector('[data-recent-lessons-popup]');
      if (recentLessonsPopup && recentLessonsPopup.contains(target)) {
        return;
      }
      
      // Don't close if clicking on Language popup
      const languagePopup = document.querySelector('[data-language-popup]');
      if (languagePopup && languagePopup.contains(target)) {
        return;
      }
      
      // Close both menus
      setIsUserMenuOpen(false);
      setShowRecentLessons(false);
      setShowLanguagePopup(false);
    };

    if (isUserMenuOpen) {
      // Add a small delay to avoid interfering with click events
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      }
    }
  }, [isUserMenuOpen])
  
  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false)
  }, [user?.avatar_url])
  
  // Debug: Track user menu state changes
  useEffect(() => {
    console.log('User menu state changed:', isUserMenuOpen);
    if (isUserMenuOpen) {
      console.trace('User menu opened from:');
    } else {
      console.trace('User menu closed from:');
    }
  }, [isUserMenuOpen])
  
  // Debug: Global click listener to see what's happening
  useEffect(() => {
    const debugClickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      console.log('Global click detected on:', {
        element: target,
        className: target.className,
        id: target.id,
        tagName: target.tagName,
        isInsideUserMenu: userMenuRef.current?.contains(target),
        isInsideDropdown: userMenuDropdownRef.current?.contains(target),
        currentMenuState: isUserMenuOpen
      });
    };
    
    document.addEventListener('click', debugClickHandler, true);
    return () => document.removeEventListener('click', debugClickHandler, true);
  }, [isUserMenuOpen])
  
  // Close language popup when user menu closes
  useEffect(() => {
    if (!isUserMenuOpen) {
      setShowLanguagePopup(false)
    }
  }, [isUserMenuOpen])

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.display_name) {
      const names = user.display_name.split(' ')
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }
  
  const getUserPlan = () => {
    if (!user) return 'Free'
    return user.subscription_tier === 'max' ? 'Max plan' :
           user.subscription_tier === 'pro' ? 'Pro plan' : 
           'Free plan'
  }
  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }
  
  const handleSaveLesson = async () => {
    if (presentation) {
      await saveToDatabase()
    }
  }
  
  return (
    <div
      ref={sidebarRef}
      className="absolute left-0 top-0 h-full z-30 transition-all duration-300 w-56"
    >
      <div className="h-full border-r border-gray-200 flex flex-col overflow-hidden bg-white">
        {/* Header - Simplified without back button and title */}
        <div className="p-4 border-b border-gray-100">
          <p className="text-caption text-gray-500">{formatSavedTime()}</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="px-4 pt-4">
          <TabGroup
            tabs={[
              { id: 'elements', label: 'Elements' },
              { id: 'slides', label: 'Slides' }
            ]}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as 'elements' | 'slides')}
            className="mb-3"
          />
        </div>
        
        {/* Content */}
        <div className={`flex-1 overflow-y-auto scrollbar-hide ${
          activeTab === 'elements' ? 'pt-4' : 'p-4'
        }`}>
          {activeTab === 'elements' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-0">
                {elementButtons.map((button, index) => {
                  const isLineToolActive = button.label === 'Line' && activeLineTool
                  const isShapeButton = button.label === 'Shapes'
                  const isIconsButton = button.label === 'Icons'
                  const isTableButton = button.label === 'Table'
                  return (
                    <button
                      key={index}
                      ref={isShapeButton ? shapeButtonRef : isIconsButton ? iconsButtonRef : isTableButton ? tableButtonRef : undefined}
                      onClick={button.onClick}
                      className={`flex flex-col items-center gap-2 p-4 transition-colors ${
                        isLineToolActive
                          ? 'bg-blue-500 text-white'
                          : (isShapeButton && showShapePopup) || (isIconsButton && showIconsPopup) || (isTableButton && showTablePopup)
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-white hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <button.icon className={`w-6 h-6 ${isLineToolActive ? 'text-white' : 'text-gray-700'}`} strokeWidth={1} />
                      <span className={`text-body-small ${isLineToolActive ? 'text-white' : 'text-gray-700'}`}>{button.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    onClick={() => {
                      setCurrentSlide(slide.id)
                      selectSlide(slide.id)
                    }}
                    className={`
                      relative aspect-[4/3] bg-white border-2 rounded-lg cursor-pointer
                      transition-all duration-200 overflow-hidden group
                      ${slide.id === selectedSlideId
                        ? 'border-blue-500 ring-2 ring-blue-400'
                        : slide.id === currentSlideId 
                          ? 'border-blue-300' 
                          : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    style={{
                      boxShadow: slide.id === selectedSlideId || slide.id === currentSlideId
                        ? 'var(--shadow-primary)'
                        : undefined
                    }}
                    onMouseEnter={(e) => {
                      if (slide.id !== selectedSlideId && slide.id !== currentSlideId) {
                        e.currentTarget.style.boxShadow = 'var(--shadow-primary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (slide.id !== selectedSlideId && slide.id !== currentSlideId) {
                        e.currentTarget.style.boxShadow = ''
                      }
                    }}
                  >
                    {/* Action buttons on hover */}
                    <div className="absolute top-1 right-1 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          selectSlide(slide.id)
                          setCurrentSlide(slide.id)
                          onApplyTemplateToSlide(slide.id)
                        }}
                        className="p-1.5 bg-white/90 backdrop-blur-sm rounded hover:bg-gray-100 transition-colors shadow-sm"
                        title="Apply template to slide"
                      >
                        <Plus className="w-3 h-3 text-gray-700" strokeWidth={1} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateSlide(slide.id)
                        }}
                        className="p-1.5 bg-white/90 backdrop-blur-sm rounded hover:bg-gray-100 transition-colors shadow-sm"
                        title="Duplicate slide"
                      >
                        <Copy className="w-3 h-3 text-gray-700" strokeWidth={1} />
                      </button>
                      {slides.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm('Are you sure you want to delete this slide?')) {
                              deleteSlide(slide.id)
                            }
                          }}
                          className="p-1.5 bg-white/90 backdrop-blur-sm rounded hover:bg-red-100 transition-colors shadow-sm"
                          title="Delete slide"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" strokeWidth={1} />
                        </button>
                      )}
                    </div>
                    
                    {/* Slide preview */}
                    <SlidePreview slide={slide} className="absolute inset-0" />
                    
                    {/* Slide number */}
                    <div className="absolute bottom-1 right-1 bg-white/80 text-gray-700 text-caption font-medium px-1.5 py-0.5 rounded z-10">
                      {index + 1}
                    </div>
                  </div>
                ))}
                
                {/* Add new slide button */}
                <button
                  onClick={() => addSlide()}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-5 h-5" strokeWidth={1} />
                </button>
            </div>
          )}
        </div>
        
        {/* User Profile Section - At the bottom */}
        <div className="p-2 border-t border-gray-100" ref={userMenuRef}>
          <div className="relative">
            <button
              onClick={() => {
                console.log('User avatar clicked, toggling menu from', isUserMenuOpen, 'to', !isUserMenuOpen);
                setIsUserMenuOpen(!isUserMenuOpen);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.avatar_url && !avatarError ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name || user.email || 'User avatar'}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="text-white text-xs font-medium">
                    {getUserInitials()}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-body-small font-medium text-gray-900 truncate">
                  {user?.display_name || user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-caption text-gray-500 truncate">
                  {getUserPlan()}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div 
                ref={userMenuDropdownRef}
                data-user-menu="true"
                className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden dropdown-animation z-[60]"
                onClick={(e) => {
                  console.log('Click inside user menu');
                  e.stopPropagation();
                }}
              >
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {user?.avatar_url && !avatarError ? (
                        <img
                          src={user.avatar_url}
                          alt={user.display_name || user.email || 'User avatar'}
                          className="w-full h-full object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {getUserInitials()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {user?.display_name || 'Display Name'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {getUserPlan()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 truncate">
                    {user?.email || 'email@example.com'}
                  </div>
                </div>

                {/* Menu Options */}
                <div className="py-1">
                  {presentation && (
                    <button
                    onClick={() => {
                      handleSaveLesson()
                      setIsUserMenuOpen(false)
                      }}
                    disabled={isSaving}
                    className="w-full flex items-center gap-3 px-4 py-2 text-menu text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Save className="w-4 h-4" strokeWidth={1.5} />
                      )}
                      {isSaving ? 'Saving...' : 'Save Lesson'}
                    </button>
                  )}
                  
                  <button
                  onClick={() => setShowRecentLessons(!showRecentLessons)}
                  className="w-full flex items-center justify-between px-4 py-2 text-menu text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <History className="w-4 h-4" strokeWidth={1.5} />
                      Recent Lessons
                    </span>
                    <ChevronDown className="w-4 h-4 rotate-[-90deg]" strokeWidth={1.5} />
                  </button>
                  
                  <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2 text-menu text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" strokeWidth={1.5} />
                    Settings
                  </Link>
                  
                  <button 
                    ref={languageButtonRef}
                    onClick={() => {
                      console.log('Language button clicked, current state:', showLanguagePopup);
                      setShowLanguagePopup(!showLanguagePopup);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-menu text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Languages className="w-4 h-4" strokeWidth={1.5} />
                      Language
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{currentLanguageDisplay?.flag}</span>
                      <span className="text-xs text-gray-500">{currentLanguageDisplay?.name}</span>
                    </div>
                  </button>
                  
                  <Link
                  to="/dashboard/tutorials"
                  className="flex items-center gap-3 px-4 py-2 text-menu text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <GraduationCap className="w-4 h-4" strokeWidth={1.5} />
                    Tutorials
                  </Link>
                  
                  <Link
                  to="/dashboard/billing"
                  className="flex items-center gap-3 px-4 py-2 text-menu text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                    Upgrade plan
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-menu text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Shape Popup */}
      <ShapePopup
        isOpen={showShapePopup}
        onClose={() => setShowShapePopup(false)}
        anchorElement={shapeButtonRef.current}
      />
      
      {/* Icons Popup */}
      <IconsPopup
        isOpen={showIconsPopup}
        onClose={() => setShowIconsPopup(false)}
        anchorElement={iconsButtonRef.current}
      />
      
      {/* Table Popup */}
      <TablePopup
        isOpen={showTablePopup}
        onClose={() => setShowTablePopup(false)}
        anchorElement={tableButtonRef.current}
      />
      
      {/* Chart Modal */}
      <ChartModal
        isOpen={showChartModal}
        onClose={() => setShowChartModal(false)}
        onAddToSlide={(imageDataUrl, width, height) => {
          // Add chart to current slide
          if (!currentSlide) return
          
          addElement(currentSlide.id, {
            type: 'image',
            x: 400 - width / 2,  // Center on canvas (800px width assumed)
            y: 300 - height / 2, // Center on canvas (600px height assumed)
            width,
            height,
            content: {
              src: imageDataUrl,
              alt: 'Generated Chart',
              objectFit: 'contain',
              isPlaceholder: false,
              offsetX: 0.5,
              offsetY: 0.5,
              scale: 1
            },
            style: {},
          })
          
          setShowChartModal(false)
        }}
      />
      
      {/* Recent Lessons Popup */}
      <RecentLessonsPopup
        isOpen={showRecentLessons}
        onClose={() => setShowRecentLessons(false)}
        anchorElement={userMenuRef.current}
      />
      
      {/* Language Popup */}
      <LanguagePopup 
        isOpen={showLanguagePopup}
        onClose={() => {
          setShowLanguagePopup(false);
          // Also close user menu when language is selected
          setIsUserMenuOpen(false);
        }}
        anchorElement={languageButtonRef.current}
        userMenuElement={userMenuDropdownRef.current}  // Pass user menu reference
      />
    </div>
  )
}
