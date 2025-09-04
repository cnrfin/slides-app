import { useRef } from 'react';
import { Globe } from 'lucide-react';
import useLanguageStore from '@/stores/languageStore';
import { SUPPORTED_LANGUAGES } from '@/i18n/config';
import LanguagePopup from './LanguagePopup';

export default function LanguageTestButton() {
  const { currentLanguage, isLanguagePopupOpen, toggleLanguagePopup } = useLanguageStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const currentLanguageDisplay = SUPPORTED_LANGUAGES.find(
    lang => lang.code === currentLanguage
  );

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          ref={buttonRef}
          onClick={() => {
            console.log('Test button clicked');
            console.log('Current popup state:', isLanguagePopupOpen);
            toggleLanguagePopup();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200"
        >
          <Globe className="w-5 h-5" />
          <span>{currentLanguageDisplay?.flag}</span>
          <span className="font-medium">{currentLanguageDisplay?.name}</span>
        </button>
        
        <div className="mt-2 text-xs text-gray-500">
          Popup state: {isLanguagePopupOpen ? 'OPEN' : 'CLOSED'}
        </div>
      </div>
      
      <LanguagePopup anchorElement={buttonRef.current} />
    </>
  );
}
