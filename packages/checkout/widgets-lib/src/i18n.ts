/* eslint-disable @typescript-eslint/naming-convention */
// eslint-disable-next-line import/no-named-as-default
import i18n, { type Resource } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import jaTranslations from './locales/ja.json';
import koTranslations from './locales/ko.json';
import zhTranslations from './locales/zh.json';

const resources: Resource = {
  en: {
    translation: enTranslations,
  },
  ja: {
    translation: jaTranslations,
  },
  ko: {
    translation: koTranslations,
  },
  zh: {
    translation: zhTranslations,
  },
};

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    resources,
    // lng: 'en', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng optio
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
