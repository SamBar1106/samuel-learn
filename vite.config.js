import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import content from './src/data/content.json' with { type: 'json' }

const lessonFiles = content.pages
  .filter((page) => page.slug || page.id === 'lessons')
  .flatMap((page) => {
    const path = page.slug ? `lessons/${page.slug}` : 'lessons'
    return [`${path}.html`, `${path}/index.html`]
  })

const routeFiles = ['areas.html', 'areas/index.html', 'about.html', 'about/index.html', ...lessonFiles]

function normalizeBase(value) {
  const raw = value && value.trim() ? value.trim() : '/samuel-learn/'
  const withLead = raw.startsWith('/') ? raw : `/${raw}`
  return withLead.endsWith('/') ? withLead : `${withLead}/`
}

function githubPagesSpa() {
  return {
    name: 'github-pages-spa',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const html = bundle['index.html']
      if (!html || html.type !== 'asset') {
        this.error('index.html was not emitted, so the GitHub Pages fallback could not be created')
      }
      const source = typeof html.source === 'string' ? html.source : new TextDecoder().decode(html.source)
      this.emitFile({ type: 'asset', fileName: '404.html', source })
      this.emitFile({ type: 'asset', fileName: '.nojekyll', source: '' })
      for (const fileName of routeFiles) {
        this.emitFile({ type: 'asset', fileName, source })
      }
    },
  }
}

export default defineConfig({
  base: normalizeBase(process.env.VITE_BASE),
  plugins: [react(), githubPagesSpa()],
})
