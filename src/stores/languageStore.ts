import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n/config';
import type { LanguageCode } from '@/i18n/config';

interface LanguageStore {
  currentLanguage: LanguageCode;
  isLanguagePopupOpen: boolean;
  setLanguage: (language: LanguageCode) => void;
  toggleLanguagePopup: () => void;
  closeLanguagePopup: () => void;
}

const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      currentLanguage: (i18n.language as LanguageCode) || 'en',
      isLanguagePopupOpen: false,
      
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ currentLanguage: language, isLanguagePopupOpen: false });
        
        // Update HTML lang attribute
        document.documentElement.lang = language;
        
        // Apply language-specific styles
        document.documentElement.setAttribute('data-lang', language);
        
        // Handle RTL languages (if adding Arabic or Hebrew in future)
        if (language === 'ar' || language === 'he') {
          document.documentElement.dir = 'rtl';
        } else {
          document.documentElement.dir = 'ltr';
        }
        
        // Apply CJK-specific font class for better rendering
        if (language === 'ja' || language === 'zh' || language === 'ko') {
          document.documentElement.classList.add('cjk-lang');
        } else {
          document.documentElement.classList.remove('cjk-lang');
        }
      },
      
      toggleLanguagePopup: () => {
        const currentState = get().isLanguagePopupOpen;
        console.log('Toggling language popup from:', currentState, 'to:', !currentState);
        set({ isLanguagePopupOpen: !currentState });
      },
      
      closeLanguagePopup: () => {
        console.log('Closing language popup');
        set({ isLanguagePopupOpen: false });
      },
    }),
    {
      name: 'language-storage',
      // Only persist the language, not the popup state
      partialize: (state) => ({ currentLanguage: state.currentLanguage }),
    }
  )
);

export default useLanguageStore;
