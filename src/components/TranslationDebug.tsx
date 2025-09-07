// Debug component to log translation status
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n/config'

export function TranslationDebug() {
  const { t, i18n: i18nInstance } = useTranslation('dashboard')
  
  useEffect(() => {
    console.log('=== Translation Debug ===')
    console.log('Current language:', i18nInstance.language)
    console.log('Available languages:', i18nInstance.languages)
    console.log('Loaded namespaces:', i18nInstance.options.ns)
    console.log('Resource bundle:', i18nInstance.getResourceBundle(i18nInstance.language, 'dashboard'))
    console.log('Test translation (upgradePlan):', t('upgradePlan'))
    console.log('Test translation (dashboardHome.greetings.goodMorning):', t('dashboardHome.greetings.goodMorning', { name: 'Test' }))
    console.log('========================')
  }, [i18nInstance.language])
  
  return null
}
