import { Skeleton } from '@/components/ui'

export default function BookDetailLoading() {
  return (
    <article className="pub-wrap" aria-busy="true" aria-live="polite">
      <Skeleton width="120px" height="14px" />
      <div className="mat-detail-wrap">
        <div className="detail-sheet">
          <Skeleton variant="title" width="55%" />
          <div className="mat-main">
            <div className="mat-gallery">
              <div className="mat-gallery-hero">
                <Skeleton variant="thumb" height="100%" />
              </div>
            </div>
            <Skeleton width="85%" />
            <Skeleton width="75%" />
            <Skeleton width="90%" />
          </div>
        </div>

        <aside className="mat-sidebar">
          <Skeleton variant="thumb" height="200px" />
        </aside>
      </div>
    </article>
  )
}
