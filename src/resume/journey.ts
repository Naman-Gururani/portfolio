// "Barclays, so far": each chapter's details fade in as the reader scrolls down
// to it, and stay. Nothing changes size (only opacity and transform animate),
// so anchor jumps, find-in-page and the End key land where they should. The year
// rail beside the chapters marks the one being read, motion or not.
// With JS off, or reduced motion, every chapter is simply shown.

/** How many chapters the reader has reached: every one whose top is above the reading line; at least the first. */
export function reachedChapters(tops: number[], line: number): number {
  return Math.max(1, tops.filter((t) => t <= line).length)
}

export function wireJourney(root: Document = document): void {
  const journey = root.querySelector<HTMLElement>('[data-journey]')
  if (!journey) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const chapters = [...journey.querySelectorAll<HTMLElement>('.chapter')]
  const rail = [...journey.querySelectorAll<HTMLAnchorElement>('.journey-rail a')]

  if (!reduced) journey.classList.add('is-live')

  let frame = 0
  const update = () => {
    frame = 0
    const tops = chapters.map((c) => c.getBoundingClientRect().top + scrollY)
    const reached = reachedChapters(tops, scrollY + innerHeight * 0.78)
    chapters.slice(0, reached).forEach((c) => c.classList.add('open'))
    // the rail marks the chapter crossing the upper part of the screen
    const current = Math.max(0, reachedChapters(tops, scrollY + innerHeight * 0.38) - 1)
    chapters.forEach((c, i) => c.classList.toggle('current', i === current))
    rail.forEach((a, i) => (i === current ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current')))
    journey.style.setProperty('--progress', String((current + 1) / chapters.length))
  }

  addEventListener('scroll', () => (frame ||= requestAnimationFrame(update)), { passive: true })
  addEventListener('resize', () => (frame ||= requestAnimationFrame(update)))
  addEventListener('beforeprint', () => chapters.forEach((c) => c.classList.add('open')))
  update()
}
