/**
 * Loading-skeleton voor de generieke contentpagina (`/[pageSlug]`).
 * Bewust licht: titel-balk + een paar tekstregels in dezelfde
 * single-column container als de echte pagina, zodat er geen
 * layout-shift optreedt bij hydration. Gebruikt het gedeelde
 * <Skeleton>-component (zoals de andere loading.tsx-bestanden).
 *
 * Sessie 11 (29-05-2026).
 */

import { Skeleton } from '@/components/ui'

export default function StaticContentPageLoading() {
  return (
    <main className="ov-wrap-single" aria-busy="true" aria-live="polite">
      <Skeleton variant="title" width="240px" />
      <Skeleton width="100%" />
      <Skeleton width="100%" />
      <Skeleton width="92%" />
      <Skeleton width="60%" />
    </main>
  )
}
