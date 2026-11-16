// content.ts is the single source of truth for every fact the game shows: the
// panels, the reader, the journal and the dialogue all read from here. The
// facts it shares with the résumé page (the name, the title, the dates, the
// CGPA, the contact addresses) it takes from the master record,
// `src/data/resume.ts`, so the two can never disagree. These assertions pin the
// facts that are easy to drift and the order the reader renders sections in.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PROFILE, ZONES, type Zone } from '../src/data/content'
import { NPC_TREES } from '../src/data/npcs'
import { EDUCATION, EXPERIENCE, PERSON, PROJECTS } from '../src/data/resume'

const zone = (id: string): Zone => {
  const z = ZONES.find((x) => x.id === id)
  expect(z, `missing zone "${id}"`).toBeDefined()
  return z!
}

const factOf = (z: Zone, k: string): string | undefined => z.content.facts?.find((f) => f.k === k)?.v

/** Everything a zone card can put in front of a reader, as one string. */
const textOf = (z: Zone): string =>
  [
    z.name,
    z.label,
    z.content.kicker ?? '',
    z.content.title,
    z.content.sub ?? '',
    ...(z.content.body ?? []),
    ...(z.content.points ?? []),
    ...(z.content.chips ?? []),
    ...(z.content.facts ?? []).map((f) => `${f.k} ${f.v}`),
    ...(z.content.groups ?? []).flatMap((g) => [g.label, ...g.items]),
    ...(z.content.links ?? []).map((l) => `${l.label} ${l.value}`),
  ].join('\n')

/** Everything a zone card can put in front of a reader. */
const allCardText = ZONES.map(textOf).join('\n')

/** …and everything a villager or an object can say about it. */
const allDialogueText = Object.values(NPC_TREES)
  .flatMap((t) => Object.values(t.nodes).flatMap((n) => n.lines.map((l) => l.text)))
  .join('\n')

/** The island's whole voice: cards and conversation together. */
const allText = `${allCardText}\n${allDialogueText}`

describe('profile', () => {
  it('names the person, the role and where they are', () => {
    expect(PROFILE.name).toBe('Naman Gururani')
    expect(PROFILE.role).toBe('Data & Backend Engineer')
    expect(PROFILE.company).toBe('Barclays')
    expect(PROFILE.location).toBe('India')
    expect(PROFILE.email).toBe('gururaninaman@gmail.com')
  })
})

describe('the résumé record', () => {
  const SRC = readFileSync(resolve(__dirname, '../src/data/content.ts'), 'utf8')

  it('is where PROFILE comes from, field for field', () => {
    expect(PROFILE).toEqual({
      name: PERSON.name,
      role: PERSON.title,
      company: PERSON.employer,
      location: PERSON.location,
      email: PERSON.email,
      github: PERSON.github,
      githubHandle: PERSON.githubHandle,
      linkedin: PERSON.linkedin,
      linkedinHandle: PERSON.linkedinHandle,
    })
  })

  it('is imported, not copied: content.ts writes none of the shared facts out itself', () => {
    expect(SRC).toMatch(/from '\.\/resume'/)
    // (Not the GitHub address: Safe Stride's repo link legitimately starts with it.)
    for (const fact of [PERSON.name, PERSON.title, PERSON.email, PERSON.linkedin, EDUCATION.cgpa, 'August 2024', 'Aug 2024', 'BA3', 'BA4'])
      expect(SRC, `content.ts spells out "${fact}" instead of reading it from resume.ts`).not.toContain(fact)
  })

  it('gives the cards the record’s CGPA, years and start date', () => {
    expect(factOf(zone('about'), 'CGPA')).toBe(EDUCATION.cgpa)
    expect(factOf(zone('education'), 'CGPA')).toBe(EDUCATION.cgpa)
    expect(factOf(zone('education'), 'Years')).toBe(`${EDUCATION.from} – ${EDUCATION.to}`)
    expect(factOf(zone('about'), 'Since')).toBe('August 2024')
    expect(EXPERIENCE.roles[1].from).toBe('2024-08')
  })

  it('carries the new title everywhere, and the old one nowhere', () => {
    expect(PERSON.title).toBe('Data & Backend Engineer')
    expect(zone('about').content.sub).toBe('Data & Backend Engineer · Barclays')
    expect(factOf(zone('about'), 'Now')).toBe('Data & Backend Engineer · Barclays')
    expect((zone('experience').content.body ?? [])[0]).toBe('⭐ Data & Backend Engineer · Barclays · Aug 2024 — now')
    expect((zone('experience').content.body ?? [])[2]).toBe('🛠️ DevOps Intern · Barclays · Jun — Aug 2023')
    expect(allText).not.toMatch(/Software Development Engineer|\bSDE\b/)
  })

  it('shows the promotion on the Experience card, from the record’s roles', () => {
    expect(factOf(zone('experience'), 'Promoted')).toBe('BA3 → BA4 in 2025')
    expect(EXPERIENCE.roles.map((r) => r.grade)).toEqual(['BA4', 'BA3', undefined])
  })

  it('gives scale as an order of magnitude, never an exact volume', () => {
    expect(allText).not.toMatch(/750/)
    expect((zone('experience').content.body ?? [])[1]).toContain('hundreds of millions of records a day')
    expect((zone('lineage').content.body ?? [])[0]).toContain('hundreds of millions of records a day')
  })
})

describe('the CGPA is 9.63', () => {
  it('reads 9.63 / 10 in the About facts', () => {
    expect(factOf(zone('about'), 'CGPA')).toBe('9.63 / 10')
  })

  it('reads 9.63 / 10 in the Education facts', () => {
    expect(factOf(zone('education'), 'CGPA')).toBe('9.63 / 10')
  })

  it('never says 9.57 anywhere on the island — zone cards or villager dialogue', () => {
    expect(allText).not.toContain('9.57')
    // The scan really does cover both halves. The cards are now the only half
    // that may carry a figure at all: v3 moved every number out of the dialogue
    // and `tests/dialogue-data.test.ts` keeps it out, so a stale CGPA can only
    // survive on a card — where this assertion is looking.
    expect(allCardText).toContain('9.63')
    expect(allDialogueText, 'figures live on cards, never in a dialogue box').not.toMatch(/\d/)
  })
})

describe('the education zone', () => {
  const edu = zone('education')

  it('is told on the Career Coaster, alongside the work chapter', () => {
    expect(edu.name).toBe('Career Coaster')
    expect(edu.label).toBe('Education')
    expect([edu.tx, edu.ty]).toEqual([57, 26])
    expect(edu.accent).toBe(0x7ec8ff)
  })

  it('states the degree, the institute and the years', () => {
    expect(edu.content.kicker).toBe('STUDY')
    expect(edu.content.title).toBe('SRM Institute of Science and Technology')
    expect(edu.content.sub).toBe('B.Tech, Computer Science & Engineering · 2020 – 2024')
    expect(edu.content.facts).toEqual([
      { k: 'Degree', v: 'B.Tech CSE' },
      { k: 'Years', v: '2020 – 2024' },
      { k: 'CGPA', v: '9.63 / 10' },
    ])
    expect(edu.content.body).toEqual(['Where systems stopped being homework and started being fun.'])
  })

  it('agrees with the education line the About card already carried', () => {
    expect(factOf(zone('about'), 'Education')).toContain('SRM IST')
    expect(factOf(zone('about'), 'Education')).toContain('2020')
    expect(factOf(zone('about'), 'Education')).toContain('2024')
  })
})

describe('reader order', () => {
  it('runs About → Experience → Education → Skills → Projects → Contact', () => {
    expect(ZONES.map((z) => z.label)).toEqual(['About', 'Experience', 'Education', 'Skills', 'Project', 'Project', 'Project', 'Contact'])
  })

  it('puts education between experience and skills', () => {
    const at = (id: string) => ZONES.findIndex((z) => z.id === id)
    expect(at('experience')).toBeLessThan(at('education'))
    expect(at('education')).toBeLessThan(at('skills'))
  })
})

describe('every zone', () => {
  it('has a unique id, a name, a label, a title and an accent', () => {
    expect(new Set(ZONES.map((z) => z.id)).size).toBe(ZONES.length)
    for (const z of ZONES) {
      expect(z.name.trim().length, `${z.id} name`).toBeGreaterThan(0)
      expect(z.label.trim().length, `${z.id} label`).toBeGreaterThan(0)
      expect(z.content.title.trim().length, `${z.id} title`).toBeGreaterThan(0)
      expect(z.accent, `${z.id} accent`).toBeGreaterThan(0)
      expect(z.accent, `${z.id} accent`).toBeLessThanOrEqual(0xffffff)
    }
  })

  it('names Enlacey, live on Google Play', () => {
    const vault = zone('stealth')
    const enlacey = PROJECTS.find((p) => p.id === 'enlacey')!
    expect(vault.content.kicker).toBe('PROJECT · LIVE')
    expect(vault.content.title).toBe(enlacey.name)
    expect(vault.content.title).toBe('Enlacey')
    expect(vault.content.sub).toBe('Founder · live on Google Play')
    // The card is the record's summary, shortened: every fact on it is one the
    // record states too.
    const body = (vault.content.body ?? []).join(' ')
    for (const fact of ['Haldwani', 'Pune', 'since October 2026', 'iPhone']) {
      expect(body, `the Enlacey card no longer says "${fact}"`).toContain(fact)
      expect(enlacey.summary, `resume.ts no longer says "${fact}"`).toContain(fact)
    }
    expect(vault.content.links).toEqual([
      { label: 'Google Play', value: 'Enlacey on Google Play', href: 'https://play.google.com/store/apps/details?id=com.enlacey.app', ext: true },
    ])
    expect(enlacey.links.map((l) => l.href)).toContain(vault.content.links![0].href)
  })
})

describe('the prize-shelf labels', () => {
  // `short` is the label on the box the claw grabs for, and it is the only
  // thing the fair says about a project before you win it. The claw cabinet
  // (`ui/minigames/claw.ts`) and the Journal's prize shelf (`ui/panels.ts`)
  // both read it from here, so the two can no longer drift apart — which they
  // could while each kept its own copy of the list.
  it('belong to the three projects and to nobody else', () => {
    expect(Object.fromEntries(ZONES.filter((z) => z.short !== undefined).map((z) => [z.id, z.short]))).toEqual({
      lineage: 'Lineage Engine',
      safestride: 'Safe Stride',
      stealth: '???', // Enlacey is named on its card; on the shelf it stays the mystery box
    })
  })
})

describe('zone names point at the fair, not the island', () => {
  // `name` is the in-world place a chapter is told, and v4 tells several of
  // them at the same attraction: both career chapters ride the coaster, all
  // three projects come down off the same prize shelf.
  it('names the attraction each chapter is handed over at', () => {
    expect(Object.fromEntries(ZONES.map((z) => [z.id, z.name]))).toEqual({
      about: 'Ticket Booth',
      experience: 'Career Coaster',
      education: 'Career Coaster',
      skills: 'Word Forge',
      lineage: 'Prize Tent',
      stealth: 'Prize Tent',
      safestride: 'Prize Tent',
      contact: 'Guestbook',
    })
  })

  it('has forgotten the island’s buildings', () => {
    const names = ZONES.map((z) => z.name)
    for (const gone of ['The Cottage', 'Barclays Tower', 'SRM Campus', 'The Workshop', "Sol's Prize Tent", 'The Vault', 'Safe Stride', 'The Lighthouse'])
      expect(names, gone).not.toContain(gone)
  })
})
