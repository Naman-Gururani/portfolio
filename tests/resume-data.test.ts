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
    // written with "&" since v6.1 (Naman, 2026-11-16)
    expect(R.PERSON.title).toBe('Data & Backend Engineer')
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

  it('reports grades as issued and the rank as certified, with the batch size Naman gave', () => {
    expect(R.EDUCATION.cgpa).toBe('9.63 / 10')
    expect(R.EDUCATION.rank).toMatch(/top 5%/i)
    // The certificate states no size; Naman looked it up (2026-11-16): 4,000+.
    expect(R.EDUCATION.rank).toContain('4,000+ students')
    // …and it lives in Education, not in the intro or on the card (v6.1)
    expect(JSON.stringify(R.PERSON) + JSON.stringify(R.CARD)).not.toMatch(/top 5%|rank/i)
  })

  it('keeps the impact numbers inside the Barclays chapters they come from', () => {
    const metrics = R.JOURNEY.flatMap((c) => c.metrics)
    expect(metrics).toHaveLength(5)
    for (const m of metrics) expect(m.value && m.label).toBeTruthy()
  })

  it('links only over https or mailto', () => {
    const all = [...hrefs(R), R.PERSON.github, R.PERSON.linkedin, R.PERSON.site, R.PERSON.blog]
    expect(all.length).toBeGreaterThan(8)
    for (const h of all) expect(h).toMatch(/^(https:\/\/|mailto:|\/portfolio\/|#)/)
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
    expect(R.EDUCATION.rank).toMatch(/top 5% of rank holders/i)
    expect(ALL).not.toMatch(/top 5% of (my )?batch/i)
  })

  // v6.1: Naman pointed to the college folder (the Barclays letter draft) for the
  // year-by-year work, so the "first big delivery" line is sourced now; these stay out.
  it('claims only what the fact sheet supports', () => {
    for (const p of [/made their standard/i, /taught myself/i, /after a year/i, /days late/i, /support teams follow/i, /coordinated the teammates/i])
      expect(ALL).not.toMatch(p)
    const rep = R.ACTIVITIES.find((a) => a.what === 'Class representative')!
    expect(rep.when).not.toMatch(/\d/)
  })
})
