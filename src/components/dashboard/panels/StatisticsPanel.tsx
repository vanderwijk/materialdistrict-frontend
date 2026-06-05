import { EmptyState } from '@/components/ui/EmptyState'
import { IconInsiderInsights } from '@/components/ui/icons'
import type { BrandStatistics } from '@/types/dashboard'
import { StatisticsTables } from './StatisticsTables'

const NUM = new Intl.NumberFormat('en-GB')

/**
 * Brand statistics: headline metric cards (server) + a tabbed performance
 * section (Materials / Brochures) rendered by a small client island so the tab
 * state stays client-side while this panel remains a server component.
 */
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

      <StatisticsTables materials={stats.materials} brochures={stats.brochures} />
    </>
  )
}
