'use client'

import { useState } from 'react'
import { Tabs, TabItem } from '@/components/ui/Tabs'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconInsiderInsights } from '@/components/ui/icons'
import type { MaterialStatRow, BrochureStatRow } from '@/types/dashboard'

const NUM = new Intl.NumberFormat('en-GB')

type StatsTab = 'materials' | 'brochures'

/**
 * Client island for the statistics performance tables. Holds the active-tab
 * state (Materials / Brochures) so `StatisticsPanel` can stay a server
 * component. Both tables reuse the shared `.table-wrap`/`.t-head`/`.t-row`
 * styling; the Brochures tab shows an empty state until WordPress delivers the
 * per-brochure aggregate.
 */
export function StatisticsTables({
  materials,
  brochures,
}: {
  materials: MaterialStatRow[]
  brochures: BrochureStatRow[]
}) {
  const [tab, setTab] = useState<StatsTab>('materials')

  return (
    <div className="dash-panel">
      <Tabs value={tab} onChange={(v) => setTab(v as StatsTab)} ariaLabel="Statistics view">
        <TabItem value="materials">Materials</TabItem>
        <TabItem value="brochures">Brochures</TabItem>
      </Tabs>

      {tab === 'materials' ? (
        <div className="table-wrap t-stats">
          <div className="t-head">
            <span>Material</span>
            <span>Views</span>
            <span>Requests</span>
            <span>Downloads</span>
          </div>
          {materials.map((row, i) => (
            <div key={row.materialId} className={`t-row ${i % 2 === 1 ? 'alt' : ''}`}>
              <span className="t-strong">{row.name}</span>
              <span>{NUM.format(row.views)}</span>
              <span>{NUM.format(row.requests)}</span>
              <span>{NUM.format(row.downloads)}</span>
            </div>
          ))}
        </div>
      ) : brochures.length === 0 ? (
        <EmptyState
          icon={<IconInsiderInsights size={28} />}
          title="No brochure data yet"
          description="Download counts appear here once your brochures get downloads."
        />
      ) : (
        <div className="table-wrap t-brochures">
          <div className="t-head">
            <span>Brochure</span>
            <span>Downloads</span>
          </div>
          {brochures.map((row, i) => (
            <div key={row.title} className={`t-row ${i % 2 === 1 ? 'alt' : ''}`}>
              <span className="t-strong">{row.title}</span>
              <span>{NUM.format(row.downloads)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
