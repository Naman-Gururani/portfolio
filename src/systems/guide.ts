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

/**
 * Where "take me there" actually goes. Before the ticket the turnstiles are
 * solid and there is provably no route into the park (see the gate pair in
 * `tests/guide.test.ts`), so a walk to anything past the gate would set off down
 * a road that does not exist. Every locked destination quietly redirects to Bo.
 *
 * This is the one place that rule lives: the Missions sheet reads it to label
 * its buttons, and the world reads it before it routes, so the sheet and the
 * fair can never disagree about where a button is going to take you. It is also
 * the reason a null route is not treated as "fade them there" — a ticketless
 * player who could be fade-travelled into the park would skip the gate, which is
 * the spine of the whole game.
 */
export function guideTarget(id: string, ticket: boolean): string {
  return !ticket && id !== 'gate' ? 'gate' : id
}

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
