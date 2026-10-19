import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AreaCard } from '../components/AreaCard'
import { useAreas, useLessonPage } from '../lib/useSiteData'

export function Areas() {
  const { t, i18n } = useTranslation()
  const areas = useAreas()
  const lesson = useLessonPage()

  useEffect(() => {
    document.title = t('areas.title')
  }, [t, i18n.language])

  return (
    <main id="content" className="page" data-source={areas[0]?.source}>
      <header className="page-intro shell">
        <p className="eyebrow">
          <span className="dot" aria-hidden="true" />
          {t('areas.eyebrow')}
        </p>
        <h1>{t('areas.title')}</h1>
        <p className="placeholder">{t('page.placeholder')}</p>
      </header>
      <div className="area-grid area-grid-catalog shell">
        {areas.map((area) => (
          <AreaCard
            key={area.id}
            area={area}
            variant="catalog"
            lesson={area.lessonId === lesson.id ? lesson : null}
          />
        ))}
      </div>
    </main>
  )
}
