import { useEffect, useRef } from 'react'
import { AGENCY_BY_ID, ERAS, MISSIONS, OUTCOME_LABELS, TODAY, TYPE_LABELS, formatCoord, formatDate } from './data'
import type { Era, Mission } from './data'

export interface Stats {
  shown: number
  landings: number
  samples: number
}

export function Overview({ stats, onEra }: { stats: Stats; onEra: (e: Era) => void }) {
  return (
    <div className="pn-body pn-in">
      <p className="pn-kicker">Overview</p>
      <h2 className="pn-title">A record of reaching for the Moon</h2>
      <p className="pn-lede">
        Every dot on the globe is a place something touched the surface. Every mark on the timeline is a mission. Select one to open its story, or
        press play to watch the archive fill in.
      </p>
      <dl className="pn-stats">
        <div>
          <dt>Missions</dt>
          <dd>{stats.shown}</dd>
        </div>
        <div>
          <dt>Landings</dt>
          <dd>{stats.landings}</dd>
        </div>
        <div>
          <dt>Sample returns</dt>
          <dd>{stats.samples}</dd>
        </div>
      </dl>
      <p className="pn-kicker pn-gap">Four eras</p>
      <ol className="pn-eras">
        {ERAS.map((e) => (
          <li key={e.id}>
            <button onClick={() => onEra(e)}>
              <span className="pn-era-name">{e.label}</span>
              <span className="pn-era-years">
                {e.from}–{e.to > TODAY ? 'today' : e.to}
              </span>
              <span className="pn-era-blurb">{e.blurb}</span>
              <span className="pn-era-n">{MISSIONS.filter((m) => m.t >= e.from && m.t < e.to).length} missions</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

interface DetailProps {
  mission: Mission
  index: number
  total: number
  onStep: (dir: -1 | 1) => void
  onShowSite: () => void
}

export function Detail({ mission: m, index, total, onStep, onShowSite }: DetailProps) {
  const agency = AGENCY_BY_ID.get(m.agency)
  return (
    <div className="pn-body pn-in" key={m.id}>
      <div className="pn-nav">
        <button onClick={() => onStep(-1)} disabled={index <= 0} aria-label="Previous mission">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>
        <span>
          {index + 1} <i>/</i> {total}
        </span>
        <button onClick={() => onStep(1)} disabled={index >= total - 1} aria-label="Next mission">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
      </div>

      <p className="pn-kicker" style={{ color: agency?.color }}>
        <i className="pn-dot" style={{ background: agency?.color }} />
        {agency?.label}
      </p>
      <h2 className="pn-title">{m.name}</h2>
      <p className="pn-date">{formatDate(m)}</p>

      <div className="pn-tags">
        <span className={`pn-tag o-${m.outcome}`}>{OUTCOME_LABELS[m.outcome]}</span>
        {m.types.map((t) => (
          <span key={t} className="pn-tag">
            {TYPE_LABELS[t]}
          </span>
        ))}
      </div>

      <p className="pn-lede">{m.summary}</p>

      {m.crew && (
        <div className="pn-block">
          <h3>Crew</h3>
          <p>{m.crew.join(' · ')}</p>
        </div>
      )}

      <div className="pn-block">
        <h3>Key facts</h3>
        <ul className="pn-facts">
          {m.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>

      {m.site ? (
        <div className="pn-site">
          <div>
            <h3>{m.outcome === 'lost' ? 'Impact site' : 'Location'}</h3>
            <p className="pn-site-name">{m.site.name}</p>
            <p className="pn-site-coord">{formatCoord(m.site.lat, m.site.lon, m.site.approx)}</p>
            {m.site.approx && <p className="pn-note">Approximate position, shown schematically.</p>}
          </div>
          <button className="pn-btn" onClick={onShowSite}>
            Centre on globe
          </button>
        </div>
      ) : (
        <p className="pn-note">No surface site: this mission flew past, orbited or travelled beyond the Moon.</p>
      )}
    </div>
  )
}

interface LedgerProps {
  missions: Mission[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function Ledger({ missions, selectedId, onSelect }: LedgerProps) {
  const sel = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    sel.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedId])

  if (missions.length === 0) {
    return (
      <div className="pn-body pn-in">
        <p className="pn-kicker">Ledger</p>
        <p className="pn-lede">No missions match these filters at this point in time.</p>
      </div>
    )
  }

  const groups: Array<{ decade: number; items: Mission[] }> = []
  for (const m of missions) {
    const decade = Math.floor(m.t / 10) * 10
    const g = groups.at(-1)
    if (g && g.decade === decade) g.items.push(m)
    else groups.push({ decade, items: [m] })
  }

  return (
    <div className="pn-body pn-in">
      {groups.map((g) => (
        <section key={g.decade} className="lg-group">
          <h3>{g.decade}s</h3>
          {g.items.map((m) => {
            const a = AGENCY_BY_ID.get(m.agency)
            const on = m.id === selectedId
            return (
              <button key={m.id} ref={on ? sel : undefined} className={`lg-item${on ? ' on' : ''}`} onClick={() => onSelect(m.id)} aria-current={on ? 'true' : undefined}>
                <i style={{ background: a?.color }} />
                <span className="lg-name">{m.name}</span>
                <span className="lg-date">{formatDate(m)}</span>
                <span className={`lg-out o-${m.outcome}`}>{OUTCOME_LABELS[m.outcome]}</span>
              </button>
            )
          })}
        </section>
      ))}
    </div>
  )
}
