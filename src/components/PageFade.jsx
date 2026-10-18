import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Route, Routes, useLocation } from 'react-router-dom'
import { usePrefersReducedMotion } from '../lib/reducedMotion'
import { Home } from '../pages/Home'
import { Lesson } from '../pages/Lesson'
import { LessonsIndex } from '../pages/LessonsIndex'
import { LoomIndex } from '../pages/LoomIndex'

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
          <Route path="/lessons" element={<LessonsIndex />} />
          <Route path="/lessons/:slug" element={<Lesson />} />
          <Route path="/loom" element={<LoomIndex />} />
          <Route path="/loom/:slug" element={<Lesson course="loom" />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}
