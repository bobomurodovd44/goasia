import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import common from '../locales/en/common.json';

const resources = {
  en: {
    common
  }
};

// eslint-disable-next-line import/no-named-as-default-member
i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    }
  });

export default i18next;
