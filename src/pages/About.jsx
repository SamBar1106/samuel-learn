import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { data } from '../lib/data'

export function About() {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    document.title = t('about.title')
  }, [t, i18n.language])

  return (
    <main id="content" className="page" data-source={data.kind}>
      <header className="page-intro shell">
        <h1>{t('about.title')}</h1>
        <p className="placeholder">{t('page.placeholder')}</p>
      </header>
    </main>
  )
}
