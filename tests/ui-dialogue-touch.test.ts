// @vitest-environment happy-dom
//
// Regression coverage for the dialogue continue arrow's touch tap target
// (`src/ui/dialogue.ts`, gated on `matchMedia('(pointer: coarse)').matches`).
// `.dlg-next` sits inside `.dlg-box`, whose own click handler already
// advances the conversation once typing has finished; the arrow's own click
// listener calls `e.stopPropagation()` so a tap does not fire that handler a
// second time. This file exists to catch a regression of that fix — without
// `stopPropagation()`, a single tap advances two lines instead of one.
//
// The touch check runs once, inside `ensure()`, the first time the box is
// built — so `matchMedia` has to already be mocked before this file's first
// `openDialogue()`/`initDialogue()` call, which is why it is a separate file
// from `tests/ui-nudge.test.ts` rather than another describe block in it.
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

// Force the coarse-pointer branch before dialogue.ts's `ensure()` ever runs.
vi.stubGlobal(
  'matchMedia',
  (query: string) =>
    ({
      matches: query.includes('coarse'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList,
)

import { sfx } from '../src/audio/sfx'
import { DialogueRunner, type Ctx, type Tree } from '../src/systems/Dialogue'
import { initDialogue, isDialogueOpen, openDialogue } from '../src/ui/dialogue'
import { uiState } from '../src/ui/state'

const ctx: Ctx = { check: () => true, apply: () => {} }
const tree: Tree = {
  id: 't',
  entry: [{ node: 'a' }],
  nodes: { a: { lines: [{ who: 'Bo', text: 'One.' }, { who: 'Bo', text: 'Two.' }] } },
}

/** End any dangling session so each test starts clean. */
const flushDialogue = () => {
  const r = new DialogueRunner({ id: 'x', entry: [{ node: 'a' }], nodes: { a: { lines: [{ who: 'x', text: 'y' }] } } }, ctx)
  r.advance()
  void openDialogue(r)
}

describe('dialogue continue arrow — touch tap target', () => {
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

  it('gets a real role, tab stop and accessible name on a coarse pointer', () => {
    void openDialogue(new DialogueRunner(tree, ctx))
    const next = document.querySelector('.dlg-next') as HTMLElement
    expect(next.getAttribute('role')).toBe('button')
    expect(next.tabIndex).toBe(0)
    expect(next.textContent).toBe('Tap to continue')
    expect(next.hasAttribute('aria-hidden')).toBe(false)
  })

  it('advances exactly one line on a tap — a second act() would skip a line', () => {
    void openDialogue(new DialogueRunner(tree, ctx))
    const next = document.querySelector('.dlg-next') as HTMLElement
    const typed = document.querySelector('.dlg-typed') as HTMLElement

    vi.advanceTimersByTime(1000)
    expect(typed.textContent).toBe('One.')
    expect(next.hidden).toBe(false)

    next.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    // The regression this guards against: without `stopPropagation()` in the
    // arrow's own click handler, this same tap would also bubble to
    // `.dlg-box`'s delegated handler, which — seeing `current.typing` already
    // true from the `act()` the arrow's own listener just ran — would call
    // `completeLine()` a second time and type line 2 out instantly on one
    // tap, so these two checks would see 'Two.' / not-hidden here instead.
    expect(typed.textContent).toBe('')
    expect(next.hidden).toBe(true)

    vi.advanceTimersByTime(1000)
    expect(typed.textContent).toBe('Two.') // still types out normally afterwards
    expect(isDialogueOpen()).toBe(true) // this 2-line tree has no `next`/choices — one more act() to end it
  })

  it('clears the nudge when the conversation ends while the arrow is showing', () => {
    void openDialogue(new DialogueRunner(tree, ctx))
    const next = document.querySelector('.dlg-next') as HTMLElement
    vi.advanceTimersByTime(1000) // line 1 done — nudge on
    expect(next.classList.contains('nudge')).toBe(true)
    next.dispatchEvent(new MouseEvent('click', { bubbles: true })) // → line 2
    vi.advanceTimersByTime(1000) // line 2 done — nudge on again, and it is the last line
    expect(next.classList.contains('nudge')).toBe(true)
    next.dispatchEvent(new MouseEvent('click', { bubbles: true })) // → ends the conversation
    expect(isDialogueOpen()).toBe(false)
    expect(next.classList.contains('nudge')).toBe(false)
  })
})
