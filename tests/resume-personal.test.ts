// v6.1 — Naman's feedback on the live page (16 Nov 2026), pinned:
// the intro is about him, not his job; the card shows what a normal reader
// cares about; projects come first; the Barclays years are chapters that open
// as you scroll; real interests; blog tiles; relevant coursework.
// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import * as R from '../src/data/resume'
import { renderResume } from '../src/resume/render'
import { reachedChapters } from '../src/resume/journey'

const doc = new DOMParser().parseFromString(`<!doctype html><body>${renderResume()}</body>`, 'text/html')
const text = (sel: string) => doc.querySelector(sel)?.textContent?.replace(/\s+/g, ' ').trim() ?? ''

describe('the order Naman asked for', () => {
  it('runs intro, ticket, projects, blog, education, experience, leadership, skills, contact', () => {
    const ids = [...doc.querySelectorAll('main > section[id]')].map((s) => s.id)
    expect(ids).toEqual(['top', 'play', 'projects', 'blog', 'education', 'experience', 'leadership', 'skills', 'contact'])
  })

  it('has no stand-alone numbers or writing section any more', () => {
    for (const id of ['impact', 'writing']) expect(doc.getElementById(id)).toBeNull()
  })
})

describe('the intro is about Naman, not his job', () => {
  it('drops the old job-description headline everywhere', () => {
    expect(doc.body.textContent).not.toMatch(/trustworthy|where money becomes data/i)
  })

  it('tells a story: home, code, problems, his own app, and who he wants to meet', () => {
    const story = text('.hero-copy')
    for (const bit of ['Haldwani', 'Enlacey', 'hard problem']) expect(story).toContain(bit)
    expect(story).toMatch(/building something of your own/i)
    expect(story).toMatch(/hiring/i)
  })

  it('lists interests a person would have, not pipeline jargon', () => {
    const interests = text('.interests')
    expect(interests).not.toMatch(/Stream processing|Data lineage/i)
    for (const i of ['Building apps', 'Open source', 'Starting something of my own']) expect(interests).toContain(i)
  })
})

describe('the card shows what a reader cares about', () => {
  const card = text('.cred')

  it('reads "Data & Backend Engineer @ Barclays"', () => {
    expect(text('.cred-role')).toBe('Data & Backend Engineer @ Barclays')
  })

  it('names the college beside the CGPA', () => {
    expect(card).toContain('SRM Institute of Science and Technology')
    expect(card).toContain('9.63')
  })

  it('leaves the rank and the promotion to the sections below', () => {
    expect(card).not.toMatch(/rank|top 5%|promoted|BA4/i)
  })

  it('links Enlacey to the app, and shows the open-source PRs', () => {
    const enlacey = [...doc.querySelectorAll('.cred a')].find((a) => /Enlacey/.test(a.textContent ?? ''))
    expect(enlacey?.getAttribute('href')).toMatch(/play\.google\.com|enlacey\.com/)
    expect(card).toMatch(/3 PRs merged/)
  })

  it('says he is open to new roles', () => {
    expect(card).toMatch(/Open to new roles/)
  })
})

describe('the ticket sits right under the intro', () => {
  it('comes before the projects', () => {
    const play = doc.getElementById('play')!
    expect(play.previousElementSibling?.id).toBe('top')
    expect(play.nextElementSibling?.id).toBe('projects')
  })
})

describe('projects and the blog', () => {
  it('puts Enlacey first and lists the merged open-source PRs', () => {
    const cards = [...doc.querySelectorAll('#projects .card')]
    expect(cards[0].id).toBe('p-enlacey')
    const oss = doc.getElementById('p-oss')!
    const prs = [...oss.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(prs).toEqual(
      expect.arrayContaining([
        'https://github.com/conductor-oss/conductor/pull/1654',
        'https://github.com/docling-project/docling-java/pull/691',
        'https://github.com/docling-project/docling/pull/4340',
      ]),
    )
  })

  it('shows each blog post as a tile under a "Blog" heading', () => {
    expect(text('#blog h2')).toBe('Blog')
    const tiles = doc.querySelectorAll('#blog .blog-tile')
    expect(tiles.length).toBe(R.POSTS.length)
    for (const t of tiles) expect(t.querySelector('a[href^="https://"]')).not.toBeNull()
  })
})

describe('education and skills', () => {
  it('keeps the rank, the paper and the semesters in Education', () => {
    const edu = text('#education')
    expect(edu).toContain('4,000+')
    expect(edu).toContain(R.PUBLICATION.title)
  })

  it('lists the relevant coursework exactly as Naman gave it', () => {
    const items = [...doc.querySelectorAll('#skills .coursework li')].map((li) => li.textContent?.trim())
    expect(items).toEqual([
      'Data Structures and Algorithms (DSA)',
      'Operating System (OS)',
      'Design and Analysis of Algorithms (DAA)',
      'Database Management System (DBMS)',
      'Computer Network (CN)',
      'Software Engineering and Project Management (SEPM)',
      'Object Oriented Programming (OOPS)',
      'Artificial Intelligence (AI)',
      'Network Security (NS)',
      'Advanced Programming Practices (APP)',
    ])
  })
})

describe('Barclays, so far: chapters that open as you scroll', () => {
  const chapters = [...doc.querySelectorAll('#experience .chapter')]

  it('has the internship, the first two years, the lineage engine and the hackathon', () => {
    expect(chapters.map((c) => c.id)).toEqual(['ch-intern', 'ch-platform', 'ch-lineage', 'ch-hackathon'])
    for (const c of chapters) expect(c.querySelector('.ch-head')).not.toBeNull()
    // the three working chapters open into details; the hackathon is one short story
    for (const c of chapters.slice(0, 3)) expect(c.querySelector('.ch-more')).not.toBeNull()
  })

  it('tells the internship from Naman’s own write-up', () => {
    const intern = chapters[0].textContent ?? ''
    for (const bit of ['Barclays Global Service Center', 'KornShell', 'Teradata', 'OAuth 2.0', '8 hours']) expect(intern).toContain(bit)
  })

  it('keeps each number beside the story it comes from', () => {
    const metric = (c: Element) => [...c.querySelectorAll('.ch-metric')].map((m) => m.textContent ?? '').join(' ')
    expect(metric(chapters[0])).toMatch(/8 h/)
    expect(metric(chapters[2])).toMatch(/~20/)
    expect(metric(chapters[2])).toMatch(/100s of millions/)
    expect(metric(chapters[3])).toMatch(/95%/)
  })

  it('shows why the lineage engine is hard, and the promotion in its year', () => {
    expect(chapters[2].textContent).toMatch(/out of order/)
    expect(chapters[1].textContent).toMatch(/BA3 to BA4/)
  })

  it('has a year rail that links to every chapter', () => {
    const rail = [...doc.querySelectorAll('.journey-rail a')].map((a) => a.getAttribute('href'))
    expect(rail).toEqual(chapters.map((c) => `#${c.id}`))
  })
})

describe('reachedChapters', () => {
  it('opens every chapter whose top has passed the reading line, and always the first', () => {
    expect(reachedChapters([1000, 1800, 2600], 400)).toBe(1)
    expect(reachedChapters([1000, 1800, 2600], 1900)).toBe(2)
    expect(reachedChapters([1000, 1800, 2600], 9000)).toBe(3)
  })
})

describe('the voice', () => {
  it('avoids the phrases that make a page read as machine-written or cheesy', () => {
    expect(doc.body.textContent).not.toMatch(/without being asked|passionate|seamless|leverag|cutting-edge|unglamorous/i)
  })
})
