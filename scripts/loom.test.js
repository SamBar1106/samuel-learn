import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { chooseAdapter, contentTranslationKeys } from '../src/lib/data.js'

const soonNumbers = [2, 3, 4, 5, 7, 8, 9, 10, 11]
const sectionIds = ['doing', 'why', 'keywords', 'worked']
const copyHash = {
  en: '6dacae5f728b459ce58d98eda7ac8cbafd6995215b20d0fb6a75e0e4ac6376e4',
  es: '6ee78366064537c3207120909ba720949b54e0f42969f8da49ecc250c7dc5d66',
}

function readJson(path) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
}

function dig(value, dotted) {
  let current = value
  for (const part of dotted.split('.')) {
    if (!current || typeof current !== 'object' || !(part in current)) return undefined
    current = current[part]
  }
  return current
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map((item) => stable(item)).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

const content = readJson('../src/data/content.json')
const en = readJson('../src/i18n/en.json')
const es = readJson('../src/i18n/es.json')

test('loom modules stay in stage order with only the written lessons available', async () => {
  const modules = await chooseAdapter({}).listLoomModules()
  assert.deepEqual(
    modules.map((module) => module.number),
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  )
  assert.deepEqual(
    modules.map((module) => module.status),
    ['available', 'available', 'soon', 'soon', 'soon', 'soon', 'available', 'soon', 'soon', 'soon', 'soon', 'soon'],
  )
  assert.deepEqual(
    modules.filter((module) => module.status === 'available').map((module) => module.slug),
    ['loom-0', 'loom-1', 'loom-6'],
  )

  for (const module of modules.filter((item) => soonNumbers.includes(item.number))) {
    assert.equal(module.status, 'soon')
    assert.equal(module.slug, undefined)
    assert.equal(module.summaryKey, undefined)
    assert.equal(module.sections, undefined)
    assert.deepEqual(Object.keys(en.loom[`m${module.number}`]), ['title'])
    assert.deepEqual(Object.keys(es.loom[`m${module.number}`]), ['title'])
  }

  const first = await chooseAdapter({}).getLoomLesson('loom-0')
  assert.equal(first.previousSlug, null)
  assert.equal(first.nextSlug, 'loom-1')
  assert.deepEqual(
    first.sections.map((section) => section.id),
    sectionIds,
  )
  assert.equal(first.sections[0].parts[0].id, 'pays')
  assert.equal(first.sections[1].parts[0].id, 'stages')

  const stripe = await chooseAdapter({}).getLoomLesson('loom-1')
  assert.equal(stripe.previousSlug, 'loom-0')
  assert.equal(stripe.nextSlug, 'loom-6')
  assert.equal(stripe.sections.some((section) => section.parts), false)

  const dashboard = await chooseAdapter({}).getLoomLesson('loom-6')
  assert.equal(dashboard.previousSlug, 'loom-1')
  assert.equal(dashboard.nextSlug, null)
  assert.equal(dashboard.sections.some((section) => section.parts), false)
  assert.equal(dashboard.source, 'local')

  await assert.rejects(() => chooseAdapter({}).getLoomLesson('loom-2'), /Unknown lesson/)
  await assert.rejects(() => chooseAdapter({}).getLoomLesson('missing'), /Unknown lesson/)
})

test('loom copy is the spec text in both languages and carries no secrets', () => {
  assert.equal(en.loom.sections.doing, "What we're doing")
  assert.equal(en.loom.sections.why, 'Why it matters')
  assert.equal(en.loom.sections.keywords, 'Key words')
  assert.equal(en.loom.sections.worked, "You'll know it worked when...")
  assert.equal(es.loom.sections.doing, 'Lo que estamos haciendo')
  assert.equal(es.loom.sections.why, 'Por qué importa')
  assert.equal(es.loom.sections.keywords, 'Palabras clave')
  assert.equal(es.loom.sections.worked, 'Sabrás que funcionó cuando...')
  assert.equal(en.loom.status.available, 'Available')
  assert.equal(en.loom.status.soon, 'Coming soon')
  assert.equal(es.loom.status.available, 'Disponible')
  assert.equal(es.loom.status.soon, 'Próximamente')
  assert.equal(en.loom.soonBody, 'Lesson coming when this stage starts.')
  assert.equal(es.loom.soonBody, 'La lección llegará cuando empiece esta etapa.')
  assert.match(en.loom.m0.pays, /2\.175% \+ 22\.5¢/)
  assert.match(en.loom.m0.pays, /application_fee_amount/)
  assert.match(es.loom.m0.pays, /2\.175% \+ 22\.5¢/)

  for (const [code, catalog] of [
    ['en', en.loom],
    ['es', es.loom],
  ]) {
    const raw = stable(catalog)
    assert.equal(createHash('sha256').update(raw).digest('hex'), copyHash[code], code)
  }

  const blob = `${JSON.stringify(en.loom)}\n${JSON.stringify(es.loom)}\n${JSON.stringify(content.loom)}`
  for (const banned of ['Dwight', 'dwight', 'sk_live', 'sk_test', 'pk_live', 'pk_test', 'whsec_', 'acct_', 'rk_live', 'api_key', '$']) {
    assert.equal(blob.includes(banned), false, banned)
  }

  for (const key of contentTranslationKeys(content)) {
    if (!key.startsWith('loom.')) continue
    const english = dig(en, key)
    const spanish = dig(es, key)
    assert.equal(typeof english, 'string', key)
    assert.equal(typeof spanish, 'string', key)
    assert.notEqual(english.trim(), '')
    assert.notEqual(spanish.trim(), '')
    assert.notEqual(english, spanish, key)
  }
})

test('home and routes point at the loom course', () => {
  const home = readFileSync(new URL('../src/pages/Home.jsx', import.meta.url), 'utf8')
  const fade = readFileSync(new URL('../src/components/PageFade.jsx', import.meta.url), 'utf8')
  assert.match(home, /to="\/loom"/)
  assert.match(fade, /path="\/loom"/)
  assert.match(fade, /path="\/loom\/:slug"/)
  assert.match(fade, /course="loom"/)
})

test('supabase stub lists loom modules without fetching', async () => {
  const original = globalThis.fetch
  let called = false
  globalThis.fetch = () => {
    called = true
    throw new Error('network')
  }
  try {
    const adapter = chooseAdapter({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anon',
    })
    const modules = await adapter.listLoomModules()
    assert.equal(modules[0].slug, 'loom-0')
    assert.equal(modules[0].source, 'supabase')
    const lesson = await adapter.getLoomLesson('loom-6')
    assert.equal(lesson.source, 'supabase')
    assert.equal(called, false)
  } finally {
    globalThis.fetch = original
  }
})
