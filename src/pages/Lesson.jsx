import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { data } from '../lib/data'

const fallback = {
  titleKey: 'lesson.component.title',
  sectionKeys: [
    'lesson.component.sections.root',
    'lesson.component.sections.entered',
    'lesson.component.sections.use1560s',
    'lesson.component.sections.noun1640s',
    'lesson.component.sections.adjective1660s',
    'lesson.component.sections.mechanical1896',
    'lesson.component.sections.today',
  ],
  sourceKey: 'lesson.component.source',
  sourceUrl: 'https://www.etymonline.com/word/component',
  source: data.kind,
}

export function Lesson() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(fallback)

  useEffect(() => {
    let active = true
    data.getPage('lesson-component-etymology').then(
      (result) => {
        if (active) setPage(result)
      },
      () => {
        if (active) setPage(fallback)
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
    <>
      <main className="lesson" data-source={page.source}>
        <article>
          <h1>{t(page.titleKey)}</h1>
          <ol>
            {page.sectionKeys.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
          <p className="lesson-source">
            <a href={page.sourceUrl}>{t(page.sourceKey)}</a>
          </p>
        </article>
      </main>
      <div className="scroll-room" aria-hidden="true" />
    </>
  )
}
