// The résumé's small script: pure helpers for the tilt, the skins and the
// section spy, plus the copy-email button as a reader would use it.
// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PERSON } from '../src/data/resume'
import { activeSection } from '../src/resume/spy'
import { initialTheme, nextTheme } from '../src/resume/theme'
import { tiltFor } from '../src/resume/tilt'
import { wireCopy } from '../src/resume/copy'

const RECT = { left: 100, top: 200, width: 400, height: 300 }

describe('tiltFor', () => {
  it('is level, with the light in the middle, at the centre', () => {
    expect(tiltFor(300, 350, RECT)).toEqual({ rx: 0, ry: 0, mx: 50, my: 50 })
  })

  it('leans toward the pointer and never past the limit', () => {
    const tl = tiltFor(100, 200, RECT)
    expect(tl).toEqual({ rx: 10, ry: -10, mx: 0, my: 0 })
    const far = tiltFor(5000, 5000, RECT)
    expect(far.rx).toBe(-10)
    expect(far.ry).toBe(10)
    expect(far.mx).toBe(100)
    expect(far.my).toBe(100)
  })

  it('takes a smaller limit', () => {
    expect(Math.abs(tiltFor(100, 200, RECT, 4).ry)).toBe(4)
  })
})

describe('skins', () => {
  it('opens dark whatever the system prefers', () => {
    expect(initialTheme(null)).toBe('dark')
    expect(initialTheme('junk')).toBe('dark')
    expect(initialTheme('dark')).toBe('dark')
  })

  it('keeps a reader’s chosen light skin', () => {
    expect(initialTheme('light')).toBe('light')
  })

  it('flips', () => {
    expect(nextTheme('dark')).toBe('light')
    expect(nextTheme('light')).toBe('dark')
  })
})

describe('activeSection', () => {
  const tops = [
    { id: 'experience', top: 100 },
    { id: 'projects', top: 900 },
    { id: 'education', top: 1600 },
  ]

  it('is the last section whose top has passed the line', () => {
    expect(activeSection(tops, 120)).toBe('experience')
    expect(activeSection(tops, 1000)).toBe('projects')
    expect(activeSection(tops, 5000)).toBe('education')
  })

  it('is nothing above the first section', () => {
    expect(activeSection(tops, 50)).toBe('')
  })
})

describe('copy email', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = `<button data-copy-email data-email="${PERSON.email}">x</button>`
  })
  afterEach(() => vi.useRealTimers())

  it('puts the address on the clipboard and says so for a moment', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const btn = document.querySelector<HTMLButtonElement>('[data-copy-email]')!
    wireCopy(document, { writeText })
    btn.click()
    await vi.advanceTimersByTimeAsync(0)
    expect(writeText).toHaveBeenCalledWith(PERSON.email)
    expect(btn.hasAttribute('data-copied')).toBe(true)
    await vi.advanceTimersByTimeAsync(1700)
    expect(btn.hasAttribute('data-copied')).toBe(false)
  })

  it('falls back to opening mail when the clipboard refuses', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    const open = vi.fn()
    const btn = document.querySelector<HTMLButtonElement>('[data-copy-email]')!
    wireCopy(document, { writeText }, open)
    btn.click()
    await vi.advanceTimersByTimeAsync(0)
    expect(open).toHaveBeenCalledWith(`mailto:${PERSON.email}`)
  })
})
