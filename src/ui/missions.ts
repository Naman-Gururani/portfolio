// The Missions sheet: the answer to "what do I do here, and where?".
//
// People kept arriving at the fair and wandering. This is the one screen that
// says, in plain words, every stop there is, what you do at it, what it hands
// over, whether you have done it yet — and walks you there. It is written for
// somebody who has never played it and is holding a phone in one hand.
//
// Two things it is deliberately not. It is not a walkthrough: it says where to
// go and what you get, never an answer, because the fair is a résumé and not an
// exam — and it says so out loud, near the top, so nobody is afraid to press a
// game. And it is not a second copy of the rules: the mission data lives in
// `data/missions.ts` and the names live on `Attraction.name`, so this module
// only ever renders what those two already say.
//
// The sheet owns no state. `uiState` is the whole view, `missionStatus` is the
// whole verdict, and the walk itself belongs to the world: the sheet asks for it
// with `world:guide` and listens for `guide:state` to draw the bar.
import { events } from '../core/events'
import { MISSIONS, missionStatus, statusLabel, type Mission, type MissionStatus, type MissionView } from '../data/missions'
import { guideTarget } from '../systems/guide'
import { BLUEPRINT } from '../world/blueprint'
import { closeAllModals, el, esc, openModal, uiRoot } from './modal'
import { panelHead, registerPanel, wireClose } from './panels'
import { uiState } from './state'

/**
 * The promise that makes the sheet safe to act on: nothing here is a test, so
 * a row can be pressed without the fear of getting stuck in a puzzle.
 */
const NOTE = 'Every game has a <b>show me</b> button — the fair is a résumé, not an exam.'

/** How the button behaves, so nobody has to guess what "take me there" does. */
const HOWTO = 'Press <b>Take me there</b> and you walk to the stop on your own. Move, and you take over again.'

/**
 * The ticket, said once and properly, at the top of a sheet opened before it is
 * won. Everything at the fair stands inside the fence, so this is the sentence
 * that makes the whole screen make sense.
 */
const GATE_FIRST = 'Everything here is behind the turnstiles, and the turnstiles want a ticket. Until you have one, every <b>Take me there</b> walks you to Bo at the gate.'

/**
 * And the reminder on the row itself, so the redirect is never a surprise at
 * the moment of pressing. One short line, because seven rows carry it at once
 * and seven copies of a paragraph is the wall of text this sheet replaces.
 */
const NEEDS_TICKET = 'Gate first — this walks you to Bo.'

/** Display names are never retyped — the blueprint is the one place they live. */
function nameOf(id: string): string {
  return BLUEPRINT.attractions.find((a) => a.id === id)?.name ?? id
}

/** Everything `missionStatus` needs, read straight off the live UI snapshot. */
function view(): MissionView {
  return {
    unlocked: uiState.unlocked,
    questDone: (id) => !!uiState.quests?.isDone(id),
    discovered: uiState.stats.discoveries,
    ticket: !!uiState.flags.ticket,
  }
}

/**
 * `redirect` is not the same thing as the `locked` status. Every stall at the
 * fair stands *inside* the fence — the side stalls as much as the story ones —
 * so before the ticket there is no road to any of them, even the ones the sheet
 * happily calls Open. Whenever the button is going to go somewhere other than
 * the place named above it, the row says so first.
 */
function rowHTML(m: Mission, s: MissionStatus, redirect: boolean): string {
  return (
    `<li class="ms-row ${s}${redirect ? ' redirects' : ''}" data-id="${esc(m.id)}">` +
    `<div class="ms-head">` +
    `<h3 class="ms-name">${esc(nameOf(m.id))}</h3>` +
    `<span class="ms-status">${esc(statusLabel(s))}</span>` +
    `</div>` +
    `<p class="ms-does">${esc(m.does)}</p>` +
    `<p class="ms-gives"><span class="ms-k">You get</span>${esc(m.gives)}</p>` +
    (redirect ? `<p class="ms-need">${esc(NEEDS_TICKET)}</p>` : '') +
    `<button type="button" class="pbtn ms-go">${redirect ? 'Take me to the gate' : 'Take me there'}` +
    `<span class="sr-only"> — ${esc(nameOf(redirect ? 'gate' : m.id))}</span></button>` +
    `</li>`
  )
}

function sectionHTML(title: string, blurb: string, list: Row[], ticket: boolean): string {
  return (
    `<section class="ms-sec">` +
    `<h2 class="ms-sec-title">${esc(title)}</h2>` +
    `<p class="ms-sec-blurb">${esc(blurb)}</p>` +
    `<ul class="ms-list" role="list">${list.map(({ m, s }) => rowHTML(m, s, guideTarget(m.id, ticket) !== m.id)).join('')}</ul>` +
    `</section>`
  )
}

type Row = { m: Mission; s: MissionStatus }

export function openMissions(): void {
  const v = view()
  const rows = MISSIONS.map((m) => ({ m, s: missionStatus(m, v) }))
  const story = rows.filter((r) => r.m.story)
  const side = rows.filter((r) => !r.m.story)
  const done = story.filter((r) => r.s === 'done').length

  const box = el('div', 'missions')
  box.dataset.width = '620px'
  box.innerHTML =
    panelHead('Missions', 'WHAT TO DO') +
    `<div class="ms-body">` +
    `<p class="ms-count"><b>${done}</b> of ${story.length} story stops done</p>` +
    `<p class="ms-note">${NOTE}</p>` +
    `<p class="ms-howto">${HOWTO}</p>` +
    (v.ticket ? '' : `<p class="ms-gate">${GATE_FIRST}</p>`) +
    sectionHTML('The story', 'Five stops, in order. Each one hands over a piece of the résumé.', story, v.ticket) +
    sectionHTML('Just for fun', 'No résumé in these — a hat, a cat, and bragging rights.', side, v.ticket) +
    `</div>` +
    `<footer class="modal-foot"><button type="button" class="pbtn" data-act="close">Close</button></footer>`

  box.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.ms-go')
    const id = btn?.closest<HTMLElement>('.ms-row')?.dataset.id
    if (!id) return
    // Read the ticket again at press time rather than trusting the render: a
    // sheet left open across a win would otherwise still be sending people to
    // the gate they have already walked through.
    const target = guideTarget(id, !!uiState.flags.ticket)
    // The sheet gets out of the way first — the walk happens in the world, and
    // nobody can watch it through a dialog.
    closeAllModals()
    events.emit('world:guide', { id: target })
  })

  wireClose(box, 'missions')
  openModal({ id: 'missions', el: box, label: 'Missions — what to do and where' })
}

/* ---------------- the guide bar ---------------- */

/**
 * A slim bar at the top of the overlay while the world is walking you somewhere:
 * where you are headed, and the one thing you need to know — that moving takes
 * the controls back. The world owns the walk and reports it with `guide:state`;
 * this only draws it.
 */
let bar: HTMLElement | null = null
let barText: HTMLElement | null = null
/** Dropped before a second `initMissions` wires a second bar to the same event. */
let offGuide: (() => void) | null = null

function mountBar(): void {
  // A remount (the tests, a fresh `#ui`) leaves the old bar in a document
  // nobody is looking at any more; rebuild rather than write into a ghost.
  if (bar?.isConnected) return
  const node = el('div', 'ms-bar')
  node.hidden = true
  node.setAttribute('role', 'status')
  node.innerHTML = `<i class="ms-bar-arrow" aria-hidden="true">➤</i><span class="ms-bar-text"></span>`
  uiRoot().appendChild(node)
  bar = node
  barText = node.querySelector<HTMLElement>('.ms-bar-text')
}

export function initMissions(): void {
  registerPanel('missions', () => openMissions())
  mountBar()
  offGuide?.()
  offGuide = events.on('guide:state', ({ to }) => {
    if (!bar || !barText) return
    bar.hidden = !to
    if (to) barText.textContent = `Walking to ${nameOf(to)} — move to stop`
  })
}
