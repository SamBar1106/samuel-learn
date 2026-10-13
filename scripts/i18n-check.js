import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const i18nDir = join(root, 'src', 'i18n')

function flatten(value, prefix = '', keys = []) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${key}` : key
      flatten(child, path, keys)
    }
    return keys
  }
  keys.push(prefix)
  return keys
}

function hasKey(value, dotted) {
  let current = value
  for (const part of dotted.split('.')) {
    if (!current || typeof current !== 'object' || !(part in current)) return false
    current = current[part]
  }
  return typeof current !== 'object' || current === null
}

const es = JSON.parse(readFileSync(join(i18nDir, 'es.json'), 'utf8'))
const en = JSON.parse(readFileSync(join(i18nDir, 'en.json'), 'utf8'))
const content = JSON.parse(readFileSync(join(root, 'src', 'data', 'content.json'), 'utf8'))

const esKeys = new Set(flatten(es))
const enKeys = new Set(flatten(en))
const missingInEn = [...esKeys].filter((key) => !enKeys.has(key)).sort()
const missingInEs = [...enKeys].filter((key) => !esKeys.has(key)).sort()
const contentKeys = (content.pages ?? []).flatMap((page) => {
  const keys = [page.textKey, page.titleKey, page.sourceKey]
  if (Array.isArray(page.sectionKeys)) keys.push(...page.sectionKeys)
  return keys.filter((key) => typeof key === 'string' && key !== '')
})
const missingContent = []

for (const key of contentKeys) {
  if (!hasKey(es, key)) missingContent.push(`es.json: ${key}`)
  if (!hasKey(en, key)) missingContent.push(`en.json: ${key}`)
}

if (missingInEn.length || missingInEs.length || missingContent.length) {
  console.error('i18n:check failed. Every new item ships in both languages.')
  for (const key of missingInEn) console.error(`  missing in en.json: ${key}`)
  for (const key of missingInEs) console.error(`  missing in es.json: ${key}`)
  for (const key of missingContent) console.error(`  content key missing in ${key}`)
  process.exit(1)
}

console.log(`i18n:check ok (${esKeys.size} keys in es and en)`)
