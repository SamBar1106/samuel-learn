import { BrowserRouter } from 'react-router-dom'
import { PageFade } from './components/PageFade'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { useSmoothScroll } from './lib/smoothScroll'
import { useLessonPage } from './lib/useSiteData'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

function Frame() {
  const lesson = useLessonPage()
  return (
    <div className="site">
      <SiteHeader lessonPath={lesson.path} />
      <PageFade />
      <SiteFooter />
    </div>
  )
}

export default function App() {
  useSmoothScroll()

  return (
    <BrowserRouter basename={basename}>
      <Frame />
    </BrowserRouter>
  )
}
