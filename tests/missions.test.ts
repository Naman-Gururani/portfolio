import { describe, expect, it } from 'vitest'
import { MISSIONS, missionStatus, type MissionView } from '../src/data/missions'
import { BLUEPRINT } from '../src/world/blueprint'

const view = (o: Partial<MissionView> = {}): MissionView => ({ unlocked: [], questDone: () => false, discovered: [], ticket: true, ...o })

describe('missions', () => {
  it('covers every attraction exactly once', () => {
    const ids = MISSIONS.map((m) => m.id).sort()
    expect(ids).toEqual(BLUEPRINT.attractions.map((a) => a.id).sort())
  })

  it('opens with the ticket and ends at the guestbook', () => {
    const story = MISSIONS.filter((m) => m.story).map((m) => m.id)
    expect(story).toEqual(['gate', 'coaster', 'prizetent', 'forge', 'guestbook'])
  })

  it('says nothing a résumé would say', () => {
    for (const m of MISSIONS) {
      expect(m.does + m.gives).not.toMatch(/\d/)
      expect(m.does.length).toBeLessThanOrEqual(90)
    }
  })

  it('locks the fair behind the ticket', () => {
    const coaster = MISSIONS.find((m) => m.id === 'coaster')!
    expect(missionStatus(coaster, view({ ticket: false }))).toBe('locked')
    // With the ticket won and About unlocked, the gate is done and the coaster
    // is the stop being pointed at.
    expect(missionStatus(coaster, view({ unlocked: ['about'] }))).toBe('next')
    // With the ticket won but the gate unfinished, the coaster is merely open.
    expect(missionStatus(coaster, view())).toBe('open')
  })

  it('marks a chapter done once its zones are unlocked', () => {
    const forge = MISSIONS.find((m) => m.id === 'forge')!
    expect(missionStatus(forge, view({ unlocked: ['skills'] }))).toBe('done')
  })

  it('points at the first unfinished stop, and only that one', () => {
    const v = view({ unlocked: ['about'] })
    const next = MISSIONS.filter((m) => missionStatus(m, v) === 'next')
    expect(next.map((m) => m.id)).toEqual(['coaster'])
  })

  it('counts a side stop by its own quest', () => {
    const arcade = MISSIONS.find((m) => m.id === 'arcade')!
    expect(missionStatus(arcade, view())).toBe('open')
    expect(missionStatus(arcade, view({ questDone: (q) => q === 'crew' }))).toBe('done')
  })
})
