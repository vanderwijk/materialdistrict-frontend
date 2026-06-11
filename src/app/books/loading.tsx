/**
 * Books overzicht — loading skeleton.
 *
 * Gerendered tijdens de eerste server-render van `/books` en bij
 * hard-refresh/deeplink. Single-column: page-header + portrait card-grid.
 */

import { Skeleton } from '@/components/ui'

const SKELETON_CARDS = Array.from({ length: 8 }, (_, i) => i)

export default function BooksLoading() {
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
              <Skeleton width="100%" height="240px" />
              <div style={{ padding: '14px 16px 16px' }}>
                <Skeleton width="40%" />
                <Skeleton variant="title" width="80%" />
                <Skeleton width="30%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
