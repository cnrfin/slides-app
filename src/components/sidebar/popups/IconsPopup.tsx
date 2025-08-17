import { useState, useRef, useEffect } from 'react'
import { 
  Check, X, Star, Heart, Plus, Minus, 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Settings, Bell, Mail, Home, User, Search,
  Download, Upload, Share2, Trash2, Edit,
  Calendar, Clock, Eye, Lock, Unlock,
  Bookmark, Flag, Pin, Tag, AlertCircle,
  Info, HelpCircle, AlertTriangle, CheckCircle,
  XCircle, PlayCircle, PauseCircle, StopCircle,
  RefreshCw, Zap, Sun, Moon, Cloud,
  Wifi, WifiOff, Phone, Video, Mic,
  MicOff, Camera, CameraOff, Monitor, Smartphone,
  Cpu, Database, Server, Globe, Map,
  MapPin, Navigation, Compass, Award, Gift,
  ShoppingCart, ShoppingBag, DollarSign, CreditCard,
  TrendingUp, TrendingDown, BarChart2, PieChart,
  FileText, File, Folder, FolderOpen, Save,
  Printer, Copy, Clipboard, Paperclip, Link2,
  ExternalLink, Menu, MoreHorizontal, MoreVertical,
  Grid, List, Layers, Layout, Maximize,
  Minimize, Move, ZoomIn, ZoomOut, Target,
  Circle, Square
} from 'lucide-react'
import useSlideStore from '@/stores/slideStore'
import type { IconContent } from '@/types/slide.types'
import { getIconPath } from '@/utils/icon.utils'

interface IconsPopupProps {
  isOpen: boolean
  onClose: () => void
  anchorElement: HTMLElement | null
}

interface IconCategory {
  name: string
  icons: Array<{
    Icon: any
    name: string
    id: string
  }>
}

const iconCategories: IconCategory[] = [
  {
    name: 'Basic',
    icons: [
      { Icon: Check, name: 'Check', id: 'check' },
      { Icon: X, name: 'X', id: 'x' },
      { Icon: Plus, name: 'Plus', id: 'plus' },
      { Icon: Minus, name: 'Minus', id: 'minus' },
      { Icon: Star, name: 'Star', id: 'star' },
      { Icon: Heart, name: 'Heart', id: 'heart' },
      { Icon: Circle, name: 'Circle', id: 'circle' },
      { Icon: Square, name: 'Square', id: 'square' }
    ]
  },
  {
    name: 'Arrows',
    icons: [
      { Icon: ArrowUp, name: 'Arrow Up', id: 'arrow-up' },
      { Icon: ArrowDown, name: 'Arrow Down', id: 'arrow-down' },
      { Icon: ArrowLeft, name: 'Arrow Left', id: 'arrow-left' },
      { Icon: ArrowRight, name: 'Arrow Right', id: 'arrow-right' },
      { Icon: RefreshCw, name: 'Refresh', id: 'refresh' },
      { Icon: ExternalLink, name: 'External Link', id: 'external-link' },
      { Icon: TrendingUp, name: 'Trending Up', id: 'trending-up' },
      { Icon: TrendingDown, name: 'Trending Down', id: 'trending-down' }
    ]
  },
  {
    name: 'Status',
    icons: [
      { Icon: CheckCircle, name: 'Check Circle', id: 'check-circle' },
      { Icon: XCircle, name: 'X Circle', id: 'x-circle' },
      { Icon: AlertCircle, name: 'Alert Circle', id: 'alert-circle' },
      { Icon: Info, name: 'Info', id: 'info' },
      { Icon: HelpCircle, name: 'Help Circle', id: 'help-circle' },
      { Icon: AlertTriangle, name: 'Warning', id: 'warning' },
      { Icon: Lock, name: 'Lock', id: 'lock' },
      { Icon: Unlock, name: 'Unlock', id: 'unlock' }
    ]
  },
  {
    name: 'Common',
    icons: [
      { Icon: Home, name: 'Home', id: 'home' },
      { Icon: User, name: 'User', id: 'user' },
      { Icon: Search, name: 'Search', id: 'search' },
      { Icon: Settings, name: 'Settings', id: 'settings' },
      { Icon: Bell, name: 'Bell', id: 'bell' },
      { Icon: Mail, name: 'Mail', id: 'mail' },
      { Icon: Calendar, name: 'Calendar', id: 'calendar' },
      { Icon: Clock, name: 'Clock', id: 'clock' }
    ]
  },
  {
    name: 'Media',
    icons: [
      { Icon: PlayCircle, name: 'Play', id: 'play' },
      { Icon: PauseCircle, name: 'Pause', id: 'pause' },
      { Icon: StopCircle, name: 'Stop', id: 'stop' },
      { Icon: Camera, name: 'Camera', id: 'camera' },
      { Icon: Video, name: 'Video', id: 'video' },
      { Icon: Mic, name: 'Microphone', id: 'mic' },
      { Icon: MicOff, name: 'Mic Off', id: 'mic-off' },
      { Icon: CameraOff, name: 'Camera Off', id: 'camera-off' }
    ]
  },
  {
    name: 'Actions',
    icons: [
      { Icon: Download, name: 'Download', id: 'download' },
      { Icon: Upload, name: 'Upload', id: 'upload' },
      { Icon: Share2, name: 'Share', id: 'share' },
      { Icon: Copy, name: 'Copy', id: 'copy' },
      { Icon: Trash2, name: 'Trash', id: 'trash' },
      { Icon: Edit, name: 'Edit', id: 'edit' },
      { Icon: Save, name: 'Save', id: 'save' },
      { Icon: Printer, name: 'Print', id: 'printer' }
    ]
  },
  {
    name: 'Marks',
    icons: [
      { Icon: Bookmark, name: 'Bookmark', id: 'bookmark' },
      { Icon: Flag, name: 'Flag', id: 'flag' },
      { Icon: Pin, name: 'Pin', id: 'pin' },
      { Icon: Tag, name: 'Tag', id: 'tag' },
      { Icon: Eye, name: 'Eye', id: 'eye' },
      { Icon: Zap, name: 'Zap', id: 'zap' },
      { Icon: Award, name: 'Award', id: 'award' },
      { Icon: Gift, name: 'Gift', id: 'gift' }
    ]
  },
  {
    name: 'Tech',
    icons: [
      { Icon: Wifi, name: 'Wifi', id: 'wifi' },
      { Icon: WifiOff, name: 'Wifi Off', id: 'wifi-off' },
      { Icon: Phone, name: 'Phone', id: 'phone' },
      { Icon: Monitor, name: 'Monitor', id: 'monitor' },
      { Icon: Smartphone, name: 'Smartphone', id: 'smartphone' },
      { Icon: Cpu, name: 'CPU', id: 'cpu' },
      { Icon: Database, name: 'Database', id: 'database' },
      { Icon: Server, name: 'Server', id: 'server' }
    ]
  },
  {
    name: 'Location',
    icons: [
      { Icon: Globe, name: 'Globe', id: 'globe' },
      { Icon: Map, name: 'Map', id: 'map' },
      { Icon: MapPin, name: 'Map Pin', id: 'map-pin' },
      { Icon: Navigation, name: 'Navigation', id: 'navigation' },
      { Icon: Compass, name: 'Compass', id: 'compass' },
      { Icon: Target, name: 'Target', id: 'target' }
    ]
  },
  {
    name: 'Business',
    icons: [
      { Icon: ShoppingCart, name: 'Shopping Cart', id: 'shopping-cart' },
      { Icon: ShoppingBag, name: 'Shopping Bag', id: 'shopping-bag' },
      { Icon: DollarSign, name: 'Dollar Sign', id: 'dollar-sign' },
      { Icon: CreditCard, name: 'Credit Card', id: 'credit-card' },
      { Icon: BarChart2, name: 'Bar Chart', id: 'bar-chart' },
      { Icon: PieChart, name: 'Pie Chart', id: 'pie-chart' }
    ]
  },
  {
    name: 'Files',
    icons: [
      { Icon: FileText, name: 'File Text', id: 'file-text' },
      { Icon: File, name: 'File', id: 'file' },
      { Icon: Folder, name: 'Folder', id: 'folder' },
      { Icon: FolderOpen, name: 'Folder Open', id: 'folder-open' },
      { Icon: Clipboard, name: 'Clipboard', id: 'clipboard' },
      { Icon: Paperclip, name: 'Paperclip', id: 'paperclip' },
      { Icon: Link2, name: 'Link', id: 'link' }
    ]
  },
  {
    name: 'Weather',
    icons: [
      { Icon: Sun, name: 'Sun', id: 'sun' },
      { Icon: Moon, name: 'Moon', id: 'moon' },
      { Icon: Cloud, name: 'Cloud', id: 'cloud' }
    ]
  },
  {
    name: 'Layout',
    icons: [
      { Icon: Menu, name: 'Menu', id: 'menu' },
      { Icon: Grid, name: 'Grid', id: 'grid' },
      { Icon: List, name: 'List', id: 'list' },
      { Icon: Layers, name: 'Layers', id: 'layers' },
      { Icon: Layout, name: 'Layout', id: 'layout' },
      { Icon: MoreHorizontal, name: 'More Horizontal', id: 'more-horizontal' },
      { Icon: MoreVertical, name: 'More Vertical', id: 'more-vertical' }
    ]
  },
  {
    name: 'View',
    icons: [
      { Icon: Maximize, name: 'Maximize', id: 'maximize' },
      { Icon: Minimize, name: 'Minimize', id: 'minimize' },
      { Icon: Move, name: 'Move', id: 'move' },
      { Icon: ZoomIn, name: 'Zoom In', id: 'zoom-in' },
      { Icon: ZoomOut, name: 'Zoom Out', id: 'zoom-out' }
    ]
  }
]

export default function IconsPopup({ isOpen, onClose, anchorElement }: IconsPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  
  const { slides, currentSlideId, addElement } = useSlideStore()
  const currentSlide = slides.find(s => s.id === currentSlideId)
  
  // Calculate popup position
  useEffect(() => {
    if (isOpen && anchorElement) {
      const calculatePosition = () => {
        const rect = anchorElement.getBoundingClientRect()
        const popupWidth = 400
        const popupHeight = 500
        
        let left = rect.right + 8
        let top = rect.top
        
        if (left + popupWidth > window.innerWidth) {
          left = rect.left - popupWidth - 8
        }
        
        if (top + popupHeight > window.innerHeight) {
          top = window.innerHeight - popupHeight - 8
        }
        
        setPosition({ top, left })
      }
      
      const timer = setTimeout(calculatePosition, 0)
      return () => clearTimeout(timer)
    } else if (!isOpen) {
      setPosition(null)
    }
  }, [isOpen, anchorElement])
  
  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
          anchorElement && !anchorElement.contains(event.target as Node)) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, anchorElement])
  
  const handleAddIcon = (iconId: string, IconComponent: any) => {
    if (!currentSlide) return
    
    // Get the SVG path for this icon
    const iconData = getIconPath(iconId)
    
    const iconContent: IconContent = {
      iconId,
      iconType: 'lucide',
      svgPath: iconData.path // Store the SVG path directly
    }
    
    addElement(currentSlide.id, {
      type: 'icon',
      x: 375,
      y: 275,
      width: 50,
      height: 50,
      content: iconContent,
      style: {
        color: '#000000',
        strokeWidth: 5
      },
    })
    
    onClose()
  }
  
  if (!isOpen || !position) return null
  
  return (
    <div 
      ref={popupRef}
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 z-50 animate-popup-in overflow-hidden"
      style={{ top: position.top, left: position.left, width: '400px', maxHeight: '500px' }}
    >
      <div className="overflow-y-auto max-h-[492px] scrollbar-styled p-4">
        {iconCategories.map((category) => (
          <div key={category.name} className="mb-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              {category.name}
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {category.icons.map(({ Icon, name, id }) => (
                <button
                  key={id}
                  onClick={() => handleAddIcon(id, Icon)}
                  className="flex items-center justify-center p-3 rounded hover:bg-gray-100 transition-colors"
                  title={name}
                >
                  <Icon className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}