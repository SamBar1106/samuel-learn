import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { data, lessonsInOrder } from '../lib/data'

export function LessonsIndex() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState({
    titleKey: 'lessons.index.title',
    source: data.kind,
  })
  const [lessons, setLessons] = useState(() =>
    lessonsInOrder().map((item) => ({ ...item, source: data.kind })),
  )

  useEffect(() => {
    let active = true
    Promise.all([data.getPage('lessons'), data.listLessons()]).then(
      ([result, items]) => {
        if (!active) return
        setPage(result)
        setLessons(items)
      },
      () => {
        if (active) setPage({ titleKey: 'lessons.index.title', source: data.kind })
      },
    )
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    document.title = t(page.titleKey)
  }, [t, page.titleKey, i18n.language])

  return (
    <main id="content" className="page lesson-index" data-source={page.source}>
      <header className="page-intro shell">
        <h1>{t(page.titleKey)}</h1>
      </header>
      <ol className="lesson-index-list shell">
        {lessons.map((lesson) => (
          <li key={lesson.slug}>
            <Link to={`/lessons/${lesson.slug}`}>{t(lesson.titleKey)}</Link>
          </li>
        ))}
      </ol>
    </main>
  )
}
