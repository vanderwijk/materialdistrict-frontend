/**
 * Articles overzicht — loading skeleton.
 *
 * Sessie 6.
 *
 * Gerendered tijdens de eerste server-render van `/article` (RSC suspend)
 * en bij hard-refresh/deeplink. Layout matched de echte page: page-header
 * + story-type-sidebar + featured-card + content-card-grid.
 */

import { Skeleton } from '@/components/ui'

const SKELETON_CARDS = Array.from({ length: 6 }, (_, i) => i)
const SKELETON_TYPES = Array.from({ length: 6 }, (_, i) => i)

export default function ArticlesLoading() {
  return (
    <>
      <header className="ov-page-header">
        <Skeleton width="100px" height="14px" />
        <Skeleton variant="title" width="180px" />
      </header>

      <div className="ov-wrap" aria-busy="true" aria-live="polite">
        <aside className="filter-sidebar" aria-hidden="true">
          <div style={{ padding: '8px 0 12px' }}>
            <Skeleton width="50%" height="12px" />
          </div>
          {SKELETON_TYPES.map((i) => (
            <div key={i} style={{ padding: '8px 0' }}>
              <Skeleton width="70%" height="16px" />
            </div>
          ))}
        </aside>

        <div>
          {/* Featured */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              marginBottom: '16px',
            }}
          >
            <Skeleton width="100%" height="220px" />
            <div style={{ padding: '16px' }}>
              <Skeleton width="30%" />
              <Skeleton variant="title" width="60%" />
            </div>
          </div>

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
      </div>
    </>
  )
}
