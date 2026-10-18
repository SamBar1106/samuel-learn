import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { data, loomIndexMeta, loomModulesInOrder } from '../lib/data'

export function LoomIndex() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(() => ({ ...loomIndexMeta(), source: data.kind }))
  const [modules, setModules] = useState(() =>
    loomModulesInOrder().map((item) => ({ ...item, source: data.kind })),
  )

  useEffect(() => {
    let active = true
    Promise.all([data.getLoomIndex(), data.listLoomModules()]).then(
      ([result, items]) => {
        if (!active) return
        setPage(result)
        setModules(items)
      },
      () => {
        if (active) setPage({ ...loomIndexMeta(), source: data.kind })
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
      <main className="lesson-index loom-index" data-source={page.source}>
        <article>
          <h1>{t(page.titleKey)}</h1>
          <p className="loom-intro">{t(page.introKey)}</p>
          <ol start={0}>
            {modules.map((module) => {
              const available = module.status === 'available' && Boolean(module.slug)
              return (
                <li key={module.id} className="loom-module" data-status={available ? 'available' : 'soon'}>
                  <div className="loom-module-head">
                    {available ? (
                      <Link to={`/loom/${module.slug}`}>{t(module.titleKey)}</Link>
                    ) : (
                      <span className="loom-module-title">{t(module.titleKey)}</span>
                    )}
                    <span className="loom-status">{t(available ? page.availableKey : page.soonKey)}</span>
                  </div>
                  <p className="loom-module-note">{t(available ? module.summaryKey : page.soonBodyKey)}</p>
                </li>
              )
            })}
          </ol>
        </article>
      </main>
      <div className="scroll-room" aria-hidden="true" />
    </>
  )
}
