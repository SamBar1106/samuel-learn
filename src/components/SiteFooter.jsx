import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export function SiteFooter() {
  const { t } = useTranslation()

  return (
    <footer className="site-footer">
      <div className="shell footer-bar">
        <Link className="brand" to="/">
          <span className="dot" aria-hidden="true" />
          samuel-learn
        </Link>
        <nav className="footer-nav" aria-label={t('nav.footer')}>
          <Link to="/">{t('nav.lessons')}</Link>
          <Link to="/areas">{t('nav.areas')}</Link>
          <Link to="/about">{t('nav.about')}</Link>
          <a href="https://github.com/SamBar1106/samuel-learn" rel="noreferrer">
            {t('nav.github')}
          </a>
        </nav>
      </div>
    </footer>
  )
}
