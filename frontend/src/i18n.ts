import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import viCommon from './locales/vi/common.json';

const resources = {
  en: {
    translation: enCommon,
  },
  vi: {
    translation: viCommon,
  },
} as const;

const getDefaultLanguage = () => {
  if (typeof window !== 'undefined') {
    const storedLang = localStorage.getItem('app_language');
    if (storedLang) {
      return storedLang;
    }

    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.split('-')[0];
    }
  }

  return 'vi';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDefaultLanguage(),
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export default i18n;

