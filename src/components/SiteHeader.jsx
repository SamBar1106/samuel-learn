import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { LanguageSwitch } from './LanguageSwitch'

const links = [
  { to: '/', key: 'nav.lessons' },
  { to: '/areas', key: 'nav.areas' },
  { to: '/about', key: 'nav.about' },
]

function isCurrent(pathname, to) {
  if (to === '/') return pathname === '/' || pathname === '/lessons' || pathname.startsWith('/lessons/')
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function SiteHeader({ lessonPath }) {
  const { t } = useTranslation()
  const location = useLocation()
  const [menuPath, setMenuPath] = useState(null)
  const open = menuPath === location.pathname

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuPath(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="site-header">
      <a className="skip-link" href="#content">
        {t('nav.skip')}
      </a>
      <div className="shell header-bar">
        <Link className="brand" to="/">
          <span className="dot" aria-hidden="true" />
          samuel-learn
        </Link>
        <nav className="header-nav" aria-label={t('nav.primary')}>
          {links.map((link) => {
            const current = isCurrent(location.pathname, link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={current ? 'nav-link active' : 'nav-link'}
                aria-current={current ? 'page' : undefined}
              >
                {t(link.key)}
              </Link>
            )
          })}
        </nav>
        <div className="header-tools">
          <LanguageSwitch />
          <Link className="button button-green header-cta" to={lessonPath}>
            {t('nav.start')}
            <span aria-hidden="true">→</span>
          </Link>
          <button
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t('nav.close') : t('nav.menu')}
            onClick={() => setMenuPath(open ? null : location.pathname)}
          >
            <span className={open ? 'menu-lines open' : 'menu-lines'} aria-hidden="true" />
          </button>
        </div>
      </div>
      {open ? (
        <div id="mobile-nav" className="mobile-nav shell">
          {links.map((link) => {
            const current = isCurrent(location.pathname, link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={current ? 'nav-link active' : 'nav-link'}
                aria-current={current ? 'page' : undefined}
              >
                {t(link.key)}
              </Link>
            )
          })}
          <Link className="button button-green" to={lessonPath}>
            {t('nav.start')}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : null}
    </header>
  )
}
