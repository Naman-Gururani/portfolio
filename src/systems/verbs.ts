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
