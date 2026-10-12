import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LANGUAGE_STORAGE_KEY, LANGUAGES, resolveLanguage } from './constants'

export { LANGUAGES } from './constants'
import en from './en.json'
import es from './es.json'

export function detectLanguage() {
  let stored = null
  try {
    stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  } catch {
    stored = null
  }
  return resolveLanguage({
    stored,
    browserLanguage: navigator.language,
  })
}

export function applyDocumentLanguage(code) {
  const lang = LANGUAGES.includes(code) ? code : 'es'
  document.documentElement.lang = lang
  return lang
}

export function rememberLanguage(code) {
  if (!LANGUAGES.includes(code)) return
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
  } catch {
    // Ignore private-mode storage failures. The html lang attribute still updates.
  }
}

export function setLanguage(code) {
  if (!LANGUAGES.includes(code)) return Promise.resolve()
  rememberLanguage(code)
  applyDocumentLanguage(code)
  return i18n.changeLanguage(code)
}

const initial = detectLanguage()
applyDocumentLanguage(initial)

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: initial,
  fallbackLng: false,
  supportedLngs: LANGUAGES,
  interpolation: { escapeValue: false },
  initImmediate: false,
  react: { useSuspense: false },
})

i18n.on('languageChanged', (code) => {
  const lang = LANGUAGES.find((item) => code === item || code.startsWith(`${item}-`))
  if (lang) applyDocumentLanguage(lang)
})

export default i18n
