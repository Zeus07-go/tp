// Orthographic projection of selenographic coordinates (east-positive longitude) onto a disc.
const D2R = Math.PI / 180

export interface View {
  lat: number
  lon: number
}

export interface Projected {
  x: number
  y: number
  /** cos of the angular distance from the view centre; > 0 means the point faces the viewer. */
  depth: number
}

export function project(lat: number, lon: number, view: View, r: number): Projected {
  const phi = lat * D2R
  const lam = (lon - view.lon) * D2R
  const phi0 = view.lat * D2R
  const depth = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lam)
  const x = r * Math.cos(phi) * Math.sin(lam)
  const y = r * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lam))
  return { x, y: -y, depth }
}

/** Builds an SVG path through [lat, lon] samples, breaking the line wherever it passes behind the limb. */
export function linePath(samples: Array<[number, number]>, view: View, r: number, cx: number, cy: number): string {
  let d = ''
  let pen = false
  for (const [lat, lon] of samples) {
    const p = project(lat, lon, view, r)
    if (p.depth > 0) {
      d += `${pen ? 'L' : 'M'}${(cx + p.x).toFixed(1)} ${(cy + p.y).toFixed(1)}`
      pen = true
    } else {
      pen = false
    }
  }
  return d
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}
