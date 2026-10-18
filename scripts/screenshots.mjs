import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from 'playwright'
import { LANGUAGE_STORAGE_KEY } from '../src/i18n/constants.js'
import en from '../src/i18n/en.json' with { type: 'json' }
import es from '../src/i18n/es.json' with { type: 'json' }

const baseUrl = process.env.SCREENSHOT_URL ?? 'http://127.0.0.1:4173/samuel-learn/'
const outDir = resolve('docs/screenshots')
const catalogs = { en, es }
const lessonUrl = `${baseUrl.replace(/\/$/, '')}/lessons/component`

const cases = [
  { lang: 'es', width: 1280, height: 800 },
  { lang: 'en', width: 1280, height: 800 },
  { lang: 'es', width: 390, height: 844 },
  { lang: 'en', width: 390, height: 844 },
]

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  if (overflow > 1) throw new Error(`${label} overflows by ${overflow}px`)
}

async function shotPage(browser, root, shot) {
  const width = shot.width ?? 1280
  const height = shot.height ?? 800
  const context = await browser.newContext({
    viewport: { width, height },
    locale: shot.lang === 'en' ? 'en-US' : 'es-MX',
    deviceScaleFactor: 1,
  })
  await context.addInitScript(
    ([key, value]) => {
      localStorage.setItem(key, value)
    },
    [LANGUAGE_STORAGE_KEY, shot.lang],
  )
  const page = await context.newPage()
  await page.goto(`${root.replace(/\/$/, '')}/${shot.path}`, { waitUntil: 'networkidle' })
  await page.locator('[data-page-fade]').waitFor()
  await page.waitForFunction(() => {
    const fade = document.querySelector('[data-page-fade]')
    return fade && Number(getComputedStyle(fade).opacity) > 0.99
  })
  const heading = (await page.getByRole('heading', { level: 1 }).innerText()).trim()
  const htmlLang = await page.locator('html').getAttribute('lang')
  if (heading !== shot.heading) throw new Error(`expected ${shot.heading}, got ${heading}`)
  if (htmlLang !== shot.lang) throw new Error(`expected html lang ${shot.lang}, got ${htmlLang}`)
  if (shot.path === 'loom') {
    const copy = catalogs[shot.lang].loom
    const available = await page.getByText(copy.status.available, { exact: true }).count()
    const soon = await page.getByText(copy.status.soon, { exact: true }).count()
    const soonBody = await page.getByText(copy.soonBody, { exact: true }).count()
    if (available !== 3 || soon !== 9 || soonBody !== 9) {
      throw new Error(`unexpected loom index labels: ${available} available, ${soon} soon, ${soonBody} bodies`)
    }
    const links = (await page.getByRole('link').allInnerTexts()).map((item) => item.replace(/\s+/g, ' ').trim())
    const expectedLinks = [copy.m0.title, copy.m1.title, copy.m6.title]
    if (links.join('|') !== expectedLinks.join('|')) {
      throw new Error(`unexpected loom links: ${links.join(' | ')}`)
    }
  }
  if (shot.path === 'loom/loom-0') {
    const copy = catalogs[shot.lang].loom
    const headings = (await page.getByRole('heading').allInnerTexts()).map((item) => item.replace(/\s+/g, ' ').trim())
    const expectedHeadings = [
      copy.m0.title,
      copy.sections.doing,
      copy.m0.paysTitle,
      copy.sections.why,
      copy.m0.stagesTitle,
      copy.sections.keywords,
      copy.sections.worked,
    ]
    if (headings.join('|') !== expectedHeadings.join('|')) {
      throw new Error(`unexpected loom-0 headings: ${headings.join(' | ')}`)
    }
  }
  if (shot.path === 'lessons') {
    const first = (await page.getByRole('listitem').first().innerText()).trim()
    const mcpTitle = catalogs[shot.lang].lesson.mcp.title
    if (first !== mcpTitle) throw new Error(`expected MCP first, got ${first}`)
  }
  if (shot.path === 'lessons/mcp') {
    const items = (await page.getByRole('listitem').allInnerTexts()).map((item) => item.replace(/\s+/g, ' ').trim())
    const sections = Object.values(catalogs[shot.lang].lesson.mcp.sections)
    if (items.join('|') !== sections.join('|')) {
      throw new Error(`unexpected MCP sections: ${items.join(' | ')}`)
    }
  }
  await assertNoOverflow(page, `${shot.path} ${shot.lang} ${width}`)
  if (shot.file) {
    await page.screenshot({ path: resolve(outDir, shot.file), fullPage: true })
  }
  await context.close()
}

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
    const expected = [
      'EN',
      'ES',
      'PLACEHOLDER',
      catalogs[lang].lessons.index.title,
      catalogs[lang].loom.index.title,
      catalogs[lang].lesson.component.title,
    ].sort()
    if (htmlLang !== lang) throw new Error(`expected html lang ${lang}, got ${htmlLang}`)
    if (heading !== 'PLACEHOLDER') throw new Error(`expected PLACEHOLDER, got ${heading}`)
    if (source !== 'local') throw new Error(`expected local data source, got ${source}`)
    if (visible.join('|') !== expected.join('|')) {
      throw new Error(`unexpected visible text: ${visible.join(' | ')}`)
    }
    await assertNoOverflow(page, `home ${lang} ${width}`)
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
  await page.getByRole('link', { name: en.lesson.component.title }).click()
  await page.waitForURL(/\/lessons\/component$/)
  await page.getByRole('heading', { name: en.lesson.component.title }).waitFor()
  await context.close()

  for (const lang of ['en', 'es']) {
    const lessonContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      locale: lang === 'en' ? 'en-US' : 'es-MX',
      deviceScaleFactor: 1,
    })
    await lessonContext.addInitScript(
      ([key, value]) => {
        localStorage.setItem(key, value)
      },
      [LANGUAGE_STORAGE_KEY, lang],
    )
    const lessonPage = await lessonContext.newPage()
    await lessonPage.goto(lessonUrl, { waitUntil: 'networkidle' })
    await lessonPage.locator('[data-page-fade]').waitFor()
    await lessonPage.waitForFunction(() => {
      const fade = document.querySelector('[data-page-fade]')
      return fade && Number(getComputedStyle(fade).opacity) > 0.99
    })
    const lesson = catalogs[lang].lesson.component
    const htmlLang = await lessonPage.locator('html').getAttribute('lang')
    const lessonHeading = (await lessonPage.getByRole('heading').innerText()).trim()
    const items = (await lessonPage.getByRole('listitem').allInnerTexts()).map((item) => item.trim())
    const sourceHref = await lessonPage.getByRole('link', { name: lesson.source }).getAttribute('href')
    const dataSource = await lessonPage.locator('main').getAttribute('data-source')
    if (htmlLang !== lang) throw new Error(`expected lesson html lang ${lang}, got ${htmlLang}`)
    if (lessonHeading !== lesson.title) throw new Error(`expected lesson title, got ${lessonHeading}`)
    if (items.join('|') !== Object.values(lesson.sections).join('|')) {
      throw new Error(`unexpected lesson sections: ${items.join(' | ')}`)
    }
    if (sourceHref !== 'https://www.etymonline.com/word/component') {
      throw new Error(`expected etymonline source, got ${sourceHref}`)
    }
    if (dataSource !== 'local') throw new Error(`expected local data source, got ${dataSource}`)
    await assertNoOverflow(lessonPage, `component lesson ${lang}`)
    await lessonPage.screenshot({
      path: resolve(outDir, `lesson-${lang}-1280.png`),
      fullPage: true,
    })
    await lessonContext.close()
  }

  const shots = [
    { lang: 'en', path: 'lessons', file: 'lessons-index-en-1280.png', heading: en.lessons.index.title },
    { lang: 'es', path: 'lessons', file: 'lessons-index-es-1280.png', heading: es.lessons.index.title },
    { lang: 'en', path: 'lessons/mcp', file: 'lesson-mcp-en-1280.png', heading: en.lesson.mcp.title },
    { lang: 'es', path: 'lessons/mcp', file: 'lesson-mcp-es-1280.png', heading: es.lesson.mcp.title },
    { lang: 'en', path: 'loom', file: 'loom-index-en-1280.png', heading: en.loom.index.title },
    { lang: 'es', path: 'loom', file: 'loom-index-es-1280.png', heading: es.loom.index.title },
    { lang: 'en', path: 'loom/loom-0', file: 'loom-0-en-1280.png', heading: en.loom.m0.title },
    { lang: 'es', path: 'loom/loom-0', file: 'loom-0-es-1280.png', heading: es.loom.m0.title },
  ]
  for (const shot of shots) {
    await shotPage(browser, baseUrl, shot)
  }
  for (const width of [390, 768, 1024, 1280]) {
    await shotPage(browser, baseUrl, {
      lang: 'es',
      path: 'lessons',
      heading: es.lessons.index.title,
      width,
      height: width === 390 ? 844 : 1024,
      checkOverflow: true,
    })
    await shotPage(browser, baseUrl, {
      lang: 'en',
      path: 'lessons/mcp',
      heading: en.lesson.mcp.title,
      width,
      height: width === 390 ? 844 : 1024,
      checkOverflow: true,
    })
    for (const path of ['loom', 'loom/loom-0', 'loom/loom-1', 'loom/loom-6']) {
      const heading =
        path === 'loom'
          ? es.loom.index.title
          : es.loom[path.endsWith('loom-0') ? 'm0' : path.endsWith('loom-1') ? 'm1' : 'm6'].title
      await shotPage(browser, baseUrl, {
        lang: 'es',
        path,
        heading,
        width,
        height: width === 390 ? 844 : 1024,
        checkOverflow: true,
      })
      await shotPage(browser, baseUrl, {
        lang: 'en',
        path,
        heading:
          path === 'loom'
            ? en.loom.index.title
            : en.loom[path.endsWith('loom-0') ? 'm0' : path.endsWith('loom-1') ? 'm1' : 'm6'].title,
        width,
        height: width === 390 ? 844 : 1024,
        checkOverflow: true,
      })
    }
  }

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
  await reducedPage.goto(lessonUrl, { waitUntil: 'networkidle' })
  await reducedPage.locator('[data-page-fade]').waitFor()
  const lessonLenis = await reducedPage.evaluate(() => document.documentElement.classList.contains('lenis'))
  const lessonOpacity = await reducedPage
    .locator('[data-page-fade]')
    .evaluate((node) => getComputedStyle(node).opacity)
  if (lessonLenis) throw new Error('Lenis should stay off on the lesson when reduced motion is requested')
  if (lessonOpacity !== '1') {
    throw new Error(`expected full opacity on the lesson under reduced motion, got ${lessonOpacity}`)
  }
  await reducedPage.goto(`${baseUrl.replace(/\/$/, '')}/lessons/mcp`, { waitUntil: 'networkidle' })
  await reducedPage.locator('[data-page-fade]').waitFor()
  const mcpLenis = await reducedPage.evaluate(() => document.documentElement.classList.contains('lenis'))
  const mcpOpacity = await reducedPage
    .locator('[data-page-fade]')
    .evaluate((node) => getComputedStyle(node).opacity)
  if (mcpLenis) throw new Error('Lenis should stay off on the MCP lesson when reduced motion is requested')
  if (mcpOpacity !== '1') {
    throw new Error(`expected full opacity on the MCP lesson under reduced motion, got ${mcpOpacity}`)
  }
  await reduced.close()
} finally {
  await browser.close()
}

console.log(`screenshots written to ${outDir}`)
