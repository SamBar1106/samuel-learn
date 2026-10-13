import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chooseAdapter } from '../src/lib/data.js'

test('uses the local json adapter when supabase env is missing', async () => {
  const adapter = chooseAdapter({})
  assert.equal(adapter.kind, 'local')
  assert.deepEqual(await adapter.getPage('home'), {
    id: 'home',
    textKey: 'page.placeholder',
    source: 'local',
  })
})

test('stays on local json when only one supabase variable is set', () => {
  assert.equal(chooseAdapter({ VITE_SUPABASE_URL: 'https://example.supabase.co' }).kind, 'local')
  assert.equal(chooseAdapter({ VITE_SUPABASE_ANON_KEY: 'anon' }).kind, 'local')
  assert.equal(
    chooseAdapter({ VITE_SUPABASE_URL: '   ', VITE_SUPABASE_ANON_KEY: 'anon' }).kind,
    'local',
  )
})

test('passes lesson title, sections, and source through', async () => {
  const page = await chooseAdapter({}).getPage('lesson-component-etymology')
  assert.deepEqual(page, {
    id: 'lesson-component-etymology',
    titleKey: 'lesson.component.title',
    sectionKeys: [
      'lesson.component.sections.root',
      'lesson.component.sections.entered',
      'lesson.component.sections.use1560s',
      'lesson.component.sections.noun1640s',
      'lesson.component.sections.adjective1660s',
      'lesson.component.sections.mechanical1896',
      'lesson.component.sections.today',
    ],
    sourceKey: 'lesson.component.source',
    sourceUrl: 'https://www.etymonline.com/word/component',
    path: '/lessons/component',
    areaId: 'react',
    source: 'local',
  })
})

test('lists the nine areas and keeps the component lesson on React', async () => {
  const areas = await chooseAdapter({}).listAreas()
  assert.equal(areas.length, 9)
  assert.deepEqual(
    areas.map((area) => area.id),
    ['git-github', 'agents', 'mcp', 'anthropic', 'react', 'css', 'languages', 'schemas', 'web3d'],
  )
  const react = areas.find((area) => area.id === 'react')
  assert.equal(react.lessonId, 'lesson-component-etymology')
  assert.deepEqual(areas.find((area) => area.id === 'web3d').topics, [
    'Three.js',
    'React Three Fiber',
    'GSAP',
    'Lenis',
  ])
})

test('selects the supabase stub only when both variables are set and does not fetch', async () => {
  const original = globalThis.fetch
  let called = false
  globalThis.fetch = () => {
    called = true
    throw new Error('network')
  }

  try {
    const adapter = chooseAdapter({
      VITE_SUPABASE_URL: ' https://example.supabase.co ',
      VITE_SUPABASE_ANON_KEY: ' anon ',
    })
    assert.equal(adapter.kind, 'supabase')
    assert.deepEqual(await adapter.getPage('home'), {
      id: 'home',
      textKey: 'page.placeholder',
      source: 'supabase',
    })
    assert.equal((await adapter.listAreas()).length, 9)
    assert.equal(called, false)
  } finally {
    globalThis.fetch = original
  }
})
