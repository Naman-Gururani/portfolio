// Which section the reader is in, for the nav's aria-current.

/** The last section whose top is at or above `line` (page coordinates); '' above the first. */
export function activeSection(tops: { id: string; top: number }[], line: number): string {
  let id = ''
  for (const t of tops) if (t.top <= line) id = t.id
  return id
}
