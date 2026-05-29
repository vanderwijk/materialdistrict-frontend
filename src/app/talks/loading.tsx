/**
 * Talks overzicht — loading skeleton.
 *
 * Sessie 7. Gerendered tijdens de eerste server-render van `/talks` (RSC
 * suspend) en bij hard-refresh/deeplink. Single-column (geen filter-sidebar
 * in v1): page-header + content-card-grid.
 */

import { Skeleton } from '@/components/ui'

const SKELETON_CARDS = Array.from({ length: 6 }, (_, i) => i)

export default function TalksLoading() {
  return (
    <>
      <header className="ov-page-header">
        <Skeleton width="100px" height="14px" />
        <Skeleton variant="title" width="160px" />
      </header>

      <div className="ov-wrap-single" aria-busy="true" aria-live="polite">
        <div className="ov-grid-3">
          {SKELETON_CARDS.map((i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <Skeleton width="100%" height="150px" />
              <div style={{ padding: '14px 16px 16px' }}>
                <Skeleton width="35%" />
                <Skeleton variant="title" width="80%" />
                <Skeleton width="50%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
