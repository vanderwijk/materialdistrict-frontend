/**
 * Brand-detail — loading skeleton.
 *
 * Sessie 5. Matched de detail-shell: header (back + tag + h1 + meta) +
 * 2-koloms layout (gallery/materials links, sidebar rechts).
 */

import { Skeleton } from '@/components/ui'

export default function BrandDetailLoading() {
  return (
    <article className="pub-wrap" aria-busy="true" aria-live="polite">
      <div style={{ padding: '24px 0 8px' }}>
        <Skeleton width="80px" height="14px" />
      </div>

      <div style={{ marginBottom: 24 }}>
        <Skeleton width="90px" height="20px" />
        <Skeleton variant="title" width="320px" />
        <Skeleton width="240px" height="14px" />
      </div>

      <div className="pub-layout-inner">
        <div>
          <Skeleton width="100%" height="320px" />
          <div style={{ marginTop: 24 }}>
            <Skeleton width="90%" />
            <Skeleton width="80%" />
            <Skeleton width="60%" />
          </div>
        </div>

        <aside>
          <Skeleton width="100%" height="220px" />
          <div style={{ marginTop: 14 }}>
            <Skeleton width="100%" height="180px" />
          </div>
        </aside>
      </div>
    </article>
  )
}
