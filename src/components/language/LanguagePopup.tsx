import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useLanguageStore from '@/stores/languageStore';
import { SUPPORTED_LANGUAGES } from '@/i18n/config';

interface LanguagePopupProps {
  anchorElement: HTMLElement | null;
}

export default function LanguagePopup({ anchorElement }: LanguagePopupProps) {
  const { t } = useTranslation('common');
  const { currentLanguage, isLanguagePopupOpen, setLanguage, closeLanguagePopup } = useLanguageStore();
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Map language codes to flag emojis
  const getFlagEmoji = (code: string) => {
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'ja': '🇯🇵',
      'zh': '🇨🇳'
    };
    return flags[code] || '';
  };
  
  useEffect(() => {
    if (!isLanguagePopupOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        anchorElement && 
        !anchorElement.contains(event.target as Node)
      ) {
        closeLanguagePopup();
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLanguagePopup();
      }
    };
    
    // Small delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 10);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isLanguagePopupOpen, anchorElement, closeLanguagePopup]);
  
  // Calculate position
  const getPopupPosition = () => {
    if (!anchorElement) {
      // Fallback to center of screen if no anchor
      return { 
        top: window.innerHeight / 2 - 200, 
        left: window.innerWidth / 2 - 100 
      };
    }
    
    const rect = anchorElement.getBoundingClientRect();
    
    // Ensure popup stays within viewport
    let top = rect.bottom + 8;
    let left = rect.left;
    
    // Check if popup would go off the bottom of the screen
    if (top + 300 > window.innerHeight) {
      top = rect.top - 300 - 8; // Position above the button
    }
    
    // Check if popup would go off the right side of the screen
    if (left + 200 > window.innerWidth) {
      left = window.innerWidth - 220; // 200px width + some padding
    }
    
    return { top, left };
  };
  
  if (!isLanguagePopupOpen) {
    return null;
  }
  
  const position = getPopupPosition();
  
  // Use React Portal to render the popup at the root level
  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px] animate-in"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 99999, // Very high z-index
        animation: 'fadeInScale 0.15s ease-out',
      }}
      data-language-popup
    >
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
      
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Select Language
        </p>
      </div>
      
      <div className="py-1">
        {SUPPORTED_LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => {
              setLanguage(language.code);
            }}
            className={`
              w-full flex items-center justify-between px-3 py-2 
              text-sm hover:bg-gray-50 transition-colors
              ${currentLanguage === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{getFlagEmoji(language.code)}</span>
              <span className="font-medium">{t(`languages.${language.code}` as const)}</span>
            </div>
            {currentLanguage === language.code && (
              <Check className="w-4 h-4" strokeWidth={2} />
            )}
          </button>
        ))}
      </div>
    </div>,
    document.body // Render at the body level
  );
}
