// @vitest-environment happy-dom
//
// "Always have an option to mute the sound handy on the screen" — a fourth
// button in the HUD's top-right tool cluster, right after Map / Journal / Menu.
// One tap silences sfx and the soundtrack without moving the volume sliders
// underneath (`ui-welcome`/Settings own those), so a second tap brings sound
// back exactly where it was.
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

// The atlas is painted by BootScene, long after the HUD mounts.
vi.mock('../src/art/atlas', () => ({ frameDataURL: () => '' }))

import { sfx } from '../src/audio/sfx'
import { events } from '../src/core/events'
import { defaultSettings, loadSettings } from '../src/core/save'
import { initHud } from '../src/ui/hud'
import { uiState } from '../src/ui/state'

const muteBtn = () => document.querySelector<HTMLButtonElement>('[data-act="mute"]')!
const glyph = () => muteBtn().querySelector('i')!.textContent

describe('HUD mute button', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="game-root"></div><div id="ui"></div>'
    localStorage.clear()
    uiState.settings = defaultSettings()
    vi.spyOn(sfx, 'setMuted')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('is the last tool button, right after Menu, off by default', () => {
    initHud(document.getElementById('ui')!)
    const tools = document.querySelectorAll('.hud-tools .hbtn')
    // Missions · Map · Journal · Menu · Sound — Missions leads the cluster
    // because "what do I do here?" is the question people arrive with.
    expect(tools).toHaveLength(5)
    expect([...tools].map((t) => t.getAttribute('data-act'))).toEqual(['missions', 'map', 'journal', 'menu', 'mute'])
    expect(tools[4]).toBe(muteBtn())
    expect(tools[3].getAttribute('data-act')).toBe('menu')
    expect(muteBtn().getAttribute('aria-pressed')).toBe('false')
    expect(muteBtn().title).toBe('Mute sound')
    expect(glyph()).toBe('🔊')
    // Same markup shape as its siblings, so the narrow-viewport rule that hides
    // `.hbtn span` and leaves the icon already covers this button too.
    expect(muteBtn().querySelector('span')?.textContent).toBe('Sound')
  })

  it('mutes on click: pressed, glyph flips, sfx muted, and the choice is saved', () => {
    initHud(document.getElementById('ui')!)
    muteBtn().click()
    expect(muteBtn().getAttribute('aria-pressed')).toBe('true')
    expect(glyph()).toBe('🔇')
    expect(muteBtn().title).toBe('Unmute sound')
    expect(sfx.setMuted).toHaveBeenLastCalledWith(true)
    expect(loadSettings().muted).toBe(true)
  })

  it('unmutes on the second click, restoring sfx and the saved flag', () => {
    initHud(document.getElementById('ui')!)
    muteBtn().click()
    muteBtn().click()
    expect(muteBtn().getAttribute('aria-pressed')).toBe('false')
    expect(glyph()).toBe('🔊')
    expect(muteBtn().title).toBe('Mute sound')
    expect(sfx.setMuted).toHaveBeenLastCalledWith(false)
    expect(loadSettings().muted).toBe(false)
  })

  it('mutes without touching the volume sliders underneath', () => {
    uiState.settings = { ...defaultSettings(), master: 0.5, music: 0.4, sfx: 0.3 }
    initHud(document.getElementById('ui')!)
    muteBtn().click()
    expect(uiState.settings.master).toBe(0.5)
    expect(uiState.settings.music).toBe(0.4)
    expect(uiState.settings.sfx).toBe(0.3)
    const saved = loadSettings()
    expect(saved.master).toBe(0.5)
    expect(saved.music).toBe(0.4)
    expect(saved.sfx).toBe(0.3)
  })

  it('starts pressed when a stored setting already says the fair is muted', () => {
    uiState.settings = { ...defaultSettings(), muted: true }
    initHud(document.getElementById('ui')!)
    expect(muteBtn().getAttribute('aria-pressed')).toBe('true')
    expect(glyph()).toBe('🔇')
    expect(muteBtn().title).toBe('Unmute sound')
  })
})

describe('HUD buttons hand focus back to the game', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="game-root"></div><div id="ui" tabindex="-1"></div>'
    localStorage.clear()
    uiState.settings = defaultSettings()
    vi.spyOn(sfx, 'setMuted')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const pointerClick = (el: HTMLElement) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }))
  const keyboardClick = (el: HTMLElement) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 0 }))

  it('drops focus after a pointer click, so the next Space reaches the world instead of the button', () => {
    initHud(document.getElementById('ui')!)
    const b = muteBtn()
    b.focus()
    expect(document.activeElement).toBe(b)
    pointerClick(b)
    expect(b.getAttribute('aria-pressed')).toBe('true') // the click itself still counts
    expect(document.activeElement).not.toBe(b)
  })

  it('does the same for the Map button', () => {
    initHud(document.getElementById('ui')!)
    const map = document.querySelector<HTMLButtonElement>('[data-act="map"]')!
    map.focus()
    pointerClick(map)
    expect(document.activeElement).not.toBe(map)
  })

  it('keeps focus on a keyboard activation, so Tab users stay on the bar', () => {
    initHud(document.getElementById('ui')!)
    const b = muteBtn()
    b.focus()
    keyboardClick(b)
    expect(b.getAttribute('aria-pressed')).toBe('true')
    expect(document.activeElement).toBe(b)
  })
})

// "People are finding it hard to navigate around the game." The Missions button
// leads the tool cluster, and the objective chip — the one thing on the HUD that
// already says where to go — opens the same sheet rather than a map to read.
describe('HUD Missions button', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="game-root"></div><div id="ui" tabindex="-1"></div>'
    localStorage.clear()
    uiState.settings = defaultSettings()
    uiState.objective = { step: 'gate', text: 'Ticket Booth', landmark: 'gate', tx: 35, ty: 53 }
    vi.useFakeTimers()
    initHud(document.getElementById('ui')!)
  })

  afterEach(() => {
    vi.useRealTimers()
    uiState.objective = null
  })

  const missions = () => document.querySelector<HTMLButtonElement>('[data-act="missions"]')!
  const chip = () => document.querySelector<HTMLButtonElement>('.hud-objective')!

  it('asks the scene for the missions panel, like every tool beside it', () => {
    const spy = vi.fn()
    const off = events.on('world:action', spy)
    missions().click()
    off()
    expect(spy).toHaveBeenCalledWith({ action: 'missions' })
  })

  it('sends the objective chip to the sheet instead of the map', () => {
    const spy = vi.fn()
    const off = events.on('world:action', spy)
    chip().click()
    off()
    expect(spy).toHaveBeenCalledWith({ action: 'missions' })
  })

  it('blinks when the story moves on, and stops on its own', () => {
    expect(missions().classList.contains('nudge')).toBe(false)
    events.emit('story:changed', { next: 'coaster' })
    expect(missions().classList.contains('nudge')).toBe(true)
    vi.advanceTimersByTime(3600)
    expect(missions().classList.contains('nudge')).toBe(false)
  })

  it('stops blinking the moment the sheet is opened', () => {
    events.emit('story:changed', { next: 'coaster' })
    events.emit('ui:panel', { id: 'missions' })
    expect(missions().classList.contains('nudge')).toBe(false)
  })

  it('drops focus after a pointer click, like the rest of the bar', () => {
    const b = missions()
    b.focus()
    b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }))
    expect(document.activeElement).not.toBe(b)
  })
})
