/**
 * Books overzicht — loading skeleton.
 *
 * Gerendered tijdens de eerste server-render van `/books` en bij
 * hard-refresh/deeplink. Compacte book-grid: page-header + boek-tegels
 * (cover in 2:3 + titel/auteur/prijs).
 */

import { Skeleton } from '@/components/ui'

const SKELETON_CARDS = Array.from({ length: 12 }, (_, i) => i)

export default function BooksLoading() {
  return (
    <>
      <header className="ov-page-header">
        <Skeleton width="100px" height="14px" />
        <Skeleton variant="title" width="160px" />
      </header>

      <div className="ov-wrap-single" aria-busy="true" aria-live="polite">
        <div className="book-grid">
          {SKELETON_CARDS.map((i) => (
            <div key={i}>
              <div
                style={{
                  aspectRatio: '2 / 3',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                }}
              >
                <Skeleton width="100%" height="100%" />
              </div>
              <div style={{ marginTop: '12px' }}>
                <Skeleton variant="title" width="85%" />
                <Skeleton width="55%" />
                <div style={{ marginTop: '8px' }}>
                  <Skeleton width="35%" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
