import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { chooseAdapter, contentTranslationKeys } from '../src/lib/data.js'

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

const content = readJson('../src/data/content.json')
const en = readJson('../src/i18n/en.json')
const es = readJson('../src/i18n/es.json')

test('loom index lists every module as coming soon, with no lessons', async () => {
  const modules = await chooseAdapter({}).listLoomModules()
  assert.deepEqual(
    modules.map((module) => module.number),
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  )
  for (const module of modules) {
    assert.equal(module.status, 'soon')
    assert.equal(module.slug, undefined)
    assert.equal(module.summaryKey, undefined)
    assert.equal(module.sections, undefined)
    assert.deepEqual(Object.keys(en.loom[`m${module.number}`]), ['title'])
    assert.deepEqual(Object.keys(es.loom[`m${module.number}`]), ['title'])
  }
  assert.equal(en.loom.status.soon, 'Coming soon')
  assert.equal(es.loom.status.soon, 'Próximamente')
  assert.equal(en.loom.status.available, undefined)
  assert.equal(es.loom.sections, undefined)
  assert.equal(content.loom.availableKey, undefined)
  assert.equal(content.loom.soonBodyKey, undefined)

  const home = readFileSync(new URL('../src/pages/Home.jsx', import.meta.url), 'utf8')
  const fade = readFileSync(new URL('../src/components/PageFade.jsx', import.meta.url), 'utf8')
  const index = readFileSync(new URL('../src/pages/LoomIndex.jsx', import.meta.url), 'utf8')
  assert.match(home, /to="\/loom"/)
  assert.match(fade, /path="\/loom"/)
  assert.doesNotMatch(fade, /\/loom\/:slug/)
  assert.doesNotMatch(index, /<Link/)
})

test('loom index strings exist in both languages', () => {
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
    assert.equal(modules.length, 12)
    assert.equal(modules[0].status, 'soon')
    assert.equal(modules[0].source, 'supabase')
    assert.equal(called, false)
  } finally {
    globalThis.fetch = original
  }
})
