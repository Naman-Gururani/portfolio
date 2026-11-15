# Game Guidance (phones) Implementation Plan

> **Status (2026-09-25):** all ten tasks executed 2026-09-23, reviewed, merged to `main` and published. The final fix wave added HUD wrapping at 720px and a deferred touch hint beyond this plan's text. Every deviation from it, and why, is in `docs/superpowers/2026-09-23-rulings.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Naman's World Fair legible on a phone — action buttons that name what they do, a blink on anything that wants a tap, a Missions sheet that explains all eight stops, and a "Take me there" walk that only runs when asked — and move the game from `/lineage/` to `/portfolio/`.

**Architecture:** Three pure modules carry the new logic (`systems/verbs.ts` for the verb of an interactable, `data/missions.ts` for the mission list, `systems/guide.ts` for routing and per-frame steering), each unit-tested with no Phaser and no DOM. The DOM layer grows one panel (`ui/missions.ts`) and one shared CSS treatment (`.nudge`). `WorldScene` gains a guide runner that feeds the existing `player.move` the same way the joystick does, so collision, animation and region banners are untouched.

**Tech Stack:** TypeScript (strict), Phaser 3, Vite, vitest + happy-dom.

**Spec:** `docs/superpowers/specs/2026-09-14-guide-printstream-profile-design.md` (§A, §B1, §A6)

## Global Constraints

- **Never commit, push or deploy unless the user asks.** Tasks below end with a commit step; make the commit, nothing else. (The user approved implementation; publishing is a separate, later go-ahead.)
- Commit trailers on every commit:
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01SVLAWGJCNP4Y3sCH8cUJPD`.
- Résumé facts come only from `src/data/content.ts`. Mission copy describes the *game*, carries **no digits** and **no résumé facts**. Attraction names come from `Attraction.name`, never retyped.
- World input goes through `src/core/keys.ts`; **`src/ui/*` must never import it** (`tests/module-graph.test.ts` enforces this). UI reads DOM events instead.
- `core/`, `world/`, `src/data/*`, `src/games/*`, `systems/ridepath.ts` **and the two new pure modules** (`systems/verbs.ts`, `systems/guide.ts`) must not import Phaser or DOM.
- Reduced motion (`prefers-reduced-motion` or the in-game toggle, which sets `.reduce-motion` on `<html>`) must degrade animation, never remove a cue.
- Gates after every task: `npx vitest run`, `npx tsc --noEmit`. Baseline before this plan: **66 files / 1105 tests / 0 skips**, tsc clean.
- Browser checks run against the **static preview** (`npm run build && npx vite preview --port 4173`), never the dev server. The world's action key needs a **~120 ms held press**; the interact radius is **26 px**.
- New CSS files must be imported in `src/main.ts` beside `./styles/ride.css`.

## Review Focus

1. **Guiding past a locked gate.** Before the ticket is won the turnstiles are solid; a route to the coaster must not path through them. Missions must send the player to Bo instead, and the router must treat gated structures as blocked while their flag is unset. *(Task 5 test, Task 6 test.)*
2. **No route at all.** A player boxed in (hopped behind the coaster spans) asks for a walk that A\* cannot solve. Expected: the game says so once and falls back to the existing fade-travel rather than standing still or walking into a wall forever. *(Task 5 test `routeTiles` → null; Task 7 fallback.)*
3. **Reduced motion.** The blink is the only cue that a button matters; under reduced motion it must become a static outline that is still visible, and the guided walk must still run. *(Task 3 test.)*
4. **Keyboard and screen reader.** The Missions button is on the HUD bar where a pointer click must blur the button (Space is the hop) but a keyboard activation must keep focus; each mission row is reachable by Tab and its status is spoken, not just coloured. *(Task 6 tests.)*
5. **Desktop must not regress.** The verb work changes the `ui:prompt` payload that the desktop prompt chip also consumes; an interactable with no verb must still render exactly as it does today. *(Task 1 and Task 3 tests.)*

---

### Task 1: Verbs on interactables

**Files:**
- Create: `src/systems/verbs.ts`
- Create: `tests/verbs.test.ts`
- Modify: `src/systems/Interact.ts` (the `Interactable` interface and `setCurrent`)
- Modify: `src/core/events.ts` (the `ui:prompt` payload)
- Modify: `src/scenes/WorldScene.ts` (door registration ~line 396, forge board ~line 516, duck pond ~line 535, turnstile ~line 548, lights ~line 570, balloon ~line 600, NPC ~line 636, cat ~line 1225)
- Modify: `src/entities/Chest.ts` (~line 24), `src/entities/Sign.ts` (~line 25)

**Interfaces:**
- Consumes: `Attraction.interact` strings from `src/world/blueprint.ts` (`booth:bo`, `ride:coaster`, `minigame:claw|forge|flappy|crew`, `duckpond`, `panel:zone:contact`).
- Produces: `verbFor(opts: { verb?: string; interact?: string; prompt: string }): string` and `IDLE_VERB = 'SWING'`; `Interactable.verb?: string`; `events 'ui:prompt'` payload `{ text: string | null; key?: string; verb?: string }`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/verbs.test.ts
import { describe, expect, it } from 'vitest'
import { BLUEPRINT } from '../src/world/blueprint'
import { IDLE_VERB, verbFor } from '../src/systems/verbs'

describe('verbFor', () => {
  it('reads an explicit verb first', () => {
    expect(verbFor({ verb: 'PET', prompt: 'Pet Byte' })).toBe('PET')
  })

  it('maps every attraction dispatch to a verb', () => {
    const got = BLUEPRINT.attractions.map((a) => verbFor({ interact: a.interact, prompt: a.name }))
    expect(got).toEqual(['TALK', 'RIDE', 'PLAY', 'PLAY', 'PLAY', 'PLAY', 'HOOK', 'SIGN'])
  })

  it('falls back to the prompt wording', () => {
    expect(verbFor({ prompt: 'Talk to Bo' })).toBe('TALK')
    expect(verbFor({ prompt: 'Read the sign' })).toBe('READ')
    expect(verbFor({ prompt: 'Open the prize box' })).toBe('OPEN')
    expect(verbFor({ prompt: 'Take the balloon' })).toBe('TAKE')
  })

  it('never returns an empty label', () => {
    expect(verbFor({ prompt: 'Something nobody planned for' })).toBe('USE')
    expect(IDLE_VERB).toBe('SWING')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run tests/verbs.test.ts`
Expected: FAIL — `Cannot find module '../src/systems/verbs'`.

- [ ] **Step 3: Write the module**

```ts
// src/systems/verbs.ts
//
// One word for what the action button will do. The touch button shows it, the
// desktop prompt's key chip carries it as a title, and a screen reader hears it
// in the button's label. Pure: no Phaser, no DOM.
//
// Priority is: the verb the interactable declares, then what its dispatch
// string says, then the wording of its prompt, then a plain USE.

/** What the action button says when nothing is in range — the wrench swing. */
export const IDLE_VERB = 'SWING'

const BY_DISPATCH: [RegExp, string][] = [
  [/^booth:/, 'TALK'],
  [/^ride:/, 'RIDE'],
  [/^minigame:/, 'PLAY'],
  [/^duckpond$/, 'HOOK'],
  [/^panel:zone:contact$/, 'SIGN'],
  [/^panel:/, 'READ'],
]

const BY_PROMPT: [RegExp, string][] = [
  [/^talk to /i, 'TALK'],
  [/^read /i, 'READ'],
  [/^open /i, 'OPEN'],
  [/^take /i, 'TAKE'],
  [/^pet /i, 'PET'],
  [/^hook /i, 'HOOK'],
  [/^turnstile$/i, 'PUSH'],
  [/lights$/i, 'SWITCH'],
]

export function verbFor(o: { verb?: string; interact?: string; prompt: string }): string {
  if (o.verb) return o.verb
  if (o.interact) for (const [re, v] of BY_DISPATCH) if (re.test(o.interact)) return v
  for (const [re, v] of BY_PROMPT) if (re.test(o.prompt)) return v
  return 'USE'
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run tests/verbs.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Carry the verb through the interact system**

In `src/systems/Interact.ts`, add to the interface and the emit:

```ts
export interface Interactable {
  x: number
  y: number
  radius: number
  prompt: string
  /** One word for the action button. Falls back to `verbFor` when absent. */
  verb?: string
  key?: string
  enabled?: () => boolean
  onInteract: () => void | Promise<void>
  priority?: number
}
```

and in `setCurrent`, replace the emit line with:

```ts
    events.emit('ui:prompt', i ? { text: i.prompt, key: i.key ?? 'E', verb: verbFor({ verb: i.verb, prompt: i.prompt }) } : { text: null })
```

with `import { verbFor } from './verbs'` at the top. In `src/core/events.ts` widen the payload:

```ts
  'ui:prompt': { text: string | null; key?: string; verb?: string }
```

- [ ] **Step 6: Label every call site**

`src/scenes/WorldScene.ts` — the door object in `buildAttractions()` gains one line:

```ts
      const door: Interactable = {
        x: dx,
        y: dy,
        radius: 26,
        prompt: a.name,
        verb: verbFor({ interact: a.interact, prompt: a.name }),
        priority: 4,
        onInteract: () => void this.useAttraction(a),
      }
```

(import `verbFor` from `../systems/verbs`). Then add `verb:` to the other registrations: forge board `verb: 'READ'`, duck pond `verb: 'HOOK'`, turnstile `verb: 'PUSH'`, lights `verb: 'SWITCH'`, balloon `verb: 'TAKE'`, NPC `verb: 'TALK'`, cat `verb: 'PET'`. `src/entities/Chest.ts` gains `verb: 'OPEN'`, `src/entities/Sign.ts` gains `verb: 'READ'`.

- [ ] **Step 7: Pin that every live interactable has a verb**

Append to `tests/verbs.test.ts`:

```ts
it('gives the fair stalls a label a person would read', () => {
  const byId = Object.fromEntries(BLUEPRINT.attractions.map((a) => [a.id, verbFor({ interact: a.interact, prompt: a.name })]))
  expect(byId.gate).toBe('TALK')
  expect(byId.coaster).toBe('RIDE')
  expect(byId.guestbook).toBe('SIGN')
  expect(byId.duckpond).toBe('HOOK')
})
```

- [ ] **Step 8: Run the gates**

Run: `npx vitest run && npx tsc --noEmit`
Expected: all green, 1105 + 5 tests.

- [ ] **Step 9: Commit**

```bash
git add src/systems/verbs.ts tests/verbs.test.ts src/systems/Interact.ts src/core/events.ts src/scenes/WorldScene.ts src/entities/Chest.ts src/entities/Sign.ts
git commit -m "feat(input): every interactable carries an action verb"
```

---

### Task 2: Touch buttons that say what they do

**Files:**
- Modify: `src/ui/touch.ts`
- Modify: `src/styles/ui.css` (the `.tb` block, ~line 855)
- Create: `tests/ui-touch.test.ts`

**Interfaces:**
- Consumes: `events 'ui:prompt' { text, key, verb }` from Task 1; `IDLE_VERB`.
- Produces: DOM contract `.tb-a` contains `.tb-verb` (the word) and carries `aria-label` = the prompt; `.tb-a.idle` when nothing is in range; `.tb-b` reads `JUMP`.

- [ ] **Step 1: Write the failing test**

```ts
// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest'
import { events } from '../src/core/events'
import { initTouch } from '../src/ui/touch'

const root = () => document.getElementById('ui') as HTMLElement
const a = () => root().querySelector('.tb-a') as HTMLButtonElement

describe('touch buttons', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="ui"></div>'
    initTouch(root())
  })

  it('names the hop button', () => {
    expect((root().querySelector('.tb-b') as HTMLElement).textContent).toContain('JUMP')
  })

  it('shows the swing label with nothing in range', () => {
    events.emit('ui:prompt', { text: null })
    expect(a().textContent).toContain('SWING')
    expect(a().classList.contains('idle')).toBe(true)
  })

  it('takes the verb and the prompt of whatever is in range', () => {
    events.emit('ui:prompt', { text: 'Career Coaster', key: 'E', verb: 'RIDE' })
    expect(a().textContent).toContain('RIDE')
    expect(a().getAttribute('aria-label')).toBe('Career Coaster')
    expect(a().classList.contains('idle')).toBe(false)
  })

  it('falls back to a verb when the event carries none', () => {
    events.emit('ui:prompt', { text: 'Talk to Bo' })
    expect(a().textContent).toContain('TALK')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run tests/ui-touch.test.ts`
Expected: FAIL — the button's text is `A`.

- [ ] **Step 3: Rewrite the buttons in `src/ui/touch.ts`**

Replace the `.tbuttons` markup:

```ts
    <div class="tbuttons">
      <button class="tb tb-b" aria-label="Jump"><span class="tb-icon" aria-hidden="true">⤒</span><span class="tb-verb">JUMP</span></button>
      <button class="tb tb-a idle" aria-label="Swing the wrench"><span class="tb-verb">SWING</span></button>
    </div>
```

and, after the A/B listeners, add the subscription (import `verbFor, IDLE_VERB` from `../systems/verbs`):

```ts
  // The action button names what it will do. `ui:prompt` fires whenever what is
  // in reach changes — the same event the desktop prompt chip listens to — so
  // the label, the screen-reader name and the nudge all move together.
  const aVerb = a.querySelector('.tb-verb') as HTMLElement
  events.on('ui:prompt', ({ text, verb }) => {
    const idle = !text
    aVerb.textContent = idle ? IDLE_VERB : verb ?? verbFor({ prompt: text })
    a.setAttribute('aria-label', idle ? 'Swing the wrench' : text)
    a.classList.toggle('idle', idle)
  })
```

- [ ] **Step 4: Style them**

In `src/styles/ui.css`, replace the `.tb` / `.tb-a` / `.tb-b` rules with pill buttons that still clear the 44 px touch minimum:

```css
.tb {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 74px;
  min-height: 74px;
  padding: 0 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  font-family: var(--font-accent);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--on-accent);
  box-shadow: var(--shadow-sm);
  pointer-events: auto;
  touch-action: manipulation;
  transition: transform var(--t-fast) var(--ease), opacity var(--t-fast) var(--ease);
}
.tb-verb {
  line-height: 1;
}
.tb-icon {
  font-size: 1rem;
  line-height: 1;
}
.tb-a {
  background: var(--accent);
  min-width: 86px;
  min-height: 86px;
  font-size: 0.86rem;
}
/* Nothing in reach: the button still swings the wrench, so it stays usable —
   just quiet, so the lit state means "there is something here". */
.tb-a.idle {
  opacity: 0.55;
  background: rgba(16, 22, 34, 0.72);
  color: var(--ink);
}
.tb-b {
  background: rgba(125, 211, 252, 0.9);
  margin-bottom: 10px;
  min-width: 64px;
  min-height: 64px;
}
.tb:active {
  transform: scale(0.94);
}
```

- [ ] **Step 5: Run the test and watch it pass**

Run: `npx vitest run tests/ui-touch.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Check the minimap still clears the buttons**

The phone rule in `src/styles/panels.css:912` lifts `.minimap` 90 px above `.tbuttons`. The A button grew from 74 to 86 px, so raise that offset to **104 px** in the same rule and note it in the comment.

- [ ] **Step 7: Gates and commit**

```bash
npx vitest run && npx tsc --noEmit
git add src/ui/touch.ts src/styles/ui.css src/styles/panels.css tests/ui-touch.test.ts
git commit -m "feat(touch): action buttons name what they do"
```

---

### Task 3: The nudge — blink what needs a tap

**Files:**
- Modify: `src/styles/ui.css` (new `.nudge` block near the motion-preferences section, ~line 930)
- Modify: `src/ui/touch.ts`, `src/ui/prompt.ts`, `src/ui/dialogue.ts`, `src/ui/ridecard.ts`, `src/ui/welcome.ts`, `src/ui/map.ts`
- Modify: `tests/ui-touch.test.ts`; Create: `tests/ui-nudge.test.ts`

**Interfaces:**
- Produces: the class name `nudge`, applied and removed by each renderer. No JS module — one CSS contract shared by six call sites.

- [ ] **Step 1: Write the failing test**

```ts
// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest'
import { events } from '../src/core/events'
import { initTouch } from '../src/ui/touch'

const root = () => document.getElementById('ui') as HTMLElement

describe('the nudge', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="ui"></div>'
    initTouch(root())
  })

  it('blinks the action button only while something is in reach', () => {
    const a = root().querySelector('.tb-a') as HTMLElement
    events.emit('ui:prompt', { text: null })
    expect(a.classList.contains('nudge')).toBe(false)
    events.emit('ui:prompt', { text: 'Career Coaster', verb: 'RIDE' })
    expect(a.classList.contains('nudge')).toBe(true)
    events.emit('ui:prompt', { text: null })
    expect(a.classList.contains('nudge')).toBe(false)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run tests/ui-nudge.test.ts`
Expected: FAIL — the class is never added.

- [ ] **Step 3: Add the CSS treatment**

```css
/* ---------- the nudge ----------
   One treatment for "this is the thing to press". A ring grows out of the
   control and fades; the control itself does not move, so a thumb already on
   the way does not miss. Under reduced motion the ring stops animating but
   stays drawn — the cue is the whole point, so it is never removed. */
.nudge {
  position: relative;
}
.nudge::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: inherit;
  border: 2px solid var(--accent-warm);
  opacity: 0;
  pointer-events: none;
  animation: nudgering 1.15s var(--ease) infinite;
}
@keyframes nudgering {
  0% { transform: scale(0.94); opacity: 0.9; }
  70% { transform: scale(1.12); opacity: 0; }
  100% { transform: scale(1.12); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .nudge::after { animation: none; opacity: 0.95; transform: none; }
}
:root.reduce-motion .nudge::after { animation: none; opacity: 0.95; transform: none; }
```

- [ ] **Step 4: Apply it at the six call sites**

- `src/ui/touch.ts` — inside the `ui:prompt` handler added in Task 2: `a.classList.toggle('nudge', !idle)`.
- `src/ui/prompt.ts` — in the `ui:prompt` handler, after `el.classList.add('show')`, add `el.querySelector('.pkey')?.classList.add('nudge')` (the chip is rebuilt each time, so nothing to remove).
- `src/ui/dialogue.ts` — where `next.hidden = false` is set (~line 241) add `next.classList.add('nudge')`; where `next.hidden = true` (~lines 213, 257) add `next.classList.remove('nudge')`. Give the element `role="button"`, `tabindex="0"` and text "Tap to continue" on touch layouts (`matchMedia('(pointer: coarse)').matches`), and wire a `click` listener that advances the same way Enter does.
- `src/ui/ridecard.ts` — in `ensure()`, render the button as `class="pbtn primary ride-next nudge"`.
- `src/ui/welcome.ts` — in `build()`, the Start button becomes `class="wbtn primary nudge"`.
- `src/ui/map.ts` — wherever `travel.disabled` is set, mirror it: `travel.classList.toggle('nudge', !travel.disabled)`.

- [ ] **Step 5: Extend the test to the other five**

Add to `tests/ui-nudge.test.ts` a case per renderer that mounts it and asserts the class appears exactly when the control is actionable — dialogue's continue after a line finishes, the ride card's Next while a beat is up, Start while the welcome card is open, Travel only once a discovered place is selected.

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run tests/ui-nudge.test.ts tests/ui-touch.test.ts`
Expected: PASS.

- [ ] **Step 7: Gates and commit**

```bash
npx vitest run && npx tsc --noEmit
git add src/styles/ui.css src/ui/touch.ts src/ui/prompt.ts src/ui/dialogue.ts src/ui/ridecard.ts src/ui/welcome.ts src/ui/map.ts tests/ui-nudge.test.ts tests/ui-touch.test.ts
git commit -m "feat(ui): blink whatever is waiting to be pressed"
```

---

### Task 4: The mission list (pure data)

**Files:**
- Create: `src/data/missions.ts`
- Create: `tests/missions.test.ts`

**Interfaces:**
- Consumes: `BLUEPRINT.attractions` (ids and names), `STORY_ORDER` from `src/data/story.ts`.
- Produces:
  ```ts
  export type MissionDone = { kind: 'zones'; zones: string[] } | { kind: 'quest'; quest: string } | { kind: 'found' }
  export type Mission = { id: AttractionId; story: boolean; does: string; gives: string; done: MissionDone }
  export const MISSIONS: readonly Mission[]
  export type MissionView = { unlocked: string[]; questDone: (id: string) => boolean; discovered: string[]; ticket: boolean }
  export type MissionStatus = 'done' | 'next' | 'open' | 'locked'
  export function missionStatus(m: Mission, v: MissionView): MissionStatus
  export function statusLabel(s: MissionStatus): string
  ```

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { MISSIONS, missionStatus, type MissionView } from '../src/data/missions'
import { BLUEPRINT } from '../src/world/blueprint'

const view = (o: Partial<MissionView> = {}): MissionView => ({ unlocked: [], questDone: () => false, discovered: [], ticket: true, ...o })

describe('missions', () => {
  it('covers every attraction exactly once', () => {
    const ids = MISSIONS.map((m) => m.id).sort()
    expect(ids).toEqual(BLUEPRINT.attractions.map((a) => a.id).sort())
  })

  it('opens with the ticket and ends at the guestbook', () => {
    const story = MISSIONS.filter((m) => m.story).map((m) => m.id)
    expect(story).toEqual(['gate', 'coaster', 'prizetent', 'forge', 'guestbook'])
  })

  it('says nothing a résumé would say', () => {
    for (const m of MISSIONS) {
      expect(m.does + m.gives).not.toMatch(/\d/)
      expect(m.does.length).toBeLessThanOrEqual(90)
    }
  })

  it('locks the fair behind the ticket', () => {
    const coaster = MISSIONS.find((m) => m.id === 'coaster')!
    expect(missionStatus(coaster, view({ ticket: false }))).toBe('locked')
    // With the ticket won and About unlocked, the gate is done and the coaster
    // is the stop being pointed at.
    expect(missionStatus(coaster, view({ unlocked: ['about'] }))).toBe('next')
    // With the ticket won but the gate unfinished, the coaster is merely open.
    expect(missionStatus(coaster, view())).toBe('open')
  })

  it('marks a chapter done once its zones are unlocked', () => {
    const forge = MISSIONS.find((m) => m.id === 'forge')!
    expect(missionStatus(forge, view({ unlocked: ['skills'] }))).toBe('done')
  })

  it('points at the first unfinished stop, and only that one', () => {
    const v = view({ unlocked: ['about'] })
    const next = MISSIONS.filter((m) => missionStatus(m, v) === 'next')
    expect(next.map((m) => m.id)).toEqual(['coaster'])
  })

  it('counts a side stop by its own quest', () => {
    const arcade = MISSIONS.find((m) => m.id === 'arcade')!
    expect(missionStatus(arcade, view())).toBe('open')
    expect(missionStatus(arcade, view({ questDone: (q) => q === 'crew' }))).toBe('done')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run tests/missions.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the data**

```ts
// src/data/missions.ts
//
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
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run tests/missions.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Gates and commit**

```bash
npx vitest run && npx tsc --noEmit
git add src/data/missions.ts tests/missions.test.ts
git commit -m "feat(missions): the fair's to-do list as data"
```

---

### Task 5: Routing — the pure half of "Take me there"

**Files:**
- Create: `src/systems/guide.ts`
- Create: `tests/guide.test.ts`

**Interfaces:**
- Consumes: `astar` from `src/world/paths.ts`, `Grid`/`T` from `src/world/terrain.ts`, `TILE` from `src/config.ts`, `Vec2` from `src/world/regions.ts`.
- Produces:
  ```ts
  export type TileBlocked = (tx: number, ty: number) => boolean
  export function routeTiles(grid: Grid, from: Vec2, to: Vec2, blocked: TileBlocked): Vec2[] | null
  export function waypoints(path: Vec2[]): Vec2[]
  export function stepAlong(px: number, py: number, wps: Vec2[], i: number, reach?: number): { i: number; dx: number; dy: number; arrived: boolean }
  export const REACH_PX = 10
  ```

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { REACH_PX, routeTiles, stepAlong, waypoints } from '../src/systems/guide'
import { TILE } from '../src/config'
import { makeGrid, T } from '../src/world/terrain'

/** A flat lawn; the walls come from the `blocked` predicate each test passes. */
const lawn = (w: number, h: number) => makeGrid(w, h, T.GRASS)

describe('routeTiles', () => {
  it('walks a straight line across open lawn', () => {
    const path = routeTiles(lawn(10, 10), { x: 1, y: 1 }, { x: 5, y: 1 }, () => false)!
    expect(path[0]).toEqual({ x: 1, y: 1 })
    expect(path[path.length - 1]).toEqual({ x: 5, y: 1 })
  })

  it('goes round a wall instead of through it', () => {
    const blocked = (x: number, y: number) => x === 3 && y < 8
    const path = routeTiles(lawn(10, 10), { x: 1, y: 1 }, { x: 5, y: 1 }, blocked)!
    expect(path.some((p) => p.x === 3 && p.y < 8)).toBe(false)
    expect(path.length).toBeGreaterThan(5)
  })

  it('returns null when there is no way through', () => {
    const blocked = (x: number) => x === 3
    expect(routeTiles(lawn(10, 10), { x: 1, y: 1 }, { x: 5, y: 1 }, blocked)).toBeNull()
  })

  it('refuses a destination outside the world', () => {
    expect(routeTiles(lawn(10, 10), { x: 1, y: 1 }, { x: 99, y: 1 }, () => false)).toBeNull()
  })
})

describe('waypoints', () => {
  it('keeps only the corners', () => {
    const path = [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
      { x: 3, y: 2 }, { x: 3, y: 3 },
    ]
    expect(waypoints(path)).toEqual([{ x: 3, y: 1 }, { x: 3, y: 3 }])
  })

  it('survives a one-tile path', () => {
    expect(waypoints([{ x: 4, y: 4 }])).toEqual([{ x: 4, y: 4 }])
  })
})

describe('stepAlong', () => {
  const wps = [{ x: 3, y: 1 }, { x: 3, y: 3 }]

  it('steers toward the next corner', () => {
    const s = stepAlong(1 * TILE + TILE / 2, 1 * TILE + TILE / 2, wps, 0)
    expect(s.dx).toBeCloseTo(1)
    expect(s.dy).toBeCloseTo(0)
    expect(s.arrived).toBe(false)
  })

  it('advances the index once a corner is reached', () => {
    const s = stepAlong(3 * TILE + TILE / 2, 1 * TILE + TILE / 2, wps, 0)
    expect(s.i).toBe(1)
  })

  it('reports arrival at the last waypoint', () => {
    const s = stepAlong(3 * TILE + TILE / 2 + REACH_PX - 1, 3 * TILE + TILE / 2, wps, 1)
    expect(s.arrived).toBe(true)
    expect(s.dx).toBe(0)
    expect(s.dy).toBe(0)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run tests/guide.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the module**

```ts
// src/systems/guide.ts
//
// "Take me there": the route, and the steering that follows it. Pure — no
// Phaser, no DOM, no timers. The scene owns the walking; this owns the maths,
// so both halves can be tested and the scene stays a thin runner.
//
// The route is the world's own A* (`world/paths.ts`), the one the roads were
// carved with, given a cost that refuses blocked tiles outright and prefers
// paving — so a guided walk uses the midway rather than cutting across the
// lawn, which is also how a person would walk it.
import { TILE } from '../config'
import { astar } from '../world/paths'
import type { Vec2 } from '../world/regions'
import { T, type Grid } from '../world/terrain'

export type TileBlocked = (tx: number, ty: number) => boolean

/** How close counts as standing on a waypoint. */
export const REACH_PX = 10

const PAVED = new Set<number>([T.PLAZA, T.PATH, T.BRIDGE, T.DOCK])

export function routeTiles(grid: Grid, from: Vec2, to: Vec2, blocked: TileBlocked): Vec2[] | null {
  if (!grid.inb(Math.floor(to.x), Math.floor(to.y))) return null
  return astar(grid, from, to, (t, x, y) => {
    if (blocked(x, y)) return Infinity
    return PAVED.has(t) ? 1 : 1.4
  })
}

/** The corners of a tile path — a straight run needs no steering in the middle. */
export function waypoints(path: Vec2[]): Vec2[] {
  if (path.length <= 1) return path.slice()
  const out: Vec2[] = []
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1]
    const cur = path[i]
    const next = path[i + 1]
    if (!next) {
      out.push(cur)
      break
    }
    const turning = (next.x - cur.x) !== (cur.x - prev.x) || (next.y - cur.y) !== (cur.y - prev.y)
    if (turning) out.push(cur)
  }
  return out
}

/**
 * One frame of steering: the unit vector to aim at, the waypoint index to keep,
 * and whether the walk is over. The caller feeds `dx`/`dy` into the same
 * `player.move` the joystick drives, so collision and animation are unchanged.
 */
export function stepAlong(px: number, py: number, wps: Vec2[], i: number, reach = REACH_PX): { i: number; dx: number; dy: number; arrived: boolean } {
  let idx = i
  while (idx < wps.length) {
    const w = wps[idx]
    const tx = w.x * TILE + TILE / 2
    const ty = w.y * TILE + TILE / 2
    const dx = tx - px
    const dy = ty - py
    const d = Math.hypot(dx, dy)
    if (d <= reach) {
      idx++
      continue
    }
    return { i: idx, dx: dx / d, dy: dy / d, arrived: false }
  }
  return { i: wps.length, dx: 0, dy: 0, arrived: true }
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run tests/guide.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Pin the gated-turnstile case against the real fair**

Add to `tests/guide.test.ts` (this is Review Focus 1 — it uses the real blueprint, not a fake lawn):

```ts
import { WORLD_TH, WORLD_TW } from '../src/config'
import { BLUEPRINT, attractionSolids, structureSolids } from '../src/world/blueprint'

/** Tile keys covered by a list of tile rectangles. */
function fill(walls: Set<string>, rects: { x: number; y: number; w: number; h: number }[]): void {
  for (const r of rects) for (let x = r.x; x < r.x + r.w; x++) for (let y = r.y; y < r.y + r.h; y++) walls.add(`${x},${y}`)
}

it('will not route through the turnstiles while they stand', () => {
  // `structureSolids` takes a flag *predicate*; with nothing set, the gated
  // turnstiles are still solid — which is exactly the state a player is in
  // before they win the ticket.
  const walls = new Set<string>()
  fill(walls, structureSolids(BLUEPRINT, () => false))
  for (const a of BLUEPRINT.attractions) fill(walls, attractionSolids(a))
  const grid = makeGrid(WORLD_TW, WORLD_TH, T.PLAZA)
  const gate = BLUEPRINT.attractions.find((a) => a.id === 'gate')!
  const path = routeTiles(grid, gate.door, { x: 50, y: 16 }, (x, y) => walls.has(`${x},${y}`))
  // The turnstile halves stand at (34,51) and (36,51). Whether A* finds a way
  // round them or none at all, it must never walk through one.
  if (path) expect(path.some((p) => p.y === 51 && (p.x === 34 || p.x === 36))).toBe(false)
})
```

- [ ] **Step 6: Gates and commit**

```bash
npx vitest run && npx tsc --noEmit
git add src/systems/guide.ts tests/guide.test.ts
git commit -m "feat(guide): route and steering for a guided walk"
```

---

### Task 6: The Missions sheet

**Files:**
- Create: `src/ui/missions.ts`, `src/styles/missions.css`
- Create: `tests/ui-missions.test.ts`
- Modify: `src/main.ts` (import the stylesheet after `./styles/ride.css`), `src/ui/index.ts` (call `initMissions()` beside `initForgeboard()`), `src/ui/hud.ts` (the Missions button; the objective chip opens missions), `src/core/events.ts` (`world:guide`, `guide:state`)

**Interfaces:**
- Consumes: `MISSIONS`, `missionStatus`, `statusLabel`, `MissionView` (Task 4); `uiState` (`unlocked`, `flags`, `quests`, `stats.discoveries`); `BLUEPRINT.attractions` for names; `registerPanel`, `panelHead`, `wireClose`, `openModal`, `closeAllModals`.
- Produces: panel id `'missions'`; `events 'world:guide' { id: string }` (the sheet asks the world to walk there); `events 'guide:state' { to: string | null }` (the world reports guiding); `initMissions()`.

- [ ] **Step 1: Write the failing test**

```ts
// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
// Reuse the phaser EventEmitter mock block from tests/ui-forgeboard.test.ts verbatim.
import { events } from '../src/core/events'
import { uiState } from '../src/ui/state'
import { initMissions, openMissions } from '../src/ui/missions'

describe('the missions sheet', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="ui"></div>'
    uiState.unlocked = []
    uiState.flags = {}
    uiState.stats.discoveries = []
    initMissions()
  })

  it('lists every stop with what it gives', () => {
    openMissions()
    const rows = document.querySelectorAll('.ms-row')
    expect(rows).toHaveLength(8)
    expect(document.body.textContent).toContain('Career Coaster')
  })

  it('marks the ticket as the next thing to do on a fresh save', () => {
    openMissions()
    const next = document.querySelector('.ms-row.next') as HTMLElement
    expect(next.textContent).toContain('Ticket Booth')
  })

  it('says a stop needs the ticket first', () => {
    openMissions()
    const coaster = document.querySelector('[data-id="coaster"]') as HTMLElement
    expect(coaster.textContent).toContain('Ticket first')
  })

  it('asks the world to walk there and closes', () => {
    uiState.flags = { ticket: 1 }
    openMissions()
    const spy = vi.fn()
    events.on('world:guide', spy)
    ;(document.querySelector('[data-id="coaster"] .ms-go') as HTMLButtonElement).click()
    expect(spy).toHaveBeenCalledWith({ id: 'coaster' })
    expect(document.querySelector('.missions')).toBeNull()
  })

  it('sends a ticketless player to Bo instead', () => {
    openMissions()
    const spy = vi.fn()
    events.on('world:guide', spy)
    ;(document.querySelector('[data-id="coaster"] .ms-go') as HTMLButtonElement).click()
    expect(spy).toHaveBeenCalledWith({ id: 'gate' })
  })

  it('spells the status out for a screen reader', () => {
    openMissions()
    const row = document.querySelector('[data-id="gate"]') as HTMLElement
    expect(row.querySelector('.ms-status')?.textContent).toBe('Next')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run tests/ui-missions.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the panel**

`src/ui/missions.ts` renders one `<li class="ms-row" data-id="…">` per mission: a status pill (`.ms-status`, text from `statusLabel`), the attraction's `name` as the heading, `does` and `gives` as two lines, and a `<button class="pbtn ms-go">Take me there</button>`. The header carries the standing line *Every game has a "show me" button — the fair is a résumé, not an exam.* The click handler resolves the target (`ticket` flag unset and the row is not the gate → `'gate'`), emits `world:guide`, and closes all modals. The view is built from `uiState`:

```ts
const view = (): MissionView => ({
  unlocked: uiState.unlocked,
  questDone: (id) => !!uiState.quests?.isDone(id),
  discovered: uiState.stats.discoveries,
  ticket: !!uiState.flags.ticket,
})
```

The same module owns the **guide bar** — a slim fixed bar at the top of the overlay, shown on `guide:state` with a name and hidden when it carries `null`:

```ts
events.on('guide:state', ({ to }) => {
  bar.hidden = !to
  if (to) barText.textContent = `Walking to ${to} — move to stop`
})
```

Check `QuestLog` for the real method name (`isDone`) before writing the view.

- [ ] **Step 4: Style it**

`src/styles/missions.css`: rows as cards with a left status rail (accent for `next`, muted for `done`, warm for `locked`), 16 px gutters, the Take-me-there button full-width under 480 px, and `.ms-bar` fixed at the top centre with the same glass treatment as `.prompt`.

- [ ] **Step 5: Put it on the HUD**

In `src/ui/hud.ts` add a fifth tool button **before** Map:

```html
<button class="hbtn hbtn-missions" data-act="missions" title="Missions — what to do and where"><i class="ic ic-flag">⚑</i><span>Missions</span></button>
```

extend the `world:action` union in `src/core/events.ts` with `'missions'`, route it in `WorldScene`'s action handler to `this.openPanel('missions')`, and change the objective-chip branch to emit `{ action: 'missions' }` instead of `'map'`. Keep the existing pointer-blur rule (Review Focus 4) — it already applies to every `button` in the bar. Nudge the Missions button for three cycles when `story:changed` fires: add `.nudge`, and remove it after 3.5 s or on the panel opening, whichever comes first.

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run tests/ui-missions.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 7: Gates and commit**

```bash
npx vitest run && npx tsc --noEmit
git add src/ui/missions.ts src/styles/missions.css tests/ui-missions.test.ts src/main.ts src/ui/index.ts src/ui/hud.ts src/core/events.ts src/scenes/WorldScene.ts
git commit -m "feat(missions): a sheet that says what to do and where"
```

---

### Task 7: The guided walk in the world

**Files:**
- Modify: `src/scenes/WorldScene.ts` (new private `guide` state, `startGuide`, `stopGuide`, the movement block ~line 1640, the update loop, `shutdown` cleanup)
- Modify: `src/ui/missions.ts` if the bar needs a cancel affordance

**Interfaces:**
- Consumes: `routeTiles`, `waypoints`, `stepAlong`, `REACH_PX` (Task 5); `events 'world:guide'` (Task 6).
- Produces: `events 'guide:state' { to: string | null }`; guided movement writes through the existing `player.move`.

- [ ] **Step 1: Add the state and the start**

```ts
  /** A guided walk in progress: where to, the corners left, and the watchdog. */
  private guide: { id: string; wps: Vec2[]; i: number; arrow?: Phaser.GameObjects.Image; dots: Phaser.GameObjects.Image[]; lastX: number; lastY: number; stuckMs: number; retried: boolean } | null = null
```

Subscribe beside the other handlers in `create()`:

```ts
    this.unsub.push(events.on('world:guide', ({ id }) => this.startGuide(id)))
```

`startGuide(id)` resolves the attraction, builds `blockedTile` from the scene's own data — a tile is blocked when `this.blocked(cx, cy)` at its centre, or any solid in `this.solids` overlaps it — routes with `routeTiles`, and on success stores `waypoints(path)`, draws the arrow above the door (a bobbing `prop_marker`-style image; reuse an existing atlas frame such as the objective pin the map uses, or the `spark` frame scaled) plus up to 24 trail dots along the path, and emits `guide:state` with `a.name`. On `null`, it toasts once — *No clear way from here — taking you straight there.* — and calls the existing `travelTo(id)`.

- [ ] **Step 2: Drive it from the movement block**

Inside `update`, in the `if (!this.locked && !this.inCutscene)` branch, after the manual input is gathered:

```ts
        if (this.guide) {
          // Any manual input cancels — the walk is a favour, not a cutscene.
          if (Math.hypot(dx, dy) > 0.15) this.stopGuide()
          else {
            const s = stepAlong(this.player.x, this.player.y, this.guide.wps, this.guide.i)
            this.guide.i = s.i
            if (s.arrived) this.arriveGuide()
            else {
              dx = s.dx
              dy = s.dy
            }
          }
        }
```

- [ ] **Step 3: Watchdog and arrival**

In the same block, after `player.move`, track progress: if the player moved less than 0.4 px this frame while guiding, add `dt` to `stuckMs`; at 1500 ms re-route once (`retried = true`); if it happens again, `stopGuide()` then `travelTo(id)`. `arriveGuide()` faces the player at the door (`this.player.dir = 'up'`, `idle()`), clears the visuals, emits `guide:state { to: null }`, and lets the normal interact update raise the prompt — which is what makes the action button blink with its verb (Task 2 + 3).

- [ ] **Step 4: Cancel everywhere else**

`stopGuide()` destroys the arrow and dots, nulls `this.guide`, emits `guide:state { to: null }`. Call it from: the `ui:lock` handler (a modal opened), the cutscene start, `travelTo`, and `shutdown`.

- [ ] **Step 5: Verify in the browser**

```bash
npm run build && npx vite preview --port 4173
node scratch/recheck-guide.cjs
```

Write `scratch/recheck-guide.cjs` (Write tool, not a heredoc — Windows mangles them) driving `playwright-core` from `C:/Users/Naman/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright-core`, touch-emulated 390×844: fresh save → Start → skip Bo → open Missions → Take me there on the gate → assert the player's tile reaches the gate door within 20 s (`window.__game.scene.getScene('world').player`) → assert `.tb-a` reads `TALK` and carries `nudge` → stick input mid-walk stops the guide (assert `guide:state` fired with null). Save screenshots to `scratch/shots/v5-guide-*.png`.

- [ ] **Step 6: Gates and commit**

```bash
npx vitest run && npx tsc --noEmit && npm run build
git add src/scenes/WorldScene.ts src/ui/missions.ts scratch/recheck-guide.cjs
git commit -m "feat(guide): walk the player to any stop on request"
```

---

### Task 8: First-run wording on touch

**Files:**
- Modify: `src/ui/welcome.ts` (`HOWTO_TOUCH`), `src/scenes/WorldScene.ts` (one-time hint)
- Modify: `tests/ui-welcome.test.ts` if it exists; otherwise add the assertion to `tests/ui-missions.test.ts`

- [ ] **Step 1: Rewrite the touch legend**

```ts
const HOWTO_TOUCH: HowRow[] = [
  { k: 'Move', v: 'drag the stick' },
  { k: 'Jump', v: 'JUMP' },
  { k: 'Do things', v: 'the big button — it names what it will do' },
  { k: 'Lost?', v: 'Missions walks you there' },
]
```

- [ ] **Step 2: One hint, once per save**

In `WorldScene`, after Bo's arrival conversation closes, on touch layouts only (`matchMedia('(pointer: coarse)').matches`) and when `!this.state.flag('guide_hint')`: `events.emit('ui:hint', { text: 'Lost? Tap Missions — it can walk you there.' })` then `this.state.setFlag('guide_hint')`.

- [ ] **Step 3: Test, gates, commit**

```bash
npx vitest run && npx tsc --noEmit
git add src/ui/welcome.ts src/scenes/WorldScene.ts tests/
git commit -m "feat(onboarding): tell a phone player what the buttons are"
```

---

### Task 9: `/lineage` → `/portfolio` in this repo

**Files:**
- Modify: `vite.config.ts` (base), `index.html` (canonical + `og:url`), `README.md`, `package.json` (name + description), `.claude/commands/getcontext.md`, `docs/HANDOFF.md`
- Modify: `tests/index-html.test.ts` if it pins the URL

- [ ] **Step 1: Find every reference**

Run: `grep -rn "lineage" --include=*.ts --include=*.html --include=*.json --include=*.md . | grep -v node_modules | grep -v dist | grep -v "^./.superpowers"`
Expected: the files listed above, plus `src/data/content.ts` project copy about the *payment-lineage engine* — **that is a résumé fact, not a path. Do not touch it.**

- [ ] **Step 2: Change the base**

```ts
// vite.config.ts
// Served from https://naman-gururani.github.io/portfolio/
export default defineConfig({
  base: '/portfolio/',
  ...
})
```

and in `index.html` both URLs become `https://naman-gururani.github.io/portfolio/`.

- [ ] **Step 3: Run the gates and the build**

Run: `npx vitest run && npx tsc --noEmit && npm run build`
Expected: green; `dist/index.html` asset paths start `/portfolio/`.

- [ ] **Step 4: Preview it at the new path**

Run: `npx vite preview --port 4173` → `http://localhost:4173/portfolio/?fresh=1` loads and plays.

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts index.html README.md package.json .claude/commands/getcontext.md docs/HANDOFF.md tests/
git commit -m "chore: the fair moves to /portfolio"
```

---

### Task 10: Whole-branch verification

- [ ] **Step 1: Gates**

Run: `npx vitest run && npx tsc --noEmit && npm run build`
Expected: 66+ files, 1105 + ~30 new tests, 0 skips; tsc clean; build green.

- [ ] **Step 2: Phone walk**

`node scratch/recheck-guide.cjs` at 390×844 **and** 844×390: buttons read their verbs, the idle button is dim, the nudge appears only in range, Missions opens from the chip and the bar, Take me there walks and cancels, the minimap clears the buttons.

- [ ] **Step 3: Desktop regression walk**

At 1280×800, keyboard only: the prompt chip still bobs and now rings; Space still hops after clicking a HUD button; Missions opens with the mouse and returns focus to the game; the ride's Next still advances on Enter.

- [ ] **Step 4: Reduced motion**

Re-run one pass with `prefers-reduced-motion: reduce` emulated: the ring is drawn but static, the guided walk still completes.

- [ ] **Step 5: Screenshots for the handoff**

Save to `scratch/shots/v5-*.png` and list them in the report.
