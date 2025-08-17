// src/components/sidebar/RightSidebar.tsx
import { useState, useEffect } from 'react'
import { 
  Play,
  Type,
  Palette,
  Sparkles,
  ChevronLeft,
  Check
} from 'lucide-react'
import useSlideStore, { useSelectedElements } from '@/stores/slideStore'
import TextPropertiesPanel from '@/components/properties/TextPropertiesPanel'
import ShapePropertiesPanel from '@/components/properties/ShapePropertiesPanel'
import ImagePropertiesPanel from '@/components/properties/ImagePropertiesPanel'
import BlurbPropertiesPanel from '@/components/properties/BlurbPropertiesPanel'
import LinePropertiesPanel from '@/components/properties/LinePropertiesPanel'
import IconPropertiesPanel from '@/components/properties/IconPropertiesPanel'
import TablePropertiesPanel from '@/components/properties/TablePropertiesPanel'
import { TabGroup } from '@/components/ui'
import { FONTS } from '@/utils/fonts.config'
import ExportDropdown from '@/components/ui/ExportDropdown'

interface RightSidebarProps {
  onPlaySlideshow?: () => void
  onExportAllPDF?: () => void
  onExportCurrentPDF?: () => void
}



// Predefined color schemes
const COLOR_SCHEMES = [
  {
    name: 'Corporate Blue',
    colors: ['#1e3a8a', '#3b82f6', '#93c5fd', '#ffffff'],
    description: 'Professional and trustworthy'
  },
  {
    name: 'Executive Gray',
    colors: ['#374151', '#6b7280', '#d1d5db', '#ffffff'],
    description: 'Sophisticated and modern'
  },
  {
    name: 'Modern Black',
    colors: ['#000000', '#1f2937', '#9ca3af', '#ffffff'],
    description: 'Bold and minimalist'
  },
  {
    name: 'Premium Gold',
    colors: ['#713f12', '#d97706', '#fbbf24', '#fef3c7'],
    description: 'Luxury and elegance'
  },
  {
    name: 'Trust Navy',
    colors: ['#1e293b', '#334155', '#64748b', '#cbd5e1'],
    description: 'Stable and reliable'
  },
  {
    name: 'Innovation Purple',
    colors: ['#581c87', '#9333ea', '#c084fc', '#f3e8ff'],
    description: 'Creative and innovative'
  },
  {
    name: 'Tech Green',
    colors: ['#064e3b', '#059669', '#34d399', '#d1fae5'],
    description: 'Fresh and technological'
  },
  {
    name: 'Energy Red',
    colors: ['#7f1d1d', '#dc2626', '#f87171', '#fee2e2'],
    description: 'Dynamic and passionate'
  },
]

// Predefined themes (combination of fonts and colors)
const THEMES = [
  {
    name: 'Pearl',
    font: 'Arial, sans-serif',
    colors: ['#f8f9fa', '#e9ecef', '#495057', '#212529'],
    background: '#ffffff',
    description: 'Clean and minimal'
  },
  {
    name: 'Vortex',
    font: 'Helvetica, sans-serif',
    colors: ['#1a1d29', '#2d3142', '#ffffff', '#64b5f6'],
    background: '#0f111a',
    description: 'Dark and modern'
  },
  {
    name: 'Seafoam',
    font: 'Verdana, sans-serif',
    colors: ['#e0f2e9', '#5cdb95', '#05386b', '#379683'],
    background: '#f7fffe',
    description: 'Fresh and calming'
  },
  {
    name: 'Corporate',
    font: 'Georgia, serif',
    colors: ['#1e3a8a', '#3b82f6', '#000000', '#ffffff'],
    background: '#f8fafc',
    description: 'Professional standard'
  },
  {
    name: 'Sunset',
    font: 'Trebuchet MS, sans-serif',
    colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ffffff'],
    background: '#fff5f5',
    description: 'Warm and vibrant'
  },
  {
    name: 'Midnight',
    font: 'Times New Roman, serif',
    colors: ['#2c3e50', '#34495e', '#ecf0f1', '#3498db'],
    background: '#1a1a2e',
    description: 'Elegant darkness'
  },
]

type SidebarView = 'default' | 'fonts' | 'colors' | 'themes'

export default function RightSidebar({ onPlaySlideshow, onExportAllPDF, onExportCurrentPDF }: RightSidebarProps) {
  const [currentView, setCurrentView] = useState<SidebarView>('default')
  const [selectedFont, setSelectedFont] = useState(FONTS[0].family)
  const [selectedColorScheme, setSelectedColorScheme] = useState(COLOR_SCHEMES[0])
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [themeTab, setThemeTab] = useState<'default' | 'custom'>('default')
  
  const selectedElements = useSelectedElements()
  const { slides, currentSlideId, updateElement } = useSlideStore()
  
  // Filter fonts based on search
  const filteredFonts = FONTS.filter(font => 
    font.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    font.type.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Filter color schemes based on search
  const filteredColorSchemes = COLOR_SCHEMES.filter(scheme =>
    scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scheme.description.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Filter themes based on search
  const filteredThemes = THEMES.filter(theme =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.description.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Apply font to all text elements
  const applyFontGlobally = (fontFamily: string) => {
    setSelectedFont(fontFamily)
    
    slides.forEach(slide => {
      slide.elements.forEach(element => {
        if (element.type === 'text' || element.type === 'blurb') {
          updateElement(slide.id, element.id, {
            style: {
              ...element.style,
              fontFamily
            }
          })
        }
      })
    })
  }
  
  // Apply color scheme to all shape elements
  const applyColorSchemeGlobally = (scheme: typeof COLOR_SCHEMES[0]) => {
    setSelectedColorScheme(scheme)
    
    slides.forEach(slide => {
      slide.elements.forEach((element, index) => {
        if (element.type === 'shape' || element.type === 'blurb') {
          // Use different colors from the scheme for different elements
          const colorIndex = index % scheme.colors.length
          updateElement(slide.id, element.id, {
            style: {
              ...element.style,
              backgroundColor: scheme.colors[colorIndex]
            }
          })
        }
      })
    })
  }
  
  // Apply theme (font + colors + background)
  const applyThemeGlobally = (theme: typeof THEMES[0]) => {
    setSelectedTheme(theme)
    
    slides.forEach(slide => {
      // Update slide background
      useSlideStore.getState().updateSlide(slide.id, {
        background: theme.background
      })
      
      slide.elements.forEach((element, index) => {
        if (element.type === 'text') {
          updateElement(slide.id, element.id, {
            style: {
              ...element.style,
              fontFamily: theme.font,
              color: theme.colors[2] // Use third color for text
            }
          })
        } else if (element.type === 'shape' || element.type === 'blurb') {
          const colorIndex = index % theme.colors.length
          updateElement(slide.id, element.id, {
            style: {
              ...element.style,
              backgroundColor: theme.colors[colorIndex]
            }
          })
          
          // Update text color for blurbs
          if (element.type === 'blurb') {
            updateElement(slide.id, element.id, {
              style: {
                ...element.style,
                fontFamily: theme.font,
                color: colorIndex < 2 ? theme.colors[3] : theme.colors[0] // Light text on dark bg, dark text on light bg
              }
            })
          }
        }
      })
    })
  }
  
  // Reset search when changing views
  useEffect(() => {
    setSearchQuery('')
  }, [currentView])
  
  return (
    <div className="properties-panel absolute right-0 top-0 bottom-0 w-56 bg-white border-l border-gray-200 shadow-sm z-10 flex flex-col">
      {/* Header - Always Visible */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={onPlaySlideshow}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Play Slideshow"
          >
            <Play className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
          </button>
          <ExportDropdown
            onExportAll={onExportAllPDF || (() => {})}
            onExportCurrent={onExportCurrentPDF || (() => {})}
          />
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {selectedElements.length > 0 ? (
          // Show element properties when something is selected
          <div className="p-4">
            {selectedElements.some(el => el.type === 'text') ? (
              <TextPropertiesPanel />
            ) : selectedElements.some(el => el.type === 'shape') ? (
              <ShapePropertiesPanel />
            ) : selectedElements.some(el => el.type === 'image') ? (
              <ImagePropertiesPanel />
            ) : selectedElements.some(el => el.type === 'blurb') ? (
              <BlurbPropertiesPanel />
            ) : selectedElements.some(el => el.type === 'line') ? (
              <LinePropertiesPanel />
            ) : selectedElements.some(el => el.type === 'icon') ? (
              <IconPropertiesPanel element={selectedElements.find(el => el.type === 'icon')!} />
            ) : selectedElements.some(el => el.type === 'table') ? (
              <TablePropertiesPanel />
            ) : null}
          </div>
        ) : (
          // Show global style options when nothing is selected
          <>
            {currentView === 'default' ? (
              // Default view with 3 buttons
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setCurrentView('fonts')}
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all hover:scale-105 group"
                >
                  <Type className="w-5 h-5 text-gray-600 group-hover:text-[#9771ff] transition-colors" strokeWidth={1.5} />
                  <div className="text-left">
                    <div className="font-medium text-gray-800 group-hover:text-[#9771ff] transition-colors">Change Fonts</div>
                    <div className="text-xs text-gray-500">Update all fonts</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setCurrentView('colors')}
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all hover:scale-105 group"
                >
                  <Palette className="w-5 h-5 text-gray-600 group-hover:text-[#54cb56] transition-colors" strokeWidth={1.5} />
                  <div className="text-left">
                    <div className="font-medium text-gray-800 group-hover:text-[#54cb56] transition-colors">Change Colors</div>
                    <div className="text-xs text-gray-500">Update all colors</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setCurrentView('themes')}
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all hover:scale-105 group"
                >
                  <Sparkles className="w-5 h-5 text-gray-600 group-hover:text-[#fe6d66] transition-colors" strokeWidth={1.5} />
                  <div className="text-left">
                    <div className="font-medium text-gray-800 group-hover:text-[#fe6d66] transition-colors">Change Theme</div>
                    <div className="text-xs text-gray-500">Update the theme</div>
                  </div>
                </button>
              </div>
            ) : currentView === 'fonts' ? (
              // Font selection view
              <div className="p-4">
                <div className="mb-4">
                  <button
                    onClick={() => setCurrentView('default')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="Search fonts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-sm"
                />
                
                <div className="space-y-1">
                  {filteredFonts.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => applyFontGlobally(font.family)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedFont === font.family
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium text-gray-800" style={{ fontFamily: font.family }}>
                          {font.name}
                        </div>
                        <div className="text-xs text-gray-500">{font.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xl" style={{ fontFamily: font.family }}>Aa</span>
                        {selectedFont === font.family && (
                          <Check className="w-4 h-4 text-blue-600" strokeWidth={2} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : currentView === 'colors' ? (
              // Color scheme selection view
              <div className="p-4">
                <div className="mb-4">
                  <button
                    onClick={() => setCurrentView('default')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="Search colors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-sm"
                />
                
                <div className="space-y-2">
                  {filteredColorSchemes.map((scheme) => (
                    <button
                      key={scheme.name}
                      onClick={() => applyColorSchemeGlobally(scheme)}
                      className={`w-full p-3 rounded-lg transition-all ${
                        selectedColorScheme.name === scheme.name
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800 text-sm">{scheme.name}</span>
                        {selectedColorScheme.name === scheme.name && (
                          <Check className="w-4 h-4 text-blue-600" strokeWidth={2} />
                        )}
                      </div>
                      <div className="flex gap-1 mb-2">
                        {scheme.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="flex-1 h-6 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">{scheme.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : currentView === 'themes' ? (
              // Theme selection view
              <div className="p-4">
                <div className="mb-4">
                  <button
                    onClick={() => setCurrentView('default')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
                  </button>
                </div>
                
                {/* Tab navigation */}
                <TabGroup
                  tabs={[
                    { id: 'default', label: 'Default' },
                    { id: 'custom', label: 'Custom' }
                  ]}
                  activeTab={themeTab}
                  onTabChange={(tab) => setThemeTab(tab as 'default' | 'custom')}
                  className="mb-3"
                />
                
                {themeTab === 'default' ? (
                  <>
                    <input
                      type="text"
                      placeholder="Search themes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-sm"
                    />
                    
                    <div className="space-y-2">
                      {filteredThemes.map((theme) => (
                        <button
                          key={theme.name}
                          onClick={() => applyThemeGlobally(theme)}
                          className={`w-full rounded-lg transition-all overflow-hidden ${
                            selectedTheme.name === theme.name
                              ? 'ring-2 ring-blue-500'
                              : 'hover:ring-2 hover:ring-gray-300'
                          }`}
                        >
                          {/* Theme preview */}
                          <div
                            className="p-4"
                            style={{ backgroundColor: theme.background }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className="font-semibold text-lg"
                                style={{ 
                                  fontFamily: theme.font,
                                  color: theme.colors[2]
                                }}
                              >
                                Title
                              </span>
                              {selectedTheme.name === theme.name && (
                                <Check className="w-4 h-4 text-blue-600" strokeWidth={2} />
                              )}
                            </div>
                            <span
                              className="text-sm"
                              style={{ 
                                fontFamily: theme.font,
                                color: theme.colors[2],
                                opacity: 0.8
                              }}
                            >
                              Body & accent
                            </span>
                          </div>
                          <div className="bg-white px-4 py-2 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-800">{theme.name}</span>
                              <div className="flex gap-0.5">
                                {theme.colors.slice(0, 3).map((color, idx) => (
                                  <div
                                    key={idx}
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" strokeWidth={1} />
                    <p className="text-sm">Custom themes coming soon</p>
                  </div>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}