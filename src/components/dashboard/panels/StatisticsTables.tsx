'use client'

import { useState } from 'react'
import { Tabs, TabItem } from '@/components/ui/Tabs'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconInsiderInsights } from '@/components/ui/icons'
import type { BrandBrochureStatistics, MaterialStatRow } from '@/types/dashboard'

const NUM = new Intl.NumberFormat('en-GB')

type StatsTab = 'materials' | 'brochures'

/**
 * Client island for the statistics performance tables. Holds the active-tab
 * state (Materials / Brochures) so `StatisticsPanel` can stay a server
 * component.
 */
export function StatisticsTables({
  materials,
  brochures,
}: {
  materials: MaterialStatRow[]
  brochures: BrandBrochureStatistics
}) {
  const [tab, setTab] = useState<StatsTab>('materials')
  const hasBrochureData = brochures.brand.length > 0 || brochures.material.length > 0

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
          </div>
          {materials.map((row, i) => (
            <div key={row.materialId} className={`t-row ${i % 2 === 1 ? 'alt' : ''}`}>
              <span className="t-strong">{row.name}</span>
              <span>{NUM.format(row.views)}</span>
              <span>{NUM.format(row.requests)}</span>
            </div>
          ))}
        </div>
      ) : !hasBrochureData ? (
        <EmptyState
          icon={<IconInsiderInsights size={28} />}
          title="No brochure data yet"
          description="Download counts appear here once your brochures get downloads."
        />
      ) : (
        <div className="stats-brochures-stack">
          {brochures.brand.length > 0 && (
            <section className="stats-brochures-section">
              <h3 className="stats-brochures-heading">Brand brochures</h3>
              <div className="table-wrap t-brochures">
                <div className="t-head">
                  <span>Brochure</span>
                  <span>Downloads</span>
                </div>
                {brochures.brand.map((row, i) => (
                  <div
                    key={row.attachmentId || row.title}
                    className={`t-row ${i % 2 === 1 ? 'alt' : ''}`}
                  >
                    <span className="t-strong">{row.title}</span>
                    <span>{NUM.format(row.downloads)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {brochures.material.length > 0 && (
            <section className="stats-brochures-section">
              <h3 className="stats-brochures-heading">Material brochures</h3>
              <div className="table-wrap t-brochures-material">
                <div className="t-head">
                  <span>Material</span>
                  <span>Brochure</span>
                  <span>Downloads</span>
                </div>
                {brochures.material.map((row, i) => (
                  <div
                    key={`${row.materialId}-${row.attachmentId || row.title}`}
                    className={`t-row ${i % 2 === 1 ? 'alt' : ''}`}
                  >
                    <span className="t-strong">{row.materialName}</span>
                    <span>{row.title}</span>
                    <span>{NUM.format(row.downloads)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
