import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LOCALE } from 'constants'
import en from 'translations/en.json'

i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  // React already escapes rendered values.
  interpolation: { escapeValue: false },
})

export default i18n
