import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function githubPagesSpa() {
  return {
    name: 'github-pages-spa',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const html = bundle['index.html']
      if (!html || html.type !== 'asset') {
        this.error('index.html was not emitted, so the GitHub Pages 404 fallback could not be created')
      }
      const source = typeof html.source === 'string' ? html.source : new TextDecoder().decode(html.source)
      this.emitFile({ type: 'asset', fileName: '404.html', source })
      this.emitFile({ type: 'asset', fileName: '.nojekyll', source: '' })
    },
  }
}

export default defineConfig({
  base: '/samuel-learn/',
  plugins: [react(), githubPagesSpa()],
})
