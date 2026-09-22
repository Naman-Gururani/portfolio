// One word for what the action button will do. The touch button shows it, the
// desktop prompt's key chip carries it as a title, and a screen reader hears it
// in the button's label. Pure: no Phaser, no DOM.
//
// Priority is: the verb the interactable declares, then what its dispatch
// string says, then the wording of its prompt, then a plain USE.

/** What the action button says when nothing is in range — the wrench swing. */
export const IDLE_VERB = 'SWING'

/** …and what a screen reader hears on it while it is in that state. */
export const IDLE_LABEL = 'Swing the wrench'

/**
 * Verbs that want a preposition before the name. Only TALK so far: "Talk the
 * Ticket Booth" is not English and the booth is the one attraction whose
 * interact is a conversation.
 */
const JOINER: Record<string, string> = { TALK: 'to the' }

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

/**
 * The whole sentence a screen reader hears on the action button: the verb in
 * front of the name — "Ride the Career Coaster" — because the name alone
 * ("Career Coaster") says where you are but never what the button does.
 *
 * Half the prompts in the world are already sentences that open with their own
 * verb ("Talk to Bo", "Open the prize box", "Hook a duck"); those are left
 * exactly as they are rather than read twice.
 */
export function actionLabel(prompt: string, verb: string): string {
  const v = verb.toLowerCase()
  if (prompt.toLowerCase().startsWith(`${v} `)) return prompt
  return `${v.charAt(0).toUpperCase()}${v.slice(1)} ${JOINER[verb] ?? 'the'} ${prompt}`
}
