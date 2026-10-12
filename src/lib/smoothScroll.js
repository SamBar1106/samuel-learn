import { useEffect } from 'react'
import gsap from 'gsap'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export function useSmoothScroll() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis

    const tick = (time) => {
      lenis?.raf(time * 1000)
    }

    const stop = () => {
      gsap.ticker.remove(tick)
      lenis?.destroy()
      lenis = undefined
    }

    const start = () => {
      if (media.matches || lenis) return
      lenis = new Lenis({ autoRaf: false })
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    }

    const sync = () => {
      if (media.matches) stop()
      else start()
    }

    sync()
    media.addEventListener('change', sync)
    return () => {
      media.removeEventListener('change', sync)
      stop()
    }
  }, [])
}
