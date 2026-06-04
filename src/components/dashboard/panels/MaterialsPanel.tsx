'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconAdd, IconMaterial, IconEdit } from '@/components/ui/icons'
import { UNLIMITED_PUBLICATIONS } from '@/types/shared'
import type { MaterialListRow, MaterialPublicationStatus } from '@/types/dashboard'

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

/** Heads-up tekst bij het offline halen van een featured materiaal. */
function featuredHeadsUp(m: MaterialListRow): string {
  if (m.featuredState === 'active') {
    return `“${m.name}” is featured this week. While it’s offline it won’t appear in the featured spots.`
  }
  const wk = m.featuredWeekStart ? ` (week of ${fmtDate(m.featuredWeekStart)})` : ''
  return `“${m.name}” is scheduled as featured${wk}. While it’s offline it won’t appear there.`
}

/**
 * Brand materials management. Lists materials with an online/offline toggle,
 * shows publication quota usage, and links to create/edit. Status changes are
 * optimistic local state until `PATCH .../materials/{id}` lands.
 */
export function MaterialsPanel({
  slug,
  brandId,
  materials: initial,
  quota,
  used,
}: {
  slug: string
  brandId: number
  materials: MaterialListRow[]
  quota: number
  used: number
}) {
  const [materials, setMaterials] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [confirmOffline, setConfirmOffline] = useState<MaterialListRow | null>(null)
  const unlimited = quota === UNLIMITED_PUBLICATIONS
  const atLimit = !unlimited && used >= quota
  const pct = unlimited || quota <= 0 ? 0 : Math.min(100, Math.round((used / quota) * 100))
  const fill = { '--progress': `${pct}%` } as CSSProperties

  function flip(id: number) {
    setMaterials((list) =>
      list.map((m) =>
        m.id === id
          ? { ...m, status: (m.status === 'online' ? 'offline' : 'online') as MaterialPublicationStatus }
          : m,
      ),
    )
  }

  async function doToggle(id: number) {
    const current = materials.find((m) => m.id === id)
    if (!current) return
    const next: MaterialPublicationStatus = current.status === 'online' ? 'offline' : 'online'

    setError(null)
    flip(id) // optimistic
    try {
      const res = await fetch(`/api/dashboard/brands/${brandId}/materials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) {
        flip(id) // revert
        const err = await res.json().catch(() => null)
        setError(
          err?.code === 'md_dashboard_quota_exceeded'
            ? 'Publication quota reached — upgrade your plan or take another material offline first.'
            : err?.message ?? 'Could not update the material. Please try again.',
        )
      }
    } catch {
      flip(id) // revert
      setError('Could not update the material. Please try again.')
    }
  }

  /**
   * Gate before flipping. Taking a featured material offline gets a soft,
   * non-blocking heads-up first — WP hides offline materials from the featured
   * spots, but the booking (and the used quota) stay. Everything else toggles
   * straight away.
   */
  function toggleStatus(id: number) {
    const current = materials.find((m) => m.id === id)
    if (!current) return
    const goingOffline = current.status === 'online'
    if (
      goingOffline &&
      (current.featuredState === 'active' || current.featuredState === 'scheduled')
    ) {
      setConfirmOffline(current)
      return
    }
    void doToggle(id)
  }

  function confirmTakeOffline() {
    if (!confirmOffline) return
    const id = confirmOffline.id
    setConfirmOffline(null)
    void doToggle(id)
  }

  return (
    <div className="dash-panel">
      <div className="panel-head-row">
        <div>
          <h2 className="panel-section-title">Materials</h2>
          <p className="field-helper">
            {unlimited ? `${used} published · unlimited` : `${used} of ${quota} published`}
          </p>
        </div>
        <Link
          href={`/dashboard/brands/${slug}/materials/new`}
          className="btn btn-primary btn-sm"
          aria-disabled={atLimit}
        >
          <IconAdd size={16} /> Add material
        </Link>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {confirmOffline && (
        <div role="alert">
          <p className="field-helper">{featuredHeadsUp(confirmOffline)}</p>
          <div className="g2">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setConfirmOffline(null)}
            >
              Keep online
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={confirmTakeOffline}
            >
              Take offline anyway
            </button>
          </div>
        </div>
      )}

      {!unlimited && quota > 0 && (
        <div className="progress-track memb-quota">
          <div className="progress-fill" style={fill} />
        </div>
      )}

      {materials.length === 0 ? (
        <EmptyState
          icon={<IconMaterial size={28} />}
          title="No materials yet"
          description="Add your first material to start appearing in the materials directory."
          actions={
            <Link href={`/dashboard/brands/${slug}/materials/new`} className="btn btn-primary">
              Add material
            </Link>
          }
        />
      ) : (
        <div className="table-wrap t-materials">
          <div className="t-head">
            <span>Name</span>
            <span>Category</span>
            <span>Status</span>
            <span>Updated</span>
            <span className="t-col-end">Edit</span>
          </div>
          {materials.map((m, i) => (
            <div key={m.id} className={`t-row ${i % 2 === 1 ? 'alt' : ''}`}>
              <span className="t-strong">{m.name}</span>
              <span>{m.category}</span>
              <span>
                <button
                  type="button"
                  className={`status-toggle ${m.status === 'online' ? 'is-online' : ''}`}
                  role="switch"
                  aria-checked={m.status === 'online'}
                  onClick={() => toggleStatus(m.id)}
                >
                  {m.status === 'online' ? 'Online' : 'Offline'}
                </button>
              </span>
              <span>{fmtDate(m.updatedAt)}</span>
              <span className="t-col-end">
                <Link
                  href={`/dashboard/brands/${slug}/materials/${m.id}/edit`}
                  className="icon-btn"
                  aria-label={`Edit ${m.name}`}
                >
                  <IconEdit size={16} />
                </Link>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
