// The credential leans toward the pointer and its foil follows it.

export type Box = { left: number; top: number; width: number; height: number }
export type Tilt = { rx: number; ry: number; mx: number; my: number }

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
/** Two decimals, and never a negative zero. */
const tidy = (v: number) => Math.round(v * 100) / 100 + 0

/**
 * The pointer at (x, y) over a card at `rect`: rotation in degrees (rx about the
 * horizontal axis, ry about the vertical, each within ±max) and the light's
 * position across the card in percent (mx, my).
 */
export function tiltFor(x: number, y: number, rect: Box, max = 10): Tilt {
  const px = clamp01((x - rect.left) / rect.width)
  const py = clamp01((y - rect.top) / rect.height)
  return {
    rx: tidy(-(py - 0.5) * 2 * max),
    ry: tidy((px - 0.5) * 2 * max),
    mx: tidy(px * 100),
    my: tidy(py * 100),
  }
}
