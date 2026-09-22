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
  })

  it('takes the verb and the prompt of whatever is in range', () => {
    events.emit('ui:prompt', { text: 'Career Coaster', key: 'E', verb: 'RIDE' })
    expect(a().textContent).toContain('RIDE')
    expect(a().getAttribute('aria-label')).toBe('Career Coaster')
    expect(a().classList.contains('idle')).toBe(false)
  })

  it('falls back to a verb when the event carries none', () => {
    events.emit('ui:prompt', { text: 'Talk to Bo' })
    expect(a().textContent).toContain('TALK')
  })
})
