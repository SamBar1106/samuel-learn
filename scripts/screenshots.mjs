import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from 'playwright'
import { LANGUAGE_STORAGE_KEY } from '../src/i18n/constants.js'

const baseUrl = process.env.SCREENSHOT_URL ?? 'http://127.0.0.1:4173/samuel-learn/'
const outDir = resolve('docs/screenshots')

const cases = [
  { lang: 'es', width: 1280, height: 800 },
  { lang: 'en', width: 1280, height: 800 },
  { lang: 'es', width: 390, height: 844 },
  { lang: 'en', width: 390, height: 844 },
]

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()

try {
  for (const { lang, width, height } of cases) {
    const context = await browser.newContext({
      viewport: { width, height },
      locale: lang === 'en' ? 'en-US' : 'es-MX',
      deviceScaleFactor: 1,
    })
    await context.addInitScript(
      ([key, value]) => {
        localStorage.setItem(key, value)
      },
      [LANGUAGE_STORAGE_KEY, lang],
    )
    const page = await context.newPage()
    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    await page.locator('[data-page-fade]').waitFor()
    await page.waitForFunction(() => {
      const fade = document.querySelector('[data-page-fade]')
      return fade && Number(getComputedStyle(fade).opacity) > 0.99
    })
    const htmlLang = await page.locator('html').getAttribute('lang')
    const heading = (await page.getByRole('heading').innerText()).trim()
    const source = await page.locator('main').getAttribute('data-source')
    const visible = (await page.locator('body').innerText())
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .sort()
    if (htmlLang !== lang) throw new Error(`expected html lang ${lang}, got ${htmlLang}`)
    if (heading !== 'PLACEHOLDER') throw new Error(`expected PLACEHOLDER, got ${heading}`)
    if (source !== 'local') throw new Error(`expected local data source, got ${source}`)
    if (visible.join('|') !== ['EN', 'ES', 'PLACEHOLDER'].join('|')) {
      throw new Error(`unexpected visible text: ${visible.join(' | ')}`)
    }
    await page.screenshot({ path: resolve(outDir, `${lang}-${width}.png`) })
    await context.close()
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  await context.addInitScript(
    ([key]) => {
      localStorage.setItem(key, 'es')
    },
    [LANGUAGE_STORAGE_KEY],
  )
  const page = await context.newPage()
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'ES', pressed: true }).waitFor()
  await page.getByRole('button', { name: 'EN' }).click()
  await page.waitForFunction(() => document.documentElement.lang === 'en')
  const stored = await page.evaluate((key) => localStorage.getItem(key), LANGUAGE_STORAGE_KEY)
  const heading = (await page.getByRole('heading').innerText()).trim()
  if (stored !== 'en') throw new Error(`expected stored language en, got ${stored}`)
  if (heading !== 'PLACEHOLDER') throw new Error(`language switch changed the page text to ${heading}`)
  await context.close()

  const reduced = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce',
  })
  await reduced.addInitScript(
    ([key]) => {
      localStorage.setItem(key, 'es')
    },
    [LANGUAGE_STORAGE_KEY],
  )
  const reducedPage = await reduced.newPage()
  await reducedPage.goto(baseUrl, { waitUntil: 'networkidle' })
  await reducedPage.locator('[data-page-fade]').waitFor()
  const lenisActive = await reducedPage.evaluate(() => document.documentElement.classList.contains('lenis'))
  const opacity = await reducedPage.locator('[data-page-fade]').evaluate((node) => getComputedStyle(node).opacity)
  if (lenisActive) throw new Error('Lenis should stay off when reduced motion is requested')
  if (opacity !== '1') throw new Error(`expected full opacity under reduced motion, got ${opacity}`)
  await reduced.close()
} finally {
  await browser.close()
}

console.log(`screenshots written to ${outDir}`)
