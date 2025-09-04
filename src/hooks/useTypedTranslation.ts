import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

type Namespace = 'common' | 'auth' | 'slides' | 'dashboard';

export function useTypedTranslation(ns?: Namespace | Namespace[]) {
  const { t, i18n, ready } = useI18nTranslation(ns);
  
  return {
    t: t as TFunction,
    i18n,
    ready,
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage.bind(i18n),
  };
}
