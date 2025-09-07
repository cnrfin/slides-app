import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// Import translation files
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enSlides from './locales/en/slides.json';
import enDashboard from './locales/en/dashboard.json';

import esCommon from './locales/es/common.json';
import esAuth from './locales/es/auth.json';
import esSlides from './locales/es/slides.json';
import esDashboard from './locales/es/dashboard.json';

import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frSlides from './locales/fr/slides.json';
import frDashboard from './locales/fr/dashboard.json';

import deCommon from './locales/de/common.json';
import deAuth from './locales/de/auth.json';
import deSlides from './locales/de/slides.json';
import deDashboard from './locales/de/dashboard.json';

import itCommon from './locales/it/common.json';
import itAuth from './locales/it/auth.json';
import itSlides from './locales/it/slides.json';
import itDashboard from './locales/it/dashboard.json';

import jaCommon from './locales/ja/common.json';
import jaAuth from './locales/ja/auth.json';
import jaSlides from './locales/ja/slides.json';
import jaDashboard from './locales/ja/dashboard.json';

import zhCommon from './locales/zh/common.json';
import zhAuth from './locales/zh/auth.json';
import zhSlides from './locales/zh/slides.json';
import zhDashboard from './locales/zh/dashboard.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    slides: enSlides,
    dashboard: enDashboard,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    slides: esSlides,
    dashboard: esDashboard,
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    slides: frSlides,
    dashboard: frDashboard,
  },
  de: {
    common: deCommon,
    auth: deAuth,
    slides: deSlides,
    dashboard: deDashboard,
  },
  it: {
    common: itCommon,
    auth: itAuth,
    slides: itSlides,
    dashboard: itDashboard,
  },
  ja: {
    common: jaCommon,
    auth: jaAuth,
    slides: jaSlides,
    dashboard: jaDashboard,
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    slides: zhSlides,
    dashboard: zhDashboard,
  },
};

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // Default namespace
    defaultNS: 'common',
    ns: ['common', 'auth', 'slides', 'dashboard'],
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    
    react: {
      useSuspense: false, // Disable suspense for better control
    },
  });

export default i18n;
