import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { data, lessonAt } from '../lib/data'
import { useAreas } from '../lib/useSiteData'

function locatedLesson(slug) {
  const lesson = lessonAt(slug)
  return lesson ? { ...lesson, source: data.kind } : null
}

export function Lesson() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const areas = useAreas()
  const [page, setPage] = useState(() => locatedLesson(slug))

  useEffect(() => {
    let active = true
    data.getLesson(slug).then(
      (result) => {
        if (active) setPage(result)
      },
      () => {
        if (active) setPage(null)
      },
    )
    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    document.title = page ? t(page.titleKey) : t('lessons.missing')
  }, [t, page, i18n.language])

  if (!page) {
    return (
      <main id="content" className="page">
        <header className="page-intro shell">
          <p>{t('lessons.missing')}</p>
          <p className="lesson-nav">
            <Link to="/lessons">{t('lessons.back')}</Link>
          </p>
        </header>
      </main>
    )
  }

  const area = areas.find((item) => item.id === page.areaId)

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
            {area ? (
              <Link to={`/areas#${area.id}`}>{t(area.titleKey)}</Link>
            ) : (
              <Link to="/lessons">{t('lessons.index.title')}</Link>
            )}
          </p>
          <p className="side-overview">{t('lesson.overview')}</p>
          <Link className="side-lesson" to={page.path} aria-current="page">
            <span className="dot" aria-hidden="true" />
            {t(page.titleKey)}
          </Link>
        </aside>
        <article>
          <p className="breadcrumb">
            <Link to="/lessons">{t('lessons.back')}</Link>
            {area ? (
              <>
                <span aria-hidden="true">/</span>
                <Link to="/areas">{t('nav.areas')}</Link>
                <span aria-hidden="true">/</span>
                <Link to={`/areas#${area.id}`}>{t(area.titleKey)}</Link>
              </>
            ) : null}
          </p>
          <h1>{t(page.titleKey)}</h1>
          <ol className="lesson-sections">
            {page.sectionKeys.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
          <p className="lesson-source">
            {page.sourceUrl ? (
              <a href={page.sourceUrl} rel="noreferrer">
                {t(page.sourceKey)}
              </a>
            ) : (
              t(page.sourceKey)
            )}
          </p>
          {page.previousSlug || page.nextSlug ? (
            <nav className="lesson-nav" aria-label={t('lessons.index.title')}>
              {page.previousSlug ? (
                <Link to={`/lessons/${page.previousSlug}`}>
                  {t('lessons.previous')}: {t(page.previousTitleKey)}
                </Link>
              ) : null}
              {page.nextSlug ? (
                <Link to={`/lessons/${page.nextSlug}`}>
                  {t('lessons.next')}: {t(page.nextTitleKey)}
                </Link>
              ) : null}
            </nav>
          ) : null}
        </article>
      </div>
    </main>
  )
}
