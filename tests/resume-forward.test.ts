// /portfolio/ used to be the game, so links in the wild still carry its flags
// (`?fresh=1`, `?cheat=1`, `?word=kafka`…). Those must land in the game at
// /portfolio/play/ with the query and hash intact; a plain visit — or one with
// unrelated parameters such as a CV tracking tag — must stay on the résumé.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { GAME_FLAGS, gameForward } from '../src/resume/forward'

const CASES: [string, string, string | null][] = [
  ['?fresh=1&cheat=1', '#top', '/portfolio/play/?fresh=1&cheat=1#top'],
  ['?word=kafka', '', '/portfolio/play/?word=kafka'],
  ['?duck=gold', '', '/portfolio/play/?duck=gold'],
  ['?st', '', '/portfolio/play/?st'],
  ['', '', null],
  ['', '#experience', null],
  ['?utm_source=cv', '', null],
  ['?freshness=1', '', null],
]

describe('gameForward', () => {
  it('knows every flag the game reads', () => {
    expect([...GAME_FLAGS].sort()).toEqual(['cheat', 'duck', 'fresh', 'st', 'word'])
  })

  for (const [search, hash, want] of CASES) {
    it(`${search || '(none)'}${hash} → ${want ?? 'stays'}`, () => {
      expect(gameForward(search, hash)).toBe(want)
    })
  }
})

describe('the inline forward in index.html', () => {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8')
  const src = html.match(/<script data-forward>([\s\S]*?)<\/script>/)?.[1] ?? ''

  it('exists, in the head, before anything paints', () => {
    expect(src).not.toBe('')
    expect(html.indexOf('data-forward')).toBeLessThan(html.indexOf('</head>'))
  })

  for (const [search, hash, want] of CASES) {
    it(`agrees with gameForward for ${search || '(none)'}${hash}`, () => {
      let went: string | null = null
      const location = { search, hash, replace: (u: string) => { went = u } }
      new Function('location', src)(location)
      expect(went).toBe(want)
    })
  }
})
