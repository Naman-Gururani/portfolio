// @vitest-environment happy-dom
//
// "People are finding it hard to navigate around the game, they don't know what
// to do and where to go." The Missions sheet is the answer: one row per stop,
// in plain words, with a button that walks you there.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('phaser', () => {
  type Fn = (p: unknown) => void
  class EventEmitter {
    private m = new Map<string, Set<Fn>>()
    on(k: string, fn: Fn) {
      let s = this.m.get(k)
      if (!s) {
        s = new Set()
        this.m.set(k, s)
      }
      s.add(fn)
      return this
    }
    once(k: string, fn: Fn) {
      const w: Fn = (p) => {
        this.off(k, w)
        fn(p)
      }
      return this.on(k, w)
    }
    off(k: string, fn: Fn) {
      this.m.get(k)?.delete(fn)
      return this
    }
    emit(k: string, p: unknown) {
      for (const fn of Array.from(this.m.get(k) ?? [])) fn(p)
      return true
    }
  }
  return { default: { Events: { EventEmitter } } }
})

import { events } from '../src/core/events'
import { closeAllModals } from '../src/ui/modal'
import { initMissions, openMissions } from '../src/ui/missions'
import { uiState } from '../src/ui/state'

const row = (id: string) => document.querySelector<HTMLElement>(`[data-id="${id}"]`)!
const go = (id: string) => row(id).querySelector<HTMLButtonElement>('.ms-go')!

describe('the missions sheet', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="ui"></div>'
    uiState.unlocked = []
    uiState.flags = {}
    uiState.stats.discoveries = []
    uiState.quests = null
    initMissions()
  })

  afterEach(() => {
    closeAllModals()
  })

  it('lists every stop with what it gives', () => {
    openMissions()
    const rows = document.querySelectorAll('.ms-row')
    expect(rows).toHaveLength(8)
    expect(document.body.textContent).toContain('Career Coaster')
    // The names come from the blueprint, never retyped in the mission data.
    expect(row('coaster').textContent).toContain('Where I studied and where I have worked.')
  })

  it('marks the ticket as the next thing to do on a fresh save', () => {
    openMissions()
    const next = document.querySelector('.ms-row.next') as HTMLElement
    expect(next.textContent).toContain('Ticket Booth')
    expect(document.querySelectorAll('.ms-row.next')).toHaveLength(1)
  })

  it('says a stop needs the ticket first', () => {
    openMissions()
    expect(row('coaster').textContent).toContain('Ticket first')
  })

  it('asks the world to walk there and closes', () => {
    uiState.flags = { ticket: 1 }
    openMissions()
    const spy = vi.fn()
    const off = events.on('world:guide', spy)
    vi.useFakeTimers()
    go('coaster').click()
    off()
    expect(spy).toHaveBeenCalledWith({ id: 'coaster' })
    // The walk happens in the world: nothing of the sheet may be left over it.
    // The dialog goes inert at once and leaves the DOM when its fade is done.
    expect(document.querySelector('.missions')?.closest('.modal')?.hasAttribute('inert')).toBe(true)
    vi.advanceTimersByTime(400)
    vi.useRealTimers()
    expect(document.querySelector('.missions')).toBeNull()
  })

  it('sends a ticketless player to Bo instead', () => {
    openMissions()
    const spy = vi.fn()
    const off = events.on('world:guide', spy)
    go('coaster').click()
    off()
    expect(spy).toHaveBeenCalledWith({ id: 'gate' })
  })

  it('spells the status out for a screen reader', () => {
    openMissions()
    expect(row('gate').querySelector('.ms-status')?.textContent).toBe('Next')
  })

  it('says in words why a locked row goes somewhere else', () => {
    openMissions()
    // The redirect is never a surprise: the pill says the row needs a ticket,
    // the line under it says where the button is actually going to take you,
    // and the button says it a third time on its own face.
    expect(row('coaster').textContent).toContain('Ticket first')
    expect(row('coaster').querySelector('.ms-need')?.textContent).toMatch(/gate|Bo/i)
    expect(go('coaster').textContent).toMatch(/gate|Bo|ticket/i)
  })

  // The arrival cutscene hands the About chapter over before Bo has asked his
  // question, so a brand-new save really does reach the sheet with `about`
  // unlocked and no ticket. Read literally that ticks the gate off and leaves
  // nobody pointing anywhere — the very state this screen exists to prevent.
  it('still points at the gate when the story gave the About card away early', () => {
    uiState.unlocked = ['about']
    uiState.flags = {}
    openMissions()
    expect(row('gate').querySelector('.ms-status')?.textContent).toBe('Next')
    expect(document.querySelectorAll('.ms-row.next')).toHaveLength(1)
    expect(row('coaster').querySelector('.ms-status')?.textContent).toBe('Ticket first')
  })

  // Every stall stands inside the fence, the side ones included — so an "Open"
  // pill on a fresh save still means "no road to it yet". The row that is about
  // to send you somewhere else always says so, whatever its pill reads.
  it('warns a ticketless player off a side stall too, and walks them to Bo', () => {
    openMissions()
    expect(row('flight').querySelector('.ms-status')?.textContent).toBe('Open')
    expect(row('flight').querySelector('.ms-need')).not.toBeNull()
    const spy = vi.fn()
    const off = events.on('world:guide', spy)
    go('flight').click()
    off()
    expect(spy).toHaveBeenCalledWith({ id: 'gate' })
  })

  it('explains the turnstiles once, in full, at the top', () => {
    openMissions()
    expect(document.querySelector('.ms-gate')?.textContent).toMatch(/turnstiles/i)
  })

  it('drops the warning once the ticket is in hand', () => {
    uiState.flags = { ticket: 1 }
    openMissions()
    expect(document.querySelector('.ms-gate')).toBeNull()
    expect(document.querySelectorAll('.ms-need')).toHaveLength(0)
    for (const b of document.querySelectorAll('.ms-go')) expect(b.textContent).toContain('Take me there')
  })

  it('carries the standing promise that no game is an exam', () => {
    openMissions()
    expect(document.querySelector('.ms-note')?.textContent).toContain('show me')
  })

  it('never names a side stall as the next thing', () => {
    uiState.flags = { ticket: 1 }
    uiState.unlocked = ['about']
    openMissions()
    expect(document.querySelector('.ms-row.next')?.getAttribute('data-id')).toBe('coaster')
    expect(row('flight').querySelector('.ms-status')?.textContent).toBe('Open')
  })

  it('marks a finished stop done and still walks you back to it', () => {
    uiState.flags = { ticket: 1 }
    uiState.unlocked = ['about']
    openMissions()
    expect(row('gate').querySelector('.ms-status')?.textContent).toBe('Done')
    const spy = vi.fn()
    const off = events.on('world:guide', spy)
    go('gate').click()
    off()
    expect(spy).toHaveBeenCalledWith({ id: 'gate' })
  })

  it('gives every row a keyboard-reachable button', () => {
    openMissions()
    const buttons = document.querySelectorAll('.ms-row button.ms-go')
    expect(buttons).toHaveLength(8)
    for (const b of buttons) expect(b.tagName).toBe('BUTTON')
  })
})

describe('the guide bar', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="ui"></div>'
    uiState.unlocked = []
    uiState.flags = {}
    uiState.stats.discoveries = []
    initMissions()
  })

  const bar = () => document.querySelector<HTMLElement>('.ms-bar')!

  it('is hidden until the world says it is walking somewhere', () => {
    expect(bar().hidden).toBe(true)
  })

  it('names the stop in words while the walk is on', () => {
    events.emit('guide:state', { to: 'coaster' })
    expect(bar().hidden).toBe(false)
    expect(bar().textContent).toContain('Career Coaster')
  })

  it('goes away when the world reports it stopped', () => {
    events.emit('guide:state', { to: 'coaster' })
    events.emit('guide:state', { to: null })
    expect(bar().hidden).toBe(true)
  })

  it('never stacks a second bar or a second listener when the UI remounts', () => {
    initMissions()
    initMissions()
    events.emit('guide:state', { to: 'forge' })
    expect(document.querySelectorAll('.ms-bar')).toHaveLength(1)
    expect(bar().textContent).toContain('Word Forge')
  })
})

describe('the panel router opens the sheet', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="ui"></div>'
    uiState.unlocked = []
    uiState.flags = {}
    uiState.stats.discoveries = []
  })

  afterEach(() => {
    closeAllModals()
  })

  it('registers itself under the id the HUD button emits', async () => {
    const { initPanels } = await import('../src/ui/panels')
    initPanels()
    initMissions()
    events.emit('ui:panel', { id: 'missions' })
    expect(document.querySelector('.missions')).not.toBeNull()
  })
})
