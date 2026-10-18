import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { data, lessonAt, loomLessonAt } from '../lib/data'

const courses = {
  vocabulary: {
    locate: lessonAt,
    load: (slug) => data.getLesson(slug),
    indexPath: '/lessons',
    backKey: 'lessons.back',
    navLabelKey: 'lessons.index.title',
    pathFor: (slug) => `/lessons/${slug}`,
  },
  loom: {
    locate: loomLessonAt,
    load: (slug) => data.getLoomLesson(slug),
    indexPath: '/loom',
    backKey: 'loom.index.title',
    navLabelKey: 'loom.index.title',
    pathFor: (slug) => `/loom/${slug}`,
  },
}

function withSource(lesson) {
  return lesson ? { ...lesson, source: data.kind } : null
}

function LessonBody({ page, t }) {
  if (Array.isArray(page.sections) && page.sections.length > 0) {
    return page.sections.map((section) => (
      <section key={section.id}>
        <h2>{t(section.headingKey)}</h2>
        {section.bodyKey ? <p>{t(section.bodyKey)}</p> : null}
        {(section.parts ?? []).map((part) => (
          <div key={part.id}>
            <h3>{t(part.headingKey)}</h3>
            <p>{t(part.bodyKey)}</p>
          </div>
        ))}
        {Array.isArray(section.keywordKeys) ? (
          <ul>
            {section.keywordKeys.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        ) : null}
      </section>
    ))
  }

  return (
    <ol>
      {page.sectionKeys.map((key) => (
        <li key={key}>{t(key)}</li>
      ))}
    </ol>
  )
}

export function Lesson({ course = 'vocabulary' }) {
  const config = courses[course]
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(() => withSource(config ? config.locate(slug) : null))

  useEffect(() => {
    if (!config) return undefined
    let active = true
    config.load(slug).then(
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
  }, [config, slug])

  useEffect(() => {
    document.title = page ? t(page.titleKey) : t('lessons.missing')
  }, [t, page, i18n.language])

  if (!config) throw new Error(`Unknown course: ${course}`)

  if (!page) {
    return (
      <>
        <main className="lesson">
          <p>{t('lessons.missing')}</p>
          <p className="lesson-nav">
            <Link to={config.indexPath}>{t(config.backKey)}</Link>
          </p>
        </main>
        <div className="scroll-room" aria-hidden="true" />
      </>
    )
  }

  return (
    <>
      <main className="lesson" data-source={page.source} data-course={course}>
        <article>
          <p className="lesson-nav">
            <Link to={config.indexPath}>{t(config.backKey)}</Link>
          </p>
          <h1>{t(page.titleKey)}</h1>
          {page.summaryKey ? <p className="loom-summary">{t(page.summaryKey)}</p> : null}
          <LessonBody page={page} t={t} />
          {page.sourceKey ? (
            <p className="lesson-source">
              {page.sourceUrl ? <a href={page.sourceUrl}>{t(page.sourceKey)}</a> : t(page.sourceKey)}
            </p>
          ) : null}
          {page.previousSlug || page.nextSlug ? (
            <nav className="lesson-nav lesson-nav-end" aria-label={t(config.navLabelKey)}>
              {page.previousSlug ? (
                <Link to={config.pathFor(page.previousSlug)}>
                  {t('lessons.previous')}: {t(page.previousTitleKey)}
                </Link>
              ) : null}
              {page.nextSlug ? (
                <Link to={config.pathFor(page.nextSlug)}>
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
