import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Route, Routes, useLocation } from 'react-router-dom'
import { usePrefersReducedMotion } from '../lib/reducedMotion'
import { Home } from '../pages/Home'
import { Lesson } from '../pages/Lesson'

export function PageFade() {
  const reduced = usePrefersReducedMotion()
  const location = useLocation()
  const { i18n } = useTranslation()

  return (
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
          <Route path="/lessons/component" element={<Lesson />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}
