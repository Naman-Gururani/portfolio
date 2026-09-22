import { describe, expect, it } from 'vitest'
import { REACH_PX, guideTarget, routeTiles, stepAlong, waypoints } from '../src/systems/guide'
import { TILE, WORLD_TH, WORLD_TW } from '../src/config'
import { makeGrid, T } from '../src/world/terrain'
import { BLUEPRINT, attractionSolids, boundarySolids, structureSolids } from '../src/world/blueprint'

/** A flat lawn; the walls come from the `blocked` predicate each test passes. */
const lawn = (w: number, h: number) => makeGrid(w, h, T.GRASS)

describe('guideTarget', () => {
  it('sends every locked destination to the gate before the ticket', () => {
    for (const a of BLUEPRINT.attractions) expect(guideTarget(a.id, false)).toBe('gate')
  })

  it('goes where it was asked once the ticket is won', () => {
    for (const a of BLUEPRINT.attractions) expect(guideTarget(a.id, true)).toBe(a.id)
  })

  it('never redirects the gate to itself in a loop', () => {
    expect(guideTarget('gate', false)).toBe('gate')
  })
})

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

/** Tile keys covered by a list of tile rectangles. */
function fill(walls: Set<string>, rects: { x: number; y: number; w: number; h: number }[]): void {
  for (const r of rects) for (let x = r.x; x < r.x + r.w; x++) for (let y = r.y; y < r.y + r.h; y++) walls.add(`${x},${y}`)
}

/**
 * Every solid a guided walk actually contends with between the gate and the
 * coaster: the perimeter fence, every attraction footprint, and the gated
 * structures (the turnstiles, unless `ticketWon`).
 *
 * `boundarySolids` — the hard perimeter ring — has to be in this set. Leave
 * it out, as an earlier version of this test did, and the wall set has a
 * fence-shaped hole everywhere except the two turnstiles: A* is then free to
 * walk around the *outside* of the whole park and back in anywhere along the
 * unwalled ring, so a test that only checks "never stands on a turnstile
 * tile" passes for the wrong reason — it never actually tried to get through
 * the gate.
 */
function wallsFor(ticketWon: boolean): Set<string> {
  const walls = new Set<string>()
  fill(walls, boundarySolids(BLUEPRINT))
  fill(walls, structureSolids(BLUEPRINT, (f) => (ticketWon ? f === 'ticket' : false)))
  for (const a of BLUEPRINT.attractions) fill(walls, attractionSolids(a))
  return walls
}

describe('routeTiles at the real fairground gate', () => {
  it('finds no route in while the turnstiles and the fence both stand', () => {
    const grid = makeGrid(WORLD_TW, WORLD_TH, T.PLAZA)
    const gate = BLUEPRINT.attractions.find((a) => a.id === 'gate')!
    const walls = wallsFor(false)
    const path = routeTiles(grid, gate.door, { x: 50, y: 16 }, (x, y) => walls.has(`${x},${y}`))
    // The gate opening is exactly 4 tiles wide, x34..37 at y51, and the two
    // turnstile halves — `turnstile` at tx34 (solid x34-35) and tx36 (solid
    // x36-37) — cover all four of those tiles between them. With the
    // perimeter fence solid everywhere else, a ticketless player has no
    // tile-legal way from the gate door into the park at all: this is not a
    // routing gap, it is the same rule `data/missions.ts` enforces (every
    // mission but 'gate' reads 'locked' until the `ticket` flag is set), so
    // the honest answer here is null — the guide must hand a ticketless
    // player to Bo instead of trying to walk them through a wall.
    expect(path).toBeNull()
    // And the reason is the turnstiles, not an accident of the fence. There is
    // no route to inspect for turnstile tiles — there is no route — so the
    // invariant is asserted where it actually lives: every tile of the gate
    // opening is solid while the ticket is unwon, and none of them is once it
    // is won. Move a turnstile and this fails; widen the opening and this fails.
    const open = wallsFor(true)
    for (const x of [34, 35, 36, 37]) {
      expect(walls.has(`${x},51`)).toBe(true)
      expect(open.has(`${x},51`)).toBe(false)
    }
  })

  it('opens a route to the coaster once the ticket drops the turnstiles', () => {
    const grid = makeGrid(WORLD_TW, WORLD_TH, T.PLAZA)
    const gate = BLUEPRINT.attractions.find((a) => a.id === 'gate')!
    const walls = wallsFor(true)
    const path = routeTiles(grid, gate.door, { x: 50, y: 16 }, (x, y) => walls.has(`${x},${y}`))
    // Same fence, same footprints — only the turnstiles' `gate: 'ticket'`
    // now reads as unset-and-passed, so `structureSolids` drops them from
    // the wall set and the same gate opening is the way in. This is the
    // pair that proves the router respects the gate rather than merely
    // ignoring it: shut, no route; open, a route.
    expect(path).not.toBeNull()
  })
})
