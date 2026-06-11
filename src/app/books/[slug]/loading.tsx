/**
 * Book detail — loading skeleton.
 *
 * Gerendered tijdens de eerste server-render van `/books/[slug]`. Spiegelt de
 * detail-shell: back-row + wit vel (header, cover, tekst) + sidebar-card.
 */

import { Skeleton } from '@/components/ui'

export default function BookDetailLoading() {
  return (
    <article className="pub-wrap" aria-busy="true" aria-live="polite">
      <div className="pub-layout">
        <div className="detail-back-row">
          <Skeleton width="80px" height="14px" />
        </div>

        <div className="detail-sheet">
          <Skeleton width="60%" height="16px" />
          <Skeleton variant="title" width="80%" />
          <div style={{ marginTop: 18 }}>
            <Skeleton width="220px" height="300px" />
            <div style={{ marginTop: 20 }}>
              <Skeleton width="100%" />
              <Skeleton width="100%" />
              <Skeleton width="70%" />
            </div>
          </div>
        </div>

        <aside className="article-detail-sidebar">
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
            }}
          >
            <Skeleton width="40%" height="12px" />
            <Skeleton variant="title" width="55%" />
            <Skeleton width="100%" height="38px" />
          </div>
        </aside>
      </div>
    </article>
  )
}
