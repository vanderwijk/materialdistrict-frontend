/**
 * Books overzicht — loading skeleton. Spiegelt de materials-overzichts-skeleton:
 * breadcrumb + h1-skeleton, filter-sidebar-skeleton en card-skeletons in de
 * `.ov-grid-3`. Thumbs in portrait (3:4) zodat het de echte boek-tegels benadert.
 */

import { Skeleton } from '@/components/ui'

const SKELETON_CARDS = Array.from({ length: 12 }, (_, i) => i)

export default function BooksLoading() {
  return (
    <>
      <header className="ov-page-header">
        <Skeleton width="120px" height="14px" />
        <Skeleton variant="title" width="200px" />
      </header>

      <div className="ov-wrap" aria-busy="true" aria-live="polite">
        <aside className="filter-sidebar" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}
            >
              <Skeleton width="60%" height="16px" />
            </div>
          ))}
        </aside>

        <div>
          <div className="ov-grid-3">
            {SKELETON_CARDS.map((i) => (
              <div key={i} className="card">
                <div style={{ aspectRatio: '3 / 4' }}>
                  <Skeleton variant="thumb" />
                </div>
                <div className="card-body">
                  <Skeleton width="40%" />
                  <Skeleton variant="title" width="90%" />
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
