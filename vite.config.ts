import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'

// GitHub Pages has no SPA rewrites; serving index.html as 404.html lets deep links like /mp2/character/5 load the app.
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      copyFileSync('dist/index.html', 'dist/404.html')
    },
  }
}

export default defineConfig({
  plugins: [react(), spaFallback()],
  base: '/mp2/',
})
