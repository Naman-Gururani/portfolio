// The résumé record is public and Naman's manager can open it. These tests hold
// it to the facts in the v6 spec (§3) and to the rules a public page lives by:
// no application talk, no bank-internal detail, no placeholders.
import { describe, expect, it } from 'vitest'
import * as R from '../src/data/resume'
import { BANNED } from './helpers/banned'

const ALL = JSON.stringify(R)

const hrefs = (v: unknown): string[] =>
  v && typeof v === 'object'
    ? Object.entries(v as Record<string, unknown>).flatMap(([k, x]) =>
        k === 'href' && typeof x === 'string' ? [x] : hrefs(x),
      )
    : []

describe('the résumé record', () => {
  it('names the role exactly as Naman chose it', () => {
    expect(R.PERSON.title).toBe('Data and Backend Engineer')
    expect(R.PERSON.employer).toBe('Barclays')
  })

  it('shows the internship, full-time start and promotion as dated steps, newest first', () => {
    const roles = R.EXPERIENCE.roles
    expect(roles).toHaveLength(3)
    const intern = roles[2]
    expect(intern.from).toBe('2023-06')
    expect(intern.to).toBe('2023-08')
    expect(roles[1].from).toBe('2024-08')
    expect(roles[0].to).toBeNull()
    expect(roles[0].grade).toBe('BA4')
    expect(roles[1].grade).toBe('BA3')
  })

  it('reports grades as issued and the rank as certified, with no cohort size', () => {
    expect(R.EDUCATION.cgpa).toBe('9.63 / 10')
    expect(R.EDUCATION.rank).toMatch(/top 5%/i)
    // The batch years are fine; a head count ("of 4,000 students") is not.
    expect(R.EDUCATION.rank.replace('2020–2024', '')).not.toMatch(/\d{3,}|\d,\d{3}/)
  })

  it('carries four impact numbers, each with its basis', () => {
    expect(R.METRICS).toHaveLength(4)
    for (const m of R.METRICS) expect(m.basis.length).toBeGreaterThan(10)
  })

  it('links only over https or mailto', () => {
    const all = [...hrefs(R), R.PERSON.github, R.PERSON.linkedin, R.PERSON.site, R.PERSON.blog]
    expect(all.length).toBeGreaterThan(8)
    for (const h of all) expect(h).toMatch(/^(https:\/\/|mailto:|\/portfolio\/)/)
  })

  it('never mentions applications, tests or target schools', () => {
    expect(ALL).not.toMatch(BANNED)
  })

  it('keeps bank detail at orders of magnitude, with no internal names or placeholders', () => {
    expect(ALL).not.toMatch(/750|Ab Initio|TODO|TBD|lorem/i)
  })

  it('names Enlacey at its true stage', () => {
    const e = R.PROJECTS.find((p) => p.id === 'enlacey')!
    expect(e.summary + e.points.join(' ')).toMatch(/Google Play/)
    expect(e.links.some((l) => l.href.includes('play.google.com/store/apps/details?id=com.enlacey.app'))).toBe(true)
  })
})

describe('review fixes (v6 final review)', () => {
  it('words the rank as certified everywhere, including the summary', () => {
    expect(R.PERSON.summary).toMatch(/top 5% of rank holders/i)
    expect(ALL).not.toMatch(/top 5% of (my )?batch/i)
  })

  it('claims only what the fact sheet supports', () => {
    for (const p of [/made their standard/i, /taught myself/i, /after a year/i, /days late/i, /first major delivery/i, /support teams follow/i, /coordinated the teammates/i])
      expect(ALL).not.toMatch(p)
    const rep = R.ACTIVITIES.find((a) => a.what === 'Class representative')!
    expect(rep.when).not.toMatch(/\d/)
  })
})
