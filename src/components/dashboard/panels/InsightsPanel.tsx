'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { InsiderBadge } from '@/components/ui/InsiderBadge'
import { IconDownload } from '@/components/ui/icons'
import { INSIDER_PRICING } from '@/lib/config/membership'
import { usePreviewMode } from '@/lib/hooks/usePreviewMode'
import type { InsightReport } from '@/types/dashboard'

const CTA_HREF = '/dashboard/membership'

/** Stabiele preview-id voor het Insider-insights-paneel (telt als één feature). */
const PREVIEW_ID = 'insider-insights'

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
 * badge. Non-Insiders also get the upsell banner on top.
 *
 * Tier-preview (S13.5): the banner carries a "Preview" button that enables the
 * shared preview mode (via `usePreviewMode`, mounted in `DashboardShell`).
 * While previewing, gated reports render the Insider affordance (a "Download
 * PDF" button) — but the actual file stays gated: the button routes to the
 * upgrade CTA instead of the download endpoint, so the paywalled asset is
 * never given away. Closing happens centrally via the `PreviewModeIndicator`.
 */
export function InsightsPanel({
  insights,
  isInsider,
}: {
  insights: InsightReport[]
  isInsider: boolean
}) {
  const { isEnabled, enable } = usePreviewMode()
  const previewing = isEnabled(PREVIEW_ID)

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
          <div className="insights-banner-actions">
            {!previewing && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => enable(PREVIEW_ID)}
              >
                Preview
              </button>
            )}
            <Link href={CTA_HREF} className="btn btn-insider btn-md">
              Become an Insider &rarr;
            </Link>
          </div>
        </div>
      )}

      {insights.length === 0 ? (
        <p className="field-helper">No reports yet.</p>
      ) : (
        <div className="insight-grid">
          {insights.map((report) => {
            // Echte toegang — onveranderd, bepaalt of het werkelijke bestand mag.
            const canDownload = isInsider || !report.insiderOnly
            const coverStyle = { '--cover': report.gradient } as CSSProperties
            const meta = [fmtMonthYear(report.date), `${report.pages} pages`, report.format]
              .filter(Boolean)
              .join(' \u00b7 ')
            return (
              <article key={report.id} className="insight-card">
                <Link
                  href={report.href}
                  className="insight-card-cover"
                  style={report.thumbnailUrl ? undefined : coverStyle}
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  {report.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={report.thumbnailUrl} alt="" />
                  )}
                </Link>
                <div className="insight-card-body">
                  <span className="insight-card-label">Report</span>
                  <Link href={report.href} className="insight-card-title">
                    {report.title}
                  </Link>
                  {report.description && (
                    <p className="insight-card-desc">{report.description}</p>
                  )}
                  <div className="insight-card-meta">{meta}</div>
                  <div className="insight-card-action">
                    {canDownload && report.hasPdf ? (
                      // Echte Insider (of vrij rapport): echte download.
                      <a
                        href={`/api/dashboard/insider-insights/${report.id}/download`}
                        className="btn btn-green btn-sm"
                        download
                      >
                        <IconDownload size={15} /> Download PDF
                      </a>
                    ) : previewing && report.insiderOnly && report.hasPdf ? (
                      // Preview: toon de Insider-affordance, maar route naar de
                      // upgrade-CTA — het bestand blijft gated (server-side 403).
                      <Link href={CTA_HREF} className="btn btn-green btn-sm">
                        <IconDownload size={15} /> Download PDF
                      </Link>
                    ) : !canDownload ? (
                      <InsiderBadge size="sm" padded>Insider only</InsiderBadge>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
