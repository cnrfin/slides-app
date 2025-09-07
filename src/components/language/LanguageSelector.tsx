import { useRef } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useLanguageStore from '@/stores/languageStore';
import { SUPPORTED_LANGUAGES } from '@/i18n/config';
import LanguagePopup from './LanguagePopup';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

export default function LanguageSelector({ className = '', showLabel = true }: LanguageSelectorProps) {
  const { t } = useTranslation('common');
  const { currentLanguage, toggleLanguagePopup } = useLanguageStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const currentLanguageDisplay = SUPPORTED_LANGUAGES.find(
    lang => lang.code === currentLanguage
  );
  
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

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleLanguagePopup}
        className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        {showLabel && currentLanguageDisplay && (
          <>
            <span>{getFlagEmoji(currentLanguageDisplay.code)}</span>
            <span className="font-medium">{t(`languages.${currentLanguageDisplay.code}` as const)}</span>
          </>
        )}
      </button>
      
      <LanguagePopup anchorElement={buttonRef.current} />
    </>
  );
}
