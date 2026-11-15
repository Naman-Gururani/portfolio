// The résumé page's only script: motion and controls on top of a page that is
// complete without it (the markup is rendered at build time). Every motion here
// stands down for readers who prefer reduced motion.
import '@fontsource/geist-sans/600.css'
import '@fontsource/geist-sans/700.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import './resume.css'
import { wireCopy } from './copy'
import { activeSection } from './spy'
import { THEME_KEY, initialTheme, nextTheme, type Theme } from './theme'
import { tiltFor } from './tilt'

const root = document.documentElement
const reduced = matchMedia('(prefers-reduced-motion: reduce)')
const finePointer = matchMedia('(hover: hover) and (pointer: fine)')

// ---- the credential: tilt and foil follow a mouse or pen; touch gets one sweep
function wireCredential(): void {
  const card = document.querySelector<HTMLElement>('.cred')
  if (!card) return
  let frame = 0
  let last: PointerEvent | null = null
  const paint = () => {
    frame = 0
    if (!last) return
    const t = tiltFor(last.clientX, last.clientY, card.getBoundingClientRect(), 10)
    card.style.setProperty('--rx', `${t.rx}deg`)
    card.style.setProperty('--ry', `${t.ry}deg`)
    card.style.setProperty('--mx', `${t.mx}%`)
    card.style.setProperty('--my', `${t.my}%`)
  }
  card.addEventListener('pointermove', (e) => {
    if (reduced.matches || e.pointerType === 'touch') return
    last = e
    card.classList.add('is-live')
    if (!frame) frame = requestAnimationFrame(paint)
  })
  card.addEventListener('pointerleave', () => {
    last = null
    card.classList.remove('is-live')
    for (const p of ['--rx', '--ry', '--mx', '--my']) card.style.removeProperty(p)
  })
  if (!finePointer.matches && !reduced.matches) card.classList.add('sweep')
}

// ---- the specular sheen on whichever pane of glass the pointer is over
function wireSheen(): void {
  if (!finePointer.matches) return
  let frame = 0
  let last: PointerEvent | null = null
  document.addEventListener(
    'pointermove',
    (e) => {
      last = e
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const el = (last?.target as Element | null)?.closest<HTMLElement>('.glass')
        if (!el || !last) return
        const r = el.getBoundingClientRect()
        el.style.setProperty('--px', `${last.clientX - r.left}px`)
        el.style.setProperty('--py', `${last.clientY - r.top}px`)
      })
    },
    { passive: true },
  )
}

// ---- the nav marks the section in view
function wireSpy(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.bar-links a[href^="#"]')]
  const strip = document.querySelector<HTMLElement>('.bar-links')
  const targets = links
    .map((a) => document.getElementById(a.hash.slice(1)))
    .filter((el): el is HTMLElement => !!el)
  let current = ''
  let frame = 0
  const update = () => {
    frame = 0
    const tops = targets.map((el) => ({ id: el.id, top: el.getBoundingClientRect().top + scrollY }))
    const id = activeSection(tops, scrollY + innerHeight * 0.3)
    if (id === current) return
    current = id
    for (const a of links) {
      if (a.hash === `#${id}`) {
        a.setAttribute('aria-current', 'true')
        if (strip && strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: a.offsetLeft - 48, behavior: 'smooth' })
      } else a.removeAttribute('aria-current')
    }
  }
  addEventListener('scroll', () => (frame ||= requestAnimationFrame(update)), { passive: true })
  addEventListener('resize', () => (frame ||= requestAnimationFrame(update)))
  update()
}

// ---- two skins, dark first; a diagonal wipe where view transitions exist
function wireTheme(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]')
  let stored: string | null = null
  try {
    stored = localStorage.getItem(THEME_KEY)
  } catch {}
  let theme: Theme = initialTheme(stored)
  const apply = (t: Theme) => {
    root.dataset.theme = t
    btn?.setAttribute('aria-label', t === 'dark' ? 'Switch to the light skin' : 'Switch to the dark skin')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0b0b0c' : '#f1f0ee')
  }
  apply(theme)
  btn?.addEventListener('click', () => {
    theme = nextTheme(theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {}
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    if (doc.startViewTransition && !reduced.matches) doc.startViewTransition(() => apply(theme))
    else apply(theme)
  })
}

// ---- print: every collapsed detail opens for paper, and closes again after
function wirePrint(): void {
  let opened: HTMLDetailsElement[] = []
  addEventListener('beforeprint', () => {
    opened = [...document.querySelectorAll<HTMLDetailsElement>('details:not([open])')]
    for (const d of opened) d.open = true
  })
  addEventListener('afterprint', () => {
    for (const d of opened) d.open = false
    opened = []
  })
  document.querySelector('[data-print]')?.addEventListener('click', () => print())
}

wireCredential()
wireSheen()
wireSpy()
wireTheme()
wirePrint()
wireCopy(document)
