import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { usePrefersReducedMotion } from '../lib/reducedMotion'
import { scrollToTop } from '../lib/smoothScroll'
import { About } from '../pages/About'
import { Areas } from '../pages/Areas'
import { Home } from '../pages/Home'
import { Lesson } from '../pages/Lesson'

function ScrollReset() {
  const location = useLocation()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      if (target) {
        target.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })
        return
      }
    }
    scrollToTop()
  }, [location.pathname, location.hash, reduced])

  return null
}

function StripSlash() {
  const location = useLocation()
  if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
    return (
      <Navigate
        to={`${location.pathname.replace(/\/+$/, '')}${location.search}${location.hash}`}
        replace
      />
    )
  }
  return null
}

export function PageFade() {
  const reduced = usePrefersReducedMotion()
  const location = useLocation()
  const { i18n } = useTranslation()

  return (
    <>
      <ScrollReset />
      <StripSlash />
      <AnimatePresence mode="wait">
        <motion.div
          key={`${location.pathname}:${i18n.language}`}
          className="page-fade"
          data-page-fade
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.4, ease: 'easeOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/areas" element={<Areas />} />
            <Route path="/about" element={<About />} />
            <Route path="/lessons/component" element={<Lesson />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
