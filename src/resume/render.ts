// Renders the résumé page from the record, at build time (vite-plugin-resume.ts).
// Pure string-in, string-out: no DOM, no JS needed in the browser to read it.
// The markup contract (ids, classes, data-attributes) is what resume.css styles
// and main.ts / journey.ts wire up. Order (spec §10): intro, the game ticket,
// projects, blog, education, experience, leadership, skills, contact.
import {
  ACTIVITIES,
  CARD,
  COURSEWORK,
  EDUCATION,
  JOURNEY,
  PERSON,
  POSTS,
  PROJECTS,
  PUBLICATION,
  SKILLS,
  UPDATED,
  type Chapter,
  type Project,
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

const isExternal = (href: string) => /^https?:\/\//.test(href)
const attrs = (href: string) => `href="${esc(href)}"${isExternal(href) ? ' target="_blank" rel="noopener"' : ''}`
const link = (href: string, label: string, cls = '') => `<a${cls ? ` class="${cls}"` : ''} ${attrs(href)}>${esc(label)}</a>`

/** Escape a line of copy, then turn its [label](href) tokens into links. */
export function prose(s: string): string {
  return esc(s).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, href: string) =>
    `<a ${attrs(href.replace(/&amp;/g, '&'))}>${label}</a>`,
  )
}

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
  ['projects', 'Projects'],
  ['blog', 'Blog'],
  ['education', 'Education'],
  ['experience', 'Experience'],
  ['leadership', 'Activities'],
  ['skills', 'Skills'],
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
  const { studied, building, openSource } = CARD
  return `<section id="top" class="hero" aria-label="Introduction">
<div class="hero-grid">
<div class="cred-stage">
<article class="cred" aria-label="${esc(PERSON.name)}: credential">
<div class="cred-foil" aria-hidden="true"></div>
<div class="cred-glare" aria-hidden="true"></div>
<div class="cred-body">
<div class="cred-top"><span class="chipcard" aria-hidden="true"><i></i><i></i><i></i></span><span class="serial">PS-ID-0824</span><span class="live"><span class="dot" aria-hidden="true"></span>Open to new opportunities</span></div>
<p class="cred-kicker">${esc(PERSON.kicker)}</p>
<h1>${esc(PERSON.name)}</h1>
<p class="cred-role">${esc(PERSON.title)} @ ${esc(PERSON.employer)}</p>
<dl class="cred-facts">
<div class="wide"><dt>Studied</dt><dd><span class="cred-school">${esc(studied.school)}</span><span class="cred-sub">${esc(studied.detail)}</span></dd></div>
<div><dt>Building</dt><dd>${link(building.href, `${building.label} ↗`, 'cred-link')}<span class="cred-sub">${esc(building.detail)}</span></dd></div>
<div><dt>Open source</dt><dd>${link(openSource.href, openSource.label, 'cred-link')}<span class="cred-sub">${esc(openSource.detail)}</span></dd></div>
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
<p class="eyebrow">${esc(PERSON.hello)}</p>
<p class="headline">${PERSON.headline.map((l, i, a) => (i === a.length - 1 ? `<span class="holo-word">${esc(l)}</span>` : `<span>${esc(l)}</span> `)).join('')}</p>
<div class="story">${PERSON.story.map((p) => `<p>${prose(p)}</p>`).join('\n')}</div>
<p class="connect"><span>${esc(PERSON.connect)}</span> <a class="connect-go" href="mailto:${esc(PERSON.email)}">Say hello <span aria-hidden="true">→</span></a></p>
<div class="interests"><span class="label">What I’m into</span>${chips(PERSON.interests)}</div>
</div>
</div>
</section>`
}

function ticket(): string {
  return `<section id="play" class="sec play" aria-label="The game version of this résumé">
<a class="ticket" href="${GAME}">
<span class="ticket-stub" aria-hidden="true"><span class="ticket-admit">ADMIT ONE</span><span class="ticket-no">No. 0001</span></span>
<span class="ticket-main">
<span class="ticket-kicker">Naman’s World Fair · a pixel-art game</span>
<span class="ticket-title">The same résumé, as a game.</span>
<span class="ticket-copy">Win a Wordle ticket at the gate, ride my career on a rollercoaster and pull projects out of a claw machine. Every game can be skipped, and it works on phones.</span>
<span class="ticket-go">Enter the fair <span aria-hidden="true">▶</span></span>
</span>
<span class="ticket-shot"><img src="/portfolio/resume/fair.webp" width="480" height="300" loading="lazy" decoding="async" alt="The entrance plaza of the game’s pixel-art fairground: a fountain, the Word Forge stall, snack stands, bunting and the Naman’s World Fair gate."></span>
</a>
</section>`
}

function projectCard(p: Project, i: number): string {
  return `<article class="card glass ${p.size === 'lg' ? 'lg' : ''}" id="p-${esc(p.id)}">
<span class="serial" aria-hidden="true">PS-${String(i + 1).padStart(3, '0')}</span>
<p class="card-kicker">${esc(p.kicker)}${p.when ? ` · <time datetime="${esc(p.when)}">${esc(p.when)}</time>` : ''}</p>
<h3>${esc(p.name)}</h3>
<p class="card-summary">${esc(p.summary)}</p>
<p class="card-role"><span class="label">My part</span> ${esc(p.role)}</p>
${p.points.length ? `<ul class="card-points">${p.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
${chips(p.stack, 'chip sm')}
${p.links.length ? `<p class="card-links">${p.links.map((l) => link(l.href, l.label, 'arrow')).join('')}</p>` : ''}
</article>`
}

function projects(): string {
  return section('projects', '01', 'Projects', `<div class="cards">${PROJECTS.map(projectCard).join('')}</div>`)
}

function blog(): string {
  return section(
    'blog',
    '02',
    'Blog',
    `<div class="blog-grid">${POSTS.map(
      (p) => `<article class="blog-tile glass">
<p class="blog-meta">${time(p.date)}${p.tags.length ? ` · ${p.tags.map(esc).join(' · ')}` : ''}</p>
<h3>${link(p.href, p.title, 'blog-title')}</h3>
<p class="blog-desc">${esc(p.description)}</p>
<p class="blog-go" aria-hidden="true">Read →</p>
</article>`,
    ).join('')}
<a class="blog-all glass" ${attrs(PERSON.blog)}><span class="blog-all-k">The blog</span><span class="blog-all-t">All posts</span><span class="blog-go">All posts →</span></a>
</div>`,
  )
}

function education(): string {
  const e = EDUCATION
  const p = PUBLICATION
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
<div class="paper" id="paper">
<p class="label">Paper</p>
<p class="paper-title">“${esc(p.title)}”</p>
<p class="paper-with">Co-authored with ${esc(p.with)}</p>
<p class="paper-note">${esc(p.note)}</p>
</div>
</article>`,
  )
}

function chapter(c: Chapter): string {
  const metrics = c.metrics.length
    ? `<ul class="ch-metrics">${c.metrics.map((m) => `<li class="ch-metric"><b>${esc(m.value)}</b><span>${esc(m.label)}</span></li>`).join('')}</ul>`
    : ''
  const hard = c.hard
    ? `<div class="ch-hard"><p class="label">Why it’s hard</p><ul>${c.hard.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></div>`
    : ''
  const points = c.points.length
    ? `<div class="ch-points"><p class="label">${c.hard ? 'How I built it' : 'What I did'}</p><ul>${c.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`
    : ''
  const more = [hard, points, c.outcome ? `<p class="ch-outcome">${esc(c.outcome)}</p>` : '', c.tags.length ? chips(c.tags, 'chip sm') : '']
    .filter(Boolean)
    .join('\n')
  return `<li class="chapter glass" id="${c.id}">
<span class="ch-node" aria-hidden="true"></span>
<div class="ch-head">
<p class="ch-when">${c.datetime ? `<time datetime="${esc(c.datetime)}">${esc(c.when)}</time>` : esc(c.when)}</p>
<h3 class="ch-title">${esc(c.title)}</h3>
<p class="ch-role">${esc(c.role)}</p>
<p class="ch-lead">${esc(c.lead)}</p>
${metrics}
</div>
${more ? `<div class="ch-more" id="${c.id}-more"><div class="ch-inner">${more}</div></div>` : ''}
</li>`
}

function experience(): string {
  return section(
    'experience',
    '04',
    'Experience',
    `<p class="sec-lede">I joined Barclays as an intern in 2023. This is what I’ve worked on since.</p>
<div class="journey" data-journey>
<nav class="journey-rail" aria-label="My years at Barclays"><ol>${JOURNEY.map(
      (c) => `<li><a href="#${c.id}"><span class="rail-dot" aria-hidden="true"></span><span class="rail-year">${esc(c.rail)}</span><span class="rail-title">${esc(c.title)}</span></a></li>`,
    ).join('')}</ol></nav>
<ol class="chapters">${JOURNEY.map(chapter).join('')}</ol>
</div>`,
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

function skills(): string {
  return section(
    'skills',
    '06',
    'Skills & coursework',
    `<div class="skills-grid">
<dl class="skills glass">${SKILLS.map((g) => `<div><dt>${esc(g.label)}</dt><dd>${chips(g.items)}</dd></div>`).join('')}</dl>
<div class="coursework glass"><p class="label">Relevant coursework</p><ul>${COURSEWORK.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>
</div>`,
  )
}

function contact(): string {
  return section(
    'contact',
    '07',
    'Contact',
    `<div class="contact glass">
<p class="contact-line">Building something, or hiring? Email me.</p>
<p class="contact-sub">I’m open to new opportunities, looking at ${esc(PERSON.openTo.slice(0, -1).join(', '))} and ${esc(PERSON.openTo[PERSON.openTo.length - 1])} work.</p>
<p class="contact-mail"><a href="mailto:${esc(PERSON.email)}">${esc(PERSON.email)}</a></p>
<p class="contact-links">${link(PERSON.github, 'GitHub', 'arrow')}${link(PERSON.linkedin, 'LinkedIn', 'arrow')}${link(PERSON.blog, 'Blog', 'arrow')}${link(PERSON.site, 'Homepage', 'arrow')}</p>
</div>`,
  )
}

function footer(): string {
  return `<footer class="foot">
<p>© 2026 ${esc(PERSON.name)} · Updated ${esc(UPDATED)} · Built with Vite, no framework.</p>
<p><a href="${GAME}">Play the game</a> · ${link(PERSON.site, 'Homepage')}</p>
</footer>`
}

/**
 * The background: two ribbons of thin lines that drift like light on silk,
 * drawn once here as plain SVG paths (no images, no script). Each ribbon is
 * a stack of gently phase-shifted sine waves; the middle lines are brightest.
 */
export function silk(): string {
  const ribbon = (n: number, y0: number, gap: number, amp: number, freq: number, phase: number) => {
    const out: string[] = []
    for (let i = 0; i < n; i++) {
      const pts: string[] = []
      for (let x = -80; x <= 1680; x += 40) {
        const y = y0 + i * gap + amp * Math.sin(x * freq + phase + i * 0.11) + amp * 0.6 * Math.sin(x * freq * 0.37 + i * 0.05)
        pts.push(`${x},${Math.round(y)}`)
      }
      const o = (0.06 + 0.3 * Math.sin((Math.PI * (i + 0.5)) / n)).toFixed(2)
      out.push(`<path d="M${pts.join(' L')}" stroke-opacity="${o}"/>`)
    }
    return out.join('')
  }
  return `<svg class="silk" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" focusable="false">
<defs><linearGradient id="silk-ink" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--h1)"/><stop offset="0.45" stop-color="var(--h2)"/><stop offset="0.8" stop-color="var(--h3)"/><stop offset="1" stop-color="var(--h1)"/></linearGradient></defs>
<g class="silk-a" fill="none" stroke="url(#silk-ink)" stroke-width="1">${ribbon(26, 170, 9, 70, 0.0042, 0.2)}</g>
<g class="silk-b" fill="none" stroke="url(#silk-ink)" stroke-width="1">${ribbon(18, 640, 11, 90, 0.0031, 2.1)}</g>
</svg>`
}

/** The whole `<body>` content. */
export function renderResume(): string {
  return [
    '<a class="skip" href="#main">Skip to content</a>',
    `<div class="scene" aria-hidden="true"><div class="glow g1"></div><div class="glow g2"></div><div class="glow g3"></div><div class="dots"></div>${silk()}</div>`,
    ribbon(),
    bar(),
    '<main id="main">',
    hero(),
    ticket(),
    projects(),
    blog(),
    education(),
    experience(),
    leadership(),
    skills(),
    contact(),
    '</main>',
    footer(),
  ].join('\n')
}

/** Title, description, canonical, link previews and structured data. */
export function renderHead(): string {
  const title = `${PERSON.name} — ${PERSON.title}`
  const desc = `${PERSON.name}: a software engineer from ${PERSON.home} who loves solving problems and building apps. ${PERSON.title} at ${PERSON.employer}, founder of Enlacey, open to new opportunities.`
  const img = `${SITE}og.jpg`
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
      homeLocation: { '@type': 'Place', name: `${PERSON.home}, India` },
      email: `mailto:${PERSON.email}`,
      url: SITE,
      sameAs: [PERSON.github, PERSON.linkedin, PERSON.site, CARD.building.href],
      knowsAbout: ['Backend engineering', 'Apache Kafka', 'Apache Flink', 'Distributed systems', 'Java', 'Building apps'],
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
