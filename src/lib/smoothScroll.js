import { useEffect } from 'react'
import gsap from 'gsap'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

let activeLenis

export function scrollToTop() {
  if (activeLenis) activeLenis.scrollTo(0, { immediate: true })
  else window.scrollTo(0, 0)
}

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
      if (activeLenis === lenis) activeLenis = undefined
      lenis = undefined
    }

    const start = () => {
      const finePointer = window.matchMedia('(pointer: fine)').matches
      // Touch devices, including iPhone Safari, keep native scrolling.
      // Lenis still smooths wheel input on a fine pointer.
      if (media.matches || !finePointer || lenis) return
      lenis = new Lenis({ autoRaf: false, syncTouch: false, smoothWheel: true })
      activeLenis = lenis
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
