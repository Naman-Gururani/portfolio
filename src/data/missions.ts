// What there is to do at the fair, in the order the story offers it, written
// for somebody who has just arrived and does not know what a "facet" is. One
// entry per attraction — the registry test in `tests/registry.test.ts` says the
// attractions are the whole content routing table, so this list is complete by
// construction.
//
// Names are never retyped here: the sheet reads `Attraction.name`. Copy carries
// no digits and no résumé facts — the cards hold those.
import type { AttractionId } from '../world/blueprint'

export type MissionDone = { kind: 'zones'; zones: string[] } | { kind: 'quest'; quest: string } | { kind: 'found' }

export type Mission = {
  id: AttractionId
  /** On the story spine (ordered, gated by the ticket) or a side stall. */
  story: boolean
  /** What the player does there. */
  does: string
  /** What they get for it. */
  gives: string
  done: MissionDone
}

export const MISSIONS: readonly Mission[] = [
  { id: 'gate', story: true, does: 'Talk to Bo and solve his five-letter word.', gives: 'Your ticket in, and the story of who I am.', done: { kind: 'zones', zones: ['about'] } },
  { id: 'coaster', story: true, does: 'Climb in and ride it — a card slides in at every stop.', gives: 'Where I studied and where I have worked.', done: { kind: 'zones', zones: ['education', 'experience'] } },
  { id: 'prizetent', story: true, does: 'Work the claw machine and pull out the prizes.', gives: 'One card for each thing I have built.', done: { kind: 'zones', zones: ['lineage', 'safestride', 'stealth'] } },
  { id: 'forge', story: true, does: 'Spell tools out of the letter wheel.', gives: 'The whole toolkit I work with.', done: { kind: 'zones', zones: ['skills'] } },
  { id: 'guestbook', story: true, does: 'Sign the book by the exit.', gives: 'Every way to reach me. Never locked.', done: { kind: 'zones', zones: ['contact'] } },
  { id: 'flight', story: false, does: 'Fly a chalk bird through the gaps.', gives: 'A hat, and nothing else.', done: { kind: 'found' } },
  { id: 'arcade', story: false, does: 'Out-last four rivals on a floor that keeps vanishing.', gives: 'A hat, and bragging rights.', done: { kind: 'quest', quest: 'crew' } },
  { id: 'duckpond', story: false, does: 'Hook ducks out of the water for Old Tomas.', gives: 'A cat who follows you around the fair.', done: { kind: 'quest', quest: 'ducks' } },
]

export type MissionView = {
  unlocked: string[]
  questDone: (id: string) => boolean
  discovered: string[]
  /** Has the entry ticket been won? Everything past the gate waits on it. */
  ticket: boolean
}

export type MissionStatus = 'done' | 'next' | 'open' | 'locked'

function isDone(m: Mission, v: MissionView): boolean {
  if (m.done.kind === 'zones') return m.done.zones.every((z) => v.unlocked.includes(z))
  if (m.done.kind === 'quest') return v.questDone(m.done.quest)
  return v.discovered.includes(m.id)
}

/**
 * `next` is the first unfinished stop on the spine and nothing else — the sheet
 * highlights one row, the way the HUD chip names one place. Before the ticket,
 * every stop past the gate reads `locked`: they are all still *there*, and a
 * player who walks to one is not stopped, but the turnstiles are, so the sheet
 * says where to go first rather than sending anyone at a closed gate.
 */
export function missionStatus(m: Mission, v: MissionView): MissionStatus {
  if (isDone(m, v)) return 'done'
  if (!m.story) return 'open'
  if (!v.ticket && m.id !== 'gate') return 'locked'
  const firstOpen = MISSIONS.find((x) => x.story && !isDone(x, v))
  return firstOpen?.id === m.id ? 'next' : 'open'
}

export function statusLabel(s: MissionStatus): string {
  return s === 'done' ? 'Done' : s === 'next' ? 'Next' : s === 'locked' ? 'Ticket first' : 'Open'
}
