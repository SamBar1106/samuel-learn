import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AreaIcon } from './AreaIcon'

export function AreaCard({ area, lesson, variant = 'home' }) {
  const { t } = useTranslation()
  const title = t(area.titleKey)
  const summary = t(area.summaryKey)
  const body = (
    <>
      <div className="area-card-top">
        <span className="icon-tile">
          <AreaIcon id={area.id} />
        </span>
        <span className="area-number">{area.number}</span>
      </div>
      <h3>{title}</h3>
      <p className="placeholder">{summary}</p>
      {variant === 'catalog' && lesson ? (
        <Link className="lesson-chip" to={lesson.path}>
          {t(lesson.titleKey)}
        </Link>
      ) : null}
      {variant === 'catalog' && area.topics?.length ? (
        <ul className="topic-list">
          {area.topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      ) : null}
    </>
  )

  if (variant === 'home') {
    return (
      <Link className="area-card" to={`/areas#${area.id}`}>
        {body}
      </Link>
    )
  }

  return (
    <article id={area.id} className="area-card">
      {body}
    </article>
  )
}
