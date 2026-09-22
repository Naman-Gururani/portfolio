import { describe, expect, it } from 'vitest'
import { BLUEPRINT } from '../src/world/blueprint'
import { actionLabel, IDLE_LABEL, IDLE_VERB, verbFor } from '../src/systems/verbs'

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

describe('actionLabel', () => {
  it('puts the verb in front of a bare place name', () => {
    expect(actionLabel('Career Coaster', 'RIDE')).toBe('Ride the Career Coaster')
    expect(actionLabel('Guestbook', 'SIGN')).toBe('Sign the Guestbook')
    expect(actionLabel('Fair lights', 'SWITCH')).toBe('Switch the Fair lights')
  })

  it('leaves a prompt that already opens with its verb alone', () => {
    expect(actionLabel('Talk to Bo', 'TALK')).toBe('Talk to Bo')
    expect(actionLabel('Open the prize box', 'OPEN')).toBe('Open the prize box')
    expect(actionLabel('Hook a duck', 'HOOK')).toBe('Hook a duck')
    expect(actionLabel('Pet Byte', 'PET')).toBe('Pet Byte')
  })

  it('gives TALK its preposition, because the booth is a place and not a person', () => {
    expect(actionLabel('Ticket Booth', 'TALK')).toBe('Talk to the Ticket Booth')
  })

  it('reads as a sentence for every attraction in the fair', () => {
    for (const a of BLUEPRINT.attractions) {
      const label = actionLabel(a.name, verbFor({ interact: a.interact, prompt: a.name }))
      expect(label).toContain(a.name)
      // The verb is the point: the name on its own is what the review found.
      expect(label).not.toBe(a.name)
    }
  })

  it('has one place the idle wording lives', () => {
    expect(IDLE_LABEL).toBe('Swing the wrench')
  })
})
