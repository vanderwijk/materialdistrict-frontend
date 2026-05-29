/**
 * Event-detail — loading skeleton.
 *
 * Sessie 8. Matcht de detail-shell: header + media-viewer (main) + sidebar.
 */

import { Skeleton } from '@/components/ui'

export default function EventDetailLoading() {
  return (
    <article className="pub-wrap" aria-busy="true" aria-live="polite">
      <div className="detail-header">
        <div className="detail-header-inner">
          <Skeleton width="90px" height="14px" />
          <Skeleton variant="title" width="60%" />
          <Skeleton width="40%" height="14px" />
        </div>
      </div>

      <div className="pub-layout">
        <div>
          <Skeleton width="100%" height="360px" />
          <div style={{ marginTop: 16 }}>
            <Skeleton width="100%" />
            <Skeleton width="92%" />
            <Skeleton width="80%" />
          </div>
        </div>

        <aside className="event-aside">
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
            }}
          >
            <Skeleton width="50%" height="14px" />
            <Skeleton width="80%" />
            <Skeleton width="70%" />
          </div>
        </aside>
      </div>
    </article>
  )
}
