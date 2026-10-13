import { useTranslation } from 'react-i18next'
import { LANGUAGES, setLanguage } from '../i18n'

export function LanguageSwitch() {
  const { i18n, t } = useTranslation()
  const current = i18n.language?.startsWith('en') ? 'en' : 'es'

  return (
    <div className="language-switch" role="group" aria-label={`${t('language.en')} ${t('language.es')}`}>
      {LANGUAGES.map((code, index) => (
        <span key={code} className="language-option">
          {index > 0 ? <span className="language-divider" aria-hidden="true" /> : null}
          <button
            type="button"
            lang={code}
            aria-pressed={current === code}
            onClick={() => {
              void setLanguage(code)
            }}
          >
            {current === code ? <span className="dot" aria-hidden="true" /> : null}
            {t(`language.${code}`)}
          </button>
        </span>
      ))}
    </div>
  )
}
