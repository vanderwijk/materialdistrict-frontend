/**
 * Article detail — loading skeleton.
 *
 * Sessie 6.
 *
 * Matcht de pub-layout van de echte detail-page: header + hero + lead +
 * body-regels in de hoofdkolom, en een sidebar met kaart-blokken.
 */

import { Skeleton } from '@/components/ui'

const BODY_LINES = Array.from({ length: 8 }, (_, i) => i)

export default function ArticleDetailLoading() {
  return (
    <article className="pub-wrap" aria-busy="true" aria-live="polite">
      <div style={{ padding: '24px 0' }}>
        <Skeleton width="80px" height="14px" />
        <Skeleton variant="title" width="60%" height="40px" />
        <Skeleton width="40%" height="14px" />
      </div>

      <div className="pub-layout">
        <div>
          <Skeleton width="100%" height="320px" />
          <div style={{ margin: '24px 0' }}>
            <Skeleton width="90%" height="20px" />
            <Skeleton width="80%" height="20px" />
          </div>
          {BODY_LINES.map((i) => (
            <Skeleton key={i} width={i % 3 === 2 ? '70%' : '100%'} />
          ))}
        </div>

        <aside>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <Skeleton width="50%" height="12px" />
              <Skeleton width="80%" />
              <Skeleton width="60%" />
            </div>
          ))}
        </aside>
      </div>
    </article>
  )
}
