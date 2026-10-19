import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { chooseAdapter } from '../src/lib/data.js'

const expectedSlugs = [
  'mcp',
  'agent-orchestration',
  'prompt-engineering',
  'function-calling',
  'rag',
  'embeddings',
  'vector-databases',
  'apis',
  'web-automation',
  'browser-automation',
  'file-and-code',
  'evaluation',
  'security',
  'git',
  'languages',
  'front-end',
  'schemas',
  '3d-web',
  'servers',
  'domain-terms',
  'component',
]

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

test('lessons stay in learning-list order with MCP first', async () => {
  const lessons = await chooseAdapter({}).listLessons()
  assert.deepEqual(
    lessons.map((lesson) => lesson.slug),
    expectedSlugs,
  )
  const mcp = await chooseAdapter({}).getLesson('mcp')
  assert.equal(mcp.previousSlug, null)
  assert.equal(mcp.nextSlug, 'agent-orchestration')
  assert.equal(mcp.source, 'local')
  const last = await chooseAdapter({}).getLesson('component')
  assert.equal(last.id, 'lesson-component-etymology')
  assert.equal(last.previousSlug, 'domain-terms')
  assert.equal(last.nextSlug, null)
  await assert.rejects(() => chooseAdapter({}).getLesson('missing'), /Unknown lesson/)
})

test('every vocabulary section is translated and carries no secrets or client names', () => {
  const blob = `${JSON.stringify(en)}\n${JSON.stringify(es)}\n${JSON.stringify(content)}`
  for (const banned of ['Maria', 'CLAUDE_CODE_OAUTH_TOKEN', 'CURSOR-001', 'Scan limits', 'Claude Pro OAuth']) {
    assert.equal(blob.includes(banned), false, banned)
  }

  const lessons = content.pages.filter((page) => page.slug && page.slug !== 'component')
  assert.equal(lessons.length, 20)
  for (const page of lessons) {
    assert.equal(page.sourceKey, 'lesson.vocab.source')
    assert.ok(page.sectionKeys.length > 0)
    for (const key of page.sectionKeys) {
      const english = dig(en, key)
      const spanish = dig(es, key)
      assert.equal(typeof english, 'string', key)
      assert.equal(typeof spanish, 'string', key)
      assert.notEqual(english.trim(), '')
      assert.notEqual(spanish.trim(), '')
      assert.notEqual(english, spanish, key)
    }
  }
})

test('supabase stub lists lessons without fetching', async () => {
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
    const lessons = await adapter.listLessons()
    assert.equal(lessons[0].slug, 'mcp')
    assert.equal(lessons[0].source, 'supabase')
    assert.equal(called, false)
  } finally {
    globalThis.fetch = original
  }
})
