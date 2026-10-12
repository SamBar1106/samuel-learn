import { useTranslation } from 'react-i18next'
import { LANGUAGES, setLanguage } from '../i18n'

export function LanguageSwitch() {
  const { i18n, t } = useTranslation()
  const current = i18n.language?.startsWith('en') ? 'en' : 'es'

  return (
    <div className="language-switch" role="group" aria-label={`${t('language.es')} ${t('language.en')}`}>
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={current === code}
          onClick={() => {
            void setLanguage(code)
          }}
        >
          {t(`language.${code}`)}
        </button>
      ))}
    </div>
  )
}
