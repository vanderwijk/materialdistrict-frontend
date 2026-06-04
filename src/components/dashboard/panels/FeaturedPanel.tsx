'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select } from '@/components/ui/form'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconFeatured, IconDelete } from '@/components/ui/icons'
import type { FeaturedSlot, FeaturedSlotsData, FeaturedSlotState } from '@/types/dashboard'

const STATUS_BADGE: Record<FeaturedSlotState, string> = {
  active: 'b-green',
  scheduled: 'b-amber',
  done: 'b-gray',
}

/** How many upcoming weeks to offer in the picker. */
const WEEKS_AHEAD = 12

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Upcoming Mondays whose week starts at least 7 days from today (booking rule). */
function upcomingMondays(count: number): string[] {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 7)
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7)) // roll forward to Monday
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    out.push(toIso(d))
    d.setDate(d.getDate() + 7)
  }
  return out
}

function dateFromIso(iso: string): Date | null {
  const day = iso.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null
  const d = new Date(`${day}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function fmtDay(iso: string): string {
  const d = dateFromIso(iso)
  if (!d) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(d)
  } catch {
    return '—'
  }
}

function fmtWeekRange(startIso: string, endIso?: string): string {
  if (!startIso) return '—'
  let end = endIso
  if (!end) {
    const start = dateFromIso(startIso)
    if (!start) return '—'
    const d = new Date(start)
    d.setDate(d.getDate() + 6)
    end = toIso(d)
  }
  return `${fmtDay(startIso)} – ${fmtDay(end)}`
}

function fmtResetDate(iso: string | null): string {
  if (!iso) return '—'
  const d = dateFromIso(iso)
  if (!d) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d)
  } catch {
    return '—'
  }
}

/**
 * Featured weeks (Partner). Self-service booking of up to `total` weekly slots:
 * pick a material and an upcoming week, or cancel a scheduled one. WordPress
 * owns the rules and the quota; this panel reads the counters and books/cancels
 * via the proxy routes, then refreshes.
 */
export function FeaturedPanel({
  brandId,
  featured,
  materials,
}: {
  brandId: number
  featured: FeaturedSlotsData
  materials: { id: number; name: string }[]
}) {
  const router = useRouter()
  const [materialId, setMaterialId] = useState('')
  const [weekStart, setWeekStart] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bookedWeeks = useMemo(
    () => new Set(featured.slots.map((s) => s.weekStart)),
    [featured.slots],
  )
  const weekOptions = useMemo(
    () =>
      upcomingMondays(WEEKS_AHEAD)
        .filter((w) => !bookedWeeks.has(w))
        .map((w) => ({ value: w, label: fmtWeekRange(w) })),
    [bookedWeeks],
  )

  const remaining = Math.max(0, featured.total - featured.used)

  async function book() {
    if (!materialId || !weekStart) {
      setError('Pick a material and a week first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/dashboard/brands/${brandId}/featured-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: Number(materialId), weekStart }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setError(err?.message ?? 'Could not book this week. Please try again.')
        return
      }
      setMaterialId('')
      setWeekStart('')
      router.refresh()
    } catch {
      setError('Could not book this week. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function cancel(slot: FeaturedSlot) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/dashboard/brands/${brandId}/featured-slots/${encodeURIComponent(slot.id)}`,
        { method: 'DELETE' },
      )
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setError(err?.message ?? 'Could not cancel this booking. Please try again.')
        return
      }
      router.refresh()
    } catch {
      setError('Could not cancel this booking. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="dash-panel">
        <div className="panel-head-row">
          <h2 className="panel-section-title">Featured weeks</h2>
          <span className="badge b-gray">
            {featured.used} of {featured.total} used
          </span>
        </div>
        <p className="panel-section-desc">
          Feature one of your materials on the homepage and at the top of its material type for a full
          week. {featured.total} weeks per membership year, resetting on {fmtResetDate(featured.resetDate)}.
        </p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {materials.length === 0 ? (
          <p className="field-helper">Publish a material first to feature it.</p>
        ) : remaining === 0 ? (
          <p className="field-helper">
            All {featured.total} featured weeks are in use. They reset on {fmtResetDate(featured.resetDate)}.
          </p>
        ) : (
          <>
            <div className="g2">
              <Select
                label="Material"
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                placeholder="Select a material"
                options={materials.map((m) => ({ value: String(m.id), label: m.name }))}
              />
              <Select
                label="Week"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                placeholder="Select a week"
                options={weekOptions}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={book}
              disabled={busy || !materialId || !weekStart}
            >
              Book week
            </button>
          </>
        )}
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Booked weeks</h2>
        {featured.slots.length === 0 ? (
          <EmptyState
            icon={<IconFeatured size={28} />}
            title="No featured weeks booked"
            description="Book a week above to promote a material across MaterialDistrict."
          />
        ) : (
          <ul className="featured-list">
            {featured.slots.map((s) => (
              <li key={s.id} className="featured-row">
                <div className="featured-main">
                  <h3 className="featured-slot">{s.materialName || 'Material'}</h3>
                  <p className="featured-range">{fmtWeekRange(s.weekStart, s.weekEnd)}</p>
                </div>
                <div className="featured-side">
                  <span className={`badge ${STATUS_BADGE[s.status]}`}>
                    {s.isFeaturedNow ? 'live' : s.status}
                  </span>
                  {s.status === 'scheduled' && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => cancel(s)}
                      disabled={busy}
                      aria-label="Cancel booking"
                    >
                      <IconDelete size={16} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
