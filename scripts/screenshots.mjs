import { mkdir, readdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from 'playwright'
import { LANGUAGE_STORAGE_KEY } from '../src/i18n/constants.js'
import en from '../src/i18n/en.json' with { type: 'json' }
import es from '../src/i18n/es.json' with { type: 'json' }

const baseUrl = process.env.SCREENSHOT_URL ?? 'http://127.0.0.1:4173/samuel-learn/'
const outDir = resolve('docs/screenshots')
const root = baseUrl.replace(/\/$/, '')
const banned = [
  '7 min read',
  'Foundational',
  'Philosophy',
  '© 2025',
  'Node: Parent',
  'State: Pure',
  'Orbit & Drag',
  '12 min',
  'All rights reserved',
  'Built for creative developers',
  'INTERACTIVE 3D SANDBOX',
  'Placeholder lesson text',
]

const pages = [
  { name: 'home', path: '/' },
  { name: 'areas', path: '/areas' },
  { name: 'lesson', path: '/lessons/component' },
]

const iphone = {
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  hasTouch: true,
  isMobile: true,
}

await mkdir(outDir, { recursive: true })
for (const file of await readdir(outDir)) {
  if (file.endsWith('.png')) await rm(resolve(outDir, file))
}

const browser = await chromium.launch()

function assertClean(text, where) {
  for (const phrase of banned) {
    if (text.includes(phrase)) throw new Error(`${where} includes invented copy: ${phrase}`)
  }
}

async function prepare(context, lang) {
  await context.addInitScript(
    ([key, value]) => {
      localStorage.setItem(key, value)
    },
    [LANGUAGE_STORAGE_KEY, lang],
  )
  const page = await context.newPage()
  return page
}

try {
  for (const lang of ['en', 'es']) {
    for (const width of [1280, 390]) {
      const context = await browser.newContext({
        viewport: { width, height: width === 390 ? 844 : 900 },
        locale: lang === 'en' ? 'en-US' : 'es-MX',
        deviceScaleFactor: 1,
        ...(width === 390 ? iphone : {}),
      })
      const page = await prepare(context, lang)
      for (const entry of pages) {
        await page.goto(`${root}${entry.path}`, { waitUntil: 'networkidle' })
        await page.locator('[data-page-fade]').waitFor()
        await page.waitForFunction(() => {
          const fade = document.querySelector('[data-page-fade]')
          return fade && Number(getComputedStyle(fade).opacity) > 0.99
        })
        const htmlLang = await page.locator('html').getAttribute('lang')
        const text = await page.locator('body').innerText()
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        const headingTop = await page.locator('h1').evaluate((node) => node.getBoundingClientRect().top)
        if (htmlLang !== lang) throw new Error(`${entry.name} ${lang} html lang was ${htmlLang}`)
        assertClean(text, `${entry.name} ${lang} ${width}`)
        if (!text.includes('[Placeholder]') && entry.name !== 'lesson') {
          throw new Error(`${entry.name} is missing the placeholder marker`)
        }
        if (overflow > 1) throw new Error(`${entry.name} ${width} overflows by ${overflow}px`)
        if (headingTop < 48) throw new Error(`${entry.name} heading is hidden under the header`)
        await page.screenshot({
          path: resolve(outDir, `${entry.name}-${lang}-${width}.png`),
          fullPage: true,
        })
      }

      const lenis = await page.evaluate(() => document.documentElement.classList.contains('lenis'))
      if (width === 390 && lenis) throw new Error('Lenis should stay off for iPhone-sized touch browsing')
      if (width === 1280 && !lenis) throw new Error('Lenis should be on for desktop wheel scrolling')
      await context.close()
    }
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await prepare(context, 'es')
  await page.goto(`${root}/`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'ES', pressed: true }).waitFor()
  await page.getByRole('button', { name: 'EN' }).click()
  await page.waitForFunction(() => document.documentElement.lang === 'en')
  const stored = await page.evaluate((key) => localStorage.getItem(key), LANGUAGE_STORAGE_KEY)
  await page.getByRole('heading', { level: 1, name: 'Learn by building' }).waitFor()
  if (stored !== 'en') throw new Error(`expected stored language en, got ${stored}`)
  await page.getByRole('link', { name: en.lesson.component.title }).click()
  await page.waitForURL(/\/lessons\/component$/)
  await page.getByRole('heading', { level: 1, name: en.lesson.component.title }).waitFor()
  const items = (await page.getByRole('listitem').allInnerTexts()).map((item) => item.trim())
  if (items.join('\n') !== Object.values(en.lesson.component.sections).join('\n')) {
    throw new Error(`lesson sections changed:\n${items.join('\n')}`)
  }
  const sourceHref = await page.getByRole('link', { name: en.lesson.component.source }).getAttribute('href')
  if (sourceHref !== 'https://www.etymonline.com/word/component') {
    throw new Error(`expected etymonline source, got ${sourceHref}`)
  }
  await context.close()

  const spanish = await browser.newContext({ viewport: { width: 390, height: 844 }, ...iphone })
  const spanishPage = await prepare(spanish, 'es')
  await spanishPage.goto(`${root}/lessons/component`, { waitUntil: 'networkidle' })
  const spanishItems = (await spanishPage.getByRole('listitem').allInnerTexts()).map((item) => item.trim())
  if (spanishItems.join('\n') !== Object.values(es.lesson.component.sections).join('\n')) {
    throw new Error(`Spanish lesson sections changed:\n${spanishItems.join('\n')}`)
  }
  await spanishPage.getByRole('button', { name: 'Menú' }).click()
  await spanishPage.locator('#mobile-nav').getByRole('link', { name: 'Áreas' }).click()
  await spanishPage.waitForURL(/\/areas$/)
  await spanishPage.getByRole('heading', { level: 1, name: 'Áreas de lecciones' }).waitFor()
  const scrolled = await spanishPage.evaluate(async () => {
    window.scrollTo(0, 500)
    await new Promise((resolve) => requestAnimationFrame(resolve))
    return window.scrollY
  })
  if (scrolled < 200) throw new Error(`iPhone-sized page did not scroll (${scrolled})`)
  await spanish.close()

  const reduced = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const reducedPage = await prepare(reduced, 'en')
  await reducedPage.goto(`${root}/`, { waitUntil: 'networkidle' })
  const lenisActive = await reducedPage.evaluate(() => document.documentElement.classList.contains('lenis'))
  const opacity = await reducedPage.locator('[data-page-fade]').evaluate((node) => getComputedStyle(node).opacity)
  if (lenisActive) throw new Error('Lenis should stay off when reduced motion is requested')
  if (opacity !== '1') throw new Error(`expected full opacity under reduced motion, got ${opacity}`)
  await reduced.close()
} finally {
  await browser.close()
}

console.log(`screenshots written to ${outDir}`)
