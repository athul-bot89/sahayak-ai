import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import mlTranslations from './locales/ml.json';
import mrTranslations from './locales/mr.json';
import taTranslations from './locales/ta.json';
import teTranslations from './locales/te.json';
import knTranslations from './locales/kn.json';
import guTranslations from './locales/gu.json';
import bnTranslations from './locales/bn.json';

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  ml: { translation: mlTranslations },
  mr: { translation: mrTranslations },
  ta: { translation: taTranslations },
  te: { translation: teTranslations },
  kn: { translation: knTranslations },
  gu: { translation: guTranslations },
  bn: { translation: bnTranslations }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('preferredLanguage') || 'en',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;