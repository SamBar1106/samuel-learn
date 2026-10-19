import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AreaCard } from '../components/AreaCard'
import { useAreas, useLessonPage } from '../lib/useSiteData'

export function Home() {
  const { t, i18n } = useTranslation()
  const lesson = useLessonPage()
  const areas = useAreas()

  useEffect(() => {
    document.title = `${t('home.titleLead')} ${t('home.titleAccent')}`
  }, [t, i18n.language])

  return (
    <main id="content" data-source={lesson.source}>
      <section className="hero shell">
        <p className="eyebrow">
          <span className="dot" aria-hidden="true" />
          {t('home.eyebrow')}
        </p>
        <h1>
          {t('home.titleLead')} <span className="accent">{t('home.titleAccent')}</span>
        </h1>
        <p className="placeholder hero-copy">{t('page.placeholder')}</p>
        <div className="hero-actions">
          <Link className="button button-green mobile-only" to={lesson.path}>
            {t('nav.start')}
            <span aria-hidden="true">→</span>
          </Link>
          <Link className="button button-violet desktop-only" to={lesson.path}>
            {t('home.startLesson')}
            <span aria-hidden="true">→</span>
          </Link>
          <Link className="button button-ghost" to="/areas">
            <span className="grid-icon" aria-hidden="true" />
            {t('home.explore', { count: areas.length })}
          </Link>
          <Link className="button button-ghost" to="/lessons">
            {t('lessons.back')}
          </Link>
          <Link className="button button-ghost" to="/loom">
            {t('loom.index.title')}
          </Link>
        </div>
      </section>

      <section className="band shell">
        <div className="section-row">
          <p className="section-label">
            <span className="dot" aria-hidden="true" />
            {t('home.startHere')}
          </p>
          <p className="section-meta">{t('home.lessonNumber')}</p>
        </div>
        <article className="feature-card">
          <div>
            <p className="kicker">
              <span className="dot" aria-hidden="true" />
              {t('home.firstLesson')}
            </p>
            <h2>
              <Link to={lesson.path}>{t(lesson.titleKey)}</Link>
            </h2>
            <p className="meta">{t('home.bilingual')}</p>
          </div>
          <Link className="button button-ghost" to={lesson.path}>
            {t('home.readLesson')}
            <span aria-hidden="true">→</span>
          </Link>
        </article>
      </section>

      <section className="band shell">
        <div className="section-row">
          <p className="section-label">
            <span className="dot" aria-hidden="true" />
            {t('home.curriculum')}
          </p>
          <h2 className="section-title">{t('home.lessonAreas')}</h2>
          <p className="section-meta">{t('home.areaCount', { count: areas.length })}</p>
        </div>
        <div className="area-grid">
          {areas.map((area) => (
            <AreaCard key={area.id} area={area} />
          ))}
        </div>
      </section>
    </main>
  )
}
