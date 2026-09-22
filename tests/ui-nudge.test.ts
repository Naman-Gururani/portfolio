// @vitest-environment happy-dom
//
// The nudge: one shared "this is the thing to press" treatment (a ring drawn
// by `.nudge` in ui.css), applied and removed by six renderers. This file
// proves the class shows up exactly when — and only when — its control is
// the thing to press, at every call site.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// `core/events` builds its emitter from `Phaser.Events.EventEmitter` at import
// time, and Phaser's canvas feature probe dies against happy-dom's stub — the
// same shim every other ui/* suite installs before touching the bus (see
// tests/ui-modal.test.ts).
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

import { sfx } from '../src/audio/sfx'
import { events } from '../src/core/events'
import { COASTER_STOPS } from '../src/data/coaster'
import { DialogueRunner, type Ctx, type Tree } from '../src/systems/Dialogue'
import { initDialogue, openDialogue } from '../src/ui/dialogue'
import { closeAllModals } from '../src/ui/modal'
import { initMap } from '../src/ui/map'
import { initPanels } from '../src/ui/panels'
import { initPrompt } from '../src/ui/prompt'
import { initRidecard } from '../src/ui/ridecard'
import { uiState } from '../src/ui/state'
import { initTouch } from '../src/ui/touch'
import { initWelcome, isWelcomeOpen } from '../src/ui/welcome'

const root = () => document.getElementById('ui') as HTMLElement

describe('the nudge', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="ui"></div>'
    initTouch(root())
  })

  it('blinks the action button only while something is in reach', () => {
    const a = root().querySelector('.tb-a') as HTMLElement
    events.emit('ui:prompt', { text: null })
    expect(a.classList.contains('nudge')).toBe(false)
    events.emit('ui:prompt', { text: 'Career Coaster', verb: 'RIDE' })
    expect(a.classList.contains('nudge')).toBe(true)
    events.emit('ui:prompt', { text: null })
    expect(a.classList.contains('nudge')).toBe(false)
  })
})

describe('the nudge — desktop prompt chip', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="ui"></div>'
    initPrompt(root())
  })

  it('marks the key chip to nudge whenever a prompt is shown, and takes the chip off screen when it is not', () => {
    events.emit('ui:prompt', { text: 'Talk to Bo', key: 'E' })
    expect(root().querySelector('.pkey')?.classList.contains('nudge')).toBe(true)
    // Nothing in reach hides the whole chip. (Asserting the `.pkey` is absent
    // *before* the first prompt would pass on an empty overlay and prove
    // nothing; what matters is that the ring goes away again.)
    events.emit('ui:prompt', { text: null })
    expect(root().querySelector('.prompt')?.classList.contains('show')).toBe(false)
  })
})

describe('the nudge — dialogue continue', () => {
  const ctx: Ctx = { check: () => true, apply: () => {} }
  const tree: Tree = { id: 't', entry: [{ node: 'a' }], nodes: { a: { lines: [{ who: 'Bo', text: 'Hi there.' }] } } }

  /** End any dangling session so the file's other describes start clean. */
  const flushDialogue = () => {
    const r = new DialogueRunner({ id: 'x', entry: [{ node: 'a' }], nodes: { a: { lines: [{ who: 'x', text: 'y' }] } } }, ctx)
    r.advance()
    void openDialogue(r)
  }

  beforeEach(() => {
    document.body.innerHTML = '<div id="ui"></div>'
    uiState.settings.reducedMotion = true // synchronous hide on finish
    uiState.settings.textSpeed = 'fast'
    uiState.faces = () => ''
    vi.useFakeTimers()
    for (const k of ['open', 'close', 'select', 'blip', 'pickup'] as const) vi.spyOn(sfx, k).mockImplementation(() => {})
    initDialogue()
  })

  afterEach(() => {
    flushDialogue()
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('nudges the continue cue once a line finishes typing, not before', () => {
    const runner = new DialogueRunner(tree, ctx)
    void openDialogue(runner)
    const next = document.querySelector('.dlg-next') as HTMLElement
    expect(next.hidden).toBe(true)
    expect(next.classList.contains('nudge')).toBe(false)
    vi.advanceTimersByTime(1000) // finishes 'Hi there.' at fast speed either way
    expect(next.hidden).toBe(false)
    expect(next.classList.contains('nudge')).toBe(true)
  })

  it('clears the nudge again once choices take over', () => {
    const withChoices: Tree = {
      id: 'c',
      entry: [{ node: 'a' }],
      nodes: { a: { lines: [{ who: 'Bo', text: 'Well?' }], choices: [{ text: 'Yes', next: 'a' }] } },
    }
    const runner = new DialogueRunner(withChoices, ctx)
    void openDialogue(runner)
    const next = document.querySelector('.dlg-next') as HTMLElement
    vi.advanceTimersByTime(1000)
    expect(next.classList.contains('nudge')).toBe(true) // line done, nothing chosen yet
    document.querySelector('.dlg-box')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(next.hidden).toBe(true)
    expect(next.classList.contains('nudge')).toBe(false)
  })
})

describe('the nudge — ride card Next', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="game-root"></div><div id="ui"></div>'
    document.body.className = ''
    uiState.settings.reducedMotion = true
    closeAllModals()
    initPanels()
    initRidecard()
  })

  it('carries the nudge whenever a beat is up, and only then', () => {
    // Next is minted with the ring on it and never loses the class, so what
    // decides whether the ring is *on screen* is the card's own `hidden` —
    // that is what this asserts, in both directions. (`reducedMotion` is on
    // above, so the card hides without waiting out its slide.)
    const next0 = document.querySelector('.ride-next') as HTMLElement
    expect(next0.classList.contains('nudge')).toBe(true)
    expect((document.querySelector('.ride-card') as HTMLElement).hidden).toBe(true)
    events.emit('ui:panel', { id: 'ridecard', data: COASTER_STOPS[0] })
    const card = document.querySelector('.ride-card') as HTMLElement
    expect(card.hidden).toBe(false)
    events.emit('ui:panel', { id: 'ridecard', data: null })
    expect(card.hidden).toBe(true)
  })
})

describe('the nudge — welcome Start', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="game-root"></div><div id="ui"></div>'
    document.body.className = ''
    localStorage.clear()
    for (const k of ['open', 'close', 'select', 'blip', 'resume'] as const) vi.spyOn(sfx, k).mockImplementation(() => {})
    initWelcome(document.getElementById('ui')!)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('nudges Start while the welcome card is open, and not once it is gone', () => {
    // Start is minted with the ring and keeps the class for the session, so —
    // as with the ride card — the behaviour under test is the card's own
    // visibility: the ring is on screen exactly while the card is.
    const start = document.querySelector('.welcome-actions .primary') as HTMLElement
    expect(start.classList.contains('nudge')).toBe(true)
    expect(isWelcomeOpen()).toBe(false)
    events.emit('ui:title', { hasSave: false })
    expect(isWelcomeOpen()).toBe(true)
    ;(start as HTMLButtonElement).click()
    expect(isWelcomeOpen()).toBe(false)
  })
})

describe('the nudge — map Travel', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="game-root"></div><div id="ui"></div>'
    document.body.className = ''
    uiState.settings.reducedMotion = true
    uiState.stats.discoveries = []
    uiState.flags = {}
    uiState.minimapURL = ''
    uiState.player = { x: 0, y: 0 }
    uiState.objective = null
    for (const k of ['open', 'close', 'select', 'blip'] as const) vi.spyOn(sfx, k).mockImplementation(() => {})
    initPanels()
    initMap()
  })

  afterEach(() => {
    closeAllModals()
    uiState.stats.discoveries = []
    uiState.objective = null
    vi.restoreAllMocks()
  })

  it('nudges Travel only once a discovered place is selected', () => {
    uiState.stats.discoveries = ['duckpond']
    events.emit('ui:panel', { id: 'map' })
    const travel = document.querySelector('.map-travel') as HTMLButtonElement
    expect(travel.classList.contains('nudge')).toBe(false)

    ;(document.querySelector('.map-lm[data-id="duckpond"]') as HTMLButtonElement).click()
    expect(travel.disabled).toBe(false)
    expect(travel.classList.contains('nudge')).toBe(true)

    ;(document.querySelector('.map-lm[data-id="forge"]') as HTMLButtonElement).click() // undiscovered
    expect(travel.disabled).toBe(true)
    expect(travel.classList.contains('nudge')).toBe(false)
  })
})
