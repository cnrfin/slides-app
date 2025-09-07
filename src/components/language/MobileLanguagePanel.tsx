import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useLanguageStore from '@/stores/languageStore';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/i18n/config';

interface MobileLanguagePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileLanguagePanel({ isOpen, onClose }: MobileLanguagePanelProps) {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const { currentLanguage, setLanguage } = useLanguageStore();
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode);
    // Add a small delay for better UX - let the user see the selection
    setTimeout(() => {
      onClose();
    }, 150);
  };
  
  // Use React Portal to render at body level
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Panel */}
          <motion.div
            ref={panelRef}
            className="fixed bottom-0 left-0 right-0 z-[9999] lg:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
          >
            <div className="bg-white dark:bg-dark-card rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-dark-border/20">
                <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-heading" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {t('selectLanguage')}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close language selector"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" strokeWidth={2} />
                </button>
              </div>
              
              {/* Language List */}
              <div className="flex-1 overflow-y-auto py-2">
                <div className="px-2">
                  {SUPPORTED_LANGUAGES.map((language) => {
                    const isSelected = currentLanguage === language.code;
                    
                    return (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageSelect(language.code)}
                        className={`
                          w-full flex items-center justify-between px-4 py-4 rounded-lg
                          transition-all duration-150 mb-1
                          ${isSelected 
                            ? 'bg-app-green-100 dark:bg-app-green-700/20 text-app-green-700 dark:text-app-green-300' 
                            : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-dark-text'
                          }
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl" role="img" aria-label={language.name}>
                            {/* Add flag emoji if available */}
                            {language.code === 'en' && '🇺🇸'}
                            {language.code === 'es' && '🇪🇸'}
                            {language.code === 'fr' && '🇫🇷'}
                            {language.code === 'de' && '🇩🇪'}
                            {language.code === 'it' && '🇮🇹'}
                            {language.code === 'ja' && '🇯🇵'}
                            {language.code === 'zh' && '🇨🇳'}
                          </span>
                          <div className="font-medium text-base">
                            {tCommon(`languages.${language.code}` as const)}
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <Check className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Bottom Safe Area for mobile devices */}
              <div className="h-safe-area-bottom bg-white dark:bg-dark-card" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
