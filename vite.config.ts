import { defineConfig } from 'vite'

// Served from https://naman-gururani.github.io/portfolio/
export default defineConfig({
  base: '/portfolio/',
  build: {
    target: 'es2020',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: { phaser: ['phaser'] },
      },
    },
  },
})
