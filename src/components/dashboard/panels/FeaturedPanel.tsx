import { EmptyState } from '@/components/ui/EmptyState'
import { IconFeatured } from '@/components/ui/icons'
import type { FeaturedPlacement, FeaturedSlotStatus } from '@/types/dashboard'

const STATUS_BADGE: Record<FeaturedSlotStatus, string> = {
  active: 'b-green',
  scheduled: 'b-amber',
  available: 'b-gray',
}

function fmtRange(start: string | null, end: string | null): string {
  if (!start || !end) return '—'
  const f = (iso: string) =>
    new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(iso))
  return `${f(start)} – ${f(end)}`
}

/** Featured placements (Partner). Booked + available promotional slots. */
export function FeaturedPanel({ placements }: { placements: FeaturedPlacement[] }) {
  if (placements.length === 0) {
    return (
      <div className="dash-panel">
        <EmptyState
          icon={<IconFeatured size={28} />}
          title="No placements yet"
          description="Featured placements promote your materials across MaterialDistrict."
        />
      </div>
    )
  }

  return (
    <div className="dash-panel">
      <h2 className="panel-section-title">Featured placements</h2>
      <ul className="featured-list">
        {placements.map((p) => (
          <li key={p.id} className="featured-row">
            <div className="featured-main">
              <h3 className="featured-slot">{p.slot}</h3>
              {p.subject && <p className="field-helper">{p.subject}</p>}
              <p className="featured-range">{fmtRange(p.startsAt, p.endsAt)}</p>
            </div>
            <div className="featured-side">
              <span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span>
              {p.status === 'available' && (
                <button type="button" className="btn btn-primary btn-sm">Book slot</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
