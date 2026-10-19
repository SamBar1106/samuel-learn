import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
    <main id="content" className="page lesson-index loom-index" data-source={page.source}>
      <header className="page-intro shell">
        <h1>{t(page.titleKey)}</h1>
        <p className="loom-intro">{t(page.introKey)}</p>
      </header>
      <ol className="lesson-index-list shell" start={0}>
        {modules.map((module) => (
          <li key={module.id} className="loom-module" data-status="soon">
            <span className="loom-module-title">{t(module.titleKey)}</span>
            <span className="loom-status">{t(page.soonKey)}</span>
          </li>
        ))}
      </ol>
    </main>
  )
}
