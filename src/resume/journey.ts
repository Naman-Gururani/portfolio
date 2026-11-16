// "Barclays, so far": each chapter opens as the reader scrolls down to it, and
// stays open. The year rail beside the chapters marks the one being read.
// With JS off or reduced motion, every chapter is simply open (CSS default).

/** How many chapters the reader has reached: every one whose top is above the reading line; at least the first. */
export function reachedChapters(tops: number[], line: number): number {
  return Math.max(1, tops.filter((t) => t <= line).length)
}

export function wireJourney(root: Document = document): void {
  const journey = root.querySelector<HTMLElement>('[data-journey]')
  if (!journey) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const chapters = [...journey.querySelectorAll<HTMLElement>('.chapter')]
  const rail = [...journey.querySelectorAll<HTMLAnchorElement>('.journey-rail a')]
  const open = (c: HTMLElement) => {
    if (c.classList.contains('open')) return
    c.classList.add('open')
    c.querySelector('.ch-toggle')?.setAttribute('aria-expanded', 'true')
  }

  journey.classList.add('is-live')
  for (const c of chapters) c.querySelector('.ch-toggle')?.setAttribute('aria-expanded', 'false')

  let frame = 0
  const update = () => {
    frame = 0
    const tops = chapters.map((c) => c.getBoundingClientRect().top + scrollY)
    const reached = reachedChapters(tops, scrollY + innerHeight * 0.72)
    chapters.slice(0, reached).forEach(open)
    // the rail marks the chapter crossing the upper part of the screen
    const current = Math.max(0, reachedChapters(tops, scrollY + innerHeight * 0.38) - 1)
    chapters.forEach((c, i) => c.classList.toggle('current', i === current))
    rail.forEach((a, i) => (i === current ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current')))
    journey.style.setProperty('--progress', String((current + 1) / chapters.length))
  }

  // a reader who clicks a chapter, a rail year or an anchor gets it open at once
  for (const c of chapters) c.querySelector('.ch-toggle')?.addEventListener('click', () => open(c))
  const openHash = () => {
    const target = location.hash ? root.getElementById(location.hash.slice(1)) : null
    const c = target?.closest<HTMLElement>('.chapter')
    if (c) chapters.slice(0, chapters.indexOf(c) + 1).forEach(open)
  }
  addEventListener('hashchange', openHash)
  openHash()

  addEventListener('scroll', () => (frame ||= requestAnimationFrame(update)), { passive: true })
  addEventListener('resize', () => (frame ||= requestAnimationFrame(update)))
  addEventListener('beforeprint', () => chapters.forEach(open))
  update()
}
