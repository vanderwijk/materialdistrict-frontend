/**
 * Talk-detail — loading skeleton.
 *
 * Sessie 7. Matched de detail-shell: header-placeholder + 2-koloms
 * pub-layout met video-placeholder (16:9) links en sidebar-card rechts.
 */

import { Skeleton } from '@/components/ui'

export default function TalkDetailLoading() {
  return (
    <div className="pub-wrap" aria-busy="true" aria-live="polite">
      <div style={{ padding: '8px 0 16px' }}>
        <Skeleton width="80px" height="14px" />
        <Skeleton variant="title" width="60%" />
      </div>

      <div className="pub-layout">
        <div>
          <div
            style={{
              aspectRatio: '16 / 9',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              marginBottom: '28px',
            }}
          >
            <Skeleton width="100%" height="100%" />
          </div>
          <Skeleton width="40%" height="12px" />
          <Skeleton width="100%" />
          <Skeleton width="90%" />
          <Skeleton width="70%" />
        </div>

        <div>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
            }}
          >
            <Skeleton width="50%" height="12px" />
            <Skeleton width="100%" />
            <Skeleton width="100%" />
            <Skeleton width="80%" />
          </div>
        </div>
      </div>
    </div>
  )
}
