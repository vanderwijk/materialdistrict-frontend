/**
 * Brands overzicht — loading skeleton.
 *
 * Sessie 5.
 *
 * Gerendered tijdens de eerste server-render van `/brand` (RSC suspend)
 * en bij hard-refresh/deeplink. Layout matched de echte page: page-header
 * + filter-sidebar + brand-tile-grid.
 *
 * Brand-tile-skeleton bootst de banner-met-logo-overlap na zodat er geen
 * layout-shift is wanneer de echte tiles binnenkomen.
 */

import { Skeleton } from '@/components/ui'

const SKELETON_TILES = Array.from({ length: 9 }, (_, i) => i)

export default function BrandsLoading() {
  return (
    <>
      <header className="ov-page-header">
        <Skeleton width="100px" height="14px" />
        <Skeleton variant="title" width="180px" />
      </header>

      <div className="ov-wrap" aria-busy="true" aria-live="polite">
        <aside className="filter-sidebar" aria-hidden="true">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}
            >
              <Skeleton width="55%" height="16px" />
            </div>
          ))}
        </aside>

        <div>
          <div className="ov-grid-brands">
            {SKELETON_TILES.map((i) => (
              <div
                key={i}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}
              >
                <Skeleton width="100%" height="72px" />
                <div style={{ padding: '28px 16px 16px' }}>
                  <Skeleton variant="title" width="70%" />
                  <Skeleton width="40%" />
                  <Skeleton width="90%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
