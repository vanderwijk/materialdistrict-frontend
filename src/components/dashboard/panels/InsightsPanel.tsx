import type { CSSProperties } from 'react'
import Link from 'next/link'
import { InsiderBadge } from '@/components/ui/InsiderBadge'
import { IconDownload } from '@/components/ui/icons'
import { INSIDER_PRICING } from '@/lib/config/membership'
import type { InsightReport } from '@/types/dashboard'

const CTA_HREF = '/dashboard/membership'

function fmtMonthYear(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(d)
}

/**
 * Insider insights. Reports are always listed (sell the value, don't hide it).
 * Per report, access follows `insiderOnly` + the viewer's Insider status:
 * downloadable reports show "Download PDF", gated ones show an "Insider only"
 * badge. Non-Insiders also get the upsell banner on top. The dashboard-wide
 * tier-preview button (demo) lands in a later step.
 */
export function InsightsPanel({
  insights,
  isInsider,
}: {
  insights: InsightReport[]
  isInsider: boolean
}) {
  return (
    <div className="dash-panel">
      {!isInsider && (
        <div className="insights-banner">
          <div className="insights-banner-main">
            <InsiderBadge size="sm" padded>Insider only</InsiderBadge>
            <span className="insights-banner-title">All reports included with Insider</span>
            <span className="insights-banner-sub">
              Join for &euro;{INSIDER_PRICING.monthly.amount}/month and download all back issues.
            </span>
          </div>
          <Link href={CTA_HREF} className="btn btn-insider btn-md">
            Become an Insider &rarr;
          </Link>
        </div>
      )}

      {insights.length === 0 ? (
        <p className="field-helper">No reports yet.</p>
      ) : (
        <ul className="insight-list">
          {insights.map((report) => {
            const canDownload = isInsider || !report.insiderOnly
            const thumbStyle = { '--cover': report.gradient } as CSSProperties
            return (
              <li key={report.id} className="insight-row">
                <span className="insight-thumb" style={thumbStyle} aria-hidden="true" />
                <div className="insight-row-body">
                  <Link href={report.href} className="insight-row-title">
                    {report.title}
                  </Link>
                  <div className="insight-row-meta">
                    {[fmtMonthYear(report.date), `${report.pages} pages`, report.format]
                      .filter(Boolean)
                      .join(' \u00b7 ')}
                  </div>
                </div>
                <div className="insight-row-action">
                  {canDownload ? (
                    <a
                      href={report.pdfUrl ?? '#'}
                      className="btn btn-outline btn-sm"
                      download
                    >
                      <IconDownload size={15} /> Download PDF
                    </a>
                  ) : (
                    <InsiderBadge size="sm" padded>Insider only</InsiderBadge>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
