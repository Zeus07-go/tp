import { useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { AGENCY_BY_ID, OUTCOME_LABELS } from './data'
import type { Mission } from './data'
import { linePath, project } from './geo'
import type { View } from './geo'

const R = 268
const C = 300

const PARALLELS = [-60, -30, 0, 30, 60]
const MERIDIANS = Array.from({ length: 12 }, (_, i) => -180 + i * 30)
const SAMPLE_LON = Array.from({ length: 121 }, (_, i) => -180 + i * 3)
const SAMPLE_LAT = Array.from({ length: 61 }, (_, i) => -90 + i * 3)

interface Props {
  missions: Mission[]
  selectedId: string | null
  view: View
  onRotate: (dLat: number, dLon: number) => void
  onSelect: (id: string) => void
}

function Glyph({ m, color }: { m: Mission; color: string }) {
  const stroke = 'rgba(3,6,16,0.9)'
  if (m.outcome === 'planned') return <circle r={5.5} fill="rgba(3,6,16,0.55)" stroke={color} strokeWidth={1.6} strokeDasharray="2.2 2" />
  if (m.outcome === 'lost')
    return (
      <g stroke={color} strokeWidth={2.2} strokeLinecap="round">
        <path d="M-4.5 -4.5L4.5 4.5M4.5 -4.5L-4.5 4.5" stroke={stroke} strokeWidth={4.4} />
        <path d="M-4.5 -4.5L4.5 4.5M4.5 -4.5L-4.5 4.5" />
      </g>
    )
  if (m.types.includes('crewed')) return <rect x={-5} y={-5} width={10} height={10} rx={1.5} transform="rotate(45)" fill={color} stroke={stroke} strokeWidth={1.5} />
  if (m.outcome === 'partial')
    return (
      <g>
        <circle r={5.5} fill={color} stroke={stroke} strokeWidth={1.5} />
        <circle r={2} fill="#080c16" />
      </g>
    )
  return <circle r={5} fill={color} stroke={stroke} strokeWidth={1.5} />
}

export default function Globe({ missions, selectedId, view, onRotate, onSelect }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)

  const graticule = useMemo(() => {
    const par = PARALLELS.map((lat) => ({ lat, d: linePath(SAMPLE_LON.map((lon) => [lat, lon] as [number, number]), view, R, C, C) }))
    const mer = MERIDIANS.map((lon) => ({ lon, d: linePath(SAMPLE_LAT.map((lat) => [lat, lon] as [number, number]), view, R, C, C) }))
    const cap = linePath(SAMPLE_LON.map((lon) => [-80, lon] as [number, number]), view, R, C, C)
    return { par, mer, cap }
  }, [view])

  const markers = missions
    .filter((m) => m.site)
    .map((m) => ({ m, p: project(m.site!.lat, m.site!.lon, view, R) }))
    .filter(({ p }) => p.depth > 0.03)

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    drag.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current
    if (!d) return
    const rect = e.currentTarget.getBoundingClientRect()
    const k = 180 / Math.PI / ((R * rect.width) / 600)
    onRotate((e.clientY - d.y) * k, -(e.clientX - d.x) * k)
    drag.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = () => {
    drag.current = null
  }
  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    const step = 10
    if (e.key === 'ArrowLeft') onRotate(0, -step)
    else if (e.key === 'ArrowRight') onRotate(0, step)
    else if (e.key === 'ArrowUp') onRotate(step, 0)
    else if (e.key === 'ArrowDown') onRotate(-step, 0)
    else return
    e.preventDefault()
  }

  const labelled = markers.find(({ m }) => m.id === (hoverId ?? selectedId))

  return (
    <svg
      className="gl"
      viewBox="0 0 600 600"
      role="group"
      aria-label="Interactive Moon globe. Drag or use the arrow keys to rotate."
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <defs>
        <radialGradient id="hx-body" cx="34%" cy="30%" r="95%">
          <stop offset="0%" stopColor="#cdd1d8" />
          <stop offset="36%" stopColor="#80878f" />
          <stop offset="70%" stopColor="#2f353f" />
          <stop offset="100%" stopColor="#07090f" />
        </radialGradient>
        <radialGradient id="hx-limb" cx="50%" cy="50%" r="50%">
          <stop offset="82%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(2,4,10,0.72)" />
        </radialGradient>
        <radialGradient id="hx-rim" cx="88%" cy="86%" r="62%">
          <stop offset="0%" stopColor="rgba(111,195,255,0.30)" />
          <stop offset="100%" stopColor="rgba(111,195,255,0)" />
        </radialGradient>
        <radialGradient id="hx-halo" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="rgba(111,195,255,0.20)" />
          <stop offset="100%" stopColor="rgba(111,195,255,0)" />
        </radialGradient>
        <filter id="hx-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="11" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 -0.34" />
        </filter>
        <clipPath id="hx-disc">
          <circle cx={C} cy={C} r={R} />
        </clipPath>
      </defs>

      <circle cx={C} cy={C} r={R + 28} fill="url(#hx-halo)" />
      <circle cx={C} cy={C} r={R} fill="url(#hx-body)" />
      <g clipPath="url(#hx-disc)">
        <rect x={C - R} y={C - R} width={R * 2} height={R * 2} filter="url(#hx-grain)" opacity={0.2} />
        <g className="gl-grid">
          {graticule.mer.map((l) => (
            <path key={`m${l.lon}`} d={l.d} className={l.lon === 0 ? 'gl-line major' : 'gl-line'} />
          ))}
          {graticule.par.map((l) => (
            <path key={`p${l.lat}`} d={l.d} className={l.lat === 0 ? 'gl-line major' : 'gl-line'} />
          ))}
          <path d={graticule.cap} className="gl-cap" />
        </g>
        <circle cx={C} cy={C} r={R} fill="url(#hx-rim)" />
        <circle cx={C} cy={C} r={R} fill="url(#hx-limb)" />
      </g>
      <circle cx={C} cy={C} r={R} className="gl-rim" />

      {markers.map(({ m, p }) => {
        const color = AGENCY_BY_ID.get(m.agency)?.color ?? '#fff'
        const s = 0.6 + 0.4 * Math.sqrt(p.depth)
        const sel = m.id === selectedId
        return (
          <g
            key={m.id}
            className={`gl-mk${sel ? ' sel' : ''}`}
            transform={`translate(${(C + p.x).toFixed(1)} ${(C + p.y).toFixed(1)}) scale(${s.toFixed(2)})`}
            role="button"
            tabIndex={0}
            aria-label={`${m.name}, ${OUTCOME_LABELS[m.outcome]}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onSelect(m.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                onSelect(m.id)
              }
            }}
            onPointerEnter={() => setHoverId(m.id)}
            onPointerLeave={() => setHoverId(null)}
            onFocus={() => setHoverId(m.id)}
            onBlur={() => setHoverId(null)}
          >
            <circle r={15} fill="transparent" />
            <g className="gl-pop">
              {sel && <circle className="gl-pulse" r={9} fill="none" stroke={color} strokeWidth={1.4} />}
              <Glyph m={m} color={color} />
            </g>
          </g>
        )
      })}

      {labelled && (
        <g className="gl-tag" pointerEvents="none" transform={`translate(${(C + labelled.p.x).toFixed(1)} ${(C + labelled.p.y - 24).toFixed(1)})`}>
          <rect x={-(labelled.m.name.length * 3.7 + 12)} y={-13} width={labelled.m.name.length * 7.4 + 24} height={22} rx={11} />
          <text textAnchor="middle" y={2}>
            {labelled.m.name}
          </text>
        </g>
      )}
    </svg>
  )
}
