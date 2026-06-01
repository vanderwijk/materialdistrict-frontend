import { EmptyState } from '@/components/ui/EmptyState'
import { IconInsiderInsights } from '@/components/ui/icons'
import type { BrandStatistics } from '@/types/dashboard'

const NUM = new Intl.NumberFormat('en-GB')

/** Brand statistics: headline metric cards + per-material performance table. */
export function StatisticsPanel({ stats }: { stats: BrandStatistics }) {
  if (stats.metrics.length === 0) {
    return (
      <div className="dash-panel">
        <EmptyState
          icon={<IconInsiderInsights size={28} />}
          title="No statistics yet"
          description="Once your materials get views and requests, performance shows up here."
        />
      </div>
    )
  }

  return (
    <>
      <div className="stat-grid">
        {stats.metrics.map((m) => (
          <div key={m.label} className="stat-card">
            <span className="stat-label">{m.label}</span>
            <span className="stat-value">{NUM.format(m.value)}</span>
            {m.note && <span className="stat-note">{m.note}</span>}
          </div>
        ))}
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Per material</h2>
        <div className="table-wrap t-stats">
          <div className="t-head">
            <span>Material</span>
            <span>Views</span>
            <span>Requests</span>
            <span>Downloads</span>
          </div>
          {stats.materials.map((row, i) => (
            <div key={row.materialId} className={`t-row ${i % 2 === 1 ? 'alt' : ''}`}>
              <span className="t-strong">{row.name}</span>
              <span>{NUM.format(row.views)}</span>
              <span>{NUM.format(row.requests)}</span>
              <span>{NUM.format(row.downloads)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
