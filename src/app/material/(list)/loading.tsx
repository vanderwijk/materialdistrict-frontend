/**
 * Materials overzicht — loading skeleton.
 *
 * Sessie 4 batch 3.
 *
 * Wordt door Next.js gerendered tijdens de eerste server-render van
 * `/material` (RSC suspend). Bij client-side navigatie binnen de
 * materials-sectie blijft de Provider gemount, maar bij hard-refresh of
 * deeplink ziet de user dit eerst.
 *
 * Layout matched de echte page: breadcrumb-strookje + h1-skeleton +
 * sidebar-skeleton + 12 card-skeletons in de grid. Pagination-skeleton
 * weggelaten — die staat altijd onderaan en is niet kritisch voor de LCP.
 */

import { Skeleton } from '@/components/ui'

const SKELETON_CARDS = Array.from({ length: 12 }, (_, i) => i)

export default function MaterialsLoading() {
  return (
    <>
      <header className="ov-page-header">
        <Skeleton width="120px" height="14px" />
        <Skeleton variant="title" width="240px" />
      </header>

      <div className="ov-wrap" aria-busy="true" aria-live="polite">
        {/* FilterSidebar skeleton — schuif van 6 dummy-secties */}
        <aside className="filter-sidebar" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <Skeleton width="60%" height="16px" />
            </div>
          ))}
        </aside>

        <div>
          <div className="ov-grid-3">
            {SKELETON_CARDS.map((i) => (
              <div key={i} className="card">
                <Skeleton variant="thumb" />
                <div className="card-body">
                  <Skeleton width="30%" />
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
