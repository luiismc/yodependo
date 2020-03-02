import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from 'src/locales/en.json';
import ar from 'src/locales/ar.json';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: 'en',

  resources: {
    en,
    ar,
  },

  // have a common namespace used around the full app
  ns: ['common'],
  defaultNS: 'common',

  debug: false,

  // cache: {
  //   enabled: true
  // },

  interpolation: {
    escapeValue: false, // not needed for react as it does escape per default to prevent xss!
  },
});

export default i18n;
