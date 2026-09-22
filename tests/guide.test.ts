import { describe, expect, it } from 'vitest'
import { REACH_PX, routeTiles, stepAlong, waypoints } from '../src/systems/guide'
import { TILE, WORLD_TH, WORLD_TW } from '../src/config'
import { makeGrid, T } from '../src/world/terrain'
import { BLUEPRINT, attractionSolids, structureSolids } from '../src/world/blueprint'

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
