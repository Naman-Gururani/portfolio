import { defineConfig } from 'vite'
import { resumePlugin } from './vite-plugin-resume'

// Served from https://naman-gururani.github.io/portfolio/
//   /portfolio/       — the résumé (index.html)
//   /portfolio/play/  — the game (play/index.html)
export default defineConfig({
  base: '/portfolio/',
  plugins: [resumePlugin()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      input: { main: 'index.html', play: 'play/index.html' },
      output: {
        manualChunks: { phaser: ['phaser'] },
      },
    },
  },
})
