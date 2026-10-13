import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const liveOrigin = 'https://sambar1106.github.io'
const liveRoot = '/samuel-learn/'
const siteDir = join(process.cwd(), 'site')
const previewDir = join(siteDir, 'preview')
const distDir = join(process.cwd(), 'dist')

function localName(urlPath) {
  const path = urlPath.split('?')[0]
  if (path === '/samuel-learn' || path === '/samuel-learn/') return 'index.html'
  const rel = path.slice('/samuel-learn/'.length)
  return rel || 'index.html'
}

async function download(urlPath) {
  const response = await fetch(`${liveOrigin}${urlPath}`)
  if (!response.ok) throw new Error(`Could not download ${urlPath} (${response.status})`)
  return Buffer.from(await response.arrayBuffer())
}

const indexBytes = await download(liveRoot)
const indexHtml = indexBytes.toString('utf8')
if (indexHtml.includes('/samuel-learn/preview/')) {
  throw new Error('The live homepage already references preview assets. Refusing to replace it.')
}

const paths = new Set([liveRoot, `${liveRoot}404.html`, `${liveRoot}favicon.svg`])
for (const match of indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const url = match[1].split('?')[0]
  if (url.startsWith(liveRoot) && !url.startsWith(`${liveRoot}preview/`)) paths.add(url)
}

await rm(siteDir, { recursive: true, force: true })
await mkdir(siteDir, { recursive: true })

for (const urlPath of paths) {
  const bytes = urlPath === liveRoot ? indexBytes : await download(urlPath)
  const file = join(siteDir, localName(urlPath))
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, bytes)
}

await cp(distDir, previewDir, { recursive: true })
await writeFile(join(siteDir, '.nojekyll'), '')

const rootIndex = await readFile(join(siteDir, 'index.html'), 'utf8')
const previewIndex = await readFile(join(previewDir, 'index.html'), 'utf8')
if (rootIndex.includes('/samuel-learn/preview/assets/')) {
  throw new Error('The live homepage was overwritten by the preview build.')
}
if (!previewIndex.includes('/samuel-learn/preview/')) {
  throw new Error('The preview build is missing the /samuel-learn/preview/ base path.')
}

console.log('Assembled site/ from the live Pages build plus site/preview.')
