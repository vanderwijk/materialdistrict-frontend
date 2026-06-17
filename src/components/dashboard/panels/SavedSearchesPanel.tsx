'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconSearch, IconDelete, IconBell } from '@/components/ui/icons'
import type { SavedSearch } from '@/types/dashboard'

/**
 * Saved searches panel (Insider) — catalogus-weergave.
 *
 * Elke opgeslagen zoekopdracht is een kaart met:
 *   - een thumbnailstrip van de huidige matches (live opgehaald via het
 *     bestaande lichte materials-endpoint `/api/materials/list-light`, dat
 *     dezelfde query-params accepteert als /material en `thumbnailUrl` +
 *     `totalRows` teruggeeft);
 *   - filter-chips, afgeleid uit de canonieke query;
 *   - de alert-toggle, "Run search" en verwijderen.
 *
 * Alle mutaties zijn optimistisch; de alert-toggle bewaart de voorkeur al in
 * WordPress (de alert-motor zelf is backend-werk en nog niet gebouwd).
 */

const HIDDEN_PARAMS = new Set(['order', 'search_materials', 'paged', 'page', 'per_page'])

function prettify(value: string): string {
  return value
    .replace(/\[\]$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

/** Leesbare filter-chips uit de canonieke query-string. */
function chipsFromQuery(query: string): string[] {
  const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query)
  const chips: string[] = []
  const search = params.get('search_materials')
  if (search) chips.push(`“${search}”`)
  for (const [key, value] of params.entries()) {
    if (HIDDEN_PARAMS.has(key)) continue
    value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .forEach((v) => chips.push(prettify(v)))
  }
  return chips
}

interface Preview {
  thumbs: string[]
  total: number
}

export function SavedSearchesPanel({ initial }: { initial: SavedSearch[] }) {
  const [searches, setSearches] = useState(initial)
  const [previews, setPreviews] = useState<Record<string, Preview>>({})

  // Eénmalig de thumbnails + live tellingen ophalen per opgeslagen zoekopdracht.
  useEffect(() => {
    let cancelled = false
    async function load() {
      const entries = await Promise.all(
        initial.map(async (s) => {
          try {
            const res = await fetch(`/api/materials/list-light?${s.query}`)
            if (!res.ok) return null
            const data = (await res.json()) as {
              items?: { thumbnailUrl: string | null }[]
              totalRows?: number
            }
            const thumbs = (data.items ?? [])
              .map((i) => i.thumbnailUrl)
              .filter((u): u is string => Boolean(u))
              .slice(0, 5)
            return [s.id, { thumbs, total: data.totalRows ?? s.resultCount }] as const
          } catch {
            return null
          }
        }),
      )
      if (cancelled) return
      const map: Record<string, Preview> = {}
      for (const e of entries) if (e) map[e[0]] = e[1]
      setPreviews(map)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [initial])

  async function toggleAlert(id: string) {
    const target = searches.find((s) => s.id === id)
    if (!target) return
    const next = !target.alertsEnabled
    setSearches((list) =>
      list.map((s) => (s.id === id ? { ...s, alertsEnabled: next } : s)),
    ) // optimistic
    try {
      const res = await fetch(`/api/dashboard/saved-searches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertsEnabled: next }),
      })
      if (!res.ok) {
        setSearches((list) =>
          list.map((s) => (s.id === id ? { ...s, alertsEnabled: !next } : s)),
        ) // revert
      }
    } catch {
      setSearches((list) =>
        list.map((s) => (s.id === id ? { ...s, alertsEnabled: !next } : s)),
      )
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this saved search? This cannot be undone.')) return
    const prev = searches
    setSearches((list) => list.filter((s) => s.id !== id)) // optimistic
    try {
      const res = await fetch(`/api/dashboard/saved-searches/${id}`, { method: 'DELETE' })
      if (!res.ok) setSearches(prev)
    } catch {
      setSearches(prev)
    }
  }

  if (searches.length === 0) {
    return (
      <div className="dash-panel">
        <EmptyState
          icon={<IconSearch size={28} />}
          title="No saved searches"
          description="Save a filter combination on the materials page to get alerts when new matches appear."
          actions={
            <Link href="/material" className="btn btn-primary">
              Search materials
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="dash-panel">
      <h2 className="panel-section-title">Saved searches</h2>
      <div className="ss-grid">
        {searches.map((s) => {
          const preview = previews[s.id]
          const chips = chipsFromQuery(s.query)
          const count = preview?.total ?? s.resultCount
          return (
            <article key={s.id} className="ss-card">
              <Link href={`/material?${s.query}`} className="ss-card-thumbs" aria-label={`Run search ${s.name}`}>
                {preview && preview.thumbs.length > 0 ? (
                  preview.thumbs.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt="" className="ss-thumb" />
                  ))
                ) : (
                  <span className="ss-thumbs-empty">
                    <IconSearch size={20} />
                  </span>
                )}
              </Link>

              <div className="ss-card-body">
                <div className="ss-card-head">
                  <h3 className="ss-name">{s.name}</h3>
                  <button
                    type="button"
                    className="icon-btn is-sm is-ghost is-delete"
                    onClick={() => remove(s.id)}
                    aria-label={`Delete saved search ${s.name}`}
                  >
                    <IconDelete size={16} />
                  </button>
                </div>

                {chips.length > 0 ? (
                  <div className="ss-chips">
                    {chips.map((c, i) => (
                      <span key={i} className="ss-chip">{c}</span>
                    ))}
                  </div>
                ) : (
                  <p className="ss-summary">{s.summary}</p>
                )}

                <p className="ss-count">{count} {count === 1 ? 'result' : 'results'}</p>

                <div className="ss-card-actions">
                  <button
                    type="button"
                    className={`btn btn-sm ${s.alertsEnabled ? 'btn-green' : 'btn-outline'}`}
                    onClick={() => toggleAlert(s.id)}
                    aria-pressed={s.alertsEnabled}
                  >
                    <IconBell size={14} /> {s.alertsEnabled ? 'Alerts on' : 'Alerts off'}
                  </button>
                  <Link href={`/material?${s.query}`} className="btn btn-outline btn-sm">
                    Run search
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
