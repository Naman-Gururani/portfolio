// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'

// `core/events` constructs its emitter from `Phaser.Events.EventEmitter` at
// import time, and Phaser's canvas feature probe dies against happy-dom's
// stub — the same shim every other ui/* suite installs before touching the
// bus (see tests/ui-modal.test.ts).
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
import { initTouch } from '../src/ui/touch'

const root = () => document.getElementById('ui') as HTMLElement
const a = () => root().querySelector('.tb-a') as HTMLButtonElement

describe('touch buttons', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="ui"></div>'
    initTouch(root())
  })

  it('names the hop button', () => {
    expect((root().querySelector('.tb-b') as HTMLElement).textContent).toContain('JUMP')
  })

  it('shows the swing label with nothing in range', () => {
    events.emit('ui:prompt', { text: null })
    expect(a().textContent).toContain('SWING')
    expect(a().classList.contains('idle')).toBe(true)
    expect(a().classList.contains('nudge')).toBe(false)
  })

  it('takes the verb and the prompt of whatever is in range', () => {
    events.emit('ui:prompt', { text: 'Career Coaster', key: 'E', verb: 'RIDE' })
    expect(a().textContent).toContain('RIDE')
    // The face has room for the verb; the label has room for the sentence, and
    // a reader has nothing else to go on.
    expect(a().getAttribute('aria-label')).toBe('Ride the Career Coaster')
    expect(a().classList.contains('idle')).toBe(false)
    expect(a().classList.contains('nudge')).toBe(true)
  })

  it('does not say the verb twice when the prompt is already a sentence', () => {
    events.emit('ui:prompt', { text: 'Talk to Bo' })
    expect(a().getAttribute('aria-label')).toBe('Talk to Bo')
  })

  it('names the wrench swing when nothing is in reach', () => {
    events.emit('ui:prompt', { text: 'Career Coaster', verb: 'RIDE' })
    events.emit('ui:prompt', { text: null })
    expect(a().getAttribute('aria-label')).toBe('Swing the wrench')
  })

  it('falls back to a verb when the event carries none', () => {
    events.emit('ui:prompt', { text: 'Talk to Bo' })
    expect(a().textContent).toContain('TALK')
  })

  // The interact prompt is the only place the thing in reach is named, and at
  // its resting height it sits half under the JUMP button. It cannot see the
  // button row — `initPrompt` runs first, so the prompt is the earlier sibling
  // and no `~` rule reaches it — so the overlay root carries the fact for it.
  it('flags the overlay root while the button row is on screen', () => {
    const setTouch = (window as unknown as { __setTouch: (v: 'auto' | 'on' | 'off') => void }).__setTouch
    setTouch('on')
    expect(root().classList.contains('touch-on')).toBe(true)
    setTouch('off')
    expect(root().classList.contains('touch-on')).toBe(false)
  })

  it('drops the flag at the title, where the buttons are hidden too', () => {
    const setTouch = (window as unknown as { __setTouch: (v: 'auto' | 'on' | 'off') => void }).__setTouch
    setTouch('on')
    document.body.classList.add('at-title')
    setTouch('on')
    expect(root().querySelector('.touch')?.classList.contains('hidden')).toBe(true)
    expect(root().classList.contains('touch-on')).toBe(false)
    document.body.classList.remove('at-title')
  })
})
