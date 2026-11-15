// Static guarantees for resume.css. The page must be readable with no motion
// support, with motion turned off, and on paper:
// - nothing may start invisible unless it sits behind a motion or feature guard;
// - the blur that makes the glass is a progressive enhancement;
// - print drops the scene, the nav and the game banners.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const CSS = readFileSync(resolve(__dirname, '../src/resume/resume.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

/** The top-level blocks of the sheet, each with its at-rule prelude (or '' for plain rules). */
function topBlocks(css: string): { prelude: string; body: string }[] {
  const out: { prelude: string; body: string }[] = []
  let depth = 0
  let start = 0
  let open = -1
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') {
      if (depth === 0) open = i
      depth++
    } else if (css[i] === '}') {
      depth--
      if (depth === 0) {
        out.push({ prelude: css.slice(start, open).trim(), body: css.slice(open + 1, i) })
        start = i + 1
      }
    }
  }
  return out
}

const BLOCKS = topBlocks(CSS)
const guarded = (p: string) => /prefers-reduced-motion:\s*no-preference/.test(p) || p.startsWith('@supports')

describe('resume.css', () => {
  it('parses into top-level blocks', () => {
    expect(BLOCKS.length).toBeGreaterThan(40)
  })

  it('hides nothing outside a motion or feature guard', () => {
    for (const b of BLOCKS) {
      if (guarded(b.prelude) || b.prelude.startsWith('@media print') || b.prelude.startsWith('@keyframes')) continue
      expect(b.body, `opacity:0 under "${b.prelude.slice(0, 60)}"`).not.toMatch(/opacity:\s*0(?![.\d])/)
      expect(b.body, `animation-timeline under "${b.prelude.slice(0, 60)}"`).not.toMatch(/animation-timeline/)
    }
  })

  it('only blurs behind glass where the browser supports it', () => {
    for (const b of BLOCKS) {
      if (b.prelude.startsWith('@supports')) continue
      expect(b.body, `backdrop-filter under "${b.prelude.slice(0, 60)}"`).not.toMatch(/backdrop-filter:(?!\s*none)/)
    }
  })

  it('prints without the scene, the nav or the game banners', () => {
    const print = BLOCKS.find((b) => b.prelude.startsWith('@media print'))
    expect(print).toBeDefined()
    for (const sel of ['.scene', '.bar-wrap', '.ribbon', '.ticket']) expect(print!.body).toContain(sel)
  })

  it('has a light skin and a forced-colours fallback', () => {
    expect(CSS).toMatch(/\[data-theme=['"]?light['"]?\]/)
    expect(CSS).toMatch(/@media \(forced-colors: active\)/)
  })
})

describe('review fixes (v6 final review)', () => {
  it('reveals with `translate`, so hover lifts (which use transform) still work', () => {
    const rise = CSS.match(/@keyframes rise\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    expect(rise).toMatch(/translate:/)
    expect(rise).not.toMatch(/transform:/)
  })

  it('opens collapsed details on paper even without JS, and prints only absolute URLs', () => {
    const prints = BLOCKS.filter((b) => b.prelude.startsWith('@media print')).map((b) => b.body).join('\n')
    expect(prints).toMatch(/::details-content/)
    expect(prints).not.toMatch(/\.arrow::after\s*\{\s*content:\s*' \(' attr\(href\)/)
  })

  it('keeps a visible focus ring on the dark credential in both skins', () => {
    expect(CSS).toMatch(/\.cred :focus-visible\s*\{[^}]*outline-color:\s*#e5c5ff/)
  })
})
