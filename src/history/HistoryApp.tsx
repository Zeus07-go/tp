import { useEffect, useMemo, useRef, useState } from 'react'
import NavRail from '../ui/nav/NavRail'
import Globe from './Globe'
import Timeline from './Timeline'
import { Detail, Ledger, Overview } from './Panels'
import type { Stats } from './Panels'
import {
  AGENCIES,
  AGENCY_BY_ID,
  LATEST_ID,
  MAX_T,
  MIN_T,
  MISSIONS,
  MISSION_BY_ID,
  OUTCOME_LABELS,
  OUTCOME_ORDER,
  TODAY,
  TYPE_LABELS,
  TYPE_ORDER,
} from './data'
import type { AgencyId, Era, Mission, MissionType, Outcome } from './data'
import { clamp } from './geo'
import type { View } from './geo'
import './history.css'

const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const HAYSTACK = new Map(
  MISSIONS.map((m) => [
    m.id,
    [m.name, m.summary, m.site?.name, AGENCY_BY_ID.get(m.agency)?.label, ...(m.crew ?? []), ...m.facts].join(' ').toLowerCase(),
  ]),
)

const PRESETS: Array<{ id: string; label: string; view: View }> = [
  { id: 'near', label: 'Near side', view: { lat: 0, lon: 0 } },
  { id: 'far', label: 'Far side', view: { lat: 0, lon: 180 } },
  { id: 'south', label: 'South pole', view: { lat: -90, lon: 0 } },
]

const CHAPTERS = [
  { id: 'today', label: 'Today' },
  { id: 'moon', label: 'The Moon' },
  { id: 'apollo-11', label: 'Apollo 11' },
  { id: 'artemis-1', label: 'Artemis I' },
  { id: 'voyager', label: 'Voyager' },
]

function viewFor(m: Mission | undefined | null): View {
  return m?.site ? { lat: m.site.lat, lon: m.site.lon } : { lat: 0, lon: 0 }
}

function initialId(): string | null {
  const h = window.location.hash.slice(1)
  if (h === 'overview') return null
  return MISSION_BY_ID.has(h) ? h : 'apollo-11'
}

function toggled<T>(set: Set<T>, v: T): Set<T> {
  const next = new Set(set)
  if (next.has(v)) next.delete(v)
  else next.add(v)
  return next
}

export default function HistoryApp() {
  const [selectedId, setSelectedId] = useState<string | null>(initialId)
  const [cursor, setCursor] = useState(() => Math.max(TODAY, MISSION_BY_ID.get(initialId() ?? '')?.t ?? 0))
  const [playing, setPlaying] = useState(false)
  const [agencies, setAgencies] = useState<Set<AgencyId>>(() => new Set())
  const [types, setTypes] = useState<Set<MissionType>>(() => new Set())
  const [outcome, setOutcome] = useState<Outcome | 'all'>('all')
  const [query, setQuery] = useState('')
  const [panel, setPanel] = useState<'mission' | 'ledger'>('mission')
  const [view, setView] = useState<View>(() => viewFor(MISSION_BY_ID.get(initialId() ?? '')))

  const viewRef = useRef(view)
  const cursorRef = useRef(cursor)
  const rafRef = useRef(0)
  useEffect(() => {
    viewRef.current = view
    cursorRef.current = cursor
  })

  const animateTo = (target: View) => {
    cancelAnimationFrame(rafRef.current)
    const from = viewRef.current
    const dLon = ((target.lon - from.lon + 540) % 360) - 180
    const dLat = target.lat - from.lat
    if (REDUCED || (Math.abs(dLon) < 0.01 && Math.abs(dLat) < 0.01)) {
      setView(target)
      return
    }
    const t0 = performance.now()
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 750)
      const e = 1 - Math.pow(1 - k, 3)
      const v = { lat: from.lat + dLat * e, lon: from.lon + dLon * e }
      viewRef.current = v
      setView(v)
      if (k < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }
  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const clearFilters = () => {
    setAgencies(new Set())
    setTypes(new Set())
    setOutcome('all')
    setQuery('')
  }

  const select = (id: string | null) => {
    setSelectedId(id)
    setPanel('mission')
    const m = id ? MISSION_BY_ID.get(id) : undefined
    if (m) {
      setCursor((c) => Math.max(c, m.t))
      if (m.site) animateTo(viewFor(m))
    }
  }

  // Time-travel: jump the archive to a mission and show it as it stood on that day.
  const jump = (id: string) => {
    const m = MISSION_BY_ID.get(id)
    if (!m) return
    setPlaying(false)
    clearFilters()
    setCursor(m.t + 0.003)
    setSelectedId(id)
    setPanel('mission')
    if (m.site) animateTo(viewFor(m))
  }

  const chapter = (id: string) => {
    if (id === 'today') {
      setPlaying(false)
      clearFilters()
      setCursor(TODAY)
      select(LATEST_ID)
    } else if (id === 'moon') {
      setPlaying(false)
      clearFilters()
      setCursor(TODAY)
      setSelectedId(null)
      setPanel('mission')
      animateTo({ lat: 0, lon: 0 })
    } else {
      jump(id)
    }
  }

  const selectRef = useRef(select)
  useEffect(() => {
    selectRef.current = select
  })
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.slice(1)
      if (h === 'overview') selectRef.current(null)
      else if (MISSION_BY_ID.has(h)) selectRef.current(h)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => {
    const h = selectedId ?? 'overview'
    if (window.location.hash.slice(1) !== h) window.history.replaceState(null, '', `#${h}`)
  }, [selectedId])

  useEffect(() => {
    if (!playing) return
    const loop = { raf: 0, last: performance.now() }
    const tick = (now: number) => {
      const next = cursorRef.current + ((now - loop.last) / 1000) * 4
      loop.last = now
      if (next >= TODAY) {
        setCursor(TODAY)
        setPlaying(false)
        return
      }
      cursorRef.current = next
      setCursor(next)
      loop.raf = requestAnimationFrame(tick)
    }
    loop.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(loop.raf)
  }, [playing])

  const togglePlay = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    if (cursorRef.current >= TODAY - 0.01) setCursor(MIN_T)
    setPlaying(true)
  }

  const q = query.trim().toLowerCase()
  const visible = useMemo(
    () =>
      MISSIONS.filter(
        (m) =>
          (agencies.size === 0 || agencies.has(m.agency)) &&
          (types.size === 0 || m.types.some((t) => types.has(t))) &&
          (outcome === 'all' || m.outcome === outcome) &&
          (!q || (HAYSTACK.get(m.id) ?? '').includes(q)),
      ),
    [agencies, types, outcome, q],
  )
  const visibleIds = useMemo(() => new Set(visible.map((m) => m.id)), [visible])
  const revealed = useMemo(() => visible.filter((m) => m.t <= cursor), [visible, cursor])

  const selected = selectedId && visibleIds.has(selectedId) ? (MISSION_BY_ID.get(selectedId) ?? null) : null
  const index = selected ? visible.findIndex((m) => m.id === selected.id) : -1

  const stats: Stats = {
    shown: revealed.length,
    landings: revealed.filter((m) => m.types.includes('lander') && (m.outcome === 'success' || m.outcome === 'partial')).length,
    samples: revealed.filter((m) => m.types.includes('sample') && m.outcome === 'success').length,
  }

  const filtered = agencies.size > 0 || types.size > 0 || outcome !== 'all' || q !== ''
  const atToday = cursor >= TODAY - 0.004
  const activeChapter = CHAPTERS.find((c) => {
    if (c.id === 'today') return selected?.id === LATEST_ID && atToday && !filtered
    if (c.id === 'moon') return selected === null && atToday && !filtered
    return selected?.id === c.id
  })?.id

  const onRotate = (dLat: number, dLon: number) => {
    cancelAnimationFrame(rafRef.current)
    setView((v) => ({ lat: clamp(v.lat + dLat, -90, 90), lon: v.lon + dLon }))
  }

  const onEra = (e: Era) => {
    setPlaying(false)
    setCursor(Math.min(e.to - 0.01, TODAY))
  }

  const nearPreset = (p: View) => Math.abs(view.lat - p.lat) < 1.5 && Math.abs(((view.lon - p.lon + 540) % 360) - 180) < 1.5
  const lonShown = ((((view.lon + 180) % 360) + 360) % 360) - 180

  return (
    <div className="hx">
      <div className="hx-sky" aria-hidden="true" />
      <div className="hx-shell">
        <header className="hx-head">
          <div className="hx-brand">
            <span className="hx-mark" aria-label="NYXOS">
              NYXOS
            </span>
            <div>
              <p className="hx-kicker">Lunar Archive</p>
              <h1>The Moon, mission by mission</h1>
            </div>
          </div>
          <nav className="hx-chapters" aria-label="Jump to a moment">
            {CHAPTERS.map((c) => (
              <button key={c.id} className={`hx-chip${activeChapter === c.id ? ' on' : ''}`} aria-pressed={activeChapter === c.id} onClick={() => chapter(c.id)}>
                {c.label}
              </button>
            ))}
          </nav>
        </header>

        <div className="hx-filters" role="group" aria-label="Filter missions">
          <div className="hx-fgroup" role="group" aria-label="Agency">
            {AGENCIES.map((a) => (
              <button key={a.id} className={`hx-f${agencies.has(a.id) ? ' on' : ''}`} aria-pressed={agencies.has(a.id)} onClick={() => setAgencies(toggled(agencies, a.id))}>
                <i style={{ background: a.color }} />
                {a.short}
              </button>
            ))}
          </div>
          <div className="hx-fgroup" role="group" aria-label="Mission type">
            {TYPE_ORDER.map((t) => (
              <button key={t} className={`hx-f${types.has(t) ? ' on' : ''}`} aria-pressed={types.has(t)} onClick={() => setTypes(toggled(types, t))}>
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <div className="hx-fgroup hx-seg" role="group" aria-label="Outcome">
            {(['all', ...OUTCOME_ORDER] as const).map((o) => (
              <button key={o} className={`hx-f${outcome === o ? ' on' : ''}`} aria-pressed={outcome === o} onClick={() => setOutcome(o)}>
                {o === 'all' ? 'Any outcome' : OUTCOME_LABELS[o]}
              </button>
            ))}
          </div>
          <label className="hx-search">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" />
            </svg>
            <input type="search" placeholder="Search missions, sites, crews" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search missions" />
          </label>
          {filtered && (
            <button className="hx-reset" onClick={clearFilters}>
              Reset · {visible.length} of {MISSIONS.length}
            </button>
          )}
        </div>

        <main className="hx-main">
          <section className="hx-stage" aria-label="Moon globe">
            <div className="hx-streak" aria-hidden="true" />
            <div className="hx-readout">
              <span>Selenographic view</span>
              <b>
                {Math.abs(view.lat).toFixed(0)}° {view.lat < 0 ? 'S' : 'N'} · {Math.abs(lonShown).toFixed(0)}° {lonShown < 0 ? 'W' : 'E'}
              </b>
            </div>
            <div className="hx-views" role="group" aria-label="Globe view">
              {PRESETS.map((p) => (
                <button key={p.id} className={`hx-f${nearPreset(p.view) ? ' on' : ''}`} aria-pressed={nearPreset(p.view)} onClick={() => animateTo(p.view)}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="hx-globe">
              <Globe missions={revealed} selectedId={selected?.id ?? null} view={view} onRotate={onRotate} onSelect={select} />
            </div>
            {selected && !selected.site && (
              <p className="hx-nosite">
                <b>{selected.name}</b> has no surface site
              </p>
            )}
            <ul className="hx-legend" aria-label="Marker key">
              <li>
                <svg viewBox="-8 -8 16 16" aria-hidden="true">
                  <rect x="-4.5" y="-4.5" width="9" height="9" rx="1" transform="rotate(45)" />
                </svg>
                Crewed
              </li>
              <li>
                <svg viewBox="-8 -8 16 16" aria-hidden="true">
                  <circle r="4.5" />
                </svg>
                Success
              </li>
              <li>
                <svg viewBox="-8 -8 16 16" aria-hidden="true">
                  <circle r="4.5" />
                  <circle r="1.8" className="hole" />
                </svg>
                Partial
              </li>
              <li>
                <svg viewBox="-8 -8 16 16" aria-hidden="true">
                  <path d="M-4 -4L4 4M4 -4L-4 4" className="x" />
                </svg>
                Lost
              </li>
              <li>
                <svg viewBox="-8 -8 16 16" aria-hidden="true">
                  <circle r="4.5" className="ring" />
                </svg>
                Planned
              </li>
            </ul>
            <p className="hx-hint">Drag to rotate</p>
          </section>

          <aside className="hx-side" aria-label="Mission details">
            <div className="hx-tabs" role="tablist">
              <button role="tab" aria-selected={panel === 'mission'} className={panel === 'mission' ? 'on' : ''} onClick={() => setPanel('mission')}>
                {selected ? 'Mission' : 'Overview'}
              </button>
              <button role="tab" aria-selected={panel === 'ledger'} className={panel === 'ledger' ? 'on' : ''} onClick={() => setPanel('ledger')}>
                Ledger <span>{revealed.length}</span>
              </button>
            </div>
            <div className="hx-panel" role="tabpanel">
              {panel === 'ledger' ? (
                <Ledger missions={revealed} selectedId={selected?.id ?? null} onSelect={select} />
              ) : selected ? (
                <Detail
                  mission={selected}
                  index={index}
                  total={visible.length}
                  onStep={(dir) => {
                    const next = visible[index + dir]
                    if (next) select(next.id)
                  }}
                  onShowSite={() => animateTo(viewFor(selected))}
                />
              ) : (
                <Overview stats={stats} onEra={onEra} />
              )}
            </div>
          </aside>
        </main>

        <Timeline
          visibleIds={visibleIds}
          selectedId={selected?.id ?? null}
          cursor={cursor}
          playing={playing}
          onSelect={select}
          onCursor={(t) => {
            setPlaying(false)
            setCursor(clamp(t, MIN_T, MAX_T))
          }}
          onTogglePlay={togglePlay}
          onToday={() => {
            setPlaying(false)
            setCursor(TODAY)
          }}
        />
      </div>
      <NavRail active="history" />
    </div>
  )
}
