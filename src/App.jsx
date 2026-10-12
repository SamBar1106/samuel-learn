import { BrowserRouter } from 'react-router-dom'
import { LanguageSwitch } from './components/LanguageSwitch'
import { PageFade } from './components/PageFade'
import { useSmoothScroll } from './lib/smoothScroll'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  useSmoothScroll()

  return (
    <BrowserRouter basename={basename}>
      <LanguageSwitch />
      <PageFade />
    </BrowserRouter>
  )
}
