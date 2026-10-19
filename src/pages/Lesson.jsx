import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { data, lessonAt } from '../lib/data'

function locatedLesson(slug) {
  const lesson = lessonAt(slug)
  return lesson ? { ...lesson, source: data.kind } : null
}

export function Lesson() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
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
      <>
        <main className="lesson">
          <p>{t('lessons.missing')}</p>
          <p className="lesson-nav">
            <Link to="/lessons">{t('lessons.back')}</Link>
          </p>
        </main>
        <div className="scroll-room" aria-hidden="true" />
      </>
    )
  }

  return (
    <>
      <main className="lesson" data-source={page.source}>
        <article>
          <p className="lesson-nav">
            <Link to="/lessons">{t('lessons.back')}</Link>
          </p>
          <h1>{t(page.titleKey)}</h1>
          <ol>
            {page.sectionKeys.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
          <p className="lesson-source">
            {page.sourceUrl ? <a href={page.sourceUrl}>{t(page.sourceKey)}</a> : t(page.sourceKey)}
          </p>
          {page.previousSlug || page.nextSlug ? (
            <nav className="lesson-nav lesson-nav-end" aria-label={t('lessons.index.title')}>
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
      </main>
      <div className="scroll-room" aria-hidden="true" />
    </>
  )
}
