import { describe, expect, it } from 'vitest'
import { BLUEPRINT } from '../src/world/blueprint'
import { IDLE_VERB, verbFor } from '../src/systems/verbs'

describe('verbFor', () => {
  it('reads an explicit verb first', () => {
    expect(verbFor({ verb: 'PET', prompt: 'Pet Byte' })).toBe('PET')
  })

  it('maps every attraction dispatch to a verb', () => {
    const got = BLUEPRINT.attractions.map((a) => verbFor({ interact: a.interact, prompt: a.name }))
    expect(got).toEqual(['TALK', 'RIDE', 'PLAY', 'PLAY', 'PLAY', 'PLAY', 'HOOK', 'SIGN'])
  })

  it('falls back to the prompt wording', () => {
    expect(verbFor({ prompt: 'Talk to Bo' })).toBe('TALK')
    expect(verbFor({ prompt: 'Read the sign' })).toBe('READ')
    expect(verbFor({ prompt: 'Open the prize box' })).toBe('OPEN')
    expect(verbFor({ prompt: 'Take the balloon' })).toBe('TAKE')
  })

  it('never returns an empty label', () => {
    expect(verbFor({ prompt: 'Something nobody planned for' })).toBe('USE')
    expect(IDLE_VERB).toBe('SWING')
  })

  it('gives the fair stalls a label a person would read', () => {
    const byId = Object.fromEntries(BLUEPRINT.attractions.map((a) => [a.id, verbFor({ interact: a.interact, prompt: a.name })]))
    expect(byId.gate).toBe('TALK')
    expect(byId.coaster).toBe('RIDE')
    expect(byId.guestbook).toBe('SIGN')
    expect(byId.duckpond).toBe('HOOK')
  })
})
