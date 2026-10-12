import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { data } from '../lib/data'

export function Home() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState({
    textKey: 'page.placeholder',
    source: data.kind,
  })

  useEffect(() => {
    let active = true
    data.getPage('home').then(
      (result) => {
        if (active) setPage(result)
      },
      () => {
        if (active) setPage({ textKey: 'page.placeholder', source: data.kind })
      },
    )
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    document.title = t(page.textKey)
  }, [t, page.textKey, i18n.language])

  return (
    <>
      <main data-source={page.source}>
        <h1>{t(page.textKey)}</h1>
      </main>
      <div className="scroll-room" aria-hidden="true" />
    </>
  )
}
