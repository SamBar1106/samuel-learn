import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { test } from 'node:test'

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
  'FEATURED LESSON',
]

async function filesIn(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) await filesIn(path, acc)
    else if (/\.(jsx?|css|html|json|md)$/.test(entry.name)) acc.push(path)
  }
  return acc
}

test('the site does not ship Stitch-invented copy', async () => {
  const files = [...(await filesIn('src')), 'index.html']
  const hits = []
  for (const file of files) {
    const text = await readFile(file, 'utf8')
    for (const phrase of banned) {
      if (text.includes(phrase)) hits.push(`${file}: ${phrase}`)
    }
  }
  assert.deepEqual(hits, [])
})
