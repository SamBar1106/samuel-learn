import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useLessonPage } from '../lib/useSiteData'

export function Lesson() {
  const { t, i18n } = useTranslation()
  const page = useLessonPage()

  useEffect(() => {
    document.title = t(page.titleKey)
  }, [t, page.titleKey, i18n.language])

  return (
    <main id="content" className="lesson-page" data-source={page.source}>
      <div className="lesson-layout shell">
        <aside className="lesson-side">
          <p className="section-label">
            <span className="dot" aria-hidden="true" />
            {t('home.curriculum')}
          </p>
          <p className="side-kicker">{t('lesson.area')}</p>
          <p className="side-area">
            <Link to="/areas#react">{t('lesson.reactName')}</Link>
          </p>
          <p className="side-overview">{t('lesson.overview')}</p>
          <Link className="side-lesson" to={page.path} aria-current="page">
            <span className="dot" aria-hidden="true" />
            {t(page.titleKey)}
          </Link>
        </aside>
        <article>
          <p className="breadcrumb">
            <Link to="/areas">{t('nav.areas')}</Link>
            <span aria-hidden="true">/</span>
            <Link to="/areas#react">{t('lesson.reactName')}</Link>
          </p>
          <h1>{t(page.titleKey)}</h1>
          <ol className="lesson-sections">
            {page.sectionKeys.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
          <p className="lesson-source">
            <a href={page.sourceUrl} rel="noreferrer">
              {t(page.sourceKey)}
            </a>
          </p>
        </article>
      </div>
    </main>
  )
}
