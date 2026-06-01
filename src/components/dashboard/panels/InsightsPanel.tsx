import Link from 'next/link'
import { InsiderGate } from '@/components/ui/InsiderGate'
import type { InsightReport } from '@/types/dashboard'

/**
 * Insider insights list. Insiders get linked report cards; non-Insiders see
 * the same cards as locked teasers with an upsell gate on top — selling the
 * value rather than hiding it (upsell pillar).
 */
export function InsightsPanel({
  insights,
  locked,
}: {
  insights: InsightReport[]
  locked: boolean
}) {
  return (
    <>
      {locked && (
        <InsiderGate variant="panel" feature="insights" ctaHref="/dashboard/membership" />
      )}
      <div className="dash-panel">
        <h2 className="panel-section-title">Latest reports</h2>
        <ul className="insight-list">
          {insights.map((report) => {
            const inner = (
              <>
                <span className="tag">{report.category}</span>
                <h3 className="insight-title">{report.title}</h3>
                <p className="insight-summary">{report.summary}</p>
                <time className="insight-date" dateTime={report.date}>
                  {report.date}
                </time>
              </>
            )
            return (
              <li key={report.id} className={`insight-card ${locked ? 'is-locked' : ''}`}>
                {locked ? inner : <Link href={report.href}>{inner}</Link>}
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
