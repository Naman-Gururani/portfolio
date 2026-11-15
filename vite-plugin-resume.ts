// Renders the résumé into index.html at build (and dev) time, so /portfolio/ is
// a complete static page: readable with JavaScript off, by crawlers and by ATS
// parsers. The game's entry (play/index.html) is left alone.
import type { Plugin } from 'vite'
import { renderHead, renderResume } from './src/resume/render'

export function resumePlugin(): Plugin {
  return {
    name: 'resume-render',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (ctx.path.includes('/play/') || !html.includes('<!--resume-->')) return html
        return html.replace('<!--resume-head-->', renderHead()).replace('<!--resume-->', renderResume())
      },
    },
  }
}
