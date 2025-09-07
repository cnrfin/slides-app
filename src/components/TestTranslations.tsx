// Test component to verify translations are working
import { useTranslation } from 'react-i18next'
import useLanguageStore from '@/stores/languageStore'
import { SUPPORTED_LANGUAGES } from '@/i18n/config'

export default function TestTranslations() {
  const { t } = useTranslation('dashboard')
  const { currentLanguage, setLanguage } = useLanguageStore()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Translation Test</h1>
      
      <div className="mb-6">
        <p className="mb-2">Current Language: <strong>{currentLanguage}</strong></p>
        <div className="flex gap-2">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-4 py-2 rounded ${
                currentLanguage === lang.code 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {lang.flag} {lang.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 bg-gray-50 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Dashboard Home Translations:</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Key:</strong>
          </div>
          <div>
            <strong>Translation:</strong>
          </div>
          
          <div>dashboardHome.greetings.goodMorning</div>
          <div>{t('dashboardHome.greetings.goodMorning', { name: 'Connor' })}</div>
          
          <div>dashboardHome.subtitle</div>
          <div>{t('dashboardHome.subtitle')}</div>
          
          <div>dashboardHome.createWithAI</div>
          <div>{t('dashboardHome.createWithAI')}</div>
          
          <div>dashboardHome.suggestions.conversationPractice</div>
          <div>{t('dashboardHome.suggestions.conversationPractice')}</div>
          
          <div>dashboardHome.quickActions.blankCanvas.title</div>
          <div>{t('dashboardHome.quickActions.blankCanvas.title')}</div>
          
          <div>dashboardHome.quickActions.myLessons.title</div>
          <div>{t('dashboardHome.quickActions.myLessons.title')}</div>
        </div>
      </div>
    </div>
  )
}
