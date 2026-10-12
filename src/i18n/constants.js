export const LANGUAGE_STORAGE_KEY = 'samuel-learn-lang'

export const LANGUAGES = ['es', 'en']

export function resolveLanguage({ stored, browserLanguage } = {}) {
  if (LANGUAGES.includes(stored)) return stored
  const browser = (browserLanguage || '').toLowerCase()
  if (browser.startsWith('en')) return 'en'
  if (browser.startsWith('es')) return 'es'
  return 'es'
}
