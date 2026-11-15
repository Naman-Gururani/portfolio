// /portfolio/ was the game until v6, so links in the wild still carry the
// game's URL flags. Any one of them means "this visitor came for the game":
// send them to /portfolio/play/ with the query and hash intact. The same check
// runs inline in index.html's <head> (before first paint); a test keeps the two
// in agreement.

/** Every query flag the game reads (src/main.ts, Minigame.ts, wordle.ts, ducks.ts). */
export const GAME_FLAGS = ['fresh', 'cheat', 'word', 'duck', 'st'] as const

export const GAME_PATH = '/portfolio/play/'

export function gameForward(search: string, hash: string): string | null {
  const params = new URLSearchParams(search)
  return GAME_FLAGS.some((f) => params.has(f)) ? GAME_PATH + search + hash : null
}
