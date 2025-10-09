import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      welcome: 'Welcome',
      theme: 'Theme',
      language: 'Language',
    },
  },
  zh: {
    translation: {
      welcome: '欢迎',
      theme: '主题',
      language: '语言',
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export { i18n }
