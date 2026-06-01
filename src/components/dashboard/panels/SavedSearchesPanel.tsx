'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconSearch, IconDelete, IconBell } from '@/components/ui/icons'
import type { SavedSearch } from '@/types/dashboard'

/**
 * Saved searches panel (Insider). Each row re-runs the search on /materials,
 * toggles e-mail alerts, or is removed. All mutations are local until the
 * saved-search endpoints land.
 */
export function SavedSearchesPanel({ initial }: { initial: SavedSearch[] }) {
  const [searches, setSearches] = useState(initial)

  function toggleAlert(id: string) {
    setSearches((list) =>
      list.map((s) => (s.id === id ? { ...s, alertsEnabled: !s.alertsEnabled } : s)),
    )
  }

  function remove(id: string) {
    setSearches((list) => list.filter((s) => s.id !== id))
  }

  if (searches.length === 0) {
    return (
      <div className="dash-panel">
        <EmptyState
          icon={<IconSearch size={28} />}
          title="No saved searches"
          description="Save a filter combination on the materials page to get alerts when new matches appear."
          actions={
            <Link href="/materials" className="btn btn-primary">
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
      <ul className="ss-list">
        {searches.map((s) => (
          <li key={s.id} className="ss-row">
            <div className="ss-main">
              <h3 className="ss-name">{s.name}</h3>
              <p className="ss-summary">{s.summary}</p>
              <p className="ss-count">{s.resultCount} results</p>
            </div>
            <div className="ss-actions">
              <button
                type="button"
                className={`btn btn-sm ${s.alertsEnabled ? 'btn-green' : 'btn-outline'}`}
                onClick={() => toggleAlert(s.id)}
                aria-pressed={s.alertsEnabled}
              >
                <IconBell size={14} /> {s.alertsEnabled ? 'Alerts on' : 'Alerts off'}
              </button>
              <Link href={`/materials?${s.query}`} className="btn btn-outline btn-sm">
                Run search
              </Link>
              <button
                type="button"
                className="icon-btn"
                onClick={() => remove(s.id)}
                aria-label={`Delete saved search ${s.name}`}
              >
                <IconDelete size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
