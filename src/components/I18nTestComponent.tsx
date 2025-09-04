import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/language';
import useLanguageStore from '@/stores/languageStore';

export default function I18nTestComponent() {
  const { t, i18n } = useTranslation(['common', 'auth']);
  const { currentLanguage } = useLanguageStore();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-h2 mb-6">i18n Test Component</h1>
      
      <div className="mb-8">
        <h2 className="text-h4 mb-4">Current Language: {currentLanguage}</h2>
        <LanguageSelector />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-h5 mb-4">Common Translations</h3>
          <ul className="space-y-2">
            <li><strong>Welcome:</strong> {t('common:welcome')}</li>
            <li><strong>Loading:</strong> {t('common:loading')}</li>
            <li><strong>Save:</strong> {t('common:save')}</li>
            <li><strong>Cancel:</strong> {t('common:cancel')}</li>
            <li><strong>Settings:</strong> {t('common:settings')}</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-h5 mb-4">Auth Translations</h3>
          <ul className="space-y-2">
            <li><strong>Sign In:</strong> {t('auth:signIn')}</li>
            <li><strong>Sign Out:</strong> {t('auth:signOut')}</li>
            <li><strong>Email:</strong> {t('auth:email')}</li>
            <li><strong>Password:</strong> {t('auth:password')}</li>
            <li><strong>Language:</strong> {t('auth:language')}</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          Language detection order: localStorage → cookie → browser → HTML tag
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Browser language: {navigator.language}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          i18n language: {i18n.language}
        </p>
      </div>
    </div>
  );
}
