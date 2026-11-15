// Renders the résumé page from the record, at build time (vite-plugin-resume.ts).
// Pure string-in, string-out: no DOM, no JS needed in the browser to read it.
// The markup contract (ids, classes, data-attributes) is what resume.css styles
// and main.ts wires up — see plan Task 3.
import {
  ACTIVITIES,
  EDUCATION,
  EXPERIENCE,
  METRICS,
  PERSON,
  POSTS,
  PROJECTS,
  PUBLICATION,
  SKILLS,
  UPDATED,
  type Bullet,
  type Project,
  type Role,
} from '../data/resume'

export const SITE = 'https://naman-gururani.github.io/portfolio/'
export const GAME = '/portfolio/play/'

/** Escape text for HTML element content and double-quoted attributes. */
export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 'YYYY-MM' → 'Aug 2024'; 'YYYY' stays; 'YYYY-MM-DD' → '1 Sep 2026'. */
export function fmtDate(d: string): string {
  const [y, m, day] = d.split('-')
  if (day) return `${Number(day)} ${MONTHS[Number(m) - 1]} ${y}`
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y
}

const time = (d: string) => `<time datetime="${esc(d)}">${esc(fmtDate(d))}</time>`
const range = (r: { from: string; to: string | null }) =>
  `${time(r.from)}<span class="dash" aria-hidden="true">–</span><span class="sr-only"> to </span>${r.to ? time(r.to) : '<span>Present</span>'}`

const isExternal = (href: string) => /^https?:\/\//.test(href)
const link = (href: string, label: string, cls = '') =>
  `<a${cls ? ` class="${cls}"` : ''} href="${esc(href)}"${isExternal(href) ? ' target="_blank" rel="noopener"' : ''}>${esc(label)}</a>`

const chips = (items: readonly string[], cls = 'chip') =>
  `<ul class="chips">${items.map((i) => `<li class="${cls}">${esc(i)}</li>`).join('')}</ul>`

/** A section with the numbered Printstream heading. */
function section(id: string, no: string, title: string, inner: string, extra = ''): string {
  return `<section id="${id}" class="sec${extra ? ` ${extra}` : ''}" aria-labelledby="${id}-h">
<header class="sec-head"><span class="sec-no" aria-hidden="true">${no}</span><h2 id="${id}-h">${esc(title)}</h2><span class="sec-rule" aria-hidden="true"></span></header>
${inner}
</section>`
}

const NAV: [string, string][] = [
  ['experience', 'Experience'],
  ['projects', 'Projects'],
  ['education', 'Education'],
  ['publication', 'Paper'],
  ['leadership', 'Leadership'],
  ['writing', 'Writing'],
  ['contact', 'Contact'],
]

function ribbon(): string {
  return `<a class="ribbon" href="${GAME}">
<span class="ribbon-stub" aria-hidden="true">ADMIT&nbsp;ONE</span>
<span class="ribbon-text"><b>Prefer to explore?</b> <span class="ribbon-more">Play this résumé as a pixel-art fairground.</span></span>
<span class="ribbon-go">Play <span aria-hidden="true">▶</span></span>
</a>`
}

function bar(): string {
  return `<header class="bar-wrap"><nav class="bar" aria-label="Sections">
<a class="mark" href="#top" aria-label="${esc(PERSON.name)}, back to top"><span aria-hidden="true">NG</span></a>
<div class="bar-links">${NAV.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}</div>
<div class="bar-tools">
<button type="button" class="tool js-only" data-theme-toggle aria-label="Switch to the light skin"><span aria-hidden="true">◐</span></button>
<button type="button" class="tool js-only" data-print><span>Print</span></button>
</div>
</nav></header>`
}

function hero(): string {
  const now = EXPERIENCE.roles[0]
  return `<section id="top" class="hero" aria-label="Introduction">
<div class="hero-grid">
<div class="cred-stage">
<article class="cred" aria-label="${esc(PERSON.name)}: credential">
<div class="cred-foil" aria-hidden="true"></div>
<div class="cred-glare" aria-hidden="true"></div>
<div class="cred-body">
<div class="cred-top"><span class="chipcard" aria-hidden="true"><i></i><i></i><i></i></span><span class="serial">PS-ID-0824</span><span class="live"><span class="dot" aria-hidden="true"></span>${esc(PERSON.employer)} · since 2023</span></div>
<p class="cred-kicker">Payments · Streaming · Backend</p>
<h1>${esc(PERSON.name)}</h1>
<p class="cred-role">${esc(PERSON.title)}<span class="cred-at"> · ${esc(PERSON.employer)} · ${esc(PERSON.location)}</span></p>
<dl class="cred-facts">
<div><dt>Now</dt><dd>${esc(now.grade ?? '')} · promoted ${esc(fmtDate(now.from))}</dd></div>
<div><dt>Degree</dt><dd>B.Tech CSE · <span class="nw">${esc(EDUCATION.cgpa)}</span></dd></div>
<div><dt>Rank</dt><dd>Top 5% of batch</dd></div>
<div><dt>Building</dt><dd>Enlacey · Google Play</dd></div>
</dl>
<div class="cred-actions">
<a class="btn primary" href="mailto:${esc(PERSON.email)}">Email</a>
<button type="button" class="btn js-only" data-copy-email data-email="${esc(PERSON.email)}"><span class="copy-idle">Copy email</span><span class="copy-done" aria-hidden="true">Copied ✓</span></button>
${link(PERSON.github, 'GitHub', 'btn')}
${link(PERSON.linkedin, 'LinkedIn', 'btn')}
</div>
<span class="seal" aria-hidden="true"><span>NG</span></span>
<div class="cred-code" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
</div>
</article>
</div>
<div class="hero-copy">
<p class="eyebrow">résumé · updated ${esc(UPDATED)}</p>
<p class="headline">${PERSON.headline.map((l, i, a) => (i === a.length - 1 ? `<span class="holo-word">${esc(l)}</span>` : `<span>${esc(l)}</span> `)).join('')}</p>
<p class="lede">${esc(PERSON.summary)}</p>
${PERSON.about.map((p) => `<p class="about">${esc(p)}</p>`).join('\n')}
<div class="interests"><span class="label">Interests</span>${chips(PERSON.interests)}</div>
</div>
</div>
</section>`
}

function impact(): string {
  return section(
    'impact',
    '00',
    'By the numbers',
    `<ul class="metrics">${METRICS.map(
      (m) => `<li class="metric glass">
<p class="metric-value">${esc(m.value)}<span class="metric-unit"> ${esc(m.unit)}</span></p>
<p class="metric-label">${esc(m.label)}</p>
<p class="metric-basis">${esc(m.basis)}</p>
</li>`,
    ).join('')}</ul>`,
  )
}

function roleItem(r: Role, i: number): string {
  const badge = i === 0 ? '<span class="badge holo">Promoted</span>' : r.title.includes('Intern') ? '<span class="badge">Converted to full time</span>' : ''
  return `<li class="role${i === 0 ? ' current' : ''}">
<span class="node" aria-hidden="true"></span>
<p class="role-when">${range(r)}</p>
<p class="role-title">${esc(r.title)}${r.grade ? ` <span class="grade">${esc(r.grade)}</span>` : ''} ${badge}</p>
${r.note ? `<p class="role-note">${esc(r.note)}</p>` : ''}
</li>`
}

function bulletItem(b: Bullet, i: number): string {
  const how = b.how
    ? `<details class="how"><summary>How it works</summary><ul>${b.how.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></details>`
    : ''
  return `<li class="win">
<span class="win-no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
<div class="win-body"><p><strong>${esc(b.lead)}</strong> ${esc(b.text)}</p>${how}${b.tags ? chips(b.tags, 'chip sm') : ''}</div>
</li>`
}

function experience(): string {
  const top = EXPERIENCE.bullets.slice(0, 3)
  const rest = EXPERIENCE.bullets.slice(3)
  return section(
    'experience',
    '01',
    'Experience',
    `<article class="job glass">
<header class="job-head"><h3>${esc(EXPERIENCE.employer)}</h3><p class="job-where">${esc(EXPERIENCE.place)} · <time datetime="2023-06">2023</time>–present</p><span class="serial" aria-hidden="true">PS-EXP-01</span></header>
<div class="job-grid">
<ol class="timeline" reversed aria-label="Roles at ${esc(EXPERIENCE.employer)}, newest first">${EXPERIENCE.roles.map(roleItem).join('')}</ol>
<div class="wins">
<ol class="win-list">${top.map(bulletItem).join('')}</ol>
<details class="more"><summary>More from this role <span class="count">${rest.length}</span></summary>
<ol class="win-list" start="4">${rest.map((b, i) => bulletItem(b, i + 3)).join('')}</ol>
</details>
</div>
</div>
</article>`,
  )
}

function projectCard(p: Project, i: number): string {
  return `<article class="card glass ${p.size === 'lg' ? 'lg' : ''}" id="p-${esc(p.id)}">
<span class="serial" aria-hidden="true">PS-${String(i + 1).padStart(3, '0')}</span>
<p class="card-kicker">${esc(p.kicker)}${p.when ? ` · <time datetime="${esc(p.when)}">${esc(p.when)}</time>` : ''}</p>
<h3>${esc(p.name)}</h3>
<p class="card-summary">${esc(p.summary)}</p>
<p class="card-role"><span class="label">My part</span> ${esc(p.role)}</p>
<ul class="card-points">${p.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
${chips(p.stack, 'chip sm')}
${p.links.length ? `<p class="card-links">${p.links.map((l) => link(l.href, l.label, 'arrow')).join('')}</p>` : ''}
</article>`
}

function projects(): string {
  return section('projects', '02', 'Projects', `<div class="cards">${PROJECTS.map(projectCard).join('')}</div>`)
}

function ticket(): string {
  return `<section id="play" class="sec play" aria-label="The game version of this résumé">
<a class="ticket" href="${GAME}">
<span class="ticket-stub" aria-hidden="true"><span class="ticket-admit">ADMIT ONE</span><span class="ticket-no">No. 0001</span></span>
<span class="ticket-main">
<span class="ticket-kicker">Naman’s World Fair · a pixel-art game</span>
<span class="ticket-title">Same résumé. Now walk around it.</span>
<span class="ticket-copy">A Wordle ticket at the gate, my career as a rollercoaster, projects out of a claw machine, and a skip button in every game. Works on phones.</span>
<span class="ticket-go">Enter the fair <span aria-hidden="true">▶</span></span>
</span>
<span class="ticket-shot"><img src="/portfolio/resume/fair.webp" width="480" height="300" loading="lazy" decoding="async" alt="The fairground in the game: a ticket booth, a rollercoaster and a Ferris wheel."></span>
</a>
</section>`
}

function education(): string {
  const e = EDUCATION
  return section(
    'education',
    '03',
    'Education',
    `<article class="edu glass">
<span class="serial" aria-hidden="true">PS-EDU-24</span>
<h3>${esc(e.school)}</h3>
<p class="edu-degree">${esc(e.degree)} · ${esc(e.campus)} · <time datetime="${e.from}">${e.from}</time>–<time datetime="${e.to}">${e.to}</time></p>
<dl class="edu-facts">
<div><dt>CGPA</dt><dd class="big">${esc(e.cgpa)}</dd></div>
<div><dt>Rank</dt><dd>${esc(e.rank)}<span class="src">${esc(e.rankSource)}</span></dd></div>
<div><dt>Semesters</dt><dd>${esc(e.sgpa)}</dd></div>
<div><dt>Completed</dt><dd>${esc(e.completed)}</dd></div>
</dl>
<p class="edu-courses"><span class="label">Selected grades</span> ${e.courses.map((c) => `${esc(c.name)}: <b>${esc(c.grade)}</b>`).join(' · ')} · Major project: <b>O</b> · Minor project: <b>O</b></p>
</article>`,
  )
}

function publication(): string {
  const p = PUBLICATION
  return section(
    'publication',
    '04',
    'Publication',
    `<article class="paper glass">
<p class="paper-title">“${esc(p.title)}”</p>
<p class="paper-with">Co-authored with ${esc(p.with)}</p>
<p class="paper-note"><span class="label">My part</span> ${esc(p.note)}</p>
</article>`,
  )
}

function leadership(): string {
  return section(
    'leadership',
    '05',
    'Leadership & activities',
    `<ul class="acts">${ACTIVITIES.map(
      (a) => `<li class="act glass"><p class="act-what">${esc(a.what)}</p><p class="act-where">${esc(a.where)}</p><p class="act-when">${esc(a.when)}</p>${a.detail ? `<p class="act-detail">${esc(a.detail)}</p>` : ''}</li>`,
    ).join('')}</ul>`,
  )
}

function writing(): string {
  return section(
    'writing',
    '06',
    'Writing',
    `<ul class="posts">${POSTS.map(
      (p) => `<li class="post glass">${link(p.href, p.title, 'post-title')}<p class="post-date">${time(p.date)}</p></li>`,
    ).join('')}</ul>
<p class="more-link">${link(PERSON.blog, 'All posts on the blog', 'arrow')}</p>`,
  )
}

function skills(): string {
  return section(
    'skills',
    '07',
    'Skills',
    `<dl class="skills glass">${SKILLS.map((g) => `<div><dt>${esc(g.label)}</dt><dd>${chips(g.items)}</dd></div>`).join('')}</dl>`,
  )
}

function contact(): string {
  return section(
    'contact',
    '08',
    'Contact',
    `<div class="contact glass">
<p class="contact-line">Streams, lineage, marketplaces, or this page: I am happy to talk about any of it.</p>
<p class="contact-mail"><a href="mailto:${esc(PERSON.email)}">${esc(PERSON.email)}</a></p>
<p class="contact-links">${link(PERSON.github, 'GitHub', 'arrow')}${link(PERSON.linkedin, 'LinkedIn', 'arrow')}${link(PERSON.blog, 'Blog', 'arrow')}${link(PERSON.site, 'Homepage', 'arrow')}</p>
</div>`,
  )
}

function footer(): string {
  return `<footer class="foot">
<p>© 2026 ${esc(PERSON.name)} · Updated ${esc(UPDATED)} · Hand-built with Vite, no framework.</p>
<p><a href="${GAME}">Play the game</a> · ${link(PERSON.site, 'Homepage')}</p>
</footer>`
}

/** The whole `<body>` content. */
export function renderResume(): string {
  return [
    '<a class="skip" href="#main">Skip to content</a>',
    '<div class="scene" aria-hidden="true"><div class="glow g1"></div><div class="glow g2"></div><div class="glow g3"></div><div class="floor"></div><div class="dots"></div>' +
      '<div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div><div class="ring"><div class="ring-in"></div></div><div class="prism"></div></div>',
    ribbon(),
    bar(),
    '<main id="main">',
    hero(),
    impact(),
    experience(),
    projects(),
    ticket(),
    education(),
    publication(),
    leadership(),
    writing(),
    skills(),
    contact(),
    '</main>',
    footer(),
  ].join('\n')
}

/** Title, description, canonical, link previews and structured data. */
export function renderHead(): string {
  const title = `${PERSON.name} — ${PERSON.title}`
  const desc = `${PERSON.name}: ${PERSON.title.toLowerCase()} at ${PERSON.employer}, building real-time payment data systems in Java, Kafka and Flink. B.Tech CSE, CGPA 9.63/10. Founder of Enlacey.`
  const img = `${SITE}og.png`
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: SITE,
    dateModified: '2026-11-16',
    mainEntity: {
      '@type': 'Person',
      name: PERSON.name,
      jobTitle: PERSON.title,
      worksFor: { '@type': 'Organization', name: PERSON.employer },
      alumniOf: { '@type': 'CollegeOrUniversity', name: EDUCATION.school },
      email: `mailto:${PERSON.email}`,
      url: SITE,
      sameAs: [PERSON.github, PERSON.linkedin, PERSON.site, 'https://play.google.com/store/apps/details?id=com.enlacey.app'],
      knowsAbout: ['Apache Kafka', 'Apache Flink', 'Stream processing', 'Data lineage', 'Java', 'Distributed systems'],
    },
  }
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    `<meta name="author" content="${esc(PERSON.name)}" />`,
    `<link rel="canonical" href="${SITE}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${SITE}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(`${PERSON.name}, ${PERSON.title} — résumé`)}" />`,
    `<meta property="profile:first_name" content="Naman" />`,
    `<meta property="profile:last_name" content="Gururani" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
}
