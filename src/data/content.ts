/* ============================================================
   NAMAN'S WORLD — content & map layout (single source of truth
   for everything the game shows)
   The facts the game shares with the résumé page — name, title,
   employer, contact addresses, dates, CGPA, the promotion — are
   read from the master record, `./resume.ts`, never written out
   here, so the cards and the page can never disagree.
   Audit note: skill listings contain only the client-approved set;
   bank detail is held to "option B" (scale as an order of
   magnitude, no internal system names). Enlacey, the product that
   used to sit here unnamed, is live and named on its card; on the
   claw shelf its box is still the `???` mystery prize.
   ============================================================ */

import { EDUCATION, EXPERIENCE, PERSON, PROJECTS, type Role } from './resume'

export const PROFILE: {
  name: string
  role: string
  company: string
  location: string
  email: string
  github: string
  githubHandle: string
  linkedin: string
  linkedinHandle: string
} = {
  name: PERSON.name,
  role: PERSON.title,
  company: PERSON.employer,
  location: PERSON.location,
  email: PERSON.email,
  github: PERSON.github,
  githubHandle: PERSON.githubHandle,
  linkedin: PERSON.linkedin,
  linkedinHandle: PERSON.linkedinHandle,
}

/* ---------------- dates, as the cards print them ---------------- */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const yearOf = (d: string): string => d.slice(0, 4)
/** '2023-06' → 'Jun' (or 'June' when `long`). */
const monthOf = (d: string, long = false): string => {
  const m = MONTHS[Number(d.slice(5, 7)) - 1] ?? ''
  return long ? m : m.slice(0, 3)
}
/** '2023-06' → 'Jun 2023' (or 'June 2023'). */
const monthYear = (d: string, long = false): string => `${monthOf(d, long)} ${yearOf(d)}`
/** A role's span as a headline ends it: '<Mon YYYY> — now', or '<Mon> — <Mon YYYY>' inside one year. */
const span = (r: Role): string => {
  if (r.to === null) return `${monthYear(r.from)} — now`
  return yearOf(r.from) === yearOf(r.to) ? `${monthOf(r.from)} — ${monthYear(r.to)}` : `${monthYear(r.from)} — ${monthYear(r.to)}`
}

// The record lists the roles newest first: the current grade, the first
// full-time grade, then the internship.
const [CURRENT, FULL_TIME, INTERN] = EXPERIENCE.roles
const COMPANY = EXPERIENCE.employer
const YEARS = `${EDUCATION.from} – ${EDUCATION.to}`
const ENLACEY = PROJECTS.find((p) => p.id === 'enlacey')!
const PLAY_STORE = ENLACEY.links.find((l) => l.label === 'Google Play')!.href

export type Content = {
  kicker?: string
  title: string
  sub?: string
  body?: string[]
  points?: string[]
  chips?: string[]
  facts?: { k: string; v: string }[]
  groups?: { label: string; items: string[] }[]
  links?: { label: string; value: string; href: string; ext: boolean }[]
}

export type Zone = {
  id: string
  name: string // the attraction this chapter is handed over at
  label: string // short HUD/section label
  /**
   * The name on the prize box, for the chapters won off the claw machine's
   * shelf. All three are labelled "Project" and all three come out of the same
   * tent, so this is the only thing that tells them apart while they are still
   * locked: the claw cabinet paints it on the box, and the Journal's prize
   * shelf repeats it on the row. Only the prize chapters carry one.
   */
  short?: string
  tx: number // tile column
  ty: number // tile row
  accent: number // hex color int
  content: Content
}

// Map is TILES_W x TILES_H tiles. Zones are spread across it for exploration.
export const TILES_W = 80
export const TILES_H = 56
export const SPAWN = { tx: 40, ty: 37 }

export const ZONES: Zone[] = [
  {
    id: 'about',
    name: 'Ticket Booth',
    label: 'About',
    tx: 40,
    ty: 30,
    accent: 0xffc24b,
    content: {
      kicker: 'WHO',
      title: 'Hi, I’m Naman 👋',
      sub: `${PERSON.title} · ${COMPANY}`,
      body: [
        'I love writing code, and the hard problem that comes before it.',
        'By day I build real-time payment systems at Barclays, where every event is someone’s money, so it has to be right at any scale.',
        'The rest of the time I build my own things, like Enlacey, an app for finding help you can trust back home in Haldwani.',
      ],
      facts: [
        { k: 'Now', v: `${PERSON.title} · ${COMPANY}` },
        { k: 'Since', v: monthYear(FULL_TIME.from, true) },
        { k: 'Education', v: `B.Tech CSE · SRM IST (${EDUCATION.from}–${EDUCATION.to})` },
        { k: 'CGPA', v: EDUCATION.cgpa },
      ],
    },
  },
  {
    id: 'experience',
    name: 'Career Coaster',
    label: 'Experience',
    tx: 17,
    ty: 15,
    accent: 0x5b9bd5,
    content: {
      kicker: 'WORK',
      title: 'Experience',
      groups: [],
      body: [
        // One headline for both grades: the title has run unbroken from the first
        // full-time grade to the current one (the promotion is the fact below).
        `⭐ ${PERSON.title} · ${COMPANY} · ${span({ ...FULL_TIME, to: CURRENT.to })}`,
        'I consume real-time streams from Apache Kafka and IBM MQ and turn raw events into something trustworthy — tokenized, classified by jurisdiction, mapped to canonical codes. I built a real-time payment lineage engine that reconstructs the full path of every payment across highly decoupled systems (each hop guarantees exactly one upstream and one downstream), running at hundreds of millions of records a day. I work spec-first, with AI spec-driven development.',
        `🛠️ ${INTERN.title} · ${COMPANY} · ${span(INTERN)}`,
        'Automated loading of process exceptions into an analyst portal via a secured (OAuth 2.0) REST API — collapsing an 8-hour delay into real time — aggregating Teradata data with Python and KornShell.',
      ],
      facts: [{ k: 'Promoted', v: `${FULL_TIME.grade} → ${CURRENT.grade} in ${yearOf(CURRENT.from)}` }],
      chips: ['Apache Flink', 'Apache Kafka', 'Kafka Streams', 'Redis', 'DynamoDB', 'IBM MQ'],
    },
  },
  {
    id: 'education',
    name: 'Career Coaster',
    label: 'Education',
    tx: 57,
    ty: 26,
    accent: 0x7ec8ff,
    content: {
      kicker: 'STUDY',
      title: 'SRM Institute of Science and Technology',
      sub: `B.Tech, Computer Science & Engineering · ${YEARS}`,
      facts: [
        { k: 'Degree', v: 'B.Tech CSE' },
        { k: 'Years', v: YEARS },
        { k: 'CGPA', v: EDUCATION.cgpa },
      ],
      body: ['Where systems stopped being homework and started being fun.'],
    },
  },
  {
    id: 'skills',
    name: 'Word Forge',
    label: 'Skills',
    tx: 63,
    ty: 17,
    accent: 0xff7a59,
    content: {
      kicker: 'TOOLS',
      title: 'The Word Forge',
      sub: 'How I work — AI writes most of my code now. Knowing what good software looks like is still the job.',
      body: [
        'My recent work has been built with Claude Code rather than typed by hand, and it still takes weeks, not hours, because serious software development was never mostly typing. The unknowns arrive as you build, test and get feedback.',
        'My time goes to the higher level: the approach, the architecture, the design decisions. I challenge what the tool proposes, debate its choices and push for the simpler, more robust answer. That is the engineering.',
        'You may not need to know every API by heart any more, but you still need separation of concerns, coupling and cohesion, data modelling, API design, error handling, security, performance and testing — enough to ask whether that extra layer is necessary, whether there is a simpler way, and whether it will still be maintainable in six months. AI can write the code. You still have to know what good software looks like.',
      ],
      groups: [
        { label: 'Languages & Frameworks', items: ['Java', 'Spring Boot', 'Python', 'C++', 'SQL'] },
        { label: 'Streaming & Messaging', items: ['Apache Kafka', 'Apache Flink', 'Kafka Streams', 'IBM MQ'] },
        { label: 'State & Tooling', items: ['Redis', 'DynamoDB', 'Docker', 'Linux', 'Git'] },
      ],
    },
  },
  {
    id: 'lineage',
    name: 'Prize Tent',
    label: 'Project',
    short: 'Lineage Engine',
    tx: 16,
    ty: 42,
    accent: 0x5eead4,
    content: {
      kicker: 'PROJECT · IN PRODUCTION',
      title: 'Real-time Payment Lineage Engine',
      sub: 'Barclays',
      body: [
        'A backend engine that reconstructs the complete lineage of every payment — every system it touched, in order — across highly decoupled services. Each hop guarantees exactly one upstream and one downstream; the engine stitches those single links into an end-to-end path, continuously, at hundreds of millions of records a day.',
      ],
      chips: ['Apache Flink', 'Apache Kafka', 'Redis', 'DynamoDB'],
    },
  },
  {
    id: 'stealth',
    name: 'Prize Tent',
    label: 'Project',
    // Enlacey. The id stays 'stealth' (saves, the claw and the story key on it)
    // and the box stays '???': on the shelf it is the mystery prize, and the
    // name is what you win.
    short: '???',
    tx: 41,
    ty: 12,
    accent: 0xb794f6,
    content: {
      kicker: 'PROJECT · LIVE',
      title: ENLACEY.name,
      sub: 'Founder · live on Google Play',
      body: [
        'Back home there’s always a guy who knows a guy. Enlacey is the app that finds you that guy: live on Google Play in Haldwani and Pune since October 2026, and coming soon to iPhone.',
      ],
      links: [{ label: 'Google Play', value: `${ENLACEY.name} on Google Play`, href: PLAY_STORE, ext: true }],
    },
  },
  {
    id: 'safestride',
    name: 'Prize Tent',
    label: 'Project',
    short: 'Safe Stride',
    tx: 66,
    ty: 44,
    accent: 0x59f3a6,
    content: {
      kicker: 'PROJECT · SHIPPED',
      title: 'Safe Stride',
      sub: 'A one-stop safety solution for the elderly',
      body: [
        'Real-time location tracking plus accelerometer-based fall detection, with automatic SOS to emergency services and a live map view.',
      ],
      chips: ['Geolocation', 'Sensors', 'Twilio', 'Leaflet'],
      links: [
        {
          label: 'GitHub',
          value: 'Naman-Gururani/Safe-Stride',
          href: 'https://github.com/Naman-Gururani/Safe-Stride',
          ext: true,
        },
      ],
    },
  },
  {
    id: 'contact',
    name: 'Guestbook',
    label: 'Contact',
    tx: 44,
    ty: 49,
    accent: 0xffd95e,
    content: {
      kicker: 'SAY HELLO',
      title: 'The Guestbook',
      body: [
        'You saw the whole fair 🎉 If you’re building something where data has to be trusted end to end — or you just want to compare notes — send a signal.',
        'Looking for a backend, data or Java engineer? Say hello. I’m just as happy in full-stack or spec-driven work, or something we haven’t named yet.',
      ],
      facts: [{ k: 'Open to', v: 'Backend · Data · Java · Full-stack · Spec-driven dev' }],
      links: [
        { label: 'Email', value: PROFILE.email, href: `mailto:${PROFILE.email}`, ext: false },
        { label: 'GitHub', value: PROFILE.githubHandle, href: PROFILE.github, ext: true },
        { label: 'LinkedIn', value: PROFILE.linkedinHandle, href: PROFILE.linkedin, ext: true },
      ],
    },
  },
]
