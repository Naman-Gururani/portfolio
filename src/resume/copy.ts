// "Copy email": the address goes on the clipboard and the button says so for a
// moment. If the clipboard refuses, the mail app opens instead.

type Clip = { writeText(s: string): Promise<void> }

export function wireCopy(
  root: Document,
  clip: Clip | undefined = navigator.clipboard,
  open: (url: string) => void = (u) => location.assign(u),
): void {
  for (const btn of root.querySelectorAll<HTMLElement>('[data-copy-email]')) {
    let timer: ReturnType<typeof setTimeout> | undefined
    btn.addEventListener('click', async () => {
      const email = btn.dataset.email ?? ''
      try {
        if (!clip) throw new Error('no clipboard')
        await clip.writeText(email)
        btn.setAttribute('data-copied', '')
        btn.setAttribute('aria-label', `Copied ${email}`)
        clearTimeout(timer)
        timer = setTimeout(() => {
          btn.removeAttribute('data-copied')
          btn.removeAttribute('aria-label')
        }, 1600)
      } catch {
        open(`mailto:${email}`)
      }
    })
  }
}
