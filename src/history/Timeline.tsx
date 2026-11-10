import { useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { AGENCIES, ERAS, MAX_T, MIN_T, MISSIONS, TODAY, formatCursor, formatDate } from './data'
import type { Mission } from './data'
import { clamp } from './geo'

const SPAN = MAX_T - MIN_T
const pct = (t: number) => ((t - MIN_T) / SPAN) * 100
const YEARS = Array.from({ length: MAX_T - MIN_T + 1 }, (_, i) => MIN_T + i)

interface Props {
  visibleIds: Set<string>
  selectedId: string | null
  cursor: number
  playing: boolean
  onSelect: (id: string) => void
  onCursor: (t: number) => void
  onTogglePlay: () => void
  onToday: () => void
}

export default function Timeline({ visibleIds, selectedId, cursor, playing, onSelect, onCursor, onTogglePlay, onToday }: Props) {
  const plot = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [hover, setHover] = useState<Mission | null>(null)

  const scrub = (clientX: number) => {
    const r = plot.current?.getBoundingClientRect()
    if (!r) return
    onCursor(MIN_T + clamp((clientX - r.left) / r.width, 0, 1) * SPAN)
  }
  const down = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    scrub(e.clientX)
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) scrub(e.clientX)
  }
  const up = () => {
    dragging.current = false
  }
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 5 : 0.5
    if (e.key === 'ArrowLeft') onCursor(clamp(cursor - step, MIN_T, MAX_T))
    else if (e.key === 'ArrowRight') onCursor(clamp(cursor + step, MIN_T, MAX_T))
    else if (e.key === 'Home') onCursor(MIN_T)
    else if (e.key === 'End') onCursor(TODAY)
    else return
    e.preventDefault()
  }

  const latest = [...MISSIONS].filter((m) => m.t <= cursor).at(-1)
  const caption = hover ?? latest ?? null

  return (
    <section className="tl" aria-label="Mission timeline">
      <div className="tl-bar">
        <button className="tl-play" onClick={onTogglePlay} aria-pressed={playing} aria-label={playing ? 'Pause playback' : 'Play through history'}>
          {playing ? (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4.5 3v10M11.5 3v10" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5 3l8 5-8 5z" />
            </svg>
          )}
        </button>
        <div className="tl-read">
          <span className="tl-date">{formatCursor(cursor)}</span>
          <span className="tl-cap">
            {caption ? (
              <>
                <b>{caption.name}</b> · {formatDate(caption)}
              </>
            ) : (
              'Before the first mission'
            )}
          </span>
        </div>
        <button className="tl-today" onClick={onToday}>
          Back to today
        </button>
      </div>

      <div className="tl-scroll">
        <div className="tl-grid">
          <div className="tl-labels" aria-hidden="true">
            <div className="tl-label era-spacer" />
            {AGENCIES.map((a) => (
              <div key={a.id} className="tl-label">
                <i style={{ background: a.color }} />
                {a.short}
              </div>
            ))}
            <div className="tl-label axis-spacer" />
          </div>

          <div className="tl-plot" ref={plot} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            <div className="tl-eras">
              {ERAS.map((e) => (
                <div key={e.id} className="tl-era" style={{ left: `${pct(e.from)}%`, width: `${pct(e.to) - pct(e.from)}%` }} title={e.blurb}>
                  <span>{e.label}</span>
                </div>
              ))}
            </div>

            <div className="tl-lanes">
              {AGENCIES.map((a) => (
                <div key={a.id} className="tl-lane">
                  {MISSIONS.filter((m) => m.agency === a.id).map((m) => {
                    const cls = ['tl-dot', `o-${m.outcome}`]
                    if (m.types.includes('crewed')) cls.push('crew')
                    if (m.id === selectedId) cls.push('sel')
                    if (m.t > cursor) cls.push('future')
                    if (!visibleIds.has(m.id)) cls.push('dim')
                    return (
                      <button
                        key={m.id}
                        className={cls.join(' ')}
                        style={{ left: `${pct(m.t)}%`, '--c': a.color } as CSSProperties}
                        aria-label={`${m.name}, ${formatDate(m)}`}
                        aria-current={m.id === selectedId ? 'true' : undefined}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => onSelect(m.id)}
                        onPointerEnter={() => setHover(m)}
                        onPointerLeave={() => setHover(null)}
                        onFocus={() => setHover(m)}
                        onBlur={() => setHover(null)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="tl-horizon" style={{ left: `${pct(TODAY)}%` }}>
              <span>Today</span>
            </div>

            <div className="tl-axis" aria-hidden="true">
              {YEARS.map((y) => (
                <i key={y} className={y % 10 === 0 ? 'major' : y % 5 === 0 ? 'mid' : ''} style={{ left: `${pct(y)}%` }}>
                  {y % 10 === 0 && <span>{y}</span>}
                </i>
              ))}
            </div>

            <div
              className="tl-cursor"
              style={{ left: `${pct(cursor)}%` }}
              role="slider"
              tabIndex={0}
              aria-label="Archive date"
              aria-valuemin={MIN_T}
              aria-valuemax={MAX_T}
              aria-valuenow={Math.round(cursor * 10) / 10}
              aria-valuetext={formatCursor(cursor)}
              onKeyDown={key}
            >
              <span className="tl-grip" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
