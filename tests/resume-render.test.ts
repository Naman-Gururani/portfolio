// The résumé is rendered at build time, so with JavaScript off — or for a
// crawler, an ATS or an LLM screener — the page is already complete. These
// tests read the rendered markup the way those readers would.
// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { EDUCATION, PERSON, PROJECTS, PUBLICATION } from '../src/data/resume'
import { renderHead, renderResume } from '../src/resume/render'
import { BANNED } from './helpers/banned'

const body = renderResume()
const head = renderHead()
const doc = new DOMParser().parseFromString(`<!doctype html><html><head>${head}</head><body>${body}</body></html>`, 'text/html')
const text = doc.body.textContent ?? ''

const SECTIONS = ['top', 'impact', 'experience', 'projects', 'play', 'education', 'publication', 'leadership', 'writing', 'skills', 'contact']

describe('renderResume', () => {
  it('has every section the nav and the spy rely on', () => {
    for (const id of SECTIONS) expect(doc.getElementById(id), `#${id}`).not.toBeNull()
  })

  it('has exactly one h1, the name', () => {
    const h1 = doc.querySelectorAll('h1')
    expect(h1).toHaveLength(1)
    expect(h1[0].textContent?.trim()).toBe(PERSON.name)
  })

  it('states the facts a reader scans for', () => {
    for (const f of [PERSON.title, 'Barclays', EDUCATION.cgpa, EDUCATION.rank, PUBLICATION.title, 'Promoted'])
      expect(text, f).toContain(f)
    for (const p of PROJECTS) expect(text, p.name).toContain(p.name)
  })

  it('links to the game from the top ribbon and the ticket', () => {
    expect(doc.querySelector('a.ribbon')?.getAttribute('href')).toBe('/portfolio/play/')
    expect(doc.querySelector('a.ticket')?.getAttribute('href')).toBe('/portfolio/play/')
  })

  it('has the controls the script wires up', () => {
    for (const sel of ['.cred', '.cred-foil', '.cred-glare', 'nav.bar', '[data-copy-email]', '[data-print]', '[data-theme-toggle]'])
      expect(doc.querySelector(sel), sel).not.toBeNull()
    expect(doc.querySelectorAll('nav.bar a[href^="#"]').length).toBeGreaterThanOrEqual(6)
  })

  it('marks every date up as a <time>', () => {
    const times = [...doc.querySelectorAll('time')]
    expect(times.length).toBeGreaterThanOrEqual(4)
    for (const t of times) expect(t.getAttribute('datetime')).toMatch(/^\d{4}(-\d{2})?(-\d{2})?$/)
  })

  it('opens external links safely', () => {
    for (const a of doc.querySelectorAll('a[target="_blank"]')) expect(a.getAttribute('rel')).toContain('noopener')
  })

  it('never mentions applications, tests or target schools', () => {
    expect(body).not.toMatch(BANNED)
    // `application/ld+json` is a MIME type, not application talk.
    expect(head.split('application/ld+json').join('')).not.toMatch(BANNED)
  })

  it('escapes what it interpolates', () => {
    expect(body).not.toMatch(/<script/i)
    expect(body).toContain('Naman’s World Fair')
  })
})

describe('renderHead', () => {
  it('titles the page with the name and the role', () => {
    expect(doc.title).toBe(`${PERSON.name} — ${PERSON.title}`)
  })

  it('carries a canonical URL and link-preview tags', () => {
    expect(doc.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe('https://naman-gururani.github.io/portfolio/')
    const og = (p: string) => doc.querySelector(`meta[property="${p}"]`)?.getAttribute('content')
    expect(og('og:image')).toBe('https://naman-gururani.github.io/portfolio/og.jpg')
    expect(og('og:title')).toContain(PERSON.name)
    expect(doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image')
    expect(doc.querySelector('meta[name=description]')?.getAttribute('content')?.length).toBeGreaterThan(60)
  })

  it('describes Naman to search engines as structured data', () => {
    const raw = doc.querySelector('script[type="application/ld+json"]')?.textContent ?? ''
    const ld = JSON.parse(raw)
    expect(ld['@type']).toBe('ProfilePage')
    expect(ld.mainEntity['@type']).toBe('Person')
    expect(ld.mainEntity.jobTitle).toBe(PERSON.title)
    expect(ld.mainEntity.sameAs).toContain(PERSON.github)
  })
})

describe('review fixes (v6 final review)', () => {
  it('shows the certified rank and plain dates on the credential', () => {
    const facts = doc.querySelector('.cred-facts')?.textContent ?? ''
    expect(facts).toContain('Top 5% of 4,000+')
    expect(facts).toContain('since Aug 2024')
    expect(facts).not.toMatch(/BA4/)
  })

  it('describes the ticket picture as it is', () => {
    const alt = doc.querySelector('.ticket img')?.getAttribute('alt') ?? ''
    expect(alt).toMatch(/fountain/i)
    expect(alt).not.toMatch(/Ferris|rollercoaster/i)
  })
})

describe('open to roles (Naman, 2026-11-16)', () => {
  it('says plainly, near the top and at the end, that Naman is open to new roles', () => {
    expect(doc.querySelector('.hero .open')?.textContent).toMatch(/Open to new roles/)
    expect(doc.querySelector('#contact')?.textContent).toMatch(/Looking for a backend, data or Java engineer\?/)
  })
})
